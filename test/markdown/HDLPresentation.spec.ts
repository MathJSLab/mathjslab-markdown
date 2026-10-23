import { TextEncoder } from 'node:util';
import { MarkdownEngine } from '../../src/MarkdownEngine.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';
import { normalizeHDLText } from '../../src/markdown/hdl/presentation.js';
Object.assign(globalThis, { TextEncoder });
const source = '```verilog-run\n' + JSON.stringify({ top: 'tb', operation: 'simulate', files: [{ name: 'tb.v', source: 'module tb; endmodule' }] }) + '\n```';
const raw = '\x1b[90mtb.v:3: warning: useful\x1b[0m\r\n\x1b]8;;https://example.invalid\x07link\x1b]8;;\x07\t<img src=x>\x00\x08\x7f';
describe('HDL plain-text result presentation', () => {
  test('normalizes a split ANSI stream during execution and replaces it with the final authoritative log', async () => {
    let release!: () => void;
    let emit!: (text: string) => void;
    const engine = new MarkdownEngine({
      executionPolicy: { hdl: { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: async (_request, context) => {
              emit = (text) => context.onHDLUpdate?.({ type: 'log', text });
              await new Promise<void>((resolve) => {
                release = resolve;
              });
              return { status: 'success', logs: '\x1b[32mfinal only\x1b[0m' };
            },
            dispose() {},
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    const pending = engine.renderDocument(source, container);
    for (let i = 0; i < 100 && !emit; i++) await new Promise((resolve) => setTimeout(resolve, 5));
    emit('first\n\x1b[9');
    expect(container.querySelector('.hdl-logs')?.textContent).toBe('first\n');
    emit('0msecond\x1b[0m');
    expect(container.querySelector('.hdl-logs')?.textContent).toBe('first\nsecond');
    release();
    await pending;
    expect(container.querySelectorAll('.hdl-logs')).toHaveLength(1);
    expect(container.querySelector('.hdl-logs')?.textContent).toBe('final only');
    await engine.dispose();
  });
  test('removes terminal commands, strings and controls while preserving Unicode, tabs and lines', () => {
    expect(normalizeHDLText(raw)).toBe('tb.v:3: warning: useful\nlink\t<img src=x>');
    expect(normalizeHDLText('α\x9b31mβ\x9b0m\x1bPpayload\x1b\\\rγ')).toBe('αβ\nγ');
    expect(normalizeHDLText('first\x1b[9')).toBe('first');
    expect(normalizeHDLText('first\x1b[90msecond')).toBe('firstsecond');
  });
  test.each(['pt', 'en', 'es'])('localizes status/details and exports the same normalized final log once: %s', async (locale) => {
    const artifacts: { filename: string; text: string }[] = [];
    const observed: string[] = [];
    const engine = new MarkdownEngine({
      executionPolicy: { hdl: { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: (_request, context) => {
              context.onHDLUpdate?.({ type: 'log', text: raw.slice(0, 4) });
              context.onHDLUpdate?.({ type: 'log', text: raw.slice(4) });
              return { status: 'success', logs: raw };
            },
            dispose() {},
          }),
        }),
      ],
    });
    const container = document.createElement('div');
    await engine.renderDocument(source, container, {
      locale,
      onHDLExport: (artifact) => {
        artifacts.push(artifact);
      },
      onHDLUpdate: (update) => {
        if (update.type === 'log') observed.push(update.text);
      },
    });
    const details = container.querySelector('details')!;
    expect(details.open).toBe(false);
    expect(container.querySelector('[data-hdl-status=success]')?.getAttribute('role')).toBe('status');
    expect(details.querySelector('summary')?.textContent).toBe(locale === 'pt' ? 'Logs e diagnósticos' : locale === 'es' ? 'Registros y diagnósticos' : 'Logs and diagnostics');
    expect(container.querySelectorAll('.hdl-logs')).toHaveLength(1);
    expect(container.querySelector('.hdl-logs')?.textContent).toBe(normalizeHDLText(raw));
    expect(container.querySelector('img')).toBeNull();
    expect(observed.join('')).toBe(raw);
    container.querySelector<HTMLButtonElement>('[data-hdl-export=txt]')!.click();
    expect(artifacts.at(-1)?.text).toBe(normalizeHDLText(raw));
    container.querySelector<HTMLButtonElement>('[data-hdl-export=json]')!.click();
    expect(JSON.parse(artifacts.at(-1)!.text).result.logs).toBe(normalizeHDLText(raw));
    await engine.dispose();
  });
  test.each(['error', 'cancelled'] as const)('keeps %s diagnostics open and normalized, with explicit status', async (status) => {
    const engine = new MarkdownEngine({
      executionPolicy: { hdl: { enabled: true } },
      extensions: [
        hdlExtension({
          createSession: () => ({ execute: () => ({ status, logs: raw, diagnostics: [{ severity: 'error', file: 'tb.v', line: 3, message: '\x1b[31mproblem\x1b[0m' }] }), dispose() {} }),
        }),
      ],
    });
    const container = document.createElement('div');
    await engine.renderDocument(source, container, { locale: 'pt' });
    expect(container.querySelector('details')?.open).toBe(true);
    expect(container.querySelector(`[data-hdl-status=${status}]`)).not.toBeNull();
    expect(container.querySelector('details')?.textContent).toContain('tb.v:3 problem');
    expect(container.querySelector('details')?.textContent).not.toContain('\x1b');
    await engine.dispose();
  });
  test('uses streamed logs only when final logs are absent; preserves logs when execution throws', async () => {
    for (const throws of [false, true]) {
      const engine = new MarkdownEngine({
        executionPolicy: { hdl: { enabled: true } },
        extensions: [
          hdlExtension({
            createSession: () => ({
              execute: (_r, c) => {
                c.onHDLUpdate?.({ type: 'log', text: raw });
                if (throws) throw Error('compiler stopped');
                return { status: 'success' };
              },
              dispose() {},
            }),
          }),
        ],
      });
      const container = document.createElement('div');
      await engine.renderDocument(source, container);
      expect(container.querySelector('.hdl-logs')?.textContent).toBe(normalizeHDLText(raw));
      expect(container.querySelector('details')?.open).toBe(throws);
      await engine.dispose();
    }
  });
});
