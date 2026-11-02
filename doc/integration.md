# Integration and deployment

Use the package's public npm subpaths. The core does not import `appEngine`,
application commands or global shell state.

```ts
import { createMarkdownEnginePreset } from "mathjslab-markdown";
import {
    defineMarkdownDocumentElement,
    type MarkdownDocumentElement,
} from "mathjslab-markdown/component";

defineMarkdownDocumentElement();
const viewer =
    document.querySelector<MarkdownDocumentElement>("markdown-document");
if (!viewer) throw new Error("Missing markdown-document element");
viewer.engine = createMarkdownEnginePreset("safe-remote");
viewer.src = "/docs/intro.md";
```

`safe-remote` uses GFM and sanitization with resources restricted to the source
document's origin by default. Select `trusted-local` explicitly for content
controlled by the integrator; selecting a syntax profile alone does not change
authorization.

Set `src` to request a document. Hosts that need completion notification should
listen for `markdown-ready` and `markdown-error`; the component does not expose
the `load()` method shown in earlier integration drafts.

The engine can also manage a container without the component:

```ts
import { createMarkdownEnginePreset } from "mathjslab-markdown";

const container = document.createElement("div");
document.body.append(container);
const engine = createMarkdownEnginePreset("education-basic");
const session = await engine.renderDocument("# Lesson", container, {
    sourceUrl: new URL("/course/lesson.md", location.href),
});
try {
    await session.update("# Lesson\n\nUpdated content.");
} finally {
    await session.dispose();
    await engine.dispose();
}
```

The host owns the engine. If it is shared, dispose each removed document's
session and dispose the engine only when all consumers have finished. The
component releases its session on disconnection and preserves an injected
external engine.

## Public bundles

Browser deployment must keep all generated runtime and chunk assets beside
their entry points. Copying one entry file is insufficient.

| Bundle                  | Responsibility                                             |
| ----------------------- | ---------------------------------------------------------- |
| `core.js`               | Engine, contracts, presets and navigation                  |
| `component.js`          | Component class and helpers without automatic registration |
| `component-register.js` | Explicit custom-element registration                       |
| `extensions.js`         | Extension factories and manifests                          |
| `mathjslab.js`          | Optional execution integration with an injected executor   |
| `mathjslab-worker.js`   | Advanced transport/runtime protocol                        |
| `markdown-document.js`  | Aggregate compatibility entry, including registration      |

These are deployment files, not replacements for the npm subpath map. Bundlers
resolve npm dependencies normally; native browser integration must provide any
required import maps and preserve relative asset URLs.

MathJSLab execution is an explicit optional integration. Supply
`createBrowserMathJSLabWorkerExecutor` with a Worker factory and MathML
conversion; supply a plot renderer if plots need to be materialized. No preset
creates an application-specific Worker or interpreter automatically. See
[public-api.md](public-api.md) and [rendering.md](rendering.md).

## Numeric sessions in the browser Worker adapter

```ts
import {
    createBrowserMathJSLabWorkerExecutor,
    type BrowserMathJSLabWorkerExecutorOptions,
} from "mathjslab-markdown/mathjslab";

const numeric: BrowserMathJSLabWorkerExecutorOptions["numeric"] = {
    engine: "decimal",
    complex: { precision: 40, precisionCompare: 7 },
};
const executor = createBrowserMathJSLabWorkerExecutor({
    toMathML: hostToMathML,
    workerFactory: () => new Worker(hostWorkerUrl, { type: "module" }),
    numeric,
    plotRenderer: hostPlotRenderer,
});
```

`numeric` is the core's `SessionOptions['numeric']` type. Omit it to retain
core defaults. This contract targets the published `mathjslab@^2.10.0` optional
peer. The adapter deep-copies it when the executor is constructed and copies
that snapshot for every document session. Mutating the original object later
changes neither existing nor future sessions of this executor. Different
creation defaults require a new executor and new document sessions; initialize
the replacement successfully before disposing the previous document. No
workspace replay or conversion is performed. Separate executors can run number
and decimal sessions simultaneously. Each document owns its workspace and
storage.

Browser sessions expose optional `reset()` through `MathJSLabExecutionSession`;
other custom executors need not implement it. Await reset before further work.
It clears the workspace and adapter storage and restores the copied initial
numeric settings. Remote cancellation/timeout can terminate a Worker and lose
its workspace; the next execution recreates it with the same numeric snapshot.
Session disposal is idempotent and affects only that document. Executor
disposal releases all its sessions. Disposed sessions/executors cannot be
reused.

User code can switch the live backend through `configure("real", backend)`
while retaining workspace and aliases. Conversion to number uses native
floating-point precision; switching back cannot restore lost digits. A backend
switch affects only that document session. A Worker that fails to acknowledge
numeric options rejects session creation with
`MATHJSLAB_NUMERIC_CONFIGURATION_UNSUPPORTED`. The adapter preserves these
codes, rather than retrying with defaults. Deploy matching core, runtime and
Worker distributions together and refresh cached Worker assets. Number
precision is fixed at 15; validate decimal precision and precisionCompare
together.

Runtime success maps to `success`/`good`; error and cancelled map to their
same-named statuses with state `bad` and diagnostic code on Error. Timeout
throws `TimeoutError` with `MATHJSLAB_TIMEOUT` and is outside the result union.
Semicolon-terminated statements suppress their final value representation;
independent text effects such as load completion and plot outputs are retained.
Plots remain host-owned nodes: the document calls mount after insertion, resize
on layout changes and dispose when releasing outputs. Session reset alone does
not dispose already-materialized DOM outputs.

This is the contract offered to mathjslab-app; it does not assume its
preference UI, session replacement or Worker asset deployment has been
implemented.
