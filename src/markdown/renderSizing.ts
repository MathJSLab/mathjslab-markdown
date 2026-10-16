import type { MarkdownDocumentContext } from '../MarkdownEngine.js';

export type MarkdownRenderSize = Readonly<{
  width?: 'auto' | `${number}%` | `${number}px` | `${number}rem`;
  height?: 'auto' | `${number}px` | `${number}rem`;
  /** Inline means an inline-level frame; fence bodies remain block Markdown. */
  display?: 'inline' | 'block';
}>;
export type MarkdownRenderSizing = Readonly<{
  defaults?: MarkdownRenderSize;
  extensions?: Readonly<Record<string, MarkdownRenderSize>>;
}>;
export type MarkdownFenceSizing = 'intrinsic' | 'viewport';

const dimensions = ['width', 'height'] as const;
const attributes = [...dimensions, 'display'] as const;
type Dimension = (typeof dimensions)[number];
const validLength = (value: unknown, dimension: Dimension): value is NonNullable<MarkdownRenderSize[Dimension]> => {
  if (value === 'auto') return true;
  if (typeof value !== 'string') return false;
  const match = /^(\d+(?:\.\d+)?|\.\d+)(px|rem|%)$/.exec(value);
  if (!match) return false;
  const number = Number(match[1]);
  return Number.isFinite(number) && number > 0 && (match[2] !== '%' || (dimension === 'width' && number <= 100));
};

/** @internal Parse presentation metadata without touching the fence body. */
export const resolveRenderSize = (
  info: string,
  name: string,
  configuration: MarkdownRenderSizing,
  native: MarkdownRenderSize | undefined,
  context: MarkdownDocumentContext,
): MarkdownRenderSize | undefined => {
  const warn = (message: string): void => context.onDiagnostic?.({ extension: name, code: 'fence-size-invalid', category: 'extension', severity: 'warning', message });
  const supplied: Record<string, unknown> = {};
  const duplicates = new Set<string>();
  if (info.trim()) {
    const content = /^\{([\s\S]*)\}$/.exec(info.trim());
    if (!content) warn('Fence sizing must use {width=... height=...}. Ignoring invalid attributes.');
    else {
      const attribute = /\s*([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))\s*/gy;
      let cursor = 0;
      while (cursor < content[1]!.length && content[1]!.slice(cursor).trim()) {
        attribute.lastIndex = cursor;
        const match = attribute.exec(content[1]!);
        if (!match) {
          warn('Malformed fence size attributes.');
          break;
        }
        cursor = attribute.lastIndex;
        const key = match[1]!;
        if (!attributes.includes(key as (typeof attributes)[number])) {
          warn(`Unknown fence size attribute: ${key}`);
          continue;
        }
        if (Object.hasOwn(supplied, key)) duplicates.add(key);
        supplied[key] = match[2] ?? match[3] ?? match[4];
      }
    }
  }
  for (const key of duplicates) {
    delete supplied[key];
    warn(`Duplicate fence size attribute: ${key}. Using defaults.`);
  }
  const result: { -readonly [K in keyof MarkdownRenderSize]?: NonNullable<MarkdownRenderSize[K]> } = {};
  for (const layer of [native, configuration.defaults, configuration.extensions?.[name], supplied]) {
    for (const key of attributes) {
      const value = layer?.[key];
      if (value === undefined) continue;
      if (key === 'display' ? value === 'inline' || value === 'block' : validLength(value, key)) Object.assign(result, { [key]: value });
      else warn(`Invalid ${key}: ${String(value)}. Using defaults.`);
    }
  }
  return Object.keys(result).length ? Object.freeze(result) : undefined;
};

/** @internal Establish layout before initializing a renderer or its observer. */
export const applyRenderSize = (element: HTMLElement, kind: MarkdownFenceSizing, size: MarkdownRenderSize): void => {
  element.setAttribute('data-markdown-sized', kind);
  element.style.maxWidth = '100%';
  element.style.minWidth = '0';
  // A graphic's requested height belongs to the SVG, not to the frame holding
  // controls. Some renderers write a fixed frame height during initialization.
  if (kind === 'intrinsic') {
    element.style.height = 'auto';
    element.style.minHeight = '0';
  }
  if (size.display) element.style.display = size.display === 'inline' ? 'inline-block' : 'block';
  if (size.display === 'inline') {
    element.style.verticalAlign = element.hasAttribute('data-markdown-inline') ? 'middle' : 'top';
    if (!size.width || size.width === 'auto') element.style.width = kind === 'viewport' ? '24rem' : 'fit-content';
  }
  if (size.width && size.width !== 'auto') element.style.width = size.width;
  if (kind === 'viewport' && size.height !== undefined) {
    element.style.minHeight = '0';
    element.style.height = size.height;
    if (size.height === 'auto') element.style.aspectRatio = '4 / 3';
  }
};

/** @internal Fit graphics only: controls and surrounding prose keep their size. */
export const finishRenderSize = (element: Element, size: MarkdownRenderSize | undefined): void => {
  if (!size || element.getAttribute('data-markdown-sized') !== 'intrinsic') return;
  applyRenderSize(element as HTMLElement, 'intrinsic', size);
  for (const svg of element.querySelectorAll<SVGSVGElement>('svg')) {
    if (svg.parentElement?.closest('svg')) continue;
    const viewBox = svg
      .getAttribute('viewBox')
      ?.trim()
      .split(/[\s,]+/)
      .map(Number);
    const ratio = viewBox?.length === 4 && viewBox[2]! > 0 && viewBox[3]! > 0 ? viewBox[2]! / viewBox[3]! : undefined;
    svg.style.maxWidth = '100%';
    svg.style.objectFit = 'contain';
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    if (size.width && size.width !== 'auto') svg.style.width = '100%';
    else if (size.height && size.height !== 'auto' && ratio) svg.style.width = `calc(${size.height} * ${ratio})`;
    else if (size.width === 'auto' && viewBox?.[2]) {
      const intrinsicWidth = Number(svg.getAttribute('width'));
      svg.style.width = `${Number.isFinite(intrinsicWidth) && intrinsicWidth > 0 ? intrinsicWidth : viewBox[2]}px`;
    }
    svg.style.height = size.height && size.height !== 'auto' ? size.height : 'auto';
    // MathJax emits an inline-block wrapper; prevent it retaining natural width.
    const math = svg.closest('mjx-container') as HTMLElement | null;
    if (math && size.width && size.width !== 'auto') math.style.width = '100%';
  }
};

/** @internal A viewport fills the already-sized renderer frame. */
export const sizeViewport = (viewport: HTMLElement, context: MarkdownDocumentContext): void => {
  if (context.renderSize?.height === undefined) return;
  viewport.style.height = '100%';
  viewport.style.minHeight = '0';
};
