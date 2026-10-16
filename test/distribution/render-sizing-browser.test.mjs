import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production sizing preserves inline chemistry and fits SVG graphics', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://examples.test/' });
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'SVGElement', 'SVGSVGElement', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({ measureText: (value) => ({ width: value.length * 6 }) });
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    engine = createEducationalMarkdownEngine({ features: ['smiles', 'graphviz'], renderSizing: { defaults: { display: 'block' }, extensions: { graphviz: { height: '8rem' } } } });
    const container = document.createElement('div');
    document.body.append(container);
    const diagnostics = [];
    await engine.renderDocument('Ethanol :smiles[CCO]{height=2rem} in a sentence.\n\n`' + ':smiles[CCO]`\n\n```smiles\nO\n```\n\n```dot {width=50%}\ndigraph {A -> B}\n```', container, {
      onDiagnostic: (d) => diagnostics.push(d),
    });
    assert.deepEqual(diagnostics, []);
    const inline = container.querySelector('p > span.smiles');
    assert.ok(inline?.querySelector('svg'));
    assert.equal(inline.style.display, 'inline-block');
    assert.equal(inline.querySelector('svg').style.height, '2rem');
    assert.equal(container.querySelector('code').textContent, ':smiles[CCO]');
    const natural = container.querySelector('div.smiles svg');
    assert.match(natural.style.width, /px$/);
    const coordinates = natural
      .getAttribute('viewBox')
      .split(/[\s,]+/)
      .map(Number);
    assert.ok(Math.abs(parseFloat(natural.style.width) - coordinates[2] * 1.75) < 0.001);
    const graph = container.querySelector('[data-markdown-language="dot"]');
    assert.equal(graph.style.width, '50%');
    assert.equal(graph.querySelector('svg').style.height, '8rem');
    assert.equal(graph.querySelector('svg').getAttribute('preserveAspectRatio'), 'xMidYMid meet');
  } finally {
    await engine?.dispose();
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
