/// <reference types="jest" />
import { jest } from '@jest/globals';
import { TextEncoder } from 'node:util';
import { readFileSync } from 'node:fs';

const viewer = {
  addModel: jest.fn(),
  setStyle: jest.fn(),
  addStyle: jest.fn(),
  zoomTo: jest.fn(),
  render: jest.fn(),
  resize: jest.fn(),
  spin: jest.fn(),
  removeAllModels: jest.fn(),
  clear: jest.fn(),
};
jest.unstable_mockModule('../../src/markdown/extensions/molecule-3d/vendor/3dmol.js', () => ({ default: { createViewer: jest.fn(() => viewer) } }));
const result = { view: { resize: jest.fn(), runAsync: jest.fn(async () => undefined) }, finalize: jest.fn() };
const embed = jest.fn(async (_element: Element, _spec: unknown, _options: unknown) => result);
jest.unstable_mockModule('vega-embed', () => ({ default: embed }));
Object.assign(globalThis, { TextEncoder, cancelAnimationFrame: jest.fn(), requestAnimationFrame: jest.fn(() => 1) });
const { molecule3DExtension } = await import('../../src/markdown/extensions/molecule-3d/extension');
const { vegaExtension, vegaLiteExtension } = await import('../../src/markdown/extensions/vega-lite/extension');
const { waitForElementLayout } = await import('../../src/markdown/extensionUtils');

it('renders non-protein PDB atoms and retains the viewer for resize until disposal', async () => {
  const container = document.createElement('div');
  container.setAttribute('data-markdown-language', 'pdb');
  document.body.append(container);
  const bounds = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 640, height: 420 } as DOMRect);
  let resize: ((width: number, height: number) => void) | undefined;
  const disconnect = jest.fn();
  const extension = molecule3DExtension();
  await extension.fences![0]!.render(container, 'ATOM water', {
    observeResize: (_element, callback) => {
      resize = callback;
      return disconnect;
    },
  });
  expect(viewer.addModel).toHaveBeenCalledWith('ATOM water', 'pdb', { keepH: true });
  expect(viewer.setStyle).toHaveBeenCalledWith({}, expect.objectContaining({ stick: expect.anything(), sphere: expect.anything() }));
  expect(viewer.zoomTo).toHaveBeenCalled();
  expect(viewer.clear).not.toHaveBeenCalled();
  resize!(640, 420);
  expect(viewer.resize).toHaveBeenCalledTimes(1);
  expect(viewer.render).toHaveBeenCalledTimes(2);
  await extension.dispose!();
  expect(disconnect).toHaveBeenCalled();
  expect(viewer.clear).toHaveBeenCalled();
  bounds.mockRestore();
  container.remove();
});

it('keeps the Vega view alive in resize callbacks and finalizes only on disposal', async () => {
  const container = document.createElement('div');
  let resize: ((width: number, height: number) => void) | undefined;
  const extension = vegaLiteExtension();
  await extension.fences![0]!.render(container, '{}', {
    observeResize: (_element, callback) => {
      resize = callback;
    },
  });
  resize!(300, 200);
  expect(result.view.resize).toHaveBeenCalledTimes(1);
  expect(result.view.runAsync).toHaveBeenCalledTimes(1);
  expect(result.finalize).not.toHaveBeenCalled();
  await extension.dispose!();
  expect(result.finalize).toHaveBeenCalledTimes(1);
});

it('cancels layout waiting for a disconnected viewport before resources are allocated', async () => {
  const controller = new AbortController();
  const operation = waitForElementLayout(document.createElement('div'), { signal: controller.signal });
  controller.abort();
  await expect(operation).resolves.toBeUndefined();
  expect(cancelAnimationFrame).toHaveBeenCalled();
});

it('keeps embed options host-controlled and routes Vega loader reads through the document service', async () => {
  const extension = vegaLiteExtension();
  const container = document.createElement('div');
  const readText = jest.fn(async () => '[]');
  const resolve = jest.fn((reference: string) => new URL(reference, 'https://example.test/'));
  const resources = { readText, resolve, fetch: jest.fn<() => Promise<Response>>(), createObjectURL: jest.fn<() => string>(), revokeObjectURL: jest.fn(), dispose: jest.fn() };
  const onDiagnostic = jest.fn();
  const source = '{"usermeta":{"title":"Keep me","embedOptions":{"actions":true,"renderer":"canvas","config":"https://elsewhere.test/config.json"}}}';
  try {
    await extension.fences![0]!.render(container, source, { resources, onDiagnostic });
    expect(embed).toHaveBeenLastCalledWith(container, { usermeta: { title: 'Keep me' } }, expect.objectContaining({ renderer: 'svg', actions: false, ast: true }));
    const options = embed.mock.lastCall![2] as { loader: import('vega').Loader };
    await expect(options.loader.load('data.json')).resolves.toBe('[]');
    expect(readText).toHaveBeenCalledWith('data.json', expect.objectContaining({ resources }));
    await expect(options.loader.sanitize('image.png', { context: 'image' })).rejects.toThrow(/image resources/);
    expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({ code: 'resource-url-blocked' }));
  } finally {
    await extension.dispose!();
  }
  expect(resources.dispose).not.toHaveBeenCalled();
});

it.each(['{', 'null', '[]'])('preserves an invalid Vega-Lite source (%s) and reports a render diagnostic', async (source) => {
  const extension = vegaLiteExtension();
  const container = document.createElement('div');
  const onDiagnostic = jest.fn();
  const calls = embed.mock.calls.length;
  await extension.fences![0]!.render(container, source, { onDiagnostic });
  expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(source);
  expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({ code: 'extension-render-error', language: 'vega-lite' }));
  expect(embed.mock.calls).toHaveLength(calls);
});

it('finalizes an embed that resolves after its document signal is aborted', async () => {
  const extension = vegaLiteExtension();
  const container = document.createElement('div');
  const controller = new AbortController();
  const observeResize = jest.fn();
  const finalize = jest.fn();
  embed.mockImplementationOnce(async () => {
    container.append(document.createElement('svg'));
    controller.abort();
    return { view: result.view, finalize };
  });
  await extension.fences![0]!.render(container, '{}', { signal: controller.signal, observeResize });
  expect(container.childElementCount).toBe(0);
  expect(finalize).toHaveBeenCalledTimes(1);
  expect(observeResize).not.toHaveBeenCalled();
  await extension.dispose!();
  expect(finalize).toHaveBeenCalledTimes(1);
});

it('uses full Vega mode and preserves the source when the runtime absorbs a failed dataset request', async () => {
  const extension = vegaExtension();
  const container = document.createElement('div');
  const onDiagnostic = jest.fn();
  const finalize = jest.fn();
  const source = '{"data":[{"name":"samples","url":"samples.json"}]}';
  embed.mockImplementationOnce(async (_element, spec, options) => {
    expect(spec).toEqual(JSON.parse(source));
    expect(options).toEqual(expect.objectContaining({ mode: 'vega', renderer: 'svg' }));
    const { loader } = options as { loader: import('vega').Loader };
    await expect(loader.load('samples.json')).rejects.toThrow('Request failed');
    return { view: result.view, finalize };
  });
  await extension.fences![0]!.render(container, source, {
    sourceUrl: new URL('https://example.test/page.md'),
    fetchResource: async () => {
      throw new Error('Request failed');
    },
    onDiagnostic,
  });
  expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(source);
  expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({ code: 'extension-render-error', language: 'vega' }));
  expect(finalize).toHaveBeenCalledTimes(1);
  await extension.dispose!();
  expect(finalize).toHaveBeenCalledTimes(1);
});

it.each(['pdb', 'cif', 'mmcif', 'sdf', 'mol2', 'xyz', 'cube'])('sizes the %s viewport before initialization and retains resize/disposal', async (language) => {
  jest.clearAllMocks();
  const { createEducationalMarkdownEngine } = await import('../../src/markdown/createEducationalMarkdownEngine.js');
  const engine = createEducationalMarkdownEngine({ features: ['molecule-3d'] });
  expect(molecule3DExtension().fences!.find((fence) => fence.language === language)!.defaultSize).toEqual({ width: '30rem', height: 'auto' });
  const fixture = readFileSync(new URL('./extensions/molecule-3d.md', import.meta.url), 'utf8');
  const container = document.createElement('div');
  const parsed = document.createElement('div');
  parsed.innerHTML = engine.parse(fixture);
  const source = parsed.querySelector(`[data-markdown-language="${language}"] .markdown-extension-source`)!.textContent!;
  document.body.append(container);
  const bounds = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 384, height: 288 } as DOMRect);
  let resize: (() => void) | undefined;
  const disconnect = jest.fn();
  try {
    const session = await engine.renderDocument('```' + language + ' {width=50% height=18rem}\n' + source + '\n```', container, {
      observeResize: (_element, callback) => {
        resize = () => callback(384, 288);
        return disconnect;
      },
    });
    const frame = container.querySelector<HTMLElement>('.molecule-3d')!;
    expect(frame.style.width).toBe('50%');
    expect(frame.style.height).toBe('18rem');
    expect(frame.firstElementChild?.getAttribute('style')).toContain('height: 100%');
    expect(viewer.addModel).toHaveBeenCalledWith(source, language === 'mmcif' ? 'cif' : language, { keepH: true });
    resize!();
    expect(viewer.resize).toHaveBeenCalledTimes(1);
    await session.dispose();
    expect(disconnect).toHaveBeenCalled();
    expect(viewer.clear).toHaveBeenCalled();
  } finally {
    await engine.dispose();
    bounds.mockRestore();
    container.remove();
  }
});
