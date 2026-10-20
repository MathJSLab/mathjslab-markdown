import { TextEncoder } from 'node:util';
import { MarkdownEngine, type MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { vcdExtension } from '../../src/markdown/extensions/vcd/extension.js';
import { parseVCD, vcdValueAt } from '../../src/markdown/extensions/vcd/parser.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';

Object.assign(globalThis, { TextEncoder });
const source = `$timescale 1 ns $end
$scope module tb $end
$var wire 1 ! clk $end
$var reg 4 " data [3:0] $end
$var wire 1 ! alias $end
$upscope $end
$enddefinitions $end
$dumpvars
0!
bx "
$end
#3
1!
b10 "
#10
z!
bz "
#20
x!
b1010 "
#30
0!
#40
`;
const fence = (text = source) => '```vcd {width=50% height=20rem}\n' + text + '\n```';

describe('digital VCD simulation results', () => {
  test('preserves the elapsed time of a recording without signal declarations', () => {
    const empty = '$timescale 1 fs $end\n$enddefinitions $end\n#0\n$dumpvars\n$end\n#133000000\n';
    expect(parseVCD(empty)).toEqual({ timescale: { magnitude: 1, unit: 'fs' }, signals: [], endTime: 133000000, sameTimeChanges: 0 });
    expect(() => parseVCD(empty + '1!\n')).toThrow('Unknown VCD identifier');
  });
  test('keeps wide values in the table and bounds dense windows without sampling', async () => {
    const header = '$timescale 1ns $end\n$var reg 256 ! bus $end\n$enddefinitions $end\n$dumpvars\nbx !\n$end\n';
    const engine = new MarkdownEngine({ extensions: [vcdExtension()] });
    const container = document.createElement('div');
    try {
      const session = await engine.renderDocument(fence(header + '#100\n'), container);
      expect(container.querySelector('.vcd-values')?.textContent).toContain('x'.repeat(256));
      expect([...container.querySelectorAll('svg text')].some((text) => text.textContent?.includes('x'.repeat(256)))).toBe(false);
      const dense = header + Array.from({ length: 5000 }, (_, i) => `#${i + 1}\nb${i % 2} !\n`).join('');
      await session.update(fence(dense));
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('[role=status]')).not.toBeNull();
      const end = container.querySelector<HTMLInputElement>('input[aria-label="End"]')!;
      end.value = '3';
      end.dispatchEvent(new Event('change'));
      expect(container.querySelector('svg')).not.toBeNull();
      expect(parseVCD(dense).signals[0]!.changes).toHaveLength(5001);
    } finally {
      await engine.dispose();
    }
  });
  test('preserves timescale, irregular timestamps, aliases and four-state bus padding', () => {
    const model = parseVCD(source);
    expect(model.timescale).toEqual({ magnitude: 1, unit: 'ns' });
    expect(model.endTime).toBe(40);
    expect(model.signals.map((s) => s.name)).toEqual(['tb.clk', 'tb.data[3:0]', 'tb.alias']);
    expect(model.signals[0]!.changes).toBe(model.signals[2]!.changes);
    expect(vcdValueAt(model.signals[0]!, 2)).toBe('0');
    expect(vcdValueAt(model.signals[0]!, 3)).toBe('1');
    expect(vcdValueAt(model.signals[0]!, 10)).toBe('z');
    expect(vcdValueAt(model.signals[1]!, 0)).toBe('xxxx');
    expect(vcdValueAt(model.signals[1]!, 3)).toBe('0010');
    expect(vcdValueAt(model.signals[1]!, 10)).toBe('zzzz');
    expect(vcdValueAt(model.signals[1]!, 20)).toBe('1010');
  });
  test.each(['s', 'ms', 'us', 'ns', 'ps', 'fs'])('accepts compact timescale 100%s', (unit) => {
    expect(parseVCD(source.replace('1 ns', '100' + unit)).timescale).toEqual({ magnitude: 100, unit });
  });
  test('holds unknown before initialization and keeps the last value at one timestamp', () => {
    const model = parseVCD(source.replace('0!\n', '').replace('#3\n1!', '#3\n0!\n1!'));
    expect(vcdValueAt(model.signals[0]!, 0)).toBe('x');
    expect(vcdValueAt(model.signals[0]!, 3)).toBe('1');
    expect(model.sameTimeChanges).toBe(1);
    expect(() => vcdValueAt(model.signals[0]!, Number.NaN)).toThrow();
  });
  test.each([
    '',
    source.replace('1 ns', '2 ns'),
    source.replace('$enddefinitions $end', ''),
    source.replace('$upscope $end', ''),
    source.replace('wire 1 !', 'real 1 !'),
    source.replace('reg 4', 'reg 257'),
    source.replace('reg 4 "', 'reg 4 !'),
    source + '#2\n',
    source + '#9007199254740992\n',
    source + '#-1\n',
    source + '1?\n',
    source + 'r1.5 !\n',
    source + 'b11111 "\n',
    source + '$dumpvars\n',
    source + '$end\n',
    source + '$unknown $end\n',
  ])('rejects incomplete, unsupported or malformed recordings %#', (invalid) => {
    expect(() => parseVCD(invalid)).toThrow();
  });
  test('bounds source and variable count before rendering', () => {
    expect(() => parseVCD('x'.repeat(512 * 1024 + 1))).toThrow('512 KiB');
    const vars = Array.from({ length: 129 }, (_, i) => `$var wire 1 id${i} s${i} $end`).join('\n');
    expect(() => parseVCD(`$timescale 1ns $end\n${vars}\n$enddefinitions $end\n`)).toThrow('signal count');
  });
  test('renders proportional intervals, cursor values, radix, selection, sizing and updates in Shadow DOM', async () => {
    const engine = new MarkdownEngine({ extensions: [vcdExtension()], securityMode: 'strict' });
    const shadow = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.append(container);
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      const session = await engine.renderDocument(fence(), container, { theme: 'dark', locale: 'en-US', resourcePolicy: { allowNetwork: false }, onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics).toEqual([]);
      expect(container.querySelector('svg')?.style.height).toBe('20rem');
      const input = (name: string) => container.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!;
      input('Start').value = '10';
      input('Start').dispatchEvent(new Event('change'));
      expect(input('Cursor').value).toBe('10');
      input('Start').value = '0';
      input('Start').dispatchEvent(new Event('change'));
      input('Cursor').value = '20';
      input('Cursor').dispatchEvent(new Event('change'));
      expect(container.querySelector('.vcd-values')?.textContent).toContain('0xA');
      expect(container.querySelector('[data-vcd-cursor]')?.getAttribute('x1')).toBe('475');
      const radix = container.querySelector('select')!;
      radix.value = 'binary';
      radix.dispatchEvent(new Event('change'));
      expect(container.querySelector('.vcd-values')?.textContent).toContain('1010');
      input('Start').value = '10';
      input('End').value = '30';
      input('End').dispatchEvent(new Event('change'));
      expect(container.querySelector('svg')?.getAttribute('aria-label')).toContain('10–30');
      expect(container.querySelector('svg')?.style.height).toBe('20rem');
      const checkbox = container.querySelector<HTMLInputElement>('input[type=checkbox]')!;
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      expect(container.querySelectorAll('.vcd-values tr')).toHaveLength(3);
      input('End').value = '9';
      input('End').dispatchEvent(new Event('change'));
      expect(container.querySelector('[role=status]')).not.toBeNull();
      container.querySelector('button')!.click();
      expect(container.querySelector('svg')).not.toBeNull();
      await session.update(fence(source.replace('clk', '<script>evil</script>')));
      expect(container.querySelector('script')).toBeNull();
      expect(container.textContent).toContain('<script>evil</script>');
      const oldButton = container.querySelector('button')!;
      await session.dispose();
      oldButton.click();
      expect(container.querySelector('svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });
  test('shows zero-duration snapshots without inventing a time interval', async () => {
    const engine = new MarkdownEngine({ extensions: [vcdExtension()] });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(source.slice(0, source.indexOf('#3'))), container);
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('.vcd-values')?.textContent).toContain('xxxx');
      expect(container.textContent).toContain('Zero-duration');
    } finally {
      await engine.dispose();
    }
  });
  test('reports same-time glitches and malformed input with source location without blocking another recording', async () => {
    const engine = new MarkdownEngine({ extensions: [vcdExtension()] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence('bad') + '\n\n' + fence(source.replace('0!\n', '0!\n1!\n')), container, {
        sourceUrl: new URL('https://assets.test/vcd.md'),
        onDiagnostic: (d) => diagnostics.push(d),
      });
      expect(diagnostics.map((d) => d.code)).toEqual(['extension-render-error', 'vcd-same-time-changes']);
      expect(diagnostics[0]?.line).toBe(1);
      expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe('bad');
      expect(container.querySelector('svg')).not.toBeNull();
    } finally {
      await engine.dispose();
    }
  });
  test('integrates raw VCD from a host HDL executor and preserves the controls when resized', async () => {
    let disposed = 0;
    const engine = new MarkdownEngine({
      extensions: [
        hdlExtension({
          createSession: () => ({
            execute: () => ({ status: 'success', vcd: source }),
            dispose: () => {
              disposed++;
            },
          }),
        }),
      ],
      executionPolicy: { hdl: { enabled: true } },
      securityMode: 'trusted',
    });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    const request = { operation: 'simulate', top: 'tb', files: [{ name: 'tb.v', source: 'module tb; endmodule' }] };
    try {
      const session = await engine.renderDocument('```verilog-run {width=50% height=10rem}\n' + JSON.stringify(request) + '\n```', container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics).toEqual([]);
      expect(container.querySelector('svg')?.style.height).toBe('10rem');
      expect(container.querySelector<HTMLElement>('.vcd')?.style.width).toBe('100%');
      expect(container.querySelector('.vcd-controls input')).not.toBeNull();
      expect(disposed).toBe(1);
      await session.dispose();
      expect(container.querySelector('svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });
});
