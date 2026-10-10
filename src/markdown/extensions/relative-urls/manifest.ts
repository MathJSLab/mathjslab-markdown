import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';

export const relativeUrlsManifest = {
  name: 'relative-urls',
  description: 'Resolves relative links and image sources against the Markdown document URL.',
  dependencies: [],
  fences: [],
} as const satisfies MarkdownExtensionManifest;
