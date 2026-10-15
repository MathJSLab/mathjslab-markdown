# Quadratic functions: roots and vertex

**Objective:** connect an algebraic expression, zeros and the graph of a
parabola. **Extensions:** MathJax, Vega-Lite.

## Key ideas

A quadratic function has the form $f(x)=ax^2+bx+c$, with $a\ne0$. The sign of
$a$ determines whether the parabola opens upward or downward. For
$f(x)=x^2-4x+3$, factoring as $(x-1)(x-3)$ gives the zeros 1 and 3. Zeros are
inputs that produce zero output, not maximum points.

Completing the square gives $f(x)=(x-2)^2-1$. Because a square is nonnegative,
the minimum value is -1 at $x=2$. The vertex is $(2,-1)$ and the axis of
symmetry is the line $x=2$.

```vega-lite
{
  "title": "A parabola",
  "data": {
    "values": [
      {
        "x": -1,
        "y": 8
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": -1
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 8
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
      "title": "x"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "f(x)",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "x"
      },
      {
        "field": "y",
        "title": "f(x)"
      }
    ]
  }
}
```

The points were calculated from the formula. The line connects samples to aid
reading; the function is also defined between those points. Compare the values
at 0 and 4, which are equally far from the axis of symmetry.

## Practice

1. Calculate $f(0)$ and $f(4)$.
2. What values can $f(x)$ take for real $x$?

## Answers with explanations

1. Both equal 3, confirming symmetry.
2. All real numbers greater than or equal to -1.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/funcao-quadratica.md) ·
[Español](../es/funcao-quadratica.md)
