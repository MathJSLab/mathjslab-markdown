import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production HDL and all translated register/logic examples render locally', async () => {
  const dom = new JSDOM('<!doctype html>');
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    engine = createEducationalMarkdownEngine({ features: ['wavedrom'], allowedCapabilities: [] });
    for (const lang of ['pt', 'en', 'es']) {
      for (const lesson of ['codigo-hdl', 'registradores-digitais', 'expressoes-logicas']) {
        const source = readFileSync(new URL(`../../example/${lang}/${lesson}.md`, import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics = [];
        const session = await engine.renderDocument(source, container, { theme: 'dark', resourcePolicy: { allowNetwork: false }, onDiagnostic: (d) => diagnostics.push(d) });
        assert.deepEqual(diagnostics, [], `${lang}/${lesson}`);
        if (lesson === 'codigo-hdl') {
          assert.equal(container.querySelectorAll('code.hljs').length, 8);
          assert.ok(container.querySelector('code.language-vhdl .hljs-keyword'));
          assert.ok(container.querySelector('code.language-verilog .hljs-keyword'));
        } else {
          assert.equal(container.querySelectorAll('svg.WaveDrom').length, 4);
          for (const svg of container.querySelectorAll('svg.WaveDrom')) {
            assert.match(svg.getAttribute('aria-label'), /register|logic/);
            assert.ok(svg.querySelector('text'));
            assert.ok(svg.querySelector('style').textContent.includes('#' + svg.id));
          }
          if (lesson === 'expressoes-logicas') {
            assert.match(container.querySelector('.wire').getAttribute('style'), /stroke:#eee/);
            assert.match(container.querySelector('.siglabel').getAttribute('style'), /fill:#333/);
            assert.match(container.querySelector('svg text').getAttribute('style'), /fill:#eee/);
          }
        }
        await session.dispose();
        assert.equal(container.querySelector('svg'), null);
      }
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
