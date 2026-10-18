import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';
import { vcdManifest } from '../vcd/manifest.js';

export const hdlManifest = {
  name: 'hdl',
  deferRendering: true,
  description: 'VHDL and Verilog execution through an explicitly authorized host executor.',
  dependencies: ['netlistsvg', 'wavedrom', 'json5', 'dompurify'],
  fences: [
    { language: 'vhdl-run', className: 'hdl-execution', sizing: 'intrinsic' },
    { language: 'verilog-run', className: 'hdl-execution', sizing: 'intrinsic' },
  ],
  styles: extensionStyles('hdl-execution') + vcdManifest.styles + '\n.hdl-execution pre {white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%}',
} as const satisfies MarkdownExtensionManifest;
