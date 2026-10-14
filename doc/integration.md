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
