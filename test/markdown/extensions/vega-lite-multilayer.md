# Independent curves

```vega-lite
{
  "description": "Two independent curve families",
  "width": "container",
  "height": 160,
  "data": {
    "values": [
      {"x": 0, "y": 0, "curve": "A1"}, {"x": 2, "y": 3, "curve": "A1"},
      {"x": 0, "y": 1, "curve": "A2"}, {"x": 2, "y": 5, "curve": "A2"},
      {"x": 3, "y": 4, "curve": "B1"}, {"x": 5, "y": 1, "curve": "B1"},
      {"x": 3, "y": 6, "curve": "B2"}, {"x": 5, "y": 2, "curve": "B2"}
    ]
  },
  "encoding": {
    "x": {"field": "x", "type": "quantitative"},
    "y": {"field": "y", "type": "quantitative"}
  },
  "layer": [
    {"transform": [{"filter": {"field": "curve", "oneOf": ["A1", "A2"]}}],
     "mark": "line", "encoding": {"detail": {"field": "curve"}}},
    {"transform": [{"filter": {"field": "curve", "oneOf": ["B1", "B2"]}}],
     "mark": {"type": "line", "strokeDash": [5, 3]},
     "encoding": {"detail": {"field": "curve"}}},
    {"data": {"values": [{"x": 2, "y": 5, "label": "Family A"}]},
     "mark": {"type": "text", "dy": -8}, "encoding": {"text": {"field": "label"}}}
  ]
}
```
