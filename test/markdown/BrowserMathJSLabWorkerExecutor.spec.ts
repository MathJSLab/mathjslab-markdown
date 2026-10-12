/** @jest-environment node */
import { createInProcessMathJSLabRuntime, RuntimeWorkerServer, type RuntimeInboundMessage, type RuntimeOutboundMessage } from 'mathjslab/runtime';
import { createBrowserMathJSLabWorkerExecutor } from '../../src/markdown/extensions/mathjslab/browserWorkerExecutor';
import type { MarkdownDocumentContext } from '../../src/MarkdownEngine';

// Exercise the canonical runtime protocol and interpreter, without browser timing.
class RuntimeWorker {
  public constructor(private readonly textEffects = false) {}
  private listeners = new Set<(event: MessageEvent<RuntimeOutboundMessage>) => void>();
  private receive?: (event: MessageEvent<RuntimeInboundMessage>) => void;
  private readonly server = new RuntimeWorkerServer(
    {
      postMessage: (data) => queueMicrotask(() => this.listeners.forEach((listener) => listener({ data } as MessageEvent<RuntimeOutboundMessage>))),
      addEventListener: (_type, listener) => {
        this.receive = listener;
      },
      removeEventListener: () => {
        this.receive = undefined;
      },
    },
    (host) =>
      createInProcessMathJSLabRuntime({
        host,
        evaluate: (_interpreter, operation) => ({ value: operation(), outputs: this.textEffects ? [{ type: 'text', text: 'Independent output' }] : [] }),
      }),
  );
  public terminated = false;
  public postMessage(data: RuntimeInboundMessage): void {
    queueMicrotask(() => this.receive?.({ data } as MessageEvent<RuntimeInboundMessage>));
  }
  public addEventListener(type: string, listener: (event: MessageEvent<RuntimeOutboundMessage>) => void): void {
    if (type === 'message') this.listeners.add(listener);
  }
  public removeEventListener(type: string, listener: (event: MessageEvent<RuntimeOutboundMessage>) => void): void {
    if (type === 'message') this.listeners.delete(listener);
  }
  public terminate(): void {
    this.terminated = true;
    this.listeners.clear();
    void this.server.dispose();
  }
}

const setup = (textEffects = false) => {
  const workers: RuntimeWorker[] = [];
  const executor = createBrowserMathJSLabWorkerExecutor({
    toMathML: (source) => source,
    workerFactory: () => {
      const worker = new RuntimeWorker(textEffects);
      workers.push(worker);
      return worker as unknown as Worker;
    },
  });
  return { executor, workers };
};
const context: MarkdownDocumentContext = {};
const statementContext = { ...context, blockIndex: 0, statementIndex: 0 };

describe('MathJSLab 2.9.0 browser adapter', () => {
  test('retains independent text effects alongside the MathML value', async () => {
    const { executor } = setup(true);
    try {
      const session = await executor.createSession(context);
      const result = await session.execute('1+1', statementContext);
      expect(result.status).toBe('success');
      expect(result.outputs).toContainEqual({ type: 'text', text: 'Independent output' });
      expect(result.outputs?.filter((output) => output.type === 'mathml')).toHaveLength(1);
    } finally {
      await executor.dispose?.();
    }
  });
  test('preserves suppression, compound statements and empty blocks', async () => {
    const { executor } = setup();
    try {
      const session = await executor.createSession(context);
      expect((await session.parse('a=1; b=2;', context)).statements).toEqual(['a=1;', 'b=2;']);
      expect((await session.parse('a=1, b=2', context)).statements).toEqual(['a=1', 'b=2']);
      expect((await session.parse('', context)).statements).toEqual([]);
      expect((await session.parse('% comment', context)).statements).toEqual([]);
      const source = 'for k=1:2\n a=k;\nend; b=a';
      const parsed = await session.parse(source, context);
      expect(parsed.statements).toHaveLength(2);
      expect(parsed.statements[0]).toContain('end;');
      for (const statement of parsed.statements) expect((await session.execute(statement, statementContext)).status).toBe('success');
    } finally {
      await executor.dispose?.();
    }
  });

  test('executes paired statistics and keeps state isolated between documents', async () => {
    const { executor } = setup();
    try {
      const first = await executor.createSession(context);
      const second = await executor.createSession(context);
      expect((await first.execute('[v,m]=var([1,2,3],0,2);', statementContext)).status).toBe('success');
      const result = await first.execute('[v,m]', statementContext);
      expect(result.status).toBe('success');
      expect(result.outputs?.map((output) => output.type)).toEqual(['mathml']);
      expect(result.outputs?.[0]).toMatchObject({ markup: expect.stringContaining('<mn>2</mn>') });
      expect((await second.execute('v', statementContext)).status).toBe('error');
    } finally {
      await executor.dispose?.();
    }
  });

  test('forwards document resource policy and retains loaded-script text', async () => {
    const { executor } = setup();
    const references: string[] = [];
    const activeContext = {
      ...context,
      resources: {
        async readText(reference: string) {
          references.push(reference);
          return 'x=42;';
        },
      },
    } as MarkdownDocumentContext;
    try {
      const session = await executor.createSession(activeContext);
      const result = await session.execute("load('lesson.m')", { ...activeContext, blockIndex: 0, statementIndex: 0 });
      expect(result.status).toBe('success');
      expect(references).toEqual(['lesson.m']);
      expect(result.outputs).toContainEqual({ type: 'text', text: 'Loaded script from lesson.m' });
      expect((await session.execute('x', statementContext)).status).toBe('success');
    } finally {
      await executor.dispose?.();
    }
  });

  test('preserves busy errors, cancellation and idempotent disposal', async () => {
    const { executor, workers } = setup();
    let started!: () => void;
    const reading = new Promise<void>((resolve) => {
      started = resolve;
    });
    const activeContext = {
      resources: {
        readText(_reference: string, options: MarkdownDocumentContext) {
          started();
          return new Promise<string>((_resolve, reject) => options.signal?.addEventListener('abort', () => reject(options.signal?.reason), { once: true }));
        },
      },
    } as MarkdownDocumentContext;
    try {
      const session = await executor.createSession(activeContext);
      const execution = session.execute("load('pending.m')", { ...activeContext, blockIndex: 0, statementIndex: 0 });
      await reading;
      const busy = await session.execute('1', statementContext);
      expect(busy.status).toBe('error');
      expect(busy.error).toMatchObject({ code: 'MATHJSLAB_SESSION_BUSY' });
      await expect(session.parse('1', context)).rejects.toMatchObject({ code: 'MATHJSLAB_SESSION_BUSY' });
      await Promise.all([session.dispose?.(), session.dispose?.()]);
      expect((await execution).status).toBe('cancelled');
      expect(workers.every((worker) => worker.terminated)).toBe(true);
      await expect(session.execute('1', statementContext)).rejects.toThrow('disposed');
    } finally {
      await executor.dispose?.();
      await executor.dispose?.();
    }
  });
});
