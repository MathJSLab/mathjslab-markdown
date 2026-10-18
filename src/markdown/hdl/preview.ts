import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import { vcdExtension } from '../extensions/vcd/extension.js';
import { parseVCD } from '../extensions/vcd/parser.js';

/** Coalesced visual previews; incomplete VCD headers wait for later chunks. */
export const createHDLPreview = (container: Element, context: MarkdownDocumentContext) => {
  const renderer = vcdExtension({ allowExport: false });
  const renderContext = context.renderSize?.width && context.renderSize.width !== 'auto' ? { ...context, renderSize: { ...context.renderSize, width: '100%' as const } } : context;
  let source = '',
    closed = false,
    timer: ReturnType<typeof setTimeout> | undefined;
  let pending = Promise.resolve();
  let drawing = false;
  const capture = () => {
    const endField = container.querySelectorAll<HTMLInputElement>('input[type=number]')[1];
    return Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select'), (field) => ({
      key: field.tagName + ':' + field.type + ':' + field.getAttribute('aria-label'),
      value: field.value,
      checked: field.tagName === 'INPUT' ? (field as HTMLInputElement).checked : false,
      autoEnd: field === endField && field.value === field.max,
    }));
  };
  let saved: ReturnType<typeof capture> = [];
  let inFlightView: ReturnType<typeof capture> | undefined;
  const restore = (target: Element, previous: ReturnType<typeof capture>): void => {
    const EventType = target.ownerDocument.defaultView?.Event ?? Event;
    const changedChecks: HTMLInputElement[] = [];
    let changed = false;
    for (const field of target.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select')) {
      const old = previous.find((item) => item.key === field.tagName + ':' + field.type + ':' + field.getAttribute('aria-label'));
      if (!old) continue;
      if (field.tagName === 'INPUT' && (field as HTMLInputElement).type === 'checkbox') {
        if ((field as HTMLInputElement).checked !== old.checked) {
          (field as HTMLInputElement).checked = old.checked;
          changedChecks.push(field as HTMLInputElement);
        }
      } else if (!old.autoEnd && field.value !== old.value) {
        field.value = old.value;
        changed = true;
      }
    }
    for (const field of changedChecks) field.dispatchEvent(new EventType('change'));
    if (changed) {
      target.querySelector('input[type=search]')?.dispatchEvent(new EventType('input'));
      target.querySelector('input[type=number]')?.dispatchEvent(new EventType('input'));
    }
  };
  const draw = (): void => {
    timer = undefined;
    if (drawing) return;
    drawing = true;
    const raw = source;
    const snapshot = raw.slice(0, raw.lastIndexOf('\n') + 1);
    pending = pending
      .then(async () => {
        if (closed || context.signal?.aborted) return;
        try {
          parseVCD(snapshot);
        } catch {
          return;
        }
        const previous = capture();
        inFlightView = previous;
        await renderer.fences![0]!.render(container, snapshot, renderContext);
        if (closed || context.signal?.aborted) return;
        restore(container, previous);
      })
      .finally(() => {
        drawing = false;
        inFlightView = undefined;
        if (!closed && !context.signal?.aborted && source !== raw) timer ??= setTimeout(draw, 50);
      });
    void pending.catch(() => undefined);
  };
  return {
    restore: (target: Element): void => restore(target, saved),
    update(value: string): void {
      if (closed || context.signal?.aborted) return;
      source = value;
      timer ??= setTimeout(draw, 50);
    },
    async dispose(): Promise<void> {
      if (!closed) saved = inFlightView?.length ? inFlightView : capture();
      closed = true;
      clearTimeout(timer);
      try {
        await pending;
      } finally {
        await renderer.dispose?.();
      }
    },
  };
};
