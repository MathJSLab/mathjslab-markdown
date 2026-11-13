# Vega-Lite in Markdown

The `vega-lite` fence accepts a Vega-Lite JSON specification. Embedded data
keeps a note self-contained.

```vega-lite
{
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "data": { "values": [{"group":"A","value":12},{"group":"B","value":20}] },
    "mark": "bar",
    "encoding": {
        "x": { "field":"group", "type":"nominal" },
        "y": { "field":"value", "type":"quantitative" }
    }
}
```

`data.url` resolves against the Markdown document and is read through the
engine's resource service. JSON/CSV datasets are embedded after the bounded
read. The extension finalizes its view and disconnects resize observers when
the document is replaced or disposed.

Vega-Embed creates a live SVG without an actions toolbar. Set a
`description` in the spec and give a surrounding figure a meaningful
caption. Vega emits ARIA attributes on SVG marks and guides. Choose
`"width": "container"` for charts that should follow the available width.
Fixed widths are useful for charts with absolute annotation positions.

Group each line by its series using the `detail` encoding. Use layers for
families with different styles, and use independent scales and an explicit
reverse direction for opposed axes. The data can keep its original
positive magnitudes. Text marks and axis titles remain literal strings.

The extension requires `interactive` and `network` capabilities. It uses
the Vega expression interpreter and ignores author-provided
`usermeta.embedOptions`. Dataset requests use the document resource
service. Image marks are blocked because Vega hands image URLs to the
browser outside the service's bounded reads. Links are limited to HTTP(S)
URLs allowed by the policy. The live SVG is managed by Vega, and the
extension applies resource controls at the loader boundary.

The expression interpreter supports inline JSON charts under a CSP that
disallows `unsafe-eval`. Vega's upstream CSV/TSV decoder still needs
`unsafe-eval`. Use embedded JSON values for charts on hosts with that CSP.

If a chart shows its source, inspect the accompanying diagnostic for JSON
syntax, a missing dependency, or a rejected resource. A relative dataset
URL resolves against the Markdown document URL.

Hosts can opt in to [static SVG export](../visual-export.md).
For explicitly selected TeX annotations, see [mathematical labels](vega-math-labels.md).
See [scientific chart presets](vega-scientific.md) for print-ready axes and independent series.
