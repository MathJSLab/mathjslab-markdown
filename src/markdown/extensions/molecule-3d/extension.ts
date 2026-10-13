import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, observeElementResize, renderExtensionError, waitForElementLayout } from '../../extensionUtils.js';
import { molecule3DManifest } from './manifest.js';
import type { GLViewer } from '3dmol';

type Entry = { viewer: GLViewer; disconnect: () => void };

export const molecule3DExtension = (): MarkdownExtension => {
  const viewers = new Map<Element, Entry>();
  const dispose = (container: Element): void => {
    const entry = viewers.get(container);
    entry?.disconnect();
    entry?.viewer.spin(false);
    entry?.viewer.removeAllModels();
    entry?.viewer.clear();
    viewers.delete(container);
    container.replaceChildren();
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    const language = container.getAttribute('data-markdown-language') ?? 'pdb';
    let viewer: GLViewer | undefined;
    let disconnect = (): void => undefined;
    try {
      assertSourceSize(source, context);
      const mol = await import(/* webpackChunkName: "markdown-molecule-3d" */ '3dmol');
      if (context.signal?.aborted) return;
      dispose(container);
      const viewport = document.createElement('div');
      viewport.style.position = 'relative';
      viewport.style.width = '100%';
      viewport.style.height = '100%';
      viewport.setAttribute('role', 'application');
      viewport.setAttribute('aria-label', `Interactive ${language.toUpperCase()} molecular structure`);
      container.append(viewport);
      await waitForElementLayout(viewport, context);
      if (context.signal?.aborted) return;
      viewer = mol.createViewer(viewport, {
        backgroundColor: context.theme === 'dark' ? '#111827' : '#ffffff',
      });
      const entry = { viewer, disconnect };
      viewers.set(container, entry);
      viewer.addModel(source, language === 'mmcif' ? 'cif' : language, { keepH: true });
      viewer.setStyle(
        {},
        {
          stick: { colorscheme: 'Jmol' },
          sphere: { scale: 0.28, colorscheme: 'Jmol' },
        },
      );
      if (language === 'pdb' || language === 'cif' || language === 'mmcif') {
        viewer.addStyle({}, { cartoon: { color: 'spectrum' } });
      }
      viewer.zoomTo();
      viewer.render();
      disconnect = observeElementResize(container, context, () => {
        if (!context.signal?.aborted) {
          entry.viewer.resize();
          entry.viewer.render();
        }
      });
      entry.disconnect = disconnect;
      if (context.signal?.aborted) {
        dispose(container);
        return;
      }
      viewer = undefined;
      disconnect = (): void => undefined;
    } catch (error) {
      disconnect();
      if (viewer) {
        viewers.delete(container);
        try {
          viewer.spin(false);
        } catch {
          /* Continue releasing a partially initialized viewer. */
        }
        try {
          viewer.removeAllModels();
        } catch {
          /* Continue releasing a partially initialized viewer. */
        }
        try {
          viewer.clear();
        } catch {
          /* Continue releasing a partially initialized viewer. */
        }
      }
      container.replaceChildren();
      if (!context.signal?.aborted) renderExtensionError(container, '3Dmol', language, source, error, context);
    }
  };
  return {
    name: molecule3DManifest.name,
    manifest: molecule3DManifest,
    fences: molecule3DManifest.fences.map((fence) => ({
      ...fence,
      render,
      dispose,
    })),
    dispose() {
      for (const container of Array.from(viewers.keys())) dispose(container);
    },
  };
};
