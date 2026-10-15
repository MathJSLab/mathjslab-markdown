# Setup and hold: stability window

**Extensions:** `wavedrom`, `didactic`, `cross-references`.

## Key ideas

Data must settle before the sampling edge and remain stable afterwards. Markers
show event order; the scale is illustrative and specifies no device timing.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "DATA",
      "wave": "x.3...x",
      "data": [
        "stable"
      ],
      "node": "..a.b.."
    },
    {
      "name": "CLK",
      "wave": "0..1.0.",
      "node": "...c..."
    }
  ],
  "edge": [
    "a~>c setup",
    "c~>b hold"
  ],
  "head": {
    "tick": 0
  }
}
```

::::

## Practice

Which marker represents sampling? Which interval is hold?

::: solution Answer with explanation

c marks the sampling edge. Hold extends from c to b, after the edge.

:::

[Collection index](README.md)

[Português brasileiro](../pt/setup-e-hold.md) ·
[Español](../es/setup-e-hold.md)
