# Architecture

`mathjslab-app` composes `mathjslab` and `mathjslab-markdown`. The kernel owns
execution semantics, plot preparation and serializable output contracts without
DOM or Plotly dependencies. This package owns the Markdown engine, document
component and educational extensions. The application supplies its UI and
execution, Worker and rendering adapters.

The reusable engine does not depend on application-global state. Rendering
requires a browser DOM. Optional MathJSLab integration receives an executor,
Worker factory and plot renderer by composition. Document sessions own their
resources and cancellation; disposing a session does not dispose a shared
engine.

The npm entry points are defined by `package.json`. `component` exports the
class and helpers without registering the element; `component/register`
registers it explicitly. Optional libraries are loaded on demand. Browser
bundles share runtime and chunks, so deployment must preserve the full asset
tree. See [integration](integration.md).

The public API and advanced Worker protocol have independent versions. Their
contracts are documented in [public-api.md](public-api.md),
[lifecycle.md](lifecycle.md) and
[security-and-resources.md](security-and-resources.md).

The current browser MathJSLab adapter uses `RemoteMathJSLabRuntime` from
`mathjslab/runtime` and a host-supplied Worker for each session. That Worker
must implement the kernel's canonical protocol, for example through
`mathjslab/worker`. The advanced `MathJSLabWorkerRuntime` and
`WorkerMathJSLabTransport` protocol is available for custom integrations and
does not replace that canonical protocol.

Document fences execute sequentially in their own workspace. The adapter
preserves diagnostics, execution signal and timeout, and retains the resource
service until remote disposal completes. Semicolons retain output suppression.
Value output uses MathML; supported script text and plot descriptions can also
be presented by the host.
