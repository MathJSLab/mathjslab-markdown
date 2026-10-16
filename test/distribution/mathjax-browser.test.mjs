import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production MathJax renders translated pendulum lessons with bundled dynamic glyphs', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://examples.test/' });
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'localStorage', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'XMLHttpRequest', 'MathJax']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  // Match the browser's single global object for UMD components and ESM hosts.
  Object.defineProperty(dom.window, 'MathJax', {
    configurable: true,
    get: () => globalThis.MathJax,
    set: (value) => {
      globalThis.MathJax = value;
    },
  });
  let engine;
  try {
    const { MarkdownEngine } = await import('../../dist/browser/core.js');
    engine = new MarkdownEngine();
    for (const locale of ['pt', 'en', 'es']) {
      const source = readFileSync(new URL(`../../example/${locale}/pendulo-simples.md`, import.meta.url), 'utf8');
      const container = document.createElement('div');
      document.body.append(container);
      const session = await engine.renderDocument(source, container);
      assert.equal(container.querySelector('.mathjax-error, mjx-merror'), null, locale);
      assert.ok(container.querySelectorAll('mjx-container').length >= 7, locale);
      assert.ok(container.querySelector('mjx-container svg path'), locale);
      await session.dispose();
      container.remove();
    }
  } finally {
    await engine?.dispose();
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
