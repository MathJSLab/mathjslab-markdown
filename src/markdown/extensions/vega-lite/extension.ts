import type { MarkdownDocumentContext, MarkdownExtension, MarkdownResourceService } from '../../../MarkdownEngine.js';
import { assertSourceSize, observeElementResize, renderExtensionError } from '../../extensionUtils.js';
import { markdownDiagnosticCodes } from '../../diagnostics.js';
import { DefaultMarkdownResourceService } from '../../security.js';
import { createVegaLoader } from './loader.js';
import { vegaLiteManifest } from './manifest.js';
import { vegaManifest } from '../vega/manifest.js';

type VegaResult = {
  view: { resize(): unknown; runAsync(): Promise<unknown>; toSVG(): Promise<string> };
  finalize(): void;
};

const inlineDataUrls = async (value: unknown, context: MarkdownDocumentContext & { resources: MarkdownResourceService }): Promise<void> => {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => inlineDataUrls(entry, context)));
    return;
  }
  const record = value as Record<string, unknown>;
  if (record.data && typeof record.data === 'object' && typeof (record.data as Record<string, unknown>).url === 'string') {
    const data = record.data as Record<string, unknown>;
    const text = await context.resources.readText(data.url as string, context);
    const { read } = await import(/* webpackChunkName: "markdown-vega-lite" */ 'vega');
    const format = (data.format as { type?: string } | undefined)?.type ?? (/\.csv(?:$|\?)/i.test(data.url as string) ? 'csv' : 'json');
    data.values = read(text, { type: format as 'csv' | 'json' });
    delete data.url;
  }
  await Promise.all(Object.values(record).map((entry) => inlineDataUrls(entry, context)));
};

const createVegaExtension = (manifest: typeof vegaLiteManifest | typeof vegaManifest, label: string): MarkdownExtension => {
  const mode = manifest.name;
  const results = new Map<Element, { result: VegaResult; disconnect: () => void; compose?: (root: ParentNode) => void }>();
  const dispose = (container: Element): void => {
    const entry = results.get(container);
    results.delete(container);
    try {
      entry?.disconnect();
    } finally {
      try {
        entry?.result.finalize();
      } finally {
        container.replaceChildren();
      }
    }
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    let result: VegaResult | undefined;
    let disconnect = (): void => undefined;
    try {
      assertSourceSize(source, context);
      const spec = JSON.parse(source) as Record<string, unknown>;
      if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error(`Expected a ${label} JSON object`);
      if (spec.usermeta && typeof spec.usermeta === 'object') delete (spec.usermeta as Record<string, unknown>).embedOptions;
      const resources = context.resources ?? new DefaultMarkdownResourceService();
      const ownedResources = context.resources ? undefined : resources;
      const activeContext = { ...context, resources };
      disconnect = () => ownedResources?.dispose();
      if (mode === 'vega-lite') await inlineDataUrls(spec, activeContext);
      if (context.signal?.aborted) return;
      const [{ default: embed }, { View }] = await Promise.all([
        import(/* webpackChunkName: "markdown-vega-lite" */ 'vega-embed'),
        import(/* webpackChunkName: "markdown-vega-lite" */ 'vega'),
      ]);
      if (context.signal?.aborted) return;
      dispose(container);
      let pendingView: InstanceType<typeof View> | undefined;
      let compose: ((root: ParentNode) => void) | undefined;
      const trackView = (view: InstanceType<typeof View>): void => {
        pendingView = view;
      };
      class TrackedView extends View {
        constructor(...args: ConstructorParameters<typeof View>) {
          super(...args);
          trackView(this);
        }
        override async runAsync(...args: Parameters<InstanceType<typeof View>['runAsync']>): Promise<InstanceType<typeof View>> {
          const view = await super.runAsync(...args);
          if (!context.signal?.aborted) compose?.(container);
          return view;
        }
      }
      let initialLoadError: { cause: unknown } | undefined;
      let embedding = true;
      const loader = createVegaLoader(activeContext, mode, (cause) => {
        if (mode === 'vega' && embedding) initialLoadError ??= { cause };
      });
      try {
        result = await embed(container as HTMLElement, spec, {
          mode,
          renderer: 'svg',
          actions: false,
          ast: true,
          loader,
          viewClass: TrackedView,
          theme: context.theme === 'dark' ? 'dark' : undefined,
        });
      } catch (error) {
        pendingView?.finalize();
        throw error;
      } finally {
        embedding = false;
      }
      if (initialLoadError) throw initialLoadError.cause;
      if (context.vegaMathLabels && !context.signal?.aborted) {
        try {
          const { prepareMathLabels } = await import('./mathLabels.js');
          compose = await prepareMathLabels(container, context);
          if (!context.signal?.aborted) compose?.(container);
        } catch (error) {
          if (!context.signal?.aborted) {
            context.onDiagnostic?.({
              extension: mode,
              language: mode,
              code: markdownDiagnosticCodes.vegaMathLabelError,
              category: 'extension',
              severity: 'warning',
              message: error instanceof Error ? error.message : String(error),
              cause: error,
            });
          }
        }
      }
      if (context.signal?.aborted) {
        result.finalize();
        result = undefined;
        container.replaceChildren();
        return;
      }
      const activeResult = result;
      const stopResize = observeElementResize(container, context, () => {
        if (context.signal?.aborted) return;
        activeResult.view.resize();
        void activeResult.view.runAsync().catch(
          (error) =>
            !context.signal?.aborted &&
            context.onDiagnostic?.({
              extension: mode,
              language: mode,
              code: markdownDiagnosticCodes.vegaResizeError,
              category: 'extension',
              severity: 'warning',
              ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
              message: error instanceof Error ? error.message : String(error),
              cause: error,
            }),
        );
      });
      disconnect = () => {
        try {
          stopResize();
        } finally {
          compose = undefined;
          ownedResources?.dispose();
        }
      };
      results.set(container, { result, disconnect, ...(compose ? { compose } : {}) });
      result = undefined;
      disconnect = (): void => undefined;
    } catch (error) {
      try {
        result?.finalize();
      } catch {
        /* Preserve the original render diagnostic. */
      }
      dispose(container);
      if (!context.signal?.aborted) renderExtensionError(container, label, mode, source, error, context);
    } finally {
      disconnect();
    }
  };
  return {
    name: mode,
    manifest,
    fences: [
      {
        ...manifest.fences[0],
        render,
        dispose,
        exportSVG(container) {
          const entry = results.get(container);
          return entry?.result.view.toSVG().then((source) => {
            if (!entry.compose) return source;
            const template = container.ownerDocument.createElement('template');
            template.innerHTML = source;
            entry.compose(template.content);
            return template.innerHTML;
          });
        },
      },
    ],
    dispose() {
      for (const container of Array.from(results.keys())) dispose(container);
    },
  };
};

export const vegaLiteExtension = (): MarkdownExtension => createVegaExtension(vegaLiteManifest, 'Vega-Lite');
export const vegaExtension = (): MarkdownExtension => createVegaExtension(vegaManifest, 'Vega');
