# Public API and presets

The `exports` map in `package.json` defines the supported npm contract. A
transitively generated declaration file does not make an internal symbol
public.

| Subpath                                 | Responsibility                               |
| --------------------------------------- | -------------------------------------------- |
| `mathjslab-markdown`                    | Core engine and contracts                    |
| `mathjslab-markdown/component`          | Document component class and hosting helpers |
| `mathjslab-markdown/component/register` | Explicit element registration                |
| `mathjslab-markdown/extensions`         | Educational factories and manifests          |
| `mathjslab-markdown/mathjslab`          | Optional MathJSLab integration               |
| `mathjslab-markdown/mathjslab/worker`   | Advanced Worker transport and protocol       |
| `mathjslab-markdown/browser`            | Aggregate entry                              |
| `mathjslab-markdown/compat/*`           | Compatibility modules                        |
| `mathjslab-markdown/bundles/*`          | Browser distribution assets                  |

Public entry points must not import application state, shell commands,
`InterpreterRuntime`, `PlotEngine`, `PlotOutputCapture` or the historical app
facade. Their import boundaries and JavaScript export lists are
regression-tested. The core does not register the component; the registration
and aggregate entries do. Rendering and the component require DOM.

## Main contracts

| Family        | Main symbols                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Engine        | `MarkdownEngine`, `MarkdownEngineOptions`, `MarkdownDocument`, `MarkdownDocumentContext`, `MarkdownProfile`, `markdownProfiles`          |
| Extensions    | `MarkdownExtension`, `MarkdownExtensionManifest`, `MarkdownFence`, `MarkdownEngineServices`, `MarkdownExtensionCapability`               |
| Diagnostics   | `MarkdownDiagnostic`, `MarkdownDiagnosticCode`, `MarkdownDiagnosticCategory`, `MarkdownDiagnosticEventDetail`, `markdownDiagnosticCodes` |
| Policy        | `MarkdownSecurityMode`, `MarkdownResourcePolicy`, `MarkdownResourceService`, `MarkdownExecutionPolicy`, `MarkdownExecutionPolicies`      |
| Configuration | `createEducationalMarkdownEngine`, `createMarkdownEnginePreset`, `markdownEnginePresets`, `markdownExtensionCatalog`                     |
| Component     | `MarkdownDocumentElement`, `defineMarkdownDocumentElement`, event and state types                                                        |
| Hosting       | `mountMarkdownDocument`, `disposeMarkdownDocument`, `getHostedMarkdownDocument`, `MarkdownDocumentHostOptions`                           |
| Collections   | `MarkdownDocumentModel`, manifest, page/group and outline contracts                                                                      |
| Navigation    | `MarkdownDocumentController`, `MarkdownNavigator` and their options, state and events                                                    |

The host owns the engine; sessions are isolated by container. Dispose a session
when replacing its content or removing its host. Session disposal does not
dispose a shared engine. Cancellation and resource ownership are scoped to the
operation/document; superseded operations must not publish late output.

## Presets

`profile` selects syntax. `securityMode`, capabilities, execution authorization
and `resourcePolicy` are independent dimensions. Integrator options can
override the corresponding preset defaults explicitly.

| Preset            | Profile | Security  | Optional factories                             |
| ----------------- | ------- | --------- | ---------------------------------------------- |
| `core`            | core    | strict    | None                                           |
| `gfm`             | gfm     | sanitized | None                                           |
| `education-basic` | gfm     | sanitized | SMILES                                         |
| `education-full`  | gfm     | sanitized | Educational catalogue                          |
| `trusted-local`   | gfm     | trusted   | Educational catalogue                          |
| `safe-remote`     | gfm     | sanitized | None; resources default to the document origin |

Factories are registered lazily; a preset does not eagerly import every
renderer. A registered extension can still be blocked by its capability policy.
The catalogue contains the MathJSLab manifest, but its execution factory
remains in the optional `mathjslab` entry because it requires an injected
executor.

## Extension exports

Each built-in extension has a factory and a manifest:
`abcExtension/abcManifest`, `graphvizExtension/graphvizManifest`,
`headingIdsExtension/headingIdsManifest`, `mapsExtension/mapsManifest`,
`mathJaxExtension/mathJaxManifest`, `mathJSLabExtension/mathJSLabManifest`,
`mermaidExtension/mermaidManifest`, `model3DExtension/model3DManifest`,
`molecule3DExtension/molecule3DManifest`,
`relativeUrlsExtension/relativeUrlsManifest`, `smilesExtension/smilesManifest`,
`syntaxHighlightExtension/syntaxHighlightManifest`,
`vegaLiteExtension/vegaLiteManifest` and `verovioExtension/verovioManifest`.

Manifests describe formats, dependencies and capabilities without loading the
optional libraries. The [extension catalogue](extensions/README.md) provides
authoring examples. Package exports remain the authority for importing a
symbol.

## MathJSLab integration

`MathJSLabExecutor`, `MathJSLabExecutionSession` and their input/output types
separate Markdown syntax from execution. `mathJSLabExtension` receives an
executor. `createBrowserMathJSLabWorkerExecutor` requires a host-owned Worker
factory and synchronous `toMathML`; its optional renderer materializes plots.
Neither the Worker nor the numerical runtime depends on Plotly or DOM.

`materializePlotlyOutput` adapts a serializable request to rich-output
lifecycle through the injected renderer. The application composes its own
renderer and Worker outside this package's public import graph.

## Advanced API and versioning

Custom transports can use `createTransportMathJSLabExecutor`,
`WorkerMathJSLabTransport`, `createWorkerMathJSLabTransport`,
`MathJSLabWorkerRuntime`, protocol messages, context snapshots and error
serialization helpers. This advanced protocol is distinct from the kernel
runtime protocol used by the standard browser adapter.

`markdownPublicApiVersion` versions the public contract; its current major
is 2. That major removed implicit application Plotly integration and requires
explicit Worker/rendering composition. `mathJSLabWorkerProtocolVersion`
versions the advanced message protocol independently. Breaking changes to
symbols, options, events, manifest formats or lifecycle semantics require
deliberate contract updates. Export lists and emitted types are checked by
tests and builds.

Sanitizer internals, resource-service implementation details, render queues,
resize helpers, caches and application modules are not supported public APIs.
Use [integration](integration.md), [rendering](rendering.md),
[lifecycle](lifecycle.md) and [security](security-and-resources.md) for the
corresponding contracts.
