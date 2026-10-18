import type { HDLExecutor } from '../extensions/hdl/executor.js';
import type { HDLExecutionUpdate } from './updates.js';

/** Host availability, separate from document execution authorization. */
export type HDLBackendCapabilities = Readonly<{
  updates?: readonly HDLExecutionUpdate['type'][];
  languages: Readonly<Record<'vhdl' | 'verilog', Readonly<{ simulate: boolean; synthesize: boolean; interactive: false | 'replay' }>>>;
  tools: Readonly<Record<string, Readonly<{ available: boolean; version?: string; error?: string }>>>;
}>;
export interface HDLBackendExecutor extends HDLExecutor {
  capabilities(): Promise<HDLBackendCapabilities>;
}
