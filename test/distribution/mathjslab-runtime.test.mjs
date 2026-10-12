import assert from 'node:assert/strict';
import test from 'node:test';
import { Worker } from 'node:worker_threads';
import { createBrowserMathJSLabWorkerExecutor } from 'mathjslab-markdown/mathjslab';

const workerFactory = () => {
  const worker = new Worker(new URL('./fixtures/mathjslab-runtime.worker.mjs', import.meta.url));
  const listeners = new Map();
  return {
    postMessage: (message, transfer) => worker.postMessage(message, transfer),
    addEventListener(type, listener) {
      const receive = type === 'message' ? (data) => listener({ data }) : listener;
      let entries = listeners.get(type);
      if (!entries) listeners.set(type, (entries = new Map()));
      entries.set(listener, receive);
      worker.on(type, receive);
    },
    removeEventListener(type, listener) {
      const entries = listeners.get(type);
      const receive = entries?.get(listener);
      if (receive) worker.off(type, receive);
      entries?.delete(listener);
    },
    terminate: () => worker.terminate(),
  };
};

test('published integration executes mathjslab 2.9.0 through a real module Worker', { timeout: 20000 }, async () => {
  const executor = createBrowserMathJSLabWorkerExecutor({ toMathML: (source) => source, workerFactory });
  const context = { blockIndex: 0, statementIndex: 0 };
  try {
    const session = await executor.createSession(context);
    const parsed = await session.parse('a=[1,2,3]; [v,m]=var(a,0,2); [v,m]', context);
    assert.equal(parsed.error, undefined);
    assert.equal(parsed.statements.length, 3);
    for (const statement of parsed.statements) {
      const result = await session.execute(statement, context);
      assert.equal(result.status, 'success');
    }
    const result = await session.execute('[v,m]', context);
    assert.deepEqual(
      result.outputs.map((output) => output.type),
      ['mathml'],
    );
    assert.match(result.outputs[0].markup, /<mn>2<\/mn>/);
    await assert.rejects(session.execute('while true\nend', { ...context, executionPolicy: { mathjslab: { timeoutMs: 50 } } }), { code: 'MATHJSLAB_TIMEOUT', name: 'TimeoutError' });
    assert.equal((await session.execute('1+1', context)).status, 'success');
    await session.dispose();
    await session.dispose();
    await assert.rejects(session.execute('1', context), /disposed/);
  } finally {
    await executor.dispose();
  }
});
