import { TextEncoder } from 'node:util';
import { MarkdownEngine, type MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { hdlInteractiveExtension } from '../../src/markdown/extensions/hdl-interactive/extension.js';
import { validateInteractiveRequest, type HDLInteractiveSession, type HDLInteractiveResult, type HDLInteractiveRequest } from '../../src/markdown/extensions/hdl-interactive/executor.js';

Object.assign(globalThis, { TextEncoder });
const request = {
  top: 'live_and',
  files: [{ name: 'and.v', source: 'module live_and(input a,b,output y);assign y=a&b;endmodule' }],
  inputs: [
    { name: 'a', width: 1, initial: '0' },
    { name: 'b', width: 1, initial: '1' },
  ],
  outputs: [{ name: 'y', width: 1 }],
  stepNs: 10,
};
const fence = (data: unknown = request) => '```verilog-live {width=50% height=10rem}\n' + JSON.stringify(data) + '\n```';
const engineFor = (
  session: (request: HDLInteractiveRequest) => HDLInteractiveSession | Promise<HDLInteractiveSession>,
  policy: object = { enabled: true },
  mode: 'trusted' | 'strict' = 'trusted',
) => new MarkdownEngine({ extensions: [hdlInteractiveExtension({ createInteractiveSession: session })], executionPolicy: { 'hdl-interactive': policy }, securityMode: mode });
const action = (container: Element, name: string) => container.querySelector<HTMLButtonElement>(`button[data-hdl-action=${name}]`)!;
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const wait = async (condition: () => boolean): Promise<void> => {
  for (let i = 0; i < 100 && !condition(); i++) await new Promise((r) => setTimeout(r, 5));
  expect(condition()).toBe(true);
};

describe('stateful interactive HDL simulation', () => {
  test.each([false, true])('awaits asynchronous session disposal, including reset in progress: %s', async (resetFirst) => {
    let resolveDisposal!: () => void;
    let started = false,
      closed = false,
      calls = 0;
    const engine = engineFor(() => ({
      step: () => ({ timeNs: 10, values: { y: '1' } }),
      dispose: () => {
        calls++;
        started = true;
        return new Promise<void>((resolve) => {
          resolveDisposal = resolve;
        });
      },
    }));
    const container = document.createElement('div');
    try {
      const documentSession = await engine.renderDocument(fence(), container);
      action(container, 'step').click();
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '10');
      if (resetFirst) {
        action(container, 'reset').click();
        await wait(() => started);
      }
      const disposing = documentSession.dispose().then(() => {
        closed = true;
      });
      await wait(() => started);
      await flush();
      expect(closed).toBe(false);
      resolveDisposal();
      await disposing;
      expect(closed).toBe(true);
      expect(calls).toBe(1);
    } finally {
      resolveDisposal?.();
      await engine.dispose();
    }
  });
  test('starts only on demand, applies inputs, preserves state, renders VCD, resets and disposes once', async () => {
    let created = 0,
      disposed = 0;
    const engine = engineFor(() => {
      created++;
      let time = 0;
      return {
        step: ({ advanceNs, inputs }) => {
          time += advanceNs;
          return {
            timeNs: time,
            values: { y: inputs.a === '1' && inputs.b === '1' ? '1' : '0' },
            logs: '<script>text only</script>',
            vcd: `$timescale 1ns $end\n$var wire 1 ! y $end\n$enddefinitions $end\n$dumpvars\n${inputs.a === '1' ? '1' : '0'}!\n$end\n#${time}\n`,
          };
        },
        dispose: () => {
          disposed++;
        },
      };
    });
    const shadow = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.append(container);
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      const documentSession = await engine.renderDocument(fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(created).toBe(0);
      action(container, 'step').click();
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '10');
      expect(created).toBe(1);
      expect(container.querySelector('table')?.textContent).toContain('y0');
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('svg')?.style.height).toBe('10rem');
      container.querySelector<HTMLSelectElement>('select[aria-label=a]')!.value = '1';
      action(container, 'step').click();
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '20');
      expect(container.querySelector('table')?.textContent).toContain('y1');
      expect(created).toBe(1);
      action(container, 'reset').click();
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '0');
      expect(disposed).toBe(1);
      expect(container.querySelector<HTMLSelectElement>('select[aria-label=a]')?.value).toBe('0');
      action(container, 'step').click();
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '10');
      expect(created).toBe(2);
      await documentSession.dispose();
      expect(disposed).toBe(2);
      expect(container.querySelector('svg')).toBeNull();
      expect(diagnostics).toEqual([]);
    } finally {
      await engine.dispose();
    }
  });
  test('runs sequential bounded batches, pauses, and resumes without a new session', async () => {
    let created = 0,
      calls = 0,
      active = 0,
      maxActive = 0;
    const engine = engineFor(
      () => {
        created++;
        let time = 0;
        return {
          async step({ advanceNs }) {
            active++;
            maxActive = Math.max(active, maxActive);
            await flush();
            time += advanceNs;
            calls++;
            active--;
            return { timeNs: time, values: { y: '1' } };
          },
          dispose() {},
        };
      },
      { enabled: true, maxStatements: 3 },
    );
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(), container);
      action(container, 'run').click();
      await wait(() => calls === 1);
      action(container, 'pause').click();
      await new Promise((r) => setTimeout(r, 80));
      expect(calls).toBe(1);
      action(container, 'run').click();
      await wait(() => calls === 3);
      await new Promise((r) => setTimeout(r, 70));
      expect(calls).toBe(3);
      expect(maxActive).toBe(1);
      expect(created).toBe(1);
      expect(action(container, 'run').disabled).toBe(true);
    } finally {
      await engine.dispose();
    }
  });
  test.each([{}, { enabled: false }])('blocks unauthorized policy %j', async (policy) => {
    let calls = 0;
    const engine = engineFor(() => {
      calls++;
      throw Error('unexpected');
    }, policy);
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(), container);
      expect(container.querySelector('.markdown-extension-fallback')).not.toBeNull();
      expect(calls).toBe(0);
      expect(container.querySelector('button')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });
  test('requires restricted-mode authorization and reports absent host support', async () => {
    for (const mode of ['strict', 'trusted'] as const) {
      const engine = new MarkdownEngine({ extensions: [hdlInteractiveExtension({})], securityMode: mode, executionPolicy: { 'hdl-interactive': { enabled: true } } });
      const container = document.createElement('div');
      try {
        await engine.renderDocument(fence(), container);
        expect(container.querySelector('.markdown-extension-fallback')).not.toBeNull();
      } finally {
        await engine.dispose();
      }
    }
  });
  test('disposes an asynchronously created session after reset without a stale step', async () => {
    let resolve!: (s: HDLInteractiveSession) => void;
    let started = false,
      disposed = 0,
      calls = 0;
    const engine = engineFor(() => {
      started = true;
      return new Promise((r) => {
        resolve = r;
      });
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(), container);
      action(container, 'step').click();
      await wait(() => started);
      action(container, 'reset').click();
      await flush();
      resolve({
        step() {
          calls++;
          return { timeNs: 10, values: { y: '1' } };
        },
        dispose() {
          disposed++;
        },
      });
      await wait(() => disposed === 1);
      expect(calls).toBe(0);
      expect(container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time')).toBe('0');
    } finally {
      await engine.dispose();
    }
  });
  test('times out an unresponsive step and makes reset available', async () => {
    let disposed = 0;
    const engine = engineFor(
      () => ({
        step: () => new Promise(() => {}),
        dispose() {
          disposed++;
        },
      }),
      { enabled: true, timeoutMs: 10 },
    );
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      action(container, 'step').click();
      await wait(() => disposed === 1);
      expect(diagnostics[0]?.code).toBe('hdl-interactive-timeout');
      expect(action(container, 'step').disabled).toBe(true);
      expect(action(container, 'reset').disabled).toBe(false);
    } finally {
      await engine.dispose();
    }
  });
  test('ignores late step results after document update and removes detached listeners', async () => {
    let resolve!: (r: HDLInteractiveResult) => void;
    let disposed = 0;
    const engine = engineFor(() => ({
      step: () =>
        new Promise((r) => {
          resolve = r;
        }),
      dispose() {
        disposed++;
      },
    }));
    const container = document.createElement('div');
    try {
      const session = await engine.renderDocument(fence(), container);
      const old = action(container, 'step');
      old.click();
      await flush();
      await session.update('New document');
      resolve({ timeNs: 10, values: { y: '1' } });
      await flush();
      old.click();
      expect(container.textContent).toContain('New document');
      expect(container.querySelector('table')).toBeNull();
      expect(disposed).toBe(1);
    } finally {
      await engine.dispose();
    }
  });
  test.each([
    { timeNs: -1, values: { y: '1' } },
    { timeNs: 0, values: { y: '1' } },
    { timeNs: 11, values: { y: '1' } },
    { timeNs: 10, values: { y: '10' } },
    { timeNs: 10, values: {} },
    { timeNs: 10, values: { y: '1' }, vcd: 'invalid' },
  ])('rejects malformed snapshots %#', async (result) => {
    let disposed = 0;
    const engine = engineFor(() => ({
      step: () => result,
      dispose() {
        disposed++;
      },
    }));
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      action(container, 'step').click();
      await wait(() => disposed === 1);
      expect(diagnostics[0]?.code).toBe('hdl-interactive-error');
      expect(container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time')).toBe('0');
    } finally {
      await engine.dispose();
    }
  });
  test.each([
    {},
    { ...request, stepNs: 0 },
    { ...request, operation: 'synthesize' },
    { ...request, inputs: [{ name: 'a', width: 1, initial: '2' }] },
    { ...request, outputs: [] },
    { ...request, inputs: [{ name: 'constructor', width: 1, initial: '0' }] },
    { ...request, stopTimeNs: 1.5 },
  ])('rejects invalid configurations %#', (invalid) => expect(() => validateInteractiveRequest(invalid, 'verilog')).toThrow());
});

describe('scripted HDL stimuli and checks', () => {
  const plan = {
    ...request,
    stopTimeNs: 20,
    stimuli: [
      { timeNs: 0, inputs: { a: '1' } },
      { timeNs: 7, inputs: { a: '0' } },
    ],
    checks: [
      { id: 'mismatch', timeNs: 7, signal: 'y', expected: '0' },
      { id: 'off', timeNs: 12, signal: 'y', expected: '0' },
      { id: 'end', timeNs: 20, signal: 'y', expected: '0' },
    ],
  };
  test('splits advances, commits checks only after results, continues after mismatch and resets', async () => {
    const calls: unknown[] = [];
    const diagnostics: MarkdownDiagnostic[] = [];
    let release!: () => void;
    const engine = engineFor((backend) => {
      expect(backend).not.toHaveProperty('stimuli');
      expect(backend).not.toHaveProperty('checks');
      let time = 0;
      return {
        step: async (step) => {
          calls.push(step);
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          time += step.advanceNs;
          return { timeNs: time, values: { y: step.inputs.a! } };
        },
        dispose: () => {},
      };
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(plan), container, { onDiagnostic: (value) => diagnostics.push(value) });
      expect(container.querySelector<HTMLSelectElement>('[aria-label=a]')!.disabled).toBe(true);
      expect(container.querySelector<HTMLSelectElement>('[aria-label=b]')!.disabled).toBe(false);
      for (const [index, target] of [7, 12, 20].entries()) {
        action(container, 'step').click();
        await wait(() => calls.length === index + 1);
        expect(container.querySelectorAll('[data-status=passed]')).toHaveLength(Math.max(0, index - 1));
        release();
        await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === String(target));
      }
      expect(calls).toEqual([
        { advanceNs: 7, inputs: { a: '1', b: '1' } },
        { advanceNs: 5, inputs: { a: '0', b: '1' } },
        { advanceNs: 8, inputs: { a: '0', b: '1' } },
      ]);
      expect(container.querySelectorAll('[data-status=passed]')).toHaveLength(2);
      expect(container.querySelector('[data-hdl-check=mismatch]')?.getAttribute('data-status')).toBe('failed');
      expect(diagnostics.map((value) => value.code)).toEqual(['hdl-check-failed']);
      action(container, 'reset').click();
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '0');
      expect(container.querySelectorAll('[data-status=pending]')).toHaveLength(3);
    } finally {
      release?.();
      await engine.dispose();
    }
  });
  test('marks unreached checks as not run on early completion', async () => {
    const engine = engineFor(() => ({ step: () => ({ timeNs: 3, finished: true, values: { y: 'x' } }), dispose: () => {} }));
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(plan), container);
      action(container, 'step').click();
      await wait(() => container.querySelectorAll('[data-status=not-run]').length === 3);
    } finally {
      await engine.dispose();
    }
  });
  test.each([
    { stimuli: [{ timeNs: 0, inputs: { a: '00' } }] },
    { stimuli: [{ timeNs: 0, inputs: { unknown: '0' } }] },
    {
      stimuli: [
        { timeNs: 1, inputs: { a: '0' } },
        { timeNs: 1, inputs: { a: '1' } },
      ],
    },
    { stimuli: [{ timeNs: 20, inputs: { a: '0' } }] },
    { stimuli: [{ timeNs: 0, inputs: {} }] },
    { checks: [{ id: 'bad', timeNs: 0, signal: 'y', expected: '0' }] },
    { checks: [{ id: 'bad', timeNs: 2, signal: 'a', expected: '0' }] },
    { checks: [{ id: 'bad', timeNs: 2, signal: 'y', expected: '?' }] },
    {
      checks: [
        { id: 'bad', timeNs: 2, signal: 'y', expected: '0' },
        { id: 'bad', timeNs: 3, signal: 'y', expected: '0' },
      ],
    },
    { checks: [{ id: 'bad', timeNs: 2, signal: 'y', expected: '0', expression: 'evil()' }] },
    { checks: Array.from({ length: 257 }, (_, index) => ({ id: 'c' + index, timeNs: 2, signal: 'y', expected: '0' })) },
  ])('rejects invalid timeline %#', (extra) => expect(() => validateInteractiveRequest({ ...request, stopTimeNs: 20, ...extra }, 'verilog')).toThrow());
  test('accepts exact unknown/high impedance states and concurrent checks', () => {
    expect(
      validateInteractiveRequest(
        {
          ...request,
          checks: [
            { id: 'unknown', timeNs: 1, signal: 'y', expected: 'x' },
            { id: 'floating', timeNs: 1, signal: 'y', expected: 'z' },
          ],
        },
        'verilog',
      ).checks,
    ).toHaveLength(2);
  });
});
