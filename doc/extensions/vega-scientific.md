# Scientific chart presets

These configurations are starting points for scientific figures. Include the
appropriate `config` in the fence JSON. The chart specification still controls
domains, orientation, units, and data grouping.

## Shared visual defaults

Use these settings with either `vega` or `vega-lite`. A white background makes
the figure usable on screen and in print. Dark foreground colors stay readable
when the surrounding document uses dark mode. Explicit domain and tick colors
make the axes visible in standalone exports.

```json
{
    "config": {
        "background": "#ffffff",
        "axis": {
            "domainColor": "#374151",
            "tickColor": "#374151",
            "labelColor": "#111827",
            "titleColor": "#111827",
            "gridColor": "#d1d5db",
            "labelFontSize": 12,
            "titleFontSize": 13
        }
    }
}
```

Put physical units in axis titles, such as `V (V)` or `I (mA)`. Keep the
plotted values in those same units. Choose domains based on the data and the
physical question. For opposed axes, assign each family its own scale and
reverse one scale explicitly. The
[Vega-Lite example](../../example/en/curvas-cientificas.md) keeps positive
voltage magnitudes while reversing the upper axis.

## Multiple curve families

In Vega-Lite, group each line with `encoding.detail` so each individual curve
becomes a separate path. Use layers to give families different styles. Assign a
dash pattern as well as color when the figure must remain legible in grayscale.
The
[multilayer fixture](../../test/markdown/extensions/vega-lite-multilayer.md)
shows separate filters, series identifiers, and a dashed family.

In Vega, use named datasets and scales and a separate line mark per independent
series, or facet the rows by series before drawing the line. The
[measured-voltage example](../../example/en/tensao-vega.md) shows the named
dataset, axes and explicit positional encodings.

Give the spec a description and wrap a numbered chart in a figure container
with a caption. For mathematical annotations supplied by the host, see
[Vega mathematical labels](vega-math-labels.md).
