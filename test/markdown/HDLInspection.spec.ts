import { TextEncoder } from 'node:util';
import { MarkdownEngine, type HDLArtifact, type MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { vcdExtension } from '../../src/markdown/extensions/vcd/extension.js';
import { exportVCDCSV } from '../../src/markdown/extensions/vcd/export.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';
import { hdlInteractiveExtension } from '../../src/markdown/extensions/hdl-interactive/extension.js';
import { createHDLExports } from '../../src/markdown/hdl/artifacts.js';

Object.assign(globalThis, { TextEncoder });
const trace = '$timescale 10 ps $end\n$var wire 1 ! clk $end\n$var reg 4 " data $end\n$enddefinitions $end\n$dumpvars\n0!\nbx "\n$end\n#3\n1!\nb1110 "\n#7\n0!\nbz "\n#10\n';
const fence = (language: string, source: string) => '```' + language + '\n' + source + '\n```';
const request = { top: 'gate', files: [{ name: 'gate.v', source: 'module gate(input a,output y);assign y=a;endmodule' }] };
const input = (container: Element, name: string) => container.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!;
const click = (container: Element, selector: string) => container.querySelector<HTMLButtonElement>(selector)!.click();
const wait = async (condition: () => boolean) => {
  for (let i = 0; i < 200 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 5));
  expect(condition()).toBe(true);
};

describe('HDL inspection and local exports', () => {
  test('CSV preserves exact event times, held bits, aliases, x/z and escaped headings', () => {
    const csv = exportVCDCSV(trace, { start: 2, end: 8, signals: ['data'] });
    expect(csv).toBe('"tick (10 ps)","data"\r\n"2","xxxx"\r\n"3","1110"\r\n"7","zzzz"\r\n"8","zzzz"\r\n');
    expect(exportVCDCSV(trace.replace(' data ', ' =SUM(1) '))).toContain(`"'=SUM(1)"`);
    expect(exportVCDCSV(trace, { start: 3, end: 3 })).toContain('"3","1","1110"');
  });
  test.each([{ start: -1 }, { start: 4, end: 2 }, { end: 11 }, { signals: [] }, { signals: ['missing'] }, { signals: ['clk', 'clk'] }])('rejects invalid CSV selections %#', (options) =>
    expect(() => exportVCDCSV(trace, options)).toThrow(),
  );
  test('rejects dense CSV exports instead of truncating events', () => {
    const dense = '$timescale 1ns $end\n$var wire 1 ! y $end\n$enddefinitions $end\n' + Array.from({ length: 4100 }, (_, i) => `#${i}\n${i % 2}!\n`).join('');
    expect(() => exportVCDCSV(dense)).toThrow('4096');
  });
  test('inspects transitions, two cursors, exact signed buses, searches without deselection, and exports visible data', async () => {
    const artifacts: HDLArtifact[] = [];
    const engine = new MarkdownEngine({ extensions: [vcdExtension()] });
    const container = document.createElement('div');
    try {
      const session = await engine.renderDocument(fence('vcd', trace), container, { onHDLExport: (artifact) => artifacts.push(artifact) });
      click(container, '[data-vcd-transition=next]');
      expect(input(container, 'Cursor').value).toBe('3');
      input(container, 'Cursor B').value = '7';
      input(container, 'Cursor B').dispatchEvent(new Event('change'));
      expect(container.querySelector('.vcd-measurement')?.textContent).toContain('4 ticks = 40 ps');
      const radix = container.querySelector<HTMLSelectElement>('[aria-label=Radix]')!;
      radix.value = 'signed';
      radix.dispatchEvent(new Event('change'));
      expect(container.querySelector('.vcd-values')?.textContent).toContain('-2');
      expect(container.querySelector('.vcd-values')?.textContent).toContain('zzzz');
      const search = input(container, 'Find signals');
      search.value = 'data';
      search.dispatchEvent(new Event('input'));
      expect(container.querySelectorAll('.vcd-signals label[hidden]')).toHaveLength(1);
      expect(container.querySelectorAll('input[type=checkbox]:checked')).toHaveLength(2);
      click(container, '[data-hdl-export=vcd]');
      click(container, '[data-hdl-export=csv]');
      click(container, '[data-hdl-export=svg]');
      expect(artifacts[0]?.text).toBe(trace);
      expect(artifacts[1]?.text).toContain('"3","1","1110"');
      expect(artifacts[2]?.text).toContain('xmlns="http://www.w3.org/2000/svg"');
      const old = container.querySelector<HTMLButtonElement>('[data-hdl-export=vcd]')!;
      await session.dispose();
      old.click();
      expect(artifacts).toHaveLength(3);
    } finally {
      await engine.dispose();
    }
  });
  test('confirmed batch VCD remains inspectable and exportable after executor disposal', async () => {
    let disposed = 0;
    const result = { status: 'success' as const, vcd: trace, logs: 'done' };
    const artifacts: HDLArtifact[] = [];
    const engine = new MarkdownEngine({
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: () => result,
            dispose: () => {
              disposed++;
            },
          }),
        }),
      ],
      executionPolicy: { hdl: { enabled: true } },
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence('verilog-run', JSON.stringify({ ...request, operation: 'simulate' })), container, { onHDLExport: (artifact) => artifacts.push(artifact) });
      expect(disposed).toBe(1);
      result.logs = 'later mutation';
      click(container, '[data-vcd-transition=next]');
      expect(container.querySelector('[data-vcd-cursor]')?.getAttribute('data-vcd-cursor')).toBe('3');
      click(container, '[data-hdl-export=vcd]');
      click(container, '.hdl-execution > .hdl-exports [data-hdl-export=json]');
      expect(artifacts.some((artifact) => artifact.filename === 'simulation.vcd')).toBe(true);
      expect(
        artifacts.some((artifact) => artifact.mediaType.startsWith('application/json') && JSON.parse(artifact.text).schemaVersion === 1 && JSON.parse(artifact.text).result.logs === 'done'),
      ).toBe(true);
    } finally {
      await engine.dispose();
    }
  });
  test('interactive report exports committed input history and check outcomes, then clears on reset', async () => {
    const artifacts: HDLArtifact[] = [];
    const engine = new MarkdownEngine({
      extensions: [hdlInteractiveExtension({ createInteractiveSession: () => ({ step: () => ({ timeNs: 5, values: { y: '1' }, logs: 'confirmed' }), dispose: () => {} }) })],
      executionPolicy: { 'hdl-interactive': { enabled: true } },
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(
        fence(
          'verilog-live',
          JSON.stringify({
            ...request,
            inputs: [{ name: 'a', width: 1, initial: '1' }],
            outputs: [{ name: 'y', width: 1 }],
            stepNs: 10,
            stopTimeNs: 5,
            checks: [{ id: 'yes', timeNs: 5, signal: 'y', expected: '1' }],
          }),
        ),
        container,
        { onHDLExport: (artifact) => artifacts.push(artifact) },
      );
      click(container, '[data-hdl-action=step]');
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '5');
      click(container, '[data-hdl-export=json]');
      const report = JSON.parse(artifacts[0]!.text);
      expect(report.checks[0]).toMatchObject({ id: 'yes', status: 'passed', actual: '1' });
      expect(report.history).toEqual([{ startNs: 0, endNs: 5, inputs: { a: '1' } }]);
      click(container, '[data-hdl-action=reset]');
      await wait(() => container.querySelector('[data-hdl-time]')?.getAttribute('data-hdl-time') === '0');
      click(container, '[data-hdl-export=json]');
      const reset = JSON.parse(artifacts[1]!.text);
      expect(reset.result).toBeUndefined();
      expect(reset.history).toEqual([]);
      expect(reset.checks[0].status).toBe('pending');
    } finally {
      await engine.dispose();
    }
  });
  test('download URLs are revoked on disposal and detached controls cannot export', () => {
    const container = document.createElement('div');
    const revoked: string[] = [];
    let created = 0;
    const original = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = () => {};
    try {
      const dispose = createHDLExports(
        container,
        {
          resources: {
            createObjectURL: () => {
              created++;
              return 'blob:local';
            },
            revokeObjectURL: (url) => revoked.push(url),
          } as never,
        },
        [{ label: 'Export TXT', artifact: () => ({ filename: 'test.txt', mediaType: 'text/plain', text: 'local' }) }],
      );
      const button = container.querySelector('button')!;
      button.click();
      expect(created).toBe(1);
      dispose();
      expect(revoked).toEqual(['blob:local']);
      button.click();
      expect(created).toBe(1);
      dispose();
      expect(revoked).toHaveLength(1);
    } finally {
      HTMLAnchorElement.prototype.click = original;
    }
  });
  test('export callback failures are diagnostics without breaking the document', () => {
    const diagnostics: MarkdownDiagnostic[] = [];
    const container = document.createElement('div');
    const dispose = createHDLExports(
      container,
      {
        onHDLExport: () => {
          throw new Error('host failure');
        },
        onDiagnostic: (value) => diagnostics.push(value),
      },
      [{ label: 'Export TXT', artifact: () => ({ filename: 'test.txt', mediaType: 'text/plain', text: 'local' }) }],
    );
    try {
      container.querySelector('button')!.click();
      expect(diagnostics[0]?.code).toBe('hdl-export-error');
    } finally {
      dispose();
    }
  });
});
