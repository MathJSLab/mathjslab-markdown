import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const netlistManifest = {
  name: 'netlist',
  description: 'Digital schematics from bounded Yosys JSON netlists, rendered locally.',
  dependencies: ['netlistsvg', 'dompurify'],
  fences: [{ language: 'netlist', className: 'netlist', sizing: 'intrinsic' }],
  formats: [{ language: 'netlist', extensions: ['.json'] }],
  styles: extensionStyles('netlist'),
} as const satisfies MarkdownExtensionManifest;
