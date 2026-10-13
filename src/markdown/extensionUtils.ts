import type { MarkdownDocumentContext } from '../MarkdownEngine.js';
import { markdownDiagnosticCodes } from './diagnostics.js';

export const DEFAULT_MAX_SOURCE_BYTES = 2 * 1024 * 1024;
export const DEFAULT_MAX_RESOURCE_BYTES = 20 * 1024 * 1024;

export const assertSourceSize = (source: string, context: MarkdownDocumentContext): void => {
  const bytes = new TextEncoder().encode(source).byteLength;
  if (bytes > (context.maxSourceBytes ?? DEFAULT_MAX_SOURCE_BYTES)) throw new Error(`Source exceeds the configured limit (${bytes} bytes)`);
};

export const resolveResourceUrl = (reference: string, context: MarkdownDocumentContext): URL => {
  if (context.resources) return context.resources.resolve(reference, context);
  if (context.resolveUrl) return context.resolveUrl(reference, context);
  if (context.sourceUrl) return new URL(reference, context.sourceUrl);
  return new URL(reference, document.baseURI);
};

export const fetchResource = async (reference: string, context: MarkdownDocumentContext): Promise<Response> => {
  if (context.resources) return context.resources.fetch(reference, context);
  const url = resolveResourceUrl(reference, context);
  const init: RequestInit = context.signal ? { signal: context.signal } : {};
  const response = context.fetchResource ? await context.fetchResource(url, init, context) : await fetch(url, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url.href}`);
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > (context.maxResourceBytes ?? DEFAULT_MAX_RESOURCE_BYTES)) {
    throw new Error(`Resource exceeds the configured limit (${length} bytes)`);
  }
  return response;
};

export const readResourceText = async (response: Response, context: MarkdownDocumentContext): Promise<string> => {
  const text = await response.text();
  const bytes = new TextEncoder().encode(text).byteLength;
  if (bytes > (context.maxResourceBytes ?? DEFAULT_MAX_RESOURCE_BYTES)) {
    throw new Error(`Resource exceeds the configured limit (${bytes} bytes)`);
  }
  return text;
};

export const renderExtensionError = (container: Element, extension: string, language: string, source: string, error: unknown, context: MarkdownDocumentContext): void => {
  const detail = error instanceof Error ? error.message : String(error);
  const message = document.createElement('pre');
  message.className = `${container.classList[0] ?? extension.toLowerCase()}-error`;
  message.setAttribute('role', 'alert');
  message.textContent = `${extension} (${language}): ${detail}`;
  const code = document.createElement('pre');
  code.className = 'markdown-extension-fallback';
  code.textContent = source;
  container.replaceChildren(message, code);
  context.onDiagnostic?.({
    extension,
    language,
    code: markdownDiagnosticCodes.extensionRenderError,
    category: 'extension',
    severity: 'error',
    ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
    message: detail,
    cause: error,
  });
};

export const observeElementResize = (element: Element, context: MarkdownDocumentContext, callback: (width: number, height: number) => void): (() => void) => {
  if (context.observeResize) return context.observeResize(element, callback) ?? (() => undefined);
  if (typeof ResizeObserver === 'undefined') return () => undefined;
  const observer = new ResizeObserver(([entry]) => {
    if (entry) callback(entry.contentRect.width, entry.contentRect.height);
  });
  observer.observe(element);
  return () => observer.disconnect();
};

/** Wait for mounted, measurable viewports without constructing library resources. */
export const waitForElementLayout = (element: Element, context: MarkdownDocumentContext): Promise<void> =>
  new Promise((resolve, reject) => {
    let frame: number;
    const deadline = performance.now() + 10_000;
    const cleanup = (): void => {
      cancelAnimationFrame(frame);
      context.signal?.removeEventListener('abort', abort);
    };
    const abort = (): void => {
      cleanup();
      resolve();
    };
    const check = (): void => {
      if (context.signal?.aborted) {
        abort();
        return;
      }
      const bounds = element.getBoundingClientRect();
      if (element.isConnected && bounds.width > 0 && bounds.height > 0) {
        cleanup();
        resolve();
        return;
      }
      if (performance.now() >= deadline) {
        cleanup();
        reject(new Error('Viewport is disconnected or has no visible dimensions'));
        return;
      }
      frame = requestAnimationFrame(check);
    };
    context.signal?.addEventListener('abort', abort, { once: true });
    check();
  });

export const sanitizeSVG = async (svg: string): Promise<string> => {
  const { default: DOMPurify } = await import('dompurify');
  const safe = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
    FORBID_TAGS: ['script', 'foreignObject'],
  });
  // Music glyphs and diagram symbols use local definitions. Never permit a
  // restored <use> to fetch an external SVG or reference active content.
  const template = document.createElement('template');
  template.innerHTML = safe;
  for (const use of template.content.querySelectorAll('use')) {
    const references = [use.getAttribute('href'), use.getAttribute('xlink:href')].filter((value): value is string => value !== null);
    if (!references.length || references.some((reference) => !/^#[A-Za-z_][\w:.-]*$/.test(reference))) use.remove();
  }
  return template.innerHTML;
};

export const extensionStyles = (name: string): string => `
.${name} { box-sizing: border-box; display: block; max-width: 100%; min-width: 0; overflow: auto; position: relative; }
.${name} > svg, .${name} canvas { display: block; height: auto; max-width: 100%; }
.${name}-error { color: var(--calc-error, var(--red-text, #b42318)); white-space: pre-wrap; }
`;
