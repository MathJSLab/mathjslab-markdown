export type MarkdownExecutionSchedulerOptions = {
  maxConcurrent?: number;
  maxConcurrentPerOwner?: number;
  maxQueued?: number;
  maxQueuedPerOwner?: number;
};
export type MarkdownExecutionJobOptions = { signal?: AbortSignal; owner?: object };
export interface MarkdownExecutionScheduler {
  run<T>(task: (signal: AbortSignal) => T | Promise<T>, options?: MarkdownExecutionJobOptions): Promise<T>;
  readonly snapshot: Readonly<{ active: number; queued: number; disposed: boolean }>;
  dispose(): Promise<void>;
}
export class MarkdownExecutionError extends Error {
  public constructor(
    public readonly code: 'execution-cancelled' | 'execution-queue-limit' | 'execution-timeout',
    message: string,
  ) {
    super(message);
    this.name = 'MarkdownExecutionError';
  }
}
type Job = { owner: object; controller: AbortController; start: () => void; cancel: () => void; unlink: () => void };
const integer = (value: number | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError('Execution scheduling limits must be positive safe integers');
  return value;
};
/** FIFO within each owner; round-robin dispatch across owners with available capacity. */
export const createMarkdownExecutionScheduler = (options: MarkdownExecutionSchedulerOptions = {}): MarkdownExecutionScheduler => {
  const concurrent = integer(options.maxConcurrent, 2);
  const perOwner = integer(options.maxConcurrentPerOwner, 1);
  const queued = integer(options.maxQueued, 128);
  const queuedPerOwner = integer(options.maxQueuedPerOwner, 32);
  const defaultOwner = {};
  const groups = new Map<object, Job[]>();
  const running = new Set<Job>();
  const activeOwners = new Map<object, number>();
  let closed = false;
  let disposal: Promise<void> | undefined;
  let drained: (() => void) | undefined;
  const queueSize = (): number => Array.from(groups.values()).reduce((sum, group) => sum + group.length, 0);
  const pump = (): void => {
    if (closed) return;
    while (running.size < concurrent) {
      const next = Array.from(groups).find(([owner]) => (activeOwners.get(owner) ?? 0) < perOwner);
      if (!next) break;
      const [owner, group] = next;
      const job = group.shift()!;
      groups.delete(owner);
      if (group.length) groups.set(owner, group);
      running.add(job);
      activeOwners.set(owner, (activeOwners.get(owner) ?? 0) + 1);
      job.start();
    }
  };
  return {
    get snapshot() {
      return { active: running.size, queued: queueSize(), disposed: closed };
    },
    run<T>(task: (signal: AbortSignal) => T | Promise<T>, jobOptions: MarkdownExecutionJobOptions = {}): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const owner = jobOptions.owner ?? defaultOwner;
        if (closed || jobOptions.signal?.aborted) {
          reject(new MarkdownExecutionError('execution-cancelled', 'Execution cancelled'));
          return;
        }
        const canStart = running.size < concurrent && (activeOwners.get(owner) ?? 0) < perOwner && !groups.has(owner);
        if (!canStart && (queueSize() >= queued || (groups.get(owner)?.length ?? 0) >= queuedPerOwner)) {
          reject(new MarkdownExecutionError('execution-queue-limit', 'Execution queue limit exceeded'));
          return;
        }
        const controller = new AbortController();
        const job: Job = {
          owner,
          controller,
          unlink: () => jobOptions.signal?.removeEventListener('abort', abort),
          cancel: () => {
            controller.abort(jobOptions.signal?.reason);
            if (running.has(job)) return;
            const group = groups.get(owner);
            if (group) {
              const index = group.indexOf(job);
              if (index >= 0) group.splice(index, 1);
              if (!group.length) groups.delete(owner);
            }
            job.unlink();
            reject(new MarkdownExecutionError('execution-cancelled', 'Execution cancelled'));
            pump();
          },
          start: () => {
            void Promise.resolve()
              .then(() => task(controller.signal))
              .then(resolve, reject)
              .finally(() => {
                job.unlink();
                running.delete(job);
                const count = activeOwners.get(owner)! - 1;
                if (count) activeOwners.set(owner, count);
                else activeOwners.delete(owner);
                pump();
                if (closed && !running.size) drained?.();
              });
          },
        };
        const abort = (): void => job.cancel();
        jobOptions.signal?.addEventListener('abort', abort, { once: true });
        const group = groups.get(owner) ?? [];
        group.push(job);
        groups.set(owner, group);
        pump();
      });
    },
    dispose(): Promise<void> {
      if (disposal) return disposal;
      closed = true;
      disposal = new Promise<void>((resolve) => {
        drained = resolve;
      });
      for (const job of Array.from(groups.values()).flat()) job.cancel();
      for (const job of running) job.cancel();
      if (!running.size) drained?.();
      return disposal;
    },
  };
};
