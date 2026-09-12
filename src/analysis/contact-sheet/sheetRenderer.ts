import path from 'node:path';
import sharp, { OverlayOptions } from 'sharp';
import { createMetadataStripSvg } from './metadata';
import { FrameMetadata, GeneratedSheet, SheetDimensions, SheetFrame } from './types';

export interface RenderSheetsOptions {
  frames: FrameMetadata[];
  outputDir: string;
  maxFramesPerSheet?: number;
  columns?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  metadataHeight?: number;
  format?: 'jpeg' | 'png';
  quality?: number;
}

export async function renderContactSheets({
  frames,
  outputDir,
  maxFramesPerSheet = 16,
  columns = 4,
  thumbnailWidth = 400,
  thumbnailHeight = 225,
  metadataHeight = 32,
  format = 'jpeg',
  quality = 88,
}: RenderSheetsOptions): Promise<{ sheets: GeneratedSheet[]; dimensions: SheetDimensions }> {
  const cellWidth = thumbnailWidth;
  const cellHeight = thumbnailHeight + metadataHeight;

  // Split frames into chunks respecting maxFramesPerSheet
  const chunks: FrameMetadata[][] = [];
  for (let i = 0; i < frames.length; i += maxFramesPerSheet) {
    chunks.push(frames.slice(i, i + maxFramesPerSheet));
  }

  const generatedSheets: GeneratedSheet[] = [];

  for (let sheetIdx = 0; sheetIdx < chunks.length; sheetIdx++) {
    const chunk = chunks[sheetIdx];
    const rows = Math.ceil(chunk.length / columns);
    const sheetWidth = columns * cellWidth;
    const sheetHeight = rows * cellHeight;

    const compositeEntries: OverlayOptions[] = [];
    const sheetFrames: SheetFrame[] = [];

    for (let i = 0; i < chunk.length; i++) {
      const meta = chunk[i];
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = col * cellWidth;
      const y = row * cellHeight;

      sheetFrames.push({
        frame: meta.frame,
        time: meta.time,
        timestamp: meta.timestamp,
        scene: meta.sceneId,
        shot: meta.shotId,
        row,
        column: col,
      });

      if (meta.filePath) {
        // 1. Resize thumbnail preserving aspect ratio
        const resizedThumbBuffer = await sharp(meta.filePath)
          .resize(thumbnailWidth, thumbnailHeight, {
            fit: 'contain',
            background: { r: 10, g: 14, b: 23, alpha: 1 },
          })
          .toBuffer();

        compositeEntries.push({
          input: resizedThumbBuffer,
          top: y,
          left: x,
        });

        // 2. Add metadata strip directly below the thumbnail
        const metaSvg = createMetadataStripSvg(
          meta.frame,
          meta.timestamp,
          meta.sceneId,
          meta.shotId,
          thumbnailWidth,
          metadataHeight
        );

        compositeEntries.push({
          input: metaSvg,
          top: y + thumbnailHeight,
          left: x,
        });
      }
    }

    const filename = `contact_${String(sheetIdx + 1).padStart(3, '0')}.${format === 'png' ? 'png' : 'jpg'}`;
    const filePath = path.join(outputDir, filename);

    // Create blank background canvas
    const baseCanvas = sharp({
      create: {
        width: sheetWidth,
        height: sheetHeight,
        channels: 3,
        background: { r: 10, g: 14, b: 23 },
      },
    });

    let pipeline = baseCanvas.composite(compositeEntries);

    if (format === 'png') {
      pipeline = pipeline.png();
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    await pipeline.toFile(filePath);

    generatedSheets.push({
      file: filename,
      filePath,
      sheetIndex: sheetIdx + 1,
      width: sheetWidth,
      height: sheetHeight,
      frames: sheetFrames,
    });
  }

  const dimensions: SheetDimensions = {
    thumbnailWidth,
    thumbnailHeight,
    metadataHeight,
    totalWidth: columns * cellWidth,
    totalHeight: Math.ceil(maxFramesPerSheet / columns) * cellHeight,
    columns,
    rows: Math.ceil(maxFramesPerSheet / columns),
  };

  return { sheets: generatedSheets, dimensions };
}
