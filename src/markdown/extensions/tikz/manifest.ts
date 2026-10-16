import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const tikzManifest = {
  name: 'tikz',
  description: 'TikZ and CircuiTikZ diagrams compiled locally in isolated Web Workers.',
  dependencies: ['@rod2ik/tikzjax', 'dompurify'],
  fences: [
    { language: 'tikz', className: 'tikz', sizing: 'intrinsic' },
    { language: 'circuitikz', className: 'tikz', sizing: 'intrinsic' },
  ],
  capabilities: ['wasm', 'network'],
  formats: [
    { language: 'tikz', mimeTypes: ['application/x-tex'], extensions: ['.tex'] },
    { language: 'circuitikz', mimeTypes: ['application/x-tex'], extensions: ['.tex'] },
  ],
  styles: `${extensionStyles('tikz')}\n.tikz>svg{background:white;padding:.5rem;box-sizing:border-box}`,
} as const satisfies MarkdownExtensionManifest;
