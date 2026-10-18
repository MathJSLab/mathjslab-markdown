# WaveDrom timing, register and logic diagrams

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

Use a `wavedrom` fence containing a WaveJSON object with exactly one nonempty
`signal`, `reg` or `assign` array. Both JSON and JSON5 are supported: comments,
unquoted property names, single-quoted strings and trailing commas are
accepted. Input is parsed as data. JavaScript expressions, functions and
executable statements are not accepted.

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
all three families: `signal`, `reg` and `assign`. Exactly one family must be
present in each fence. Mixed-family objects are rejected instead of silently
choosing the first family.

## Register maps

Fields are listed from least significant to most significant bits. Each field
requires a positive integer `bits`; `name` is text or a number, and `attr` is
text, a number or a flat list of these values. Numeric names display bit values
using the native 32-bit bitwise representation. Numeric names require fields no
wider than 32 bits; use text names for wider fields. Optional numeric `type`
values select the library's field colors.

```wavedrom
{reg: [{bits: 1, name: 'EN'}, {bits: 3, name: 'MODE'},
       {bits: 4, name: 'FLAGS', attr: 'RW'}],
 config: {bits: 8, lanes: 1}}
```

`config.bits` defaults to the total field width and cannot be smaller than that
total. `lanes` controls rows; `hspace`, `vspace` and `fontsize` control native
layout. Markdown `{width=... height=...}` attributes control presentation
independently of these layout settings.

## Logic expressions

`assign` contains `[outputName, expression]` pairs. Leaves are nonempty
signal-name strings; nested arrays start with an operator. This version accepts
`&`, `~&`, `|`, `~|`, `^`, `~^`, `~`, `=`, `+`, `-` and `*`. NOT (`~`) requires
one operand. Object annotations, arbitrary operators, JavaScript expressions
and executable code are unsupported. Operators depict logic or arithmetic
structure; the extension does not evaluate expressions, simulate signals or
synthesize VHDL/Verilog.

```wavedrom
{assign: [['SUM', ['^', 'A', 'B']], ['CARRY', ['&', 'A', 'B']]]}
```

`config.fontWidth` and `treeSpacing` optionally adjust native layout; both must
be positive and at most 128. Register and logic diagrams retain their own
native drawing styles, isolated inside the SVG, and adapt to dark themes.

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
depth 32. Numeric layout values must be finite and lie between -4096 and 4096.
Register name and attribute numbers may have absolute values up to 4294967295
because they are labels, not layout dimensions. Signal periods must be greater
than zero and at most 100. These are rendering limits, not a complete WaveJSON
schema validator. A running synchronous WaveDrom render cannot be interrupted
midway.

Wrap a diagram in a `::: figure Title {#label}` container when using
`cross-references` to add a numbered caption and refer to it with
`{@ref label}`.

Register limits: 256 fields, 4096 total bits, at most 256 lanes, 65536 expanded
bit positions, 16 attributes per field, font size at most 64 and vertical
spacing at most 512. Logic limits: 64 outputs, 512 expression nodes, depth 16
and names at most 256 characters. Family-specific limits are checked before
invoking the synchronous renderer.
