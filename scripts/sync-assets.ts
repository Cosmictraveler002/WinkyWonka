import fs from 'node:fs';
import path from 'node:path';

const projectSlug = process.argv[2];

const rootDir = process.cwd();
const projectsDir = path.join(rootDir, 'projects');
const publicDir = path.join(rootDir, 'public', 'projects');

fs.mkdirSync(publicDir, { recursive: true });

function copyFolderRecursive(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const tgtPath = path.join(target, item);

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyFolderRecursive(srcPath, tgtPath);
    } else {
      fs.copyFileSync(srcPath, tgtPath);
    }
  }
}

const targets = projectSlug ? [projectSlug] : fs.readdirSync(projectsDir).filter(p => {
  return fs.statSync(path.join(projectsDir, p)).isDirectory();
});

for (const slug of targets) {
  const assetSource = path.join(projectsDir, slug, '04_Assets');
  const assetTarget = path.join(publicDir, slug);

  if (fs.existsSync(assetSource)) {
    console.log(`📦 Syncing assets: ${assetSource} -> ${assetTarget}`);
    copyFolderRecursive(assetSource, assetTarget);
  }
}

console.log('✅ Asset synchronization complete.');
