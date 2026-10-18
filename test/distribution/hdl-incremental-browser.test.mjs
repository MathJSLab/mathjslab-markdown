import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { createHDLHTTPHandler } from '../../dist/source/markdown-hdl-node.js';

test('production browser consumes HTTP updates, previews VCD in Shadow DOM and commits only the final result', async () => {
  const dom = new JSDOM('<!doctype html>'),
    originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'Element', 'Node', 'DOMParser', 'Event']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  let finish,
    engine,
    disposals = 0;
  const gate = new Promise((resolve) => {
    finish = resolve;
  });
  const vcd = '$timescale 1 ns $end\n$scope module tb $end\n$var wire 1 ! y $end\n$upscope $end\n$enddefinitions $end\n$dumpvars\n0!\n$end\n#5\n1!\n';
  const token = 'a'.repeat(64);
  const handler = createHDLHTTPHandler(
    {
      createSession: () => ({
        execute: async (_request, context) => {
          context.onHDLUpdate?.({ type: 'progress', phase: 'simulate' });
          context.onHDLUpdate?.({ type: 'log', text: 'átomo 🎵' });
          context.onHDLUpdate?.({ type: 'vcd', text: vcd });
          await gate;
          return { status: 'success', vcd, logs: 'completed' };
        },
        dispose: () => {
          disposals++;
        },
      }),
    },
    { token, allowedOrigins: [] },
  );
  const server = createServer((request, response) => {
    void handler.handle(request, response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const { MarkdownEngine } = await import('../../dist/browser/core.js');
    const { hdlExtension } = await import('../../dist/browser/extensions.js');
    const { createHTTPHDLExecutor } = await import('../../dist/browser/hdl.js');
    engine = new MarkdownEngine({
      extensions: [hdlExtension(createHTTPHDLExecutor({ endpoint: `http://127.0.0.1:${server.address().port}/hdl`, token }))],
      executionPolicy: { hdl: { enabled: true } },
    });
    const host = document.createElement('div'),
      shadow = host.attachShadow({ mode: 'open' }),
      container = document.createElement('div');
    shadow.append(container);
    const events = [],
      diagnostics = [];
    const rendering = engine.renderDocument(
      '```verilog-run\n' + JSON.stringify({ operation: 'simulate', top: 'tb', files: [{ name: 'tb.v', source: 'module tb;endmodule' }] }) + '\n```',
      container,
      { locale: 'pt', onHDLUpdate: (event) => events.push(event), onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) },
    );
    for (let i = 0; i < 400 && !container.querySelector('.hdl-incremental-vcd svg'); i++) await new Promise((resolve) => setTimeout(resolve, 5));
    assert.ok(container.querySelector('.hdl-incremental-vcd svg'));
    assert.equal(container.querySelector('.hdl-exports'), null);
    assert.equal(container.querySelector('.hdl-logs').textContent, 'átomo 🎵');
    assert.equal(container.querySelector('.hdl-progress').textContent, 'Simulando');
    assert.equal(disposals, 0);
    const cursor = container.querySelectorAll('input[type=number]')[2];
    cursor.value = '3';
    cursor.dispatchEvent(new dom.window.Event('input'));
    const cursorB = container.querySelectorAll('input[type=number]')[3];
    cursorB.value = '4';
    cursorB.dispatchEvent(new dom.window.Event('change'));
    const search = container.querySelector('input[type=search]');
    search.value = 'absent';
    search.dispatchEvent(new dom.window.Event('input'));
    finish();
    const session = await rendering;
    assert.deepEqual(diagnostics, []);
    assert.equal(events.length, 3);
    assert.equal(disposals, 1);
    assert.equal(container.querySelectorAll('input[type=number]')[2].value, '3');
    assert.equal(container.querySelectorAll('input[type=number]')[3].value, '4');
    assert.equal(container.querySelector('input[type=search]').value, 'absent');
    assert.ok([...container.querySelectorAll('.vcd-signals label')].every((label) => label.hidden));
    assert.equal(container.querySelector('.hdl-incremental-vcd'), null);
    assert.ok(container.querySelector('.vcd-viewer svg'));
    assert.equal(container.querySelector('.hdl-logs').textContent, 'completed');
    await session.dispose();
  } finally {
    finish();
    await engine?.dispose();
    await handler.dispose();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
