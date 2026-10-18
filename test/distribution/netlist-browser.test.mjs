import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production netlist diagrams render all translated lessons locally', async () => {
  const dom = new JSDOM('<!doctype html>');
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    engine = createEducationalMarkdownEngine({ features: ['netlist'], allowedCapabilities: [] });
    for (const lang of ['pt', 'en', 'es']) {
      for (const lesson of ['porta-and-netlist', 'multiplexador-netlist', 'somador-netlist', 'registrador-netlist']) {
        const source = readFileSync(new URL(`../../example/${lang}/${lesson}.md`, import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics = [];
        const artifacts = [];
        const session = await engine.renderDocument(source, container, {
          onHDLExport: (artifact) => artifacts.push(artifact),
          theme: 'dark',
          resourcePolicy: { allowNetwork: false },
          onDiagnostic: (d) => diagnostics.push(d),
        });
        assert.deepEqual(diagnostics, [], `${lang}/${lesson}`);
        assert.equal(container.querySelectorAll('svg').length, 1);
        const svg = container.querySelector('svg');
        assert.match(svg.getAttribute('aria-label'), /Netlist schematic:/);
        assert.ok(svg.querySelector('text'));
        assert.ok(svg.querySelector('style').textContent.includes('#' + svg.id));
        assert.match(svg.getAttribute('style'), /background/);
        container.querySelector('[data-hdl-export=json]').click();
        container.querySelector('[data-hdl-export=svg]').click();
        assert.equal(artifacts.length, 2);
        assert.equal(artifacts[0].filename, 'netlist.json');
        assert.ok(JSON.parse(artifacts[0].text));
        assert.ok(artifacts[1].text.includes('xmlns="http://www.w3.org/2000/svg"'));
        assert.ok(!artifacts[1].text.includes('<script'));
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
