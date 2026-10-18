import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import { MarkdownExecutionError } from './scheduler.js';

type Resource = { dispose?: () => void | Promise<void> };
const cancelled = (): MarkdownExecutionError => new MarkdownExecutionError('execution-cancelled', 'Execution cancelled');
const raceAbort = <T>(operation: Promise<T>, signal: AbortSignal): Promise<T> => {
  if (signal.aborted) {
    void operation.catch(() => undefined);
    return Promise.reject(signal.reason instanceof MarkdownExecutionError ? signal.reason : cancelled());
  }
  return new Promise<T>((resolve, reject) => {
    const abort = (): void => reject(signal.reason instanceof MarkdownExecutionError ? signal.reason : cancelled());
    signal.addEventListener('abort', abort, { once: true });
    void operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
};
/** A lease remains alive across interactive actions. Unknown late acquisitions are disposed on arrival. */
export class ManagedExecutionSession<S extends Resource> {
  public readonly controller = new AbortController();
  public session?: S;
  private acquisition?: Promise<S>;
  private disposal?: Promise<void>;
  private readonly pending = new Set<Promise<unknown>>();
  private readonly unlink: () => void;
  public constructor(signal?: AbortSignal) {
    const abort = (): void => {
      this.controller.abort(signal?.reason);
    };
    signal?.addEventListener('abort', abort, { once: true });
    this.unlink = () => signal?.removeEventListener('abort', abort);
    if (signal?.aborted) abort();
  }
  public async dispose(): Promise<void> {
    this.controller.abort();
    this.unlink();
    // Do not wait forever for an uncooperative factory. Its scheduled acquisition owns late cleanup.
    await this.release();
  }
  private async release(): Promise<void> {
    if (this.session && !this.disposal) this.disposal = Promise.resolve().then(() => this.session!.dispose?.());
    await this.disposal;
  }
  /** Host shutdown and resource quotas include acquisitions that arrive after cancellation. */
  public async waitForIdle(): Promise<void> {
    while (this.pending.size) await Promise.allSettled([...this.pending]);
  }
  public run<T>(
    context: MarkdownDocumentContext,
    factory: (context: MarkdownDocumentContext) => S | Promise<S>,
    action: (session: S, context: MarkdownDocumentContext) => T | Promise<T>,
    options: { timeoutMs?: number | undefined; closeAfter?: boolean } = {},
  ): Promise<T> {
    const signal = this.controller.signal;
    const work = async (scheduledSignal: AbortSignal): Promise<T> => {
      const abort = (): void => this.controller.abort(scheduledSignal.reason);
      scheduledSignal.addEventListener('abort', abort, { once: true });
      if (scheduledSignal.aborted) abort();
      const active = { ...context, signal };
      const timer =
        options.timeoutMs === undefined ? undefined : setTimeout(() => this.controller.abort(new MarkdownExecutionError('execution-timeout', 'Execution timed out')), options.timeoutMs);
      try {
        if (signal.aborted) throw cancelled();
        const factoryContext = { ...active };
        delete factoryContext.onHDLUpdate;
        this.acquisition ??= Promise.resolve().then(() => factory(factoryContext));
        this.session = await this.acquisition;
        if (signal.aborted) throw cancelled();
        return await raceAbort(
          Promise.resolve().then(() => action(this.session!, active)),
          signal,
        );
      } finally {
        clearTimeout(timer);
        scheduledSignal.removeEventListener('abort', abort);
        if (signal.aborted) await this.dispose();
        else if (options.closeAfter) {
          this.unlink();
          await this.release();
        }
      }
    };
    const operation = context.executionScheduler ? context.executionScheduler.run(work, { signal, owner: context.executionOwner ?? context.signal ?? context }) : work(signal);
    this.pending.add(operation);
    void operation.then(
      () => this.pending.delete(operation),
      () => this.pending.delete(operation),
    );
    return raceAbort(operation, signal);
  }
}
