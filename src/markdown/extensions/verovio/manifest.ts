import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const verovioManifest = {
  name: 'verovio-music',
  description: 'Academic music scores rendered from MEI or MusicXML.',
  dependencies: ['verovio', 'dompurify'],
  fences: [
    { language: 'mei', className: 'verovio-music', sizing: 'intrinsic' },
    { language: 'musicxml', className: 'verovio-music', sizing: 'intrinsic' },
  ],
  capabilities: ['wasm'],
  formats: [
    {
      language: 'mei',
      mimeTypes: ['application/mei+xml'],
      extensions: ['.mei'],
    },
    {
      language: 'musicxml',
      mimeTypes: ['application/vnd.recordare.musicxml+xml'],
      extensions: ['.musicxml', '.xml'],
    },
  ],
  styles: extensionStyles('verovio-music'),
} as const satisfies MarkdownExtensionManifest;
