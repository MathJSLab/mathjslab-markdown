# Opposed voltage axes

The right-to-left PMOS scale displays positive voltage magnitudes without changing the samples.

```vega-lite
{
  "description": "NMOS and PMOS currents on opposed voltage axes",
  "width": 300,
  "height": 160,
  "resolve": {"scale": {"x": "independent"}},
  "layer": [
    {
      "data": {"values": [{"v": 0, "i": 0}, {"v": 1, "i": 2}, {"v": 2, "i": 3}]},
      "mark": "line",
      "encoding": {
        "x": {"field": "v", "type": "quantitative", "axis": {"title": "V_DF1", "orient": "bottom"}},
        "y": {"field": "i", "type": "quantitative", "axis": {"title": "Current"}}
      }
    },
    {
      "data": {"values": [{"v": 0, "i": 0}, {"v": 1, "i": 3}, {"v": 2, "i": 4}]},
      "mark": {"type": "line", "strokeDash": [5, 3]},
      "encoding": {
        "x": {"field": "v", "type": "quantitative", "scale": {"reverse": true}, "axis": {"title": "V_DF2", "orient": "top"}},
        "y": {"field": "i", "type": "quantitative"}
      }
    },
    {
      "data": {"values": [{"x": 100, "y": 40, "label": "I_D1"}, {"x": 200, "y": 75, "label": "I_D2"}]},
      "mark": "text",
      "encoding": {"x": {"field": "x", "type": "quantitative", "scale": null, "axis": null}, "y": {"field": "y", "type": "quantitative", "scale": null, "axis": null}, "text": {"field": "label", "type": "nominal"}}
    }
  ]
}
```
