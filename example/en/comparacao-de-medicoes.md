# Comparing measurements: two groups

**Extensions:** `vega-lite`, `mathjax`.

## Key ideas

Simulated data compare three measurements in two groups. Lines help follow the
sequence but establish neither causality nor a population trend.

```vega-lite
{
  "data": {
    "values": [
      {
        "step": 1,
        "group": "A",
        "value": 2
      },
      {
        "step": 2,
        "group": "A",
        "value": 4
      },
      {
        "step": 3,
        "group": "A",
        "value": 6
      },
      {
        "step": 1,
        "group": "B",
        "value": 3
      },
      {
        "step": 2,
        "group": "B",
        "value": 3
      },
      {
        "step": 3,
        "group": "B",
        "value": 6
      }
    ]
  },
  "mark": {
    "type": "line",
    "point": true
  },
  "encoding": {
    "x": {
      "field": "step",
      "type": "ordinal",
      "title": "Step"
    },
    "y": {
      "field": "value",
      "type": "quantitative",
      "title": "Value"
    },
    "color": {
      "field": "group",
      "type": "nominal",
      "title": "Group"
    }
  }
}
```

## Practice

What is each group’s mean? Do equal means imply equal trajectories?

## Answer with explanation

Both means are $12/3=4$. The trajectories differ at the first two steps.

[Collection index](README.md)

[Português brasileiro](../pt/comparacao-de-medicoes.md) ·
[Español](../es/comparacao-de-medicoes.md)
