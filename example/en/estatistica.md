# Statistics: grade distribution and mean

**Objective:** interpret frequencies and calculate a weighted mean.
**Extensions:** Vega-Lite and MathJax.

## Data from a fictional class

The table represents 20 students. The data are simulated for study and are not
related to an actual school. Each bar shows how many students obtained a
particular grade.

```vega-lite
{
  "title": "Grade distribution — fictional class",
  "data": {
    "values": [
      {
        "nota": 4,
        "frequencia": 2
      },
      {
        "nota": 5,
        "frequencia": 3
      },
      {
        "nota": 6,
        "frequencia": 5
      },
      {
        "nota": 7,
        "frequencia": 6
      },
      {
        "nota": 8,
        "frequencia": 3
      },
      {
        "nota": 9,
        "frequencia": 1
      }
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "nota",
      "type": "ordinal",
      "title": "Grade"
    },
    "y": {
      "field": "frequencia",
      "type": "quantitative",
      "title": "Number of students"
    },
    "tooltip": [
      {
        "field": "nota",
        "type": "ordinal",
        "title": "Grade"
      },
      {
        "field": "frequencia",
        "type": "quantitative",
        "title": "Number of students"
      }
    ]
  }
}
```

## Different summaries

The mode is 7, the most frequent grade. The mean weights each grade by the
number of students who obtained it:

$$
\bar x=\frac{4\cdot2+5\cdot3+6\cdot5+7\cdot6+8\cdot3+9\cdot1}{20}=6.4.
$$

For the median, order the 20 grades and take the mean of positions 10 and 11.
They are 6 and 7, so the median is 6.5. Mean, median and mode answer different
questions and may not coincide.

## Practice

1. How many students obtained a grade of at least 7?
2. Is the mean of the six distinct grades equal to the class mean?

## Answers with explanations

1. $6+3+1=10$ students.
2. No; the grades have different frequencies and require those weights.
