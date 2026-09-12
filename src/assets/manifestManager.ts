import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { validateImageAsset } from './assetValidator.js';
import type {
  AssetManifest,
  AssetManifestEntry,
  AssetRequirement,
  AssetReadinessReport,
  GenerationSpec,
  VideoSpec,
  AcquisitionMethod,
} from './types.js';

/**
 * Loads or initializes ASSET_MANIFEST.yaml
 */
export function loadAssetManifest(projectDir: string): AssetManifest {
  const projectSlug = path.basename(projectDir);
  const manifestPath = path.join(projectDir, '04_Assets', 'ASSET_MANIFEST.yaml');

  if (fs.existsSync(manifestPath)) {
    try {
      return YAML.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      // return default on parse error
    }
  }

  return {
    project: projectSlug,
    updatedAt: new Date().toISOString(),
    totalAssets: 0,
    assets: [],
  };
}

/**
 * Saves ASSET_MANIFEST.yaml
 */
export function saveAssetManifest(projectDir: string, manifest: AssetManifest): string {
  const assetsDir = path.join(projectDir, '04_Assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  manifest.updatedAt = new Date().toISOString();
  manifest.totalAssets = manifest.assets.length;

  const outPath = path.join(assetsDir, 'ASSET_MANIFEST.yaml');
  fs.writeFileSync(outPath, YAML.stringify(manifest, { indent: 2 }));
  return outPath;
}

/**
 * Loads or initializes VIDEO_SPEC.yaml
 */
export function loadVideoSpec(projectDir: string): VideoSpec {
  const projectSlug = path.basename(projectDir);
  const specPath = path.join(projectDir, 'VIDEO_SPEC.yaml');

  if (fs.existsSync(specPath)) {
    try {
      return YAML.parse(fs.readFileSync(specPath, 'utf8'));
    } catch {
      // fallback
    }
  }

  // Seed from timeline.yaml if available
  const timelinePath = path.join(projectDir, '03_Planner', 'timeline.yaml');
  let timeline: any = null;
  if (fs.existsSync(timelinePath)) {
    try {
      timeline = YAML.parse(fs.readFileSync(timelinePath, 'utf8'));
    } catch {}
  }

  const scenes = (timeline?.scenes || []).map((sc: any) => ({
    id: sc.id || 'scene_01',
    title: sc.title || 'Scene',
    duration_in_frames: sc.duration_in_frames || 90,
    duration_in_seconds: sc.duration_in_seconds || 3.0,
    transition_to_next: sc.transition_to_next,
    transition_duration: sc.transition_duration,
    required_assets: [],
  }));

  return {
    project: projectSlug,
    fps: timeline?.fps || 30,
    width: timeline?.width || 1920,
    height: timeline?.height || 1080,
    totalDurationFrames: scenes.reduce((acc: number, s: any) => acc + s.duration_in_frames, 0),
    totalDurationSeconds: scenes.reduce((acc: number, s: any) => acc + s.duration_in_seconds, 0),
    rhythm_template: timeline?.rhythm_template,
    scenes,
    assetBindings: {},
  };
}

/**
 * Saves VIDEO_SPEC.yaml
 */
export function saveVideoSpec(projectDir: string, spec: VideoSpec): string {
  const outPath = path.join(projectDir, 'VIDEO_SPEC.yaml');
  fs.writeFileSync(outPath, YAML.stringify(spec, { indent: 2 }));
  return outPath;
}

/**
 * Registers an acquired asset (user-provided or generated) into the manifest and public mirror.
 */
export async function registerAsset(
  projectDir: string,
  requirement: AssetRequirement,
  sourceFilePath: string,
  method: AcquisitionMethod,
  notes?: string[]
): Promise<{ success: boolean; entry?: AssetManifestEntry; error?: string }> {
  const rootDir = process.cwd();
  const projectSlug = path.basename(projectDir);

  if (!fs.existsSync(sourceFilePath)) {
    return { success: false, error: `Source file does not exist: ${sourceFilePath}` };
  }

  // 1. Validate image properties
  const validation = await validateImageAsset(sourceFilePath, requirement.requirements);
  if (!validation.valid) {
    return {
      success: false,
      error: `Asset validation failed: ${validation.issues.join('; ')}`,
    };
  }

  const ext = path.extname(sourceFilePath).toLowerCase() || '.png';
  const targetScene = requirement.targetScenes[0] || 'scene_01';
  const targetSceneDir = path.join(projectDir, '04_Assets', targetScene);
  if (!fs.existsSync(targetSceneDir)) {
    fs.mkdirSync(targetSceneDir, { recursive: true });
  }

  // Canonical workspace file path
  const canonicalFileName = `${requirement.id}${ext}`;
  const canonicalFilePath = path.join(targetSceneDir, canonicalFileName);

  // Copy to 04_Assets/
  fs.copyFileSync(sourceFilePath, canonicalFilePath);

  // Copy to public/projects/<slug>/
  const publicDir = path.join(rootDir, 'public', 'projects', projectSlug);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicFilePath = path.join(publicDir, canonicalFileName);
  fs.copyFileSync(canonicalFilePath, publicFilePath);

  const relativePath = path.relative(rootDir, canonicalFilePath).replace(/\\/g, '/');
  const publicPath = `projects/${projectSlug}/${canonicalFileName}`;

  // 2. Update Manifest
  const manifest = loadAssetManifest(projectDir);
  const entry: AssetManifestEntry = {
    id: requirement.id,
    name: requirement.name,
    type: requirement.type,
    source: {
      method,
      path: relativePath,
      publicPath,
      originalFileName: path.basename(sourceFilePath),
    },
    status: 'approved',
    used_in: requirement.targetScenes,
    requirements: requirement.requirements,
    validation: {
      passed: true,
      dimensions: validation.width && validation.height ? { width: validation.width, height: validation.height } : undefined,
      transparency_verified: validation.hasAlpha,
      issues: validation.issues,
    },
    notes: notes || validation.notes,
  };

  // Replace existing entry if re-registering
  const existingIdx = manifest.assets.findIndex((a) => a.id === requirement.id);
  if (existingIdx >= 0) {
    manifest.assets[existingIdx] = entry;
  } else {
    manifest.assets.push(entry);
  }
  saveAssetManifest(projectDir, manifest);

  // 3. Update VideoSpec assetBindings
  const spec = loadVideoSpec(projectDir);
  spec.assetBindings[requirement.id] = publicPath;

  for (const sc of spec.scenes) {
    if (requirement.targetScenes.includes(sc.id) && !sc.required_assets.includes(requirement.id)) {
      sc.required_assets.push(requirement.id);
    }
  }
  saveVideoSpec(projectDir, spec);

  return { success: true, entry };
}

/**
 * Checks readiness status of required assets against the manifest.
 */
export function evaluateAssetReadiness(
  projectDir: string,
  requirements: AssetRequirement[]
): AssetReadinessReport {
  const manifest = loadAssetManifest(projectDir);
  const registeredMap = new Map(manifest.assets.map((a) => [a.id, a]));

  const acquired = manifest.assets.filter((a) => a.status === 'approved').length;
  const generated = manifest.assets.filter((a) => a.source?.method === 'generated').length;
  const userProvided = manifest.assets.filter((a) => a.source?.method === 'user_provided').length;

  const unresolved = requirements.filter((r) => r.required && !registeredMap.has(r.id));
  const status = unresolved.length === 0 ? 'ready' : 'pending_assets';

  return {
    status,
    totalRequired: requirements.filter((r) => r.required).length,
    acquired,
    generated,
    userProvided,
    unresolved,
    assets: manifest.assets.map((a) => ({
      id: a.id,
      name: a.name,
      status: a.status,
      method: a.source?.method,
      path: a.source?.publicPath,
    })),
    nextStage: status === 'ready' ? 'Phase 5: Declarative Remotion Scene Construction' : 'Asset Acquisition Loop',
  };
}

/**
 * Creates a structured generation specification for an asset.
 */
export function createGenerationSpec(
  requirement: AssetRequirement,
  aestheticContext?: any
): GenerationSpec {
  const reqs = requirement.requirements;
  const colors = aestheticContext?.aesthetic?.colors || {};

  return {
    assetId: requirement.id,
    subject: requirement.name,
    composition: reqs.framing || 'Centered isolated hero composition',
    framing: reqs.framing || 'Studio medium close-up, isolated subject',
    camera: reqs.camera || 'Eye-level studio camera, sharp focal plane, crisp edges',
    lighting: reqs.lighting || 'Balanced commercial softbox studio lighting, clean specular highlights',
    perspective: 'Frontal three-quarters view',
    style: reqs.style || 'High-end commercial product photography, photorealistic, clean authored aesthetic',
    color: colors.accent ? `Accentuated with subtle ${colors.accent} tones` : 'Natural, balanced studio color grading',
    materials: reqs.materials || 'Premium matte/gloss combination, authentic physical texture',
    background: reqs.transparency ? 'Pure solid black or isolated clean background for seamless alpha mask extraction' : 'Minimalist dark studio gradient',
    aspectRatio: reqs.aspectRatio || '1:1',
    transparency: reqs.transparency ?? true,
    resolution: reqs.minimumResolution || '2048x2048',
    visualConstraints: [
      'No watermarks or embedded branding logos unless specified',
      'No motion blur or optical lens distortions',
      'High edge contrast suitable for clean matting and scale animations',
    ],
    referenceRelationship: requirement.referenceContext.description,
    thingsToAvoid: [
      'generic AI glow or floating particles',
      'distorted proportions or asymmetric artifacts',
      'muddy shadows or washed-out midtones',
      ...(reqs.thingsToAvoid || []),
    ],
    promptRecommendation: `Commercial studio photograph of ${requirement.name}, ${reqs.framing || 'front-facing isolated subject'}, premium materials, crisp studio lighting, sharp 8k focus, clean silhouette, no text, no watermark`,
  };
}
