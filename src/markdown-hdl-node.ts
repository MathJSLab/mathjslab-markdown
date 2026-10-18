/** Node-only tool integration. Never import this entry in a browser bundle. */
export { createNativeHDLExecutor } from './markdown/hdl/nativeExecutor.js';
export type { NativeHDLExecutorOptions } from './markdown/hdl/nativeExecutor.js';
export { createHDLHTTPHandler } from './markdown/hdl/httpHandler.js';
export type { HDLHTTPHandlerOptions } from './markdown/hdl/httpHandler.js';
export type { HDLBackendCapabilities, HDLBackendExecutor } from './markdown/hdl/backend.js';

export * from './markdown/execution/scheduler.js';

export type { HDLExecutionUpdate } from './markdown/hdl/updates.js';

export type { HDLStimulus, HDLCheck, HDLInteractiveRequest, HDLInteractiveStep, HDLInteractiveResult, HDLInteractiveSession } from './markdown/extensions/hdl-interactive/executor.js';

export type { HDLArtifact } from './markdown/hdl/artifacts.js';

export type { HDLCheckResult } from './markdown/extensions/hdl-interactive/executor.js';
