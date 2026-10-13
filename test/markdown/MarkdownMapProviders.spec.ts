/// <reference types="jest" />
import { jest } from '@jest/globals';
import L from 'leaflet';
import { installMapBaseLayers, markdownMapProviders, validateMapProvider } from '../../src/markdown/extensions/maps/baseLayers';
import { DefaultMarkdownResourceService } from '../../src/markdown/security';

const provider = markdownMapProviders[0]!;
const createMap = () => {
  const container = document.createElement('div');
  container.setAttribute('data-markdown-language', 'geojson');
  document.body.append(container);
  return { container, map: L.map(container).setView([0, 0], 1) };
};

it('retains the offline default without creating tiles or a selector', async () => {
  const { container, map } = createMap();
  const cleanup = await installMapBaseLayers(L, map, container, {}, {});
  expect(container.querySelector('.leaflet-tile, .leaflet-control-layers')).toBeNull();
  cleanup();
  map.remove();
  container.remove();
});

it('selects the default provider, includes alternatives and sanitizes attribution', async () => {
  const { container, map } = createMap();
  const cleanup = await installMapBaseLayers(
    L,
    map,
    container,
    { defaultProvider: provider.id, providers: [{ ...provider, attribution: '<script>bad()</script><a href="javascript:bad()" onclick="bad()">Credit</a>' }, markdownMapProviders[1]!] },
    {},
  );
  const layers: L.Layer[] = [];
  map.eachLayer((layer) => layers.push(layer));
  expect(layers.filter((layer) => layer instanceof L.TileLayer)).toHaveLength(1);
  expect(container.querySelectorAll('.leaflet-control-layers-base input')).toHaveLength(3);
  expect(container.querySelector('.leaflet-control-attribution script, .leaflet-control-attribution [onclick]')).toBeNull();
  expect(container.querySelector('.leaflet-control-attribution a[href^="javascript:"]')).toBeNull();
  cleanup();
  map.remove();
  container.remove();
});

it('reports one tile error locally without discarding vector features and detaches handlers', async () => {
  const { container, map } = createMap();
  const onDiagnostic = jest.fn();
  const cleanup = await installMapBaseLayers(L, map, container, { defaultProvider: provider.id, providers: [provider] }, { onDiagnostic });
  const marker = L.circleMarker([0, 0]).addTo(map);
  let tiles: L.TileLayer | undefined;
  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) tiles = layer;
  });
  const tile = document.createElement('img');
  tile.src = 'https://tile.openstreetmap.org/1/0/0.png?token=secret';
  tiles!.fire('tileerror', { tile, error: new Error('Unavailable') });
  tiles!.fire('tileerror', { tile, error: new Error('Unavailable') });
  expect(onDiagnostic).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="status"]')?.textContent).toContain('https://tile.openstreetmap.org/1/0/0.png');
  expect(container.textContent).not.toContain('secret');
  expect(map.hasLayer(marker)).toBe(true);
  cleanup();
  expect(tiles!.listens('tileerror')).toBe(false);
  map.remove();
  container.remove();
});

it('respects origin and network policy and rejects invalid configuration', async () => {
  const resources = new DefaultMarkdownResourceService();
  expect(() => validateMapProvider(provider, { resources, resourcePolicy: { allowNetwork: false } })).toThrow();
  expect(() => validateMapProvider(provider, { resources, securityMode: 'sanitized', sourceUrl: new URL('https://course.test/lesson.md') })).toThrow();
  expect(() => validateMapProvider({ ...provider, url: 'javascript:bad()' }, {})).toThrow('HTTP(S)');
  expect(() => validateMapProvider({ ...provider, url: 'https://tiles.test/{unsupported}.png' }, {})).toThrow('placeholders');
  expect(() => validateMapProvider({ ...provider, subdomains: [] }, {})).toThrow('empty');
  const { container, map } = createMap();
  await expect(installMapBaseLayers(L, map, container, { defaultProvider: 'missing' }, {})).rejects.toThrow('Unknown default');
  const cleanup = await installMapBaseLayers(L, map, container, { defaultProvider: provider.id, providers: [provider] }, { resources, resourcePolicy: { allowNetwork: false } });
  expect(container.querySelector('.leaflet-tile')).toBeNull();
  cleanup();
  map.remove();
  container.remove();
  resources.dispose();
});
