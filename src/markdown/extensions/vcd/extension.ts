import { createHDLExports, serializeHDLSVG } from '../../hdl/artifacts.js';
import { exportVCDCSV } from './export.js';
import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError } from '../../extensionUtils.js';
import { finishRenderSize } from '../../renderSizing.js';
import { isMarkdownNodeWithin } from '../../lifecycle.js';
import { parseVCD, vcdValueAt } from './parser.js';
import { vcdManifest } from './manifest.js';

export const vcdExtension = (options: { allowExport?: boolean } = {}): MarkdownExtension => {
  const mounted = new Map<Element, AbortController>();
  const clear = (container: Element): void => {
    mounted.get(container)?.abort();
    mounted.delete(container);
    container.replaceChildren();
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    try {
      assertSourceSize(source, context);
      if (context.signal?.aborted) return;
      const model = parseVCD(source);
      clear(container);
      const controller = new AbortController();
      mounted.set(container, controller);
      const abort = (): void => controller.abort();
      context.signal?.addEventListener('abort', abort, { once: true });
      controller.signal.addEventListener('abort', () => context.signal?.removeEventListener('abort', abort), { once: true });
      const locale = context.locale?.slice(0, 2);
      const words =
        locale === 'pt'
          ? [
              'Início',
              'Fim',
              'Cursor',
              'Base',
              'Restaurar',
              'Sinais',
              'Valor',
              'Janela inválida ou densa demais; reduza a janela ou selecione menos sinais.',
              'Tempo em ticks',
              'Registro sem duração; valores no tick 0.',
            ]
          : locale === 'es'
            ? [
                'Inicio',
                'Fin',
                'Cursor',
                'Base',
                'Restaurar',
                'Señales',
                'Valor',
                'Ventana inválida o demasiado densa; reduzca la ventana o seleccione menos señales.',
                'Tiempo en ticks',
                'Registro sin duración; valores en el tick 0.',
              ]
            : [
                'Start',
                'End',
                'Cursor',
                'Radix',
                'Reset',
                'Signals',
                'Value',
                'Invalid or dense window; narrow the window or select fewer signals.',
                'Time in ticks',
                'Zero-duration recording; values at tick 0.',
              ];
      const controls = document.createElement('div');
      controls.className = 'vcd-controls';
      const selection = document.createElement('fieldset');
      selection.className = 'vcd-signals';
      const legend = document.createElement('legend');
      legend.textContent = words[5]!;
      selection.append(legend);
      const graphic = document.createElement('div');
      graphic.className = 'vcd-graphic';
      const values = document.createElement('table');
      values.className = 'vcd-values';
      const summary = document.createElement('p');
      summary.textContent = `${words[8]} (${model.timescale.magnitude} ${model.timescale.unit}); 0/1/x/z`;
      container.append(summary, controls, selection, graphic, values);
      const numeric = (name: string, initial: number): HTMLInputElement => {
        const label = document.createElement('label');
        label.textContent = name + ' ';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = String(model.endTime);
        input.step = '1';
        input.value = String(initial);
        input.setAttribute('aria-label', name);
        label.append(input);
        controls.append(label);
        return input;
      };
      const start = numeric(words[0]!, 0);
      const end = numeric(words[1]!, model.endTime);
      const cursor = numeric(words[2]!, 0);
      const cursorB = numeric(words[2]! + ' B', 0);
      const inspection =
        locale === 'pt'
          ? ['Buscar sinais', 'Sinal de navegação', 'Transição anterior', 'Próxima transição', 'Exportar']
          : locale === 'es'
            ? ['Buscar señales', 'Señal de navegación', 'Transición anterior', 'Siguiente transición', 'Exportar']
            : ['Find signals', 'Navigation signal', 'Previous transition', 'Next transition', 'Export'];
      const search = document.createElement('input');
      search.type = 'search';
      search.setAttribute('aria-label', inspection[0]!);
      search.placeholder = inspection[0]!;
      selection.append(search);
      const focusLabel = document.createElement('label');
      focusLabel.textContent = inspection[1]! + ' ';
      const focus = document.createElement('select');
      focus.setAttribute('aria-label', inspection[1]!);
      for (const signal of model.signals) {
        const option = document.createElement('option');
        option.value = signal.name;
        option.textContent = signal.name;
        focus.append(option);
      }
      focusLabel.append(focus);
      controls.append(focusLabel);
      const navigation = inspection.slice(2, 4).map((label, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.vcdTransition = index ? 'next' : 'previous';
        controls.append(button);
        return button;
      });
      const delta = document.createElement('p');
      delta.className = 'vcd-measurement';
      delta.setAttribute('role', 'status');
      container.append(delta);
      const radixLabel = document.createElement('label');
      radixLabel.textContent = words[3]! + ' ';
      const radix = document.createElement('select');
      radix.setAttribute('aria-label', words[3]!);
      for (const text of ['hex', 'binary', 'unsigned', 'signed']) {
        const option = document.createElement('option');
        option.value = text;
        option.textContent = text;
        radix.append(option);
      }
      radixLabel.append(radix);
      controls.append(radixLabel);
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.textContent = words[4]!;
      controls.append(reset);
      controls.append(focusLabel, ...navigation);
      const chosen = new Set(model.signals.slice(0, 16));
      const format = (bits: string): string => {
        if (!/^[01]+$/.test(bits)) return bits;
        const value = BigInt('0b' + bits);
        if (radix.value === 'unsigned') return String(value);
        if (radix.value === 'signed') return String(bits[0] === '1' ? value - (1n << BigInt(bits.length)) : value);
        return radix.value === 'hex' && bits.length > 1
          ? '0x' +
              value
                .toString(16)
                .toUpperCase()
                .padStart(Math.ceil(bits.length / 4), '0')
          : bits;
      };
      const node = (tag: string, attributes: Record<string, string | number> = {}, text?: string): SVGElement => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
        if (text !== undefined) element.textContent = text;
        return element;
      };
      const redraw = (): void => {
        if (controller.signal.aborted || context.signal?.aborted) return;
        const a = start.valueAsNumber,
          b = end.valueAsNumber,
          c = cursor.valueAsNumber;
        graphic.replaceChildren();
        const exportSVG = container.querySelector<HTMLButtonElement>('[data-hdl-export=svg]');
        if (exportSVG) exportSVG.disabled = true;
        values.replaceChildren();
        delta.textContent = '';
        for (const button of navigation) button.disabled = true;
        const selected = model.signals.filter((signal) => chosen.has(signal));
        const d = cursorB.valueAsNumber;
        const valid =
          [a, b, c, d].every((value) => Number.isSafeInteger(value) && value >= 0 && value <= model.endTime) &&
          (model.endTime === 0 ? a === 0 && b === 0 : a < b) &&
          c >= a &&
          c <= b &&
          d >= a &&
          d <= b &&
          selected.length <= 32;
        const segments = selected.reduce((sum, signal) => sum + 1 + signal.changes.filter((change) => change.time > a && change.time < b).length, 0);
        if (!valid || segments > 4096) {
          const message = document.createElement('p');
          message.setAttribute('role', 'status');
          message.textContent = words[7]!;
          graphic.append(message);
          return;
        }
        const distance = BigInt(d) - BigInt(c);
        delta.textContent = `Δ: ${distance} ticks = ${distance * BigInt(model.timescale.magnitude)} ${model.timescale.unit}`;
        const focused = model.signals.find((signal) => signal.name === focus.value);
        const transitions =
          focused?.changes.filter(
            (change, index) => change.time >= a && change.time <= b && (index === 0 ? change.value !== 'x'.repeat(focused.width) : change.value !== focused.changes[index - 1]!.value),
          ) ?? [];
        navigation[0]!.disabled = !focused || !chosen.has(focused) || !transitions.some((change) => change.time < c);
        navigation[1]!.disabled = !focused || !chosen.has(focused) || !transitions.some((change) => change.time > c);
        const header = values.insertRow();
        for (const text of [words[5]!, `${words[6]} @ ${c}`, `${words[6]} B @ ${d}`]) {
          const th = document.createElement('th');
          th.textContent = text;
          header.append(th);
        }
        for (const signal of selected) {
          const row = values.insertRow();
          row.insertCell().textContent = signal.name;
          row.insertCell().textContent = format(vcdValueAt(signal, c));
          row.insertCell().textContent = format(vcdValueAt(signal, d));
        }
        if (model.endTime === 0) {
          const message = document.createElement('p');
          message.textContent = words[9]!;
          graphic.append(message);
          return;
        }
        const dark = context.theme === 'dark';
        const ink = dark ? '#eee' : '#222';
        const background = dark ? '#222' : '#fff';
        const height = 46 + selected.length * 48;
        const svg = node('svg', {
          viewBox: `0 0 800 ${height}`,
          width: 800,
          height,
          role: 'img',
          'aria-label': `VCD: ${a}–${b} ticks (${model.timescale.magnitude} ${model.timescale.unit})`,
        });
        svg.append(node('rect', { width: 800, height, fill: background }));
        const x = (time: number): number => 170 + ((time - a) / (b - a)) * 610;
        const ticks = new Set(Array.from({ length: 6 }, (_, i) => a + Math.round(((b - a) * i) / 5)));
        for (const tick of ticks) {
          svg.append(
            node('line', { x1: x(tick), x2: x(tick), y1: 20, y2: height - 20, stroke: dark ? '#555' : '#ddd' }),
            node('text', { x: x(tick), y: height - 4, 'text-anchor': 'middle', fill: ink, 'font-size': 10 }, String(tick)),
          );
        }
        selected.forEach((signal, row) => {
          const y = 38 + row * 48;
          const name = node('text', { x: 4, y: y + 4, fill: ink, 'font-size': 12 }, signal.name.length > 22 ? signal.name.slice(0, 19) + '…' : signal.name);
          name.append(node('title', {}, signal.name));
          svg.append(name);
          const changes = [{ time: a, value: vcdValueAt(signal, a) }, ...signal.changes.filter((change) => change.time > a && change.time < b)];
          let previousY: number | undefined;
          changes.forEach((change, i) => {
            const left = x(change.time),
              right = x(changes[i + 1]?.time ?? b);
            const unknown = /[xz]/.test(change.value);
            const color = change.value.includes('x') ? (dark ? '#dfb6ff' : '#7630a3') : change.value.includes('z') ? (dark ? '#b5c7d6' : '#506575') : ink;
            if (signal.width === 1) {
              const level = y + (change.value === '1' ? -10 : change.value === '0' ? 10 : 0);
              if (previousY !== undefined) svg.append(node('line', { x1: left, x2: left, y1: previousY, y2: level, stroke: ink }));
              svg.append(
                node('line', {
                  x1: left,
                  x2: right,
                  y1: level,
                  y2: level,
                  stroke: color,
                  'stroke-width': 2,
                  ...(unknown ? { 'stroke-dasharray': change.value === 'x' ? '5 3' : '1 3' } : {}),
                }),
              );
              previousY = level;
              if (unknown && right - left > 12) svg.append(node('text', { x: (left + right) / 2, y: y - 5, fill: color, 'font-size': 10, 'text-anchor': 'middle' }, change.value));
            } else {
              const shape = node('path', {
                d: `M ${left} ${y} L ${left + Math.min(4, (right - left) / 2)} ${y - 12} L ${right - Math.min(4, (right - left) / 2)} ${y - 12} L ${right} ${y} L ${right - Math.min(4, (right - left) / 2)} ${y + 12} L ${left + Math.min(4, (right - left) / 2)} ${y + 12} Z`,
                fill: 'none',
                stroke: color,
              });
              shape.append(node('title', {}, format(change.value)));
              svg.append(shape);
              const text = format(change.value);
              if (right - left >= text.length * 7 + 8) svg.append(node('text', { x: (left + right) / 2, y: y + 4, fill: color, 'font-size': 11, 'text-anchor': 'middle' }, text));
            }
          });
        });
        svg.append(node('line', { x1: x(c), x2: x(c), y1: 14, y2: height - 20, stroke: dark ? '#ffd166' : '#ac6500', 'stroke-width': 2, 'data-vcd-cursor': c }));
        svg.append(node('line', { x1: x(d), x2: x(d), y1: 14, y2: height - 20, stroke: dark ? '#79c4ff' : '#17639c', 'stroke-dasharray': '4 3', 'data-vcd-cursor-b': d }));
        graphic.append(svg);
        if (exportSVG) exportSVG.disabled = false;
        finishRenderSize(container, context.renderSize);
      };
      const listeners: (() => void)[] = [];
      controller.signal.addEventListener(
        'abort',
        () => {
          for (const remove of listeners) remove();
          listeners.length = 0;
        },
        { once: true },
      );
      const listen = (element: Element, event: string, callback: () => void): void => {
        element.addEventListener(event, callback);
        listeners.push(() => element.removeEventListener(event, callback));
      };
      const signalLabels: HTMLLabelElement[] = [];
      for (const signal of model.signals) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = chosen.has(signal);
        checkbox.setAttribute('aria-label', signal.name);
        label.append(checkbox, document.createTextNode(signal.name));
        selection.append(label);
        signalLabels.push(label);
        listen(checkbox, 'change', () => {
          if (checkbox.checked) chosen.add(signal);
          else chosen.delete(signal);
          redraw();
        });
      }
      listen(search, 'input', () => {
        const needle = search.value.toLowerCase();
        for (const label of signalLabels) label.hidden = !label.textContent!.toLowerCase().includes(needle);
      });
      listen(focus, 'change', redraw);
      navigation.forEach((button, index) =>
        listen(button, 'click', () => {
          const signal = model.signals.find((signal) => signal.name === focus.value);
          if (!signal || !chosen.has(signal)) return;
          const changes = signal.changes.filter(
            (change, i) =>
              change.time >= start.valueAsNumber && change.time <= end.valueAsNumber && (i === 0 ? change.value !== 'x'.repeat(signal.width) : change.value !== signal.changes[i - 1]!.value),
          );
          const target = index ? changes.find((change) => change.time > cursor.valueAsNumber) : [...changes].reverse().find((change) => change.time < cursor.valueAsNumber);
          if (target) cursor.value = String(target.time);
          redraw();
        }),
      );
      for (const input of [start, end])
        listen(input, 'change', () => {
          const a = start.valueAsNumber,
            b = end.valueAsNumber;
          if (Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b <= model.endTime && a <= b)
            for (const field of [cursor, cursorB]) field.value = String(Math.min(b, Math.max(a, Number.isSafeInteger(field.valueAsNumber) ? field.valueAsNumber : a)));
          redraw();
        });
      listen(cursor, 'change', redraw);
      listen(cursorB, 'change', redraw);
      listen(start, 'input', redraw);
      listen(radix, 'change', redraw);
      listen(reset, 'click', () => {
        start.value = '0';
        end.value = String(model.endTime);
        cursor.value = '0';
        cursorB.value = '0';
        redraw();
      });
      redraw();
      if (options.allowExport !== false) {
        const disposeExports = createHDLExports(container, { ...context, signal: controller.signal }, [
          { label: inspection[4]! + ' VCD', artifact: () => ({ filename: 'simulation.vcd', mediaType: 'text/plain;charset=utf-8', text: source }) },
          {
            label: inspection[4]! + ' CSV',
            artifact: () => ({
              filename: 'signals.csv',
              mediaType: 'text/csv;charset=utf-8',
              text: exportVCDCSV(source, { start: start.valueAsNumber, end: end.valueAsNumber, signals: model.signals.filter((signal) => chosen.has(signal)).map((signal) => signal.name) }),
            }),
          },
          {
            label: inspection[4]! + ' SVG',
            artifact: () => {
              const svg = graphic.querySelector('svg');
              return svg ? { filename: 'waveform.svg', mediaType: 'image/svg+xml', text: serializeHDLSVG(svg) } : undefined;
            },
          },
        ]);
        listeners.push(disposeExports);
        container.querySelector<HTMLButtonElement>('[data-hdl-export=svg]')!.disabled = !graphic.querySelector('svg');
      }
      if (model.sameTimeChanges)
        context.onDiagnostic?.({
          extension: 'vcd',
          code: 'vcd-same-time-changes',
          category: 'extension',
          severity: 'warning',
          message: `${model.sameTimeChanges} changes at identical timestamps use the last recorded value; zero-duration glitches are not drawn`,
        });
    } catch (error) {
      clear(container);
      if (!context.signal?.aborted) renderExtensionError(container, 'VCD', 'vcd', source, error, context);
    }
  };
  return {
    name: vcdManifest.name,
    manifest: vcdManifest,
    fences: [{ ...vcdManifest.fences[0], render, dispose: clear }],
    disposeContainer(container) {
      for (const element of mounted.keys()) if (isMarkdownNodeWithin(container, element)) clear(element);
    },
    dispose() {
      for (const element of [...mounted.keys()]) clear(element);
    },
  };
};
