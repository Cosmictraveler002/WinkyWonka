import fs from 'node:fs';
import { ContactSheetManifest } from './types';

/**
 * Generates an SVG buffer containing the high-contrast metadata strip
 * formatted specifically for AI vision models:
 * "023  |  00:04.21  |  scene_03  |  shot_01"
 */
export function createMetadataStripSvg(
  frame: number,
  timestamp: string,
  sceneId: string,
  shotId: string,
  width = 400,
  height = 32
): Buffer {
  const framePadded = frame.toString().padStart(3, '0');
  const label = `${framePadded}  |  ${timestamp}  |  ${sceneId}  |  ${shotId}`;

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#0a0e17"/>
    <line x1="0" y1="0" x2="${width}" y2="0" stroke="#1e293b" stroke-width="1"/>
    <text
      x="${width / 2}"
      y="${height / 2 + 4.5}"
      font-family="Consolas, 'Courier New', Monaco, monospace"
      font-size="13"
      font-weight="600"
      fill="#f1f5f9"
      letter-spacing="0.5px"
      text-anchor="middle"
    >${label}</text>
  </svg>`;

  return Buffer.from(svg);
}

/**
 * Writes the machine-readable contact-sheet-manifest.json
 */
export function writeManifest(manifest: ContactSheetManifest, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
}
