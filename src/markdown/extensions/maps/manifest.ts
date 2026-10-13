import type { MarkdownExtensionManifest } from '../../../MarkdownEngine.js';
import { extensionStyles } from '../../extensionUtils.js';

export const mapsManifest = {
  name: 'maps',
  description: 'Offline vector maps from GeoJSON and TopoJSON.',
  dependencies: ['leaflet', 'topojson-client'],
  fences: [
    { language: 'geojson', className: 'markdown-map' },
    { language: 'topojson', className: 'markdown-map' },
  ],
  interactive: true,
  capabilities: ['interactive', 'network'],
  formats: [
    {
      language: 'geojson',
      mimeTypes: ['application/geo+json'],
      extensions: ['.geojson'],
    },
    {
      language: 'topojson',
      mimeTypes: ['application/topo+json'],
      extensions: ['.topojson'],
    },
  ],
  styles: `${extensionStyles('markdown-map')}
.markdown-map { background: #eef2f3; height: min(28rem, 70vh); min-height: 18rem; }
.markdown-map .leaflet-container { height: 100%; width: 100%; }
.markdown-map .leaflet-control-layers-toggle { background-image: none !important; text-align: center; line-height: 36px; }
.markdown-map .leaflet-control-layers-toggle::after { content: '\u2630'; font-size: 22px; }
.markdown-map-status { position: absolute; bottom: 1.5rem; left: 0.5rem; right: 0.5rem; z-index: 1000; background: Canvas; color: CanvasText; padding: 0.4rem; font-size: 0.85rem; overflow-wrap: anywhere; }
`,
} as const satisfies MarkdownExtensionManifest;
