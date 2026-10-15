import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextEncoder, TextDecoder } from 'node:util';
import JSON5 from 'json5';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { markdownExtensionCatalog } from '../../src/markdown/extensionCatalog.js';
import { mathJSLabExtension } from '../../src/markdown/extensions/mathjslab/extension.js';
import { validateGeometrySpec } from '../../src/markdown/extensions/geometry/spec.js';

Object.assign(globalThis, { TextEncoder, TextDecoder });
const root = fileURLToPath(new URL('../../', import.meta.url));
const languages = ['pt', 'en', 'es'] as const;
const locales = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
const notes = (lang: string): string[] =>
  fs
    .readdirSync(path.join(root, 'example', lang))
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .sort();
const read = (relative: string): string => fs.readFileSync(path.join(root, relative), 'utf8');
const engine = createEducationalMarkdownEngine({
  features: 'all',
  extensions: [mathJSLabExtension({ toMathML: () => '<math/>', createSession: async () => ({ parse: () => ({ statements: [] }), execute: () => ({ status: 'success' }) }) })],
});
const aliases = new Map(Object.entries(markdownExtensionCatalog).map(([key, { manifest }]) => [manifest.name, key]));
const parse = (source: string): HTMLDivElement => {
  const container = document.createElement('div');
  container.innerHTML = engine.parse(source);
  return container;
};
const featuresIn = (container: HTMLElement): Set<string> => {
  const features = new Set(Array.from(container.querySelectorAll<HTMLElement>('[data-markdown-extension]'), (node) => aliases.get(node.dataset.markdownExtension!)!));
  if (container.querySelector('.mathjax-pending')) features.add('mathjax');
  if (container.querySelector('[data-markdown-reference], [data-markdown-block="figure"], [data-markdown-block="table"], [data-markdown-block="equation"]')) features.add('cross-references');
  if (
    Array.from(container.querySelectorAll<HTMLElement>('[data-markdown-block]')).some((node) =>
      ['definition', 'theorem', 'proof', 'example', 'exercise', 'hint', 'solution'].includes(node.dataset.markdownBlock!),
    )
  )
    features.add('didactic');
  if (container.querySelector('code.hljs')) features.add('syntax-highlight');
  if (container.querySelector('h2[id]')) features.add('heading-ids');
  if (Array.from(container.querySelectorAll('a[href]')).some((a) => !/^(?:[a-z]+:|#)/i.test(a.getAttribute('href')!))) features.add('relative-urls');
  return features;
};

describe('three-language teaching collections', () => {
  afterAll(async () => engine.dispose());

  test('has corresponding notes and identical local resource files in all three languages', () => {
    expect(notes('en')).toEqual(notes('pt'));
    expect(notes('es')).toEqual(notes('pt'));
    for (const lang of languages) {
      const resources = fs.readdirSync(path.join(root, 'example', lang, 'resources')).sort();
      expect(resources).toEqual(fs.readdirSync(path.join(root, 'example', 'pt', 'resources')).sort());
      for (const file of resources) expect(read(`example/${lang}/resources/${file}`)).toBe(read(`example/pt/resources/${file}`));
    }
  });

  test.each(languages)('indexes every %s note and demonstrates every extension in at least four distinct documents', (lang) => {
    const index = parse(read(`example/${lang}/README.md`));
    const indexed = new Set(Array.from(index.querySelectorAll('a[href]'), (node) => node.getAttribute('href')).filter((href) => href && !href.includes('/') && href !== 'README.md'));
    expect([...indexed].sort()).toEqual(notes(lang));
    const coverage = new Map(Object.keys(markdownExtensionCatalog).map((key) => [key, [] as string[]]));
    for (const file of notes(lang)) {
      const container = parse(read(`example/${lang}/${file}`));
      const title = container.querySelector('h1')?.textContent;
      const indexLink = Array.from(index.querySelectorAll('a[href]')).find((node) => node.getAttribute('href') === file);
      expect(indexLink?.textContent).toBe(title);
      for (const feature of featuresIn(container)) coverage.get(feature)!.push(file);
    }
    for (const [feature, files] of coverage) {
      expect({ feature, notes: files.length }).toEqual({ feature, notes: expect.any(Number) });
      if (files.length < 4) throw new Error(`${lang}: ${feature} has only ${files.length} distinct examples`);
      const row = Array.from(index.querySelectorAll('tr')).find((node) => node.querySelector('td code')?.textContent === feature);
      expect(row?.querySelectorAll('td')[1]?.textContent).toBe(String(files.length));
    }
  });

  test('preserves extension and construction coverage across translations', () => {
    for (const file of notes('pt')) {
      const original = parse(read(`example/pt/${file}`));
      const shape = (container: HTMLElement) => ({
        features: [...featuresIn(container)].sort(),
        fences: Array.from(container.querySelectorAll('[data-markdown-language]'), (node) => node.getAttribute('data-markdown-language')),
        blocks: Array.from(container.querySelectorAll('[data-markdown-block]'), (node) => node.getAttribute('data-markdown-block')),
      });
      for (const lang of ['en', 'es']) expect({ file, ...shape(parse(read(`example/${lang}/${file}`))) }).toEqual({ file, ...shape(original) });
    }
  });

  test('keeps local document links, resource links and heading fragments valid in examples and documentation', () => {
    const scan = (directory: string): string[] =>
      fs
        .readdirSync(path.join(root, directory), { withFileTypes: true })
        .flatMap((entry) => (entry.isDirectory() ? scan(`${directory}/${entry.name}`) : entry.name.endsWith('.md') ? [`${directory}/${entry.name}`] : []));
    for (const file of [...scan('example'), ...scan('doc')]) {
      const container = parse(read(file));
      for (const node of container.querySelectorAll('a[href], img[src]')) {
        const href = node.getAttribute('href') ?? node.getAttribute('src')!;
        if (/^(?:[a-z]+:|\/\/)/i.test(href)) continue;
        const [reference, fragment] = href.split('#');
        const target = reference ? path.resolve(root, path.dirname(file), decodeURIComponent(reference.split('?')[0]!)) : path.join(root, file);
        if (!fs.existsSync(target)) throw new Error(`${file}: missing link target ${href}`);
        if (fragment && target.endsWith('.md')) {
          const targetDOM = target === path.join(root, file) ? container : parse(fs.readFileSync(target, 'utf8'));
          if (!Array.from(targetDOM.querySelectorAll('[id]')).some((entry) => entry.id === decodeURIComponent(fragment))) throw new Error(`${file}: unknown heading fragment ${href}`);
        }
      }
    }
  });

  test('keeps colon delimiters separate and resolves all teaching references in every locale', async () => {
    const references = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'] });
    try {
      for (const lang of languages)
        for (const file of notes(lang)) {
          const source = read(`example/${lang}/${file}`);
          if (!/^:{3,}/m.test(source)) continue;
          expect(source).not.toMatch(/\{@ref[^}]*\n[^}]*\}/);
          const container = document.createElement('div');
          const diagnostics: unknown[] = [];
          const session = await references.renderDocument(source, container, { locale: locales[lang], onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
          expect({ file, lang, diagnostics }).toEqual({ file, lang, diagnostics: [] });
          const openers = source.match(/^:{3,}\s+(?:definition|theorem|proof|example|exercise|hint|solution|figure|table|equation)\b/gm) ?? [];
          expect({ file, blocks: container.querySelectorAll('[data-markdown-block]').length }).toEqual({ file, blocks: openers.length });
          expect(container.querySelectorAll('[data-markdown-reference] a')).toHaveLength(container.querySelectorAll('[data-markdown-reference]').length);
          await session.dispose();
        }
    } finally {
      await references.dispose();
    }
  });

  test('validates all declarative geometry and XML notation sources', () => {
    for (const lang of languages)
      for (const file of notes(lang)) {
        const container = parse(read(`example/${lang}/${file}`));
        for (const node of container.querySelectorAll('[data-markdown-language]')) {
          const language = node.getAttribute('data-markdown-language');
          const source = node.querySelector('.markdown-extension-source')?.textContent ?? '';
          if (language === 'geometry') expect(() => validateGeometrySpec(JSON5.parse(source))).not.toThrow();
          if (language === 'mei' || language === 'musicxml') {
            const xml = new DOMParser().parseFromString(source, 'application/xml');
            expect({ file, lang, error: xml.querySelector('parsererror')?.textContent }).toEqual({ file, lang, error: undefined });
          }
        }
      }
  });

  test.each(languages)('renders every bibliography and waveform example in %s with the real processors', async (lang) => {
    const renderers = createEducationalMarkdownEngine({ features: ['citations', 'wavedrom', 'didactic', 'cross-references'] });
    try {
      for (const file of notes(lang)) {
        const source = read(`example/${lang}/${file}`);
        if (!/^```(?:bibliography|wavedrom)/m.test(source)) continue;
        const container = document.createElement('div');
        const diagnostics: unknown[] = [];
        const session = await renderers.renderDocument(source, container, { locale: locales[lang], onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
        expect({ file, lang, diagnostics }).toEqual({ file, lang, diagnostics: [] });
        if (/^```wavedrom/m.test(source)) expect(container.querySelectorAll('svg')).toHaveLength((source.match(/^```wavedrom/gm) ?? []).length);
        if (/^```bibliography/m.test(source)) expect(container.querySelectorAll('.markdown-bibliography-entry').length).toBeGreaterThan(0);
        expect(container.querySelector('[role="alert"], .markdown-extension-fallback, .markdown-citation-unresolved')).toBeNull();
        await session.dispose();
      }
    } finally {
      await renderers.dispose();
    }
  });

  test.each(languages)(
    'renders the ABC, MEI and MusicXML examples in %s with the real libraries',
    async (lang) => {
      Object.defineProperty(SVGElement.prototype, 'getBBox', { configurable: true, value: () => ({ x: 0, y: 0, width: 24, height: 12 }) });
      const scores = createEducationalMarkdownEngine({ features: ['abc', 'verovio'], allowedCapabilities: ['audio', 'wasm'] });
      try {
        for (const file of notes(lang)) {
          const source = read(`example/${lang}/${file}`);
          const count = (source.match(/^```(?:abc|mei|musicxml)\b/gm) ?? []).length;
          if (!count) continue;
          const container = document.createElement('div');
          const diagnostics: unknown[] = [];
          const session = await scores.renderDocument(source, container, { locale: locales[lang], onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
          expect({ file, lang, diagnostics }).toEqual({ file, lang, diagnostics: [] });
          expect(container.querySelectorAll('.abc-music > svg, .verovio-music > svg')).toHaveLength(count);
          expect(container.querySelector('[role="alert"], .markdown-extension-fallback')).toBeNull();
          await session.dispose();
        }
      } finally {
        await scores.dispose();
      }
    },
    30_000,
  );
});
