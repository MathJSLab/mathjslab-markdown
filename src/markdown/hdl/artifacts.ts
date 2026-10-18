import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';

export type HDLArtifact = Readonly<{ filename: string; mediaType: string; text: string }>;

/** User-triggered local exports; no network or automatic downloads. */
export const createHDLExports = (container: Element, context: MarkdownDocumentContext, items: readonly { label: string; artifact: () => HDLArtifact | undefined }[]): (() => void) => {
  const toolbar = container.ownerDocument.createElement('div');
  toolbar.className = 'hdl-exports';
  const controller = new AbortController();
  const removers: (() => void)[] = [];
  const urls = new Map<string, ReturnType<typeof setTimeout>>();
  const revoke = (url: string): void => {
    const timer = urls.get(url);
    if (timer !== undefined) clearTimeout(timer);
    urls.delete(url);
    if (context.resources) context.resources.revokeObjectURL(url);
    else URL.revokeObjectURL(url);
  };
  const dispose = (): void => {
    if (controller.signal.aborted) return;
    controller.abort();
    context.signal?.removeEventListener('abort', dispose);
    for (const remove of removers) remove();
    for (const url of urls.keys()) revoke(url);
    toolbar.remove();
  };
  for (const item of items) {
    const button = container.ownerDocument.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.dataset.hdlExport = item.label.split(' ').at(-1)!.toLowerCase();
    const click = (): void => {
      if (button.disabled || controller.signal.aborted || context.signal?.aborted) return;
      try {
        const artifact = item.artifact();
        if (!artifact) return;
        if (new TextEncoder().encode(artifact.text).byteLength > 4 * 1024 * 1024) throw new Error('HDL export exceeds 4 MiB');
        if (context.onHDLExport) {
          context.onHDLExport(artifact);
          return;
        }
        const blob = new Blob([artifact.text], { type: artifact.mediaType });
        const url = context.resources ? context.resources.createObjectURL(blob) : URL.createObjectURL(blob);
        urls.set(
          url,
          setTimeout(() => revoke(url), 1000),
        );
        const anchor = container.ownerDocument.createElement('a');
        anchor.href = url;
        anchor.download = artifact.filename;
        anchor.hidden = true;
        container.ownerDocument.body.append(anchor);
        try {
          anchor.click();
        } finally {
          anchor.remove();
        }
      } catch (error) {
        context.onDiagnostic?.({ extension: 'hdl', code: 'hdl-export-error', category: 'extension', severity: 'warning', message: error instanceof Error ? error.message : String(error) });
      }
    };
    button.addEventListener('click', click);
    removers.push(() => button.removeEventListener('click', click));
    toolbar.append(button);
  }
  container.append(toolbar);
  context.signal?.addEventListener('abort', dispose, { once: true });
  if (context.signal?.aborted) dispose();
  return dispose;
};

/** Standalone graphics retain drawing dimensions rather than Markdown layout CSS. */
export const serializeHDLSVG = (svg: Element): string => {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  for (const property of ['width', 'height', 'max-width', 'max-height', 'object-fit']) copy.style.removeProperty(property);
  const box = copy.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number);
  if (box?.length === 4 && box.every(Number.isFinite) && box[2]! > 0 && box[3]! > 0) {
    copy.setAttribute('width', String(box[2]));
    copy.setAttribute('height', String(box[3]));
  }
  return new (svg.ownerDocument.defaultView?.XMLSerializer ?? XMLSerializer)().serializeToString(copy);
};
