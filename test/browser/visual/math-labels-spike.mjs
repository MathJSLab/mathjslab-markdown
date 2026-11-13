import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { serveStatic } from '../../hdl-browser/static-server.mjs';

const server = await serveStatic();
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 620 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(server.url + '/test/browser/visual-fixtures.html');
  const result = await page.evaluate(async () => {
    const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
    const { vegaLiteExtension } = await import('/dist/browser/extensions.js');
    const ns = 'http://www.w3.org/2000/svg';
    const labels = [
      ['I_{D_1}', 'I D one'],
      ['I_{D_2}', 'I D two'],
      ['V_{DF_1}', 'V D F one'],
      ['V_{DF_2}', 'V D F two'],
      ['\\alpha', 'alpha'],
      ['\\beta', 'beta'],
      ['\\Omega', 'omega'],
      ['\\frac{1}{2}', 'one half'],
      ['\\frac{\\alpha}{\\beta}', 'alpha over beta'],
    ].map(([tex, name], index) => ({ tex, name, key: 'math-label-' + index }));
    // These formulas are fixture constants. No text from the chart enters MathJax.
    const vega = vegaLiteExtension();
    const fence = vega.fences[0];
    const states = new Map();
    let nextNamespace = 0;
    let beforeConvert = async () => {};
    let conversions = 0;
    const engine = createEducationalMarkdownEngine({
      allowedCapabilities: ['interactive', 'network'],
      extensions: [
        {
          ...vega,
          fences: [
            {
              ...fence,
              async render(element, source, context) {
                await fence.render(element, source, context);
                if (!element.querySelector('svg') || context.signal.aborted) return;
                const namespace = 'spike-' + ++nextNamespace;
                const fragments = [];
                for (const [index, label] of labels.entries()) {
                  await beforeConvert();
                  if (context.signal.aborted) return;
                  conversions++;
                  const output = await MathJax.tex2svgPromise(label.tex, { display: false });
                  if (context.signal.aborted) return;
                  const fragment = output.querySelector('svg');
                  if (!fragment?.querySelector('path, use') || fragment.querySelector('[data-mjx-error]')) throw new Error('MathJax conversion failed');
                  const ids = new Map();
                  for (const definition of fragment.querySelectorAll('[id]')) {
                    const id = namespace + '-' + index + '-' + ids.size;
                    ids.set(definition.id, id);
                    definition.id = id;
                  }
                  for (const use of fragment.querySelectorAll('use')) {
                    const key = use.getAttribute('href') ?? use.getAttribute('xlink:href');
                    const id = key?.startsWith('#') && ids.get(key.slice(1));
                    if (!id) throw new Error('MathJax glyph is not self-contained: ' + key);
                    use.removeAttribute('xlink:href');
                    use.setAttribute('href', '#' + id);
                  }
                  const [, top, width, height] = fragment.getAttribute('viewBox').split(/\s+/).map(Number);
                  // MathJax viewBox units are thousandths of an em, with y=0 at the baseline.
                  fragment.setAttribute('x', String(-width * 0.007));
                  fragment.setAttribute('y', String(top * 0.014));
                  fragment.setAttribute('width', String(width * 0.014));
                  fragment.setAttribute('height', String(height * 0.014));
                  fragment.removeAttribute('style');
                  fragment.removeAttribute('focusable');
                  fragment.setAttribute('aria-hidden', 'true');
                  fragments.push(fragment);
                }
                const compose = (svg) => {
                  const anchors = new Map(Array.from(svg.querySelectorAll('.mark-text text'), (node) => [node.textContent, node]));
                  for (const [index, { key, name }] of labels.entries()) {
                    const anchor = anchors.get(key);
                    if (!anchor) throw new Error('Missing Vega anchor ' + key);
                    const annotation = document.createElementNS(ns, 'g');
                    annotation.setAttribute('data-spike-math', key);
                    annotation.setAttribute('transform', anchor.getAttribute('transform') ?? '');
                    annotation.setAttribute('color', context.theme === 'dark' ? '#f4f4f4' : '#202020');
                    annotation.setAttribute('role', 'img');
                    annotation.setAttribute('aria-label', name);
                    annotation.append(fragments[index].cloneNode(true));
                    svg.querySelector('[data-spike-math="' + key + '"]')?.remove();
                    anchor.after(annotation);
                    anchor.setAttribute('aria-hidden', 'true');
                  }
                };
                const observer = new MutationObserver(() => {
                  observer.disconnect();
                  if (!context.signal.aborted) refresh();
                });
                const refresh = () => {
                  compose(element.querySelector('svg'));
                  observer.observe(element, { attributes: true, attributeFilter: ['transform', 'width'], childList: true, subtree: true });
                };
                states.set(element, { compose, observer });
                refresh();
              },
              async dispose(element) {
                states.get(element)?.observer.disconnect();
                states.delete(element);
                await fence.dispose(element);
              },
              exportSVG(element) {
                const state = states.get(element);
                if (!state) return undefined;
                return fence.exportSVG(element).then((source) => {
                  const template = document.createElement('template');
                  template.innerHTML = source;
                  state.compose(template.content.firstElementChild);
                  return template.innerHTML;
                });
              },
            },
          ],
        },
      ],
    });

    const fixture = await (await fetch('/test/browser/visual/math-labels.md')).text();
    const createArticle = () => {
      const host = document.body.appendChild(document.createElement('div'));
      const article = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('article'));
      article.style.width = '560px';
      return article;
    };
    const check = (condition, message) => {
      if (!condition) throw new Error(message);
    };
    const nextFrame = () => new Promise(requestAnimationFrame);
    const liveLabels = (root) => [...root.querySelectorAll('[data-spike-math]')];
    try {
      const article = createArticle();
      // Bootstrap the package's real MathJax runtime with ordinary Markdown.
      const session = await engine.renderDocument('A formula $x$.', article);
      check(article.querySelector('mjx-container svg'), 'Markdown MathJax did not initialize');
      let visual;
      const context = {
        onVisualExport: (value) => {
          visual = value;
        },
        theme: 'light',
      };
      await session.update(fixture, context);
      const annotations = liveLabels(article);
      check(annotations.length === labels.length, 'Incomplete math annotations');
      check(
        annotations.every((node, i) => node.getAttribute('aria-label') === labels[i].name),
        'Missing accessible label names',
      );
      check(
        annotations.every((node) => node.querySelector('svg').getAttribute('y').startsWith('-')),
        'Missing baseline offset',
      );
      check(article.textContent.includes('$untrusted_data$'), 'Ordinary data was unexpectedly interpreted');
      check(conversions === labels.length, 'Only explicitly selected labels may be converted');
      const light = getComputedStyle(annotations[0]).color;
      const anchor = annotations[0].getAttribute('transform');
      article.style.width = '340px';
      for (let frame = 0; frame < 60 && liveLabels(article)[0]?.getAttribute('transform') === anchor; frame++) await nextFrame();
      check(liveLabels(article)[0]?.getAttribute('transform') !== anchor, 'Annotations did not move with chart resize');
      check(conversions === labels.length, 'Resize triggered redundant typesetting');
      const first = await visual.serialize();
      check(first === (await visual.serialize()), 'Export is not deterministic');
      const exported = new DOMParser().parseFromString(first, 'image/svg+xml');
      check(!exported.querySelector('parsererror'), 'Export is not standalone SVG');
      const exportedLabels = [...exported.querySelectorAll('g[aria-label] > svg')];
      check(exportedLabels.length === labels.length, 'Export lost math annotations');
      check(
        exportedLabels.every((svg, index) => svg.parentElement.getAttribute('aria-label') === labels[index].name),
        'Export lost math label names',
      );
      const retainsImageRole = exportedLabels.every((svg) => svg.parentElement.getAttribute('role') === 'img');
      for (const use of exported.querySelectorAll('use')) {
        const href = use.getAttribute('href');
        check(href?.startsWith('#') && exported.getElementById(href.slice(1)), 'Export has a broken glyph reference');
      }
      const darkArticle = createArticle();
      const dark = await engine.renderDocument(fixture, darkArticle, { theme: 'dark' });
      check(getComputedStyle(liveLabels(darkArticle)[0]).color !== light, 'Dark theme did not change math foreground');
      const ids = [...article.querySelectorAll('[data-spike-math] [id]'), ...darkArticle.querySelectorAll('[data-spike-math] [id]')].map((node) => node.id);
      check(ids.length === new Set(ids).size, 'Glyph IDs collide across Shadow DOM charts');
      await dark.dispose();
      check(liveLabels(darkArticle).length === 0, 'Dark chart retained annotations');

      let release;
      let started;
      const waiting = new Promise((resolve) => {
        started = resolve;
      });
      beforeConvert = () =>
        new Promise((resolve) => {
          release = resolve;
          started();
        });
      const obsolete = session.update(fixture, context);
      await waiting;
      const replacement = session.update('Replacement');
      release();
      await Promise.all([obsolete, replacement]);
      check(liveLabels(article).length === 0 && !article.querySelector('svg'), 'Cancelled labels were published');
      check(states.size === 0, 'An annotation observer survived teardown');
      await session.dispose();
      return { annotations: labels.length, conversions, exportBytes: first.length, retainsImageRole };
    } finally {
      await engine.dispose();
    }
  });
  assert.deepEqual(errors, []);
  console.log('Math labels spike passed:', result);
} finally {
  try {
    await browser?.close();
  } finally {
    await server.close();
  }
}
