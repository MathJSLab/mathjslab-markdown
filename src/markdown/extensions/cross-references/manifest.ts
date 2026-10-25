import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';

export const crossReferencesManifest = {
  name: 'cross-references',
  description: 'Explicit heading anchors, captioned figures, tables and equations, and document-local references.',
  dependencies: [],
  fences: [],
  styles:
    '.markdown-reference-unresolved{text-decoration:underline dotted}.markdown-figure,.markdown-table,.markdown-equation{border-inline-start:0}.markdown-table-full-width>table{width:100%;table-layout:auto}',
} as const satisfies MarkdownExtensionManifest;
