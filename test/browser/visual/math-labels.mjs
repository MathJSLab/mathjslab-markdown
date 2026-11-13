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
    const engine = createEducationalMarkdownEngine({
      allowedCapabilities: ['interactive', 'network'],
      features: ['vega-lite', 'vega'],
    });
    const vegaMathLabels = Object.fromEntries(labels.map(({ key, tex, name }) => [key, { tex, accessibleName: name }]));
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
    const liveLabels = (root) => [...root.querySelectorAll('[data-markdown-math-label]')];
    try {
      const article = createArticle();
      const session = await engine.renderDocument(fixture, article);
      check(liveLabels(article).length === 0 && article.textContent.includes('math-label-0'), 'Opt-in fallback was lost');
      let visual;
      const context = {
        onVisualExport: (value) => {
          visual = value;
        },
        theme: 'light',
        vegaMathLabels,
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
      const light = getComputedStyle(annotations[0]).color;
      const anchor = annotations[0].getAttribute('transform');
      article.style.width = '340px';
      for (let frame = 0; frame < 60 && liveLabels(article)[0]?.getAttribute('transform') === anchor; frame++) await nextFrame();
      const resized = liveLabels(article)[0]?.getAttribute('transform');
      check(resized && resized !== anchor, 'Annotations did not move with chart resize: ' + JSON.stringify({ anchor, resized, width: article.querySelector('svg')?.getAttribute('width') }));
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
      // Retain independent copies so Chromium can expose their accessibility
      // trees after the renderer has released both document sessions.
      const liveHost = document.body.appendChild(document.createElement('div'));
      liveHost.id = 'live-math-accessibility';
      liveHost.attachShadow({ mode: 'open' }).append(article.querySelector('svg').cloneNode(true));
      const exportHost = document.body.appendChild(document.createElement('div'));
      exportHost.id = 'exported-math-accessibility';
      exportHost.append(document.importNode(exported.documentElement, true));
      for (const use of exported.querySelectorAll('use')) {
        const href = use.getAttribute('href');
        check(href?.startsWith('#') && exported.getElementById(href.slice(1)), 'Export has a broken glyph reference');
      }
      const darkArticle = createArticle();
      const dark = await engine.renderDocument(fixture, darkArticle, { theme: 'dark', vegaMathLabels });
      check(getComputedStyle(liveLabels(darkArticle)[0]).color !== light, 'Dark theme did not change math foreground');
      const ids = [...article.querySelectorAll('[data-markdown-math-label] [id]'), ...darkArticle.querySelectorAll('[data-markdown-math-label] [id]')].map((node) => node.id);
      check(ids.length === new Set(ids).size, 'Glyph IDs collide across Shadow DOM charts');
      await dark.dispose();
      check(liveLabels(darkArticle).length === 0, 'Dark chart retained annotations');

      check(retainsImageRole, 'Export lost the image role');
      const stale = visual;
      const vegaSpec = {
        width: 150,
        height: 60,
        marks: [
          {
            name: 'markdown_math',
            type: 'text',
            encode: { enter: { x: { value: 70 }, y: { value: 30 }, text: { value: 'math-label-0' } } },
          },
        ],
      };
      await session.update(['~~~vega', JSON.stringify(vegaSpec), '~~~'].join('\n'), context);
      check(liveLabels(article).length === 1 && visual.language === 'vega', 'Full Vega annotation did not render');
      const mathJax = globalThis.MathJax;
      const convert = mathJax.tex2svgPromise;
      let started;
      let release;
      const conversionStarted = new Promise((resolve) => {
        started = resolve;
      });
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      mathJax.tex2svgPromise = async (...args) => {
        started();
        await gate;
        return convert.apply(mathJax, args);
      };
      try {
        const obsolete = session.update(fixture, context);
        await conversionStarted;
        const replacement = session.update('Replacement');
        release();
        await Promise.all([obsolete, replacement]);
      } finally {
        mathJax.tex2svgPromise = convert;
      }
      check(liveLabels(article).length === 0, 'Replacement retained labels');
      check(
        await stale.serialize().then(
          () => false,
          () => true,
        ),
        'Replacement retained its export',
      );
      await session.dispose();
      return { names: labels.map(({ name }) => name), exportBytes: first.length, retainsImageRole };
    } finally {
      await engine.dispose();
    }
  });
  const cdp = await page.context().newCDPSession(page);
  try {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    for (const name of result.names) {
      const matches = nodes.filter((node) => !node.ignored && node.role?.value === 'image' && node.name?.value === name);
      assert.equal(matches.length, 2, `Expected one accessible image named "${name}" in each SVG`);
    }
    assert.ok(!nodes.some((node) => !node.ignored && /^math-label-\d+$/.test(node.name?.value ?? '')), 'Fallback annotation keys leaked into the accessibility tree');
  } finally {
    await cdp.detach();
  }
  assert.deepEqual(errors, []);
  console.log('Math labels integration passed:', result);
} finally {
  try {
    await browser?.close();
  } finally {
    await server.close();
  }
}
