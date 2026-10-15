import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';

export const citationsManifest = {
  name: 'citations',
  description: 'Document citations and CSL bibliographies from embedded BibTeX or CSL JSON.',
  dependencies: ['@citation-js/core', '@citation-js/plugin-bibtex', '@citation-js/plugin-csl', 'citeproc', 'dompurify'],
  fences: ['bibtex', 'csl-json', 'bibliography'].map((language) => ({ language, className: 'citations' })),
  formats: [
    { language: 'bibtex', mimeTypes: ['application/x-bibtex'], extensions: ['.bib'] },
    { language: 'csl-json', mimeTypes: ['application/json'], extensions: ['.json'] },
  ],
  styles:
    '.markdown-bibliography-entry{margin-block:.7em}.markdown-bibliography-hanging .markdown-bibliography-entry{padding-inline-start:2em;text-indent:-2em}.csl-left-margin{float:left;margin-inline-end:.5em}.csl-right-inline{display:block;margin-inline-start:2em}.markdown-citation-unresolved{color:var(--markdown-error-color,#b42318)}',
} satisfies MarkdownExtensionManifest;
