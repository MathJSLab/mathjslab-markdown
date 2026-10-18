import { createHDLUpdateReceiver } from './updates.js';
import type { HDLExecutionUpdate } from './updates.js';
import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import { MarkdownExecutionError } from '../execution/scheduler.js';
import type { HDLExecutionRequest, HDLExecutionResult } from '../extensions/hdl/executor.js';
import type { HDLInteractiveRequest, HDLInteractiveResult, HDLInteractiveStep } from '../extensions/hdl-interactive/executor.js';
import type { HDLBackendCapabilities, HDLBackendExecutor } from './backend.js';

export type HTTPHDLExecutorOptions = Readonly<{
  endpoint: string | URL;
  /** Session-scoped secret provided by the trusted application, never Markdown. */
  token: string;
  fetch?: typeof globalThis.fetch;
}>;
export const createHTTPHDLExecutor = (options: HTTPHDLExecutorOptions): HDLBackendExecutor => {
  const endpoint = new URL(options.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw new Error('Invalid HDL endpoint');
  if (!options.token || /[\r\n]/.test(options.token)) throw new Error('HDL service token required');
  endpoint.pathname = endpoint.pathname.replace(/\/$/, '') + '/';
  const fetch = options.fetch ?? globalThis.fetch;
  const call = async <T>(route: string, method: string, body?: unknown, signal?: AbortSignal, onUpdate?: (update: HDLExecutionUpdate) => void): Promise<T> => {
    const response = await fetch(new URL(route, endpoint), {
      method,
      headers: { Authorization: `Bearer ${options.token}`, 'Content-Type': 'application/json', ...(onUpdate ? { Accept: 'application/x-ndjson' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(signal ? { signal } : {}),
      credentials: 'omit',
      redirect: 'error',
    });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Empty HDL service response');
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let text = '';
    let bytes = 0,
      sequence = 0,
      complete = false;
    let result: T | undefined;
    const streaming = response.ok && response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() === 'application/x-ndjson';
    const updates = createHDLUpdateReceiver((update) => onUpdate?.(update), signal);
    const consume = (line: string): void => {
      if (new TextEncoder().encode(line).byteLength > 2 * 1024 * 1024) throw new Error('HDL stream frame limit exceeded');
      const event = JSON.parse(line) as Record<string, unknown>;
      if (complete || event.sequence !== ++sequence || sequence > 4098) throw new Error('Invalid HDL stream sequence');
      if (event.type === 'update') updates.receive(event.update);
      else if (event.type === 'result') {
        complete = true;
        result = event.result as T;
      } else if (event.type === 'error') throw new Error(typeof event.error === 'string' ? event.error : 'HDL stream failed');
      else throw new Error('Invalid HDL stream event');
    };
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > (streaming ? 4 : 2) * 1024 * 1024) {
          await reader.cancel();
          throw new Error('HDL service response too large');
        }
        text += decoder.decode(value, { stream: true });
        if (streaming) {
          let end: number;
          while ((end = text.indexOf('\n')) >= 0) {
            consume(text.slice(0, end));
            text = text.slice(end + 1);
          }
          if (new TextEncoder().encode(text).byteLength > 2 * 1024 * 1024) throw new Error('HDL stream frame limit exceeded');
        }
      }
      text += decoder.decode();
    } catch (error) {
      await reader.cancel().catch(() => undefined);
      throw error;
    } finally {
      updates.close();
      reader.releaseLock();
    }
    if (streaming) {
      if (text.trim()) consume(text);
      if (!complete || result === undefined) throw new Error('Incomplete HDL result stream');
      return result;
    }
    const data = JSON.parse(text) as T & { error?: string; code?: string };
    if (!response.ok) {
      if (data.code === 'execution-queue-limit' || data.code === 'execution-cancelled' || data.code === 'execution-timeout')
        throw new MarkdownExecutionError(data.code, data.error ?? `HDL service returned ${response.status}`);
      throw new Error(data.error ?? `HDL service returned ${response.status}`);
    }
    return data;
  };
  const session = async (kind: 'batch' | 'interactive', context: MarkdownDocumentContext, request?: HDLInteractiveRequest) => {
    const created = await call<{ id: string }>('sessions', 'POST', { kind, ...(request ? { request } : {}) }, context.signal);
    if (!/^[a-f0-9-]{36}$/.test(created.id)) throw new Error('Invalid HDL service session');
    let disposal: Promise<void> | undefined;
    const dispose = (): Promise<void> => {
      if (!disposal) {
        context.signal?.removeEventListener('abort', abort);
        disposal = call<void>(`sessions/${created.id}`, 'DELETE');
      }
      return disposal;
    };
    const abort = () => {
      void dispose().catch(() => undefined);
    };
    context.signal?.addEventListener('abort', abort, { once: true });
    if (context.signal?.aborted) {
      await dispose();
      throw new Error('HDL session cancelled');
    }
    return {
      dispose,
      invoke: <T>(action: string, body: unknown, context: MarkdownDocumentContext): Promise<T> => {
        if (disposal) return Promise.reject(new Error('HDL service session closed'));
        return call<T>(`sessions/${created.id}/${action}`, 'POST', body, context.signal, context.onHDLUpdate);
      },
    };
  };
  return {
    capabilities: () => call<HDLBackendCapabilities>('capabilities', 'GET'),
    async createSession(context) {
      const remote = await session('batch', context);
      return { dispose: remote.dispose, execute: (request: HDLExecutionRequest, context: MarkdownDocumentContext) => remote.invoke<HDLExecutionResult>('execute', request, context) };
    },
    async createInteractiveSession(request, context) {
      const remote = await session('interactive', context, request);
      return { dispose: remote.dispose, step: (request: HDLInteractiveStep, context: MarkdownDocumentContext) => remote.invoke<HDLInteractiveResult>('step', request, context) };
    },
  };
};
