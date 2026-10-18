import { TextEncoder } from 'node:util';
import { readFileSync } from 'node:fs';
import { MarkdownEngine, type MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';
import { validateHDLRequest, type HDLExecutionRequest, type HDLExecutionResult, type HDLExecutionSession, type HDLExecutor } from '../../src/markdown/extensions/hdl/executor.js';

Object.assign(globalThis, { TextEncoder });
const request = { operation: 'simulate', top: 'tb', files: [{ name: 'tb.v', source: 'module tb;\ninitial $finish;\nendmodule\n' }], stopTimeNs: 100 };
const fence = (data: unknown = request, language = 'verilog-run', attributes = '') => '```' + language + attributes + '\n' + JSON.stringify(data) + '\n```';
const netlist = JSON.parse(
  readFileSync(new URL('./extensions/netlist.md', import.meta.url), 'utf8')
    .replace(/^```netlist\n/, '')
    .replace(/\n```\s*$/, ''),
);
const waveform = {
  signal: [
    { name: 'clock', wave: 'p...' },
    { name: 'data', wave: '01..' },
  ],
};
const create = (executor: HDLExecutor, policy: object = { enabled: true }, securityMode: 'trusted' | 'strict' = 'trusted') =>
  new MarkdownEngine({ extensions: [hdlExtension(executor)], executionPolicy: { hdl: policy }, securityMode });

describe('application-owned HDL executors', () => {
  test('defers authorized execution until visible and disposes an unobserved block without executing', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver');
    let visible!: IntersectionObserverCallback;
    let observer!: IntersectionObserver;
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: class {
        constructor(callback: IntersectionObserverCallback) {
          visible = callback;
          observer = this as unknown as IntersectionObserver;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    });
    let calls = 0;
    const engine = create({
      createSession: () => ({
        execute: () => {
          calls++;
          return { status: 'success', logs: 'completed' };
        },
        dispose: () => {},
      }),
    });
    const container = document.createElement('div');
    try {
      const session = await engine.renderDocument(fence(), container, { renderMode: 'visible' });
      expect(calls).toBe(0);
      visible([{ isIntersecting: true } as IntersectionObserverEntry], observer);
      await new Promise((r) => setTimeout(r, 0));
      expect(calls).toBe(1);
      expect(container.querySelector('.hdl-logs')?.textContent).toBe('completed');
      await session.update(fence());
      await session.dispose();
      visible([{ isIntersecting: true } as IntersectionObserverEntry], observer);
      expect(calls).toBe(1);
    } finally {
      await engine.dispose();
      if (descriptor) Object.defineProperty(globalThis, 'IntersectionObserver', descriptor);
      else Reflect.deleteProperty(globalThis, 'IntersectionObserver');
    }
  });

  test('keeps invalid JSON local and continues executing a valid block', async () => {
    let calls = 0;
    const engine = create({
      createSession: () => ({
        execute: () => {
          calls++;
          return { status: 'success', logs: 'valid' };
        },
        dispose: () => {},
      }),
    });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument('```verilog-run\n{bad JSON}\n```\n\n' + fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(calls).toBe(1);
      expect(diagnostics).toHaveLength(1);
      expect(container.querySelector('.hdl-logs')?.textContent).toBe('valid');
    } finally {
      await engine.dispose();
    }
  });
  test('preserves source, dispatches language and operation, renders both visual types and disposes once', async () => {
    const calls: HDLExecutionRequest[] = [];
    let disposed = 0;
    const engine = create({
      createSession: () => ({
        execute: (input) => {
          calls.push(input);
          return { status: 'success', logs: '<script>never execute</script>', waveform, netlist };
        },
        dispose: () => {
          disposed++;
        },
      }),
    });
    const host = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    host.append(container);
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      const session = await engine.renderDocument(fence(request, 'verilog-run', ' {width=50% height=10rem}'), container, {
        onDiagnostic: (d) => diagnostics.push(d),
        resourcePolicy: { allowNetwork: false },
      });
      expect(diagnostics).toEqual([]);
      expect(calls[0]).toEqual({ ...request, language: 'verilog' });
      expect(calls[0]!.files[0]!.source).toBe(request.files[0]!.source);
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('.hdl-logs')?.textContent).toBe('<script>never execute</script>');
      expect(container.querySelectorAll('svg')).toHaveLength(2);
      expect([...container.querySelectorAll('svg')].every((svg) => svg.style.height === '10rem')).toBe(true);
      expect(disposed).toBe(1);
      const vhdl = { operation: 'synthesize', top: 'gate', standard: '08', files: [{ name: 'gate.vhd', source: 'entity gate is end; architecture rtl of gate is begin end;' }] };
      await session.update(fence(vhdl, 'vhdl-run'));
      expect(calls[1]).toEqual({ ...vhdl, language: 'vhdl' });
      expect(disposed).toBe(2);
      await session.dispose();
      expect(container.querySelector('svg')).toBeNull();
      expect(disposed).toBe(2);
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    { policy: {}, mode: 'trusted' },
    { policy: { enabled: false }, mode: 'trusted' },
    { policy: { enabled: true }, mode: 'strict' },
  ])('blocks unauthorized execution: %j', async ({ policy, mode }) => {
    let calls = 0;
    const engine = create(
      {
        createSession: () => {
          calls++;
          throw new Error('must not run');
        },
      },
      policy,
      mode as 'trusted' | 'strict',
    );
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(calls).toBe(0);
      expect(diagnostics[0]?.code).toBe('hdl-execution-disabled');
      expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(JSON.stringify(request));
    } finally {
      await engine.dispose();
    }
  });

  test('allows explicitly authorized strict mode and keeps ordinary HDL fences inert', async () => {
    let calls = 0;
    const engine = create(
      {
        createSession: () => ({
          execute: () => {
            calls++;
            return { status: 'success' };
          },
          dispose: () => {},
        }),
      },
      { enabled: true, allowInRestrictedMode: true },
      'strict',
    );
    const container = document.createElement('div');
    try {
      await engine.renderDocument('```verilog\nmodule tb; endmodule\n```\n\n' + fence(), container);
      expect(calls).toBe(1);
      expect(container.querySelector('code.language-verilog')).not.toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test.each(['error', 'cancelled'] as const)('shows %s diagnostics and logs as text with Markdown source location', async (status) => {
    const engine = create({
      createSession: () => ({
        execute: () => ({ status, logs: '<img src=x onerror=alert(1)>', diagnostics: [{ severity: 'error', message: 'bad token <x>', file: 'tb.v', line: 2, column: 3 }] }),
        dispose: () => {},
      }),
    });
    const diagnostics: MarkdownDiagnostic[] = [];
    const container = document.createElement('div');
    try {
      await engine.renderDocument('# Lesson\n\n' + fence(), container, { sourceUrl: new URL('https://assets.test/hdl.md'), onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics[0]).toMatchObject({ extension: 'hdl', category: 'execution', line: 3, message: 'tb.v:2:3: bad token <x>' });
      expect(container.textContent).toContain('bad token <x>');
      expect(container.textContent).toContain('<img');
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('.markdown-extension-fallback')).not.toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test('enforces source and block limits before creating sessions', async () => {
    let calls = 0;
    const engine = create(
      {
        createSession: () => ({
          execute: () => {
            calls++;
            return { status: 'success' };
          },
          dispose: () => {},
        }),
      },
      { enabled: true, maxBlocks: 1 },
    );
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence() + '\n\n' + fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(calls).toBe(1);
      expect(diagnostics[0]?.code).toBe('hdl-block-limit');
      await engine.renderDocument(fence(), container, { executionPolicy: { hdl: { maxSourceBytes: 1 } }, onDiagnostic: (d) => diagnostics.push(d) });
      expect(calls).toBe(1);
      expect(diagnostics.at(-1)?.code).toBe('hdl-source-limit');
    } finally {
      await engine.dispose();
    }
  });

  test('times out an unresponsive executor and disposes its session', async () => {
    let disposed = 0;
    let signal: AbortSignal | undefined;
    const engine = create(
      {
        createSession: (context) => {
          signal = context.signal;
          return {
            execute: () => new Promise(() => {}),
            dispose: () => {
              disposed++;
            },
          };
        },
      },
      { enabled: true, timeoutMs: 10 },
    );
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(), document.createElement('div'), { onDiagnostic: (d) => diagnostics.push(d) });
      expect(signal?.aborted).toBe(true);
      expect(disposed).toBe(1);
      expect(diagnostics[0]?.code).toBe('hdl-execution-timeout');
    } finally {
      await engine.dispose();
    }
  });

  test('cleans up sessions created after cancellation without executing or mounting stale output', async () => {
    let resolve!: (session: HDLExecutionSession) => void;
    let started!: () => void;
    const ready = new Promise<void>((r) => {
      started = r;
    });
    const engine = create({
      createSession: () => {
        started();
        return new Promise<HDLExecutionSession>((r) => {
          resolve = r;
        });
      },
    });
    const controller = new AbortController();
    const container = document.createElement('div');
    let disposed = 0;
    let executed = 0;
    try {
      const rendering = engine.renderDocument(fence(), container, { signal: controller.signal });
      await ready;
      controller.abort();
      await rendering;
      resolve({
        execute: () => {
          executed++;
          return { status: 'success', waveform };
        },
        dispose: () => {
          disposed++;
        },
      });
      await new Promise((r) => setTimeout(r, 0));
      expect(disposed).toBe(1);
      expect(executed).toBe(0);
      expect(container.querySelector('svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    { status: 'oops' },
    { status: 'success', logs: 1 },
    { status: 'success', logs: 'x'.repeat(65537) },
    { status: 'success', waveform: { assign: ['x'] } },
    { status: 'success', diagnostics: [{ severity: 'error', message: 'bad', file: '../outside.v' }] },
  ])('rejects malformed executor results %p', async (result) => {
    let disposed = 0;
    const engine = create({
      createSession: () => ({
        execute: () => result as HDLExecutionResult,
        dispose: () => {
          disposed++;
        },
      }),
    });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics[0]?.code).toBe('hdl-execution-error');
      expect(disposed).toBe(1);
      expect(container.querySelector('svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    {},
    { ...request, command: 'sh' },
    { ...request, top: 'tb;rm' },
    { ...request, files: [] },
    { ...request, files: [{ name: '../tb.v', source: 'x' }] },
    { ...request, files: [{ name: 'tb.vhd', source: 'x' }] },
    { ...request, files: [request.files[0], request.files[0]] },
    { ...request, files: [{ name: 'tb.v', source: '\0' }] },
    { ...request, standard: 'arbitrary' },
    { ...request, stopTimeNs: -1 },
    { ...request, operation: 'synthesize' },
  ])('rejects invalid requests %p', (invalid) => {
    expect(() => validateHDLRequest(invalid, 'verilog')).toThrow();
  });
});
