import type { MarkdownDocumentContext } from '../../../MarkdownEngine.js';
import { DefaultMarkdownResourceService } from '../../security.js';
import { DEFAULT_MAX_RESOURCE_BYTES } from '../../extensionUtils.js';

export type TikZWorker = Pick<Worker, 'addEventListener' | 'removeEventListener' | 'postMessage' | 'terminate'>;
export type TikZOptions = {
  /** Trusted host configuration; defaults to the bundled runtime directory. */
  assetBaseUrl?: string | URL;
  timeoutMs?: number;
  maxOutputBytes?: number;
  texPackages?: readonly string[];
  tikzLibraries?: readonly string[];
  /** Host-owned Worker transport, principally useful for integrations and tests. */
  createWorker?: (script: string) => TikZWorker;
};
export type TikZResult = { svg: string; release: () => void };

const bridge = String.raw`
(() => {
  let id = 0;
  const requests = new Map();
  self.fetch = (reference) => new Promise((resolve, reject) => {
    const uid = ++id;
    requests.set(uid, {resolve, reject});
    self.postMessage({type: 'tikz-resource-request', uid, reference: String(reference)});
  });
  self.addEventListener('message', ({data}) => {
    if (data?.type !== 'tikz-resource-response') return;
    const pending = requests.get(data.uid);
    if (!pending) return;
    requests.delete(data.uid);
    if (data.error) pending.reject(new Error(data.error));
    else pending.resolve(new Response(data.bytes, {status: 200}));
  });
})();
`;

const readBytes = async (reference: URL, context: MarkdownDocumentContext): Promise<Uint8Array> => {
  const response = await context.resources!.fetch(reference, context);
  const limit = context.maxResourceBytes ?? context.resourcePolicy?.maxResourceBytes ?? DEFAULT_MAX_RESOURCE_BYTES;
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > limit) throw new Error('TikZ runtime resource exceeds the configured byte limit');
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new Error('TikZ runtime resource exceeds the configured byte limit');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
};

let sequence = 0;
export const compileTikZ = async (source: string, language: string, options: TikZOptions, originalContext: MarkdownDocumentContext): Promise<TikZResult> => {
  const timeoutMs = options.timeoutMs ?? 30_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) throw new Error('TikZ timeoutMs must be between 1 and 120000');
  if (options.maxOutputBytes !== undefined && (!Number.isFinite(options.maxOutputBytes) || options.maxOutputBytes < 1)) throw new Error('TikZ maxOutputBytes must be positive and finite');
  const controller = new AbortController();
  const abort = (): void => controller.abort(originalContext.signal?.reason);
  originalContext.signal?.addEventListener('abort', abort, { once: true });
  if (originalContext.signal?.aborted) abort();
  const ownedResources = originalContext.resources ? undefined : new DefaultMarkdownResourceService();
  const context: MarkdownDocumentContext = { ...originalContext, signal: controller.signal, resources: originalContext.resources ?? ownedResources! };
  const urls: string[] = [];
  let worker: TikZWorker | undefined;
  let workerUrl: string | undefined;
  const cleanupFonts = (): void => {
    for (const url of urls.splice(0)) context.resources!.revokeObjectURL(url);
    ownedResources?.dispose();
  };
  let rejectWorker: ((cause: unknown) => void) | undefined;
  const stopped = (): void => {
    worker?.terminate();
    rejectWorker?.(controller.signal.reason ?? new Error('TikZ compilation aborted'));
  };
  controller.signal.addEventListener('abort', stopped, { once: true });
  const timer = setTimeout(() => controller.abort(new Error(`TikZ compilation timed out after ${timeoutMs} ms`)), timeoutMs);
  let removeListeners = (): void => undefined;
  try {
    const baseReference = options.assetBaseUrl ?? (await import(/* webpackChunkName: "markdown-tikz" */ './assets.js')).tikzAssetBaseUrl;
    const base = new URL(String(baseReference), document.baseURI);
    if (!base.pathname.endsWith('/')) base.pathname += '/';
    if (base.search || base.hash) throw new Error('TikZ assetBaseUrl must not contain a query or fragment');
    const script = new TextDecoder().decode(await readBytes(new URL('run-tex.js', base), context));
    controller.signal.throwIfAborted();
    const code = `${bridge}\n${script}`;
    if (options.createWorker) worker = options.createWorker(code);
    else {
      workerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      worker = new Worker(workerUrl);
    }
    const activeWorker = worker;
    const pending = new Map<number, { resolve: (value: unknown) => void; reject: (cause: unknown) => void }>();
    let uid = 0;
    let texError: string | undefined;
    let readyResolve!: () => void;
    const ready = new Promise<void>((resolve) => {
      readyResolve = resolve;
    });
    const errorPromise = new Promise<never>((_resolve, reject) => {
      rejectWorker = reject;
    });
    const call = (method: string, args: unknown[]): Promise<unknown> =>
      new Promise((resolve, reject) => {
        const id = ++uid;
        pending.set(id, { resolve, reject });
        activeWorker.postMessage({ type: 'run', uid: id, method, args });
      });
    const resource = async (message: { uid: number; reference: string }): Promise<void> => {
      try {
        const url = new URL(message.reference, base);
        const relative = url.pathname.slice(base.pathname.length);
        // TeX can read only the deployed runtime, never arbitrary host URLs/files.
        if (
          url.origin !== base.origin ||
          !url.pathname.startsWith(base.pathname) ||
          url.search ||
          url.hash ||
          !/^(?:tex\.wasm\.gz|core\.dump\.gz|tex_files\/[A-Za-z0-9_.-]+\.gz)$/.test(relative)
        )
          throw new Error(`TikZ runtime requested an unsupported resource: ${message.reference}`);
        const bytes = await readBytes(url, context);
        if (!controller.signal.aborted) activeWorker.postMessage({ type: 'tikz-resource-response', uid: message.uid, bytes });
      } catch (cause) {
        if (!controller.signal.aborted) activeWorker.postMessage({ type: 'tikz-resource-response', uid: message.uid, error: cause instanceof Error ? cause.message : String(cause) });
      }
    };
    const onMessage = (event: MessageEvent): void => {
      if (typeof event.data === 'string') {
        if (/^\s*!|LaTeX Error:/.test(event.data)) texError ??= event.data.slice(0, 512);
        return;
      }
      const data = event.data as { type?: string; uid?: number; complete?: boolean; payload?: unknown; error?: { message?: string }; reference?: string };
      if (data?.type === 'init') readyResolve();
      else if (data?.type === 'tikz-resource-request' && typeof data.uid === 'number' && typeof data.reference === 'string') void resource({ uid: data.uid, reference: data.reference });
      else if (data?.type === 'uncaughtError') rejectWorker?.(new Error(data.error?.message ?? 'TikZ worker failed'));
      else if (typeof data?.uid === 'number') {
        const job = pending.get(data.uid);
        if (data.type === 'error') {
          pending.delete(data.uid);
          job?.reject(new Error(data.error?.message ?? 'TeX compilation failed'));
        } else if (data.type === 'result' && data.complete) {
          pending.delete(data.uid);
          job?.resolve(data.payload);
        }
      }
    };
    const onError = (event: ErrorEvent): void => rejectWorker?.(new Error(event.message || 'TikZ worker failed'));
    activeWorker.addEventListener('message', onMessage);
    activeWorker.addEventListener('error', onError);
    removeListeners = () => {
      activeWorker.removeEventListener('message', onMessage);
      activeWorker.removeEventListener('error', onError);
    };
    const render = async (): Promise<string> => {
      await ready;
      await call('load', [base.href.replace(/\/$/, '')]);
      const packages = [...(options.texPackages ?? []), ...(language === 'circuitikz' || /\\begin\s*\{circuitikz\}/.test(source) ? ['circuitikz'] : [])];
      const libraries = options.tikzLibraries ?? ['arrows.meta', 'calc', 'positioning'];
      if ([...packages, ...libraries].some((name) => !/^[A-Za-z0-9_.-]+$/.test(name))) throw new Error('Invalid TikZ package or library name');
      const output = await call('texify', [source, { texPackages: Object.fromEntries(packages.map((name) => [name, ''])), tikzLibraries: libraries.join(','), showConsole: true }]);
      if (texError) throw new Error(`TeX compilation error: ${texError}`);
      if (typeof output !== 'string' || new TextEncoder().encode(output).byteLength > (options.maxOutputBytes ?? 4 * 1024 * 1024))
        throw new Error('TikZ output is invalid or exceeds the configured byte limit');
      return output;
    };
    const html = await Promise.race([render(), errorPromise]);
    controller.signal.throwIfAborted();
    const template = document.createElement('template');
    template.innerHTML = html;
    const svg = template.content.querySelector('svg');
    if (!svg || template.content.querySelectorAll('svg').length !== 1) throw new Error('TikZ must produce exactly one SVG diagram');
    const prefix = `markdown-tikz-${++sequence}-`;
    const ids = new Map<string, string>();
    svg.querySelectorAll('[id]').forEach((element) => {
      const id = `${prefix}${ids.size}`;
      ids.set(element.id, id);
      element.id = id;
    });
    svg.id = `${prefix}svg`;
    svg.querySelectorAll('style').forEach((element) => element.remove());
    const families = new Set<string>();
    [svg, ...Array.from(svg.querySelectorAll('*'))].forEach((element) => {
      for (const attr of Array.from(element.attributes)) {
        if (attr.name === 'style' || /\\|\/\*/.test(attr.value)) element.removeAttribute(attr.name);
        else if (['href', 'xlink:href', 'src'].includes(attr.name)) {
          const id = attr.value.startsWith('#') ? ids.get(attr.value.slice(1)) : undefined;
          if (id) element.setAttribute(attr.name, `#${id}`);
          else element.removeAttribute(attr.name);
        } else if (/url\s*\(/i.test(attr.value)) {
          const match = /^url\(\s*#([\w:.-]+)\s*\)$/.exec(attr.value);
          const id = match ? ids.get(match[1]!) : undefined;
          if (id) element.setAttribute(attr.name, `url(#${id})`);
          else element.removeAttribute(attr.name);
        }
      }
      const family = element.getAttribute('font-family');
      if (family) {
        if (!/^[A-Za-z0-9_-]+$/.test(family)) throw new Error('TikZ produced an unsupported font family');
        families.add(family);
        element.setAttribute('font-family', `${prefix}${family}`);
      }
    });
    if (families.size > 64) throw new Error('TikZ exceeds the 64-font limit');
    let css = '';
    for (const family of families) {
      const bytes = await readBytes(new URL(`fonts/${family}.woff2`, base), context);
      const url = context.resources!.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'font/woff2' }));
      urls.push(url);
      css += `@font-face{font-family:${prefix}${family};src:url("${url}") format("woff2");}`;
    }
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = css;
    svg.prepend(style);
    controller.signal.throwIfAborted();
    return { svg: svg.outerHTML, release: cleanupFonts };
  } catch (cause) {
    cleanupFonts();
    throw cause;
  } finally {
    clearTimeout(timer);
    originalContext.signal?.removeEventListener('abort', abort);
    controller.signal.removeEventListener('abort', stopped);
    removeListeners();
    worker?.terminate();
    if (workerUrl) URL.revokeObjectURL(workerUrl);
  }
};
