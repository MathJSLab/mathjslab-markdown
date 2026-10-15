import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, observeElementResize, renderExtensionError, waitForElementLayout } from '../../extensionUtils.js';
import { isMarkdownNodeWithin } from '../../lifecycle.js';
import { geometryManifest } from './manifest.js';
import { markdownDiagnosticCodes } from '../../diagnostics.js';
import { validateGeometrySpec } from './spec.js';

type Board = import('jsxgraph').Board;
type Api = typeof import('jsxgraph');
type Entry = { board: Board; api: Api; disconnect: () => void };
let sequence = 0;

export const geometryExtension = (): MarkdownExtension => {
  const boards = new Map<Element, Entry>();
  let loading: Promise<{ api: Api; parse: (source: string) => unknown }> | undefined;
  const load = () =>
    (loading ??= Promise.all([import(/* webpackChunkName: "markdown-geometry" */ 'jsxgraph'), import(/* webpackChunkName: "markdown-geometry" */ 'json5')])
      .then(([{ default: api }, { default: json5 }]) => ({ api, parse: json5.parse }))
      .catch((error: unknown) => {
        loading = undefined;
        throw error;
      }));
  const dispose = (container: Element): void => {
    const entry = boards.get(container);
    boards.delete(container);
    try {
      entry?.disconnect();
    } finally {
      try {
        if (entry) entry.api.JSXGraph.freeBoard(entry.board);
      } finally {
        container.replaceChildren();
      }
    }
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    let board: Board | undefined;
    let api: Api | undefined;
    let viewport: HTMLDivElement | undefined;
    let disconnect = (): void => undefined;
    try {
      assertSourceSize(source, context);
      if (context.signal?.aborted) return;
      const runtime = await load();
      api = runtime.api;
      const spec = validateGeometrySpec(runtime.parse(source));
      if (context.signal?.aborted) return;
      dispose(container);
      viewport = container.ownerDocument.createElement('div');
      viewport.className = 'geometry-viewport';
      viewport.id = `markdown-geometry-${++sequence}`;
      viewport.tabIndex = 0;
      const dark = context.theme === 'dark';
      const foreground = dark ? '#e5e7eb' : '#1f2937';
      viewport.style.background = dark ? '#151a23' : '#fff';
      viewport.style.color = foreground;
      if (context.height !== undefined && Number.isFinite(context.height) && context.height > 0) viewport.style.height = `${context.height}px`;
      container.append(viewport);
      await waitForElementLayout(viewport, context);
      if (context.signal?.aborted) {
        container.replaceChildren();
        return;
      }
      // JSXGraph's declarations omit per-element defaults such as `text`.
      const options = {
        boundingbox: (spec.boundingBox ?? [-5, 5, 5, -5]) as [number, number, number, number],
        keepaspectratio: spec.keepAspectRatio ?? true,
        axis: spec.axis ?? false,
        grid: spec.grid ?? false,
        renderer: 'svg' as const,
        showCopyright: false,
        showNavigation: false,
        showInfobox: false,
        resize: { enabled: false, throttle: 200 },
        title: spec.title ?? 'Interactive geometry',
        description: 'Drag free points or use keyboard navigation to explore this construction.',
        text: { display: 'internal', parse: false, useMathJax: false, useKatex: false, strokeColor: foreground },
        defaultAxes: { x: { strokeColor: foreground }, y: { strokeColor: foreground } },
      };
      board = api.JSXGraph.initBoard(viewport, options);
      const bounds = viewport.getBoundingClientRect();
      board.resizeContainer(bounds.width, bounds.height, false, false);
      const objects = new Map<string, unknown>();
      board.suspendUpdate();
      // The validated parents are numbers or local references, never expression strings.
      const create = board.create.bind(board) as (type: string, parents: unknown[], attributes: object) => unknown;
      for (const element of spec.elements) {
        const parents = element.parents.map((parent) => (typeof parent === 'string' ? objects.get(parent) : parent));
        objects.set(
          element.id,
          create(element.type, parents, {
            strokeColor: foreground,
            highlightStrokeColor: dark ? '#93c5fd' : '#2563eb',
            fillColor: element.type === 'point' || element.type === 'glider' ? '#2563eb' : 'none',
            fillOpacity: 0.2,
            withLabel: ['point', 'midpoint', 'circumcenter', 'intersection', 'glider'].includes(element.type),
            ...element.attributes,
            id: `${viewport.id}-${element.id}`,
            name: element.attributes?.name ?? element.id,
            showInfobox: false,
            label: { display: 'internal', parse: false, useMathJax: false, useKatex: false, strokeColor: foreground },
          }),
        );
      }
      board.unsuspendUpdate();
      const activeBoard = board;
      disconnect = observeElementResize(container, context, (width, height) => {
        if (context.signal?.aborted || width <= 0 || height <= 0) return;
        try {
          activeBoard.resizeContainer(width, height, false, false);
          activeBoard.update();
        } catch (cause) {
          context.onDiagnostic?.({
            extension: geometryManifest.name,
            language: 'geometry',
            code: markdownDiagnosticCodes.geometryResizeError,
            category: 'extension',
            severity: 'warning',
            ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
            message: cause instanceof Error ? cause.message : String(cause),
            cause,
          });
        }
      });
      if (context.signal?.aborted) {
        disconnect();
        disconnect = () => undefined;
        api.JSXGraph.freeBoard(board);
        board = undefined;
        container.replaceChildren();
        return;
      }
      const disconnectResize = disconnect;
      const abort = (): void => dispose(container);
      context.signal?.addEventListener('abort', abort, { once: true });
      boards.set(container, {
        board,
        api,
        disconnect: () => {
          disconnectResize();
          context.signal?.removeEventListener('abort', abort);
        },
      });
      board = undefined;
      disconnect = () => undefined;
    } catch (error) {
      try {
        disconnect();
      } catch {
        /* Preserve the render error while continuing cleanup. */
      }
      try {
        // initBoard can register its board before an initialization error.
        board ??= viewport && api ? Object.values(api.boards as Record<string, Board>).find((candidate) => candidate.containerObj === viewport) : undefined;
        if (board && api) api.JSXGraph.freeBoard(board);
      } catch {
        /* Preserve the original diagnostic. */
      }
      if (context.signal?.aborted) {
        container.replaceChildren();
        return;
      }
      renderExtensionError(container, 'Geometry', 'geometry', source, error, context);
    }
  };
  return {
    name: geometryManifest.name,
    manifest: geometryManifest,
    fences: [{ ...geometryManifest.fences[0], render, dispose }],
    disposeContainer(container) {
      for (const element of Array.from(boards.keys())) if (isMarkdownNodeWithin(container, element)) dispose(element);
    },
    dispose() {
      for (const container of Array.from(boards.keys())) dispose(container);
      loading = undefined;
    },
  };
};
