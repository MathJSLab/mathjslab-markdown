import type { MarkdownVisualExport } from '../MarkdownEngine.js';

export type MarkdownPNGOptions = Readonly<{ scale?: number; background?: string; signal?: AbortSignal }>;

/** Rasterize a sanitized visual in the browser using its intrinsic dimensions. */
export const rasterizeMarkdownVisual = async (visual: MarkdownVisualExport, options: MarkdownPNGOptions = {}): Promise<Blob> => {
  const { scale = 1, background, signal } = options;
  if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('PNG scale must be positive and finite');
  signal?.throwIfAborted();
  const document = visual.element.ownerDocument;
  const view = document.defaultView;
  if (!view) throw new Error('PNG export requires a browser document');
  if (background !== undefined && !view.CSS.supports('color', background)) throw new Error('Invalid PNG background color');

  const svg = await visual.serialize();
  signal?.throwIfAborted();
  const url = view.URL.createObjectURL(new Blob([svg], { type: visual.mimeType }));
  const image = document.createElement('img');
  const abort = (): void => image.removeAttribute('src');
  signal?.addEventListener('abort', abort, { once: true });
  try {
    image.src = url;
    await image.decode();
    signal?.throwIfAborted();
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    if (!width || !height || width > 8192 || height > 8192 || width * height > 16_777_216) {
      throw new RangeError('PNG output must have positive dimensions, at most 8192 pixels per side and at most 16 megapixels');
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('PNG export requires a 2D canvas');
    if (background !== undefined) {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);
    const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png'));
    signal?.throwIfAborted();
    return png;
  } catch (error) {
    signal?.throwIfAborted();
    throw error;
  } finally {
    signal?.removeEventListener('abort', abort);
    view.URL.revokeObjectURL(url);
  }
};
