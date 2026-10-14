# Security and resource policy

HTML sanitization, extension capabilities, execution authorization and resource
requests are separate controls. Selecting a syntax profile or installing a
renderer does not make authored content trustworthy.

## Security modes

| Mode        | Authored HTML                                                              | Default capabilities      |
| ----------- | -------------------------------------------------------------------------- | ------------------------- |
| `trusted`   | Preserved without sanitization                                             | All declared capabilities |
| `sanitized` | DOMPurify removes active tags, media, handlers, inline styles and `srcdoc` | `interactive` and `wasm`  |
| `strict`    | Raw HTML becomes text; generated Markdown HTML is sanitized                | None                      |

Generated HTML/SVG/MathML is sanitized in restricted modes. `parse()` is a
low-level synchronous operation and does not sanitize or validate URLs; use
managed rendering APIs before inserting untrusted content into DOM.

`allowedCapabilities` is an explicit grant. If engine and document both set a
list, the effective grant is their intersection: the document cannot expand the
engine's grant. A blocked fence stays as source text and emits
`extension-capability-blocked`. Custom manifests must declare every capability
their code uses; undeclared effects cannot be restricted by this check.

MathJSLab execution additionally uses `executionPolicy.mathjslab.enabled`.
Restricted modes require `allowInRestrictedMode: true`; a capability grant does
not override this independent execution policy. An executor still has to be
injected. See [rendering.md](rendering.md).

## Resource-policy precedence

Document policy overrides engine defaults field by field. The effective policy
controls `allowedProtocols`, `allowedOrigins`, `allowNetwork`, `allowDataUrls`,
`maxResourceBytes` and cache (`memory` or `none`). Restricted modes block
`data:` by default and allow the source document's origin by default. Without
`sourceUrl`, there is no implicitly allowed network origin. Explicit settings
override those defaults.

URLs are normalized and checked before generated HTML is inserted. Blocked
attributes are removed and emit `resource-url-blocked`. Granting `network` to
an extension does not waive resource policy. Relative URLs use the document
source, not the surrounding page.

## Mediated and browser-owned resources

| Path                                    | Control and limitation                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Document and manifest loads, navigation | Resource service, origin/protocol policy and operation signal                                                                          |
| Same-origin images in sessions          | Bounded fetch, MIME `image/*`, session-owned object URL                                                                                |
| Approved cross-origin images            | URL policy before insertion; without a custom `fetchResource`, the browser displays the validated URL directly to avoid requiring CORS |
| Image candidates in `srcset`            | Candidate validation and the image path above; complex data-URL grammar is not a general supported format                              |
| Vega-Lite remote datasets               | Resource-service text reads; JSON/CSV are embedded into the specification                                                              |
| MathJSLab script loads                  | Host reads through the document resource service and signal                                                                            |
| Map raster tiles                        | Provider URLs and capabilities are validated; Leaflet/browser image loading performs the requests                                      |
| glTF buffers and textures               | URL resolution/policy in the loading manager; Three.js still performs binary fetch/XHR internally                                      |
| Library modules, fonts and styles       | Controlled by the deployment and browser policy; not every internal library request passes through the document service                |

The current image behavior is intentionally different from older descriptions
that said every image was fetched into a blob URL. Cross-origin images shown
directly by the browser do not receive the service's body/MIME/redirect checks
or byte limit. Use a custom fetch adapter or browser/site controls when those
checks are required. Same-origin mediated images retain those checks.

For service reads, streamed bodies stop when they exceed `maxResourceBytes`,
even without `Content-Length`. Adapters returning a complete text/blob body are
measured after completion. Text caches are session-scoped; failures are not
cached. Session-owned object URLs are revoked when replaced or disposed, and
creation after resource-service disposal is rejected.

Service redirects use `redirect: 'manual'`. Visible destinations are validated
before following them; opaque or disallowed destinations are rejected. Custom
`fetchResource` adapters must honor that contract. A final visible destination
is validated as additional defense.

## Extension and host boundaries

Mermaid uses strict rendering security. Graphviz output is sanitized. Their
manifests declare relevant capabilities; integrator-supplied renderers or
plugins can introduce additional effects. Maps, glTF, fonts, CSS and auxiliary
modules can involve library-owned network paths, so the engine is not a global
network interceptor.

`trusted` content may use HTML/CSS and browser APIs that bypass resource
mediation. CSP, origin isolation, browser sandboxing and host-side limits
remain the integrator's responsibility. A custom extension should declare
capabilities, use `context.resources` for mediated operations and cooperate
with cancellation.

Diagnostics distinguish `resource-url-blocked`, `resource-size-limit`,
`resource-load-error`, `extension-capability-blocked` and
`extension-render-error`. Failures include the document/resource URL when
known. They do not imply that every browser-owned request was audited by the
engine.
