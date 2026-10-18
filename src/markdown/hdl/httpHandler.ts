import { createHDLUpdateReceiver } from './updates.js';
import { createMarkdownExecutionScheduler, MarkdownExecutionError, type MarkdownExecutionSchedulerOptions } from '../execution/scheduler.js';
import { ManagedExecutionSession } from '../execution/session.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import type { HDLBackendExecutor } from './backend.js';
import type { HDLExecutionRequest, HDLExecutionSession } from '../extensions/hdl/executor.js';
import type { HDLInteractiveRequest, HDLInteractiveSession, HDLInteractiveStep } from '../extensions/hdl-interactive/executor.js';

export type HDLHTTPHandlerOptions = Readonly<{
  token: string;
  allowedOrigins: readonly string[];
  basePath?: string;
  maxSessions?: number;
  executionScheduling?: MarkdownExecutionSchedulerOptions;
  idleTimeoutMs?: number;
}>;
/** Host must bind to loopback, or supply authenticated OS-isolated infrastructure. */
export const createHDLHTTPHandler = (executor: HDLBackendExecutor, options: HDLHTTPHandlerOptions) => {
  if (options.token.length < 32) throw new Error('HDL service requires a token of at least 32 characters');
  const maxSessions = options.maxSessions ?? 8;
  const idleTimeout = options.idleTimeoutMs ?? 300_000;
  if (!Number.isInteger(maxSessions) || maxSessions < 1 || maxSessions > 64 || !Number.isFinite(idleTimeout) || idleTimeout < 100 || idleTimeout > 3_600_000)
    throw new Error('Invalid HDL service limits');
  const prefix = (options.basePath ?? '/hdl').replace(/\/$/, '');
  const executionScheduler = createMarkdownExecutionScheduler(options.executionScheduling);
  const sessions = new Map<
    string,
    {
      lease: ManagedExecutionSession<HDLExecutionSession | HDLInteractiveSession>;
      kind: string;
      resource: HDLExecutionSession | HDLInteractiveSession;
      controller: AbortController;
      busy: boolean;
      touched: number;
    }
  >();
  const clearing = new Map<string, Promise<void>>();
  const connections = new Set<IncomingMessage>();
  let creating = 0;
  let closed = false;
  const pending = new Set<Promise<unknown>>();
  const track = <T>(promise: Promise<T>): Promise<T> => {
    pending.add(promise);
    void promise.finally(() => pending.delete(promise)).catch(() => undefined);
    return promise;
  };
  const remove = (id: string): Promise<void> => {
    const existing = clearing.get(id);
    if (existing) return existing;
    const session = sessions.get(id);
    if (!session) return Promise.resolve();
    sessions.delete(id);
    const disposal = track(
      Promise.resolve().then(() => {
        session.controller.abort();
        return session.lease.dispose();
      }),
    );
    clearing.set(id, disposal);
    void disposal.finally(() => clearing.delete(id)).catch(() => undefined);
    return disposal;
  };
  const timer = setInterval(
    () => {
      for (const [id, session] of sessions) if (!session.busy && Date.now() - session.touched > idleTimeout) void remove(id).catch(() => undefined);
    },
    Math.min(idleTimeout, 1000),
  );
  timer.unref();
  const send = (response: ServerResponse, code: number, value: unknown) => {
    if (response.destroyed) return;
    const body = JSON.stringify(value);
    if (Buffer.byteLength(body) > 2 * 1024 * 1024) {
      response.writeHead(413, { 'Content-Type': 'application/json' });
      response.end('{"error":"HDL response limit exceeded"}');
      return;
    }
    response.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(body);
  };
  const handle = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const origin = request.headers.origin;
    if (origin && !options.allowedOrigins.includes(origin)) {
      send(response, 403, { error: 'HDL origin denied' });
      return;
    }
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
    }
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
      response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      response.writeHead(204);
      response.end();
      return;
    }
    const actual = Buffer.from(request.headers.authorization ?? '');
    const expected = Buffer.from(`Bearer ${options.token}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      send(response, 401, { error: 'HDL authorization required' });
      return;
    }
    if (closed) {
      send(response, 503, { error: 'HDL service closed' });
      return;
    }
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    const route = pathname.startsWith(prefix + '/') ? pathname.slice(prefix.length + 1).split('/') : [];
    try {
      if (request.method === 'GET' && route.length === 1 && route[0] === 'capabilities') {
        send(response, 200, await executor.capabilities());
        return;
      }
      if (route[0] !== 'sessions') {
        send(response, 404, { error: 'Unknown HDL route' });
        return;
      }
      if (request.method === 'DELETE' && route.length === 2) {
        await remove(route[1]!);
        send(response, 200, null);
        return;
      }
      if (request.method !== 'POST' || request.headers['content-type']?.split(';')[0] !== 'application/json') {
        send(response, 400, { error: 'Expected HDL JSON request' });
        return;
      }
      const chunks: Buffer[] = [];
      let bytes = 0;
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 256 * 1024) {
          send(response, 413, { error: 'HDL request limit exceeded' });
          return;
        }
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString('utf8');
      const data = JSON.parse(text) as Record<string, unknown>;
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('HDL request must be an object');
      if (route.length === 1) {
        if (sessions.size + creating + clearing.size >= maxSessions) {
          send(response, 429, { error: 'HDL session limit exceeded' });
          return;
        }
        if (data.kind !== 'batch' && data.kind !== 'interactive') throw new Error('Unknown HDL session kind');
        if (Object.keys(data).some((key) => !['kind', 'request'].includes(key))) throw new Error('Unsupported HDL session field');
        const controller = new AbortController();
        const disconnected = () => controller.abort();
        response.once('close', disconnected);
        creating++;
        const lease = new ManagedExecutionSession<HDLExecutionSession | HDLInteractiveSession>(controller.signal);
        try {
          const resource = await lease.run(
            { executionScheduler, executionOwner: controller },
            async (active) => {
              const resource = data.kind === 'batch' ? await executor.createSession(active) : await executor.createInteractiveSession?.(data.request as HDLInteractiveRequest, active);
              if (!resource) throw new Error('Interactive HDL unavailable');
              return resource;
            },
            (resource) => resource,
          );
          if (!resource) throw new Error('Interactive HDL unavailable');
          if (closed || controller.signal.aborted || response.destroyed) {
            await lease.dispose();
            return;
          }
          const id = randomUUID();
          sessions.set(id, { lease, kind: data.kind, resource, controller, busy: false, touched: Date.now() });
          response.removeListener('close', disconnected);
          send(response, 201, { id });
        } catch (error) {
          await lease.dispose();
          throw error;
        } finally {
          await lease.waitForIdle();
          creating--;
          response.removeListener('close', disconnected);
        }
        return;
      }
      const session = sessions.get(route[1]!);
      if (!session || route.length !== 3) {
        send(response, 404, { error: 'HDL session not found' });
        return;
      }
      if (session.busy) {
        send(response, 409, { error: 'HDL session busy' });
        return;
      }
      const disconnected = () => {
        void remove(route[1]!).catch(() => undefined);
      };
      response.once('close', disconnected);
      session.busy = true;
      const streaming = request.headers.accept?.split(',').some((value) => value.trim() === 'application/x-ndjson') === true;
      let sequence = 0;
      const stream = (value: unknown): void => {
        if (response.destroyed) return;
        const line = JSON.stringify({ sequence: ++sequence, ...(value as object) }) + '\n';
        if (Buffer.byteLength(line) > 2 * 1024 * 1024 || response.writableLength + Buffer.byteLength(line) > 2 * 1024 * 1024) throw new Error('HDL stream backpressure limit exceeded');
        if (!response.headersSent) response.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' });
        response.write(line);
      };
      const updates = createHDLUpdateReceiver((update) => stream({ type: 'update', update }), session.controller.signal);
      try {
        const result = await session.lease.run(
          { executionScheduler, executionOwner: session, ...(streaming ? { onHDLUpdate: (update) => updates.receive(update) } : {}) },
          () => session.resource,
          async (resource, active) => {
            if (session.kind === 'batch' && route[2] === 'execute') return (resource as HDLExecutionSession).execute(data as unknown as HDLExecutionRequest, active);
            if (session.kind === 'interactive' && route[2] === 'step') return (resource as HDLInteractiveSession).step(data as unknown as HDLInteractiveStep, active);
            throw new Error('Invalid HDL session action');
          },
        );
        response.removeListener('close', disconnected);
        updates.finish();
        updates.close();
        if (streaming) {
          stream({ type: 'result', result });
          response.end();
        } else send(response, 200, result);
      } catch (error) {
        if (response.headersSent) {
          response.end(JSON.stringify({ sequence: ++sequence, type: 'error', error: error instanceof Error ? error.message.slice(0, 4096) : 'HDL stream failed' }) + '\n');
        } else throw error;
      } finally {
        updates.close();
        session.busy = false;
        session.touched = Date.now();
        response.removeListener('close', disconnected);
      }
    } catch (error) {
      send(response, error instanceof MarkdownExecutionError && error.code === 'execution-queue-limit' ? 429 : 400, {
        error: error instanceof Error ? error.message.slice(0, 4096) : 'HDL service error',
        ...(error instanceof MarkdownExecutionError ? { code: error.code } : {}),
      });
    }
  };
  return {
    get executionSnapshot() {
      return executionScheduler.snapshot;
    },
    handle: (request: IncomingMessage, response: ServerResponse): Promise<void> => {
      connections.add(request);
      return track(handle(request, response).finally(() => connections.delete(request)));
    },
    async dispose(): Promise<void> {
      closed = true;
      clearInterval(timer);
      for (const request of connections) request.destroy();
      await Promise.allSettled([...sessions.keys()].map(remove));
      while (pending.size) await Promise.allSettled([...pending]);
      await executionScheduler.dispose();
    },
  };
};
