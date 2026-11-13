# Math labels spike

```vega-lite
{
  "description": "Explicit math annotations",
  "width": "container",
  "height": 230,
  "data": {
    "values": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 10,
        "y": 8
      }
    ]
  },
  "encoding": {
    "x": {
      "field": "x",
      "type": "quantitative"
    },
    "y": {
      "field": "y",
      "type": "quantitative"
    }
  },
  "layer": [
    {
      "mark": "line"
    },
    {
      "data": {
        "values": [
          {
            "x": 1,
            "y": 2,
            "key": "math-label-0"
          },
          {
            "x": 3,
            "y": 4,
            "key": "math-label-1"
          },
          {
            "x": 5,
            "y": 6,
            "key": "math-label-2"
          },
          {
            "x": 7,
            "y": 8,
            "key": "math-label-3"
          },
          {
            "x": 2,
            "y": 7,
            "key": "math-label-4"
          },
          {
            "x": 4,
            "y": 8,
            "key": "math-label-5"
          },
          {
            "x": 6,
            "y": 9,
            "key": "math-label-6"
          },
          {
            "x": 8,
            "y": 4,
            "key": "math-label-7"
          },
          {
            "x": 9,
            "y": 6,
            "key": "math-label-8"
          }
        ]
      },
      "mark": {
        "type": "text",
        "align": "center",
        "baseline": "alphabetic",
        "opacity": 1
      },
      "name": "markdown_math",
      "encoding": {
        "text": {
          "field": "key"
        }
      }
    },
    {
      "data": {
        "values": [
          {
            "x": 4,
            "y": 1,
            "label": "$untrusted_data$"
          }
        ]
      },
      "mark": "text",
      "encoding": {
        "text": {
          "field": "label"
        }
      }
    }
  ]
}
```
