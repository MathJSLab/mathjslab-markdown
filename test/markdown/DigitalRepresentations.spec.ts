import { TextEncoder } from 'node:util';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder });
const fence = (source: unknown, info = '') => '```wavedrom ' + info + '\n' + JSON.stringify(source) + '\n```';
const register = {
  reg: [
    { bits: 4, name: 'MODE', attr: 'RW' },
    { bits: 4, name: 'FLAGS', type: 2 },
  ],
  config: { bits: 8, lanes: 1 },
};
const logic = { assign: [['Y', ['|', ['&', 'A', 'B'], ['~', 'C']]]] };

describe('digital representation families', () => {
  test.each([register, logic])('renders native family %j locally, sizes and disposes in Shadow DOM', async (source) => {
    const engine = createEducationalMarkdownEngine({ features: ['wavedrom'], securityMode: 'strict', allowedCapabilities: [] });
    const root = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.append(container);
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      const session = await engine.renderDocument(fence(source, '{width=50% height=8rem}'), container, {
        theme: 'dark',
        resourcePolicy: { allowNetwork: false },
        onDiagnostic: (d) => diagnostics.push(d),
      });
      expect(diagnostics).toEqual([]);
      const svg = container.querySelector<SVGSVGElement>('svg')!;
      expect(svg).not.toBeNull();
      expect(svg.style.width).toBe('100%');
      expect(svg.style.height).toBe('8rem');
      expect(svg.getAttribute('aria-label')).toBe('reg' in source ? 'WaveDrom register diagram' : 'WaveDrom logic diagram');
      expect(svg.querySelector('style')?.textContent).toContain(`#${svg.id}`);
      if ('assign' in source) {
        expect(svg.querySelector('.wire')?.getAttribute('style')).toContain('stroke:#eee');
        expect(svg.querySelector('.siglabel')?.getAttribute('style')).toContain('fill:#333');
        expect(svg.querySelector('text')?.getAttribute('style')).toContain('fill:#eee');
        expect(svg.textContent).toContain('Y');
      } else {
        expect(svg.textContent).toContain('MODE');
        expect(svg.querySelector('[stroke="#eee"]')).not.toBeNull();
        expect(svg.querySelector('rect[style*="fill-opacity:.25"]')).not.toBeNull();
      }
      await session.update(fence({ signal: [{ name: 'clk', wave: 'p...' }] }));
      expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('WaveDrom timing diagram');
      await session.dispose();
      expect(container.querySelector('svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    { reg: [] },
    { assign: [] },
    { reg: [{ bits: 0 }] },
    { reg: [{ bits: 1.5 }] },
    { reg: [{ bits: 8 }], config: { bits: 4 } },
    { reg: [{ bits: 4096, name: 1 }], config: { bits: 4096, lanes: 256 } },
    { reg: [{ bits: 8, name: { script: 'bad' } }] },
    { assign: [['Y', []]] },
    { assign: [['Y', ['eval', 'A']]] },
    { assign: [['Y', ['~', 'A', 'B']]] },
    { assign: [['Y', { name: 'A' }]] },
    { signal: [{ wave: 'p' }], reg: [{ bits: 8 }] },
    { assign: [['Y', 'A']], config: { treeSpacing: -1 } },
    { assign: [['Y', ['&', ...Array.from({ length: 513 }, () => 'A')]]] },
    { assign: Array.from({ length: 65 }, (_, index) => [`Y${index}`, 'A']) },
    { reg: [{ bits: 8, attr: Array.from({ length: 17 }, () => 'RW') }] },
    { reg: [{ bits: 64, name: 1 }] },
    { assign: [['Y', Array.from({ length: 18 }).reduce<unknown>((tree) => ['~', tree], 'A')]] },
  ])('rejects malformed or excessive data %j without affecting the next diagram', async (source) => {
    const engine = createEducationalMarkdownEngine({ features: ['wavedrom'] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(fence(source) + '\n\n' + fence(logic), container, { onDiagnostic: (d) => diagnostics.push(d) });
      expect(diagnostics).toHaveLength(1);
      expect(container.querySelectorAll('svg')).toHaveLength(1);
      expect(container.querySelector('.markdown-extension-fallback')).not.toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test('isolates native logic styles and IDs across families and escapes hostile labels', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['wavedrom'] });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence(register) + '\n\n' + fence(logic) + '\n\n' + fence({ assign: [['<script>alert(1)</script>', ['&', 'A', 'B']]] }), container);
      expect(container.querySelectorAll('svg')).toHaveLength(3);
      expect(container.querySelector('script, foreignObject')).toBeNull();
      const ids = [...container.querySelectorAll('[id]')].map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    } finally {
      await engine.dispose();
    }
  });

  test('accepts numeric register bit patterns without treating them as layout dimensions', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['wavedrom'] });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(fence({ reg: [{ bits: 16, name: 0xffff, attr: 65535 }] }), container);
      expect(container.querySelector('svg')).not.toBeNull();
      expect(container.querySelector('[role="alert"]')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    ['vhdl', 'entity gate is\nport (a, b : in bit; y : out bit);\nend gate;'],
    ['vhd', 'architecture rtl of gate is begin y <= a and b; end rtl;'],
    ['verilog', 'module gate(input a, b, output y); assign y = a & b; endmodule'],
    ['systemverilog', 'module gate(input logic a, b, output logic y); assign y = a & b; endmodule'],
    ['sv', 'module gate; initial $display("<script>bad</script>"); endmodule'],
  ])('highlights %s as literal code without executing or rendering it as a circuit', async (language, source) => {
    const engine = createEducationalMarkdownEngine();
    try {
      const container = document.createElement('div');
      container.innerHTML = engine.parse('```' + language + '\n' + source + '\n```');
      expect(container.querySelector('code.hljs .hljs-keyword')).not.toBeNull();
      expect(container.querySelector('code')?.textContent?.trim()).toBe(source);
      expect(container.querySelector('script, svg')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });
});
