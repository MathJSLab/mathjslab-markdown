import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production VCD viewer renders all twelve translated recordings and updates cursor/window values', async () => {
  const dom = new JSDOM('<!doctype html>');
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    const { parseVCD, vcdValueAt, exportVCDCSV, hdlExtension, hdlManifest } = await import('../../dist/browser/extensions.js');
    engine = createEducationalMarkdownEngine({ features: ['vcd'], securityMode: 'strict', allowedCapabilities: [] });
    for (const lang of ['pt', 'en', 'es'])
      for (const lesson of ['vcd-porta-and', 'vcd-contador', 'vcd-barramento', 'vcd-handshake']) {
        const source = readFileSync(new URL(`../../example/${lang}/${lesson}.md`, import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics = [];
        const artifacts = [];
        const session = await engine.renderDocument(source, container, {
          onHDLExport: (artifact) => artifacts.push(artifact),
          locale: lang,
          theme: 'dark',
          resourcePolicy: { allowNetwork: false },
          onDiagnostic: (d) => diagnostics.push(d),
        });
        assert.deepEqual(diagnostics, [], `${lang}/${lesson}`);
        assert.equal(container.querySelectorAll('svg').length, 1);
        const cursor = container.querySelectorAll('input[type=number]')[2];
        const start = container.querySelectorAll('input[type=number]')[0];
        start.value = '10';
        start.dispatchEvent(new dom.window.Event('change'));
        assert.equal(cursor.value, '10');
        start.value = '0';
        start.dispatchEvent(new dom.window.Event('change'));
        cursor.value = '25';
        cursor.dispatchEvent(new dom.window.Event('change'));
        assert.equal(container.querySelector('[data-vcd-cursor]').getAttribute('data-vcd-cursor'), '25');
        if (lesson === 'vcd-contador') assert.ok(container.querySelector('.vcd-values').textContent.includes('0x2'));
        const recorded = source.match(/```vcd[^\n]*\n([\s\S]*?)\n```/)[1];
        const model = parseVCD(recorded);
        assert.equal(model.endTime, 40);
        assert.equal(vcdValueAt(model.signals[0], 0).length, model.signals[0].width);
        const cursorB = container.querySelectorAll('input[type=number]')[3];
        cursorB.value = '30';
        cursorB.dispatchEvent(new dom.window.Event('change'));
        assert.ok(container.querySelector('.vcd-measurement').textContent.includes('5 ticks'));
        for (const format of ['vcd', 'csv', 'svg']) container.querySelector(`[data-hdl-export=${format}]`).click();
        assert.equal(artifacts.length, 3);
        assert.equal(artifacts[0].text.trimEnd(), recorded.trimEnd());
        assert.equal(artifacts[1].text, exportVCDCSV(recorded));
        assert.ok(artifacts[2].text.includes('data-vcd-cursor-b="30"'));
        assert.ok(!artifacts[2].text.includes('object-fit'));
        await session.dispose();
        assert.equal(container.querySelector('svg'), null);
      }
    await engine.dispose();
    const recording = readFileSync(new URL('../markdown/extensions/vcd.md', import.meta.url), 'utf8').match(/```vcd\n([\s\S]*?)\n```/)[1];
    let disposed = 0;
    engine = createEducationalMarkdownEngine({
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: () => ({ status: 'success', vcd: recording }),
            dispose: () => {
              disposed++;
            },
          }),
        }),
      ],
      securityMode: 'strict',
      executionPolicy: { hdl: { enabled: true, allowInRestrictedMode: true } },
    });
    assert.ok(hdlManifest.styles.includes('.vcd-viewer'));
    const host = document.createElement('div');
    const diagnostics = [];
    const request = { operation: 'simulate', top: 'tb', files: [{ name: 'tb.v', source: 'module tb; endmodule' }] };
    const session = await engine.renderDocument('```verilog-run {width=50% height=12rem}\n' + JSON.stringify(request) + '\n```', host, { onDiagnostic: (d) => diagnostics.push(d) });
    assert.deepEqual(diagnostics, []);
    assert.equal(disposed, 1);
    assert.equal(host.querySelector('.vcd-viewer').style.width, '100%');
    const cursor = host.querySelectorAll('input[type=number]')[2];
    cursor.value = '25';
    cursor.dispatchEvent(new dom.window.Event('change'));
    assert.equal(host.querySelector('svg').style.height, '12rem');
    assert.equal(host.querySelector('[data-vcd-cursor]').getAttribute('data-vcd-cursor'), '25');
    await session.dispose();
    assert.equal(host.querySelector('svg'), null);
  } finally {
    await engine?.dispose();
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
