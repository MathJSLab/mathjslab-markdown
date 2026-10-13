import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { mermaidManifest } from './manifest.js';
import { renderExtensionError } from '../../extensionUtils.js';

type MermaidApi = typeof import('mermaid').default;
let sequence = 0;

export const mermaidExtension = (): MarkdownExtension => {
  let loading: Promise<MermaidApi> | undefined;
  const rendered = new Set<Element>();

  const load = (): Promise<MermaidApi> => {
    loading ??= import(/* webpackChunkName: "markdown-mermaid" */ 'mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        suppressErrorRendering: true,
      });
      return mermaid;
    });
    return loading;
  };

  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    try {
      const mermaid = await load();
      if (context.signal?.aborted) return;
      const { svg, bindFunctions } = await mermaid.render(`mathjslab-mermaid-${++sequence}`, source);
      if (context.signal?.aborted) return;
      container.innerHTML = svg;
      bindFunctions?.(container);
      rendered.add(container);
    } catch (error) {
      if (context.signal?.aborted) return;
      renderExtensionError(container, 'Mermaid', 'mermaid', source, error, context);
    }
  };

  const disposeContainer = (container: Element): void => {
    rendered.delete(container);
    container.replaceChildren();
  };

  return {
    name: mermaidManifest.name,
    manifest: mermaidManifest,
    fences: [{ ...mermaidManifest.fences[0], render, dispose: disposeContainer }],
    dispose() {
      for (const container of rendered) container.replaceChildren();
      rendered.clear();
      loading = undefined;
    },
  };
};
