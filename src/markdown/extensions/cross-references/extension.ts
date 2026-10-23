import type { MarkdownExtension } from '../../../MarkdownEngine.js';
import type { Tokens } from 'marked';
import { blockSyntax, blockLabels, localizeBlocks, type BlockKind } from '../didactic/blocks.js';
import { crossReferencesManifest } from './manifest.js';
import { markdownDiagnosticCodes } from '../../diagnostics.js';

let nextDocument = 0;

export const crossReferencesExtension = (): MarkdownExtension => {
  const prefixes = new WeakMap<ParentNode, string>();
  const blocks = blockSyntax('caption-block', ['figure', 'table', 'equation']);
  return {
    name: crossReferencesManifest.name,
    manifest: crossReferencesManifest,
    marked: {
      walkTokens(token) {
        if (token.type !== 'heading') return;
        const heading = token as Tokens.Heading & { markdownHeading?: string };
        const last = heading.tokens.at(-1);
        const match = /(?:^|\s)\{#([A-Za-z][\w:.-]*)\}[ \t]*$/.exec(heading.text);
        // Only a literal trailing text token is metadata, never inline code,
        // escaped braces, or content nested inside emphasis or links.
        if (!match || last?.type !== 'text' || !last.raw.endsWith(match[0])) return;
        heading.tokens = heading.tokens.slice(0, -1);
        heading.tokens.push({ ...last, raw: last.raw.slice(0, -match[0].length), text: last.text.slice(0, -match[0].length) });
        heading.text = heading.text.slice(0, match.index);
        heading.markdownHeading = match[1]!;
      },
      renderer: {
        heading(token) {
          const label = (token as typeof token & { markdownHeading?: string }).markdownHeading;
          if (!label) return false;
          return `<h${token.depth} id="${label}" data-markdown-heading="${label}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
        },
      },
      extensions: [
        ...(blocks.extensions ?? []),
        {
          name: 'cross-reference',
          level: 'inline',
          start(src) {
            return src.indexOf('{@ref ');
          },
          tokenizer(src) {
            const match = /^\{@ref ([A-Za-z][\w:.-]*)\}/.exec(src);
            if (match) return { type: 'cross-reference', raw: match[0], text: match[1]! };
          },
          renderer(token) {
            return `<span data-markdown-reference="${token.text}">${token.raw}</span>`;
          },
        },
      ],
    },
    prepare(container) {
      container.querySelectorAll<HTMLElement>('[data-markdown-heading]').forEach((heading) => {
        // Capture before mathematical renderers alter the heading's DOM.
        heading.dataset.markdownHeadingText ??= heading.textContent?.trim() ?? '';
      });
    },
    typeset(container, context) {
      localizeBlocks(container, context.locale);
      let prefix = prefixes.get(container);
      if (!prefix) {
        prefix = `markdown-ref-${++nextDocument}-`;
        prefixes.set(container, prefix);
      }
      const counts = new Map<string, number>();
      const targets = new Map<string, { id: string; text: string }>();
      const targetIds = new Map<string, string>();
      const duplicates = new Set<string>();
      const labels = blockLabels[(context.locale?.split(/[-_]/)[0] ?? 'en') as keyof typeof blockLabels] ?? blockLabels.en;
      const report = (code: string, message: string): void =>
        context.onDiagnostic?.({
          extension: crossReferencesManifest.name,
          code,
          category: 'extension',
          severity: 'warning',
          ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
          message,
        });
      const elements = Array.from(container.querySelectorAll<HTMLElement>('[data-markdown-block], [data-markdown-heading]'));
      const automatic = Array.from(container.querySelectorAll<HTMLElement>('[data-markdown-auto-heading]'));
      const foreignIds = new Set(
        Array.from(container.querySelectorAll<HTMLElement>('[id]:not([data-markdown-auto-heading]):not([data-markdown-heading]):not([data-markdown-block])'), (node) => node.id),
      );
      const reserved = new Set(Array.from(container.querySelectorAll<HTMLElement>('[id]:not([data-markdown-auto-heading])'), (node) => node.id));
      for (const element of elements) {
        const label = element.dataset.markdownHeading ?? element.dataset.markdownLabel;
        if (label) reserved.add(element.dataset.markdownHeading ? label : `${prefix}${label}`);
      }
      // Keep unconflicted automatic anchors (including their existing suffixes).
      const used = new Set([...reserved, ...automatic.map((heading) => heading.id)]);
      for (const heading of automatic) {
        if (!reserved.has(heading.id)) continue;
        const base = heading.id;
        let suffix = 1;
        while (used.has(`${base}-${suffix}`)) suffix++;
        heading.id = `${base}-${suffix}`;
        used.add(heading.id);
      }
      const sectionLabels: Record<string, string> = { en: 'Section', pt: 'Seção', es: 'Sección' };
      elements.forEach((block) => {
        const headingLabel = block.dataset.markdownHeading;
        const kind = block.dataset.markdownBlock as BlockKind;
        let text: string;
        if (headingLabel) {
          const title = block.dataset.markdownHeadingText ?? block.textContent?.trim() ?? '';
          const number = /^(\d+(?:\.\d+)*)(?:\.)?\s+/.exec(title)?.[1];
          text = number ? `${sectionLabels[context.locale?.split(/[-_]/)[0] ?? 'en'] ?? sectionLabels.en} ${number}` : title;
        } else {
          if (!labels[kind]) return;
          const number = (counts.get(kind) ?? 0) + 1;
          counts.set(kind, number);
          text = `${labels[kind]} ${number}`;
          const heading = block.querySelector('[data-markdown-block-label]');
          if (heading) heading.textContent = text;
        }
        const label = headingLabel ?? block.dataset.markdownLabel;
        if (!label) return;
        const id = headingLabel ? label : `${prefix}${label}`;
        const conflictingLabel = targetIds.get(id);
        if (targets.has(label) || foreignIds.has(id) || conflictingLabel) {
          duplicates.add(label);
          if (conflictingLabel) duplicates.add(conflictingLabel);
          block.removeAttribute('id');
          report(markdownDiagnosticCodes.crossReferenceDuplicate, `Duplicate reference label: ${label}`);
        } else {
          block.id = id;
          targets.set(label, { id, text });
          targetIds.set(id, label);
        }
      });
      container.querySelectorAll<HTMLElement>('[data-markdown-reference]').forEach((reference) => {
        const label = reference.dataset.markdownReference!;
        const target = duplicates.has(label) ? undefined : targets.get(label);
        reference.replaceChildren();
        reference.classList.toggle('markdown-reference-unresolved', !target);
        if (target) {
          const link = document.createElement('a');
          link.setAttribute('href', `#${target.id}`);
          link.textContent = target.text;
          reference.append(link);
        } else {
          reference.textContent = `{@ref ${label}}`;
          if (!duplicates.has(label)) report(markdownDiagnosticCodes.crossReferenceMissing, `Unknown reference label: ${label}`);
        }
      });
    },
  };
};
