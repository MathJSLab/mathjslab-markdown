/** Browser-safe, explicitly configured HDL backend integration. */
export { createHTTPHDLExecutor } from './markdown/hdl/httpExecutor.js';
export type { HTTPHDLExecutorOptions } from './markdown/hdl/httpExecutor.js';
export type { HDLBackendCapabilities, HDLBackendExecutor } from './markdown/hdl/backend.js';
export type { HDLExecutor, HDLExecutionRequest, HDLExecutionResult } from './markdown/extensions/hdl/executor.js';

export type { HDLExecutionUpdate } from './markdown/hdl/updates.js';

export type { HDLStimulus, HDLCheck, HDLInteractiveRequest, HDLInteractiveStep, HDLInteractiveResult, HDLInteractiveSession } from './markdown/extensions/hdl-interactive/executor.js';

export type { HDLArtifact } from './markdown/hdl/artifacts.js';

export type { HDLCheckResult } from './markdown/extensions/hdl-interactive/executor.js';
