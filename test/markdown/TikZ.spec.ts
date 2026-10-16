import { jest } from '@jest/globals';
import { Worker as NodeWorker } from 'node:worker_threads';
import { readFileSync, existsSync } from 'node:fs';
import { TextEncoder, TextDecoder } from 'node:util';
import { tikzExtension } from '../../src/markdown/extensions/tikz/extension.js';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import type { TikZWorker, TikZOptions } from '../../src/markdown/extensions/tikz/runtime.js';
import type { MarkdownDocumentContext, MarkdownDiagnostic } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder, TextDecoder });
let nextUrl = 0;
const revoke = jest.fn();
Object.assign(URL, { createObjectURL: () => `blob:https://assets.test/font-${++nextUrl}`, revokeObjectURL: revoke });
const active = new Set<NodeWorker>();
const createWorker = (script: string): TikZWorker => {
  const worker = new NodeWorker(
    `const {parentPort}=require('node:worker_threads');const handlers=new Map();globalThis.self=globalThis;globalThis.postMessage=(data)=>parentPort.postMessage(data);globalThis.addEventListener=(type,handler)=>{if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(handler);};globalThis.removeEventListener=(type,handler)=>handlers.get(type)?.delete(handler);parentPort.on('message',data=>{for(const handler of handlers.get('message')??[])handler({data});});\n${script}`,
    { eval: true },
  );
  active.add(worker);
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  worker.on('message', (data) => {
    for (const handler of listeners.get('message') ?? []) handler({ data });
  });
  worker.on('error', (error) => {
    for (const handler of listeners.get('error') ?? []) handler({ message: error.message });
  });
  return {
    postMessage(data: unknown) {
      worker.postMessage(data);
    },
    addEventListener(type: string, handler: (event: unknown) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    removeEventListener(type: string, handler: (event: unknown) => void) {
      listeners.get(type)?.delete(handler);
    },
    terminate() {
      active.delete(worker);
      void worker.terminate();
    },
  } as unknown as TikZWorker;
};
const fetched: string[] = [];
const fetchResource: NonNullable<MarkdownDocumentContext['fetchResource']> = async (url) => {
  fetched.push(url.href);
  const relative = url.pathname.replace(/^\/runtime\//, '');
  const file = new URL(`../../node_modules/@rod2ik/tikzjax/dist/${relative}`, import.meta.url);
  if (!existsSync(file)) return { ok: false, status: 404, statusText: 'Missing', headers: { get: () => null } } as unknown as Response;
  const bytes = Uint8Array.from(readFileSync(file));
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    url: url.href,
    body: null,
    headers: { get: (name: string) => (name === 'content-length' ? String(bytes.length) : null) },
    arrayBuffer: async () => bytes.buffer,
  } as unknown as Response;
};
const context: MarkdownDocumentContext = { sourceUrl: new URL('https://assets.test/lesson.md'), securityMode: 'sanitized', allowedCapabilities: ['wasm', 'network'], fetchResource };
const options: TikZOptions = { assetBaseUrl: 'https://assets.test/runtime/', createWorker, timeoutMs: 20_000 };
const tikz = String.raw`\begin{tikzpicture}\draw (0,0) -- (1,1);\node at (0,0) {A};\end{tikzpicture}`;
const circuit = String.raw`\begin{circuitikz}[american]\draw (0,0) to[battery1,l=$V$] (0,2) to[R,l=$R$] (3,2) -- (3,0) -- (0,0);\end{circuitikz}`;
const fence = (source: string, language = 'tikz') => `\`\`\`${language}\n${source}\n\`\`\``;

describe('TikZ with the real TeX WASM worker', () => {
  test('registers fonts for Shadow DOM and removes them on disposal', async () => {
    const previousFace = Object.getOwnPropertyDescriptor(globalThis, 'FontFace');
    const previousFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
    const faces = new Set<unknown>();
    class TestFontFace {
      constructor(
        public family: string,
        public source: ArrayBuffer,
      ) {}
      async load() {
        return this;
      }
    }
    Object.defineProperty(globalThis, 'FontFace', { configurable: true, value: TestFontFace });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { add: (face: unknown) => faces.add(face), delete: (face: unknown) => faces.delete(face) } });
    const extension = tikzExtension(options);
    const container = document.createElement('div');
    document.createElement('div').attachShadow({ mode: 'open' }).append(container);
    try {
      await extension.fences![0]!.render(container, tikz, context);
      expect(container.querySelector('[role="alert"]')).toBeNull();
      expect(faces.size).toBeGreaterThan(0);
      for (const face of faces) expect((face as TestFontFace).family).toMatch(/^markdown-tikz-/);
      await extension.dispose!();
      expect(faces.size).toBe(0);
    } finally {
      await extension.dispose!();
      if (previousFace) Object.defineProperty(globalThis, 'FontFace', previousFace);
      else Reflect.deleteProperty(globalThis, 'FontFace');
      if (previousFonts) Object.defineProperty(document, 'fonts', previousFonts);
      else Reflect.deleteProperty(document, 'fonts');
    }
  }, 30_000);
  afterEach(() => {
    for (const worker of active) {
      void worker.terminate();
    }
    active.clear();
    fetched.length = 0;
  });
  test('compiles TikZ and CircuiTikZ, embeds fonts and releases resources', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['tikz'], tikzOptions: options, securityMode: 'sanitized', allowedCapabilities: ['wasm', 'network'] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    const session = await engine.renderDocument(`${fence(tikz)}\n\n${fence(circuit, 'circuitikz')}`, container, { ...context, onDiagnostic: (value) => diagnostics.push(value) });
    expect(diagnostics).toEqual([]);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(5);
    expect(container.querySelectorAll('text').length).toBeGreaterThan(0);
    expect(container.querySelector('svg style')?.textContent).toContain('@font-face');
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('img');
    expect(fetched.some((url) => url.includes('circuitikz.sty.gz'))).toBe(true);
    expect(active.size).toBe(0);
    await session.dispose();
    await engine.dispose();
    expect(revoke).toHaveBeenCalled();
  }, 30_000);
  test('terminates compilation on timeout and permits a subsequent valid render', async () => {
    const extension = tikzExtension({ ...options, timeoutMs: 2000 });
    const container = document.createElement('div');
    await extension.fences![0]!.render(container, String.raw`\loop\iftrue\repeat`, context);
    expect(container.textContent).toContain('timed out');
    expect(active.size).toBe(0);
    await extension.dispose!();
    const retry = tikzExtension(options);
    await retry.fences![0]!.render(container, tikz, context);
    expect(container.querySelector('svg')).not.toBeNull();
    await retry.dispose!();
  }, 30_000);
  test('retains invalid TeX while rendering an unrelated valid diagram', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['tikz'], tikzOptions: options });
    const container = document.createElement('div');
    await engine.renderDocument(`${fence(String.raw`\unknowncommand`)}\n\n${fence(tikz)}`, container, context);
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toContain('unknowncommand');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    await engine.dispose();
  }, 30_000);
  test('enforces capabilities, source limits and cancellation', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['tikz'], tikzOptions: options, securityMode: 'strict' });
    const container = document.createElement('div');
    await engine.renderDocument(fence(tikz), container);
    expect(container.querySelector('svg')).toBeNull();
    expect(fetched).toHaveLength(0);
    await engine.dispose();
    const extension = tikzExtension(options);
    await extension.fences![0]!.render(container, tikz, { ...context, maxSourceBytes: 4 });
    expect(container.textContent).toContain('Source exceeds');
    const controller = new AbortController();
    controller.abort();
    container.textContent = 'untouched';
    await extension.fences![0]!.render(container, tikz, { ...context, signal: controller.signal });
    expect(container.textContent).toBe('untouched');
    await extension.dispose!();
  });
  test('blocks runtime downloads through the document resource policy', async () => {
    const extension = tikzExtension(options);
    const container = document.createElement('div');
    await extension.fences![0]!.render(container, tikz, { ...context, resourcePolicy: { allowNetwork: false } });
    expect(container.querySelector('svg')).toBeNull();
    expect(fetched).toHaveLength(0);
    await extension.dispose!();
  });
  test('blocks arbitrary worker resource requests and removes active SVG content', async () => {
    let denied = false;
    const mockedWorker = (script: string): TikZWorker => {
      expect(script).toContain('tikz-resource-request');
      const listeners = new Set<(event: MessageEvent) => void>();
      let loadId = 0;
      const send = (data: unknown) => {
        for (const fn of listeners) fn({ data } as MessageEvent);
      };
      queueMicrotask(() => send({ type: 'init' }));
      return {
        addEventListener(type: string, fn: (event: MessageEvent) => void) {
          if (type === 'message') listeners.add(fn);
        },
        removeEventListener(type: string, fn: (event: MessageEvent) => void) {
          if (type === 'message') listeners.delete(fn);
        },
        terminate() {
          listeners.clear();
        },
        postMessage(data: { type: string; uid: number; method?: string; error?: string }) {
          if (data.type === 'run' && data.method === 'load') {
            loadId = data.uid;
            send({ type: 'tikz-resource-request', uid: 99, reference: 'https://assets.test/private.txt' });
          } else if (data.type === 'tikz-resource-response') {
            denied = !!data.error;
            send({ type: 'result', uid: loadId, complete: true });
          } else if (data.method === 'texify')
            send({
              type: 'result',
              uid: data.uid,
              complete: true,
              payload:
                '<svg xmlns="http://www.w3.org/2000/svg" style="background:url(https://outside.test)"><defs><g id="000"><path d="M0 0L1 1"/></g></defs><use href="#000"/><image href="https://outside.test/image.svg"/><rect fill="url(https://outside.test)"/><script>bad()</script></svg>',
            });
        },
      } as unknown as TikZWorker;
    };
    const extension = tikzExtension({ ...options, createWorker: mockedWorker });
    const container = document.createElement('div');
    await extension.fences![0]!.render(container, tikz, context);
    expect(denied).toBe(true);
    expect(fetched).toEqual(['https://assets.test/runtime/run-tex.js']);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('outside.test');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('use')?.getAttribute('href')).toMatch(/^#markdown-tikz-/);
    await extension.dispose!();
  });
  test('cancels an active worker without inserting stale output', async () => {
    const controller = new AbortController();
    const extension = tikzExtension({
      ...options,
      createWorker(script) {
        const worker = createWorker(script);
        setTimeout(() => controller.abort(), 50);
        return worker;
      },
    });
    const container = document.createElement('div');
    container.textContent = 'original';
    await extension.fences![0]!.render(container, tikz, { ...context, signal: controller.signal });
    expect(container.textContent).toBe('original');
    expect(active.size).toBe(0);
    await extension.dispose!();
  });
  test.each(['pt', 'en', 'es'].flatMap((lang) => ['circuitos-eletricos', 'arvore-de-probabilidade', 'resistores-em-paralelo', 'filtro-rc'].map((file) => ({ lang, file }))))(
    'compiles $lang/$file and resolves its captions',
    async ({ lang, file }) => {
      const engine = createEducationalMarkdownEngine({ features: ['tikz', 'didactic', 'cross-references'], tikzOptions: options });
      const container = document.createElement('div');
      const diagnostics: MarkdownDiagnostic[] = [];
      await engine.renderDocument(readFileSync(new URL(`../../example/${lang}/${file}.md`, import.meta.url), 'utf8'), container, {
        ...context,
        locale: { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[lang]!,
        onDiagnostic: (value) => diagnostics.push(value),
      });
      expect(diagnostics).toEqual([]);
      const count = file === 'circuitos-eletricos' ? 2 : 1;
      expect(container.querySelectorAll('svg')).toHaveLength(count);
      const label = lang === 'en' ? 'Figure' : 'Figura';
      expect(Array.from(container.querySelectorAll('[data-markdown-reference] a'), (node) => node.textContent)).toEqual(Array.from({ length: count }, (_, index) => `${label} ${index + 1}`));
      await engine.dispose();
      expect(active.size).toBe(0);
    },
    30_000,
  );
});
