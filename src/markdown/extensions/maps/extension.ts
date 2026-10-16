import { sizeViewport } from '../../renderSizing.js';
import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, observeElementResize, renderExtensionError, waitForElementLayout } from '../../extensionUtils.js';
import { mapsManifest } from './manifest.js';
import type { GeoJsonObject } from 'geojson';
import type { Topology, Objects } from 'topojson-specification';
import { installMapBaseLayers, type MarkdownMapOptions } from './baseLayers.js';
export { markdownMapProviders } from './baseLayers.js';
export type { MarkdownMapOptions, MarkdownMapProvider } from './baseLayers.js';

type MapEntry = { map: import('leaflet').Map; disconnect: () => void };

const popup = (feature: GeoJSON.Feature, layer: import('leaflet').Layer): void => {
  const properties = feature.properties;
  if (!properties) return;
  const label = properties.name ?? properties.title ?? properties.label;
  if (typeof label !== 'string' && typeof label !== 'number') return;
  const node = document.createElement('div');
  node.textContent = String(label);
  (
    layer as import('leaflet').Layer & {
      bindPopup(content: HTMLElement): unknown;
    }
  ).bindPopup(node);
};

export const mapsExtension = (options: MarkdownMapOptions = {}): MarkdownExtension => {
  const maps = new Map<Element, MapEntry>();
  const dispose = (container: Element): void => {
    const entry = maps.get(container);
    try {
      entry?.disconnect();
    } catch {
      /* Continue removing the Leaflet map. */
    }
    try {
      entry?.map.remove();
    } catch {
      /* Continue clearing the container. */
    }
    maps.delete(container);
    container.replaceChildren();
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    const language = container.getAttribute('data-markdown-language') ?? 'geojson';
    let map: import('leaflet').Map | undefined;
    let disconnect = (): void => undefined;
    let disconnectBaseLayers = (): void => undefined;
    try {
      assertSourceSize(source, context);
      const input = JSON.parse(source) as GeoJsonObject | Topology<Objects<GeoJSON.GeoJsonProperties>>;
      const [{ default: L }, topojson, { default: leafletStyles }] = await Promise.all([
        import(/* webpackChunkName: "markdown-maps" */ 'leaflet'),
        import(/* webpackChunkName: "markdown-maps" */ 'topojson-client'),
        import(/* webpackChunkName: "markdown-maps" */ 'leaflet/dist/leaflet.css?inline'),
      ]);
      if (context.signal?.aborted) return;
      dispose(container);
      const style = document.createElement('style');
      style.textContent = leafletStyles;
      const viewport = document.createElement('div');
      viewport.className = 'leaflet-container';
      viewport.style.height = '100%';
      viewport.style.minHeight = '18rem';
      viewport.style.width = '100%';
      viewport.setAttribute('role', 'application');
      viewport.setAttribute('aria-label', language === 'topojson' ? 'TopoJSON map' : 'GeoJSON map');
      sizeViewport(viewport, context);
      container.append(style, viewport);
      await waitForElementLayout(viewport, context);
      if (context.signal?.aborted) return;
      map = L.map(viewport, { zoomControl: true, attributionControl: true });
      if (context.createMapBaseLayer) context.createMapBaseLayer(L, context)?.addTo(map);
      else disconnectBaseLayers = await installMapBaseLayers(L, map, container, { ...options, ...context.mapOptions }, context);
      if (context.signal?.aborted) {
        disconnectBaseLayers();
        map.remove();
        return;
      }
      const objects = language === 'topojson' ? Object.values((input as Topology).objects).map((object) => topojson.feature(input as Topology, object)) : [input as GeoJsonObject];
      // Circle markers need no image assets or external tiles, including in
      // Shadow DOM where Leaflet's default icon-path CSS probe cannot work.
      const group = L.featureGroup(
        objects.map((object) =>
          L.geoJSON(object, {
            onEachFeature: popup,
            pointToLayer: (_feature, latlng) => L.circleMarker(latlng, { radius: 7 }),
          }),
        ),
      );
      group.addTo(map);
      const bounds = group.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16], maxZoom: 16 });
      else map.setView([0, 0], 1);
      const activeMap = map;
      disconnect = observeElementResize(container, context, (width, height) => {
        if (!context.signal?.aborted && width > 0 && height > 0) {
          activeMap.invalidateSize({ pan: false });
          if (bounds.isValid()) activeMap.fitBounds(bounds, { padding: [16, 16], maxZoom: 16 });
        }
      });
      if (context.signal?.aborted) {
        disconnect();
        map.remove();
        container.replaceChildren();
        return;
      }
      const disconnectResize = disconnect;
      const cleanupBaseLayers = disconnectBaseLayers;
      const abort = (): void => dispose(container);
      context.signal?.addEventListener('abort', abort, { once: true });
      maps.set(container, {
        map,
        disconnect: () => {
          disconnectResize();
          cleanupBaseLayers();
          context.signal?.removeEventListener('abort', abort);
        },
      });
      map = undefined;
      disconnect = (): void => undefined;
    } catch (error) {
      disconnect();
      disconnectBaseLayers();
      try {
        map?.remove();
      } catch {
        /* Preserve the original map diagnostic. */
      }
      maps.delete(container);
      if (!context.signal?.aborted) renderExtensionError(container, 'Map', language, source, error, context);
    }
  };
  return {
    name: mapsManifest.name,
    manifest: mapsManifest,
    fences: mapsManifest.fences.map((fence) => ({ ...fence, render, dispose })),
    dispose() {
      for (const container of Array.from(maps.keys())) dispose(container);
    },
  };
};
