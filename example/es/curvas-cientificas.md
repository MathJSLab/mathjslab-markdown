# Curvas científicas con ejes contrapuestos

El eje superior usa una escala invertida. Las dos curvas conservan sus valores
positivos. La descripción aporta contexto para los lectores de pantalla.

```vega-lite
{
  "description": "Corrientes de drenaje en ejes contrapuestos",
  "width": 280,
  "height": 140,
  "resolve": {"scale": {"x": "independent"}},
  "layer": [
    {
      "data": {"values": [{"v": 0, "i": 0}, {"v": 1, "i": 2}, {"v": 2, "i": 3}]},
      "mark": "line",
      "encoding": {
        "x": {"field": "v", "type": "quantitative", "axis": {"orient": "bottom", "title": "V_DF1"}},
        "y": {"field": "i", "type": "quantitative", "axis": {"title": "I"}}
      }
    },
    {
      "data": {"values": [{"v": 0, "i": 0}, {"v": 1, "i": 3}, {"v": 2, "i": 4}]},
      "mark": {"type": "line", "strokeDash": [5, 3]},
      "encoding": {
        "x": {"field": "v", "type": "quantitative", "scale": {"reverse": true}, "axis": {"orient": "top", "title": "V_DF2"}},
        "y": {"field": "i", "type": "quantitative"}
      }
    }
  ]
}
```
