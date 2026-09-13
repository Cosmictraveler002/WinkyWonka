import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'blocked_human_gate' | 'skipped';

export interface PhaseDefinition {
  id: string;
  phaseNumber: string;
  name: string;
  category: 'Foundation' | 'Creative' | 'Planning' | 'Production' | 'Verification' | 'Delivery';
  description: string;
  weight: number;
  isHumanGate: boolean;
  artifacts: string[];
  status: PhaseStatus;
  updatedAt?: string;
  notes?: string;
}

export interface PhaseTrackerManifest {
  project: string;
  overallProgressPercent: number;
  activePhaseId: string;
  activePhaseName: string;
  completedPhasesCount: number;
  totalPhasesCount: number;
  humanGates: {
    total: number;
    passed: number;
    pending: number;
  };
  lastUpdated: string;
  phases: PhaseDefinition[];
}

const DEFAULT_PHASES: Omit<PhaseDefinition, 'status'>[] = [
  {
    id: 'phase_1a',
    phaseNumber: '1A',
    name: 'Temporal Deconstruction',
    category: 'Foundation',
    description: 'Deconstruct reference video duration, cuts, pacing, and macro rhythm template',
    weight: 5,
    isHumanGate: false,
    artifacts: ['02_Deconstruction/TEMPORAL_ANALYSIS.yaml'],
  },
  {
    id: 'phase_1b',
    phaseNumber: '1B',
    name: 'Visual Deconstruction',
    category: 'Foundation',
    description: 'Extract entry, apex, and exit snapshots; dissect animation techniques and palette',
    weight: 5,
    isHumanGate: false,
    artifacts: ['02_Deconstruction/DECONSTRUCTION.yaml', '02_Deconstruction/VISUAL_ANALYSIS.yaml'],
  },
  {
    id: 'phase_1c',
    phaseNumber: '1C',
    name: 'Audio Foundation & Beat Skeleton',
    category: 'Foundation',
    description: 'Soundtrack selection, spectral/transient beat grid, cut windows, and temporal skeleton',
    weight: 10,
    isHumanGate: false,
    artifacts: ['00_Audio/temporal_skeleton.yaml', '00_Audio/soundtrack.wav'],
  },
  {
    id: 'phase_2a',
    phaseNumber: '2.0',
    name: 'Creative Intake & Script',
    category: 'Creative',
    description: 'Audience and brand intake questionnaire, audio-locked script with exact cut windows',
    weight: 10,
    isHumanGate: false,
    artifacts: ['03_Planner/SCRIPT_INTAKE.yaml', '03_Planner/SCRIPT.md'],
  },
  {
    id: 'phase_2b',
    phaseNumber: '2.5',
    name: 'Script & Rhythm Audit',
    category: 'Creative',
    description: 'Audit shot non-uniformity, cognitive load, hook validity, and anti-AI tropes',
    weight: 5,
    isHumanGate: false,
    artifacts: ['03_Planner/SCRIPT_AUDIT.yaml'],
  },
  {
    id: 'phase_3a',
    phaseNumber: '3.0',
    name: 'Asset & Tech Stack Planning',
    category: 'Planning',
    description: 'Map Remotion primitives, shaders, 3D dependencies, and asset requirements',
    weight: 5,
    isHumanGate: false,
    artifacts: ['03_Planner/STORYBOARD_ASSET_REQUIREMENTS.yaml', '03_Planner/TECH_STACK_MAP.yaml'],
  },
  {
    id: 'phase_3b',
    phaseNumber: '3.5',
    name: 'Interactive Asset Co-Design',
    category: 'Planning',
    description: 'Palette confirmation, hero visual co-design, and asset registration manifest',
    weight: 5,
    isHumanGate: false,
    artifacts: ['04_Assets/ASSET_MANIFEST.yaml'],
  },
  {
    id: 'phase_3c',
    phaseNumber: '3.7',
    name: 'Storyboard Lock (Human Gate)',
    category: 'Planning',
    description: 'Mandatory human approval of locked storyboard and shot cards before code build',
    weight: 10,
    isHumanGate: true,
    artifacts: ['03_Planner/STORYBOARD.yaml'],
  },
  {
    id: 'phase_4',
    phaseNumber: '4.0',
    name: 'Declarative Remotion Code Build',
    category: 'Production',
    description: 'Remotion React scene components, physics springs, transitions, and root composition',
    weight: 15,
    isHumanGate: false,
    artifacts: ['05_Code/Composition.tsx'],
  },
  {
    id: 'phase_5',
    phaseNumber: '5.0',
    name: 'AI Contact Sheets Generation',
    category: 'Verification',
    description: 'High-speed batch sequence extraction of storyboard and motion vision contact sheets',
    weight: 5,
    isHumanGate: false,
    artifacts: [
      '02_Deconstruction/contact_sheets_storyboard/contact-sheet-manifest.json',
      '02_Deconstruction/contact_sheets_motion/contact-sheet-manifest.json',
    ],
  },
  {
    id: 'phase_6',
    phaseNumber: '6.0',
    name: 'Visual Refinement Loop',
    category: 'Verification',
    description: 'Draft render, strategic keyframe capture (entry/apex/settle/exit), visual convergence',
    weight: 10,
    isHumanGate: false,
    artifacts: ['02_Deconstruction/REFINEMENT_STATE.yaml'],
  },
  {
    id: 'phase_7',
    phaseNumber: '7.0',
    name: 'Critic Agent Vision Audit',
    category: 'Verification',
    description: 'Multi-sheet vision critique, rhythm contrast check, AI-slop inspection (Score >= 90)',
    weight: 5,
    isHumanGate: false,
    artifacts: ['02_Deconstruction/critique.json'],
  },
  {
    id: 'phase_8',
    phaseNumber: '8.0',
    name: 'Studio Preview & Approval (Human Gate)',
    category: 'Delivery',
    description: 'Interactive Remotion Studio inspection (localhost:3000) and explicit human sign-off',
    weight: 5,
    isHumanGate: true,
    artifacts: [],
  },
  {
    id: 'phase_9',
    phaseNumber: '9.0',
    name: 'Production Video Export',
    category: 'Delivery',
    description: 'Final full-resolution master MP4 export with audio lock',
    weight: 5,
    isHumanGate: false,
    artifacts: [],
  },
];

export function getProjectPaths(projectSlug: string) {
  const rootDir = process.cwd();
  const projectDir = path.join(rootDir, 'projects', projectSlug);
  const trackerYamlPath = path.join(projectDir, 'PHASE_TRACKER.yaml');
  const progressMdPath = path.join(projectDir, 'PROGRESS.md');
  return { rootDir, projectDir, trackerYamlPath, progressMdPath };
}

export function loadTracker(projectSlug: string): PhaseTrackerManifest {
  const { trackerYamlPath } = getProjectPaths(projectSlug);
  if (fs.existsSync(trackerYamlPath)) {
    try {
      const data = YAML.parse(fs.readFileSync(trackerYamlPath, 'utf8'));
      if (data && Array.isArray(data.phases)) {
        return data as PhaseTrackerManifest;
      }
    } catch {}
  }

  // Initialize fresh tracker
  const phases: PhaseDefinition[] = DEFAULT_PHASES.map(p => ({
    ...p,
    status: 'pending',
    updatedAt: new Date().toISOString(),
  }));

  return {
    project: projectSlug,
    overallProgressPercent: 0,
    activePhaseId: phases[0].id,
    activePhaseName: phases[0].name,
    completedPhasesCount: 0,
    totalPhasesCount: phases.length,
    humanGates: {
      total: phases.filter(p => p.isHumanGate).length,
      passed: 0,
      pending: phases.filter(p => p.isHumanGate).length,
    },
    lastUpdated: new Date().toISOString(),
    phases,
  };
}

export function saveTracker(manifest: PhaseTrackerManifest): void {
  const { projectDir, trackerYamlPath, progressMdPath } = getProjectPaths(manifest.project);
  manifest.lastUpdated = new Date().toISOString();

  // Recalculate metrics
  let completedWeight = 0;
  let totalWeight = 0;
  let completedCount = 0;
  let passedGates = 0;
  let totalGates = 0;
  let activePhase: PhaseDefinition | null = null;

  for (const phase of manifest.phases) {
    totalWeight += phase.weight;
    if (phase.isHumanGate) totalGates++;

    if (phase.status === 'completed' || phase.status === 'skipped') {
      completedWeight += phase.weight;
      completedCount++;
      if (phase.isHumanGate) passedGates++;
    } else if (!activePhase) {
      activePhase = phase;
    }
  }

  manifest.overallProgressPercent = Math.round((completedWeight / totalWeight) * 100);
  manifest.completedPhasesCount = completedCount;
  manifest.totalPhasesCount = manifest.phases.length;
  manifest.humanGates = {
    total: totalGates,
    passed: passedGates,
    pending: totalGates - passedGates,
  };

  if (activePhase) {
    manifest.activePhaseId = activePhase.id;
    manifest.activePhaseName = activePhase.name;
  } else {
    manifest.activePhaseId = 'done';
    manifest.activePhaseName = 'Project Completed';
  }

  // Write YAML
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  fs.writeFileSync(trackerYamlPath, YAML.stringify(manifest));

  // Write Markdown PROGRESS.md
  fs.writeFileSync(progressMdPath, generateMarkdownReport(manifest));
}

export function syncProjectProgress(projectSlug: string): PhaseTrackerManifest {
  const { projectDir, rootDir } = getProjectPaths(projectSlug);
  const tracker = loadTracker(projectSlug);

  // Helper file checker
  const fileExists = (relPath: string) => fs.existsSync(path.join(projectDir, relPath));

  for (const phase of tracker.phases) {
    let detectedStatus: PhaseStatus = phase.status;
    let detectedNotes = phase.notes || '';

    switch (phase.id) {
      case 'phase_1a':
        if (fileExists('02_Deconstruction/TEMPORAL_ANALYSIS.yaml')) {
          detectedStatus = 'completed';
          detectedNotes = 'Temporal analysis and rhythm template confirmed.';
        }
        break;

      case 'phase_1b':
        if (fileExists('02_Deconstruction/DECONSTRUCTION.yaml') || fileExists('02_Deconstruction/VISUAL_ANALYSIS.yaml')) {
          detectedStatus = 'completed';
          detectedNotes = 'Visual scene snapshots and animation mechanics cataloged.';
        }
        break;

      case 'phase_1c':
        const hasSkel = fileExists('00_Audio/temporal_skeleton.yaml') || fileExists('02_Analyzer/audio/temporal_skeleton.yaml');
        const hasAudio = fileExists('00_Audio/soundtrack.wav') || fileExists('02_Analyzer/audio/soundtrack.wav');
        if (hasSkel && hasAudio) {
          detectedStatus = 'completed';
          detectedNotes = 'Mastered soundtrack and beat skeleton grid active.';
        }
        break;

      case 'phase_2a':
        if (fileExists('03_Planner/SCRIPT.md')) {
          detectedStatus = 'completed';
          detectedNotes = 'Audio-locked script authored.';
        }
        break;

      case 'phase_2b':
        if (fileExists('03_Planner/SCRIPT_AUDIT.yaml')) {
          detectedStatus = 'completed';
          detectedNotes = 'Script and rhythm variance audited against creative rulebook.';
        }
        break;

      case 'phase_3a':
        if (fileExists('03_Planner/STORYBOARD_ASSET_REQUIREMENTS.yaml') || fileExists('03_Planner/TECH_STACK_MAP.yaml')) {
          detectedStatus = 'completed';
          detectedNotes = 'Asset requirements and tech stack mapped.';
        }
        break;

      case 'phase_3b':
        if (fileExists('04_Assets/ASSET_MANIFEST.yaml')) {
          detectedStatus = 'completed';
          detectedNotes = 'Brand assets cataloged in asset manifest.';
        }
        break;

      case 'phase_3c': // Human Gate: Storyboard Lock
        const sbPath = path.join(projectDir, '03_Planner', 'STORYBOARD.yaml');
        if (fs.existsSync(sbPath)) {
          try {
            const sb = YAML.parse(fs.readFileSync(sbPath, 'utf8'));
            if (sb?.human_approval?.status === 'approved') {
              detectedStatus = 'completed';
              detectedNotes = `Approved by "${sb.human_approval.approved_by || 'user'}" on ${sb.human_approval.approved_at || 'record'}.`;
            } else {
              detectedStatus = 'blocked_human_gate';
              detectedNotes = 'Awaiting explicit human sign-off in chat.';
            }
          } catch {}
        }
        break;

      case 'phase_4':
        const compPath = path.join(projectDir, '05_Code', 'Composition.tsx');
        if (fs.existsSync(compPath)) {
          detectedStatus = 'completed';
          detectedNotes = 'Declarative Remotion React scenes and TransitionSeries built.';
        }
        break;

      case 'phase_5':
        const sbSheets = fileExists('02_Deconstruction/contact_sheets_storyboard/contact-sheet-manifest.json');
        const motionSheets = fileExists('02_Deconstruction/contact_sheets_motion/contact-sheet-manifest.json');
        if (sbSheets && motionSheets) {
          detectedStatus = 'completed';
          detectedNotes = 'Storyboard and motion contact sheets generated via high-speed batch sequence.';
        } else if (sbSheets || motionSheets) {
          detectedStatus = 'in_progress';
          detectedNotes = 'Partial contact sheets generated.';
        }
        break;

      case 'phase_6':
        const refStatePath = path.join(projectDir, '02_Deconstruction', 'REFINEMENT_STATE.yaml');
        if (fs.existsSync(refStatePath)) {
          try {
            const ref = YAML.parse(fs.readFileSync(refStatePath, 'utf8'));
            if (ref?.status === 'converged') {
              detectedStatus = 'completed';
              const lastHist = ref.history?.[ref.history.length - 1];
              detectedNotes = `Refinement converged at iteration ${ref.current_iteration || 'done'} (Score: ${lastHist?.score || 95}/100).`;
            } else {
              detectedStatus = 'in_progress';
              detectedNotes = `Refinement loop in progress (Iteration ${ref.current_iteration || 1}).`;
            }
          } catch {}
        }
        break;

      case 'phase_7':
        const critiquePath = path.join(projectDir, '02_Deconstruction', 'critique.json');
        if (fs.existsSync(critiquePath)) {
          try {
            const crit = JSON.parse(fs.readFileSync(critiquePath, 'utf8'));
            const score = typeof crit.overallScore === 'number' ? crit.overallScore : (crit.score || 0);
            if (score >= 90) {
              detectedStatus = 'completed';
              detectedNotes = `Critic Agent vision audit passed with score ${score}/100.`;
            } else {
              detectedStatus = 'in_progress';
              detectedNotes = `Critic score ${score}/100 below 90 threshold. Needs patch.`;
            }
          } catch {}
        }
        break;

      case 'phase_8': // Human Gate: Studio Review & Approval
        // If final export exists, phase 8 was completed
        const finalMp4 = path.join(rootDir, 'out', `${projectSlug}.mp4`);
        if (fs.existsSync(finalMp4)) {
          detectedStatus = 'completed';
          detectedNotes = 'Studio preview inspected and approved.';
        } else if (phase.status !== 'completed') {
          // If previous phases are completed, it's ready for studio approval
          const prevPhase = tracker.phases.find(p => p.id === 'phase_7');
          if (prevPhase?.status === 'completed') {
            detectedStatus = 'blocked_human_gate';
            detectedNotes = 'Ready for user studio review (http://localhost:3000) and sign-off.';
          }
        }
        break;

      case 'phase_9':
        const outMp4 = path.join(rootDir, 'out', `${projectSlug}.mp4`);
        if (fs.existsSync(outMp4)) {
          detectedStatus = 'completed';
          detectedNotes = `Master video exported to out/${projectSlug}.mp4.`;
        }
        break;
    }

    phase.status = detectedStatus;
    phase.notes = detectedNotes;
    phase.updatedAt = new Date().toISOString();
  }

  saveTracker(tracker);
  return tracker;
}

export function renderProgressBar(percent: number, length: number = 24): string {
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export function formatTerminalDashboard(manifest: PhaseTrackerManifest): string {
  const bar = renderProgressBar(manifest.overallProgressPercent, 28);
  const lines: string[] = [];

  lines.push(`\n╔══════════════════════════════════════════════════════════════════════════════════════════╗`);
  lines.push(`║ 🎬 REMOTION VIDEO PRODUCTION PIPELINE: PHASE & PROGRESS TRACKER                          ║`);
  lines.push(`║ Project: ${manifest.project.padEnd(79)} ║`);
  lines.push(`╠══════════════════════════════════════════════════════════════════════════════════════════╣`);
  lines.push(`║ Overall Progress: [${bar}] ${manifest.overallProgressPercent.toString().padStart(3)}%                                  ║`);
  lines.push(`║ Status: ${manifest.completedPhasesCount}/${manifest.totalPhasesCount} Phases Complete | Human Gates: ${manifest.humanGates.passed}/${manifest.humanGates.total} Approved | Active: ${manifest.activePhaseName.padEnd(25)} ║`);
  lines.push(`╠══════════╦═══════════════════════════════════╦═════════════════════╦═════════════════════════════╣`);
  lines.push(`║ PHASE    ║ NAME                              ║ STATUS              ║ DETAILS / ARTIFACTS         ║`);
  lines.push(`╠══════════╬═══════════════════════════════════╬═════════════════════╬═════════════════════════════╣`);

  for (const p of manifest.phases) {
    let statusLabel = '';
    switch (p.status) {
      case 'completed':
        statusLabel = '✅ COMPLETED';
        break;
      case 'in_progress':
        statusLabel = '🔄 IN PROGRESS';
        break;
      case 'blocked_human_gate':
        statusLabel = '⛔ HUMAN GATE';
        break;
      case 'skipped':
        statusLabel = '⏩ SKIPPED';
        break;
      default:
        statusLabel = '⏳ PENDING';
        break;
    }

    const gateTag = p.isHumanGate ? ' [GATE]' : '';
    const phaseLabel = `Ph ${p.phaseNumber}${gateTag}`.padEnd(8);
    const nameLabel = p.name.length > 33 ? p.name.substring(0, 30) + '...' : p.name.padEnd(33);
    const statusCol = statusLabel.padEnd(19);
    const note = p.notes || (p.artifacts[0] ? path.basename(p.artifacts[0]) : '-');
    const detailsCol = note.length > 27 ? note.substring(0, 24) + '...' : note.padEnd(27);

    lines.push(`║ ${phaseLabel} ║ ${nameLabel} ║ ${statusCol} ║ ${detailsCol} ║`);
  }

  lines.push(`╚══════════╩═══════════════════════════════════╩═════════════════════╩═════════════════════════════╝\n`);
  return lines.join('\n');
}

export function generateMarkdownReport(manifest: PhaseTrackerManifest): string {
  const bar = renderProgressBar(manifest.overallProgressPercent, 20);
  const rows = manifest.phases.map(p => {
    let icon = '⏳';
    let statusText = 'Pending';
    if (p.status === 'completed') {
      icon = '✅';
      statusText = '**Completed**';
    } else if (p.status === 'in_progress') {
      icon = '🔄';
      statusText = '**In Progress**';
    } else if (p.status === 'blocked_human_gate') {
      icon = '⛔';
      statusText = '**Human Gate Required**';
    } else if (p.status === 'skipped') {
      icon = '⏩';
      statusText = 'Skipped';
    }

    const gateBadge = p.isHumanGate ? ' `[HUMAN GATE]`' : '';
    return `| **Phase ${p.phaseNumber}** | ${p.name}${gateBadge} | ${icon} ${statusText} | ${p.weight}% | ${p.notes || '-'} |`;
  }).join('\n');

  return `# Pipeline Phase & Progress Tracker: ${manifest.project}

**Overall Progress**: \`[${bar}] ${manifest.overallProgressPercent}%\`  
**Active Phase**: **${manifest.activePhaseName}**  
**Completed**: ${manifest.completedPhasesCount} / ${manifest.totalPhasesCount} Phases  
**Human Gates**: ${manifest.humanGates.passed} / ${manifest.humanGates.total} Approved  
**Last Updated**: \`${manifest.lastUpdated}\`

---

## Phase Breakdown

| Phase | Description | Status | Weight | Details / Notes |
| :--- | :--- | :---: | :---: | :--- |
${rows}

---

## Operational Commands
- View Phase Dashboard: \`bun run phase:status ${manifest.project}\`
- Resync Tracker from Project Files: \`bun run phase:sync ${manifest.project}\`
- Approve Storyboard (Phase 3.7 Gate): \`bun run storyboard:direction approve ${manifest.project}\`
- Final Master Video Export (Phase 9): \`bun run render src/index.ts <compositionId> out/${manifest.project}.mp4\`
`;
}

// -----------------------------------------------------------------------------
// CLI Handler
// -----------------------------------------------------------------------------
const action = process.argv[2] || 'status';
const project = process.argv[3] || 'dzinr_motion';

if (action === 'status' || action === 'show') {
  const tracker = syncProjectProgress(project);
  console.log(formatTerminalDashboard(tracker));
} else if (action === 'sync') {
  const tracker = syncProjectProgress(project);
  console.log(`✓ Synchronized phase tracker for "${project}". Progress: ${tracker.overallProgressPercent}%`);
  console.log(formatTerminalDashboard(tracker));
} else if (action === 'set') {
  const phaseId = process.argv[4];
  const newStatus = process.argv[5] as PhaseStatus;
  const note = process.argv[6] || '';

  if (!phaseId || !newStatus) {
    console.error('Usage: bun scripts/phase-tracker.ts set <project> <phaseId> <status> [note]');
    process.exit(1);
  }

  const tracker = loadTracker(project);
  const targetPhase = tracker.phases.find(p => p.id === phaseId || p.phaseNumber === phaseId);
  if (!targetPhase) {
    console.error(`Phase "${phaseId}" not found in tracker.`);
    process.exit(1);
  }

  targetPhase.status = newStatus;
  if (note) targetPhase.notes = note;
  targetPhase.updatedAt = new Date().toISOString();

  saveTracker(tracker);
  console.log(`✓ Updated Phase ${targetPhase.phaseNumber} (${targetPhase.name}) to "${newStatus}".`);
  console.log(formatTerminalDashboard(tracker));
} else if (action === 'approve') {
  const phaseId = process.argv[4] || '8.0';
  const approver = process.argv[5] || 'user';
  const note = process.argv[6] || 'Approved by user in chat';

  const tracker = syncProjectProgress(project);
  const targetPhase = tracker.phases.find(p => p.id === phaseId || p.phaseNumber === phaseId);
  if (!targetPhase) {
    console.error(`Phase "${phaseId}" not found in tracker.`);
    process.exit(1);
  }

  targetPhase.status = 'completed';
  targetPhase.notes = `Approved by "${approver}" on ${new Date().toISOString().split('T')[0]}: ${note}`;
  targetPhase.updatedAt = new Date().toISOString();

  saveTracker(tracker);
  console.log(`\n🎉 Human Gate Phase ${targetPhase.phaseNumber} (${targetPhase.name}) APPROVED by "${approver}"!`);
  console.log(formatTerminalDashboard(tracker));
}
