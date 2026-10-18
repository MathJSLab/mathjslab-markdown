import assert from 'node:assert/strict';
import { createServer, request as httpRequest } from 'node:http';
import { mkdtemp, readdir, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createNativeHDLExecutor, createHDLHTTPHandler } from '../../dist/source/markdown-hdl-node.js';
import { createHTTPHDLExecutor } from '../../dist/source/markdown-hdl.js';

const token = 'a'.repeat(64);
const origin = 'http://localhost:8080';
const request = { language: 'vhdl', operation: 'simulate', top: 'tb', files: [{ name: 'tb.vhd', source: 'entity tb is end;architecture test of tb is begin end;' }] };
const serve = async (executor, options = {}) => {
  const handler = createHDLHTTPHandler(executor, { token, allowedOrigins: [origin], ...options });
  const server = createServer((request, response) => {
    void handler.handle(request, response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    endpoint: `http://127.0.0.1:${server.address().port}/hdl`,
    snapshot: () => handler.executionSnapshot,
    close: async () => {
      await handler.dispose();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
};

const until = async (condition) => {
  for (let i = 0; i < 100 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 5));
  assert.ok(condition());
};

for (const interactive of [false, true])
  test(`HTTP streams ordered updates before the final ${interactive ? 'step' : 'batch'} result`, async () => {
    let finish;
    const gate = new Promise((resolve) => {
      finish = resolve;
    });
    const events = [];
    const action = async (_request, context) => {
      context.onHDLUpdate?.({ type: 'progress', phase: 'simulate' });
      context.onHDLUpdate?.({ type: 'log', text: 'átomo 🎵\n' });
      await gate;
      return interactive ? { timeNs: 10, values: { y: '1' } } : { status: 'success', logs: 'final' };
    };
    const service = await serve({ createSession: () => ({ execute: action, dispose: () => {} }), createInteractiveSession: () => ({ step: action, dispose: () => {} }) });
    const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token });
    const session = interactive ? await client.createInteractiveSession({}, {}) : await client.createSession({});
    try {
      let completed = false;
      const job = (
        interactive ? session.step({ advanceNs: 10, inputs: {} }, { onHDLUpdate: (event) => events.push(event) }) : session.execute(request, { onHDLUpdate: (event) => events.push(event) })
      ).then((result) => {
        completed = true;
        return result;
      });
      await until(() => events.length === 2);
      assert.equal(completed, false);
      assert.equal(events[1].text, 'átomo 🎵\n');
      finish();
      const result = await job;
      assert.equal(interactive ? result.timeNs : result.status, interactive ? 10 : 'success');
    } finally {
      finish();
      await session.dispose();
      await service.close();
    }
  });

test('HTTP refuses a successful final result after the producer swallows a broken update', async () => {
  const service = await serve({
    createSession: () => ({
      execute: (_request, context) => {
        context.onHDLUpdate?.({ type: 'log', text: 'started' });
        try {
          context.onHDLUpdate?.({ type: 'log', text: 1 });
        } catch {
          /* Broken producer. */
        }
        return { status: 'success' };
      },
      dispose: () => {},
    }),
  });
  const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token }),
    session = await client.createSession({});
  try {
    await assert.rejects(session.execute(request, { onHDLUpdate: () => {} }), /Invalid HDL update/);
  } finally {
    await session.dispose();
    await service.close();
  }
});

test('HTTP streaming cancellation releases an active session while its final result is pending', async () => {
  let disposed = 0;
  const service = await serve({
    createSession: () => ({
      execute: (_request, context) => {
        context.onHDLUpdate?.({ type: 'log', text: 'started' });
        return new Promise(() => {});
      },
      dispose: () => {
        disposed++;
      },
    }),
  });
  const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token }),
    controller = new AbortController();
  const session = await client.createSession({});
  let received = false;
  try {
    const job = session.execute(request, {
      signal: controller.signal,
      onHDLUpdate: () => {
        received = true;
      },
    });
    const aborted = assert.rejects(job);
    await until(() => received);
    controller.abort();
    await aborted;
    await until(() => disposed === 1);
  } finally {
    await session.dispose();
    await service.close();
  }
});

for (const packets of [
  [{ sequence: 2, type: 'update', update: { type: 'log', text: 'bad' } }],
  [{ sequence: 1, type: 'update', update: { type: 'vcd', text: 3 } }],
  [{ sequence: 1, type: 'update', update: { type: 'log', text: 'unfinished' } }],
  [
    { sequence: 1, type: 'result', result: { status: 'success' } },
    { sequence: 2, type: 'update', update: { type: 'log', text: 'late' } },
  ],
  [{ sequence: 1, type: 'error', error: 'compiler failed' }],
])
  test(`HTTP rejects invalid/truncated streams: ${JSON.stringify(packets)}`, async () => {
    let calls = 0;
    const client = createHTTPHDLExecutor({
      endpoint: 'http://localhost/hdl',
      token,
      fetch: async () => {
        calls++;
        return calls === 1
          ? new Response(JSON.stringify({ id: 'a'.repeat(36) }))
          : calls === 2
            ? new Response(packets.map((packet) => JSON.stringify(packet)).join('\n') + '\n', { headers: { 'Content-Type': 'application/x-ndjson' } })
            : new Response('null');
      },
    });
    const session = await client.createSession({});
    await assert.rejects(session.execute(request, { onHDLUpdate: () => {} }));
    await session.dispose();
  });

for (const wholeResponse of [false, true])
  test(`HTTP bounds streaming ${wholeResponse ? 'response bytes' : 'complete frames'} and cancels the reader`, async () => {
    let calls = 0,
      cancelled = 0;
    const wire = wholeResponse ? 'x'.repeat(4 * 1024 * 1024 + 1) : JSON.stringify({ sequence: 1, type: 'result', result: { logs: 'x'.repeat(2 * 1024 * 1024 + 1) } }) + '\n';
    const client = createHTTPHDLExecutor({
      endpoint: 'http://localhost/hdl',
      token,
      fetch: async () => {
        calls++;
        if (calls === 1) return new Response(JSON.stringify({ id: 'a'.repeat(36) }));
        if (calls === 3) return new Response('null');
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(wire));
            },
            cancel() {
              cancelled++;
            },
          }),
          { headers: { 'Content-Type': 'application/x-ndjson' } },
        );
      },
    });
    const session = await client.createSession({});
    await assert.rejects(session.execute(request, { onHDLUpdate: () => {} }), wholeResponse ? /response too large/ : /frame limit/);
    assert.equal(cancelled, 1);
    await session.dispose();
  });

test('HTTP decodes arbitrary UTF-8 frame boundaries and falls back to legacy JSON', async () => {
  for (const streaming of [false, true]) {
    let calls = 0;
    const events = [];
    const wire = streaming
      ? JSON.stringify({ sequence: 1, type: 'update', update: { type: 'log', text: 'á🎵' } }) + '\n' + JSON.stringify({ sequence: 2, type: 'result', result: { status: 'success' } })
      : JSON.stringify({ status: 'success' });
    const bytes = new TextEncoder().encode(wire);
    const client = createHTTPHDLExecutor({
      endpoint: 'http://localhost/hdl',
      token,
      fetch: async () => {
        calls++;
        if (calls === 1) return new Response(JSON.stringify({ id: 'a'.repeat(36) }));
        if (calls === 3) return new Response('null');
        return new Response(
          new ReadableStream({
            start(controller) {
              for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
              controller.close();
            },
          }),
          { headers: { 'Content-Type': streaming ? 'application/x-ndjson' : 'application/json' } },
        );
      },
    });
    const session = await client.createSession({});
    assert.equal((await session.execute(request, { onHDLUpdate: (event) => events.push(event) })).status, 'success');
    assert.deepEqual(events, streaming ? [{ type: 'log', text: 'á🎵' }] : []);
    await session.dispose();
  }
});

test('HTTP scheduling bounds execution across clients and rejects overflowing queues', async () => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let starts = 0;
  const service = await serve(
    {
      createSession: () => ({
        execute: async () => {
          starts++;
          await gate;
          return { status: 'success' };
        },
        dispose: () => {},
      }),
    },
    { executionScheduling: { maxConcurrent: 1, maxQueued: 1 } },
  );
  const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token });
  const sessions = [];
  try {
    for (let i = 0; i < 3; i++) sessions.push(await client.createSession({}));
    const first = sessions[0].execute(request, {});
    await until(() => starts === 1);
    const second = sessions[1].execute(request, {});
    await until(() => service.snapshot().queued === 1);
    await assert.rejects(sessions[2].execute(request, {}), { code: 'execution-queue-limit' });
    assert.equal(starts, 1);
    release();
    await Promise.all([first, second]);
    assert.equal(starts, 2);
  } finally {
    release();
    await Promise.all(sessions.map((session) => session.dispose()));
    await service.close();
  }
});

test('HTTP queued cancellation does not execute and cleanup holds the host slot', async () => {
  let releaseCleanup;
  const cleanup = new Promise((resolve) => {
    releaseCleanup = resolve;
  });
  let starts = 0,
    disposals = 0;
  const service = await serve(
    {
      createSession: () => ({
        execute: () => {
          starts++;
          return starts === 1 ? new Promise(() => {}) : { status: 'success' };
        },
        dispose: async () => {
          disposals++;
          if (disposals === 1) await cleanup;
        },
      }),
    },
    { executionScheduling: { maxConcurrent: 1 } },
  );
  const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token });
  const first = await client.createSession({}),
    queued = await client.createSession({}),
    next = await client.createSession({});
  try {
    const executing = first.execute(request, {}).catch(() => undefined);
    await until(() => starts === 1);
    const waiting = queued.execute(request, {}).catch(() => undefined);
    await until(() => service.snapshot().queued === 1);
    const closing = first.dispose();
    await until(() => disposals === 1);
    await queued.dispose();
    await waiting;
    const following = next.execute(request, {});
    await until(() => service.snapshot().queued === 1);
    assert.equal(starts, 1);
    releaseCleanup();
    await closing;
    await executing;
    assert.equal((await following).status, 'success');
    assert.equal(starts, 2);
  } finally {
    releaseCleanup();
    await Promise.all([first.dispose(), queued.dispose(), next.dispose()]);
    await service.close();
  }
});

test('HTTP late cancelled acquisitions retain the session quota until disposed', async () => {
  let arrive;
  const acquisition = new Promise((resolve) => {
    arrive = resolve;
  });
  let started = false,
    disposals = 0;
  const service = await serve(
    {
      createSession: () => {
        started = true;
        return acquisition;
      },
    },
    { maxSessions: 1 },
  );
  const controller = new AbortController();
  const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token });
  const creating = client.createSession({ signal: controller.signal }).catch(() => undefined);
  try {
    await until(() => started);
    controller.abort();
    await creating;
    await new Promise((resolve) => setTimeout(resolve, 20));
    await assert.rejects(client.createSession({}), /session limit/);
    arrive({
      execute: () => ({ status: 'success' }),
      dispose: () => {
        disposals++;
      },
    });
    await until(() => disposals === 1);
  } finally {
    arrive({
      execute: () => ({ status: 'success' }),
      dispose: () => {
        disposals++;
      },
    });
    await service.close();
  }
});

test('native authorization, limits and missing executables fail explicitly and clean work directories', async () => {
  assert.throws(() => createNativeHDLExecutor({ allowNativeExecution: false }));
  assert.throws(() => createNativeHDLExecutor({ allowNativeExecution: true, timeoutMs: Infinity }));
  const directory = await mkdtemp(path.join(tmpdir(), 'hdl-test-'));
  try {
    const missing = path.join(directory, 'not-installed');
    const executor = createNativeHDLExecutor({ allowNativeExecution: true, temporaryDirectory: directory, ghdl: missing, iverilog: missing, vvp: missing, yosys: missing });
    const capabilities = await executor.capabilities();
    assert.equal(capabilities.languages.vhdl.simulate, false);
    assert.equal(capabilities.languages.verilog.interactive, false);
    const session = await executor.createSession({});
    const result = await session.execute(request, {});
    assert.equal(result.status, 'error');
    assert.match(result.logs, /ENOENT/);
    assert.equal(result.diagnostics[0].severity, 'error');
    await Promise.all([session.dispose(), session.dispose()]);
    assert.deepEqual(await readdir(directory), []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('native boundary validates filenames, language and cancellation independently of Markdown', async () => {
  const executor = createNativeHDLExecutor({ allowNativeExecution: true });
  for (const bad of [
    { ...request, language: 'shell' },
    { ...request, files: [{ name: '../tb.vhd', source: 'bad' }] },
    { ...request, files: [{ name: 'markdown_capture.vhd', source: 'bad' }] },
  ]) {
    const session = await executor.createSession({});
    assert.equal((await session.execute(bad, {})).status, 'error');
    await session.dispose();
  }
  const controller = new AbortController();
  controller.abort();
  const session = await executor.createSession({ signal: controller.signal });
  assert.equal((await session.execute(request, {})).status, 'cancelled');
  await session.dispose();
});

test('HTTP service denies unauthorized origins/tokens and supports bounded sessions', async () => {
  let released = 0;
  const executor = {
    capabilities: async () => ({ languages: {} }),
    createSession: async () => ({
      execute: async () => ({ status: 'success', logs: '<b>plain text</b>' }),
      dispose: async () => {
        released++;
      },
    }),
  };
  const service = await serve(executor, { maxSessions: 1 });
  try {
    assert.equal((await fetch(`${service.endpoint}/capabilities`)).status, 401);
    assert.equal((await fetch(`${service.endpoint}/capabilities`, { headers: { Origin: 'https://other.test', Authorization: `Bearer ${token}` } })).status, 403);
    const preflight = await fetch(`${service.endpoint}/sessions`, { method: 'OPTIONS', headers: { Origin: origin } });
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
    const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token });
    const session = await client.createSession({});
    await assert.rejects(client.createSession({}), /session limit/);
    assert.deepEqual(await session.execute(request, {}), { status: 'success', logs: '<b>plain text</b>' });
    await Promise.all([session.dispose(), session.dispose()]);
    assert.equal(released, 1);
    const replacement = await client.createSession({});
    await replacement.dispose();
  } finally {
    await service.close();
  }
});

test('HTTP disconnect cancels native work and service disposal waits for cleanup', async () => {
  let entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  let released = 0;
  const executor = {
    capabilities: async () => ({}),
    createSession: async () => ({
      execute: async (_request, context) => {
        entered();
        await new Promise((resolve) => context.signal.addEventListener('abort', resolve, { once: true }));
        return { status: 'cancelled' };
      },
      dispose: async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        released++;
      },
    }),
  };
  const service = await serve(executor);
  const controller = new AbortController();
  const client = createHTTPHDLExecutor({ endpoint: service.endpoint, token });
  const session = await client.createSession({ signal: controller.signal });
  const job = session.execute(request, { signal: controller.signal });
  await started;
  controller.abort();
  await assert.rejects(job);
  await session.dispose();
  assert.equal(released, 1, 'client disposal waits for cleanup already started by disconnect');
  await service.close();
  assert.equal(released, 1);
});

test('HTTP concurrent actions, invalid JSON and oversized bodies are rejected', async () => {
  let resolveJob;
  const executor = {
    capabilities: async () => ({}),
    createSession: async () => ({
      execute: () =>
        new Promise((resolve) => {
          resolveJob = resolve;
        }),
      dispose() {
        resolveJob?.({ status: 'cancelled' });
      },
    }),
  };
  const service = await serve(executor);
  try {
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    assert.equal((await fetch(`${service.endpoint}/sessions`, { method: 'POST', headers, body: '[' })).status, 400);
    assert.equal((await fetch(`${service.endpoint}/sessions`, { method: 'POST', headers, body: 'x'.repeat(256 * 1024 + 1) })).status, 413);
    const { id } = await (await fetch(`${service.endpoint}/sessions`, { method: 'POST', headers, body: '{"kind":"batch"}' })).json();
    const job = fetch(`${service.endpoint}/sessions/${id}/execute`, { method: 'POST', headers, body: JSON.stringify(request) });
    while (!resolveJob) await new Promise((resolve) => setTimeout(resolve, 5));
    assert.equal((await fetch(`${service.endpoint}/sessions/${id}/execute`, { method: 'POST', headers, body: JSON.stringify(request) })).status, 409);
    resolveJob({ status: 'success' });
    assert.equal((await job).status, 200);
  } finally {
    await service.close();
  }
});

test('browser HDL entry never imports Node tools and is independently configurable', async () => {
  assert.throws(() => createHTTPHDLExecutor({ endpoint: 'file:///tmp', token }));
  assert.throws(() => createHTTPHDLExecutor({ endpoint: 'https://user:pass@example.test/', token }));
  const source = await readFile(new URL('../../dist/source/markdown-hdl.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /nativeExecutor|node:/);
});

test('HTTP transport bounds responses before buffering arbitrary output', async () => {
  let cancelled = false;
  const client = createHTTPHDLExecutor({
    endpoint: 'https://hdl.test/',
    token,
    fetch: async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(2 * 1024 * 1024 + 1));
          },
          cancel() {
            cancelled = true;
          },
        }),
      ),
  });
  await assert.rejects(client.capabilities(), /response too large/);
  assert.equal(cancelled, true);
});

test('HTTP JSON preserves Unicode HDL source split across network chunks', async () => {
  const executor = { capabilities: async () => ({}), createSession: async () => ({ execute: async (request) => ({ status: 'success', logs: request.files[0].source }), dispose() {} }) };
  const service = await serve(executor);
  try {
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const { id } = await (await fetch(`${service.endpoint}/sessions`, { method: 'POST', headers, body: '{"kind":"batch"}' })).json();
    const source = '-- átomo e tensão';
    const body = new TextEncoder().encode(JSON.stringify({ ...request, files: [{ name: 'tb.vhd', source }] }));
    const split = body.indexOf(0xc3) + 1;
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(body.slice(0, split));
        await new Promise((resolve) => setTimeout(resolve, 10));
        controller.enqueue(body.slice(split));
        controller.close();
      },
    });
    const response = await fetch(`${service.endpoint}/sessions/${id}/execute`, { method: 'POST', headers, body: stream, duplex: 'half' });
    assert.equal((await response.json()).logs, source);
  } finally {
    await service.close();
  }
});

test('sessions being released retain their quota and concurrent DELETE waits for the same cleanup', async () => {
  let release;
  let began;
  const started = new Promise((resolve) => {
    began = resolve;
  });
  const executor = {
    capabilities: async () => ({}),
    createSession: async () => ({
      execute: async () => ({ status: 'success' }),
      dispose: () =>
        new Promise((resolve) => {
          release = resolve;
          began();
        }),
    }),
  };
  const service = await serve(executor, { maxSessions: 1 });
  try {
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const { id } = await (await fetch(`${service.endpoint}/sessions`, { method: 'POST', headers, body: '{"kind":"batch"}' })).json();
    let firstDone = false;
    let secondDone = false;
    const first = fetch(`${service.endpoint}/sessions/${id}`, { method: 'DELETE', headers }).then(() => {
      firstDone = true;
    });
    await started;
    const second = fetch(`${service.endpoint}/sessions/${id}`, { method: 'DELETE', headers }).then(() => {
      secondDone = true;
    });
    const replacement = await fetch(`${service.endpoint}/sessions`, { method: 'POST', headers, body: '{"kind":"batch"}' });
    assert.equal(replacement.status, 429);
    assert.equal(firstDone, false);
    assert.equal(secondDone, false);
    release();
    await Promise.all([first, second]);
    assert.equal(secondDone, true);
  } finally {
    release?.();
    await service.close();
  }
});

test('service shutdown releases incomplete HTTP bodies instead of waiting for clients', async () => {
  const service = await serve({
    capabilities: async () => ({}),
    createSession: async () => {
      throw new Error('not reached');
    },
  });
  const connection = httpRequest(`${service.endpoint}/sessions`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const disconnected = new Promise((resolve) => connection.on('error', resolve));
  connection.flushHeaders();
  connection.write('{');
  await new Promise((resolve) => setTimeout(resolve, 20));
  await service.close();
  await disconnected;
});
