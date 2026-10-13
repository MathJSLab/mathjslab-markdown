import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';

export const syntaxHighlightManifest = {
  name: 'syntax-highlight',
  description: 'Syntax highlighting for source-code fences.',
  dependencies: ['marked-highlight', 'highlight.js'],
  fences: [],
  styles: `
pre code.hljs { display: block; padding: 1rem; overflow-x: auto; color: var(--calc-text, #24292e); background: var(--calc-surface, #f6f8fa); }
.hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #c7254e; }
.hljs-string, .hljs-doctag, .hljs-regexp { color: #08783e; }
.hljs-number, .hljs-attribute { color: #9a3412; }
.hljs-title, .hljs-section, .hljs-type, .hljs-built_in { color: #6f42c1; }
.hljs-meta, .hljs-symbol { color: #0550ae; }
`,
} as const satisfies MarkdownExtensionManifest;
