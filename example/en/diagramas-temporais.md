# Digital timing diagrams

**Extensions:** `wavedrom`, `didactic`, `cross-references`.

## Key ideas

Each `wave` character represents a time step. A dot extends the previous state;
digits 2–9 mark bus segments with labels in `data`. The second diagram
separates a request and its acknowledgement.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

Both diagrams use the same native scale. Optional width and height attributes
resize a complete diagram proportionally; they are not needed by default.

```wavedrom
{
  "config": { "hscale": 2 },
  "signal": [
    {
      "name": "clock",
      "wave": "p......"
    },
    {
      "name": "data",
      "wave": "x.34.5x",
      "data": [
        "address",
        "value",
        "end"
      ]
    },
    {
      "name": "valid",
      "wave": "0.1..0."
    }
  ],
  "head": {
    "text": "Transfer",
    "tick": 0
  }
}
```

```wavedrom
{
  "config": { "hscale": 2 },
  "signal": [
    [
      "Control",
      {
        "name": "request",
        "wave": "01...0.",
        "node": ".a....."
      },
      {
        "name": "acknowledgement",
        "wave": "0..1.0.",
        "node": "...b..."
      }
    ],
    {
      "name": "clock",
      "wave": "p......"
    }
  ],
  "edge": [
    "a~>b response"
  ]
}
```

::::

## Practice

At which step does valid rise? How many steps separate request and
acknowledgement?

::: solution Answer with explanation

At step 2, counting from zero. Events a and b are at positions 1 and 3, two
steps apart.

:::

[Collection index](README.md)

[Português brasileiro](../pt/diagramas-temporais.md) ·
[Español](../es/diagramas-temporais.md)
