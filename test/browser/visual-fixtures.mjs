import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { serveStatic } from '../hdl-browser/static-server.mjs';

const update = process.argv.includes('--update');
const visual = update || process.argv.includes('--visual');
const baselines = new URL(process.platform === 'win32' ? './visual/baselines/' : './visual/baselines/' + process.platform + '/', import.meta.url);
const results = new URL('../../test-results/visual/', import.meta.url);

const compare = async (page, name, locator) => {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const actual = await locator.screenshot({ animations: 'disabled' });
  const baseline = new URL(name + '.png', baselines);
  if (update) {
    await mkdir(baselines, { recursive: true });
    await writeFile(baseline, actual);
    return;
  }
  const expected = await readFile(baseline).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    throw new Error(`Missing ${process.platform} baseline for ${name}. Generate it with npm run test:visual -- --update in the reference environment.`);
  });
  if (expected.equals(actual)) return;
  const difference = await page.evaluate(
    async (images) => {
      const pixels = async (image) => {
        const bitmap = await createImageBitmap(new Blob([Uint8Array.from(atob(image), (character) => character.charCodeAt(0))]));
        const { width, height } = bitmap;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        bitmap.close();
        return { width, height, data: context.getImageData(0, 0, width, height).data };
      };
      const [before, after] = await Promise.all(images.map(pixels));
      if (before.width !== after.width || before.height !== after.height) return 1;
      let changed = 0;
      for (let index = 0; index < before.data.length; index += 4) {
        const offsets = [0, 1, 2, 3];
        if (offsets.some((offset) => Math.abs(before.data[index + offset] - after.data[index + offset]) > 25)) changed++;
      }
      return changed / (before.width * before.height);
    },
    [expected.toString('base64'), actual.toString('base64')],
  );
  if (difference > 0.001) {
    await mkdir(results, { recursive: true });
    await writeFile(new URL(name + '.actual.png', results), actual);
    assert.fail(name + ' differs from baseline by ' + (difference * 100).toFixed(3) + '%');
  }
};

const server = await serveStatic();
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // CircuiTikZ creates a worker from a session-owned object URL.
  await page.route('**/test/browser/visual-fixtures.html', async (route) => {
    const response = await route.fetch();
    const headers = response.headers();
    headers['content-security-policy'] = headers['content-security-policy'].replace("worker-src 'self'", "worker-src 'self' blob:");
    await route.fulfill({ response, headers });
  });
  await page.goto(server.url + '/test/browser/visual-fixtures.html');

  await page.evaluate(async () => {
    const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
    const engine = createEducationalMarkdownEngine({
      features: ['vega', 'vega-lite', 'tikz', 'didactic', 'cross-references', 'graphviz', 'mermaid'],
      allowedCapabilities: ['interactive', 'network', 'wasm'],
    });
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const article = document.createElement('article');
    article.style.width = '560px';
    root.append(article);
    document.body.append(host);
    const diagnostics = [];
    const exports = [];
    const context = { theme: 'light', locale: 'en', onDiagnostic: (diagnostic) => diagnostics.push(diagnostic), onVisualExport: (visual) => exports.push(visual) };
    const read = async (name) => {
      const url = new URL('/test/markdown/extensions/' + name + '.md', location.href);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Cannot read fixture ' + name);
      return response.text();
    };
    const session = await engine.renderDocument(await read('vega-lite-multilayer'), article, context);
    window.visualFixture = { engine, article, context, diagnostics, exports, read, session };
  });

  const chart = page.locator('[data-markdown-language="vega-lite"] svg');
  assert.equal(await chart.count(), 1, JSON.stringify(await page.evaluate(() => window.visualFixture.diagnostics)));
  const paths = await chart.locator('.mark-line path').evaluateAll((nodes) => nodes.map((node) => ({ path: node.getAttribute('d'), dash: node.getAttribute('stroke-dasharray') })));
  assert.equal(paths.length, 4);
  assert.equal(paths.filter(({ dash }) => Boolean(dash)).length, 2);
  for (const { path } of paths) assert.match(path, /^M[^L]+L[^L]+$/);
  assert.match(await chart.textContent(), /Family A/);
  const exportedLite = await page.evaluate(async () => {
    const [visual] = window.visualFixture.exports;
    return { language: visual.language, mimeType: visual.mimeType, svg: await visual.serialize() };
  });
  assert.equal(exportedLite.language, 'vega-lite');
  assert.equal(exportedLite.mimeType, 'image/svg+xml');
  assert.match(exportedLite.svg, /<svg\b.*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(exportedLite.svg, /Family A/);
  const safeExport = await page.evaluate(async () => {
    const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
    const article = document.createElement('article');
    let visual;
    let generatedId = 41;
    const engine = createEducationalMarkdownEngine({
      extensions: [
        {
          name: 'export-test',
          fences: [
            {
              language: 'export-test',
              className: 'export-test',
              async render() {},
              async exportSVG() {
                const id = 'generated-' + ++generatedId;
                return (
                  '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="' +
                  id +
                  '"/></defs>' +
                  '<rect width="10" height="10" fill="url(#' +
                  id +
                  ')" filter="url(https://blocked.example/filter)" onclick="alert(1)"/>' +
                  '<image href="https://blocked.example/image"/><style>@import "https://blocked.example/css"</style>' +
                  '<foreignObject/><script>alert(1)</script></svg>'
                );
              },
            },
          ],
        },
      ],
    });
    try {
      await engine.renderDocument('~~~export-test\nfixture\n~~~', article, {
        onVisualExport: (value) => {
          visual = value;
        },
      });
      const first = await visual.serialize();
      if (first !== (await visual.serialize())) throw new Error('Generated SVG IDs were not normalized');
      return first;
    } finally {
      await engine.dispose();
    }
  });
  assert.match(safeExport, /id="svg-1"/);
  assert.match(safeExport, /fill="url\(#svg-1\)"/);
  assert.doesNotMatch(safeExport, /blocked\.example|onclick|<image|<style|<foreignObject|<script/);

  const initialWidth = (await chart.boundingBox()).width;
  await page.evaluate(() => {
    window.visualFixture.article.style.width = '320px';
  });
  await page.waitForFunction((width) => {
    const svg = window.visualFixture.article.querySelector('[data-markdown-language="vega-lite"] svg');
    return svg && svg.getBoundingClientRect().width < width - 100;
  }, initialWidth);
  const resizedExport = await page.evaluate(() => window.visualFixture.exports[0].serialize());
  assert.notEqual(resizedExport, exportedLite.svg);

  await page.evaluate(async () => {
    const { article, session, read, context } = window.visualFixture;
    window.visualFixture.oldChart = article.querySelector('svg');
    await session.update(await read('vega-lite-scientific'), context);
  });
  assert.equal(await chart.count(), 1, JSON.stringify(await page.evaluate(() => window.visualFixture.diagnostics)));
  assert.equal(await page.evaluate(() => window.visualFixture.oldChart.isConnected), false);
  for (const label of ['I_D1', 'I_D2', 'V_DF1', 'V_DF2']) assert.equal(await chart.getByText(label, { exact: true }).count(), 1);
  assert.ok(await chart.locator('[aria-label]').count());
  if (visual) await compare(page, 'vega-lite-scientific', chart);

  await page.evaluate(async () => {
    const { article, session, read, context } = window.visualFixture;
    article.style.width = '560px';
    await session.update(await read('circuitikz-cmos'), context);
  });
  assert.equal(await chart.count(), 0);
  const figure = page.locator('[data-markdown-label="cmos-gates"]');
  assert.match(await figure.textContent(), /CMOS NAND and NOR/);
  const circuit = figure.getByRole('img', { name: 'CircuiTikZ circuit diagram' });
  assert.equal(await circuit.count(), 1, JSON.stringify(await page.evaluate(() => window.visualFixture.diagnostics)));
  assert.ok(await circuit.locator('path').count());
  assert.equal(await page.locator('[data-markdown-reference="cmos-gates"] a').getAttribute('href'), '#' + (await figure.getAttribute('id')));
  if (visual) {
    await compare(page, 'circuitikz-cmos', circuit);
    await page.evaluate(async () => {
      const { session, read, context } = window.visualFixture;
      const source = await read('vega-lite');
      await session.update(source.slice(0, source.lastIndexOf('```vega-lite')), context);
    });
    assert.equal(await chart.count(), 1, JSON.stringify(await page.evaluate(() => window.visualFixture.diagnostics)));
    assert.ok(await chart.first().locator('[aria-label]').count());
    await compare(page, 'vega-lite-basic', chart.first());
    await page.evaluate(async () => {
      const { session, context } = window.visualFixture;
      await session.update(['~~~dot', 'digraph { A -> B }', '~~~'].join('\n'), context);
    });
    const graph = page.locator('[data-markdown-language="dot"] svg');
    assert.equal(await graph.count(), 1);
    assert.equal(
      await graph
        .locator('title')
        .filter({ hasText: /^A->B$/ })
        .count(),
      1,
    );
    await compare(page, 'graphviz', graph);
  }

  const diagnostics = await page.evaluate(async () => {
    const { rasterizeMarkdownVisual } = await import('/dist/browser/core.js');
    const transparent = {
      element: document.body,
      mimeType: 'image/svg+xml',
      serialize: async () => '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="2" height="2" fill="red"/></svg>',
    };
    const transparentBitmap = await createImageBitmap(await rasterizeMarkdownVisual(transparent));
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 4;
      const painter = canvas.getContext('2d');
      painter.drawImage(transparentBitmap, 0, 0);
      if (painter.getImageData(3, 3, 1, 1).data[3] !== 0 || painter.getImageData(0, 0, 1, 1).data[3] !== 255) throw new Error('PNG did not preserve transparency');
    } finally {
      transparentBitmap.close();
    }
    const { engine, session, diagnostics, context, exports } = window.visualFixture;
    const successfulDiagnostics = diagnostics.splice(0);
    const presetResponse = await fetch('/doc/extensions/vega-scientific.md');
    if (!presetResponse.ok) throw new Error('Cannot load the scientific chart preset');
    const preset = JSON.parse((await presetResponse.text()).match(/```json\s+([\s\S]*?)```/)[1]);
    for (const [language, input] of [
      ['vega', 'tensao-vega.md'],
      ['vega-lite', 'curvas-cientificas.md'],
    ]) {
      const response = await fetch('/example/en/' + input);
      const source = JSON.parse((await response.text()).match(/^```[^\n]+\n([\s\S]*?)^```/m)[1]);
      await session.update(['~~~' + language, JSON.stringify({ ...source, ...preset }), '~~~'].join('\n'), { ...context, theme: 'dark' });
      const handle = exports.at(-1);
      if (handle.language !== language || !handle.element.querySelector('.mark-line path')) throw new Error('Scientific preset did not render for ' + language);
      const svg = new DOMParser().parseFromString(await handle.serialize(), 'image/svg+xml');
      if (!svg.querySelector('rect[fill="#ffffff"]') || !svg.querySelector('.role-axis-label text[fill="#111827"]'))
        throw new Error('Scientific preset lost its background or axis text color for ' + language);
    }
    successfulDiagnostics.push(...diagnostics.splice(0));
    for (const fixture of ['tikz', 'circuitikz-cmos']) {
      const source = await window.visualFixture.read(fixture);
      const firstExport = exports.length;
      await session.update(source, context);
      const handles = exports.slice(firstExport);
      if (handles.length !== (fixture === 'tikz' ? 2 : 1)) throw new Error('Missing TikZ export handles');
      const serialized = await Promise.all(handles.map((handle) => handle.serialize()));
      const png = await rasterizeMarkdownVisual(handles[0], { scale: 2, background: '#ff00ff' });
      if (png.type !== 'image/png') throw new Error('TikZ export did not return PNG');
      await session.update(source, context);
      const repeated = await Promise.all(exports.slice(firstExport + handles.length).map((handle) => handle.serialize()));
      if (JSON.stringify(serialized) !== JSON.stringify(repeated)) throw new Error('TikZ SVG changed between document revisions');
      if (
        await handles[0].serialize().then(
          () => true,
          () => false,
        )
      )
        throw new Error('Replaced TikZ export remained available');
      await session.update('Replacement', context);
      const bitmap = await createImageBitmap(png);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const painter = canvas.getContext('2d');
        painter.drawImage(bitmap, 0, 0);
        const pixels = painter.getImageData(0, 0, canvas.width, canvas.height).data;
        if (!pixels.some((value, index) => index % 4 === 1 && value > 0) && !pixels.some((value, index) => index % 4 === 2 && value < 255))
          throw new Error('TikZ PNG contains only the background');
        const natural = new Image();
        natural.src = 'data:image/svg+xml,' + encodeURIComponent(serialized[0]);
        await natural.decode();
        if (bitmap.width !== natural.naturalWidth * 2 || bitmap.height !== natural.naturalHeight * 2) throw new Error('Incorrect PNG scale');
      } finally {
        bitmap.close();
      }
      for (const svg of serialized) {
        const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
        if (parsed.querySelector('parsererror') || !parsed.querySelector('path')) throw new Error('Invalid standalone TikZ SVG');
        if (parsed.documentElement.getAttribute('role') !== 'img' || !parsed.documentElement.getAttribute('aria-label')) throw new Error('TikZ export lost its accessible name');
        if (/blob:|https?:\/\/(?!www\.w3\.org)/.test(svg)) throw new Error('TikZ SVG retained a session or external URL');
        const rules = [...(parsed.querySelector('style')?.textContent ?? '').matchAll(/font-family:(markdown-svg-font-\d+);src:url\("data:font\/woff2;base64,([A-Za-z0-9+/=]+)"\)/g)];
        for (const glyph of parsed.querySelectorAll('text[font-family]')) {
          if (!rules.some((rule) => rule[1] === glyph.getAttribute('font-family'))) throw new Error('TikZ glyph lost its font');
        }
        if (fixture === 'circuitikz-cmos' && !rules.length) throw new Error('CMOS export is missing embedded fonts');
        for (const [, family, base64] of rules) {
          const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
          const font = await new FontFace(family, bytes).load();
          if (font.status !== 'loaded') throw new Error('Exported font cannot be decoded after replacement');
        }
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          if (!image.naturalWidth || !image.naturalHeight) throw new Error('Exported TikZ image has no intrinsic dimensions');
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    const mermaid = (htmlLabels) =>
      [
        '~~~mermaid',
        '---',
        'config:',
        '  htmlLabels: ' + htmlLabels,
        '---',
        'flowchart LR',
        '  accTitle: Signal path',
        '  A[Input] --> B[Output]',
        '  style A fill:#f80,stroke:#123,stroke-width:3px',
        '~~~',
      ].join('\n');
    await session.update(mermaid(false), context);
    const diagram = exports.at(-1);
    if (diagram.language !== 'mermaid') throw new Error('Missing Mermaid export');
    const diagramSVG = await diagram.serialize();
    const exported = new DOMParser().parseFromString(diagramSVG, 'image/svg+xml');
    const liveDiagram = diagram.element.querySelector('svg');
    if (exported.querySelector('parsererror, style, foreignObject') || !exported.querySelector('text')) throw new Error('Mermaid export lost SVG labels or retained unsupported content');
    const liveNode = liveDiagram.querySelector('g.node rect');
    const standaloneNode = exported.querySelector('g.node rect');
    for (const property of ['fill', 'stroke', 'stroke-width']) {
      if (standaloneNode?.getAttribute(property) !== getComputedStyle(liveNode).getPropertyValue(property)) throw new Error('Mermaid export lost computed ' + property);
    }
    const arrow = exported.querySelector('[marker-end^="url(#"]');
    const marker = arrow?.getAttribute('marker-end').slice(5, -1);
    if (!marker || exported.getElementById(marker)?.localName !== 'marker') throw new Error('Mermaid export lost the arrowhead');
    const titleId = exported.documentElement.getAttribute('aria-labelledby');
    if (exported.getElementById(titleId)?.textContent !== 'Signal path') throw new Error('Mermaid export lost the accessible title');
    if (diagramSVG !== (await diagram.serialize())) throw new Error('Mermaid export changed between reads');
    await session.update(mermaid(false), context);
    if (diagramSVG !== (await exports.at(-1).serialize())) throw new Error('Mermaid export changed after re-rendering the same document');
    await session.update(mermaid(true), context);
    const htmlDiagram = exports.at(-1);
    if (!htmlDiagram.element.querySelector('foreignObject')) throw new Error('Expected Mermaid HTML labels');
    const rejection = await htmlDiagram.serialize().then(
      () => '',
      (error) => error.message,
    );
    if (!rejection.includes('htmlLabels: false') || !htmlDiagram.element.querySelector('foreignObject')) throw new Error('Mermaid HTML export should reject while keeping the live diagram');
    if (
      await diagram.serialize().then(
        () => true,
        () => false,
      )
    )
      throw new Error('Replaced Mermaid export remained available');
    successfulDiagnostics.push(...diagnostics.splice(0));
    for (const language of ['dot', 'graphviz']) {
      const source = ['~~~' + language + ' {width=50%}', 'digraph { A [URL="https://blocked.example/link", style=filled, fillcolor="red:blue"]; A -> B }', '~~~'].join('\n');
      await session.update(source, context);
      const handle = exports.at(-1);
      if (handle.language !== language) throw new Error('Missing Graphviz export for ' + language);
      const svg = await handle.serialize();
      const standalone = new DOMParser().parseFromString(svg, 'image/svg+xml');
      const live = handle.element.querySelector('svg');
      if (standalone.querySelector('parsererror') || standalone.documentElement.getAttribute('viewBox') !== live.getAttribute('viewBox'))
        throw new Error('Graphviz export lost its standalone viewBox');
      if (standalone.documentElement.getAttribute('role') !== 'img' || !standalone.documentElement.getAttribute('aria-label')) throw new Error('Graphviz export lost its accessible name');
      const gradient = standalone.querySelector('linearGradient');
      if (!gradient || !standalone.querySelector('[fill="url(#' + gradient.id + ')"]') || !standalone.querySelector('g.edge path'))
        throw new Error('Graphviz export lost its gradient or edge');
      if (svg.includes('blocked.example') || svg !== (await handle.serialize())) throw new Error('Graphviz export retained a URL or changed between reads');
      await session.update('Replacement', context);
      if (
        await handle.serialize().then(
          () => true,
          () => false,
        )
      )
        throw new Error('Replaced Graphviz export remained available');
    }
    const graphExports = exports.length;
    await session.update('~~~dot\ndigraph {\n~~~', context);
    if (exports.length !== graphExports || !diagnostics.some(({ code }) => code === 'extension-render-error'))
      throw new Error('Invalid DOT should report an error without publishing an export');
    diagnostics.length = 0;
    const sourceUrl = new URL('/test/markdown/extensions/vega-lite.md', location.href);
    const external = { data: { url: 'https://blocked.example/data.json' }, mark: 'point' };
    const fence = (spec) => ['~~~vega-lite', JSON.stringify(spec), '~~~'].join('\n');
    const vegaUrl = new URL('/test/markdown/extensions/vega.md', location.href);
    const vegaSource = await window.visualFixture.read('vega');
    const vegaContext = { ...context, sourceUrl: vegaUrl };
    const article = window.visualFixture.article;
    let disconnected = 0;
    await session.update(vegaSource, { ...vegaContext, observeResize: () => () => disconnected++ });
    const figure = article.querySelector('[data-markdown-label="vega-voltage"]');
    const view = figure?.querySelector('svg');
    const line = view?.querySelector('.mark-line path')?.getAttribute('d');
    if (!line?.match(/^M[^L]+L[^L]+L[^L]+$/)) throw new Error('Vega failed to load the three points from the named JSON property');
    const visual = exports.at(-1);
    const aborted = AbortSignal.abort(new DOMException('Cancelled PNG', 'AbortError'));
    if ((await rasterizeMarkdownVisual(visual, { signal: aborted }).catch((error) => error.name)) !== 'AbortError') throw new Error('PNG ignored cancellation');
    for (const scale of [0, Infinity, 1000]) {
      if ((await rasterizeMarkdownVisual(visual, { scale }).catch((error) => error.name)) !== 'RangeError') throw new Error('PNG accepted invalid dimensions');
    }
    if (visual.language !== 'vega' || visual.element !== view.closest('[data-markdown-language="vega"]')) throw new Error('Incorrect Vega export handle');
    const svg = await visual.serialize();
    if (svg !== (await visual.serialize()) || !svg.includes(line)) throw new Error('Vega export differs from the current view');
    const exportCount = exports.length;
    if (article.querySelector('[data-markdown-reference="vega-voltage"] a')?.getAttribute('href') !== '#' + figure.id) throw new Error('Vega figure reference did not resolve');
    successfulDiagnostics.push(...diagnostics.splice(0));
    await session.update(vegaSource, { ...vegaContext, resourcePolicy: { allowNetwork: false } });
    if (exports.length !== exportCount) throw new Error('A failed Vega fence published an export');
    if (
      await visual.serialize().then(
        () => true,
        () => false,
      )
    )
      throw new Error('A replaced Vega export remained usable');
    if (!diagnostics.some(({ code }) => code === 'resource-url-blocked')) throw new Error('Expected a blocked Vega data URL');
    if (view.isConnected || disconnected !== 1 || !article.querySelector('[data-markdown-language="vega"] .markdown-extension-fallback'))
      throw new Error('Vega update retained a view or lost the rejected source');
    diagnostics.length = 0;
    await session.update('~~~vega\n{\n~~~', vegaContext);
    if (!diagnostics.some(({ code, language }) => code === 'extension-render-error' && language === 'vega')) throw new Error('Expected a Vega render diagnostic');
    if (article.querySelector('.markdown-extension-fallback')?.textContent !== '{') throw new Error('Expected invalid Vega JSON to retain its source');
    diagnostics.length = 0;
    for (const locale of ['pt', 'en', 'es']) {
      for (const file of ['curvas-cientificas.md', 'tensao-vega.md']) {
        const url = new URL('/example/' + locale + '/' + file, location.href);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Cannot read scientific example ' + url.pathname);
        await session.update(await response.text(), { ...context, locale, sourceUrl: url });
        if (!article.querySelector('.mark-line path')) throw new Error('Scientific example did not render: ' + url.pathname);
      }
    }
    successfulDiagnostics.push(...diagnostics.splice(0));
    await session.update(fence(external), { ...context, sourceUrl, resourcePolicy: { allowNetwork: false } });
    if (!diagnostics.some(({ code }) => code === 'resource-url-blocked')) throw new Error('Expected a blocked Vega data URL');
    if (window.visualFixture.article.querySelector('.markdown-extension-fallback')?.textContent !== JSON.stringify(external))
      throw new Error('Expected the rejected chart to retain its source');
    diagnostics.length = 0;
    external.data.url = '../resources/values.csv';
    await session.update(fence(external), { ...context, sourceUrl, resourcePolicy: { maxResourceBytes: 1 } });
    if (!diagnostics.some(({ code }) => code === 'resource-size-limit')) throw new Error('Expected Vega data to exceed the configured limit');
    await session.update(vegaSource, vegaContext);
    const lastVisual = exports.at(-1);
    const pending = lastVisual.serialize().then(
      () => true,
      () => false,
    );
    await session.dispose();
    if (await pending) throw new Error('A pending Vega export completed after disposal');
    if (
      await lastVisual.serialize().then(
        () => true,
        () => false,
      )
    )
      throw new Error('A disposed Vega export remained usable');
    await engine.dispose();
    return successfulDiagnostics.map(({ code, message }) => ({ code, message }));
  });
  assert.equal(await circuit.count(), 0);
  assert.deepEqual(diagnostics, []);
  assert.deepEqual(errors, []);

  const deferredPage = await browser.newPage({ viewport: { width: 960, height: 720 } });
  await deferredPage.goto(server.url + '/test/browser/visual-fixtures.html');
  await deferredPage.evaluate(async () => {
    const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
    const engine = createEducationalMarkdownEngine({ features: ['vega', 'vega-lite'], securityMode: 'trusted' });
    const article = document.body.appendChild(document.createElement('article'));
    const gap = '<div style="height:1600px"></div>';
    const specs = {
      vega: { width: 100, height: 50, marks: [] },
      'vega-lite': { width: 100, height: 50, data: { values: [{ x: 1, y: 2 }] }, mark: 'point', encoding: { x: { field: 'x', type: 'quantitative' } } },
    };
    const source = Array.from({ length: 12 }, (_, index) => {
      const language = index % 2 ? 'vega' : 'vega-lite';
      return ['~~~' + language, JSON.stringify(specs[language]), '~~~', '', gap, ''].join('\n');
    }).join('\n');
    const counts = { observed: 0, disconnected: 0 };
    const session = await engine.renderDocument(source, article, {
      renderMode: 'visible',
      observeResize() {
        counts.observed++;
        return () => counts.disconnected++;
      },
    });
    window.deferredFixture = { engine, session, counts };
  });
  const fences = deferredPage.locator('[data-markdown-language]');
  assert.equal(await fences.count(), 12);
  await fences.first().locator('svg').waitFor({ state: 'attached' });
  assert.equal(await fences.last().locator('svg').count(), 0);
  await fences.last().scrollIntoViewIfNeeded();
  await fences.last().locator('svg').waitFor({ state: 'attached' });
  const lifecycle = await deferredPage.evaluate(async () => {
    const { engine, session, counts } = window.deferredFixture;
    await session.update('Replacement');
    await session.dispose();
    await engine.dispose();
    return counts;
  });
  assert.equal(await fences.count(), 0);
  assert.ok(lifecycle.observed >= 2 && lifecycle.observed < 12);
  assert.equal(lifecycle.disconnected, lifecycle.observed);
  await deferredPage.close();

  const missingPage = await browser.newPage();
  let blockedChunks = 0;
  await missingPage.route('**/chunks/markdown-vega-lite.*.js', async (route) => {
    blockedChunks++;
    await route.abort('failed');
  });
  await missingPage.goto(server.url + '/test/browser/visual-fixtures.html');
  const unavailable = await missingPage.evaluate(async () => {
    const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
    const engine = createEducationalMarkdownEngine({ features: ['vega'], allowedCapabilities: ['interactive', 'network'] });
    const article = document.body.appendChild(document.createElement('article'));
    const source = '{"width":100,"height":50,"marks":[]}';
    const diagnostics = [];
    try {
      await engine.renderDocument(['~~~vega', source, '~~~'].join('\n'), article, { onDiagnostic: ({ code }) => diagnostics.push(code) });
      return { fallback: article.querySelector('.markdown-extension-fallback')?.textContent, source, diagnostics };
    } finally {
      await engine.dispose();
    }
  });
  assert.ok(blockedChunks > 0);
  assert.equal(unavailable.fallback, unavailable.source);
  assert.deepEqual(unavailable.diagnostics, ['extension-render-error']);
  await missingPage.close();
  console.log('Visual fixtures passed in Chromium');
} finally {
  try {
    await browser?.close();
  } finally {
    await server.close();
  }
}
