import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { AssetValidationResult, VisualRequirements } from './types.js';

/**
 * Validates a candidate image asset against technical visual requirements.
 */
export async function validateImageAsset(
  filePath: string,
  requirements?: VisualRequirements
): Promise<AssetValidationResult> {
  const issues: string[] = [];
  const notes: string[] = [];

  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      issues: [`File not found at path: ${filePath}`],
      notes: [],
    };
  }

  const ext = path.extname(filePath).toLowerCase();
  const isSvg = ext === '.svg';

  if (isSvg) {
    // Basic SVG validation
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('<svg')) {
      issues.push('Invalid SVG: Missing <svg> root element');
    } else {
      notes.push('SVG vector format verified');
    }

    return {
      valid: issues.length === 0,
      format: 'svg',
      hasAlpha: true,
      issues,
      notes,
    };
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const format = metadata.format || ext.replace('.', '');
    const hasAlpha = metadata.hasAlpha || metadata.channels === 4;
    const aspectRatio = width > 0 && height > 0 ? parseFloat((width / height).toFixed(2)) : 0;

    // 1. Check minimum resolution
    if (requirements?.minimumResolution) {
      const minMatch = requirements.minimumResolution.match(/(\d+)/);
      if (minMatch) {
        const minVal = parseInt(minMatch[1], 10);
        if (width < minVal && height < minVal) {
          issues.push(
            `Resolution ${width}x${height}px is below minimum required (${requirements.minimumResolution})`
          );
        } else {
          notes.push(`Resolution ${width}x${height}px meets requirement (>= ${minVal}px)`);
        }
      }
    }

    // 2. Check transparency requirement
    if (requirements?.transparency === true) {
      if (!hasAlpha) {
        issues.push(
          'Asset requires transparent background (alpha channel), but image has no alpha channel or is opaque.'
        );
      } else {
        notes.push('Alpha channel transparency verified');
      }
    }

    // 3. Check aspect ratio if specified
    if (requirements?.aspectRatio) {
      const [rw, rh] = requirements.aspectRatio.split(':').map(Number);
      if (rw && rh) {
        const targetRatio = rw / rh;
        const diff = Math.abs(aspectRatio - targetRatio);
        if (diff > 0.15) {
          issues.push(
            `Aspect ratio (${aspectRatio}) deviates from required ${requirements.aspectRatio} (~${targetRatio.toFixed(2)})`
          );
        } else {
          notes.push(`Aspect ratio matches required ${requirements.aspectRatio}`);
        }
      }
    }

    // 4. File format verification
    const validFormats = ['png', 'jpeg', 'jpg', 'webp', 'avif', 'svg'];
    if (!validFormats.includes(format)) {
      issues.push(`Unsupported image format: "${format}". Supported formats: ${validFormats.join(', ')}`);
    }

    const valid = issues.length === 0;

    return {
      valid,
      width,
      height,
      format,
      hasAlpha,
      aspectRatio,
      issues,
      notes,
    };
  } catch (err: any) {
    return {
      valid: false,
      issues: [`Image parsing failed: ${err.message || String(err)}`],
      notes: [],
    };
  }
}
