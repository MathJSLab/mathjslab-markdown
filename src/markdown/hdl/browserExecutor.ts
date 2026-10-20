import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import { validateHDLRequest, type HDLExecutionResult, type HDLExecutionSession } from '../extensions/hdl/executor.js';
import type { HDLBackendExecutor } from './backend.js';
import { createReplaySession } from './replay.js';
import { parseVCD } from '../extensions/vcd/parser.js';
import { validateNetlist } from '../extensions/netlist/spec.js';

export type BrowserHDLExecutorOptions = Readonly<{
  /** Trusted application authorization. Document policies are also required. */
  allowBrowserExecution: true;
  /** Self-hosted directory containing browser-worker.mjs and tool assets. */
  assetsURL: string | URL;
  timeoutMs?: number;
  maxSessions?: number;
}>;
const aborted = () => new DOMException('HDL execution cancelled', 'AbortError');
const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;

/** Real Icarus/NVC simulation and GHDL/YoWASP synthesis; no remote fallback. */
export const createBrowserHDLExecutor = (options: BrowserHDLExecutorOptions): HDLBackendExecutor => {
  if (options.allowBrowserExecution !== true) throw new Error('Browser HDL requires explicit application authorization');
  const base = new URL(options.assetsURL, globalThis.location?.href);
  if (!['http:', 'https:'].includes(base.protocol) || !base.pathname.endsWith('/')) throw new Error('HDL assetsURL must be an HTTP(S) directory URL');
  if (globalThis.location && base.origin !== globalThis.location.origin) throw new Error('HDL tools must be hosted with the application');
  const timeout = options.timeoutMs ?? 30_000;
  const maximum = options.maxSessions ?? 4;
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 300_000 || !Number.isInteger(maximum) || maximum < 1 || maximum > 16) throw new Error('Invalid browser HDL limits');
  let sessions = 0;
  const acquire = () => {
    if (sessions >= maximum) throw new Error('Browser HDL session limit exceeded');
    sessions++;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        sessions--;
      }
    };
  };
  const createSession = async (context: MarkdownDocumentContext, replay = false, internal = false): Promise<HDLExecutionSession> => {
    context.signal?.throwIfAborted();
    const release = internal ? () => {} : acquire();
    let closed = false,
      used = false;
    let worker: Worker | undefined;
    let stop: ((error: Error) => void) | undefined;
    const dispose = () => {
      if (closed) return;
      closed = true;
      stop?.(aborted());
      worker?.terminate();
      worker = undefined;
      context.signal?.removeEventListener('abort', dispose);
      release();
    };
    context.signal?.addEventListener('abort', dispose, { once: true });
    return {
      dispose,
      async execute(raw, executionContext) {
        if (closed || used) throw new Error('Browser HDL session closed or already used');
        used = true;
        try {
          const { language, ...data } = raw;
          if (language !== 'verilog' && language !== 'vhdl') throw new Error('Unsupported browser HDL language');
          if (bytes(raw) > 256 * 1024) throw new Error('HDL request exceeds 256 KiB');
          const request = validateHDLRequest(data, language);
          if (language === 'vhdl' && request.standard !== undefined && request.standard !== '08') throw new Error('Browser VHDL currently supports VHDL-2008 (08) only');
          if (
            (!replay && request.top.toLowerCase().startsWith('markdown_')) ||
            request.files.some((file) => file.name.toLowerCase().startsWith('markdown_') && !(replay && file.name === (language === 'vhdl' ? 'markdown_replay.vhd' : 'markdown_replay.sv')))
          )
            throw new Error('markdown_ names are reserved');
          if (language === 'verilog' && request.standard === '2017') throw new Error('Icarus browser profile supports 2005 and 2012, not 2017');
          executionContext.signal?.throwIfAborted();
          const result = await new Promise<HDLExecutionResult>((resolve, reject) => {
            const cancel = () => finish(aborted());
            const timer = setTimeout(() => finish(new Error(`Browser HDL timed out after ${timeout} ms`)), timeout);
            const finish = (error?: Error, value?: HDLExecutionResult) => {
              clearTimeout(timer);
              executionContext.signal?.removeEventListener('abort', cancel);
              stop = undefined;
              worker?.terminate();
              worker = undefined;
              if (error) reject(error);
              else resolve(value!);
            };
            stop = (error) => finish(error);
            executionContext.signal?.addEventListener('abort', cancel, { once: true });
            try {
              worker = new Worker(new URL('browser-worker.mjs', base), { type: 'module', name: 'mathjslab-hdl' });
              worker.onerror = (event) => finish(new Error(event.message || 'HDL Worker failed (check assets and CSP)'));
              worker.onmessageerror = () => finish(new Error('Invalid HDL Worker message'));
              worker.onmessage = (event: MessageEvent<{ result?: HDLExecutionResult; error?: string }>) => {
                try {
                  if (event.data.error) throw new Error(event.data.error);
                  const result = event.data.result;
                  if (!result || !['success', 'error', 'cancelled'].includes(result.status) || bytes(result) > 1024 * 1024) throw new Error('Invalid or oversized HDL result');
                  if (result.vcd) parseVCD(result.vcd);
                  if (result.netlist) validateNetlist(result.netlist);
                  finish(undefined, result);
                } catch (error) {
                  finish(error instanceof Error ? error : new Error(String(error)));
                }
              };
              worker.postMessage({ request, replay });
            } catch (error) {
              finish(error instanceof Error ? error : new Error(String(error)));
            }
          });
          if (result.logs) executionContext.onHDLUpdate?.({ type: 'log', text: result.logs });
          if (!replay && result.vcd) executionContext.onHDLUpdate?.({ type: 'vcd', text: result.vcd });
          return result;
        } finally {
          dispose();
        }
      },
    };
  };
  return {
    createSession,
    async capabilities(context = {}) {
      context.signal?.throwIfAborted();
      // An actual compiler probe is performed on first execution, not a network service.
      const available = typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
      return {
        updates: ['log', 'vcd'],
        tools: {
          'browser-runtime': {
            available,
            error: 'Unsupported or unavailable browser capability. Check packaged assets and the documented language profile. No service or native fallback.',
          },
          iverilog: { available, version: 'VeriSim b4a6772 / Icarus c7530db' },
          vvp: { available },
          yosys: { available, version: 'YoWASP 0.70.62-dev.1236' },
          ghdl: { available, version: 'GHDL 5.0.1 synthesis / synth-explorer d4dab3d (VHDL-2008 only)' },
          nvc: { available, version: 'NVC 1.22.0 / Emscripten 6.0.12, single-thread Wasm interpreter (VHDL-2008)' },
        },
        languages: {
          verilog: { simulate: available, synthesize: available, interactive: available ? 'replay' : false },
          vhdl: { simulate: available, synthesize: available, interactive: available ? 'replay' : false },
        },
      };
    },
    async createInteractiveSession(request, context) {
      if (request.language !== 'verilog' && request.language !== 'vhdl') throw new Error('Unsupported browser HDL language');
      context.signal?.throwIfAborted();
      const release = acquire();
      try {
        const session = await createReplaySession((ctx, replay) => createSession(ctx, replay, true), request, context);
        const dispose = async () => {
          context.signal?.removeEventListener('abort', dispose);
          try {
            await session.dispose();
          } finally {
            release();
          }
        };
        context.signal?.addEventListener('abort', dispose, { once: true });
        if (context.signal?.aborted) await dispose();
        return { step: (step, ctx) => session.step(step, ctx), dispose };
      } catch (error) {
        release();
        throw error;
      }
    },
  };
};
