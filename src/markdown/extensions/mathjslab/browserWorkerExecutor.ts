import { Interpreter, type NodeInput } from 'mathjslab';
import { RemoteMathJSLabRuntime, type SessionOptions, type RuntimeDiagnostic, type RuntimeHost, type RuntimeOutput, type RuntimeWorkerEndpoint } from 'mathjslab/runtime';

import type { MarkdownDocumentContext } from '../../../MarkdownEngine.js';
import { DefaultMarkdownResourceService } from '../../security.js';
import type { MathJSLabExecutionResult, MathJSLabExecutor, MathJSLabOutput } from './executor.js';
import { materializePlotlyOutput, type MathJSLabPlotRenderer } from './plotlyOutput.js';

/** Host services and initial numeric settings for isolated document Workers. */
export type BrowserMathJSLabWorkerExecutorOptions = {
  /** Host-owned synchronous formatting; does not evaluate source. */
  readonly toMathML: MathJSLabExecutor['toMathML'];
  /** Required because the host owns the Worker implementation and its bundling. */
  readonly workerFactory: () => Worker;
  /** Default execution deadline; a document's mathjslab execution policy overrides it. */
  readonly timeoutMs?: number;
  /**
   * Copied at executor creation and independently for each document session.
   * Reset and Worker recovery restore these initial settings. In-session
   * configure calls may change the backend without changing this snapshot.
   * Omit to preserve core defaults; requires a matching core/Worker distribution.
   */
  readonly numeric?: SessionOptions['numeric'];
  /** Host-owned renderer for plot descriptions returned by the Worker. */
  readonly plotRenderer?: MathJSLabPlotRenderer;
};

let executorSequence = 0;

// Current core locations include the terminator; older locations stopped before it.
const preserveSuppression = (source: string, omitOutput: boolean): string => (omitOutput && !source.trimEnd().endsWith(';') ? `${source};` : source);

const statementSources = (interpreter: Interpreter, source: string): string[] => {
  const lines = source.split(/\r?\n/);
  const tree = interpreter.Parse(source);
  if (tree.type === 'VOID') return [];
  if (tree.type !== 'LIST') return [source];
  return tree.list.map((statement: NodeInput, index: number) => {
    const previous = tree.list[index - 1];
    const next = tree.list[index + 1];
    const startLine = lines[statement.start.line - 1] ?? '';
    const stopLine = lines[statement.stop.line - 1] ?? '';
    if (statement.stop.line === statement.start.line) {
      if ((!previous || previous.stop.line < statement.start.line) && (!next || next.start.line > statement.start.line)) return startLine;
      return preserveSuppression(startLine.substring(statement.start.column, statement.stop.column + 1), statement.omitOutput);
    }
    const middle = statement.stop.line > statement.start.line + 1 ? `${lines.slice(statement.start.line, statement.stop.line - 1).join('\n')}\n` : '';
    const start = !previous || previous.stop.line < statement.start.line ? `${startLine}\n` : `${startLine.substring(statement.start.column)}\n`;
    const stop = !next || next.start.line > statement.stop.line ? stopLine : stopLine.substring(0, statement.stop.column + 1);
    const text = `${start}${middle}${stop}`.trim();
    return preserveSuppression(text, next?.start.line === statement.stop.line && statement.omitOutput);
  });
};

const runtimeError = (diagnostics: readonly RuntimeDiagnostic[]): Error => {
  const diagnostic = diagnostics.find((item) => item.severity === 'error') ?? diagnostics[0];
  return Object.assign(new Error(diagnostics.map((item) => item.message).join('\n')), diagnostic ? { code: diagnostic.code } : {});
};

/**
 * Creates the Markdown adapter over the canonical MathJSLab runtime.
 * Each document owns a Worker session and storage. Cancellation or timeout may
 * terminate its Worker and lose workspace state; recovery uses initial options.
 * Hosts own plot nodes and their mount/resize/dispose lifecycle.
 */
export const createBrowserMathJSLabWorkerExecutor = (options: BrowserMathJSLabWorkerExecutorOptions): MathJSLabExecutor => {
  const numeric = options.numeric === undefined ? undefined : structuredClone(options.numeric);
  const contexts = new Map<string, MarkdownDocumentContext>();
  const fallbackResources = new DefaultMarkdownResourceService();
  const storage = new Map<string, Map<string, unknown>>();
  let disposal: Promise<void> | undefined;
  const host: RuntimeHost = {
    async request(effect, context) {
      const documentContext = contexts.get(context.sessionId);
      switch (effect.type) {
        case 'read-text':
          if (!documentContext) throw new Error(`Unknown Markdown runtime session: ${context.sessionId}`);
          return {
            value: await (documentContext.resources ?? fallbackResources).readText(effect.reference, {
              ...documentContext,
              ...(context.signal ? { signal: context.signal } : {}),
            }),
          };
        case 'read-binary':
          throw new Error('Binary resources are not enabled by the Markdown adapter.');
        case 'storage-get':
          return { value: storage.get(context.sessionId)?.get(effect.key) };
        case 'storage-set':
          let sessionStorage = storage.get(context.sessionId);
          if (!sessionStorage) storage.set(context.sessionId, (sessionStorage = new Map()));
          sessionStorage.set(effect.key, effect.value);
          return {};
        case 'clock-now':
          return { value: Date.now() };
        case 'delay':
          await new Promise<void>((resolve, reject) => {
            const signal = context.signal;
            const abort = (): void => {
              clearTimeout(timer);
              signal?.removeEventListener('abort', abort);
              reject(signal?.reason ?? new Error('MathJSLab delay was cancelled.'));
            };
            const timer = setTimeout(() => {
              signal?.removeEventListener('abort', abort);
              resolve();
            }, effect.milliseconds);
            if (signal?.aborted) abort();
            else signal?.addEventListener('abort', abort, { once: true });
          });
          return {};
        case 'publish-output':
          return { value: effect.output };
      }
    },
  };
  const runtime = new RemoteMathJSLabRuntime(() => options.workerFactory() as unknown as RuntimeWorkerEndpoint, { host });
  const parser = Interpreter.Create();
  const executorId = ++executorSequence;
  let sessionSequence = 0;

  const materialize = async (outputs: readonly RuntimeOutput[], suppressValue = false): Promise<readonly MathJSLabOutput[]> => {
    const result: MathJSLabOutput[] = [];
    for (const [index, output] of outputs.entries()) {
      // The runtime emits text/MathML/data representations of the same value.
      // Keep MathML for that value, and retain independent text effects.
      if (output.type === 'data' || (output.type === 'text' && outputs[index + 1]?.type === 'mathml')) continue;
      // The runtime returns a final value even for a semicolon-terminated source.
      // Suppress only that leading value group, retaining independent host effects.
      if (suppressValue && index === 1 && outputs[0]?.type === 'text' && output.type === 'mathml') continue;
      if (output.type === 'visualization') {
        if (output.renderer !== 'plotly') throw new Error(`Unsupported MathJSLab visualization renderer: ${output.renderer}`);
        result.push(
          await materializePlotlyOutput(
            {
              ...output,
              renderer: 'plotly',
              role: 'visualization',
            } as Parameters<typeof materializePlotlyOutput>[0],
            options.plotRenderer,
          ),
        );
      } else result.push(output);
    }
    return result;
  };

  return {
    toMathML: options.toMathML,
    async createSession(context) {
      if (disposal) throw new Error('MathJSLab Markdown executor is disposed.');
      const sessionId = `markdown-${executorId}-${++sessionSequence}`;
      contexts.set(sessionId, context);
      let session: Awaited<ReturnType<typeof runtime.createSession>>;
      try {
        session = await runtime.createSession({
          id: sessionId,
          parfor: 'fallback',
          ...(numeric === undefined ? {} : { numeric: structuredClone(numeric) }),
        });
      } catch (error) {
        contexts.delete(sessionId);
        storage.delete(sessionId);
        throw error;
      }
      let sessionDisposal: Promise<void> | undefined;
      return {
        async parse(source, activeContext) {
          if (sessionDisposal || disposal) throw new Error('MathJSLab Markdown session is disposed.');
          contexts.set(sessionId, activeContext);
          const result = await session.parse(source);
          if (result.diagnostics.some((item) => item.severity === 'error'))
            return {
              statements: [],
              error: runtimeError(result.diagnostics),
            };
          return { statements: statementSources(parser, source) };
        },
        async execute(statement, activeContext): Promise<MathJSLabExecutionResult> {
          if (sessionDisposal || disposal) throw new Error('MathJSLab Markdown session is disposed.');
          contexts.set(sessionId, activeContext);
          const timeoutMs = activeContext.executionPolicy?.mathjslab?.timeoutMs ?? options.timeoutMs;
          const result = await session.execute(statement, {
            ...(activeContext.signal ? { signal: activeContext.signal } : {}),
            ...(timeoutMs !== undefined ? { timeoutMs } : {}),
          });
          if (result.status === 'timeout') {
            throw Object.assign(new Error(result.diagnostics[0]?.message ?? 'MathJSLab execution timed out.'), { name: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' });
          }
          let suppressValue = false;
          if (result.status === 'success') {
            try {
              const tree = parser.Parse(statement);
              suppressValue = tree.type === 'LIST' && (tree.list.at(-1)?.omitOutput ?? false);
            } catch {
              // The remote runtime remains the authority for parse diagnostics.
            }
          }
          return {
            status: result.status,
            state: result.status === 'success' ? 'good' : 'bad',
            outputs: await materialize(result.outputs, suppressValue),
            ...(result.status === 'success'
              ? {}
              : {
                  error: runtimeError(result.diagnostics),
                }),
          };
        },
        async reset() {
          if (sessionDisposal || disposal) throw new Error('MathJSLab Markdown session is disposed.');
          await session.reset();
          storage.delete(sessionId);
        },
        async dispose() {
          if (sessionDisposal) return sessionDisposal;
          sessionDisposal = Promise.resolve()
            .then(() => session.dispose())
            .finally(() => {
              contexts.delete(sessionId);
              storage.delete(sessionId);
            });
          return sessionDisposal;
        },
      };
    },
    dispose() {
      if (disposal) return disposal;
      disposal = Promise.resolve().then(async () => {
        try {
          await runtime.dispose();
        } finally {
          contexts.clear();
          storage.clear();
          fallbackResources.dispose();
        }
      });
      return disposal;
    },
  };
};
