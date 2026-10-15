import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';

export const didacticManifest = {
  name: 'didactic',
  description: 'Semantic teaching blocks with native collapsible hints and solutions.',
  dependencies: [],
  fences: [],
  styles:
    '.markdown-didactic{border-inline-start:3px solid currentColor;padding:.5em 1em;margin:1em 0}.markdown-block-heading{font-weight:bold;margin:.25em 0}.markdown-didactic>summary{cursor:pointer}',
} as const satisfies MarkdownExtensionManifest;
