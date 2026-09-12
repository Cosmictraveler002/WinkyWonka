import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  buildAssetRequirementsMap,
  saveAssetRequirements,
  loadAssetManifest,
  evaluateAssetReadiness,
  registerAsset,
  createGenerationSpec,
  validateImageAsset,
} from '../src/assets/index.js';
import type { AssetRequirement } from '../src/assets/types.js';

const command = process.argv[2];
const projectSlug = process.argv[3];

if (!command || !projectSlug) {
  console.log(`
Usage:
  bun scripts/asset-coordinator.ts map <project-slug>                        # Build internal asset requirements map
  bun scripts/asset-coordinator.ts next <project-slug>                       # Get next unresolved asset & user prompt
  bun scripts/asset-coordinator.ts spec <project-slug> <asset-id>            # Output generation specification
  bun scripts/asset-coordinator.ts register <project-slug> <asset-id> --provided <path>   # Validate & register user asset
  bun scripts/asset-coordinator.ts register <project-slug> <asset-id> --generated <path>  # Validate & register generated asset
  bun scripts/asset-coordinator.ts status <project-slug>                     # Print asset readiness report
  `);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);

if (!fs.existsSync(projectDir)) {
  console.error(`Error: Project "${projectSlug}" not found at ${projectDir}`);
  process.exit(1);
}

function getRequirements(): AssetRequirement[] {
  const reqPath = path.join(projectDir, '04_Assets', 'ASSET_REQUIREMENTS.yaml');
  if (fs.existsSync(reqPath)) {
    try {
      const data = YAML.parse(fs.readFileSync(reqPath, 'utf8'));
      return data.asset_requirements || [];
    } catch {}
  }
  // If not generated yet, build dynamically
  const mapResult = buildAssetRequirementsMap(projectDir);
  saveAssetRequirements(projectDir, mapResult);
  return mapResult.requirements;
}

if (command === 'map') {
  console.log(`\n========================================`);
  console.log(`📦 ASSET REQUIREMENTS MAPPER: "${projectSlug}"`);
  console.log(`========================================\n`);

  const result = buildAssetRequirementsMap(projectDir);
  const outPath = saveAssetRequirements(projectDir, result);

  console.log(`🎯 Procedural Remotion Components (No external media needed):`);
  for (const p of result.proceduralElements) {
    console.log(`  ✓ <${p} /> (Generated procedurally in code)`);
  }

  console.log(`\n📋 Required External Assets (${result.requirements.length} total, ${result.totalRequired} required):`);
  for (let i = 0; i < result.requirements.length; i++) {
    const r = result.requirements[i];
    const reqTag = r.required ? '[REQUIRED]' : '[OPTIONAL]';
    console.log(`  ${i + 1}. ${r.id} (${r.type}) ${reqTag} - Priority ${r.priority}`);
    console.log(`     ↳ "${r.name}" in scenes: [${r.targetScenes.join(', ')}]`);
  }

  console.log(`\n💾 Internal requirements saved to: ${outPath}\n`);
} else if (command === 'next') {
  const requirements = getRequirements();
  const readiness = evaluateAssetReadiness(projectDir, requirements);

  console.log(`\n========================================`);
  console.log(`🎯 ONE-BY-ONE ASSET ACQUISITION: "${projectSlug}"`);
  console.log(`========================================\n`);

  if (readiness.unresolved.length === 0) {
    console.log(`🎉 ALL REQUIRED ASSETS RESOLVED!`);
    console.log(`Total Acquired: ${readiness.acquired} (${readiness.generated} generated, ${readiness.userProvided} provided)`);
    console.log(`Next stage: ${readiness.nextStage}\n`);
    process.exit(0);
  }

  const nextReq = readiness.unresolved[0];
  const total = requirements.filter((r) => r.required).length;
  const currentIdx = total - readiness.unresolved.length + 1;

  console.log(`Asset ${String(currentIdx).padStart(2, '0')} of ${total} — ${nextReq.name}\n`);
  console.log(`Reference usage:`);
  console.log(`${nextReq.referenceContext.description}`);
  if (nextReq.referenceContext.timestampRange) {
    console.log(`Appears: ${nextReq.referenceContext.timestampRange}`);
  }
  console.log(`Role: ${nextReq.referenceContext.visualRole}`);
  console.log(`Target Scenes: [${nextReq.targetScenes.join(', ')}]\n`);

  console.log(`I need:`);
  if (nextReq.requirements.framing) console.log(`- framing: ${nextReq.requirements.framing}`);
  if (nextReq.requirements.transparency) console.log(`- transparent background (PNG or alpha mask)`);
  if (nextReq.requirements.minimumResolution) console.log(`- minimum resolution: ${nextReq.requirements.minimumResolution}`);
  if (nextReq.requirements.aspectRatio) console.log(`- aspect ratio: ${nextReq.requirements.aspectRatio}`);
  if (nextReq.requirements.materials) console.log(`- materials: ${nextReq.requirements.materials}`);
  if (nextReq.requirements.thingsToAvoid?.length) {
    console.log(`- avoid: ${nextReq.requirements.thingsToAvoid.join(', ')}`);
  }

  console.log(`\nChoose:`);
  console.log(`[Provide asset] -> Path to your local file`);
  console.log(`[Generate asset] -> Generate high-fidelity asset via generation spec\n`);
} else if (command === 'spec') {
  const assetId = process.argv[4];
  if (!assetId) {
    console.error('Error: Please specify <asset-id>');
    process.exit(1);
  }

  const requirements = getRequirements();
  const req = requirements.find((r) => r.id === assetId);
  if (!req) {
    console.error(`Error: Asset ID "${assetId}" not found in requirements`);
    process.exit(1);
  }

  const aestheticPath = path.join(projectDir, '03_Planner', 'core_aesthetic.yaml');
  const aesthetic = fs.existsSync(aestheticPath) ? YAML.parse(fs.readFileSync(aestheticPath, 'utf8')) : null;

  const spec = createGenerationSpec(req, aesthetic);
  console.log(JSON.stringify(spec, null, 2));
} else if (command === 'register') {
  const assetId = process.argv[4];
  const flag = process.argv[5];
  const filePath = process.argv[6];

  if (!assetId || !flag || !filePath) {
    console.error('Usage: bun scripts/asset-coordinator.ts register <project-slug> <asset-id> [--provided|--generated] <path>');
    process.exit(1);
  }

  const method = flag === '--provided' ? 'user_provided' : flag === '--generated' ? 'generated' : null;
  if (!method) {
    console.error('Error: Flag must be --provided or --generated');
    process.exit(1);
  }

  const requirements = getRequirements();
  const req = requirements.find((r) => r.id === assetId);
  if (!req) {
    console.error(`Error: Asset ID "${assetId}" not found in requirements`);
    process.exit(1);
  }

  console.log(`\n🔍 Validating asset "${assetId}" from path: ${filePath}...`);
  registerAsset(projectDir, req, filePath, method).then((res) => {
    if (!res.success) {
      console.error(`❌ Validation failed: ${res.error}`);
      process.exit(1);
    }

    console.log(`✅ Asset approved & registered!`);
    console.log(`   ID: ${res.entry?.id}`);
    console.log(`   Method: ${res.entry?.source.method}`);
    console.log(`   Path: ${res.entry?.source.path}`);
    console.log(`   Public: ${res.entry?.source.publicPath}`);
    console.log(`   Dimensions: ${res.entry?.validation.dimensions?.width}x${res.entry?.validation.dimensions?.height}px`);
    console.log(`💾 Manifest updated: projects/${projectSlug}/04_Assets/ASSET_MANIFEST.yaml`);
    console.log(`💾 Video spec updated: projects/${projectSlug}/VIDEO_SPEC.yaml\n`);
  });
} else if (command === 'status') {
  const requirements = getRequirements();
  const readiness = evaluateAssetReadiness(projectDir, requirements);

  console.log(`\n========================================`);
  console.log(`📊 ASSET READINESS REPORT: "${projectSlug}"`);
  console.log(`========================================\n`);

  console.log(`Status: ${readiness.status.toUpperCase()}`);
  console.log(`Total Required: ${readiness.totalRequired}`);
  console.log(`Acquired: ${readiness.acquired} (Generated: ${readiness.generated} | Provided: ${readiness.userProvided})`);
  console.log(`Unresolved: ${readiness.unresolved.length}\n`);

  if (readiness.assets.length > 0) {
    console.log(`Approved Assets:`);
    for (const a of readiness.assets) {
      console.log(`  ✓ ${a.id} ("${a.name}") [${a.method}] -> ${a.path}`);
    }
    console.log('');
  }

  if (readiness.unresolved.length > 0) {
    console.log(`Pending Assets to Acquire:`);
    for (const u of readiness.unresolved) {
      console.log(`  ⏳ [Priority ${u.priority}] ${u.id}: "${u.name}" (Scenes: ${u.targetScenes.join(', ')})`);
    }
    console.log('');
  }

  console.log(`Next Stage: ${readiness.nextStage}\n`);
} else {
  console.error(`Unknown command: "${command}".`);
  process.exit(1);
}
