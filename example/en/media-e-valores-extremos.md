# Mean, median and extreme values

**Objective:** compare measures of center and examine an extreme observation’s
effect. **Extensions:** Vega-Lite, MathJax, relative-urls, heading-ids,
syntax-highlight.

## Key ideas

The five fictional observations $10,11,12,13,54$ illustrate an asymmetric
distribution. The mean is $100/5=20$; the median is 12, the middle value after
sorting. One high observation strongly affects the mean.

```vega-lite
{
  "title": "Fictional observations",
  "data": {
    "values": [
      {
        "x": 1,
        "y": 10
      },
      {
        "x": 2,
        "y": 11
      },
      {
        "x": 3,
        "y": 12
      },
      {
        "x": 4,
        "y": 13
      },
      {
        "x": 5,
        "y": 54
      }
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "x",
      "type": "ordinal",
      "title": "Observation"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Value",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Observation"
      },
      {
        "field": "y",
        "title": "Value"
      }
    ]
  }
}
```

```csv
id,value
1,10
2,11
3,12
4,13
5,54
```

The same data are in the [CSV file](resources/observacoes.csv). In the header,
`id` identifies the observation and `value` stores its value. These identifiers
are the same in all three languages to preserve automated reading. The chart
shows individual values, not frequencies.

Before removing 54, investigate its origin. It may be an error or a valid
observation. Without context, excluding it merely because it differs can
distort analysis. Compare measures and report your choices. Use the practice
link at the end to test navigation by headings.

## Practice

1. Replace 54 with 14. Calculate mean and median.
2. Which measure changed more?

## Answers with explanations

1. Both become 12.
2. The mean fell from 20 to 12; the median remained 12.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/media-e-valores-extremos.md) ·
[Español](../es/media-e-valores-extremos.md)
