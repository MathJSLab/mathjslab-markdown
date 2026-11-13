# SVG export design

The host opts in through `MarkdownDocumentContext.onVisualExport`. A renderer
publishes a handle once its fence has rendered, including when a visible-mode
fence becomes visible. The handle identifies the source element and language
and provides an asynchronous SVG serializer. The host owns any download UI.

```ts
const exportsByElement = new WeakMap<Element, MarkdownVisualExport>();
const session = await engine.renderDocument(markdown, container, {
    onVisualExport: (visual) => exportsByElement.set(visual.element, visual),
});

// When the user requests a download for a rendered fence:
const svg = await exportsByElement.get(fenceElement)?.serialize();
```

Import `MarkdownVisualExport` as a type from `mathjslab-markdown`.

The handle is valid for the rendered fence and document revision. An update,
navigation or dispose invalidates it. Serialization captures the current
renderer state, including dimensions and interactive state. The same state
produces the same SVG within the same runtime and environment. Generated
definition IDs are normalized in traversal order. The SVG is standalone. If
embedding several exports in one DOM tree, the host must namespace IDs.

Vega and Vega-Lite serialize the retained View through `toSVG()`. They use the
session's existing loader. Export applies SVG sanitization and keeps local
references. It removes stylesheet content, external references, links and
embedded images. The displayed chart keeps its live DOM and interactive
behavior.

Graphviz publishes an SVG handle for both `dot` and `graphviz`. It serializes
the rendered SVG with its intrinsic dimensions and viewBox. The same sanitizer
removes external references and keeps local gradient references valid.

Mermaid captures SVG presentation attributes from the mounted diagram. Use
`htmlLabels: false` where the diagram type supports it. Serialization rejects
diagrams containing HTML labels or image elements.
[Mermaid export](extensions/mermaid.md)

Other extensions can adopt the contract when they can provide a standalone SVG
and invalidate its serializer during teardown. TikZ and CircuiTikZ pass the
WOFF2 bytes already read through the resource service. The shared exporter
strips the live stylesheet and generates its own font rules with data URLs and
stable font names. After serialization, the file is independent of
session-owned font URLs. A host embedding the file must allow data fonts under
its own CSP.

## PNG in the browser

Import `rasterizeMarkdownVisual` from `mathjslab-markdown` and pass an active
export handle. It decodes the standalone SVG and returns an `image/png` Blob
using the browser's canvas encoder.

```ts
const png = await rasterizeMarkdownVisual(visual, {
    scale: 2,
    background: "#ffffff",
    signal: controller.signal,
});
```

The default scale is 1 and the background is transparent wherever the SVG
itself is transparent. Output uses rounded intrinsic pixel dimensions and is
limited to 8192 pixels per side and 16 megapixels. The host owns download UI
and any URL it creates for the returned Blob. Its CSP must allow `blob:` images
for rasterization. Appearance and PNG encoding depend on the browser and the
fonts available to it.
