import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const vegaManifest = {
  name: 'vega',
  description: 'Declarative visualizations using Vega JSON.',
  dependencies: ['vega', 'vega-lite', 'vega-embed'],
  fences: [{ language: 'vega', className: 'vega', sizing: 'intrinsic' }],
  interactive: true,
  capabilities: ['interactive', 'network'],
  formats: [{ language: 'vega', mimeTypes: ['application/vnd.vega.v6+json', 'application/json'], extensions: ['.vg.json'] }],
  styles: `${extensionStyles('vega')}\n.vega .vega-embed { width: 100%; }`,
} as const satisfies MarkdownExtensionManifest;
