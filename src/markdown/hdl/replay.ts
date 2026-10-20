import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import type { HDLExecutionSession } from '../extensions/hdl/executor.js';
import { validateInteractiveRequest, type HDLInteractiveRequest, type HDLInteractiveStep, type HDLInteractiveSession } from '../extensions/hdl-interactive/executor.js';
import { parseVCD, vcdValueAt } from '../extensions/vcd/parser.js';
const cancelled = (): Error => Object.assign(new Error('HDL execution cancelled'), { name: 'AbortError' });
export const createReplaySession = async (
  createSession: (context: MarkdownDocumentContext, replay?: boolean) => Promise<HDLExecutionSession>,
  raw: HDLInteractiveRequest,
  context: MarkdownDocumentContext,
): Promise<HDLInteractiveSession> => {
  const { language, ...data } = raw;
  if (language !== 'vhdl' && language !== 'verilog') throw new Error('Unsupported HDL language');
  if (new TextEncoder().encode(JSON.stringify(raw)).length > 256 * 1024) throw new Error('HDL request exceeds 256 KiB');
  const request = validateInteractiveRequest(data, language);
  if (request.top.toLowerCase().startsWith('markdown_')) throw new Error('markdown_ entity/module names are reserved for replay');
  if (request.files.length > 15 || request.files.some((file) => file.name.toLowerCase().startsWith('markdown_'))) throw new Error('Replay reserves one source slot and markdown_ filenames');
  // Named top-level digital ports only; hierarchical paths require a VPI/VHPI backend.
  if ([...request.inputs, ...request.outputs].some((signal) => !/^[A-Za-z][A-Za-z0-9_]*$/.test(signal.name))) throw new Error('Replay supports simple top-level port names only');
  const history: HDLInteractiveStep[] = [];
  const controller = new AbortController();
  const abort = () => controller.abort();
  context.signal?.addEventListener('abort', abort, { once: true });
  if (context.signal?.aborted) abort();
  let timeNs = 0;
  let active: Awaited<ReturnType<typeof createSession>> | undefined;
  let pending: Promise<unknown> | undefined;
  let disposal: Promise<void> | undefined;
  let values = Object.fromEntries(request.inputs.map((input) => [input.name, input.initial]));
  return {
    async step(step, stepContext) {
      if (disposal || pending) throw new Error('Interactive HDL session closed or busy');
      if (!Number.isSafeInteger(step.advanceNs) || step.advanceNs < 1 || step.advanceNs > 1_000_000 || timeNs + step.advanceNs > (request.stopTimeNs ?? 1e9) || history.length >= 1000)
        throw new Error('Interactive step limit exceeded');
      if (Object.keys(step.inputs).some((name) => !request.inputs.some((input) => input.name === name))) throw new Error('Unknown HDL input');
      const nextValues = { ...values, ...step.inputs };
      if (request.inputs.some((input) => typeof nextValues[input.name] !== 'string' || !/^[01xz]+$/.test(nextValues[input.name]!) || nextValues[input.name]!.length !== input.width))
        throw new Error('Invalid HDL input value');
      const nextHistory = [...history, { advanceNs: step.advanceNs, inputs: nextValues }];
      const target = timeNs + step.advanceNs;
      pending = (async () => {
        const signal = stepContext.signal ? AbortSignal.any([controller.signal, stepContext.signal]) : controller.signal;
        active = await createSession({ ...context, signal }, true);
        try {
          const wrapper = replayWrapper(request, nextHistory);
          const result = await active.execute(
            {
              language,
              operation: 'simulate',
              top: 'markdown_replay',
              files: [...request.files, wrapper],
              standard: request.standard ?? (language === 'vhdl' ? '08' : '2012'),
              stopTimeNs: target,
            },
            { ...stepContext, signal },
          );
          if (result.status !== 'success' || !result.vcd) throw new Error(result.logs ?? 'Interactive HDL simulation cancelled');
          if (language === 'vhdl' && !result.logs?.includes('markdown replay checkpoint'))
            throw new Error('HDL finished before the replay checkpoint; use a port-level design without stop/finish');
          let recording = parseVCD(result.vcd);
          const units = { s: 1e9, ms: 1e6, us: 1e3, ns: 1, ps: 1e-3, fs: 1e-6 };
          const tickNs = recording.timescale.magnitude * units[recording.timescale.unit];
          const targetTicks = Math.round(target / tickNs);
          if (!Number.isSafeInteger(targetTicks)) throw new Error('Replay recording exceeds safe integer ticks');
          if (language === 'vhdl' && recording.endTime < targetTicks) throw new Error('HDL finished before the replay checkpoint; the recording did not reach the requested time');
          if (language === 'verilog' && recording.endTime < targetTicks + 1) throw new Error('HDL finished before the replay checkpoint; use a port-level design without $finish');
          let vcd = result.vcd;
          for (const match of vcd.matchAll(/^#(\d+)\s*$/gm)) {
            if (Number(match[1]) > targetTicks) {
              vcd = vcd.slice(0, match.index);
              break;
            }
          }
          recording = parseVCD(vcd);
          // The verified checkpoint is real elapsed time even if no signal changed.
          // Clipping the private drain tick must not erase that duration.
          if (recording.endTime < targetTicks) {
            vcd = vcd.trimEnd() + `\n#${targetTicks}\n`;
            recording = parseVCD(vcd);
          }
          const outputs: Record<string, string> = {};
          for (const output of request.outputs) {
            const name = language === 'vhdl' ? output.name.toLowerCase() : output.name;
            const signal = recording.signals.find((signal) => signal.name === `markdown_replay.${name}` || signal.name === `markdown_replay.${name}[${output.width - 1}:0]`);
            if (!signal || signal.width !== output.width) throw new Error(`Missing or mismatched HDL output: ${output.name}`);
            outputs[output.name] = vcdValueAt(signal, targetTicks);
          }
          if (signal.aborted) throw cancelled();
          for (let i = 0; i < vcd.length; i += 16384) stepContext.onHDLUpdate?.({ type: 'vcd', text: vcd.slice(i, i + 16384) });
          if (signal.aborted) throw cancelled();
          history.push(nextHistory[nextHistory.length - 1]!);
          values = nextValues;
          timeNs = target;
          return { timeNs, values: outputs, finished: timeNs === request.stopTimeNs, vcd, logs: result.logs ?? '' };
        } finally {
          await active.dispose();
          active = undefined;
        }
      })();
      try {
        return (await pending) as { timeNs: number; values: Record<string, string>; finished: boolean; vcd: string; logs: string };
      } finally {
        pending = undefined;
      }
    },
    dispose() {
      if (!disposal)
        disposal = (async () => {
          abort();
          context.signal?.removeEventListener('abort', abort);
          await active?.dispose();
          await pending?.catch(() => undefined);
          history.length = 0;
        })();
      return disposal;
    },
  };
};

const replayWrapper = (request: HDLInteractiveRequest, history: readonly HDLInteractiveStep[]): { name: string; source: string } => {
  const signals = [...request.inputs, ...request.outputs];
  if (request.language === 'verilog') {
    const declarations = signals
      .map((signal) => `${request.inputs.includes(signal as (typeof request.inputs)[number]) ? 'reg' : 'wire'} ${signal.width === 1 ? '' : `[${signal.width - 1}:0] `}${signal.name};`)
      .join('\n');
    const stimulus = history.map((step) => request.inputs.map((input) => `${input.name}<=${input.width}'b${step.inputs[input.name]};`).join('\n') + `\n#${step.advanceNs};`).join('\n');
    return {
      name: 'markdown_replay.sv',
      source:
        '`timescale 1ns/1ps\nmodule markdown_replay;\n' +
        declarations +
        '\n' +
        request.top +
        ' dut(' +
        signals.map((signal) => `.${signal.name}(${signal.name})`).join(',') +
        ');\ninitial begin\n' +
        stimulus +
        '\nend\nendmodule\n',
    };
  }
  const declarations = signals.map((signal) => `signal ${signal.name}: ${signal.width === 1 ? 'std_logic' : `std_logic_vector(${signal.width - 1} downto 0)`};`).join('\n');
  const stimulus = history
    .map(
      (step) =>
        request.inputs
          .map((input) => `${input.name}<=${input.width === 1 ? "'" + step.inputs[input.name]!.toUpperCase() + "'" : '"' + step.inputs[input.name]!.toUpperCase() + '"'};`)
          .join('\n') + `\nwait for ${step.advanceNs} ns;`,
    )
    .join('\n');
  return {
    name: 'markdown_replay.vhd',
    source:
      'library ieee;use ieee.std_logic_1164.all;entity markdown_replay is end;architecture replay of markdown_replay is\n' +
      declarations +
      '\nbegin\ndut:entity work.' +
      request.top +
      ' port map(' +
      signals.map((signal) => `${signal.name}=>${signal.name}`).join(',') +
      ');\nprocess begin\n' +
      stimulus +
      '\nreport "markdown replay checkpoint" severity note;wait;end process;end;\n',
  };
};
