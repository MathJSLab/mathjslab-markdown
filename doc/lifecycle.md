# Lifecycle and resource ownership

| Resource                                   | Owner                                                       | Cleanup                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Engine, parser and extension registrations | Host-created engine shared by its documents                 | Global disposal is final; per-container disposal preserves other documents                                  |
| Document session and container children    | Engine/session associated with one container                | Replacement waits for prior cleanup; disposal clears children, not the supplied container                   |
| Update/navigation operation and signal     | Current session revision                                    | Superseding work aborts the previous operation and checks revision before publishing                        |
| Queued render tasks                        | Engine's bounded render queue                               | Abort removes queued work immediately; global disposal empties the queue                                    |
| Active render hooks                        | Engine and session                                          | Disposal waits for tracked work; external hooks must cooperate or complete                                  |
| Deferred rendering observers               | Engine, one per deferred element                            | Abort disconnects; callbacks check observer identity and cancellation                                       |
| Resource service, cache and object URLs    | Document session; temporary services for initial host loads | Abort reads, clear completed-text cache and revoke owned URLs; creation after disposal is rejected          |
| Document model                             | Host/controller                                             | No network requests or listeners; outline generation can assign DOM IDs                                     |
| Controller                                 | Host or component                                           | Releases session, navigator, subscriptions and pending initial load                                         |
| Navigator                                  | Host, facade, controller or component                       | Removes delegated clicks and notifications; does not own the session                                        |
| Hosted component                           | Hosting helper and its container                            | Replacement disposes the old component and releases completion listeners                                    |
| Component instance                         | DOM/host                                                    | Disconnection invalidates loads and releases session/controller/observers; external engine remains reusable |
| MathJSLab session                          | Execution extension/document                                | Fences execute sequentially; abort starts remote cleanup and disposes rich output                           |
| Standard browser Worker                    | Remote kernel session created through the injected factory  | Session disposal releases its Worker; executor disposal releases the runtime                                |
| Advanced custom transport/runtime          | Transport generation and custom Worker runtime              | Correlates requests, clears listeners/timeouts, aborts resources and rejects stale/pending operations       |

Component Shadow DOM listeners are created for the instance and retained for
reconnection; they are not global `window`/`document` listeners. Scheduled
loads check revisions. Section observers check identity and connection before
applying state. A disposed component does not adopt a late session.

## Extension resources

| Extension                                | Resources released                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Heading IDs, relative URLs, highlighting | Parser/plugin state; no per-fence renderer to release                                                   |
| Mermaid and SMILES                       | Tracked element/SVG references and fence DOM                                                            |
| Graphviz                                 | Per-container nodes and tracking; shared WASM initialization remains engine-scoped                      |
| MathJax                                  | `typesetClear` for nodes owned by the document; global disposal clears the remaining owned nodes        |
| ABC                                      | Playback synth, user-action listeners and tracked container                                             |
| Verovio                                  | Per-fence toolkit via `destroy()`; the module can be shared                                             |
| Maps                                     | Leaflet map, event listeners and resize connection                                                      |
| Molecule 3D                              | Spin, models, viewer and resize connection                                                              |
| Vega-Lite                                | Embedded view via `finalize()` and resize connection                                                    |
| Model 3D                                 | Frames, timer/visibility listeners, controls, mixer, geometries, materials, textures and WebGL renderer |
| MathJSLab                                | Execution sessions, block chain, rich outputs and resize observers                                      |

Initialization failure also needs cleanup of partially created resources. An
extension should establish ownership before a later operation can throw and
release resources when cancellation occurs during asynchronous initialization.

## Guarantees and limits

Only the current revision publishes managed HTML. Obsolete navigation responses
are discarded; failure leaves the current document available. Queued-task abort
does not wait for an unrelated document. Observer callbacks cannot
intentionally restart disposed work. Retrying after error/abort uses a fresh
operation signal.

Concurrent disposal calls wait for the same cleanup. Registered disposers are
all attempted before errors are aggregated; cleanup is not skipped merely
because another disposer failed. Document services and URLs are isolated even
when documents share an engine.

These guarantees depend on extension cooperation. Dynamic imports and
synchronous third-party work are not interrupted by `AbortSignal`. A
never-ending hook or custom fetch can delay disposal/replacement; code that
ignores its signal can keep running or write to nodes it retained. The engine
cannot recover resources that an extension loses before registering their
ownership.

Explicit component disposal cancels scheduled loads. A subsequent setter or
`reload()` can intentionally start another load. Reconnection creates a new
session using current inputs and preserves an externally supplied engine. Do
not treat component disposal as global disposal of that external engine.

Worker termination cannot preserve a suspended workspace. The standard adapter
starts a clean session rather than replaying commands. Custom shared-Worker
transports must invalidate every session in the terminated generation.

See [execution sessions and scheduling](execution-scheduling.md) for shared
compute quotas, cancellation, executor deadlines and asynchronous cleanup.
