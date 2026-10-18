import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Worker } from 'node:worker_threads';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production HDL host contract transports all translated requests through a real Worker and renders recorded visual outputs', async () => {
  const dom = new JSDOM('<!doctype html>');
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  const active = new Set();
  const calls = [];
  const netlist = JSON.parse(
    readFileSync(new URL('../markdown/extensions/netlist.md', import.meta.url), 'utf8')
      .replace(/^```netlist\n/, '')
      .replace(/\n```\s*$/, ''),
  );
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    const { hdlExtension, hdlManifest } = await import('../../dist/browser/extensions.js');
    assert.equal(hdlManifest.name, 'hdl');
    const executor = {
      createSession(context) {
        const worker = new Worker(new URL('./fixtures/hdl-contract.worker.mjs', import.meta.url));
        active.add(worker);
        let rejectJob;
        const stop = () => {
          rejectJob?.(new Error('Cancelled'));
          void worker.terminate();
        };
        context.signal.addEventListener('abort', stop, { once: true });
        return {
          execute(request) {
            calls.push(request);
            return new Promise((resolve, reject) => {
              rejectJob = reject;
              worker.once('message', resolve);
              worker.once('error', reject);
              worker.postMessage({
                request,
                result:
                  request.operation === 'simulate'
                    ? {
                        status: 'success',
                        waveform: {
                          signal: [
                            { name: 'clock', wave: 'p...' },
                            { name: 'value', wave: '01..' },
                          ],
                        },
                      }
                    : { status: 'success', netlist },
              });
            });
          },
          async dispose() {
            context.signal.removeEventListener('abort', stop);
            await worker.terminate();
            active.delete(worker);
          },
        };
      },
    };
    engine = createEducationalMarkdownEngine({
      extensions: [hdlExtension(executor)],
      securityMode: 'strict',
      allowedCapabilities: [],
      executionPolicy: { hdl: { enabled: true, allowInRestrictedMode: true } },
    });
    for (const lang of ['pt', 'en', 'es']) {
      for (const lesson of ['hdl-porta-and', 'hdl-multiplexador', 'hdl-somador', 'hdl-contador']) {
        const source = readFileSync(new URL(`../../example/${lang}/${lesson}.md`, import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics = [];
        const session = await engine.renderDocument(source, container, { resourcePolicy: { allowNetwork: false }, onDiagnostic: (d) => diagnostics.push(d) });
        assert.deepEqual(diagnostics, [], `${lang}/${lesson}`);
        assert.equal(container.querySelectorAll('svg').length, 2);
        assert.equal(container.querySelectorAll('.hdl-logs').length, 2);
        for (const visual of container.querySelectorAll('.wavedrom, .netlist')) assert.equal(visual.style.width, '100%');
        assert.equal(active.size, 0);
        await session.dispose();
        assert.equal(container.querySelector('svg'), null);
      }
    }
    assert.equal(calls.length, 24);
    assert.deepEqual(new Set(calls.map((request) => request.language)), new Set(['vhdl', 'verilog']));
    assert.deepEqual(new Set(calls.map((request) => request.operation)), new Set(['simulate', 'synthesize']));
  } finally {
    await engine?.dispose();
    await Promise.all([...active].map((worker) => worker.terminate()));
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
