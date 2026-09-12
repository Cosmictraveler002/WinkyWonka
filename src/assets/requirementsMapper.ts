import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { AssetRequirement, AssetType, AssetCategory } from './types.js';

interface RequirementsMapResult {
  project: string;
  totalRequired: number;
  requirements: AssetRequirement[];
  proceduralElements: string[];
}

/**
 * Procedural Remotion component names that do NOT require external media.
 */
const REMOTION_PROCEDURAL_COMPONENTS = new Set([
  'gradientbackground',
  'particlefield',
  'kinetictext',
  'headline',
  'caption',
  'wordreveal',
  'glasscard',
  'glowbadge',
  'cta',
  'button',
  'camerashake',
  'zoom',
  'noise',
  'filmgrain',
  'maskreveal',
  'logolockup', // unless an external logo asset is specified
]);

/**
 * Builds an internal asset requirements map from the project's analysis and planner specifications.
 */
export function buildAssetRequirementsMap(projectDir: string): RequirementsMapResult {
  const projectSlug = path.basename(projectDir);
  const plannerDir = path.join(projectDir, '03_Planner');
  const analyzerDir = path.join(projectDir, '02_Analyzer');
  const scenesDir = path.join(plannerDir, 'scenes');

  const timelinePath = path.join(plannerDir, 'timeline.yaml');
  const analysisPath = fs.existsSync(path.join(analyzerDir, 'refined_analysis.yaml'))
    ? path.join(analyzerDir, 'refined_analysis.yaml')
    : fs.existsSync(path.join(analyzerDir, 'video_analysis.yaml'))
    ? path.join(analyzerDir, 'video_analysis.yaml')
    : null;

  const timeline = fs.existsSync(timelinePath) ? YAML.parse(fs.readFileSync(timelinePath, 'utf8')) : null;
  const analysis = analysisPath ? YAML.parse(fs.readFileSync(analysisPath, 'utf8')) : null;

  const requirements: AssetRequirement[] = [];
  const proceduralElements: string[] = [];
  const seenAssetIds = new Set<string>();

  // Helper to add requirement with deduplication & scene accumulation
  function addRequirement(req: AssetRequirement) {
    if (seenAssetIds.has(req.id)) {
      const existing = requirements.find((r) => r.id === req.id);
      if (existing) {
        for (const sc of req.targetScenes) {
          if (!existing.targetScenes.includes(sc)) {
            existing.targetScenes.push(sc);
          }
        }
      }
      return;
    }
    seenAssetIds.add(req.id);
    requirements.push(req);
  }

  // 1. Direct Source of Truth: STORYBOARD_ASSET_REQUIREMENTS.yaml from Storyboard Director
  const storyboardReqsPath = path.join(plannerDir, 'STORYBOARD_ASSET_REQUIREMENTS.yaml');
  const storyboardPath = path.join(plannerDir, 'STORYBOARD.yaml');

  if (fs.existsSync(storyboardReqsPath)) {
    try {
      const sbData = YAML.parse(fs.readFileSync(storyboardReqsPath, 'utf8'));
      for (const raw of sbData.asset_requirements || []) {
        addRequirement({
          id: raw.id,
          name: raw.name || raw.id,
          type: (raw.type as AssetType) || 'product_image',
          category: 'source_media',
          priority: raw.priority || 2,
          required: raw.required ?? true,
          targetScenes: (raw.used_in_shots || []).map((s: string) => s.split('_')[0].toLowerCase().replace('s', 'scene_')),
          referenceContext: {
            description: raw.description || 'Asset identified from Storyboard Director shot plan',
            visualRole: raw.visual_role || 'Source visual media',
          },
          requirements: {
            transparency: true,
            minimumResolution: '1200px',
          },
        });
      }

      // Collect procedural components from STORYBOARD.yaml if available
      if (fs.existsSync(storyboardPath)) {
        const sb = YAML.parse(fs.readFileSync(storyboardPath, 'utf8'));
        for (const sc of sb.scenes || []) {
          for (const sh of sc.shots || []) {
            if (sh.visual?.description) {
              for (const comp of Array.from(REMOTION_PROCEDURAL_COMPONENTS)) {
                if (sh.visual.description.toLowerCase().includes(comp)) {
                  const title = comp.charAt(0).toUpperCase() + comp.slice(1);
                  if (!proceduralElements.includes(title)) proceduralElements.push(title);
                }
              }
            }
          }
        }
      }

      requirements.sort((a, b) => a.priority - b.priority);
      return {
        project: projectSlug,
        totalRequired: requirements.filter((r) => r.required).length,
        requirements,
        proceduralElements,
      };
    } catch {
      // Fall back to scene scanning if parse error
    }
  }

  // 2. Legacy Fallback: Scan Scene YAMLs in 03_Planner/scenes/
  if (fs.existsSync(scenesDir)) {
    const sceneFiles = fs.readdirSync(scenesDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const f of sceneFiles) {
      const sceneFilePath = path.join(scenesDir, f);
      const sceneData = YAML.parse(fs.readFileSync(sceneFilePath, 'utf8'));
      const sceneId = sceneData.scene_id || f.replace(/\.(yaml|yml)$/, '');

      for (const layer of sceneData.layers || []) {
        const comp = (layer.component || '').toLowerCase();
        const type = (layer.type || '').toLowerCase();

        if (REMOTION_PROCEDURAL_COMPONENTS.has(comp)) {
          if (!proceduralElements.includes(layer.component)) {
            proceduralElements.push(layer.component);
          }

          // Special case: LogoLockup with external logo image
          if (comp === 'logolockup' && layer.params?.logoImage) {
            addRequirement({
              id: 'asset_logo_01',
              name: 'Brand Logo Graphic',
              type: 'logo',
              category: 'source_media',
              priority: 1,
              required: true,
              targetScenes: [sceneId],
              referenceContext: {
                description: `Primary brand logo displayed in LogoLockup within ${sceneId}`,
                visualRole: 'Brand identity mark, centered vector or high-res transparent PNG',
              },
              requirements: {
                transparency: true,
                aspectRatio: '1:1',
                minimumResolution: '512px',
                thingsToAvoid: ['blurry edges', 'opaque background', 'jpeg compression artifacts'],
              },
            });
          }
          continue;
        }

        // Layer explicitly declares an external asset
        if (layer.assetId || layer.asset || layer.image || type === 'image' || type === 'product' || type === 'character') {
          const rawId = layer.assetId || `asset_${type || comp}_01`;
          const assetType: AssetType =
            type === 'product' ? 'product_image' :
            type === 'character' ? 'character' :
            type === 'logo' ? 'logo' :
            type === 'illustration' ? 'illustration' : 'product_image';

          addRequirement({
            id: rawId,
            name: layer.params?.title || `${rawId} (${assetType})`,
            type: assetType,
            category: 'source_media',
            priority: 2,
            required: true,
            targetScenes: [sceneId],
            referenceContext: {
              description: `Visual subject featured in ${sceneId} (${layer.component || type})`,
              visualRole: 'Primary scene subject requiring isolated product/character image',
            },
            requirements: {
              transparency: true,
              minimumResolution: '1024px',
            },
          });
        }
      }
    }
  }

  // 2. Scan Analysis if available
  if (analysis?.required_assets) {
    for (const raw of analysis.required_assets) {
      addRequirement({
        id: raw.id || `asset_${raw.type || 'media'}_${requirements.length + 1}`,
        name: raw.name || raw.id,
        type: (raw.type as AssetType) || 'product_image',
        category: 'source_media',
        priority: raw.priority || 3,
        required: raw.required ?? true,
        targetScenes: raw.scenes || ['scene_01'],
        referenceContext: {
          description: raw.description || 'Asset identified from reference video analysis',
          visualRole: raw.visual_role || 'Visual media subject',
        },
        requirements: raw.requirements || {
          transparency: true,
          minimumResolution: '1024px',
        },
      });
    }
  }

  // 3. Fallback: If no explicit assets were declared, extract from timeline scenes
  if (requirements.length === 0 && timeline?.scenes) {
    // Check if any scene represents a product or brand showcase
    for (let i = 0; i < timeline.scenes.length; i++) {
      const sc = timeline.scenes[i];
      const titleLower = (sc.title || '').toLowerCase();

      if (titleLower.includes('product') || titleLower.includes('hero') || titleLower.includes('showcase')) {
        addRequirement({
          id: `asset_product_01`,
          name: 'Hero Showcase Subject',
          type: 'product_image',
          category: 'source_media',
          priority: 2,
          required: false,
          targetScenes: [sc.id || `scene_${String(i + 1).padStart(2, '0')}`],
          referenceContext: {
            description: `Visual showcase subject in ${sc.title}`,
            visualRole: 'Hero subject for feature highlight',
          },
          requirements: {
            transparency: true,
            minimumResolution: '1200px',
          },
        });
      }
    }
  }

  // Sort by priority ascending (1 = highest priority first)
  requirements.sort((a, b) => a.priority - b.priority);

  return {
    project: projectSlug,
    totalRequired: requirements.filter((r) => r.required).length,
    requirements,
    proceduralElements,
  };
}

/**
 * Saves the requirements map to 04_Assets/ASSET_REQUIREMENTS.yaml
 */
export function saveAssetRequirements(projectDir: string, mapResult: RequirementsMapResult): string {
  const assetsDir = path.join(projectDir, '04_Assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const outPath = path.join(assetsDir, 'ASSET_REQUIREMENTS.yaml');
  const yamlData = {
    project: mapResult.project,
    total_required: mapResult.totalRequired,
    procedural_remotion_elements: mapResult.proceduralElements,
    asset_requirements: mapResult.requirements,
  };

  fs.writeFileSync(outPath, YAML.stringify(yamlData, { indent: 2 }));
  return outPath;
}
