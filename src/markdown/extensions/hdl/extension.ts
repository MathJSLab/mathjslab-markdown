import { assertHDLAvailable, hdlSetupMessage } from '../../hdl/availability.js';
import { createHDLExports, serializeHDLSVG } from '../../hdl/artifacts.js';
import { createHDLPreview } from '../../hdl/preview.js';
import { createHDLUpdateReceiver, hdlProgressLabel } from '../../hdl/updates.js';
import { createHDLLogDetails, hdlPresentationLabel, normalizeHDLText } from '../../hdl/presentation.js';
import { ManagedExecutionSession } from '../../execution/session.js';
import { MarkdownExecutionError } from '../../execution/scheduler.js';
import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize } from '../../extensionUtils.js';
import { cleanupAll, isMarkdownNodeWithin } from '../../lifecycle.js';
import { applyRenderSize, finishRenderSize } from '../../renderSizing.js';
import { netlistExtension } from '../netlist/extension.js';
import { waveDromExtension } from '../wavedrom/extension.js';
import { vcdExtension } from '../vcd/extension.js';
import { validateHDLRequest, type HDLExecutor, type HDLExecutionResult, type HDLExecutionSession, type HDLLanguage } from './executor.js';
import { hdlManifest } from './manifest.js';

const bounded = (value: number | undefined, fallback: number, max: number): number => (Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value!))) : fallback);
type Entry = ManagedExecutionSession<HDLExecutionSession>;

export const hdlExtension = (executor?: HDLExecutor): MarkdownExtension => {
  const netlist = netlistExtension();
  const waves = waveDromExtension();
  const simulation = vcdExtension();
  const entries = new Map<Element, Entry>();
  const counts = new WeakMap<object, number>();
  const clearing = new Map<Element, Promise<void>>();
  const exportCleanup = new Map<Element, () => void>();
  const close = (entry: Entry): Promise<void> => entry.dispose();
  const clear = (container: Element): Promise<void> => {
    const previous = clearing.get(container);
    if (previous) return previous;
    exportCleanup.get(container)?.();
    exportCleanup.delete(container);
    const entry = entries.get(container);
    entries.delete(container);
    entry?.controller.abort();
    const operation = cleanupAll([
      () => netlist.disposeContainer?.(container),
      () => waves.disposeContainer?.(container),
      () => simulation.disposeContainer?.(container),
      () => entry?.dispose(),
    ]).finally(() => {
      container.replaceChildren();
      clearing.delete(container);
    });
    clearing.set(container, operation);
    return operation;
  };
  const report = (container: Element, source: string, context: MarkdownDocumentContext, code: string, message: string, category: 'policy' | 'execution'): void => {
    const alert = document.createElement('pre');
    alert.setAttribute('role', 'alert');
    alert.className = 'hdl-result-status';
    alert.dataset.hdlStatus = code === 'hdl-execution-cancelled' ? 'cancelled' : 'error';
    if (alert.dataset.hdlStatus === 'cancelled') alert.setAttribute('role', 'status');
    const label = hdlPresentationLabel(alert.dataset.hdlStatus === 'cancelled' ? 'cancelled' : 'error', context.locale);
    const cleanMessage = normalizeHDLText(message);
    alert.textContent = cleanMessage === label ? label : `${label}: ${cleanMessage}`;
    const fallback = document.createElement('pre');
    fallback.className = 'markdown-extension-fallback';
    fallback.textContent = source;
    container.replaceChildren(alert, fallback);
    context.onDiagnostic?.({ extension: 'hdl', code, category, severity: 'error', message });
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext, language: HDLLanguage): Promise<void> => {
    if (!executor) {
      report(container, source, context, 'hdl-executor-missing', hdlSetupMessage(context, true), 'policy');
      return;
    }
    const policy = context.executionPolicy?.hdl ?? {};
    if (policy.enabled !== true || (context.securityMode !== 'trusted' && !policy.allowInRestrictedMode)) {
      report(container, source, context, 'hdl-execution-disabled', hdlSetupMessage(context, false), 'policy');
      return;
    }
    const key = context.signal ?? context;
    const index = counts.get(key) ?? 0;
    counts.set(key, index + 1);
    if (index >= bounded(policy.maxBlocks, 16, 128)) {
      report(container, source, context, 'hdl-block-limit', 'Document exceeds the HDL block limit', 'policy');
      return;
    }
    try {
      assertSourceSize(source, { ...context, maxSourceBytes: Math.min(context.maxSourceBytes ?? Infinity, bounded(policy.maxSourceBytes, 256 * 1024, 2 * 1024 * 1024)) });
    } catch (error) {
      report(container, source, context, 'hdl-source-limit', String(error), 'policy');
      return;
    }
    const entry = new ManagedExecutionSession<HDLExecutionSession>(context.signal);
    const controller = entry.controller;
    entries.set(container, entry);
    const active = { ...context, signal: controller.signal };
    const progress = document.createElement('div');
    progress.setAttribute('role', 'status');
    progress.className = 'hdl-progress';
    progress.textContent = hdlPresentationLabel('running', context.locale);
    const { details: incrementalDetails, logs: incrementalLogs } = createHDLLogDetails(context.locale);
    const previewNode = document.createElement('div');
    previewNode.className = 'hdl-incremental-vcd vcd-viewer';
    container.replaceChildren(progress, previewNode, incrementalDetails);
    const preview = createHDLPreview(previewNode, active);
    const updates = createHDLUpdateReceiver((update, state) => {
      if (update.type === 'progress') progress.textContent = hdlProgressLabel(update.phase, context.locale);
      if (update.type === 'log') incrementalLogs.textContent = normalizeHDLText(state.logs);
      if (update.type === 'vcd') preview.update(state.vcd);
      context.onHDLUpdate?.(update);
    }, controller.signal);
    const executionContext = { ...context, onHDLUpdate: (update: unknown) => updates.receive(update) };
    try {
      const request = validateHDLRequest(JSON.parse(source), language);
      if (controller.signal.aborted) return;
      const response: HDLExecutionResult = await entry.run(
        executionContext,
        async (active) => {
          await assertHDLAvailable(executor, language, request.operation, active);
          return executor.createSession(active);
        },
        (session, active) => session.execute(request, active),
        {
          timeoutMs: Math.max(1, bounded(policy.timeoutMs, 30_000, 300_000)),
          closeAfter: true,
        },
      );
      updates.finish();
      updates.close();
      await preview.dispose();
      if (controller.signal.aborted) return;
      if (!response || !['success', 'error', 'cancelled'].includes(response.status)) throw new Error('Invalid HDL execution result');
      const encoded = JSON.stringify(response);
      if (new TextEncoder().encode(encoded).byteLength > 512 * 1024) throw new Error('HDL result exceeds 512 KiB');
      let result: HDLExecutionResult = JSON.parse(encoded);
      if (!result || !['success', 'error', 'cancelled'].includes(result.status)) throw new Error('Invalid HDL execution result');
      if (result.logs !== undefined && (typeof result.logs !== 'string' || result.logs.length > 65536)) throw new Error('HDL logs exceed the text limit');
      if (result.diagnostics !== undefined && (!Array.isArray(result.diagnostics) || result.diagnostics.length > 128)) throw new Error('HDL diagnostic limit exceeded');
      for (const d of result.diagnostics ?? []) {
        if (
          !d ||
          !['info', 'warning', 'error'].includes(d.severity) ||
          typeof d.message !== 'string' ||
          d.message.length > 4096 ||
          (d.file !== undefined && (typeof d.file !== 'string' || !request.files.some((file) => file.name === d.file))) ||
          [d.line, d.column].some((value) => value !== undefined && (!Number.isInteger(value) || value <= 0))
        )
          throw new Error('Invalid HDL compiler diagnostic');
        const location = d.file ? `${d.file}${d.line ? ':' + d.line : ''}${d.column ? ':' + d.column : ''}: ` : '';
        context.onDiagnostic?.({ extension: 'hdl', code: 'hdl-compiler-diagnostic', category: 'execution', severity: d.severity, message: location + normalizeHDLText(d.message) });
      }
      result = {
        ...result,
        logs: normalizeHDLText(result.logs ?? updates.snapshot.logs),
        ...(result.diagnostics ? { diagnostics: result.diagnostics.map((diagnostic) => ({ ...diagnostic, message: normalizeHDLText(diagnostic.message) })) } : {}),
      };
      if (result.status !== 'success') {
        report(
          container,
          source,
          context,
          result.status === 'cancelled' ? 'hdl-execution-cancelled' : 'hdl-execution-error',
          hdlPresentationLabel(result.status, context.locale),
          'execution',
        );
      } else {
        progress.className = 'hdl-result-status';
        progress.dataset.hdlStatus = 'success';
        progress.textContent = hdlPresentationLabel('success', context.locale);
        container.replaceChildren(progress);
      }
      const { details, logs } = createHDLLogDetails(context.locale);
      details.open = result.status !== 'success';
      for (const d of result.diagnostics ?? []) {
        const message = document.createElement('pre');
        message.textContent = `${d.severity}: ${d.file ?? ''}${d.line ? ':' + d.line : ''} ${d.message}`;
        message.style.whiteSpace = 'pre-wrap';
        message.style.overflowWrap = 'anywhere';
        details.insertBefore(message, logs);
      }
      logs.textContent = result.logs ?? '';
      if (result.status !== 'success') {
        container.append(details);
        const word = ['pt', 'es'].includes(context.locale?.slice(0, 2) ?? '') ? 'Exportar' : 'Export';
        exportCleanup.set(
          container,
          createHDLExports(container, context, [
            {
              label: word + ' JSON',
              artifact: () => ({
                filename: 'hdl-result.json',
                mediaType: 'application/json;charset=utf-8',
                text: JSON.stringify({ schemaVersion: 1, language, top: request.top, result }, null, 2),
              }),
            },
            ...(result.logs !== undefined ? [{ label: word + ' TXT', artifact: () => ({ filename: 'hdl-log.txt', mediaType: 'text/plain;charset=utf-8', text: result.logs! }) }] : []),
          ]),
        );
        return;
      }
      if (result.vcd !== undefined && (typeof result.vcd !== 'string' || result.waveform !== undefined)) throw new Error('HDL results require either VCD or WaveJSON, not both');
      for (const [data, renderer, className] of [
        [result.waveform, waves, 'wavedrom'],
        [result.netlist, netlist, 'netlist'],
        [result.vcd, simulation, 'vcd'],
      ] as const) {
        if (data === undefined || controller.signal.aborted) continue;
        if (className === 'wavedrom' && (!data || typeof data !== 'object' || !Object.hasOwn(data, 'signal') || Object.hasOwn(data, 'reg') || Object.hasOwn(data, 'assign')))
          throw new Error('HDL waveforms require the WaveDrom signal family');
        const visual = document.createElement('div');
        visual.className = className === 'vcd' ? 'vcd vcd-viewer' : className;
        container.append(visual);
        const size = context.renderSize ? { ...context.renderSize, ...(context.renderSize.width && context.renderSize.width !== 'auto' ? { width: '100%' as const } : {}) } : undefined;
        if (size) applyRenderSize(visual, 'intrinsic', size);
        await renderer.fences![0]!.render(visual, className === 'vcd' ? (data as string) : JSON.stringify(data), size ? { ...context, renderSize: size } : context);
        finishRenderSize(visual, size);
        if (className === 'vcd') preview.restore(visual);
      }
      if (!controller.signal.aborted) {
        container.append(details);
        const word = ['pt', 'es'].includes(context.locale?.slice(0, 2) ?? '') ? 'Exportar' : 'Export';
        exportCleanup.set(
          container,
          createHDLExports(container, context, [
            {
              label: word + ' JSON',
              artifact: () => ({
                filename: 'hdl-result.json',
                mediaType: 'application/json;charset=utf-8',
                text: JSON.stringify({ schemaVersion: 1, language, top: request.top, result }, null, 2),
              }),
            },
            ...(result.logs !== undefined ? [{ label: word + ' TXT', artifact: () => ({ filename: 'hdl-log.txt', mediaType: 'text/plain;charset=utf-8', text: result.logs! }) }] : []),
            ...(result.waveform !== undefined
              ? [
                  {
                    label: word + ' SVG',
                    artifact: () => {
                      const svg = container.querySelector('.netlist svg, .wavedrom svg');
                      return svg ? { filename: 'schematic.svg', mediaType: 'image/svg+xml', text: serializeHDLSVG(svg) } : undefined;
                    },
                  },
                ]
              : []),
            ...(result.netlist !== undefined
              ? [{ label: word + ' Netlist', artifact: () => ({ filename: 'netlist.json', mediaType: 'application/json;charset=utf-8', text: JSON.stringify(result.netlist, null, 2) }) }]
              : []),
          ]),
        );
      }
      if (controller.signal.aborted) {
        await netlist.disposeContainer?.(container);
        await waves.disposeContainer?.(container);
        await simulation.disposeContainer?.(container);
        container.replaceChildren();
      }
    } catch (error) {
      await netlist.disposeContainer?.(container);
      await waves.disposeContainer?.(container);
      await simulation.disposeContainer?.(container);
      const timedOut = error instanceof MarkdownExecutionError && error.code === 'execution-timeout';
      if (timedOut || !controller.signal.aborted)
        report(
          container,
          source,
          context,
          timedOut ? 'hdl-execution-timeout' : error instanceof MarkdownExecutionError ? error.code : 'hdl-execution-error',
          timedOut ? 'HDL execution timed out' : error instanceof Error ? error.message : String(error),
          'execution',
        );
      if ((timedOut || !controller.signal.aborted) && updates.snapshot.logs) {
        const { details, logs } = createHDLLogDetails(context.locale);
        details.open = true;
        logs.textContent = normalizeHDLText(updates.snapshot.logs);
        container.append(details);
      }
    } finally {
      updates.close();
      await preview.dispose();
      try {
        await close(entry);
      } catch (error) {
        context.onDiagnostic?.({ extension: 'hdl', code: 'hdl-disposal-error', category: 'execution', severity: 'warning', message: String(error) });
      }
    }
  };
  return {
    name: hdlManifest.name,
    manifest: hdlManifest,
    fences: hdlManifest.fences.map((fence) => ({
      ...fence,
      render: (container, source, context) => render(container, source, context, fence.language === 'vhdl-run' ? 'vhdl' : 'verilog'),
      dispose: clear,
    })),
    async disposeContainer(container) {
      for (const element of new Set([...entries.keys(), ...clearing.keys()])) if (isMarkdownNodeWithin(container, element)) await clear(element);
    },
    async dispose() {
      for (const element of new Set([...entries.keys(), ...clearing.keys()])) await clear(element);
      await netlist.dispose?.();
      await waves.dispose?.();
      await simulation.dispose?.();
    },
  };
};
