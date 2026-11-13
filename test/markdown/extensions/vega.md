See {@ref vega-voltage} for the measured voltage.

::: figure Measured voltage {#vega-voltage}

```vega
{
  "$schema": "https://vega.github.io/schema/vega/v6.json",
  "description": "Measured voltage",
  "width": 240,
  "height": 100,
  "padding": 5,
  "data": [{"name": "samples", "url": "../resources/vega-voltage.json", "format": {"type": "json", "property": "samples"}}],
  "scales": [
    {"name": "time", "type": "linear", "domain": [0, 2], "range": "width"},
    {"name": "voltage", "type": "linear", "domain": [0, 4], "range": "height"}
  ],
  "axes": [{"orient": "bottom", "scale": "time", "title": "Time"}, {"orient": "left", "scale": "voltage", "title": "Voltage"}],
  "marks": [{
    "type": "line",
    "from": {"data": "samples"},
    "encode": {"enter": {"x": {"scale": "time", "field": "t"}, "y": {"scale": "voltage", "field": "v"}, "stroke": {"value": "#285ea8"}}}
  }]
}
```

:::
