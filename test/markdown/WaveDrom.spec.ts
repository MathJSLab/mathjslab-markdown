import { TextEncoder } from 'node:util';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { waveDromExtension } from '../../src/markdown/extensions/wavedrom/extension.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder });
const waveform = "{signal: [{name: 'clk', wave: 'p...'}, {name: 'data', wave: 'x.34', data: ['A', 'B']}]}";
const fence = (source = waveform) => `\`\`\`wavedrom\n${source}\n\`\`\``;
const createEngine = () => createEducationalMarkdownEngine({ features: ['wavedrom'], securityMode: 'sanitized', allowedCapabilities: [] });

describe('WaveDrom timing diagrams with the real renderer', () => {
  test('parses comments and strict JSON, and rejects executable expressions', async () => {
    const extension = waveDromExtension();
    const container = document.createElement('div');
    for (const source of ['{"signal":[{"name":"clk","wave":"p..."}]}', '{\n// A clock\nsignal: [{wave: "p..."},],\n}']) {
      await extension.fences![0]!.render(container, source, {});
      expect(container.querySelector('svg')).not.toBeNull();
    }
    await extension.fences![0]!.render(container, '{signal: (() => [{wave: "p"}])()}', {});
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('.markdown-extension-fallback')).not.toBeNull();
    await extension.dispose!();
  });

  test('bounds expanded waveforms and lane counts before library rendering', async () => {
    const extension = waveDromExtension();
    const container = document.createElement('div');
    for (const source of [JSON.stringify({ signal: Array.from({ length: 257 }, () => ({ wave: 'p' })) }), JSON.stringify({ signal: [{ wave: 'p'.repeat(1000), period: 100 }] })]) {
      await extension.fences![0]!.render(container, source, {});
      expect(container.querySelector('[role="alert"]')).not.toBeNull();
      expect(container.querySelector('svg')).toBeNull();
    }
    await extension.dispose!();
  });

  test('removes external SVG references, untrusted styles, and disguised CSS URLs', async () => {
    const extension = waveDromExtension();
    const container = document.createElement('div');
    for (const name of [
      ['image', { href: 'https://outside.test/image.svg' }],
      ['tspan', { style: 'fill:url(https://outside.test/image.svg)' }, 'label'],
      ['tspan', { style: 'fill:u\\72l(https://outside.test/image.svg)' }, 'label'],
      ['style', {}, 'body {color:red}'],
    ]) {
      await extension.fences![0]!.render(container, JSON.stringify({ signal: [{ name, wave: 'p...' }] }), {});
      expect(container.querySelector('svg')).not.toBeNull();
      expect(container.innerHTML).not.toContain('outside.test');
      expect(container.querySelectorAll('svg style')).toHaveLength(1);
      expect(container.querySelector('svg style')?.textContent).not.toContain('body');
    }
    await extension.dispose!();
  });

  test('renders JSON5 locally in restricted mode with a complete, accessible SVG', async () => {
    const engine = createEngine();
    const container = document.createElement('div');
    await engine.renderDocument(fence(), container, { resourcePolicy: { allowNetwork: false } });
    const svg = container.querySelector('svg')!;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('viewBox')).toMatch(/^0 0 \d+ \d+$/);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.textContent).toContain('clk');
    expect(svg.textContent).toContain('A');
    expect(svg.querySelectorAll('use').length).toBeGreaterThan(0);
    for (const use of svg.querySelectorAll('use')) {
      const target = use.getAttribute('href') ?? use.getAttribute('xlink:href');
      expect(target).toMatch(/^#markdown-wavedrom-/);
      expect(Array.from(svg.querySelectorAll('[id]')).some((element) => `#${element.id}` === target)).toBe(true);
    }
    expect(svg.querySelector('style')?.textContent).toContain(`#${svg.id} text{`);
    await engine.dispose();
  });

  test('isolates IDs and styles across concurrent diagrams and supports dark theme in Shadow DOM', async () => {
    const engine = createEngine();
    const root = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.append(container);
    const session = await engine.renderDocument(`${fence()}\n\n${fence()}`, container, { theme: 'dark' });
    const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id);
    expect(ids.length).toBeGreaterThan(10);
    expect(new Set(ids).size).toBe(ids.length);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(Array.from(container.querySelectorAll('rect')).some((element) => element.getAttribute('style')?.includes('#1e1e1e'))).toBe(true);
    await session.update(fence(), { theme: 'light' });
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelector('svg')?.textContent).toContain('data');
    expect(Array.from(container.querySelectorAll('rect')).some((element) => element.getAttribute('style')?.includes('#1e1e1e'))).toBe(false);
    await session.dispose();
    expect(container.childNodes).toHaveLength(0);
    await engine.dispose();
  });

  test('preserves invalid source, diagnoses the error, and renders unrelated valid blocks', async () => {
    const engine = createEngine();
    const diagnostics: MarkdownDiagnostic[] = [];
    const container = document.createElement('div');
    await engine.renderDocument(`${fence('{signal: [}')}\n\n${fence()}`, container, { onDiagnostic: (value) => diagnostics.push(value) });
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toContain('{signal: [}');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(diagnostics).toEqual([expect.objectContaining({ extension: 'WaveDrom', language: 'wavedrom', code: 'extension-render-error' })]);
    await engine.dispose();
  });

  test.each([
    'null',
    '[]',
    '{}',
    '{signal: []}',
    '{signal: [null]}',
    '{signal: [{wave: 12}]}',
    '{signal: [{wave: "p", period: Infinity}]}',
    '{signal: [{wave: "p", period: 101}]}',
    '{signal: [{wave: "p"}], config: {skin: "unknown"}}',
    '{signal: [{wave: "p"}], __proto__: {polluted: true}}',
  ])('rejects malformed or unbounded WaveJSON: %s', async (source) => {
    const extension = waveDromExtension();
    const container = document.createElement('div');
    await extension.fences![0]!.render(container, source, {});
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.querySelector('svg')).toBeNull();
    await extension.dispose!();
  });

  test('honors source limits and cancellation before rendering', async () => {
    const extension = waveDromExtension();
    const container = document.createElement('div');
    await extension.fences![0]!.render(container, waveform, { maxSourceBytes: 4 });
    expect(container.textContent).toContain('Source exceeds');
    container.textContent = 'unchanged';
    const controller = new AbortController();
    controller.abort();
    await extension.fences![0]!.render(container, waveform, { signal: controller.signal });
    expect(container.textContent).toBe('unchanged');
    await extension.dispose!();
  });

  test('supports groups and event connections while sanitizing active SVG annotations', async () => {
    const extension = waveDromExtension();
    const container = document.createElement('div');
    const source =
      "{signal: [['Bus', {name: ['tspan', {onclick: 'alert(1)'}, 'clk'], wave: 'p...', node: 'a...'}, {name: 'ack', wave: '0.1.', node: '..b.'}]], edge: ['a~>b transfer'], head: {text: 'Handshake', tick: 0}}";
    await extension.fences![0]!.render(container, source, {});
    expect(container.querySelector('svg')?.textContent).toContain('Handshake');
    expect(container.querySelector('svg')?.textContent).toContain('transfer');
    expect(container.querySelector('[onclick],script,foreignObject')).toBeNull();
    const parent = document.createElement('div');
    parent.append(container);
    await extension.disposeContainer!(parent);
    expect(container.childNodes).toHaveLength(0);
    await extension.dispose!();
  });
});
