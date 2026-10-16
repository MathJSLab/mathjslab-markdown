import { jest } from '@jest/globals';
import { TextEncoder } from 'node:util';
import { readFileSync } from 'node:fs';
import { geometryExtension } from '../../src/markdown/extensions/geometry/extension.js';
import { prepareGeometryRuntime } from '../../src/markdown/extensions/geometry/compatibility.js';
import { validateGeometrySpec } from '../../src/markdown/extensions/geometry/spec.js';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder });
const source = "{elements: [{id:'M',type:'midpoint',parents:['A','B']},{id:'A',type:'point',parents:[0,0]},{id:'B',type:'point',parents:[4,2]},{id:'AB',type:'segment',parents:['A','B']}]}";
const fence = (input = source) => `\`\`\`geometry\n${input}\n\`\`\``;

describe('declarative geometry with the real JSXGraph renderer', () => {
  test('supports Math functions that sort after the last JessieCode operand', async () => {
    const { default: api } = await import('jsxgraph');
    const prototype = api.JessieCode.prototype as unknown as { getPossibleOperands(): { all: Record<string, { origin: string }> } };
    const original = prototype.getPossibleOperands;
    Object.defineProperty(Math, 'zzFutureMathFunction', { configurable: true, value: () => 1 });
    try {
      prepareGeometryRuntime(api);
      const operands = prototype.getPossibleOperands.call(Object.create(prototype));
      expect(operands.all.zzFutureMathFunction?.origin).toBe('Math');
      expect(operands.all.sin?.origin).toBe('Math');
      expect(operands.all.E).toBeUndefined();
    } finally {
      Reflect.deleteProperty(Math, 'zzFutureMathFunction');
      prototype.getPossibleOperands = original;
    }
  });
  let bounds: ReturnType<typeof jest.spyOn>;
  let clientWidth: ReturnType<typeof jest.spyOn>;
  let clientHeight: ReturnType<typeof jest.spyOn>;
  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', { configurable: true, value: () => ({ x: 0, y: 0, width: 24, height: 12 }) });
    window.matchMedia ??= (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    Object.assign(globalThis, { CSS: { escape: (value: string) => value.replace(/[^\w-]/g, '\\$&') } });
  });
  beforeEach(() => {
    bounds = jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ width: 640, height: 384, x: 0, y: 0, top: 0, left: 0, right: 640, bottom: 384, toJSON() {} } as DOMRect);
    // JSDOM has no layout; mirror the pixel dimensions a browser would measure.
    clientWidth = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.style.width.endsWith('px') ? parseFloat(this.style.width) : 640;
    });
    clientHeight = jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.style.height.endsWith('px') ? parseFloat(this.style.height) : 384;
    });
  });
  afterEach(() => {
    bounds.mockRestore();
    clientWidth.mockRestore();
    clientHeight.mockRestore();
    document.body.replaceChildren();
  });

  test('renders forward references and updates dependent geometry when a free point moves', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['geometry'], securityMode: 'sanitized', allowedCapabilities: ['interactive'] });
    const container = document.createElement('div');
    document.body.append(container);
    const diagnostics: MarkdownDiagnostic[] = [];
    await engine.renderDocument(fence(), container, { onDiagnostic: (value) => diagnostics.push(value) });
    expect(diagnostics).toEqual([]);
    expect(container.querySelector('svg')).not.toBeNull();
    const { default: JXG } = await import('jsxgraph');
    const board = Object.values(JXG.boards)[0]!;
    const prefix = container.querySelector('.geometry-viewport')!.id;
    const a = board.objects[`${prefix}-A`] as import('jsxgraph').Point;
    const midpoint = board.objects[`${prefix}-M`] as import('jsxgraph').Point;
    expect(midpoint.X()).toBeCloseTo(2);
    expect(midpoint.Y()).toBeCloseTo(1);
    a.moveTo([2, 2]);
    board.update();
    expect(midpoint.X()).toBeCloseTo(3);
    expect(midpoint.Y()).toBeCloseTo(2);
    await engine.dispose();
    expect(Object.keys(JXG.boards)).toHaveLength(0);
  });

  test.each(['pt', 'en', 'es'].flatMap((lang) => ['geometria-dinamica', 'circuncentro-do-triangulo', 'paralelas-e-perpendiculares', 'elipse-e-focos'].map((file) => ({ lang, file }))))(
    'renders $lang/$file with the real board and numbered references',
    async ({ lang, file }) => {
      const engine = createEducationalMarkdownEngine({ features: ['geometry', 'didactic', 'cross-references'] });
      const container = document.createElement('div');
      document.body.append(container);
      const diagnostics: MarkdownDiagnostic[] = [];
      await engine.renderDocument(readFileSync(new URL(`../../example/${lang}/${file}.md`, import.meta.url), 'utf8'), container, {
        locale: { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[lang]!,
        onDiagnostic: (value) => diagnostics.push(value),
      });
      expect(diagnostics).toEqual([]);
      const count = file === 'geometria-dinamica' ? 2 : 1;
      expect(container.querySelectorAll('.geometry-viewport svg')).toHaveLength(count);
      const label = lang === 'en' ? 'Figure' : 'Figura';
      expect(Array.from(container.querySelectorAll('[data-markdown-reference] a'), (node) => node.textContent)).toEqual(Array.from({ length: count }, (_, index) => `${label} ${index + 1}`));
      await engine.dispose();
    },
  );

  test.each([
    [null, 'object'],
    [{ elements: [] }, 'between'],
    [{ elements: [{ id: 'A', type: 'point', parents: ['sin(1)', 0] }] }, 'reference'],
    [{ elements: [{ id: 'A', type: 'point', parents: [Infinity, 0] }] }, 'numeric'],
    [{ elements: [{ id: 'A', type: 'image', parents: [] }] }, 'Unsupported'],
    [{ elements: [{ id: 'A', type: 'point', parents: [0, 0], attributes: { strokeColor: 'url(https://bad.test)' } }] }, 'Colors'],
    [{ elements: [{ id: 'A', type: 'point', parents: [0, 0], attributes: { label: { display: 'html' } } }] }, 'Unsupported'],
    [
      {
        elements: [
          { id: 'A', type: 'midpoint', parents: ['B', 'B'] },
          { id: 'B', type: 'midpoint', parents: ['A', 'A'] },
        ],
      },
      'Cyclic',
    ],
    [{ elements: [{ id: 'A', type: 'line', parents: ['missing', 'missing'] }] }, 'Unknown'],
    [
      {
        elements: [
          { id: 'A', type: 'point', parents: [0, 0] },
          { id: 'A', type: 'point', parents: [1, 1] },
        ],
      },
      'Duplicate',
    ],
    [{ boundingBox: [0, 0, 0, 0], elements: [{ id: 'A', type: 'point', parents: [0, 0] }] }, 'boundingBox'],
  ])('rejects invalid or executable construction data', (input, message) => {
    expect(() => validateGeometrySpec(input)).toThrow(String(message));
  });

  test('requires interactive capability and preserves blocked source', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['geometry'], securityMode: 'strict' });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    await engine.renderDocument(fence(), container, { onDiagnostic: (value) => diagnostics.push(value) });
    expect(container.querySelector('svg')).toBeNull();
    expect(container.textContent).toContain('midpoint');
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'extension-capability-blocked' })]);
    await engine.dispose();
  });

  test('renders geometric families, constrained points and conics with the real library', async () => {
    const extension = geometryExtension();
    const container = document.createElement('div');
    document.body.append(container);
    const elements = [
      { id: 'O', type: 'point', parents: [0, 0] },
      { id: 'A', type: 'point', parents: [2, 0] },
      { id: 'B', type: 'point', parents: [0, 2] },
      { id: 'D', type: 'point', parents: [-2, 0] },
      { id: 'E', type: 'point', parents: [0, -2] },
      { id: 'F', type: 'point', parents: [1.4, 1.4] },
      { id: 'base', type: 'line', parents: ['O', 'A'] },
      { id: 'vector', type: 'arrow', parents: ['O', 'B'] },
      { id: 'circle', type: 'circle', parents: ['O', 2] },
      { id: 'G', type: 'glider', parents: [0, 1, 'circle'] },
      { id: 'cross', type: 'intersection', parents: ['base', 'circle', 0] },
      { id: 'tri', type: 'polygon', parents: ['O', 'A', 'B'] },
      { id: 'angle', type: 'angle', parents: ['A', 'O', 'B'] },
      { id: 'parallel', type: 'parallel', parents: ['base', 'B'] },
      { id: 'perp', type: 'perpendicular', parents: ['base', 'B'] },
      { id: 'bisector', type: 'bisector', parents: ['A', 'O', 'B'] },
      { id: 'center', type: 'circumcenter', parents: ['O', 'A', 'B'] },
      { id: 'circum', type: 'circumcircle', parents: ['O', 'A', 'B'] },
      { id: 'arc', type: 'arc', parents: ['O', 'A', 'B'] },
      { id: 'sector', type: 'sector', parents: ['O', 'A', 'B'] },
      { id: 'ellipse', type: 'ellipse', parents: ['D', 'A', 6] },
      { id: 'hyperbola', type: 'hyperbola', parents: ['D', 'A', 2] },
      { id: 'parabola', type: 'parabola', parents: ['B', 'base'] },
      { id: 'conic', type: 'conic', parents: ['A', 'B', 'D', 'E', 'F'] },
    ];
    const diagnostics: MarkdownDiagnostic[] = [];
    await extension.fences![0]!.render(container, JSON.stringify({ elements }), { onDiagnostic: (value) => diagnostics.push(value) });
    expect(diagnostics).toEqual([]);
    expect(container.querySelector('svg')).not.toBeNull();
    const { default: JXG } = await import('jsxgraph');
    const board = Object.values(JXG.boards)[0]!;
    const prefix = container.querySelector('.geometry-viewport')!.id;
    const glider = board.objects[`${prefix}-G`] as import('jsxgraph').Point;
    expect(Math.hypot(glider.X(), glider.Y())).toBeCloseTo(2);
    glider.moveTo([2, 2]);
    board.update();
    expect(Math.hypot(glider.X(), glider.Y())).toBeCloseTo(2);
    await extension.dispose!();
    expect(Object.keys(JXG.boards)).toHaveLength(0);
  });

  test('isolates boards in Shadow DOM, resizes and frees previous boards on update and abort', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['geometry'] });
    const host = document.createElement('div');
    document.body.append(host);
    const root = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.append(container);
    let resize: ((width: number, height: number) => void) | undefined;
    const disconnect = jest.fn();
    const resizeDiagnostics: MarkdownDiagnostic[] = [];
    const session = await engine.renderDocument(`${fence()}\n\n${fence()}`, container, {
      theme: 'dark',
      onDiagnostic: (value) => resizeDiagnostics.push(value),
      observeResize: (_element, callback) => {
        resize = callback;
        return disconnect;
      },
    });
    const { default: JXG } = await import('jsxgraph');
    expect(Object.keys(JXG.boards)).toHaveLength(2);
    const ids = Array.from(container.querySelectorAll('[id]'), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(container.querySelector('.geometry-viewport')?.getAttribute('style')).toContain('rgb(21, 26, 35)');
    resize!(800, 400);
    expect(resizeDiagnostics).toEqual([]);
    expect(Array.from(container.querySelectorAll('.geometry-viewport'), (node) => node.getAttribute('style'))).toEqual(expect.arrayContaining([expect.stringContaining('width: 800px')]));
    expect(Object.values(JXG.boards).map((board) => board.canvasWidth)).toEqual(expect.arrayContaining([800]));
    await session.update(fence());
    expect(Object.keys(JXG.boards)).toHaveLength(1);
    expect(disconnect).toHaveBeenCalled();
    await engine.dispose();
    const extension = geometryExtension();
    const controller = new AbortController();
    await extension.fences![0]!.render(container, source, { signal: controller.signal });
    controller.abort();
    expect(Object.keys(JXG.boards)).toHaveLength(0);
    await extension.dispose!();
  });

  test('treats labels as inert text and preserves malformed source beside a valid diagram', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['geometry'] });
    const container = document.createElement('div');
    document.body.append(container);
    const input = JSON.stringify({ title: '<img src=x onerror=alert(1)>', elements: [{ id: 'A', type: 'point', parents: [0, 0], attributes: { name: '<script>alert(1)</script>' } }] });
    await engine.renderDocument(`${fence('{bad: true}')}\n\n${fence(input)}`, container);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toContain('bad');
    expect(container.querySelector('script,img,[onerror]')).toBeNull();
    expect(container.querySelector('.geometry-viewport')?.getAttribute('aria-label')).toContain('<img');
    await engine.dispose();
  });

  test('honors source limits and cancellation without creating boards', async () => {
    const extension = geometryExtension();
    const container = document.createElement('div');
    document.body.append(container);
    await extension.fences![0]!.render(container, source, { maxSourceBytes: 4 });
    expect(container.textContent).toContain('Source exceeds');
    container.textContent = 'unchanged';
    const controller = new AbortController();
    controller.abort();
    await extension.fences![0]!.render(container, source, { signal: controller.signal });
    expect(container.textContent).toBe('unchanged');
    await extension.dispose!();
  });

  test('frees a partially rendered board when resize registration fails', async () => {
    const extension = geometryExtension();
    const container = document.createElement('div');
    document.body.append(container);
    const diagnostics: MarkdownDiagnostic[] = [];
    await extension.fences![0]!.render(container, source, {
      observeResize() {
        throw new Error('Observer failed');
      },
      onDiagnostic: (value) => diagnostics.push(value),
    });
    const { default: JXG } = await import('jsxgraph');
    expect(Object.keys(JXG.boards)).toHaveLength(0);
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(source);
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'extension-render-error', message: 'Observer failed' })]);
    await extension.dispose!();
  });
});
