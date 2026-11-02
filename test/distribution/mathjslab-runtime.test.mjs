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

test('published integration executes mathjslab 2.10.0 through a real module Worker', { timeout: 20000 }, async () => {
  const executor = createBrowserMathJSLabWorkerExecutor({ toMathML: (source) => source, workerFactory });
  const context = { blockIndex: 0, statementIndex: 0 };
  try {
    const session = await executor.createSession(context);
    const parsed = await session.parse('a=[1,2,3]; [v,m]=var(a,0,2); [v,m]', context);
    assert.equal(parsed.error, undefined);
    assert.equal(parsed.statements.length, 3);
    assert.deepEqual(parsed.statements, ['a=[1,2,3];', '[v,m]=var(a,0,2);', '[v,m]']);
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

test('numeric options are copied, isolated and retained after reset, abort and timeout', { timeout: 30000 }, async () => {
  const numeric = { engine: 'decimal', complex: { precision: 40, precisionCompare: 7 } };
  const decimal = createBrowserMathJSLabWorkerExecutor({ toMathML: String, workerFactory, numeric });
  numeric.engine = 'number';
  numeric.complex.precision = 16;
  const number = createBrowserMathJSLabWorkerExecutor({ toMathML: String, workerFactory, numeric: { engine: 'number' } });
  const context = { blockIndex: 0, statementIndex: 0 };
  const check = async (session, source) => {
    const result = await session.execute(source, context);
    assert.equal(result.status, 'success', result.error?.message);
    assert.equal(result.state, 'good');
  };
  try {
    const [a, b] = await Promise.all([decimal.createSession(context), number.createSession(context)]);
    await Promise.all([check(a, 'configure("real","decimal");'), check(b, 'configure("real","number");')]);
    const precision = async (session, expected) => {
      const result = await session.execute('getconfig("precision")', context);
      assert.equal(result.status, 'success');
      assert.match(JSON.stringify(result.outputs), new RegExp(`>${expected}<`));
    };
    await precision(a, 40);
    await precision(b, 15);
    await check(a, 'retained=7; configure("real","number"); assert(retained==7);');
    await precision(a, 15);
    await check(a, 'configure("real","decimal"); assert(retained==7);');
    await check(a, '1+1');
    await check(a, 'privateValue=42;');
    assert.equal((await b.execute('privateValue', context)).status, 'error');
    await check(a, 'configure("precision",20);');
    await a.reset();
    await precision(a, 40);
    assert.equal((await a.execute('privateValue', context)).status, 'error');
    await check(a, 'configure("real","decimal");');
    const controller = new AbortController();
    const pending = a.execute('pause(10);', { ...context, signal: controller.signal });
    setTimeout(() => controller.abort(), 50);
    const cancelled = await pending;
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(cancelled.state, 'bad');
    assert.ok(cancelled.error.code);
    await check(a, 'configure("real","decimal");');
    await assert.rejects(a.execute('pause(10);', { ...context, executionPolicy: { mathjslab: { timeoutMs: 50 } } }), { name: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' });
    await check(a, 'configure("real","decimal");');
    await a.dispose();
    await check(b, 'configure("real","number");');
    const fresh = await decimal.createSession(context);
    await check(fresh, 'configure("real","decimal");');
  } finally {
    await Promise.all([decimal.dispose(), number.dispose()]);
  }
});

test('retained validations, classes, protocols and loaded multiple-output writes', { timeout: 30000 }, async () => {
  const { readFile } = await import('node:fs/promises');
  const executor = createBrowserMathJSLabWorkerExecutor({ toMathML: String, workerFactory, numeric: { engine: 'decimal', complex: { precision: 40 } } });
  const context = {
    blockIndex: 0,
    statementIndex: 0,
    resources: { readText: async () => 'pause(0); localValue=localValue+1;' },
  };
  try {
    const session = await executor.createSession(context);
    for (const [name, check] of [
      ['validation', 'validation_ok'],
      ['classes', 'property_ok && event_ok && index_ok && write_ok && array_ok && concat_ok'],
      ['protocols', 'condition_ok && index_ok && builtin_ok && operator_ok && tail_ok && compound_ok && selection_ok && mapping_ok'],
    ]) {
      const fixture = await readFile(new URL(`./fixtures/mathjslab/resumable-${name}.m`, import.meta.url), 'utf8');
      const cycle = await readFile(new URL(`./fixtures/mathjslab/${name}-cycle.m`, import.meta.url), 'utf8');
      const result = await session.execute(`${fixture}\n${cycle}\nassert(${check});`, context);
      assert.equal(result.status, 'success', `${name}: ${result.error?.message}`);
      await session.reset();
    }
    const source = `function [a,b]=loadedPair()
localValue=40;
load('local.m');
pause(0);
a=localValue; b=localValue+1;
end
values=zeros(1,2);
[values(1),values(2)]=loadedPair();
assert(isequal(values,[41,42]));`;
    const result = await session.execute(source, context);
    assert.equal(result.status, 'success', result.error?.message);
    assert.ok(result.outputs.some((o) => o.type === 'text' && /Loaded script/.test(o.text)));
    assert.equal((await session.execute('localValue', context)).status, 'error');
  } finally {
    await executor.dispose();
  }
});
