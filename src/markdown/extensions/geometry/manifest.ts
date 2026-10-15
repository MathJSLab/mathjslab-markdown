import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const geometryManifest = {
  name: 'geometry',
  description: 'Declarative interactive geometry constructions rendered with JSXGraph.',
  dependencies: ['jsxgraph', 'json5'],
  fences: [{ language: 'geometry', className: 'geometry' }],
  interactive: true,
  capabilities: ['interactive'],
  formats: [{ language: 'geometry', mimeTypes: ['application/json', 'application/json5'], extensions: ['.json', '.json5'] }],
  styles: `${extensionStyles('geometry')}
.geometry{width:100%}
.geometry-viewport{box-sizing:border-box;position:relative;width:100%;height:24rem;min-height:12rem;overflow:hidden;touch-action:none;border:1px solid #888;border-radius:.25rem}
.geometry-viewport:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.geometry-viewport svg{display:block}
`,
} as const satisfies MarkdownExtensionManifest;
