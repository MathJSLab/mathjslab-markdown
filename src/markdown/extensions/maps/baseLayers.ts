import type * as Leaflet from 'leaflet';
import type { MarkdownDocumentContext } from '../../../MarkdownEngine.js';
import { resolveResourceUrl } from '../../extensionUtils.js';

export type MarkdownMapProvider = {
  id: string;
  name: string;
  url: string;
  attribution: string;
  minZoom?: number;
  maxZoom?: number;
  subdomains?: string | string[];
};
export type MarkdownMapOptions = {
  /** False keeps the backwards-compatible vector-only default. */
  defaultProvider?: string | false;
  providers?: readonly MarkdownMapProvider[];
  showSelector?: boolean;
};

const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
export const markdownMapProviders: readonly MarkdownMapProvider[] = Object.freeze(
  [
    { id: 'openstreetmap', name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: osmAttribution, maxZoom: 19 },
    {
      id: 'carto-light',
      name: 'CARTO Positron',
      url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attribution: `${osmAttribution} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
      maxZoom: 20,
    },
    {
      id: 'carto-dark',
      name: 'CARTO Dark Matter',
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attribution: `${osmAttribution} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
      maxZoom: 20,
    },
  ].map((provider) => Object.freeze(provider)),
);

export const validateMapProvider = (provider: MarkdownMapProvider, context: MarkdownDocumentContext): void => {
  if (!provider.id || !provider.name || !provider.attribution.trim()) throw new Error('Map providers require an id, name and attribution');
  if (Array.from(provider.url.matchAll(/\{([^}]+)\}/g)).some((match) => !['s', 'r', 'z', 'x', 'y'].includes(match[1]!)))
    throw new Error('Map tile URLs support only {s}, {r}, {z}, {x}, and {y} placeholders');
  const subdomains = typeof provider.subdomains === 'string' ? [...provider.subdomains] : (provider.subdomains ?? ['a']);
  if (!subdomains.length) throw new Error('Map provider subdomains cannot be empty');
  for (const subdomain of subdomains) {
    const sample = provider.url
      .replace(/\{s\}/g, subdomain)
      .replace(/\{r\}/g, '')
      .replace(/\{[zxy]\}/g, '0');
    const url = new URL(sample);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Map tiles require an HTTP(S) URL without embedded credentials');
    resolveResourceUrl(url.href, context);
  }
};

const escapeLabel = (label: string): string => label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const installMapBaseLayers = async (L: typeof Leaflet, map: Leaflet.Map, container: Element, options: MarkdownMapOptions, context: MarkdownDocumentContext): Promise<() => void> => {
  const selected = options.defaultProvider ?? false;
  if (selected === false && !options.providers) return () => undefined;
  const providers = options.providers ?? markdownMapProviders;
  if (selected !== false && !providers.some((provider) => provider.id === selected)) throw new Error(`Unknown default map provider: ${selected}`);
  if (new Set(providers.map((provider) => provider.id)).size !== providers.length || new Set(providers.map((provider) => provider.name)).size !== providers.length)
    throw new Error('Map provider ids and names must be unique');
  const { default: DOMPurify } = await import('dompurify');
  if (context.signal?.aborted) return () => undefined;
  const offline = L.layerGroup();
  const layers = Object.create(null) as Record<string, Leaflet.Layer>;
  layers[context.locale === 'pt' ? 'Sem mapa base (offline)' : 'No basemap (offline)'] = offline;
  const cleanup: Array<() => void> = [];
  let active: Leaflet.Layer = offline;
  const status = document.createElement('div');
  status.className = 'markdown-map-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  container.append(status);
  for (const provider of providers) {
    try {
      validateMapProvider(provider, context);
    } catch (cause) {
      context.onDiagnostic?.({
        extension: 'maps',
        code: 'map-provider-blocked',
        category: 'policy',
        severity: 'warning',
        message: `${provider.name}: ${cause instanceof Error ? cause.message : String(cause)}`,
        cause,
      });
      if (provider.id === selected) {
        status.textContent = `${provider.name}: ${context.locale === 'pt' ? 'mapa base indisponível' : 'basemap unavailable'}`;
        status.hidden = false;
      }
      continue;
    }
    const layer = L.tileLayer(provider.url, {
      attribution: DOMPurify.sanitize(provider.attribution, { ALLOWED_TAGS: ['a'], ALLOWED_ATTR: ['href', 'rel', 'target'] }),
      minZoom: provider.minZoom ?? 0,
      maxZoom: provider.maxZoom ?? 19,
      ...(provider.subdomains ? { subdomains: provider.subdomains } : {}),
    });
    layers[escapeLabel(provider.name)] = layer;
    if (provider.id === selected) active = layer;
    let reported = false;
    const onAdd = (): void => {
      reported = false;
    };
    const onError = (event: Leaflet.TileErrorEvent): void => {
      if (context.signal?.aborted || reported || !map.hasLayer(layer)) return;
      reported = true;
      // Do not expose API keys carried in custom provider query strings.
      const url = new URL((event.tile as HTMLImageElement).src);
      url.search = '';
      url.hash = '';
      const message = `${provider.name}: ${context.locale === 'pt' ? 'falha ao carregar mapa base' : 'failed to load basemap'} (${url.href})`;
      status.textContent = message;
      status.hidden = false;
      context.onDiagnostic?.({
        extension: 'maps',
        language: container.getAttribute('data-markdown-language') ?? 'geojson',
        code: 'map-tile-load-error',
        category: 'network',
        severity: 'warning',
        message,
        cause: event.error,
      });
    };
    layer.on('tileerror', onError);
    layer.on('add', onAdd);
    cleanup.push(() => {
      layer.off('tileerror', onError);
      layer.off('add', onAdd);
    });
  }
  const changed = (): void => {
    status.hidden = true;
  };
  map.on('baselayerchange', changed);
  cleanup.push(() => map.off('baselayerchange', changed));
  if (options.showSelector !== false) L.control.layers(layers, undefined, { collapsed: true }).addTo(map);
  active.addTo(map);
  return () => {
    cleanup.forEach((disconnect) => disconnect());
    status.remove();
  };
};
