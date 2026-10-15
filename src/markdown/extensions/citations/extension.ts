import DOMPurify from 'dompurify';
import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError } from '../../extensionUtils.js';
import { citationsManifest } from './manifest.js';
import { markdownDiagnosticCodes } from '../../diagnostics.js';

export type CitationsOptions = {
  /** Built-in APA, Vancouver or Harvard (citation1); defaults to APA. */
  style?: 'apa' | 'vancouver' | 'harvard1';
  /** Integrator-supplied standalone CSL style, without remote dependent styles. */
  styleXml?: string;
  /** Integrator-supplied CSL locales keyed by language tag. */
  locales?: Readonly<Record<string, string>>;
  lang?: string;
  includeUncited?: boolean;
};

type CiteItem = { id: string; locator?: string; label?: string };
const key = '[A-Za-z0-9_][A-Za-z0-9_:./-]*';
const citationPattern = new RegExp(`^\\[@${key}(?:,\\s*(?:p|pp)\\.\\s*[0-9]+(?:[-–][0-9]+)?)?(?:;\\s*@${key}(?:,\\s*(?:p|pp)\\.\\s*[0-9]+(?:[-–][0-9]+)?)?)*\\]`);
const parseCitation = (source: string): CiteItem[] =>
  source
    .slice(1, -1)
    .split(/;\s*/)
    .map((part) => {
      const [id, pages] = part.slice(1).split(/,\s*(?:p|pp)\.\s*/);
      return { id: id!, ...(pages ? { locator: pages, label: 'page' } : {}) };
    });
let runtime: Promise<{ core: typeof import('@citation-js/core'); CSL: (typeof import('citeproc'))['default']; portugueseLocale: string }> | undefined;
const loadRuntime = (): NonNullable<typeof runtime> => {
  runtime ??= (async () => {
    const core = await import(/* webpackChunkName: "markdown-citations" */ '@citation-js/core');
    await import(/* webpackChunkName: "markdown-citations" */ '@citation-js/plugin-bibtex');
    await import(/* webpackChunkName: "markdown-citations" */ '@citation-js/plugin-csl');
    const { default: CSL } = await import(/* webpackChunkName: "markdown-citations" */ 'citeproc');
    const { portugueseLocale } = await import(/* webpackChunkName: "markdown-citations" */ './locale.js');
    return { core, CSL, portugueseLocale };
  })().catch((error: unknown) => {
    runtime = undefined;
    throw error;
  });
  return runtime;
};

/** CSL output retains only typography, never active content, links or resource URLs. */
const cleanHTML = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'i', 'b', 'em', 'strong', 'sup', 'sub', 'br'],
    ALLOWED_ATTR: ['class'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
let nextDocument = 0;

export const citationsExtension = (options: CitationsOptions = {}): MarkdownExtension => {
  const sources = new WeakMap<Element, { language: string; source: string }>();
  const prefixes = new WeakMap<ParentNode, string>();
  const report = (context: MarkdownDocumentContext, code: string, message: string): void => {
    context.onDiagnostic?.({ extension: 'citations', code, category: 'extension', severity: 'warning', message, ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}) });
  };
  return {
    name: citationsManifest.name,
    manifest: citationsManifest,
    marked: {
      extensions: [
        {
          name: 'citation',
          level: 'inline',
          start(source) {
            return source.indexOf('[@');
          },
          tokenizer(source) {
            const match = citationPattern.exec(source);
            if (match) return { type: 'citation', raw: match[0], text: match[0] };
          },
          renderer(token) {
            return `<span data-markdown-citation="${token.text}">${token.text}</span>`;
          },
        },
      ],
    },
    fences: citationsManifest.fences.map(({ language, className }) => ({
      language,
      className,
      async render(container, source, context) {
        container.removeAttribute('hidden');
        try {
          assertSourceSize(source, context);
          sources.set(container, { language, source });
          container.replaceChildren();
          if (language !== 'bibliography') container.setAttribute('hidden', '');
        } catch (error) {
          sources.delete(container);
          renderExtensionError(container, 'citations', language, source, error, context);
        }
      },
    })),
    async typeset(container, context) {
      const citationNodes = Array.from(container.querySelectorAll<HTMLElement>('[data-markdown-citation]'));
      const blocks = Array.from(container.querySelectorAll<HTMLElement>('[data-markdown-extension="citations"]')).filter((node) => sources.has(node));
      if (!blocks.length && !citationNodes.length) return;
      if (context.signal?.aborted) return;
      let prefix = prefixes.get(container);
      if (!prefix) {
        prefix = `markdown-cite-${++nextDocument}-`;
        prefixes.set(container, prefix);
      }
      const bibliographies = blocks.filter((node) => sources.get(node)!.language === 'bibliography');
      try {
        let settings = { ...options };
        if (bibliographies.length > 1) throw new Error('Only one bibliography block is allowed per document');
        const bibliography = bibliographies[0];
        if (bibliography) {
          const source = sources.get(bibliography)!.source.trim();
          if (source) {
            const config: unknown = JSON.parse(source);
            if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Bibliography configuration must be an object');
            const value = config as Record<string, unknown>;
            if (Object.keys(value).some((name) => !['style', 'lang', 'includeUncited'].includes(name))) throw new Error('Unknown bibliography configuration field');
            if (value.style !== undefined && !['apa', 'vancouver', 'harvard1'].includes(String(value.style))) throw new Error('Unknown CSL style');
            if (value.lang !== undefined && (typeof value.lang !== 'string' || !/^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/.test(value.lang))) throw new Error('Invalid bibliography language');
            if (value.includeUncited !== undefined && typeof value.includeUncited !== 'boolean') throw new Error('includeUncited must be boolean');
            settings = { ...settings, ...value };
          }
        }
        const { core, CSL, portugueseLocale } = await loadRuntime();
        if (context.signal?.aborted) return;
        const entries = new Map<string, Record<string, unknown>>();
        const duplicateIds = new Set<string>();
        for (const block of blocks) {
          const data = sources.get(block)!;
          if (data.language === 'bibliography') continue;
          try {
            let input: unknown;
            if (data.language === 'bibtex')
              input = new core.Cite(data.source, { forceType: '@bibtex/text', target: '@csl/list+object', maxChainLength: 10, generateGraph: false, strict: true }).data;
            else input = JSON.parse(data.source);
            if (!Array.isArray(input)) throw new Error('CSL JSON must be an array of references');
            if (input.length + entries.size > 1000) throw new Error('A document supports at most 1000 references');
            // Validate the whole block before accepting any of its records.
            for (const item of input) {
              if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Each reference must be an object');
              const record = item as Record<string, unknown>;
              if (typeof record.id !== 'string' || !new RegExp(`^${key}$`).test(record.id) || typeof record.type !== 'string' || !record.type)
                throw new Error('Each reference needs a valid string id and CSL type');
            }
            for (const item of input as Record<string, unknown>[]) {
              const id = item.id as string;
              if (entries.has(id)) {
                duplicateIds.add(id);
                report(context, markdownDiagnosticCodes.citationDuplicate, `Duplicate citation key: ${id}`);
              } else entries.set(id, JSON.parse(JSON.stringify(item)) as Record<string, unknown>);
            }
          } catch (error) {
            block.hidden = false;
            renderExtensionError(block, 'citations', data.language, data.source, error, context);
          }
        }
        for (const id of duplicateIds) entries.delete(id);
        if (citationNodes.length > 1000) throw new Error('A document supports at most 1000 citation clusters');
        const valid: { node: HTMLElement; items: CiteItem[] }[] = [];
        let citationItemCount = 0;
        for (const node of citationNodes) {
          const source = node.dataset.markdownCitation!;
          if (citationPattern.exec(source)?.[0] !== source) throw new Error('Invalid citation marker');
          const items = parseCitation(source);
          citationItemCount += items.length;
          if (citationItemCount > 5000) throw new Error('A document supports at most 5000 citation items');
          const missing = items.filter(({ id }) => !entries.has(id));
          node.replaceChildren();
          node.classList.toggle('markdown-citation-unresolved', missing.length > 0);
          if (missing.length) {
            node.textContent = source;
            for (const { id } of missing) report(context, markdownDiagnosticCodes.citationMissing, `Unknown or duplicate citation key: ${id}`);
          } else valid.push({ node, items });
        }
        const registry = core.plugins.config.get('@csl');
        const style = settings.styleXml ?? registry.styles.get(settings.style ?? 'apa');
        if (!style) throw new Error('Unknown CSL style');
        assertSourceSize(style, context);
        const processor = new CSL.Engine(
          {
            retrieveItem(id) {
              const item = entries.get(id);
              if (!item) throw new Error(`Unknown citation key: ${id}`);
              return item;
            },
            retrieveLocale(lang) {
              return (
                settings.locales?.[lang] ??
                (lang === 'pt-BR' ? portugueseLocale : undefined) ??
                registry.locales.get(lang) ??
                registry.locales.get(lang.replace('-', '_')) ??
                registry.locales.get('en-US')
              );
            },
          },
          style,
          (settings.lang ?? (context.locale === 'pt' ? 'pt-BR' : context.locale) ?? 'en-US').replace('_', '-'),
          true,
        );
        processor.setOutputFormat('html');
        const output = processor.rebuildProcessorState(
          valid.map(({ items }, index) => ({ citationID: `${prefix}${index}`, citationItems: items, properties: { noteIndex: 0 } })),
          'html',
          settings.includeUncited ? [...entries.keys()] : [],
        );
        const result = processor.makeBibliography();
        const targets = new Map<string, string>();
        if (bibliography) {
          bibliography.replaceChildren();
          bibliography.classList.add('markdown-bibliography');
          bibliography.classList.toggle('markdown-bibliography-hanging', !!result && result[0].hangingindent);
          if (result)
            result[1].forEach((html, index) => {
              const entry = document.createElement('div');
              entry.className = 'markdown-bibliography-entry';
              entry.id = `${prefix}entry-${index}`;
              entry.innerHTML = cleanHTML(html);
              for (const id of result[0].entry_ids[index] ?? []) targets.set(id, entry.id);
              bibliography.append(entry);
            });
        }
        valid.forEach(({ node, items }, index) => {
          const target = targets.get(items[0]!.id);
          const element = document.createElement(target ? 'a' : 'span');
          if (target) element.setAttribute('href', `#${target}`);
          element.innerHTML = cleanHTML(output[index]?.[2] ?? '');
          node.replaceChildren(element);
        });
      } catch (error) {
        for (const node of citationNodes) {
          node.textContent = node.dataset.markdownCitation!;
          node.classList.add('markdown-citation-unresolved');
        }
        for (const block of bibliographies) renderExtensionError(block, 'citations', 'bibliography', sources.get(block)!.source, error, context);
        if (!bibliographies.length)
          context.onDiagnostic?.({
            extension: 'citations',
            code: markdownDiagnosticCodes.extensionRenderError,
            category: 'extension',
            severity: 'error',
            message: error instanceof Error ? error.message : String(error),
            cause: error,
          });
      }
    },
  };
};
