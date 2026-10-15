# Physics: uniform motion and graph slope

**Objective:** connect position, time and constant velocity. **Extensions:**
Vega-Lite and MathJax.

## An idealized model

An object starts at position 2 m and moves at 3 m/s along a straight path. With
no acceleration, its position is $s(t)=2+3t$. The data are calculated from the
model rather than obtained by measurement.

```vega-lite
{
  "title": "Position as a function of time",
  "data": {"values": [
    {"tempo":0,"posicao":2},{"tempo":1,"posicao":5},
    {"tempo":2,"posicao":8},{"tempo":3,"posicao":11},
    {"tempo":4,"posicao":14}
  ]},
  "mark": {"type":"line","point":true},
  "encoding": {
    "x":{"field":"tempo","type":"quantitative","title":"Time (s)"},
    "y":{"field":"posicao","type":"quantitative","title":"Position (m)","scale":{"zero":true}}
  }
}
```

The slope is $\Delta s/\Delta t=3$ m/s. The vertical intercept is the initial
position, not the velocity. Position and distance traveled are also different:
between 0 and 4 s, the displacement is 12 m, although the final position is 14
m.

## Practice

1. Determine the position at 6 s.
2. What would the line look like for a velocity of -3 m/s with the same initial
   position?
3. What does a horizontal line on this graph represent?

## Answers with explanations

1. $s(6)=20$ m.
2. It would slope downward, with equation $s(t)=2-3t$.
3. Constant position and zero velocity in the chosen reference frame.
