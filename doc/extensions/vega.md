# Vega in Markdown

Use the optional `vega` feature or register `vegaExtension()` from
`mathjslab-markdown/extensions`. The fence accepts a Vega 6 JSON object.
Vega gives authors direct control over named datasets, scales, axes and
marks.

```vega
{
  "description": "A blue square",
  "width": 80,
  "height": 60,
  "marks": [{
    "type": "rect",
    "encode": {"enter": {
      "x": {"value": 20}, "y": {"value": 10},
      "width": {"value": 40}, "height": {"value": 40},
      "fill": {"value": "steelblue"}
    }}
  }]
}
```

The measured voltage example plots named samples on explicit linear scales.
See [Portuguese](../../example/pt/tensao-vega.md),
[English](../../example/en/tensao-vega.md) or
[Spanish](../../example/es/tensao-vega.md).

The renderer uses SVG, intrinsic sizing and the common fence sizing
attributes. Set `description` in the spec and use a figure caption to
describe the plot. The document session owns the View and resize
observer. Updates and disposal release them, including when rendering is
cancelled. The feature supports visible-mode rendering.

Vega requires the `interactive` and `network` capabilities. Dataset URLs
resolve relative to the Markdown document and pass through its resource
service, including when a Vega signal supplies a URL. Vega interprets
the dataset's `format` options. Use embedded JSON values on hosts that
disallow `unsafe-eval` and need to avoid the upstream CSV/TSV parser.
Image resources and non-HTTP links follow the same restrictions as
[Vega-Lite](vega-lite.md). The host controls the embed options.

The live SVG has no actions toolbar. Hosts can opt in to
[static SVG export](../visual-export.md). For source fallback, inspect the diagnostic for invalid JSON,
a missing runtime, a blocked capability or a resource policy failure.

See [mathematical labels](vega-math-labels.md) for opt-in TeX annotations.
See [scientific chart presets](vega-scientific.md) for reusable axis settings.
