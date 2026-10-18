# Execution sessions and scheduling

The engine shares one execution scheduler between HDL batch jobs, interactive
HDL actions and MathJSLab parsing/execution. Rendering has its own scheduler;
`maxConcurrentRenders` does not grant additional execution capacity. Scheduling
does not authorize execution: the existing execution and capability policies
still apply.

## Defaults and configuration

```ts
import { MarkdownEngine } from "mathjslab-markdown";

const engine = new MarkdownEngine({
    executionScheduling: {
        maxConcurrent: 2,
        maxConcurrentPerOwner: 1,
        maxQueued: 128,
        maxQueuedPerOwner: 32,
    },
    // Register application-owned executors and authorize HDL separately.
});
```

These are the defaults. All four values must be positive safe integers; invalid
configuration throws before execution. Queue limits count waiting jobs, not
running jobs. A free slot remains available to another owner even when one
document has reached its own concurrency limit.

Within an owner, dispatch is FIFO. Waiting owners are served round-robin when
their quotas permit dispatch. Engine documents have distinct owner identities
that survive updates. MathJSLab additionally preserves statement order and its
stateful session within a document revision. Parse and statement calls release
compute capacity between operations. Interactive actions retain their session
between steps, but release compute capacity after each completed step.

An overflowing queue rejects the new job before acquiring a session and emits
`execution-queue-limit` with the fence's Markdown location. Existing extension
timeout diagnostics remain compatible.

## Sharing across engines

```ts
import {
    MarkdownEngine,
    createMarkdownExecutionScheduler,
} from "mathjslab-markdown";

const scheduler = createMarkdownExecutionScheduler({ maxConcurrent: 2 });
const first = new MarkdownEngine({ executionScheduler: scheduler });
const second = new MarkdownEngine({ executionScheduler: scheduler });

console.log(scheduler.snapshot); // { active, queued, disposed }

await first.dispose();
await second.dispose();
await scheduler.dispose();
```

An engine disposes a scheduler it creates. An injected scheduler belongs to the
application; disposing one engine cancels its documents without disposing the
shared scheduler or cancelling another engine's documents.

Custom executors can submit work with
`scheduler.run(async signal => result, { signal, owner })`. Use stable object
identities for owners; jobs without `owner` share a single default owner.
Running work receives a linked abort signal. A queued aborted job never calls
its task. Disposal cancels all pending jobs, aborts running jobs and waits for
their tasks to settle. Do not recursively enqueue and await another task on the
same scheduler from inside a scheduled task: that can deadlock.

Custom executing extensions receive `context.executionScheduler` and
`context.executionOwner`. Visual renderers do not need either field. The engine
chooses the configured scheduler; the context owner can be supplied by the
application when documents must share an execution quota.

## Session lifecycle and deadlines

The three executing extensions use a common session lease for acquisition,
cancellation and idempotent asynchronous disposal. Batch HDL closes its session
after execution, before releasing compute capacity. Interactive HDL retains
state through Pause and completed steps until Reset or document disposal.
MathJSLab retains its document session until update/disposal.

Reset, update, navigation and disposal cancel pending actions. Old results do
not replace the new document or simulation state. Known sessions are disposed
exactly once, and concurrent cleanup calls await the same resource disposal.
The scheduler retains the slot until asynchronous cleanup completes.

If cancellation happens during session acquisition, the UI can finish
cancelling without waiting for the factory. The outstanding acquisition still
owns its compute slot. If the factory later returns a resource, that resource
is disposed without executing it. Full scheduler shutdown waits for this late
acquisition and its cleanup.

HDL execution defaults to 30 seconds per dispatched batch/action, including
session acquisition. Configure `executionPolicy.hdl.timeoutMs` or
`executionPolicy["hdl-interactive"].timeoutMs`. Time spent waiting in the
engine queue does not consume this deadline. With an HTTP executor, the
dispatched operation includes transport and waiting in the independent host
queue; physical tool deadlines remain configured in the native backend.
MathJSLab accepts `executionPolicy.mathjslab.timeoutMs` for each
parse/statement operation; without it, the executor's existing timeout behavior
is preserved.

Interactive `maxSteps` defaults to 1000, with a ceiling of 10000. It takes
precedence over `maxStatements`; `maxStatements` remains a legacy fallback.
Steps are counted after successful result validation, independently of the
document's `maxBlocks` quota.

Cancellation cannot preempt arbitrary synchronous JavaScript. Factories must
honor their signal, and `session.dispose()` must terminate outstanding native
jobs/workers before resolving. A never-settling factory cannot safely free its
slot: doing so would permit unbounded late resources. A legacy executor without
a disposer must itself stop work on abort.

## HTTP host scheduling

`createHDLHTTPHandler` accepts the same `executionScheduling` options. Its
scheduler bounds physical host work across all clients, independently of
browser engine queues. Session acquisition and execution/step calls use this
host scheduler. Queue overflow returns HTTP 429. The existing `maxSessions`
quota includes acquisitions and resources still being disposed, including
cancelled acquisitions that return late. `handler.executionSnapshot` reports
active/queued work and shutdown state.

```ts
const handler = createHDLHTTPHandler(executor, {
    token,
    allowedOrigins: ["http://localhost:8080"],
    maxSessions: 8,
    idleTimeoutMs: 300000,
    executionScheduling: { maxConcurrent: 2, maxQueued: 32 },
});
```

Idle expiry remains a host session policy, rather than a queue timeout. Paused
browser sessions retain state; after HTTP idle expiry, Reset creates a fresh
session. Shutdown cancels connections and waits for managed session cleanup and
outstanding scheduled acquisitions. Direct native callers can share an
application scheduler around their calls; native process isolation and hard
resource quotas remain host responsibilities.

Final result interfaces remain compatible; optional
[incremental HDL results](incremental-results.md) use action-scoped observers
and negotiated HTTP streaming. Stimulus sequences, assertions and further
inspection/export are subsequent stages.
