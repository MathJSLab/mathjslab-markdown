import assert from 'node:assert/strict';
import path from 'node:path';
import webpack from 'webpack';
import { chromium } from 'playwright-core';
import { serveStatic } from '../hdl-browser/static-server.mjs';

const compiler = webpack({
  mode: 'development',
  devtool: false,
  entry: path.resolve('dist/source/markdown-mathjslab.js'),
  experiments: { outputModule: true },
  output: { path: path.resolve('test-results/mathjslab-browser'), filename: 'adapter.js', library: { type: 'module' } },
  resolve: { fallback: { module: false } },
});
await new Promise((resolve, reject) => compiler.run((error, stats) => compiler.close(() => (error || stats.hasErrors() ? reject(error ?? new Error(stats.toString())) : resolve()))));
const server = await serveStatic();
let browser;
try {
  browser = await chromium.launch(process.env.MATHJSLAB_BROWSER_EXECUTABLE ? { executablePath: process.env.MATHJSLAB_BROWSER_EXECUTABLE } : {});
  const page = await browser.newPage();
  await page.goto(server.url + '/test/browser/structured-blocks.html');
  const result = await page.evaluate(async () => {
    const { createBrowserMathJSLabWorkerExecutor } = await import('/test-results/mathjslab-browser/adapter.js');
    const calls = [];
    const make = (engine) =>
      createBrowserMathJSLabWorkerExecutor({
        numeric: { engine, complex: { precision: 40 } },
        toMathML: String,
        workerFactory: () => new Worker('/node_modules/mathjslab/lib/mathjslab.runtime-worker.esm2022.js', { type: 'module' }),
        plotRenderer: { render: () => calls.push('mount'), resize: () => calls.push('resize'), dispose: () => calls.push('dispose') },
      });
    const a = make('decimal'),
      b = make('number');
    const context = { blockIndex: 0, statementIndex: 0 };
    const check = (condition, message) => {
      if (!condition) throw new Error(message);
    };
    try {
      const [x, y] = await Promise.all([a.createSession(context), b.createSession(context)]);
      for (const [session, engine] of [
        [x, 'decimal'],
        [y, 'number'],
      ]) {
        check((await session.execute(`configure('real','${engine}');`, context)).status === 'success', 'backend');
      }
      const switched = await x.execute("retained=7; configure('real','number'); assert(retained==7);", context);
      check(switched.status === 'success', 'backend switch retains workspace');
      const output = await x.execute('plot([1,2],[3,4]);', context);
      check(output.status === 'success', output.error?.message);
      const plot = output.outputs.find((o) => o.type === 'node');
      document.body.append(plot.node);
      await plot.mount(plot.node);
      await plot.resize(plot.node);
      await plot.dispose();
      plot.node.remove();
      const controller = new AbortController();
      const pending = x.execute('pause(10);', { ...context, signal: controller.signal });
      setTimeout(() => controller.abort(), 50);
      check((await pending).status === 'cancelled', 'cancel');
      try {
        await x.execute('pause(10);', { ...context, executionPolicy: { mathjslab: { timeoutMs: 50 } } });
        throw new Error('missing timeout');
      } catch (error) {
        check(error.code === 'MATHJSLAB_TIMEOUT', 'timeout');
      }
      await x.reset();
      check((await x.execute("configure('real','decimal'); 1+1", context)).status === 'success', 'recovery');
      for (const [name, expression] of [
        ['validation', 'validation_ok'],
        ['classes', 'property_ok && event_ok && index_ok && write_ok && array_ok && concat_ok'],
        ['protocols', 'condition_ok && index_ok && builtin_ok && operator_ok && tail_ok && compound_ok && selection_ok && mapping_ok'],
      ]) {
        const root = '/test/distribution/fixtures/mathjslab/';
        const sources = await Promise.all(
          [`resumable-${name}.m`, `${name}-cycle.m`].map(async (file) => {
            const response = await fetch(root + file);
            if (!response.ok) throw new Error(`Missing fixture: ${file}`);
            return response.text();
          }),
        );
        const result = await x.execute(sources.join('\n') + `\nassert(${expression});`, context);
        check(result.status === 'success', `${name}: ${result.error?.message}`);
        await x.reset();
      }
      await x.dispose();
      check((await y.execute('1+1', context)).status === 'success', 'isolation');
      return calls;
    } finally {
      await Promise.all([a.dispose(), b.dispose()]);
    }
  });
  assert.deepEqual(result, ['mount', 'resize', 'dispose']);
  console.log('Chromium: real built core Worker, numeric isolation, diagnostics, cancel/timeout/recovery and plots passed');
} finally {
  await browser?.close();
  await server.close();
}
