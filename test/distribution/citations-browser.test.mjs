import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production browser citations render all twelve translated examples without metadata requests', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://examples.test/' });
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'XMLHttpRequest']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw new Error('Embedded bibliography must not fetch metadata');
  };
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    engine = createEducationalMarkdownEngine({ features: ['citations'] });
    const files = {
      'citacoes-e-bibliografia': 2,
      'citacoes-numericas': 2,
      'catalogo-bibliografico': 3,
      'paginas-e-desambiguacao': 2,
    };
    for (const [language, locale] of [
      ['pt', 'pt-BR'],
      ['en', 'en-US'],
      ['es', 'es-ES'],
    ]) {
      for (const [name, expectedEntries] of Object.entries(files)) {
        const filename = `${language}/${name}`;
        const source = readFileSync(new URL(`../../example/${filename}.md`, import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics = [];
        const session = await engine.renderDocument(source, container, { locale, onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
        assert.deepEqual(diagnostics, [], filename);
        assert.equal(container.querySelectorAll('.markdown-bibliography-entry').length, expectedEntries, filename);
        assert.equal(container.querySelector('[role="alert"], .markdown-extension-fallback, .markdown-citation-unresolved'), null, filename);
        const citations = Array.from(container.querySelectorAll('[data-markdown-citation]'), (node) => node.textContent);
        if (name === 'citacoes-numericas') assert.deepEqual(citations, ['(1)', '(2)', '(1)'], filename);
        if (name === 'paginas-e-desambiguacao') {
          assert.match(citations[0], /2024a.*12/, filename);
          assert.match(citations[1], /2024b.*20/, filename);
        }
        await session.dispose();
      }
    }
    assert.equal(requests, 0);
  } finally {
    await engine?.dispose();
    globalThis.fetch = originalFetch;
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
    dom.window.close();
  }
});
