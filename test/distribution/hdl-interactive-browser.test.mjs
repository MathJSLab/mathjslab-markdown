import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Worker } from 'node:worker_threads';
import test from 'node:test';
import { JSDOM } from 'jsdom';
const wait = async (condition) => {
  for (let i = 0; i < 400 && !condition(); i++) await new Promise((r) => setTimeout(r, 5));
  assert.ok(condition());
};
test('production interactive HDL runs all translated designs through stateful Workers and releases sessions', async () => {
  const dom = new JSDOM('<!doctype html>');
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  const active = new Set();
  let created = 0;
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    const { hdlInteractiveExtension } = await import('../../dist/browser/extensions.js');
    const adapter = {
      async createInteractiveSession(request, context) {
        assert.equal(Object.hasOwn(request, 'stimuli'), false);
        assert.equal(Object.hasOwn(request, 'checks'), false);
        const worker = new Worker(new URL('./fixtures/hdl-interactive.worker.mjs', import.meta.url));
        active.add(worker);
        created++;
        let rejectPending;
        const cancel = () => {
          rejectPending?.(new Error('Cancelled'));
          void worker.terminate();
        };
        context.signal.addEventListener('abort', cancel, { once: true });
        const exchange = (message) =>
          new Promise((resolve, reject) => {
            rejectPending = reject;
            worker.once('message', resolve);
            worker.once('error', reject);
            worker.postMessage(message);
          });
        try {
          await exchange({ type: 'initialize', request });
        } catch (error) {
          await worker.terminate();
          active.delete(worker);
          context.signal.removeEventListener('abort', cancel);
          throw error;
        }
        return {
          step: (step) => exchange({ type: 'step', step }),
          async dispose() {
            context.signal.removeEventListener('abort', cancel);
            await worker.terminate();
            active.delete(worker);
          },
        };
      },
    };
    engine = createEducationalMarkdownEngine({
      extensions: [hdlInteractiveExtension(adapter)],
      securityMode: 'strict',
      executionPolicy: { 'hdl-interactive': { enabled: true, allowInRestrictedMode: true, maxStatements: 3 } },
    });
    for (const lang of ['pt', 'en', 'es'])
      for (const lesson of ['hdl-live-and', 'hdl-live-mux', 'hdl-live-counter', 'hdl-live-register']) {
        const source = readFileSync(new URL(`../../example/${lang}/${lesson}.md`, import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics = [];
        const session = await engine.renderDocument(source, container, { locale: lang, onDiagnostic: (d) => diagnostics.push(d), resourcePolicy: { allowNetwork: false } });
        assert.equal(active.size, 0);
        const frames = container.querySelectorAll('.hdl-interactive');
        assert.equal(frames.length, 2);
        for (const frame of frames) {
          const click = (action) => frame.querySelector(`[data-hdl-action=${action}]`).click();
          click('step');
          await wait(() => frame.getAttribute('data-hdl-time') === '10');
          assert.ok(frame.querySelector('svg'));
          assert.equal(active.size, 1);
          const input = frame.querySelector('fieldset select,fieldset input');
          input.value = lesson === 'hdl-live-and' ? '1' : lesson === 'hdl-live-mux' ? '1111' : lesson === 'hdl-live-counter' ? '0' : '1010';
          click('step');
          await wait(() => frame.getAttribute('data-hdl-time') === '20');
          const expected = lesson === 'hdl-live-and' ? '1' : lesson === 'hdl-live-mux' ? '1111' : lesson === 'hdl-live-counter' ? '0001' : '1010';
          assert.equal(frame.querySelector('table').rows[1].cells[1].textContent, expected);
          click('reset');
          await wait(() => frame.getAttribute('data-hdl-time') === '0');
          assert.equal(active.size, 0);
        }
        assert.deepEqual(diagnostics, [], `${lang}/${lesson}`);
        await session.dispose();
        assert.equal(container.querySelector('button'), null);
      }
    for (const lang of ['pt', 'en', 'es']) {
      const container = document.createElement('div');
      const diagnostics = [];
      const artifacts = [];
      const session = await engine.renderDocument(readFileSync(new URL(`../../example/${lang}/hdl-stimuli-checks.md`, import.meta.url), 'utf8'), container, {
        locale: lang,
        onHDLExport: (artifact) => artifacts.push(artifact),
        onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
      });
      assert.equal(container.querySelectorAll('.hdl-interactive').length, 2);
      for (const frame of container.querySelectorAll('.hdl-interactive')) {
        frame.querySelector('[data-hdl-action=run]').click();
        await wait(() => frame.getAttribute('data-hdl-time') === '12');
        assert.equal(frame.querySelectorAll('[data-status=passed]').length, 2, frame.textContent);
        assert.ok(frame.querySelector('svg'));
        frame.querySelector(':scope > .hdl-exports [data-hdl-export=json]').click();
        const report = JSON.parse(artifacts.at(-1).text);
        assert.equal(report.schemaVersion, 1);
        assert.equal(report.history.length, 2);
        assert.ok(report.checks.every((check) => check.status === 'passed'));
        frame.querySelector('[data-hdl-action=reset]').click();
        await wait(() => frame.getAttribute('data-hdl-time') === '0');
        assert.equal(frame.querySelectorAll('[data-status=pending]').length, 2);
        assert.equal(active.size, 0);
      }
      assert.deepEqual(diagnostics, []);
      await session.dispose();
    }
    assert.equal(created, 30);
  } finally {
    await engine?.dispose();
    await Promise.all([...active].map((w) => w.terminate()));
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
