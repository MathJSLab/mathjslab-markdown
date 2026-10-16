import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const waveDromManifest = {
  name: 'wavedrom',
  description: 'Digital timing diagrams from WaveJSON and JSON5, rendered as local SVG.',
  dependencies: ['wavedrom', 'json5', 'dompurify'],
  fences: [{ language: 'wavedrom', className: 'wavedrom', sizing: 'intrinsic' }],
  formats: [{ language: 'wavedrom', mimeTypes: ['application/json', 'application/json5'], extensions: ['.json', '.json5'] }],
  styles: extensionStyles('wavedrom'),
} as const satisfies MarkdownExtensionManifest;
