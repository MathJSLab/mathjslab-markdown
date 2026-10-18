import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
export const vcdManifest = {
  name: 'vcd',
  description: 'Local digital VCD simulation results with a proportional time axis and cursor.',
  dependencies: [],
  deferRendering: true,
  fences: [{ language: 'vcd', className: 'vcd-viewer', sizing: 'intrinsic' }],
  formats: [{ language: 'vcd', extensions: ['.vcd'] }],
  styles:
    '.vcd-viewer{max-width:100%;min-width:0}.vcd-viewer svg{max-width:100%;height:auto}.vcd-controls,.vcd-signals{display:flex;flex-wrap:wrap;gap:.5rem;margin:.5rem 0}.vcd-viewer table{border-collapse:collapse;max-width:100%}.vcd-viewer td,.vcd-viewer th{padding:.25rem .5rem;overflow-wrap:anywhere}.vcd-viewer input[type=number]{width:9rem}.vcd-signals label{min-width:0;overflow-wrap:anywhere}.vcd-signals{min-width:0;max-height:10rem;overflow:auto}',
} as const satisfies MarkdownExtensionManifest;
