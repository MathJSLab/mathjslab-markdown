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
