import { assertHDLAvailable, hdlSetupMessage } from '../../hdl/availability.js';
import { createHDLExports } from '../../hdl/artifacts.js';
import { createHDLPreview } from '../../hdl/preview.js';
import { createHDLUpdateReceiver, hdlProgressLabel } from '../../hdl/updates.js';
import { ManagedExecutionSession } from '../../execution/session.js';
import { MarkdownExecutionError } from '../../execution/scheduler.js';
import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError } from '../../extensionUtils.js';
import { cleanupAll, isMarkdownNodeWithin } from '../../lifecycle.js';
import { applyRenderSize, finishRenderSize } from '../../renderSizing.js';
import type { HDLExecutor } from '../hdl/executor.js';
import { parseVCD } from '../vcd/parser.js';
import { vcdExtension } from '../vcd/extension.js';
import { validateInteractiveRequest, type HDLInteractiveSession, type HDLInteractiveResult, type HDLCheckResult } from './executor.js';
import { hdlInteractiveManifest } from './manifest.js';

type Run = ManagedExecutionSession<HDLInteractiveSession>;
type Frame = { dispose: () => Promise<void> };
const limit = (value: number | undefined, fallback: number, ceiling: number): number => (Number.isFinite(value) ? Math.max(0, Math.min(ceiling, Math.floor(value!))) : fallback);
const close = (run: Run): Promise<void> => run.dispose();

export const hdlInteractiveExtension = (executor: Pick<HDLExecutor, 'createInteractiveSession' | 'capabilities'> = {}): MarkdownExtension => {
  const frames = new Map<Element, Frame>();
  const clearing = new Map<Element, Promise<void>>();
  const counts = new WeakMap<object, number>();
  const viewer = vcdExtension();
  const clear = (container: Element): Promise<void> => {
    const previous = clearing.get(container);
    if (previous) return previous;
    const frame = frames.get(container);
    frames.delete(container);
    const operation = Promise.resolve().then(async () => {
      try {
        await cleanupAll([() => frame?.dispose(), () => viewer.disposeContainer?.(container)]);
      } finally {
        container.replaceChildren();
      }
    });
    clearing.set(container, operation);
    const remove = (): void => {
      if (clearing.get(container) === operation) clearing.delete(container);
    };
    void operation.then(remove, remove);
    return operation;
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext, language: 'vhdl' | 'verilog'): Promise<void> => {
    const policy = context.executionPolicy?.['hdl-interactive'] ?? {};
    const diagnostic = (code: string, message: string, category: 'policy' | 'execution' = 'execution', severity: 'warning' | 'error' = 'error'): void =>
      context.onDiagnostic?.({ extension: 'hdl-interactive', code, category, severity, message });
    let policyBlocked = false;
    try {
      if (!executor.createInteractiveSession) {
        policyBlocked = true;
        const message = hdlSetupMessage(context, true);
        diagnostic('hdl-executor-missing', message, 'policy');
        throw new Error(message);
      }
      if (policy.enabled !== true || (context.securityMode !== 'trusted' && !policy.allowInRestrictedMode)) {
        policyBlocked = true;
        diagnostic('hdl-interactive-disabled', hdlSetupMessage(context, false), 'policy');
        throw new Error(hdlSetupMessage(context, false));
      }
      const key = context.signal ?? context;
      const index = counts.get(key) ?? 0;
      counts.set(key, index + 1);
      if (index >= limit(policy.maxBlocks, 8, 64)) throw new Error('Interactive HDL block limit exceeded');
      assertSourceSize(source, { ...context, maxSourceBytes: Math.min(context.maxSourceBytes ?? Infinity, limit(policy.maxSourceBytes, 256 * 1024, 2 * 1024 * 1024)) });
      const request = validateInteractiveRequest(JSON.parse(source), language);
      // Timelines belong to the engine; keep the host request compatible with existing adapters.
      const backendRequest = { ...request };
      delete backendRequest.stimuli;
      delete backendRequest.checks;
      if (!executor.createInteractiveSession) throw new Error('Host executor does not provide interactive sessions');
      if (context.signal?.aborted) return;
      container.replaceChildren();
      const locale = context.locale?.slice(0, 2);
      const text =
        locale === 'pt'
          ? ['Executar', 'Pausar', 'Avançar', 'Reiniciar', 'Pronto', 'Executando', 'Pausado', 'Concluído', 'Erro', 'Tempo', 'Saídas', 'Entradas']
          : locale === 'es'
            ? ['Ejecutar', 'Pausar', 'Avanzar', 'Reiniciar', 'Listo', 'Ejecutando', 'Pausado', 'Finalizado', 'Error', 'Tiempo', 'Salidas', 'Entradas']
            : ['Run', 'Pause', 'Step', 'Reset', 'Ready', 'Running', 'Paused', 'Finished', 'Error', 'Time', 'Outputs', 'Inputs'];
      const controls = document.createElement('div');
      controls.className = 'hdl-interactive-controls';
      const inputs = document.createElement('fieldset');
      inputs.className = 'hdl-interactive-inputs';
      const legend = document.createElement('legend');
      legend.textContent = text[11]!;
      inputs.append(legend);
      const status = document.createElement('p');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      const table = document.createElement('table');
      table.setAttribute('aria-label', text[10]!);
      const logs = document.createElement('pre');
      logs.className = 'hdl-interactive-logs';
      const plot = document.createElement('div');
      plot.className = 'vcd-viewer';
      const checks = document.createElement('table');
      checks.className = 'hdl-checks';
      checks.setAttribute('aria-label', locale === 'pt' ? 'Verificações' : locale === 'es' ? 'Verificaciones' : 'Checks');
      const checkRows = new Map<string, HTMLTableRowElement>();
      const checkResults = new Map<string, HDLCheckResult>();
      const labels =
        locale === 'pt'
          ? ['Pendente', 'Aprovado', 'Falhou', 'Não executado']
          : locale === 'es'
            ? ['Pendiente', 'Correcto', 'Falló', 'No ejecutado']
            : ['Pending', 'Passed', 'Failed', 'Not run'];
      const resetChecks = (): void => {
        checks.replaceChildren();
        const header = checks.insertRow();
        const headings =
          locale === 'pt'
            ? ['ID', 'Tempo', 'Sinal', 'Esperado', 'Obtido', 'Resultado']
            : locale === 'es'
              ? ['ID', 'Tiempo', 'Señal', 'Esperado', 'Obtenido', 'Resultado']
              : ['ID', 'Time', 'Signal', 'Expected', 'Actual', 'Result'];
        for (const heading of headings) {
          const cell = document.createElement('th');
          cell.scope = 'col';
          cell.textContent = heading;
          header.append(cell);
        }
        checkRows.clear();
        checkResults.clear();
        for (const check of request.checks ?? []) {
          const row = checks.insertRow();
          row.dataset.hdlCheck = check.id;
          row.dataset.status = 'pending';
          for (const value of [check.id, `${check.timeNs} ns`, check.signal, check.expected, '—', labels[0]!]) row.insertCell().textContent = value;
          checkRows.set(check.id, row);
          checkResults.set(check.id, { ...check, status: 'pending' });
        }
      };
      resetChecks();
      container.append(controls, inputs, status, table, ...(request.checks?.length ? [checks] : []), logs, plot);
      const buttons = text.slice(0, 4).map((label, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.hdlAction = ['run', 'pause', 'step', 'reset'][index]!;
        controls.append(button);
        return button;
      });
      const fields = new Map<string, HTMLInputElement | HTMLSelectElement>();
      for (const signal of request.inputs) {
        const label = document.createElement('label');
        label.append(document.createTextNode(signal.name + ' '));
        const field = signal.width === 1 ? document.createElement('select') : document.createElement('input');
        if (signal.width !== 1) {
          (field as HTMLInputElement).type = 'text';
          (field as HTMLInputElement).maxLength = signal.width;
        } else {
          for (const value of ['0', '1', 'x', 'z']) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            field.append(option);
          }
        }
        field.setAttribute('aria-label', signal.name);
        field.value = request.stimuli?.find((entry) => entry.timeNs === 0)?.inputs[signal.name] ?? signal.initial;
        label.append(field);
        inputs.append(label);
        fields.set(signal.name, field);
      }
      let run: Run = new ManagedExecutionSession<HDLInteractiveSession>(context.signal);
      let disposed = false,
        playing = false,
        busy = false,
        failed = false,
        finished = false,
        resetting = false;
      let confirmed: HDLInteractiveResult | undefined;
      const history: { startNs: number; endNs: number; inputs: Readonly<Record<string, string>> }[] = [];
      let time = 0,
        steps = 0;
      let scheduled: ReturnType<typeof setTimeout> | undefined;
      const removers: (() => void)[] = [];
      const pendingDisposals = new Set<Promise<void>>();
      const listen = (element: Element, event: string, callback: () => void): void => {
        element.addEventListener(event, callback);
        removers.push(() => element.removeEventListener(event, callback));
      };
      const show = (): void => {
        if (disposed) return;
        status.textContent = `${failed ? text[8] : finished ? text[7] : playing ? text[5] : steps ? text[6] : text[4]} — ${text[9]}: ${time} ns`;
        container.setAttribute('data-hdl-time', String(time));
        buttons[0]!.disabled = busy || playing || failed || finished || resetting;
        buttons[1]!.disabled = !playing;
        buttons[2]!.disabled = busy || playing || failed || finished || resetting;
        buttons[3]!.disabled = resetting;
        for (const button of container.querySelectorAll<HTMLButtonElement>(':scope > .hdl-exports button'))
          button.disabled = busy || playing || resetting || (!confirmed && button.dataset.hdlExport === 'txt');
        for (const [name, field] of fields) field.disabled = busy || resetting || (request.stimuli ?? []).some((stimulus) => Object.hasOwn(stimulus.inputs, name));
      };
      const empty = (): void => {
        table.replaceChildren();
        const header = table.insertRow();
        for (const label of [text[10]!, '0/1/x/z']) {
          const th = document.createElement('th');
          th.textContent = label;
          header.append(th);
        }
        for (const signal of request.outputs) {
          const row = table.insertRow();
          row.insertCell().textContent = signal.name;
          row.insertCell().textContent = 'x'.repeat(signal.width);
        }
      };
      const markUnreached = (): void => {
        for (const row of checkRows.values())
          if (row.dataset.status === 'pending') {
            row.dataset.status = 'not-run';
            const previous = checkResults.get(row.dataset.hdlCheck!)!;
            checkResults.set(previous.id, { ...previous, status: 'not-run' });
            row.cells[5]!.textContent = labels[3]!;
          }
      };
      const cleanRun = async (old: Run): Promise<void> => {
        const operation = close(old);
        pendingDisposals.add(operation);
        try {
          await operation;
        } catch (error) {
          diagnostic('hdl-interactive-disposal-error', String(error), 'execution', 'warning');
        } finally {
          pendingDisposals.delete(operation);
        }
      };
      const step = async (): Promise<void> => {
        if (disposed || context.signal?.aborted || busy || resetting || failed || finished) return;
        const maxSteps = limit(policy.maxSteps ?? policy.maxStatements, 1000, 10000);
        if (steps >= maxSteps) {
          finished = true;
          playing = false;
          markUnreached();
          show();
          return;
        }
        const scripted = new Map<string, string>();
        for (const stimulus of request.stimuli ?? []) if (stimulus.timeNs <= time) for (const [name, value] of Object.entries(stimulus.inputs)) scripted.set(name, value);
        for (const [name, value] of scripted) fields.get(name)!.value = value;
        const values: Record<string, string> = {};
        for (const signal of request.inputs) {
          const value = fields.get(signal.name)!.value;
          if (value.length !== signal.width || !/^[01xz]+$/.test(value)) {
            playing = false;
            logs.textContent = `Invalid input: ${signal.name} (${signal.width} bits; 0/1/x/z)`;
            show();
            return;
          }
          values[signal.name] = value;
        }
        const remaining = (request.stopTimeNs ?? 1e9) - time;
        const boundaries = [...(request.stimuli ?? []), ...(request.checks ?? [])].map((entry) => entry.timeNs).filter((boundary) => boundary > time);
        const advanceNs = Math.min(request.stepNs, remaining, ...boundaries.map((boundary) => boundary - time));
        if (advanceNs <= 0) {
          finished = true;
          playing = false;
          markUnreached();
          show();
          return;
        }
        const current = run;
        busy = true;
        show();
        const preview = createHDLPreview(plot, { ...context, signal: current.controller.signal });
        const updates = createHDLUpdateReceiver((update, state) => {
          if (disposed || run !== current) return;
          if (update.type === 'progress') status.textContent = hdlProgressLabel(update.phase, context.locale);
          if (update.type === 'log') logs.textContent = state.logs;
          if (update.type === 'vcd') preview.update(state.vcd);
          context.onHDLUpdate?.(update);
        }, current.controller.signal);
        try {
          const result = await current.run(
            { ...context, onHDLUpdate: (update) => updates.receive(update) },
            async (active) => {
              await assertHDLAvailable(executor, language, 'interactive', active);
              return executor.createInteractiveSession!(backendRequest, active);
            },
            (session, active) => session.step({ advanceNs, inputs: values }, active),
            {
              timeoutMs: Math.max(1, limit(policy.timeoutMs, 30000, 300000)),
            },
          );
          updates.finish();
          updates.close();
          await preview.dispose();
          if (disposed || context.signal?.aborted || run !== current || current.controller.signal.aborted) return;
          if (!result || new TextEncoder().encode(JSON.stringify(result)).byteLength > 512 * 1024) throw new Error('Interactive result exceeds 512 KiB');
          if (!Number.isSafeInteger(result.timeNs) || result.timeNs < time || result.timeNs > time + advanceNs || (!result.finished && result.timeNs !== time + advanceNs))
            throw new Error('Interactive result has an invalid simulation time');
          if (result.finished !== undefined && typeof result.finished !== 'boolean') throw new Error('Invalid interactive completion flag');
          if (result.logs !== undefined && (typeof result.logs !== 'string' || result.logs.length > 65536)) throw new Error('Interactive log limit exceeded');
          if (!result.values || typeof result.values !== 'object' || Array.isArray(result.values) || Object.keys(result.values).length !== request.outputs.length)
            throw new Error('Interactive result must contain all declared outputs');
          for (const signal of request.outputs) {
            const value = result.values[signal.name];
            if (!Object.hasOwn(result.values, signal.name) || typeof value !== 'string' || value.length !== signal.width || !/^[01xz]+$/.test(value))
              throw new Error(`Invalid interactive output: ${signal.name}`);
          }
          if (result.vcd !== undefined) {
            if (typeof result.vcd !== 'string') throw new Error('Interactive VCD must be text');
            parseVCD(result.vcd);
          }
          history.push({ startNs: time, endNs: result.timeNs, inputs: { ...values } });
          confirmed = { ...result, values: { ...result.values } };
          time = result.timeNs;
          for (const check of request.checks ?? []) {
            const row = checkRows.get(check.id)!;
            if (row.dataset.status !== 'pending') continue;
            if (check.timeNs === time) {
              const actual = result.values[check.signal]!;
              const passed = actual === check.expected;
              row.dataset.status = passed ? 'passed' : 'failed';
              checkResults.set(check.id, { ...check, status: passed ? 'passed' : 'failed', actual });
              row.cells[4]!.textContent = actual;
              row.cells[5]!.textContent = labels[passed ? 1 : 2]!;
              if (!passed) diagnostic('hdl-check-failed', `${check.id}: ${check.signal} at ${time} ns: expected ${check.expected}, received ${actual}`, 'execution', 'warning');
            }
          }
          steps++;
          finished = result.finished === true || steps >= maxSteps || time >= (request.stopTimeNs ?? 1e9);
          if (finished) {
            playing = false;
            markUnreached();
          }
          empty();
          request.outputs.forEach((signal, index) => {
            table.rows[index + 1]!.cells[1]!.textContent = result.values[signal.name]!;
          });
          logs.textContent = result.logs ?? '';
          await viewer.disposeContainer?.(plot);
          plot.replaceChildren();
          if (result.vcd !== undefined) {
            const size = context.renderSize ? { ...context.renderSize, ...(context.renderSize.width && context.renderSize.width !== 'auto' ? { width: '100%' as const } : {}) } : undefined;
            if (size) applyRenderSize(plot, 'intrinsic', size);
            await viewer.fences![0]!.render(plot, result.vcd, size ? { ...context, renderSize: size } : context);
            finishRenderSize(plot, size);
            preview.restore(plot);
          }
          if (disposed || run !== current || current.controller.signal.aborted) {
            await viewer.disposeContainer?.(plot);
            plot.replaceChildren();
          }
        } catch (error) {
          const timedOut = error instanceof MarkdownExecutionError && error.code === 'execution-timeout';
          if (!disposed && run === current && (timedOut || !current.controller.signal.aborted)) {
            playing = false;
            failed = true;
            markUnreached();
            logs.textContent = timedOut ? 'Interactive simulation timed out' : String(error);
            diagnostic(timedOut ? 'hdl-interactive-timeout' : error instanceof MarkdownExecutionError ? error.code : 'hdl-interactive-error', logs.textContent);
            await cleanRun(current);
          }
        } finally {
          updates.close();
          await preview.dispose();
          if (run === current) {
            busy = false;
            show();
          }
        }
        if (run === current && playing && !disposed && !failed && !finished) scheduled = setTimeout(() => void step(), 50);
      };
      listen(buttons[0]!, 'click', () => {
        if (busy || failed || finished || resetting) return;
        playing = true;
        void step();
      });
      listen(buttons[1]!, 'click', () => {
        playing = false;
        clearTimeout(scheduled);
        show();
      });
      listen(buttons[2]!, 'click', () => {
        if (!playing) void step();
      });
      listen(buttons[3]!, 'click', () => {
        void (async () => {
          if (disposed || resetting) return;
          resetting = true;
          playing = false;
          clearTimeout(scheduled);
          show();
          const old = run;
          run = new ManagedExecutionSession<HDLInteractiveSession>(context.signal);
          await cleanRun(old);
          await viewer.disposeContainer?.(plot);
          plot.replaceChildren();
          if (disposed) return;
          confirmed = undefined;
          history.length = 0;
          time = 0;
          steps = 0;
          failed = false;
          finished = false;
          busy = false;
          for (const signal of request.inputs) fields.get(signal.name)!.value = request.stimuli?.find((entry) => entry.timeNs === 0)?.inputs[signal.name] ?? signal.initial;
          logs.textContent = '';
          resetChecks();
          empty();
          resetting = false;
          show();
        })().catch((error) => diagnostic('hdl-interactive-error', String(error)));
      });
      const exportWord = locale === 'pt' || locale === 'es' ? 'Exportar' : 'Export';
      const disposeExports = createHDLExports(container, context, [
        {
          label: exportWord + ' JSON',
          artifact: () => {
            if (busy || resetting || disposed) return undefined;
            return {
              filename: 'hdl-session.json',
              mediaType: 'application/json;charset=utf-8',
              text: JSON.stringify(
                {
                  schemaVersion: 1,
                  language,
                  top: request.top,
                  timeNs: time,
                  steps,
                  state: failed ? 'error' : finished ? 'finished' : steps ? 'paused' : 'ready',
                  inputs: request.inputs,
                  outputs: request.outputs,
                  stepNs: request.stepNs,
                  stopTimeNs: request.stopTimeNs ?? 1e9,
                  history,
                  stimuli: request.stimuli ?? [],
                  checks: [...checkResults.values()],
                  ...(failed ? { error: logs.textContent ?? '' } : {}),
                  ...(confirmed ? { result: confirmed } : {}),
                },
                null,
                2,
              ),
            };
          },
        },
        {
          label: exportWord + ' TXT',
          artifact: () => (busy || resetting || disposed || !confirmed ? undefined : { filename: 'hdl-session.txt', mediaType: 'text/plain;charset=utf-8', text: confirmed.logs ?? '' }),
        },
      ]);
      const frame: Frame = {
        async dispose() {
          if (disposed) return;
          disposed = true;
          disposeExports();
          playing = false;
          clearTimeout(scheduled);
          for (const remove of removers) remove();
          context.signal?.removeEventListener('abort', onAbort);
          await cleanRun(run);
          await Promise.all([...pendingDisposals]);
        },
      };
      const onAbort = (): void => {
        void clear(container).catch((error) => diagnostic('hdl-interactive-disposal-error', String(error), 'execution', 'warning'));
      };
      frames.set(container, frame);
      context.signal?.addEventListener('abort', onAbort, { once: true });
      empty();
      show();
    } catch (error) {
      await clear(container);
      if (!context.signal?.aborted) renderExtensionError(container, 'HDL interactive', language + '-live', source, error, policyBlocked ? { ...context, onDiagnostic: () => {} } : context);
    }
  };
  return {
    name: hdlInteractiveManifest.name,
    manifest: hdlInteractiveManifest,
    fences: hdlInteractiveManifest.fences.map((fence) => ({
      ...fence,
      render: (container, source, context) => render(container, source, context, fence.language === 'vhdl-live' ? 'vhdl' : 'verilog'),
      dispose: clear,
    })),
    async disposeContainer(container) {
      for (const element of new Set([...frames.keys(), ...clearing.keys()])) if (isMarkdownNodeWithin(container, element)) await clear(element);
    },
    async dispose() {
      for (const element of [...frames.keys()]) await clear(element);
      await Promise.all([...clearing.values()]);
      await viewer.dispose?.();
    },
  };
};
