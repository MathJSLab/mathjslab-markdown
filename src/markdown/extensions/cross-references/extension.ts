import type { MarkdownExtension } from '../../../MarkdownEngine.js';
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
    typeset(container, context) {
      localizeBlocks(container, context.locale);
      let prefix = prefixes.get(container);
      if (!prefix) {
        prefix = `markdown-ref-${++nextDocument}-`;
        prefixes.set(container, prefix);
      }
      const counts = new Map<string, number>();
      const targets = new Map<string, { id: string; text: string }>();
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
      container.querySelectorAll<HTMLElement>('[data-markdown-block]').forEach((block) => {
        const kind = block.dataset.markdownBlock as BlockKind;
        if (!labels[kind]) return;
        const number = (counts.get(kind) ?? 0) + 1;
        counts.set(kind, number);
        const text = `${labels[kind]} ${number}`;
        const heading = block.querySelector('[data-markdown-block-label]');
        if (heading) heading.textContent = text;
        const label = block.dataset.markdownLabel;
        if (!label) return;
        const id = `${prefix}${label}`;
        if (targets.has(label)) {
          duplicates.add(label);
          block.removeAttribute('id');
          report(markdownDiagnosticCodes.crossReferenceDuplicate, `Duplicate reference label: ${label}`);
        } else {
          block.id = id;
          targets.set(label, { id, text });
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
