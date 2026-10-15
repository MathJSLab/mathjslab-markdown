# Probability: sums of two dice

**Objective:** count equally likely outcomes and distinguish outcomes from
events. **Extensions:** Vega-Lite, MathJax.

## Key ideas

Two fair, independent dice produce 36 equally likely ordered pairs. The pair
$(1,6)$ differs from $(6,1)$ because it assigns results to different dice. A
sum is an event that can contain several pairs.

```vega-lite
{
  "title": "Sums of two dice",
  "data": {
    "values": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 6,
        "y": 5
      },
      {
        "x": 7,
        "y": 6
      },
      {
        "x": 8,
        "y": 5
      },
      {
        "x": 9,
        "y": 4
      },
      {
        "x": 10,
        "y": 3
      },
      {
        "x": 11,
        "y": 2
      },
      {
        "x": 12,
        "y": 1
      }
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "x",
      "type": "ordinal",
      "title": "Sum"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Possible pairs",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Sum"
      },
      {
        "field": "y",
        "title": "Possible pairs"
      }
    ]
  }
}
```

A sum of 7 occurs in six pairs; a sum of 2 occurs only in $(1,1)$. Thus,
$P(S=7)=6/36=1/6$ and $P(S=2)=1/36$. The possible sums are not equally likely,
even though the pairs are. The chart shows theoretical counts, not observed
frequencies from an experiment.

With few throws, frequencies can differ substantially from probabilities. A
previous outcome does not change the next throw when independence holds. This
distinction avoids the idea that an outcome is “overdue”.

## Practice

1. Count the pairs producing a sum of 4.
2. Calculate the probability of a sum of at least 11.

## Answers with explanations

1. $(1,3),(2,2),(3,1)$: three pairs.
2. Two pairs give 11 and one gives 12: $3/36=1/12$.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/probabilidade-dados.md) ·
[Español](../es/probabilidade-dados.md)
