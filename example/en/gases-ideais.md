# Ideal gases: pressure and volume

**Objective:** interpret an inversely proportional relationship.
**Extensions:** Vega-Lite, MathJax.

## Key ideas

For a fixed amount of ideal gas at constant temperature, $PV=k$. If volume
doubles, pressure halves. Pressure and volume are inversely proportional: their
product is constant, not their sum.

```vega-lite
{
  "title": "Pressure and volume",
  "data": {
    "values": [
      {
        "x": 1,
        "y": 12
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 6,
        "y": 2
      },
      {
        "x": 12,
        "y": 1
      }
    ]
  },
  "mark": {
    "type": "line",
    "point": true
  },
  "encoding": {
    "x": {
      "field": "x",
      "type": "quantitative",
      "title": "Volume"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Pressure",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Volume"
      },
      {
        "field": "y",
        "title": "Pressure"
      }
    ]
  }
}
```

The simulated data use $k=12$ in consistent arbitrary units. The curve connects
samples of $P=12/V$ for positive volumes. The model is undefined at $V=0$ and
does not imply that real gases obey the relationship under all conditions.

The more general equation is $PV=nRT$, with absolute temperature in kelvins.
Keeping temperature and amount of substance fixed is essential to obtain the
relationship in the graph. Changing those variables requires a different
calculation.

## Practice

1. What is the pressure at $V=3$ in this model?
2. If absolute temperature doubles at fixed volume, how does pressure change?

## Answers with explanations

1. $P=4$ pressure units.
2. It doubles, with constant $n$ in the ideal model.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/gases-ideais.md) ·
[Español](../es/gases-ideais.md)
