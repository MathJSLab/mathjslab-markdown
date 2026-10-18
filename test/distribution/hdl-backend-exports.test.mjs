import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('HDL backend exports separate browser transport from native Node tools', async () => {
  const browser = await import('mathjslab-markdown/hdl');
  assert.equal(typeof browser.createHTTPHDLExecutor, 'function');
  assert.equal(browser.createNativeHDLExecutor, undefined);
  const native = await import('mathjslab-markdown/hdl/node');
  assert.equal(typeof native.createNativeHDLExecutor, 'function');
  assert.equal(typeof native.createHDLHTTPHandler, 'function');
  assert.equal(typeof native.createMarkdownExecutionScheduler, 'function');
  const core = await import('mathjslab-markdown');
  const scheduler = core.createMarkdownExecutionScheduler({ maxConcurrent: 1 });
  assert.equal(await scheduler.run(() => 'scheduled'), 'scheduled');
  await scheduler.dispose();
  const bundle = await import('../../dist/browser/hdl.js');
  assert.equal(typeof bundle.createHTTPHDLExecutor, 'function');
  assert.equal(bundle.createNativeHDLExecutor, undefined);
  assert.doesNotMatch(readFileSync(new URL('../../dist/browser/hdl.js', import.meta.url), 'utf8'), /node:child_process|allowNativeExecution|taskkill/);
});
