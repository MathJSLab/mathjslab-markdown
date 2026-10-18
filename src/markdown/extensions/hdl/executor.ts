import type { HDLBackendCapabilities } from '../../hdl/backend.js';
import type { MarkdownDocumentContext } from '../../../MarkdownEngine.js';
import type { MarkdownNetlistInput } from '../netlist/spec.js';
import type { HDLInteractiveRequest, HDLInteractiveSession } from '../hdl-interactive/executor.js';

export type HDLLanguage = 'vhdl' | 'verilog';
export type HDLSourceFile = { readonly name: string; readonly source: string };
export type HDLExecutionRequest = {
  readonly language: HDLLanguage;
  readonly operation: 'simulate' | 'synthesize';
  readonly top: string;
  readonly files: readonly HDLSourceFile[];
  readonly standard?: string;
  readonly stopTimeNs?: number;
};
export type HDLCompilerDiagnostic = {
  readonly severity: 'info' | 'warning' | 'error';
  readonly message: string;
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
};
/** Data only: no HTML, SVG, executable scripts or author-supplied commands. */
export type HDLExecutionResult = {
  readonly status: 'success' | 'error' | 'cancelled';
  readonly logs?: string;
  readonly diagnostics?: readonly HDLCompilerDiagnostic[];
  readonly waveform?: { readonly signal: readonly unknown[]; readonly [key: string]: unknown };
  readonly netlist?: MarkdownNetlistInput;
  /** Raw digital Value Change Dump, displayed by the native simulation viewer. */
  readonly vcd?: string;
};
export interface HDLExecutionSession {
  execute(request: HDLExecutionRequest, context: MarkdownDocumentContext): HDLExecutionResult | Promise<HDLExecutionResult>;
  /** Terminate jobs/workers and release temporary files, including on cancellation. */
  dispose(): void | Promise<void>;
}
export interface HDLExecutor {
  /** Optional host discovery; does not authorize execution. */
  capabilities?(context?: MarkdownDocumentContext): Promise<HDLBackendCapabilities>;
  /** Optional stateful adapter; batch-only executors remain compatible. */
  createInteractiveSession?(request: HDLInteractiveRequest, context: MarkdownDocumentContext): HDLInteractiveSession | Promise<HDLInteractiveSession>;
  /** One isolated session per executable fence. The host owns tools and sandboxing. */
  createSession(context: MarkdownDocumentContext): HDLExecutionSession | Promise<HDLExecutionSession>;
}

export const validateHDLRequest = (value: unknown, language: HDLLanguage): HDLExecutionRequest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('HDL request must be an object');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['operation', 'top', 'files', 'standard', 'stopTimeNs'].includes(key))) throw new Error('Unsupported HDL request field');
  if (input.operation !== 'simulate' && input.operation !== 'synthesize') throw new Error('HDL operation must be simulate or synthesize');
  if (typeof input.top !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(input.top)) throw new Error('Invalid HDL top identifier');
  if (!Array.isArray(input.files) || !input.files.length || input.files.length > 16) throw new Error('HDL requires 1 to 16 source files');
  const names = new Set<string>();
  const files = input.files.map((raw: unknown): HDLSourceFile => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid HDL source file');
    const file = raw as Record<string, unknown>;
    if (Object.keys(file).some((key) => !['name', 'source'].includes(key))) throw new Error('Unsupported HDL file field');
    if (typeof file.name !== 'string' || !/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}\.(?:vhd|vhdl|v|sv)$/.test(file.name) || names.has(file.name.toLowerCase()))
      throw new Error('HDL filenames must be unique flat names with an HDL extension');
    if (!(language === 'vhdl' ? /\.vhdl?$/ : /\.(?:v|sv)$/).test(file.name)) throw new Error('HDL filename does not match the fence language');
    if (typeof file.source !== 'string' || !file.source.trim() || file.source.includes('\0')) throw new Error('HDL source must be nonempty text without NUL');
    names.add(file.name.toLowerCase());
    return { name: file.name, source: file.source };
  });
  const standards = language === 'vhdl' ? ['93', '02', '08', '19'] : ['2005', '2012', '2017'];
  if (input.standard !== undefined && (typeof input.standard !== 'string' || !standards.includes(input.standard))) throw new Error('Unsupported HDL standard');
  if (
    input.stopTimeNs !== undefined &&
    (input.operation !== 'simulate' || typeof input.stopTimeNs !== 'number' || !Number.isFinite(input.stopTimeNs) || input.stopTimeNs <= 0 || input.stopTimeNs > 1e9)
  )
    throw new Error('stopTimeNs requires simulation and a positive finite value at most 1e9');
  return {
    language,
    operation: input.operation,
    top: input.top,
    files,
    ...(input.standard !== undefined ? { standard: input.standard as string } : {}),
    ...(input.stopTimeNs !== undefined ? { stopTimeNs: input.stopTimeNs as number } : {}),
  };
};
