# Mathematical annotations in Vega charts

Pass a `vegaMathLabels` map in the document context. Keys match the text of an
explicit annotation. In Vega, name the text mark `markdown_math`. In Vega-Lite,
name the layer containing the text mark `markdown_math`. Keep the text visible
so it can serve as a fallback. Use centered text and an alphabetic baseline for
the mathematical label.

```ts
await engine.renderDocument(markdown, container, {
    vegaMathLabels: {
        "Drain current": {
            tex: String.raw`I_{D_1}`,
            accessibleName: "Drain current I D one",
        },
    },
});
```

Only the host map supplies TeX. Treat it as trusted configuration. A document
can select a configured label by emitting its key in the named annotation
layer. Ordinary marks, axes and legends retain their original text.

The adapter lazily uses the SVG converter from the Markdown MathJax runtime.
Hosts that supply MathJax need `tex2svgPromise` and local glyph definitions.
MathJax errors or unsupported fragments leave the text fallback in place.
Labels present at initial render are prepared once per fence. A new key
introduced by an interactive update uses the text fallback until the document
is rendered again.

The adapter places sanitized SVG fragments at the renderer's anchors, uses the
document theme for their foreground, and preserves accessible names and image
roles in standalone SVG exports. The font size is 14 SVG units. Labels follow
resize and are discarded with their fence. Axis layout and collision avoidance
remain part of the chart spec.

The browser fixture under `test/browser/visual/math-labels.md` and its
integration test demonstrate subscripts, Greek symbols and fractions.
