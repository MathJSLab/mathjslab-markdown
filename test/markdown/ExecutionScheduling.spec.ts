import { TextEncoder } from 'node:util';
import { MarkdownEngine, type MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { createMarkdownExecutionScheduler } from '../../src/markdown-core.js';
import { ManagedExecutionSession } from '../../src/markdown/execution/session.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';
import { hdlInteractiveExtension } from '../../src/markdown/extensions/hdl-interactive/extension.js';
import { mathJSLabExtension } from '../../src/markdown/extensions/mathjslab/extension.js';

Object.assign(globalThis, { TextEncoder });
const deferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const wait = async (condition: () => boolean): Promise<void> => {
  for (let i = 0; i < 100 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 5));
  expect(condition()).toBe(true);
};
const batch = '```verilog-run\n' + JSON.stringify({ operation: 'simulate', top: 'tb', files: [{ name: 'tb.v', source: 'module tb;endmodule' }] }) + '\n```';
const live =
  '```verilog-live\n' +
  JSON.stringify({
    top: 'tb',
    files: [{ name: 'tb.v', source: 'module tb(input a, output y);assign y=a;endmodule' }],
    inputs: [{ name: 'a', width: 1, initial: '0' }],
    outputs: [{ name: 'y', width: 1 }],
    stepNs: 10,
  }) +
  '\n```';

describe('shared execution scheduling', () => {
  test.each([0, -1, 1.5, Infinity, NaN])('rejects invalid limits: %s', (maxConcurrent) => {
    expect(() => createMarkdownExecutionScheduler({ maxConcurrent })).toThrow(RangeError);
  });
  test('limits total and per-owner concurrency while preserving FIFO and serving other owners', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 2 });
    const a = {},
      b = {};
    const gates = [deferred(), deferred(), deferred(), deferred()];
    const starts: number[] = [];
    const jobs = gates.map((gate, index) =>
      scheduler.run(
        async () => {
          starts.push(index);
          await gate.promise;
        },
        { owner: index < 3 ? a : b },
      ),
    );
    await flush();
    expect(starts).toEqual([0, 3]);
    expect(scheduler.snapshot).toEqual({ active: 2, queued: 2, disposed: false });
    gates[0]!.resolve();
    await flush();
    expect(starts).toEqual([0, 3, 1]);
    gates[1]!.resolve();
    await flush();
    expect(starts).toEqual([0, 3, 1, 2]);
    gates[2]!.resolve();
    gates[3]!.resolve();
    await Promise.all(jobs);
    await scheduler.dispose();
    expect(scheduler.snapshot).toEqual({ active: 0, queued: 0, disposed: true });
  });
  test('round-robins owners already waiting instead of draining a single document', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const gate = deferred();
    const first = scheduler.run(() => gate.promise, { owner: {} });
    const a = {},
      b = {},
      starts: string[] = [];
    const jobs = ['a1', 'a2', 'b1', 'b2'].map((id) =>
      scheduler.run(
        () => {
          starts.push(id);
        },
        { owner: id.startsWith('a') ? a : b },
      ),
    );
    gate.resolve();
    await first;
    await Promise.all(jobs);
    expect(starts).toEqual(['a1', 'b1', 'a2', 'b2']);
    await scheduler.dispose();
  });
  test('bounds queues and removes cancelled pending jobs without calling them', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1, maxQueued: 1, maxQueuedPerOwner: 1 });
    const gate = deferred(),
      controller = new AbortController();
    const first = scheduler.run(() => gate.promise);
    let calls = 0;
    const queued = scheduler.run(
      () => {
        calls++;
      },
      { signal: controller.signal },
    );
    const cancellation = expect(queued).rejects.toMatchObject({ code: 'execution-cancelled' });
    await expect(scheduler.run(() => {})).rejects.toMatchObject({ code: 'execution-queue-limit' });
    controller.abort();
    await cancellation;
    expect(scheduler.snapshot.queued).toBe(0);
    expect(calls).toBe(0);
    gate.resolve();
    await first;
    await scheduler.dispose();
  });
  test('disposal aborts running work, cancels the queue and waits for asynchronous cleanup', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const cleanup = deferred();
    let abortSeen = false;
    const job = scheduler.run(async (signal) => {
      await new Promise<void>((resolve) =>
        signal.addEventListener(
          'abort',
          () => {
            abortSeen = true;
            resolve();
          },
          { once: true },
        ),
      );
      await cleanup.promise;
    });
    const queued = scheduler.run(() => {
      throw new Error('must not start');
    });
    const cancelled = expect(queued).rejects.toMatchObject({ code: 'execution-cancelled' });
    await flush();
    let done = false;
    const disposing = scheduler.dispose().then(() => {
      done = true;
    });
    await cancelled;
    await flush();
    expect(abortSeen).toBe(true);
    expect(done).toBe(false);
    cleanup.resolve();
    await job;
    await disposing;
    await expect(scheduler.run(() => {})).rejects.toMatchObject({ code: 'execution-cancelled' });
  });
  test('a synchronous failure frees capacity for the next job', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const failure = expect(
      scheduler.run(() => {
        throw new Error('failed');
      }),
    ).rejects.toThrow('failed');
    const next = scheduler.run(() => 42);
    await failure;
    expect(await next).toBe(42);
    await scheduler.dispose();
  });
  test('an owner blocked by its quota does not block a free global slot', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 2, maxQueued: 1 });
    const owner = {},
      gate = deferred();
    const first = scheduler.run(() => gate.promise, { owner });
    const second = scheduler.run(() => 2, { owner });
    expect(await scheduler.run(() => 3, { owner: {} })).toBe(3);
    gate.resolve();
    await first;
    expect(await second).toBe(2);
    await scheduler.dispose();
  });
});

describe('managed execution sessions', () => {
  test('queued cancellation never acquires a session', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const gate = deferred();
    const blocking = scheduler.run(() => gate.promise, { owner: {} });
    const lease = new ManagedExecutionSession();
    let calls = 0;
    const job = lease.run(
      { executionScheduler: scheduler },
      () => {
        calls++;
        return {};
      },
      () => {},
    );
    const cancelled = expect(job).rejects.toMatchObject({ code: 'execution-cancelled' });
    await lease.dispose();
    await cancelled;
    expect(calls).toBe(0);
    gate.resolve();
    await blocking;
    await scheduler.dispose();
  });
  test('late acquisition holds capacity until its resource is disposed exactly once', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const acquisition = deferred<{ dispose: () => Promise<void> }>(),
      cleanup = deferred();
    const lease = new ManagedExecutionSession<{ dispose: () => Promise<void> }>();
    let disposals = 0,
      executions = 0,
      nextStarted = false;
    const job = lease.run(
      { executionScheduler: scheduler },
      () => acquisition.promise,
      () => {
        executions++;
      },
    );
    const cancelled = expect(job).rejects.toMatchObject({ code: 'execution-cancelled' });
    await flush();
    await lease.dispose();
    await cancelled;
    const next = scheduler.run(
      () => {
        nextStarted = true;
      },
      { owner: {} },
    );
    acquisition.resolve({
      dispose: () => {
        disposals++;
        return cleanup.promise;
      },
    });
    await flush();
    expect(disposals).toBe(1);
    expect(executions).toBe(0);
    expect(nextStarted).toBe(false);
    cleanup.resolve();
    await next;
    await lease.dispose();
    expect(disposals).toBe(1);
    await scheduler.dispose();
  });
  test('the execution deadline starts after dispatch, not during queue waiting', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const gate = deferred(),
      blocking = scheduler.run(() => gate.promise, { owner: {} });
    const lease = new ManagedExecutionSession();
    const job = lease.run(
      { executionScheduler: scheduler },
      () => ({}),
      () => 'ok',
      { timeoutMs: 10, closeAfter: true },
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(lease.controller.signal.aborted).toBe(false);
    gate.resolve();
    await blocking;
    expect(await job).toBe('ok');
    await lease.dispose();
    await scheduler.dispose();
  });
  test('timeout terminates unresponsive actions and retains capacity through cleanup', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const cleanup = deferred();
    let disposals = 0,
      started = false;
    const lease = new ManagedExecutionSession();
    const job = lease.run(
      { executionScheduler: scheduler },
      () => ({
        dispose: () => {
          disposals++;
          return cleanup.promise;
        },
      }),
      () => new Promise(() => {}),
      { timeoutMs: 10 },
    );
    await expect(job).rejects.toMatchObject({ code: 'execution-timeout' });
    const next = scheduler.run(
      () => {
        started = true;
      },
      { owner: {} },
    );
    await flush();
    expect(disposals).toBe(1);
    expect(started).toBe(false);
    const one = lease.dispose(),
      two = lease.dispose();
    cleanup.resolve();
    await Promise.all([one, two, next]);
    expect(disposals).toBe(1);
    await scheduler.dispose();
  });
  test('cleanup rejection does not leak a scheduler slot or repeat disposal', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    let disposals = 0;
    const lease = new ManagedExecutionSession();
    await expect(
      lease.run(
        { executionScheduler: scheduler },
        () => ({
          dispose: () => {
            disposals++;
            throw new Error('cleanup');
          },
        }),
        () => 1,
        { closeAfter: true },
      ),
    ).rejects.toThrow('cleanup');
    expect(await scheduler.run(() => 2)).toBe(2);
    await expect(lease.dispose()).rejects.toThrow('cleanup');
    expect(disposals).toBe(1);
    await scheduler.dispose();
  });
});

describe('engine execution integration', () => {
  test('executor shutdown can finish a late acquisition before the owned scheduler drains', async () => {
    const acquisition = deferred<{ parse: () => { statements: [] }; execute: () => { status: 'success' }; dispose: () => void }>();
    let started = false,
      closed = 0;
    const engine = new MarkdownEngine({
      extensions: [
        mathJSLabExtension({
          toMathML: () => '',
          createSession: () => {
            started = true;
            return acquisition.promise;
          },
          dispose: () =>
            acquisition.resolve({
              parse: () => ({ statements: [] }),
              execute: () => ({ status: 'success' }),
              dispose: () => {
                closed++;
              },
            }),
        }),
      ],
    });
    const rendering = engine.renderDocument('```mathjslab\nx\n```', document.createElement('div'));
    await wait(() => started);
    await engine.dispose();
    await rendering;
    expect(closed).toBe(1);
  });
  test('document scheduling identities survive updates and differ across documents', async () => {
    const owners: (object | undefined)[] = [];
    const engine = new MarkdownEngine({
      extensions: [
        {
          name: 'owner-probe',
          fences: [
            {
              language: 'owner-probe',
              className: 'owner-probe',
              render: async (_container, _source, context) => {
                owners.push(context.executionOwner);
              },
            },
          ],
        },
      ],
    });
    const source = '```owner-probe\nx\n```';
    const first = await engine.renderDocument(source, document.createElement('div'));
    await first.update(source);
    await engine.renderDocument(source, document.createElement('div'));
    expect(owners[0]).toBeDefined();
    expect(owners[0]).toBe(owners[1]);
    expect(owners[2]).not.toBe(owners[0]);
    await engine.dispose();
  });
  test('engine queue overflow reports a located diagnostic without acquiring another session', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1, maxQueued: 1 });
    const gate = deferred();
    const blocking = scheduler.run(() => gate.promise, { owner: {} });
    let sessions = 0;
    const engine = new MarkdownEngine({
      executionScheduler: scheduler,
      executionPolicy: { hdl: { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => {
            sessions++;
            return { execute: () => ({ status: 'success' }), dispose: () => {} };
          },
        }),
      ],
    });
    const first = engine.renderDocument(batch, document.createElement('div'));
    await wait(() => scheduler.snapshot.queued === 1);
    const diagnostics: MarkdownDiagnostic[] = [];
    await engine.renderDocument(batch, document.createElement('div'), { sourceUrl: new URL('https://example.test/test.md'), onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'execution-queue-limit', line: 1, sourceUrl: new URL('https://example.test/test.md') })]);
    expect(sessions).toBe(0);
    gate.resolve();
    await blocking;
    await first;
    await engine.dispose();
    await scheduler.dispose();
  });
  test('one scheduler governs HDL batch, interactive actions and MathJSLab without losing document state', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const gate = deferred(),
      events: string[] = [];
    const engine = new MarkdownEngine({
      executionScheduler: scheduler,
      executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: async () => {
              events.push('batch');
              await gate.promise;
              return { status: 'success' };
            },
            dispose: () => {
              events.push('dispose-batch');
            },
          }),
        }),
        hdlInteractiveExtension({
          createInteractiveSession: () => ({
            step: () => {
              events.push('step');
              return { timeNs: 10, values: { y: '1' } };
            },
            dispose: () => {},
          }),
        }),
        mathJSLabExtension({
          toMathML: () => '',
          createSession: () => ({
            parse: () => {
              events.push('parse');
              return { statements: ['a', 'b'] };
            },
            execute: (statement) => {
              events.push(String(statement));
              return { status: 'success' };
            },
            dispose: () => {},
          }),
        }),
      ],
    });
    const batchContainer = document.createElement('div'),
      liveContainer = document.createElement('div'),
      mathContainer = document.createElement('div');
    const batchJob = engine.renderDocument(batch, batchContainer);
    await wait(() => events.includes('batch'));
    await engine.renderDocument(live, liveContainer);
    liveContainer.querySelector<HTMLButtonElement>('[data-hdl-action=step]')!.click();
    const mathJob = engine.renderDocument('```mathjslab\nx\n```', mathContainer);
    await flush();
    expect(events).toEqual(['batch']);
    gate.resolve();
    await Promise.all([batchJob, mathJob]);
    await wait(() => events.includes('step'));
    expect(events.indexOf('dispose-batch')).toBeLessThan(events.indexOf('step'));
    expect(events.filter((event) => ['parse', 'a', 'b'].includes(event))).toEqual(['parse', 'a', 'b']);
    await engine.dispose();
    expect(scheduler.snapshot.disposed).toBe(false);
    await scheduler.dispose();
  });
  test('engines may share an externally owned scheduler without disposing each other', async () => {
    const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 1 });
    const one = new MarkdownEngine({ executionScheduler: scheduler });
    const two = new MarkdownEngine({ executionScheduler: scheduler });
    await one.dispose();
    expect(await scheduler.run(() => 7)).toBe(7);
    await two.dispose();
    expect(scheduler.snapshot.disposed).toBe(false);
    await scheduler.dispose();
  });
  test('MathJSLab cancellation disposes an unresponsive parser before waiting for its operation', async () => {
    let started = false,
      disposals = 0;
    const engine = new MarkdownEngine({
      extensions: [
        mathJSLabExtension({
          toMathML: () => '',
          createSession: () => ({
            parse: () => {
              started = true;
              return new Promise(() => {});
            },
            execute: () => ({ status: 'success' }),
            dispose: () => {
              disposals++;
            },
          }),
        }),
      ],
    });
    const controller = new AbortController();
    const job = engine.renderDocument('```mathjslab\nx\n```', document.createElement('div'), { signal: controller.signal });
    await wait(() => started);
    controller.abort();
    await job;
    await engine.dispose();
    expect(disposals).toBe(1);
  });
  test('MathJSLab policy deadlines produce the existing timeout diagnostic', async () => {
    const diagnostics: MarkdownDiagnostic[] = [];
    let disposals = 0;
    const engine = new MarkdownEngine({
      executionPolicy: { mathjslab: { timeoutMs: 10 } },
      extensions: [
        mathJSLabExtension({
          toMathML: () => '',
          createSession: () => ({
            parse: () => new Promise(() => {}),
            execute: () => ({ status: 'success' }),
            dispose: () => {
              disposals++;
            },
          }),
        }),
      ],
    });
    await engine.renderDocument('```mathjslab\nx\n```', document.createElement('div'), { onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
    expect(diagnostics.map((diagnostic) => diagnostic.code)).toContain('mathjslab-execution-timeout');
    await engine.dispose();
    expect(disposals).toBe(1);
  });
  test('maxSteps has precedence over the legacy maxStatements interactive limit', async () => {
    const engine = new MarkdownEngine({
      executionPolicy: { 'hdl-interactive': { enabled: true, maxSteps: 1, maxStatements: 5 } },
      extensions: [hdlInteractiveExtension({ createInteractiveSession: () => ({ step: () => ({ timeNs: 10, values: { y: '1' } }), dispose: () => {} }) })],
    });
    const container = document.createElement('div');
    await engine.renderDocument(live, container);
    const button = container.querySelector<HTMLButtonElement>('[data-hdl-action=step]')!;
    button.click();
    await wait(() => button.disabled && container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '10');
    await engine.dispose();
  });
});
