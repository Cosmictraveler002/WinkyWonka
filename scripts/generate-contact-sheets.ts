import { generateContactSheets } from '../src/analysis/contact-sheet';
import { AnalysisMode } from '../src/analysis/contact-sheet/types';

const projectSlug = process.argv[2] || 'demo-showcase';
const mode = (process.argv[3] || 'storyboard') as AnalysisMode;

if (!projectSlug) {
  console.error('Usage: bun scripts/generate-contact-sheets.ts <project-slug> [storyboard|motion]');
  process.exit(1);
}

async function main() {
  try {
    const result = await generateContactSheets({
      projectSlug,
      mode,
      maxFramesPerSheet: mode === 'motion' ? 16 : 12,
      columns: 4,
      thumbnailWidth: 400,
      thumbnailHeight: 225,
      metadataHeight: 32,
      motionIntervalFrames: 6,
    });

    console.log(`Contact sheet generation completed successfully!`);
  } catch (error: any) {
    console.error(`Error generating contact sheets:`, error.message);
    process.exit(1);
  }
}

main();
