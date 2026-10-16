import { jest } from '@jest/globals';
import { TextEncoder } from 'node:util';
import { readFileSync } from 'node:fs';
import { MarkdownEngine, type MarkdownDocumentContext, type MarkdownDiagnostic, type MarkdownExtension } from '../../src/MarkdownEngine.js';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { resolveRenderSize } from '../../src/markdown/renderSizing.js';

Object.assign(globalThis, { TextEncoder });
const fence = (info = '', body = 'unchanged\n\ninput') => `\`\`\`picture ${info}\n${body}\n\`\`\``;
const extension = (seen: Array<{ source: string; context: MarkdownDocumentContext }>, kind: 'intrinsic' | 'viewport' = 'intrinsic'): MarkdownExtension => ({
  name: 'picture',
  fences: [
    {
      language: 'picture',
      className: 'picture',
      sizing: kind,
      render: async (container, source, context) => {
        seen.push({ source, context });
        container.innerHTML = '<svg viewBox="0 0 200 100" width="200" height="100"><path d="M0 0L200 100"/></svg><button>Control</button>';
      },
    },
  ],
});

describe('renderer size attributes', () => {
  test.each(['auto', '50%', '100%', '240px', '18rem', '.5rem'])('accepts width %s with quoted and unquoted values', (value) => {
    for (const input of [`{width=${value}}`, `{width="${value}"}`, `{width='${value}'}`]) {
      expect(resolveRenderSize(input, 'picture', {}, undefined, {})).toEqual({ width: value });
    }
  });
  test.each(['0px', '-2rem', '101%', 'NaNpx', 'Infinitypx', '10em', 'calc(20px)', 'url(x)', '1e309px'])('rejects invalid width %s without replacing defaults', (value) => {
    const diagnostics: MarkdownDiagnostic[] = [];
    expect(resolveRenderSize(`{width="${value}"}`, 'picture', { defaults: { width: '12rem' } }, undefined, { onDiagnostic: (d) => diagnostics.push(d) })).toEqual({ width: '12rem' });
    expect(diagnostics[0]).toMatchObject({ code: 'fence-size-invalid', severity: 'warning' });
  });
  test('resolves fields independently, rejects duplicate keys and percentage heights', () => {
    const diagnostics: MarkdownDiagnostic[] = [];
    const size = resolveRenderSize(
      '{width=10px width=50% height=50% display=inline}',
      'picture',
      {
        defaults: { width: '90%', height: '15rem', display: 'block' },
        extensions: { picture: { width: '24rem' } },
      },
      { width: '100%', height: 'auto' },
      { onDiagnostic: (d) => diagnostics.push(d) },
    );
    expect(size).toEqual({ width: '24rem', height: '15rem', display: 'inline' });
    expect(diagnostics).toHaveLength(2);
    expect(Object.isFrozen(size)).toBe(true);
  });
  test.each(['trusted', 'sanitized', 'strict'] as const)('preserves the body and reports source locations in %s mode', async (securityMode) => {
    const seen: Array<{ source: string; context: MarkdownDocumentContext }> = [];
    const engine = new MarkdownEngine({ profile: 'core', securityMode, extensions: [extension(seen)] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    const body = 'water\n  original header\n\n  3  2  V2000\nM  END\n$$$$';
    const session = await engine.renderDocument(`Intro\n\n${fence('{width="50%" height=25%}', body)}`, container, {
      width: 999,
      height: 888,
      sourceUrl: new URL('https://example.test/lesson.md'),
      onDiagnostic: (d) => diagnostics.push(d),
    });
    expect(seen[0]?.source).toBe(body);
    expect(seen[0]?.context).toMatchObject({ width: 999, height: 888, renderSize: { width: '50%' } });
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'fence-size-invalid', line: 3, sourceUrl: new URL('https://example.test/lesson.md') })]);
    expect(container.querySelector<HTMLElement>('.picture')?.style.width).toBe('50%');
    expect(container.querySelector<SVGElement>('svg')?.style.width).toBe('100%');
    await session.dispose();
    await engine.dispose();
  });
  test('fits the graphic without scaling controls, then removes overrides on update', async () => {
    const seen: Array<{ source: string; context: MarkdownDocumentContext }> = [];
    const engine = new MarkdownEngine({ profile: 'core', extensions: [extension(seen)] });
    const container = document.createElement('div');
    const session = await engine.renderDocument(fence('{width=50% height=12rem display=inline}'), container);
    expect(container.querySelector<HTMLElement>('.picture')?.style.display).toBe('inline-block');
    expect(container.querySelector<HTMLElement>('.picture')?.style.height).toBe('auto');
    expect(container.querySelector<SVGElement>('svg')?.style.height).toBe('12rem');
    expect(container.querySelector('svg')?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    expect(container.querySelector('button')?.getAttribute('style')).toBeNull();
    await session.update(fence());
    expect(container.querySelector('.picture')?.getAttribute('style')).toBeNull();
    expect(seen[0]?.context.renderSize).toEqual({ width: '50%', height: '12rem', display: 'inline' });
    expect(seen[1]?.context.renderSize).toBeUndefined();
    await session.dispose();
    await engine.dispose();
  });
  test('does not interpret metadata on ordinary code or nonvisual fences', async () => {
    const engine = new MarkdownEngine();
    const html = engine.parse('```javascript {width=50%}\nconst x = 1;\n```');
    expect(html).not.toContain('data-markdown-size-info');
    await engine.dispose();
  });
  test('restores requested width when a renderer changes its frame', async () => {
    const seen: Array<{ source: string; context: MarkdownDocumentContext }> = [];
    const renderer = extension(seen);
    const render = renderer.fences![0]!.render;
    renderer.fences![0]!.render = async (container, source, context) => {
      (container as HTMLElement).style.width = '100%';
      (container as HTMLElement).style.height = '100px';
      await render(container, source, context);
    };
    const engine = new MarkdownEngine({ profile: 'core', extensions: [renderer] });
    const container = document.createElement('div');
    await engine.renderDocument(fence('{width=50%}'), container);
    expect(container.querySelector<HTMLElement>('.picture')?.style.width).toBe('50%');
    expect(container.querySelector<HTMLElement>('.picture')?.style.height).toBe('auto');
    await engine.dispose();
  });
  test('leaves native visual defaults unchanged when no sizing is requested', async () => {
    const seen: Array<{ source: string; context: MarkdownDocumentContext }> = [];
    const engine = new MarkdownEngine({ profile: 'core', extensions: [extension(seen)] });
    const container = document.createElement('div');
    await engine.renderDocument(fence(), container);
    expect(container.querySelector('svg')?.getAttribute('style')).toBeNull();
    expect(container.querySelector('.picture')?.hasAttribute('data-markdown-sized')).toBe(false);
    await engine.dispose();
  });
  test('establishes viewport geometry before renderer initialization', async () => {
    const seen: Array<{ source: string; context: MarkdownDocumentContext }> = [];
    const renderer = extension(seen, 'viewport');
    const render = renderer.fences![0]!.render;
    renderer.fences![0]!.render = async (container, source, context) => {
      expect((container as HTMLElement).style.height).toBe('auto');
      expect((container as HTMLElement).style.aspectRatio).toBe('4 / 3');
      await render(container, source, context);
    };
    const engine = new MarkdownEngine({ profile: 'core', extensions: [renderer] });
    await engine.renderDocument(fence('{width=24rem height=auto}'), document.createElement('div'));
    await engine.dispose();
  });
  test('sizes real ABC notation without the library responsive clipping wrapper', async () => {
    const previous = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'getBBox');
    Object.defineProperty(SVGElement.prototype, 'getBBox', { configurable: true, value: () => ({ x: 0, y: 0, width: 24, height: 12 }) });
    const engine = createEducationalMarkdownEngine({ features: ['abc'] });
    const container = document.createElement('div');
    try {
      const source = readFileSync(new URL('./extensions/abc.md', import.meta.url), 'utf8').replace('```abc', '```abc {width=50% height=12rem}');
      await engine.renderDocument(source, container);
      const frame = container.querySelector<HTMLElement>('[data-markdown-language="abc"]')!;
      expect(frame.style.width).toBe('50%');
      expect(frame.style.paddingBottom).toBe('');
      expect(frame.style.height).toBe('auto');
      expect(frame.querySelector<SVGSVGElement>('svg')?.style.height).toBe('12rem');
      expect(frame.querySelector<SVGSVGElement>('svg')?.style.position).not.toBe('absolute');
    } finally {
      await engine.dispose();
      if (previous) Object.defineProperty(SVGElement.prototype, 'getBBox', previous);
      else Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });
});

describe('natural chemical drawings and true inline SMILES', () => {
  let canvas: ReturnType<typeof jest.spyOn>;
  beforeAll(() => {
    canvas = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ measureText: (text: string) => ({ width: text.length * 6 }) } as CanvasRenderingContext2D);
  });
  afterAll(() => canvas.mockRestore());
  test.each(['O', 'CCO', 'c1ccccc1', 'CCCCCCCCCCCCCCCC'])('keeps %s at natural scale', async (source) => {
    const engine = createEducationalMarkdownEngine({ features: ['smiles'] });
    const container = document.createElement('div');
    await engine.renderDocument(`\`\`\`smiles\n${source}\n\`\`\``, container);
    const svg = container.querySelector<SVGSVGElement>('svg')!;
    expect(svg).not.toBeNull();
    expect(svg.style.width).toMatch(/px$/);
    expect(svg.style.width).not.toBe('100%');
    const coordinates = svg
      .getAttribute('viewBox')!
      .split(/[\s,]+/)
      .map(Number);
    expect(parseFloat(svg.style.width)).toBeCloseTo(coordinates[2]! * 1.75);
    expect(Number(svg.getAttribute('width'))).toBeCloseTo(coordinates[2]! * 1.75);
    expect(svg.getAttribute('aria-label')).toBe(`SMILES: ${source}`);
    await engine.dispose();
  });
  test('uses a moderate readable scale for unsized inline molecules', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['smiles'] });
    const container = document.createElement('div');
    await engine.renderDocument('Ethanol :smiles[CCO] in a sentence.', container);
    const svg = container.querySelector<SVGSVGElement>('p > span.smiles svg')!;
    const coordinates = svg
      .getAttribute('viewBox')!
      .split(/[\s,]+/)
      .map(Number);
    expect(parseFloat(svg.style.width)).toBeCloseTo(coordinates[2]! * 1.5);
    await engine.dispose();
  });
  test('explicit dimensions override the larger chemical defaults', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['smiles'] });
    const container = document.createElement('div');
    await engine.renderDocument('```smiles {width=12rem height=6rem}\nCCO\n```', container);
    expect(container.querySelector<HTMLElement>('.smiles')!.style.width).toBe('12rem');
    const svg = container.querySelector<SVGSVGElement>('svg')!;
    expect(svg.style.width).toBe('100%');
    expect(svg.style.height).toBe('6rem');
    await engine.dispose();
  });
  test('embeds balanced atom brackets inside a paragraph and leaves code literal', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['smiles'] });
    const container = document.createElement('div');
    await engine.renderDocument('Before :smiles[[NH4+]]{height=2rem} after.\n\n`:smiles[CCO]`\n\n```text\n:smiles[O]\n```', container);
    const inline = container.querySelector<HTMLElement>('p > span.smiles')!;
    expect(inline.querySelector('svg')).not.toBeNull();
    expect(inline.style.display).toBe('inline-block');
    expect(inline.style.verticalAlign).toBe('middle');
    expect(inline.querySelector('svg')?.getAttribute('aria-label')).toBe('SMILES: [NH4+]');
    expect(inline.parentElement?.textContent).toContain('Before ');
    expect(inline.parentElement?.textContent).toContain(' after.');
    expect(container.querySelectorAll('.smiles')).toHaveLength(1);
    expect(container.querySelector('code')?.textContent).toBe(':smiles[CCO]');
    await engine.dispose();
  });
});
