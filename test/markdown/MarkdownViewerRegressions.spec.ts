/// <reference types="jest" />
import { jest } from '@jest/globals';
import { TextEncoder } from 'node:util';

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
jest.unstable_mockModule('3dmol', () => ({ createViewer: jest.fn(() => viewer) }));
const result = { view: { resize: jest.fn(), runAsync: jest.fn(async () => undefined) }, finalize: jest.fn() };
jest.unstable_mockModule('vega-embed', () => ({ default: jest.fn(async () => result) }));
Object.assign(globalThis, { TextEncoder, cancelAnimationFrame: jest.fn(), requestAnimationFrame: jest.fn(() => 1) });
const { molecule3DExtension } = await import('../../src/markdown/extensions/molecule-3d/extension');
const { vegaLiteExtension } = await import('../../src/markdown/extensions/vega-lite/extension');
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
