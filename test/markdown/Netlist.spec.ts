import { readFileSync } from 'node:fs';
import { TextEncoder } from 'node:util';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { validateNetlist } from '../../src/markdown/extensions/netlist/spec.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder });
const fixture = readFileSync(new URL('./extensions/netlist.md', import.meta.url), 'utf8');
const data = JSON.parse(fixture.replace(/^```netlist\n/, '').replace(/\n```\s*$/, ''));
const fence = (value: unknown, info = '') => '```netlist ' + info + '\n' + JSON.stringify(value) + '\n```';

describe('netlist schematics with the real layout engine', () => {
  test.each(['pt', 'en', 'es'].flatMap((lang) => ['porta-and-netlist', 'multiplexador-netlist', 'somador-netlist', 'registrador-netlist'].map((lesson) => ({ lang, lesson }))))(
    'renders $lang/$lesson locally without host capabilities',
    async ({ lang, lesson }) => {
      const engine = createEducationalMarkdownEngine({ features: ['netlist'], securityMode: 'strict', allowedCapabilities: [] });
      const container = document.createElement('div');
      const diagnostics: MarkdownDiagnostic[] = [];
      try {
        const session = await engine.renderDocument(readFileSync(new URL(`../../example/${lang}/${lesson}.md`, import.meta.url), 'utf8'), container, {
          resourcePolicy: { allowNetwork: false },
          onDiagnostic: (d) => diagnostics.push(d),
        });
        expect(diagnostics).toEqual([]);
        const svg = container.querySelector('svg')!;
        expect(svg).not.toBeNull();
        expect(svg.getAttribute('aria-label')).toMatch(/^Netlist schematic:/);
        expect(svg.querySelector('text')).not.toBeNull();
        expect(svg.querySelector('style')?.textContent).toContain('#' + svg.id);
        expect(svg.getAttribute('style')).toContain('background');
        await session.dispose();
        expect(container.querySelector('svg')).toBeNull();
      } finally {
        await engine.dispose();
      }
    },
    30_000,
  );

  test('serializes simultaneous diagrams and isolates IDs in Shadow DOM', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['netlist'], maxConcurrentRenders: 4 });
    const root = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.append(container);
    try {
      const session = await engine.renderDocument([fixture, fixture, fixture].join('\n\n'), container, { theme: 'dark' });
      expect(container.querySelectorAll('svg')).toHaveLength(3);
      const ids = [...container.querySelectorAll('[id]')].map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      await session.update(fence(data, '{width=50% height=10rem}'));
      expect(container.querySelectorAll('svg')).toHaveLength(1);
      expect(container.querySelector<SVGSVGElement>('svg')?.style.height).toBe('10rem');
    } finally {
      await engine.dispose();
    }
  });

  test('selects an explicit top or a unique attribute without rendering unrelated modules', () => {
    const other = JSON.parse(JSON.stringify(data));
    other.modules.other = other.modules.and_gate;
    expect(() => validateNetlist(other)).toThrow('Ambiguous');
    const selected = validateNetlist({ top: 'other', netlist: other });
    expect(Object.keys(selected.netlist.modules)).toEqual(['other']);
    expect(() => validateNetlist({ top: 'absent', netlist: data })).toThrow('Unknown');
  });

  test.each([
    {},
    { modules: {} },
    { modules: { top: { ports: {}, cells: {} } } },
    { modules: { top: { ports: { A: { direction: 'inout', bits: [2] } }, cells: {} } } },
    { modules: { top: { ports: { A: { direction: 'input', bits: ['z'] } }, cells: {} } } },
    { modules: { top: { ports: { A: { direction: 'input', bits: [-1] } }, cells: {} } } },
    { modules: { top: { ports: { A: { direction: 'input', bits: Array.from({ length: 257 }, () => 2) } }, cells: {} } } },
    { modules: { top: { ports: {}, cells: { a: { type: '$and', connections: { A: [2] }, port_directions: {} } } } } },
    { modules: { top: { ports: { '<script>bad</script>': { direction: 'input', bits: [2] } }, cells: {} } } },
  ])('reports invalid input %j and continues with a valid diagram', async (invalid) => {
    const engine = createEducationalMarkdownEngine({ features: ['netlist'] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(invalid) + '\n\n' + fixture, container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics).toHaveLength(1);
      expect(container.querySelector('.markdown-extension-fallback')).not.toBeNull();
      expect(container.querySelectorAll('svg')).toHaveLength(1);
    } finally {
      await engine.dispose();
    }
  });

  test('rejects prototype keys and resource amplification before layout', () => {
    expect(() => validateNetlist(JSON.parse('{"modules":{},"__proto__":{}}'))).toThrow('Unsupported');
    expect(() => validateNetlist({ modules: { top: { ports: { A: { direction: 'input', bits: ['x'] } }, cells: {} } } })).toThrow('Invalid netlist bit');
    const large = JSON.parse(JSON.stringify(data));
    large.modules.and_gate.cells = Object.fromEntries(Array.from({ length: 129 }, (_, i) => ['c' + i, data.modules.and_gate.cells.gate]));
    expect(() => validateNetlist(large)).toThrow('128 cells');
    expect(() => validateNetlist({ modules: { top: { ports: { A: { direction: 'input', bits: [Number.NaN] } }, cells: {} } } })).toThrow('finite');
  });

  test('renders generic cells and binary constants without changing input connectivity', async () => {
    const custom = JSON.parse(JSON.stringify(data));
    custom.modules.and_gate.cells.gate.type = 'custom_gate';
    custom.modules.and_gate.cells.gate.connections.B = ['1'];
    const engine = createEducationalMarkdownEngine({ features: ['netlist'] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(custom), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics).toEqual([]);
      expect(container.querySelector('svg')?.textContent).toContain('custom_gate');
      expect(custom.modules.and_gate.cells.gate.connections.B).toEqual(['1']);
    } finally {
      await engine.dispose();
    }
  });

  test('retains source as code when the feature is disabled and ignores aborted rendering', async () => {
    const disabled = createEducationalMarkdownEngine();
    expect(disabled.parse(fixture)).toContain('<code');
    await disabled.dispose();
    const engine = createEducationalMarkdownEngine({ features: ['netlist'] });
    const controller = new AbortController();
    controller.abort();
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fixture, container, { signal: controller.signal });
      expect(container.querySelector('svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });
});
