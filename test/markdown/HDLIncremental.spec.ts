import { TextEncoder } from 'node:util';
import { MarkdownEngine, type HDLExecutionUpdate, type MarkdownDocumentContext } from '../../src/MarkdownEngine.js';
import { createHDLUpdateReceiver, validateHDLExecutionUpdate } from '../../src/markdown/hdl/updates.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';
import { hdlInteractiveExtension } from '../../src/markdown/extensions/hdl-interactive/extension.js';

Object.assign(globalThis, { TextEncoder });
const trace = '$timescale 1 ns $end\n$scope module tb $end\n$var wire 1 ! y $end\n$upscope $end\n$enddefinitions $end\n$dumpvars\n0!\n$end\n#5\n1!\n';
const more = '#10\n0!\n';
const request = { top: 'tb', files: [{ name: 'tb.v', source: 'module tb(input a,output y);assign y=a;endmodule' }] };
const batch = '```verilog-run\n' + JSON.stringify({ ...request, operation: 'simulate' }) + '\n```';
const live = '```verilog-live\n' + JSON.stringify({ ...request, inputs: [{ name: 'a', width: 1, initial: '0' }], outputs: [{ name: 'y', width: 1 }], stepNs: 10 }) + '\n```';
const wait = async (condition: () => boolean): Promise<void> => {
  for (let i = 0; i < 200 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 5));
  expect(condition()).toBe(true);
};

describe('incremental HDL result channels', () => {
  test('external document cancellation stays linked after initial typesetting and cancels active previews', async () => {
    const controller = new AbortController();
    let disposals = 0,
      active!: MarkdownDocumentContext,
      finish!: () => void;
    const engine = new MarkdownEngine({
      executionPolicy: { 'hdl-interactive': { enabled: true } },
      extensions: [
        hdlInteractiveExtension({
          createInteractiveSession: () => ({
            step: async (_request, context) => {
              active = context;
              context.onHDLUpdate?.({ type: 'vcd', text: trace });
              await new Promise<void>((resolve) => {
                finish = resolve;
              });
              return { timeNs: 10, values: { y: '1' }, vcd: trace };
            },
            dispose: () => {
              disposals++;
            },
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    await engine.renderDocument(live, container, { signal: controller.signal });
    container.querySelector<HTMLButtonElement>('[data-hdl-action=step]')!.click();
    await wait(() => !!container.querySelector('svg'));
    controller.abort();
    await wait(() => disposals === 1 && !container.querySelector('svg'));
    active.onHDLUpdate?.({ type: 'log', text: 'stale' });
    finish();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(container.textContent).not.toContain('stale');
    await engine.dispose();
    expect(disposals).toBe(1);
  });
  test.each([false, true])('a producer cannot hide an invalid update by catching its exception: interactive=%s', async (interactive) => {
    let disposals = 0;
    const emit = (context: MarkdownDocumentContext): void => {
      try {
        context.onHDLUpdate?.({ type: 'log', text: 1 } as unknown as HDLExecutionUpdate);
      } catch {
        /* Deliberately broken producer. */
      }
    };
    const engine = new MarkdownEngine({
      executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: (_request, context) => {
              emit(context);
              return { status: 'success', vcd: trace };
            },
            dispose: () => {
              disposals++;
            },
          }),
        }),
        hdlInteractiveExtension({
          createInteractiveSession: () => ({
            step: (_step, context) => {
              emit(context);
              return { timeNs: 10, values: { y: '1' }, vcd: trace };
            },
            dispose: () => {
              disposals++;
            },
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    await engine.renderDocument(interactive ? live : batch, container);
    if (interactive) {
      container.querySelector<HTMLButtonElement>('[data-hdl-action=step]')!.click();
      await wait(() => disposals === 1);
    }
    expect(container.querySelector('svg')).toBeNull();
    expect(container.textContent).toContain('Invalid HDL update');
    await engine.dispose();
    expect(disposals).toBe(1);
  });
  test.each([null, { type: 'html', text: '<script>' }, { type: 'vcd', text: 1 }, { type: 'log', text: 'ok', css: 'bad' }, { type: 'progress', phase: 'x'.repeat(129) }])(
    'rejects malformed updates: %p',
    (event) => {
      expect(() => validateHDLExecutionUpdate(event)).toThrow();
    },
  );
  test('bounds total events, accumulated logs and VCD independently', () => {
    const events = createHDLUpdateReceiver(() => {});
    for (let i = 0; i < 4096; i++) events.receive({ type: 'progress', phase: '' });
    expect(() => events.receive({ type: 'progress', phase: '' })).toThrow('stream limit');
    const logs = createHDLUpdateReceiver(() => {});
    logs.receive({ type: 'log', text: 'x'.repeat(65536) });
    expect(() => logs.receive({ type: 'log', text: 'x' })).toThrow('log limit');
    const vcd = createHDLUpdateReceiver(() => {});
    for (let i = 0; i < 8; i++) vcd.receive({ type: 'vcd', text: 'x'.repeat(65536) });
    expect(() => vcd.receive({ type: 'vcd', text: 'x' })).toThrow('VCD limit');
  });
  test('ignores updates after close or cancellation, including malformed late data', () => {
    const controller = new AbortController();
    let calls = 0;
    const updates = createHDLUpdateReceiver(() => {
      calls++;
    }, controller.signal);
    updates.receive({ type: 'log', text: 'first' });
    controller.abort();
    updates.receive(null);
    updates.close();
    updates.receive(null);
    expect(calls).toBe(1);
    expect(updates.snapshot.logs).toBe('first');
  });
  test('renders previews before completion and preserves cursor, range and plain text logs', async () => {
    let active!: MarkdownDocumentContext, finish!: () => void;
    const events: HDLExecutionUpdate[] = [];
    const engine = new MarkdownEngine({
      executionPolicy: { hdl: { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: async (_request, context) => {
              active = context;
              context.onHDLUpdate?.({ type: 'progress', phase: 'simulate' });
              context.onHDLUpdate?.({ type: 'log', text: '<img src=x>\n' });
              context.onHDLUpdate?.({ type: 'vcd', text: trace.slice(0, 35) });
              context.onHDLUpdate?.({ type: 'vcd', text: trace.slice(35) });
              await new Promise<void>((resolve) => {
                finish = resolve;
              });
              return { status: 'success', vcd: trace + more, logs: 'final log' };
            },
            dispose: () => {},
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    const rendering = engine.renderDocument(batch, container, { onHDLUpdate: (event) => events.push(event) });
    await wait(() => !!container.querySelector('.hdl-incremental-vcd svg'));
    expect(container.querySelector('.hdl-logs')?.textContent).toBe('<img src=x>\n');
    expect(container.querySelector('img')).toBeNull();
    let numbers = container.querySelectorAll<HTMLInputElement>('input[type=number]');
    numbers[2]!.value = '3';
    numbers[2]!.dispatchEvent(new Event('input'));
    active.onHDLUpdate?.({ type: 'vcd', text: more });
    await wait(() => container.querySelectorAll<HTMLInputElement>('input[type=number]')[1]?.max === '10');
    numbers = container.querySelectorAll<HTMLInputElement>('input[type=number]');
    expect(numbers[2]!.value).toBe('3');
    expect(numbers[1]!.value).toBe('10');
    finish();
    await rendering;
    expect(container.querySelectorAll<HTMLInputElement>('input[type=number]')[2]!.value).toBe('3');
    expect(container.querySelector('.hdl-incremental-vcd')).toBeNull();
    expect(container.querySelector('.hdl-logs')?.textContent).toBe('final log');
    const count = events.length;
    active.onHDLUpdate?.({ type: 'log', text: 'late' });
    expect(events).toHaveLength(count);
    await engine.dispose();
  });
  test('interactive previews never commit values/time and reset rejects stale updates', async () => {
    let active!: MarkdownDocumentContext, finish!: () => void;
    const engine = new MarkdownEngine({
      executionPolicy: { 'hdl-interactive': { enabled: true } },
      extensions: [
        hdlInteractiveExtension({
          createInteractiveSession: () => ({
            step: async (_step, context) => {
              active = context;
              context.onHDLUpdate?.({ type: 'log', text: 'working' });
              context.onHDLUpdate?.({ type: 'vcd', text: trace });
              await new Promise<void>((resolve) => {
                finish = resolve;
              });
              return { timeNs: 10, values: { y: '1' }, vcd: trace + more };
            },
            dispose: () => {},
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    await engine.renderDocument(live, container);
    container.querySelector<HTMLButtonElement>('[data-hdl-action=step]')!.click();
    await wait(() => !!container.querySelector('svg'));
    expect(container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time')).toBe('0');
    container.querySelector<HTMLButtonElement>('[data-hdl-action=reset]')!.click();
    await wait(() => active.signal!.aborted && !container.querySelector('svg'));
    active.onHDLUpdate?.({ type: 'log', text: 'stale' });
    finish();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(container.textContent).not.toContain('stale');
    expect(container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time')).toBe('0');
    await engine.dispose();
  });
  test('invalid partial data cannot turn a failed execution into a successful diagram', async () => {
    const engine = new MarkdownEngine({
      executionPolicy: { hdl: { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: (_request, context) => {
              context.onHDLUpdate?.({ type: 'vcd', text: 'invalid' });
              return { status: 'error', logs: 'failed' };
            },
            dispose: () => {},
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    await engine.renderDocument(batch, container);
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('[role=alert]')).not.toBeNull();
    await engine.dispose();
  });
});
