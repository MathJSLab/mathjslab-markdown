import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils.js';
import { isMarkdownNodeWithin } from '../../lifecycle.js';
import { compileTikZ, type TikZOptions } from './runtime.js';
import { tikzManifest } from './manifest.js';

export const tikzExtension = (options: TikZOptions = {}): MarkdownExtension => {
  const rendered = new Map<Element, () => void>();
  let queue = Promise.resolve();
  const dispose = (container: Element): void => {
    rendered.get(container)?.();
    rendered.delete(container);
    container.replaceChildren();
  };
  const render = (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    const task = queue
      .catch(() => undefined)
      .then(async () => {
        const language = container.getAttribute('data-markdown-language') ?? 'tikz';
        let release: (() => void) | undefined;
        try {
          assertSourceSize(source, context);
          if (context.signal?.aborted) return;
          const result = await compileTikZ(source, language, options, context);
          release = result.release;
          const svg = await sanitizeSVG(result.svg);
          if (context.signal?.aborted) {
            release();
            return;
          }
          dispose(container);
          container.innerHTML = svg;
          const image = container.querySelector('svg');
          image?.setAttribute('role', 'img');
          image?.setAttribute('aria-label', language === 'circuitikz' ? 'CircuiTikZ circuit diagram' : 'TikZ diagram');
          rendered.set(container, release);
          release = undefined;
        } catch (cause) {
          release?.();
          if (!context.signal?.aborted) renderExtensionError(container, 'TikZ', language, source, cause, context);
        }
      });
    queue = task;
    return task;
  };
  return {
    name: tikzManifest.name,
    manifest: tikzManifest,
    fences: tikzManifest.fences.map((fence) => ({ ...fence, render, dispose })),
    disposeContainer(container) {
      for (const element of Array.from(rendered.keys())) if (isMarkdownNodeWithin(container, element)) dispose(element);
    },
    dispose() {
      for (const container of Array.from(rendered.keys())) dispose(container);
    },
  };
};
