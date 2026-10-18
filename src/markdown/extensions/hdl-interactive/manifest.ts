import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { vcdManifest } from '../vcd/manifest.js';
export const hdlInteractiveManifest = {
  name: 'hdl-interactive',
  description: 'Explicitly authorized stateful HDL simulation through a host session.',
  dependencies: [],
  deferRendering: true,
  fences: [
    { language: 'vhdl-live', className: 'hdl-interactive', sizing: 'intrinsic' },
    { language: 'verilog-live', className: 'hdl-interactive', sizing: 'intrinsic' },
  ],
  styles:
    vcdManifest.styles +
    '.hdl-interactive{max-width:100%;min-width:0}.hdl-interactive-controls,.hdl-interactive-inputs{display:flex;flex-wrap:wrap;gap:.5rem;margin:.5rem 0}.hdl-interactive-inputs{min-width:0}.hdl-interactive-inputs label{min-width:0;overflow-wrap:anywhere}.hdl-interactive input{max-width:100%}.hdl-interactive td,.hdl-interactive pre{overflow-wrap:anywhere;white-space:pre-wrap}.hdl-interactive table{max-width:100%}',
} as const satisfies MarkdownExtensionManifest;
