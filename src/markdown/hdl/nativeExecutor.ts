import { createReplaySession } from './replay.js';
import { StringDecoder } from 'node:string_decoder';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import { validateHDLRequest, type HDLExecutionRequest, type HDLExecutionResult, type HDLCompilerDiagnostic } from '../extensions/hdl/executor.js';
import { parseVCD } from '../extensions/vcd/parser.js';
import { validateNetlist } from '../extensions/netlist/spec.js';
import type { HDLBackendCapabilities, HDLBackendExecutor } from './backend.js';

export type NativeHDLExecutorOptions = Readonly<{
  /** Native HDL can access files/processes. The caller must supply trusted sources or OS isolation. */
  allowNativeExecution: true;
  ghdl?: string;
  iverilog?: string;
  vvp?: string;
  yosys?: string;
  environment?: Readonly<Record<string, string>>;
  temporaryDirectory?: string;
  timeoutMs?: number;
}>;
const limit = 512 * 1024;
const cancelled = (): Error => Object.assign(new Error('HDL execution cancelled'), { name: 'AbortError' });
const diagnostics = (logs: string, failed: boolean, files: ReadonlySet<string>): HDLCompilerDiagnostic[] => {
  const result: HDLCompilerDiagnostic[] = [];
  for (const line of logs.split(/\r?\n/)) {
    const match = /^([^:\r\n]+\.(?:vhd|vhdl|v|sv)):(\d+)(?::(\d+))?:\s*(.*)$/.exec(line);
    if (match && result.length < 128)
      result.push({
        ...(files.has(match[1]!) ? { file: match[1]!, line: Number(match[2]), ...(match[3] ? { column: Number(match[3]) } : {}) } : {}),
        severity: /warning/i.test(match[4]!) ? 'warning' : failed ? 'error' : 'info',
        message: (files.has(match[1]!) ? match[4]! : line).slice(0, 4096),
      });
  }
  if (failed && !result.length) result.push({ severity: 'error', message: logs.trim().slice(-4096) || 'HDL tool failed' });
  return result;
};

/** Fixed argument arrays, private work directories and bounded jobs; not an OS sandbox. */
export const createNativeHDLExecutor = (options: NativeHDLExecutorOptions): HDLBackendExecutor => {
  if (options.allowNativeExecution !== true) throw new Error('Native HDL execution requires explicit host authorization');
  const timeout = options.timeoutMs ?? 30_000;
  if (!Number.isFinite(timeout) || timeout < 1 || timeout > 300_000) throw new Error('Invalid native HDL timeout');
  const tools = { ghdl: options.ghdl ?? 'ghdl', iverilog: options.iverilog ?? 'iverilog', vvp: options.vvp ?? 'vvp', yosys: options.yosys ?? 'yosys' };
  const environment = { ...process.env, ...options.environment };

  const command = (
    executable: string,
    args: string[],
    cwd: string,
    signal: AbortSignal,
    children: Set<ChildProcess>,
    onLog?: (text: string) => void,
  ): Promise<{ code: number; text: string; stdout: string; stderr: string }> =>
    new Promise((resolve, reject) => {
      if (signal.aborted) return reject(cancelled());
      const child = spawn(executable, args, { cwd, env: environment, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
      children.add(child);
      let text = '';
      let stdout = '';
      let stderr = '';
      let error: Error | undefined;
      let stopping = false;
      const kill = () => {
        if (stopping || !child.pid) return;
        stopping = true;
        if (process.platform === 'win32') {
          const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore', shell: false });
          killer.on('error', () => child.kill('SIGKILL'));
          killer.on('close', (code) => {
            if (code !== 0) child.kill('SIGKILL');
          });
        } else {
          try {
            process.kill(-child.pid, 'SIGKILL');
          } catch {
            child.kill('SIGKILL');
          }
        }
      };
      const abort = () => {
        error = cancelled();
        kill();
      };
      const timer = setTimeout(() => {
        error = new Error(`${path.basename(executable)} timed out after ${timeout} ms`);
        kill();
      }, timeout);
      const stdoutDecoder = new StringDecoder('utf8'),
        stderrDecoder = new StringDecoder('utf8');
      const append = (data: string) => {
        if (error) return;
        text += data;
        if (Buffer.byteLength(text) > 65_536) {
          error = new Error('HDL tool log limit exceeded');
          kill();
        } else if (onLog && data) {
          try {
            onLog(data);
          } catch (cause) {
            error = cause instanceof Error ? cause : new Error(String(cause));
            kill();
          }
        }
      };
      child.stdout!.on('data', (data: Buffer) => {
        if (!error) {
          const decoded = stdoutDecoder.write(data);
          stdout += decoded;
          append(decoded);
        }
      });
      child.stderr!.on('data', (data: Buffer) => {
        if (!error) {
          const decoded = stderrDecoder.write(data);
          stderr += decoded;
          append(decoded);
        }
      });
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
      child.on('error', (cause) => {
        error = cause;
      });
      child.on('close', (code) => {
        const outTail = stdoutDecoder.end(),
          errTail = stderrDecoder.end();
        stdout += outTail;
        stderr += errTail;
        append(outTail + errTail);
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        children.delete(child);
        if (error) reject(error);
        else resolve({ code: code ?? 1, text, stdout, stderr });
      });
    });

  const checkedRead = async (directory: string, filename: string): Promise<string> => {
    const file = path.join(directory, filename);
    if ((await stat(file)).size > limit) throw new Error(`HDL ${filename} exceeds 512 KiB`);
    return readFile(file, 'utf8');
  };
  const normalize = (request: HDLExecutionRequest): HDLExecutionRequest => {
    const { language, ...data } = request;
    if (language !== 'vhdl' && language !== 'verilog') throw new Error('Unsupported HDL language');
    if (Buffer.byteLength(JSON.stringify(request)) > 256 * 1024) throw new Error('HDL request exceeds 256 KiB');
    return validateHDLRequest(data, language);
  };

  const createSession = async (context: MarkdownDocumentContext, replay = false) => {
    const controller = new AbortController();
    const children = new Set<ChildProcess>();
    const abort = () => controller.abort();
    context.signal?.addEventListener('abort', abort, { once: true });
    if (context.signal?.aborted) abort();
    const directory = await mkdtemp(path.join(path.resolve(options.temporaryDirectory ?? tmpdir()), 'mathjslab-hdl-'));
    let pending: Promise<HDLExecutionResult> | undefined;
    let disposal: Promise<void> | undefined;
    let used = false;
    const execute = (raw: HDLExecutionRequest, executionContext: MarkdownDocumentContext): Promise<HDLExecutionResult> => {
      if (used || disposal) return Promise.reject(new Error('Native HDL sessions execute once'));
      used = true;
      const executionAbort = () => controller.abort();
      executionContext.signal?.addEventListener('abort', executionAbort, { once: true });
      if (executionContext.signal?.aborted) controller.abort();
      pending = (async () => {
        let logs = '';
        const sourceFiles = new Set<string>();
        try {
          const request = normalize(raw);
          request.files.forEach((file) => sourceFiles.add(file.name));
          if (!replay && request.top.toLowerCase().startsWith('markdown_')) throw new Error('markdown_ entity/module names are reserved for the HDL adapter');
          if (request.files.some((file) => file.name.toLowerCase().startsWith('markdown_') && !(replay && (file.name === 'markdown_replay.vhd' || file.name === 'markdown_replay.sv'))))
            throw new Error('markdown_ filenames are reserved for the HDL adapter');
          if (controller.signal.aborted) throw cancelled();
          for (const file of request.files) await writeFile(path.join(directory, file.name), file.source, 'utf8');
          const run = async (tool: string, args: string[]): Promise<void> => {
            executionContext.onHDLUpdate?.({
              type: 'progress',
              phase: tool === tools.vvp || args.includes('-r') ? 'simulate' : tool === tools.yosys ? 'synthesize' : args.includes('-e') ? 'elaborate' : 'compile',
            });
            const follow = !!executionContext.onHDLUpdate && !replay && (tool === tools.vvp || args.includes('-r'));
            let offset = 0,
              reading = Promise.resolve(),
              readError: unknown;
            const decoder = new StringDecoder('utf8');
            let readingNow = false;
            const read = async (): Promise<void> => {
              try {
                const data = await readFile(path.join(directory, 'markdown_trace.vcd'));
                if (data.length > limit || data.length < offset) throw new Error('Invalid incremental VCD size');
                const text = decoder.write(data.subarray(offset));
                offset = data.length;
                for (let i = 0; i < text.length; i += 16384) executionContext.onHDLUpdate?.({ type: 'vcd', text: text.slice(i, i + 16384) });
              } catch (cause) {
                if ((cause as NodeJS.ErrnoException).code !== 'ENOENT') readError = cause;
              }
            };
            const timer = follow
              ? setInterval(() => {
                  if (readingNow) return;
                  readingNow = true;
                  reading = read().finally(() => {
                    readingNow = false;
                  });
                }, 100)
              : undefined;
            let result;
            try {
              result = await command(tool, args, directory, controller.signal, children, (text) => executionContext.onHDLUpdate?.({ type: 'log', text }));
            } finally {
              clearInterval(timer);
              if (follow) {
                await reading;
                await read();
                const tail = decoder.end();
                if (tail) executionContext.onHDLUpdate?.({ type: 'vcd', text: tail });
              }
            }
            if (readError) throw readError;
            logs += result.text;
            if (Buffer.byteLength(logs) > 65_536) throw new Error('Combined HDL log limit exceeded');
            if (result.code !== 0) throw new Error(`${path.basename(tool)} exited with code ${result.code}`);
          };
          const files = request.files.map((file) => file.name);
          if (request.operation === 'synthesize') {
            let synthesisFiles = files;
            if (request.language === 'vhdl') {
              await run(tools.ghdl, ['-a', `--std=${request.standard ?? '08'}`, ...files]);
              const result = await command(tools.ghdl, ['--synth', `--std=${request.standard ?? '08'}`, '--out=verilog', request.top], directory, controller.signal, children);
              if (result.code !== 0) {
                logs += result.text;
                throw new Error('GHDL synthesis failed');
              }
              logs += result.stderr;
              if (result.stderr) executionContext.onHDLUpdate?.({ type: 'log', text: result.stderr });
              await writeFile(path.join(directory, 'markdown_synth.v'), result.stdout);
              synthesisFiles = ['markdown_synth.v'];
            }
            await run(tools.yosys, [
              '-Q',
              '-T',
              '-p',
              `read_verilog ${request.standard && request.standard !== '2005' ? '-sv ' : ''}${synthesisFiles.join(' ')}; hierarchy -check -top ${request.top}; proc; flatten; opt; write_json markdown_netlist.json`,
            ]);
            const netlist = validateNetlist({ top: request.top, netlist: JSON.parse(await checkedRead(directory, 'markdown_netlist.json')) });
            return { status: 'success', logs, diagnostics: diagnostics(logs, false, sourceFiles), netlist };
          }
          const stop = request.stopTimeNs ?? 1000;
          if (request.language === 'vhdl') {
            const standard = `--std=${request.standard ?? '08'}`;
            await run(tools.ghdl, ['-a', standard, ...files]);
            await run(tools.ghdl, ['-e', standard, request.top]);
            await run(tools.ghdl, ['-r', standard, request.top, `--stop-time=${stop}ns`, '--vcd=markdown_trace.vcd', '--vcd-4states', '--assert-level=error']);
          } else {
            // A second root records the actual top and supplies a bounded stop time.
            // Replay drains target-time NBA/read-only updates, then discards the
            // private one-femtosecond drain tick from its returned recording.
            const wrapper =
              '`timescale 1ns/1fs\nmodule markdown_capture; initial begin $dumpfile("markdown_trace.vcd"); $dumpvars(0,' +
              request.top +
              '); #' +
              stop +
              '; ' +
              (replay ? '#0.000001; ' : '') +
              '$finish; end endmodule\n';
            await writeFile(path.join(directory, 'markdown_capture.sv'), wrapper);
            await writeFile(path.join(directory, 'markdown_timescale.sv'), '`timescale 1ns/1ps\n');
            await run(tools.iverilog, [
              `-g${request.standard ?? '2012'}`,
              '-s',
              request.top,
              '-s',
              'markdown_capture',
              '-o',
              'markdown_sim.vvp',
              'markdown_timescale.sv',
              ...files,
              'markdown_capture.sv',
            ]);
            await run(tools.vvp, ['markdown_sim.vvp']);
          }
          const vcd = await checkedRead(directory, 'markdown_trace.vcd');
          parseVCD(vcd);
          return { status: 'success', logs, diagnostics: diagnostics(logs, false, sourceFiles), vcd };
        } catch (cause) {
          if (controller.signal.aborted) return { status: 'cancelled' };
          logs = (logs + '\n' + (cause instanceof Error ? cause.message : String(cause))).slice(-65_536);
          return { status: 'error', logs, diagnostics: diagnostics(logs, true, sourceFiles) };
        } finally {
          executionContext.signal?.removeEventListener('abort', executionAbort);
        }
      })();
      return pending;
    };
    return {
      execute,
      dispose: (): Promise<void> => {
        if (!disposal)
          disposal = (async () => {
            abort();
            context.signal?.removeEventListener('abort', abort);
            await pending?.catch(() => undefined);
            await rm(directory, { recursive: true, force: true });
          })();
        return disposal;
      },
    };
  };

  return {
    createSession,
    async capabilities(context: MarkdownDocumentContext = {}): Promise<HDLBackendCapabilities> {
      const states: Record<string, { available: boolean; version?: string; error?: string }> = {};
      for (const [name, executable] of Object.entries(tools)) {
        try {
          const result = await command(
            executable,
            [name === 'iverilog' || name === 'vvp' ? '-V' : name === 'yosys' ? '-V' : '--version'],
            options.temporaryDirectory ?? tmpdir(),
            context.signal ?? new AbortController().signal,
            new Set(),
          );
          states[name] = { available: result.code === 0, version: result.text.trim().slice(0, 2048) };
        } catch (error) {
          context.signal?.throwIfAborted();
          states[name] = { available: false, error: error instanceof Error ? error.message : String(error) };
        }
      }
      const vhdl = states.ghdl!.available;
      const verilog = states.iverilog!.available && states.vvp!.available;
      return {
        tools: states,
        updates: ['progress', 'log', 'vcd'],
        languages: {
          vhdl: { simulate: vhdl, synthesize: vhdl && states.yosys!.available, interactive: vhdl ? 'replay' : false },
          verilog: { simulate: verilog, synthesize: states.yosys!.available, interactive: verilog ? 'replay' : false },
        },
      };
    },
    createInteractiveSession: (raw, context) => createReplaySession(createSession, raw, context),
  };
};
