# Tensão medida com Vega

A escala converte segundos e volts em coordenadas do gráfico.

```vega
{
  "description": "Tensão medida com Vega",
  "width": 240,
  "height": 100,
  "padding": 5,
  "data": [{"name": "samples", "values": [{"t": 0, "v": 0}, {"t": 1, "v": 3}, {"t": 2, "v": 4}]}],
  "scales": [
    {"name": "time", "type": "linear", "domain": [0, 2], "range": "width"},
    {"name": "voltage", "type": "linear", "domain": [0, 4], "range": "height"}
  ],
  "axes": [{"orient": "bottom", "scale": "time", "title": "t (s)"}, {"orient": "left", "scale": "voltage", "title": "V (V)"}],
  "marks": [{
    "type": "line",
    "from": {"data": "samples"},
    "encode": {"enter": {"x": {"scale": "time", "field": "t"}, "y": {"scale": "voltage", "field": "v"}, "stroke": {"value": "#285ea8"}}}
  }]
}
```
