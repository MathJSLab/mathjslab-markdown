# WaveDrom timing diagrams

Enable the `wavedrom` educational feature or register `waveDromExtension()`
from `mathjslab-markdown/extensions`. `waveDromManifest` is available from the
same entry point. WaveDrom and JSON5 are optional dependencies loaded only when
a diagram is rendered. Consumers installing with `--omit=optional` must install
`wavedrom@3.7.0` and `json5@2.2.3` to enable this feature.

```ts
const engine = createEducationalMarkdownEngine({
    features: ["wavedrom"],
    securityMode: "sanitized",
    allowedCapabilities: [],
});
await engine.renderDocument(source, container, { theme: "light" });
```

## Authoring

Use a `wavedrom` fence containing a WaveJSON object with a nonempty `signal`
array. Both JSON and JSON5 are supported: comments, unquoted property names,
single-quoted strings and trailing commas are accepted. Input is parsed as
data. JavaScript expressions, functions and executable statements are not
accepted.

````markdown
```wavedrom
{
  signal: [
    { name: 'clk',  wave: 'p......' },
    { name: 'bus',  wave: 'x.34.5x', data: 'head body tail' },
    { name: 'wire', wave: '0.1..0.' },
  ],
  head: { text: 'Transfer', tick: 0 },
  config: { hscale: 1 },
}
```
````

Timing diagrams support clock edges, logic levels, bus data, named groups,
`node` event markers, `edge` connections, headers, footers, phase and period.
For syntax details, see the
[official tutorial](https://wavedrom.com/tutorial.html). This extension renders
the `signal` family; register maps (`reg`) and logic expressions (`assign`) are
not supported in this version.

## Rendering and safety

Rendering produces a self-contained, sanitized SVG with an accessible image
label. No document-wide WaveDrom scanning, global `WaveSkin`, remote rendering
service or input evaluation is used. No network, WASM, WebGL, audio or
interactive capability is required. Bundled JavaScript assets must still be
deployed normally. Each diagram gets its own symbol IDs and scoped skin CSS,
including in Shadow DOM. External SVG resources and active content are removed.

Trusted skin declarations are also applied directly to symbol definitions. This
preserves their strokes and fills in SVG `use` instances, whose shadow trees
cannot reliably match selectors scoped to an ancestor SVG.

The document theme selects the default or dark skin. `config.skin: 'default'`
or `'dark'` overrides that choice. Unknown skin names produce a local error.
Diagrams scale down to the container width; overflow remains scrollable.

Malformed input and rendering failures preserve source text and emit the
existing `extension-render-error` diagnostic through `onDiagnostic`. Unrelated
blocks continue rendering. Cancellation prevents pending output from being
inserted; updates and disposal remove previous diagram nodes.

The document's `maxSourceBytes` applies before parsing. Additional fixed limits
bound synchronous rendering: 256 signals, 65,536 estimated waveform cells
(including period and horizontal scale), 20,000 data nodes and nesting
depth 32. Numeric values must be finite and lie between -4096 and 4096; signal
periods must be greater than zero and at most 100. These are rendering limits,
not a complete WaveJSON schema validator. A running synchronous WaveDrom render
cannot be interrupted midway.

Wrap a diagram in a `::: figure Title {#label}` container when using
`cross-references` to add a numbered caption and refer to it with
`{@ref label}`.
