import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const abcManifest = {
  name: 'abc-music',
  description: 'Music notation rendered from ABC source.',
  dependencies: ['abcjs', 'dompurify'],
  fences: [{ language: 'abc', className: 'abc-music', sizing: 'intrinsic' }],
  interactive: false,
  capabilities: ['audio'],
  formats: [{ language: 'abc', mimeTypes: ['text/vnd.abc'], extensions: ['.abc'] }],
  styles: extensionStyles('abc-music'),
} as const satisfies MarkdownExtensionManifest;
