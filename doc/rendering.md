# Rendering, navigation and diagnostics

The engine separates Markdown parsing from managed rendering. `parse(source)`
is synchronous and returns unsanitized HTML. `renderHTML`, `render` and
`renderDocument` apply the configured policy. Managed rendering creates a
document session, installs extension styles in the correct scope, then renders
the applicable blocks. Optional libraries load only when needed.

Ordinary code is escaped and highlighted. MathJSLab mathematical expressions
become native MathML through the injected conversion function; TeX expressions
use their own placeholders and MathJax. These syntax families are independent.

## Document sessions

`engine.renderDocument(source, container, context)` creates a document owning
one generation of that container's content. `update`, `navigate` and `dispose`
operate on that session. Replacement reserves the new session synchronously and
waits for previous cleanup. A cancelled or superseded operation cannot publish
its completed HTML as the current document.

`engine.dispose(container)` releases one document while preserving other
consumers. `engine.dispose()` releases the engine. Rendering is queued with
`maxConcurrentRenders`; `renderMode: 'visible'` can defer heavy fences until
they approach the viewport. Extensions must cooperate with signals and cleanup.

`session.navigate(reference)` resolves against the current document URL and
reads through its resource service. Failed navigation preserves the current
content. Session resources survive successful updates and are released at
disposal. See [lifecycle](lifecycle.md).

## Navigation and collections

`MarkdownNavigator` delegates primary clicks on same-origin `.md` and
`.markdown` links. Modified clicks, downloads, external URLs and non-`_self`
targets stay with the browser. Current-document fragments do not fetch the
source again. A cross-document fragment is resolved after loading its page.

Navigator history supports `back`, `forward`, `canGoBack` and `canGoForward`.
Only successful navigation commits history; navigating elsewhere after going
back truncates the forward branch. `onStateChange` reports `loading`, `idle`,
`error` and `disposed`. Disposing the navigator removes its listeners and does
not make it the owner of the document session.

`MarkdownDocumentModel` validates a version-1 collection manifest with `title`,
optional `baseUrl` and ordered `items`. Groups have `type: 'group'` and
`children`; pages have `type: 'page'` and `source`. Explicit IDs are supported;
derived IDs include parent paths. Duplicate IDs and page URLs are rejected.
Language, descriptions, metadata and `hidden` entries are optional.

The model resolves page sources against the manifest URL, exposes `getPage`,
`findPage`, `previous`, `next` and `tableOfContents`, and performs no fetching
or rendering. Hidden pages stay addressable but are excluded from the normal
table of contents. `createTableOfContents(true)` includes them.

`createMarkdownOutline(container)` extracts a hierarchy from `h1`–`h6`, creates
unique IDs when required and excludes extension-generated headings. Level and
inclusion filters customize the result.

`MarkdownDocumentController` composes the engine, model, session and navigator.
`initialize` loads the initial page; its asynchronous `create` factory returns
an initialized controller. `open`, `back` and `forward` synchronize content,
active page, history and outline. `subscribe` and `onChange` publish immutable
state snapshots including page, URL, loading target, outline and navigation
availability. Failure retains the current document and reports the refused
`targetUrl` and error. Only pages in the model are intercepted as collection
navigation. The controller owns its session and subscriptions, not UI controls.

## Document component

```html
<markdown-document
    src="./lesson.md"
    security="sanitized"
    locale="en"
    theme="light"
></markdown-document>
```

`markdown` accepts loaded text; `src` accepts a URL; the `manifest` property
accepts a collection object, while the corresponding attribute loads JSON.
`initial-page` selects a collection's starting page. The host can inject an
engine and context. A manifest creates a controller exposed as `controller`
with its `model`; a standalone source uses a session and navigator.

The `state` attribute reports `empty`, `loading`, `ready` or `error`, with
`aria-busy` reflecting loading. Input changes cancel previous loads. Removal or
`dispose()` releases session resources. Reconnection creates a current session
and preserves an external engine.

The composed events are `markdown-state-change`, `markdown-ready`,
`markdown-error`, `markdown-navigate` and `markdown-diagnostic`. They cross the
Shadow DOM boundary. Context callbacks remain available for hosts that prefer
them.

## Layout and accessibility

A collection shows its global table of contents, document and page outline.
Standalone pages still have an outline. The `outline` attribute can select
`sidebar`, `inline` or `hidden`; `presentation` selects `document` or
`embedded`. The layout adapts to the component's own width through container
queries; side regions return to normal flow in a narrow host.

CSS parts include `root`, `status`, `content`, `layout`, `main`, `collection`,
`page-outline`, `toolbar`, `history`, `sequence`, `back-button`,
`forward-button`, `previous-button`, `next-button`, `page-link`,
`outline-link`, `group-label` and `announcer`. Control colors can use
`--markdown-control-background`, `--markdown-border-color` and
`--markdown-active-background`.

Component labels support English, Portuguese and Spanish. `locale` takes
precedence over the context locale; unknown locales use English. Authors own
document and manifest titles. Active pages use `aria-current="page"`; active
sections use `aria-current="location"`.

`Alt+Left/Right` traverses history; `Alt+Page Up/Page Down` selects previous
and next collection pages. `Up/Down`, `Home` and `End` move focus within
outlines without activating links. A page change focuses its first heading and
announces the change; a fragment change preserves focus. An
`IntersectionObserver` tracks visible sections. Reduced-motion preference
selects instant scrolling and reduces transitions.

Fragment scrolling in the component runs on the next animation frame, after
navigation has published its ready state and updated the controls. This keeps
the destination stable when loading UI disappears, including in WebKit. New
scroll requests replace pending ones; releasing the component cancels them. The
active outline uses current heading geometry after scrolling, and section
announcements remain available for repeated fragment navigation.

For the reproduction, browser matrix, and application integration follow-up,
see [WebKit fragment navigation](fragment-navigation-webkit.md).

## Diagnostics

Diagnostics include extension, message, severity and cause, plus source URL,
line and column when available. Lines generally identify the fence start;
columns are reported only when known. Older extensions may omit a code; the
component normalizes that case to `extension-diagnostic`.

| Code                           | Meaning                                      |
| ------------------------------ | -------------------------------------------- |
| `resource-url-blocked`         | Disallowed protocol, origin or resource      |
| `resource-size-limit`          | Configured byte limit exceeded               |
| `resource-load-error`          | Resource retrieval, HTTP or MIME failure     |
| `extension-capability-blocked` | Missing permission declared by the extension |
| `extension-render-error`       | Extension renderer failed                    |
| `extension-diagnostic`         | Fallback for external extension diagnostics  |
| `audio-playback-error`         | ABC playback could not start                 |
| `vega-resize-error`            | Visualization resize failed                  |
| `mathjslab-execution-disabled` | Execution policy blocked the fence           |
| `mathjslab-block-limit`        | Executable block limit exceeded              |
| `mathjslab-source-limit`       | Source byte limit exceeded                   |
| `mathjslab-statement-limit`    | Parsed statement limit exceeded              |
| `mathjslab-execution-timeout`  | Worker operation timed out                   |
| `mathjslab-worker-restarted`   | Worker generation was replaced               |
| `mathjslab-execution-error`    | Evaluation failed                            |
| `document-load-error`          | Document could not load                      |
| `document-navigation-error`    | Navigation could not complete                |

Categories distinguish policy, network, extension, execution, document and
navigation. A low-level resource failure can precede an aggregate document
failure. Abort signals are control flow and do not produce a late document
error. Custom diagnostic codes are retained.

```ts
import type { MarkdownDocumentDiagnosticDetail } from "mathjslab-markdown/component";

viewer.addEventListener("markdown-diagnostic", (event) => {
    const diagnostic = (event as CustomEvent<MarkdownDocumentDiagnosticDetail>)
        .detail;
    console.warn(diagnostic.code, diagnostic.sourceUrl, diagnostic.message);
});
```

## MathJSLab execution and rich output

The injected executor creates a document-scoped session. Executable fences run
in order and share that workspace; other documents are isolated. Inline MathML
conversion remains separate and does not execute fence commands.

Execution results carry status, optional error and typed outputs: literal
`text`, `mathml`, explicitly trusted/untrusted `html`, and rich `node` outputs.
Untrusted HTML output is shown literally. A rich node is connected before its
`mount()` runs so its renderer can measure it; `dispose()` releases it on
replacement or cancellation. Roles such as `visualization`, `debug` and
`generic` are exposed through `data-mathjslab-output-role`.

The standard browser adapter delegates to the kernel's remote runtime. It
materializes supported final MathML, script messages and serializable Plotly
requests, not every ordinary runtime text/value output. Plot requests contain
their own data, layout and configuration; the host owns plotting, resize and
disposal.

`executionPolicy.mathjslab` controls `enabled`, `allowInRestrictedMode`,
`maxSourceBytes`, `maxBlocks`, `maxStatements` and `timeoutMs`. Restricted
modes require explicit execution authorization. Limits apply per document:
source bytes per fence, number of executable blocks and cumulative parsed
statements. Refused blocks retain source and emit a local diagnostic.

The adapter receives a Worker factory, timeout and renderer. Host script reads
use the document resource service and signal. The app's Worker intentionally
omits UI commands such as a local file picker. Cancellation and timeouts can
terminate a Worker blocked by synchronous work; the next operation starts a
clean workspace without replaying previous side effects.

The advanced transport API has its own request/session IDs and versioned,
serializable messages. Functions, DOM, `AbortSignal` and resource services stay
on the host. It is a custom-integration protocol, not the kernel's production
runtime protocol. See [architecture](architecture.md) and
[public API](public-api.md).
