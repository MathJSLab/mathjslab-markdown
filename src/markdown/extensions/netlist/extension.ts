import { createHDLExports, serializeHDLSVG } from '../../hdl/artifacts.js';
import type { MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils.js';
import { isMarkdownNodeWithin } from '../../lifecycle.js';
import { netlistManifest } from './manifest.js';
import { validateNetlist } from './spec.js';

let sequence = 0;
export const netlistExtension = (): MarkdownExtension => {
  const rendered = new Set<Element>();
  const exportCleanup = new Map<Element, () => void>();
  const clear = (container: Element): void => {
    exportCleanup.get(container)?.();
    exportCleanup.delete(container);
    rendered.delete(container);
    container.replaceChildren();
  };
  return {
    name: netlistManifest.name,
    manifest: netlistManifest,
    fences: [
      {
        ...netlistManifest.fences[0],
        dispose: clear,
        async render(container, source, context) {
          try {
            assertSourceSize(source, context);
            if (new TextEncoder().encode(source).byteLength > 512 * 1024) throw new Error('Netlist exceeds 512 KiB');
            if (context.signal?.aborted) return;
            const { top, netlist } = validateNetlist(JSON.parse(source));
            const { renderNetlist } = await import('./runtime.js');
            const markup = await renderNetlist(netlist, context.signal);
            if (context.signal?.aborted) return;
            const template = document.createElement('template');
            template.innerHTML = markup;
            const svg = template.content.querySelector('svg');
            if (!svg) throw new Error('Invalid netlist SVG');
            const prefix = `markdown-netlist-${++sequence}-`;
            const ids = new Map<string, string>();
            svg.querySelectorAll('[id]').forEach((node) => {
              const original = node.id;
              const next = prefix + ids.size;
              ids.set(original, next);
              node.id = next;
            });
            svg.id = prefix + 'root';
            svg.querySelectorAll('*').forEach((node) => {
              for (const attribute of [...node.attributes]) {
                if (['href', 'xlink:href'].includes(attribute.name) && attribute.value.startsWith('#')) {
                  const id = ids.get(attribute.value.slice(1));
                  if (id) node.setAttribute(attribute.name, '#' + id);
                  else node.removeAttribute(attribute.name);
                }
                if (/url\s*\(/i.test(attribute.value))
                  node.setAttribute(
                    attribute.name,
                    attribute.value.replace(/url\(\s*#([^)]*)\)/g, (_match, id: string) => `url(#${ids.get(id) ?? 'missing'})`),
                  );
              }
            });
            // The fixed skin is bundled; no author-defined CSS or SVG is accepted.
            svg.querySelectorAll('style').forEach((style) => {
              style.textContent = style.textContent!.replace(
                /([^{}]+)\{/g,
                (_match, selectors: string) =>
                  selectors
                    .split(',')
                    .map((selector) => (selector.trim() === 'svg' ? `#${svg.id}` : `#${svg.id} ${selector.trim()}`))
                    .join(',') + '{',
              );
            });
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', `Netlist schematic: ${top}`);
            // A white surface preserves the digital skin's black text in dark hosts.
            svg.setAttribute('style', 'background:white');
            const sanitized = await sanitizeSVG(template.innerHTML);
            if (context.signal?.aborted) return;
            exportCleanup.get(container)?.();
            container.innerHTML = sanitized;
            const word = ['pt', 'es'].includes(context.locale?.slice(0, 2) ?? '') ? 'Exportar' : 'Export';
            exportCleanup.set(
              container,
              createHDLExports(container, context, [
                { label: word + ' JSON', artifact: () => ({ filename: 'netlist.json', mediaType: 'application/json;charset=utf-8', text: source }) },
                {
                  label: word + ' SVG',
                  artifact: () => {
                    const current = container.querySelector('svg');
                    return current ? { filename: 'netlist.svg', mediaType: 'image/svg+xml', text: serializeHDLSVG(current) } : undefined;
                  },
                },
              ]),
            );
            rendered.add(container);
          } catch (error) {
            if (!context.signal?.aborted) renderExtensionError(container, 'Netlist', 'netlist', source, error, context);
          }
        },
      },
    ],
    disposeContainer(container) {
      for (const element of rendered) if (isMarkdownNodeWithin(container, element)) clear(element);
    },
    dispose() {
      for (const element of rendered) clear(element);
      rendered.clear();
    },
  };
};
