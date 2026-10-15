# SPI: clock and selection

**Extensions:** `wavedrom`, `didactic`, `cross-references`.

## Key ideas

An active-low select delimits the data exchange. This is a schematic drawing:
each D0–D3 segment represents a data interval, not a whole byte.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "CS_n",
      "wave": "10....1."
    },
    {
      "name": "SCLK",
      "wave": "0p....0."
    },
    {
      "name": "MOSI",
      "wave": "x2345.x.",
      "data": [
        "D0",
        "D1",
        "D2",
        "D3"
      ]
    },
    {
      "name": "MISO",
      "wave": "x2345.x.",
      "data": [
        "R0",
        "R1",
        "R2",
        "R3"
      ]
    }
  ],
  "head": {
    "text": "SPI",
    "tick": 0
  }
}
```

::::

## Practice

When is selection active? How many data intervals are labelled?

::: solution Answer with explanation

CS_n is active when zero. There are four intervals, D0–D3; the bus can transfer
data in both directions.

:::

[Collection index](README.md)

[Português brasileiro](../pt/comunicacao-spi.md) ·
[Español](../es/comunicacao-spi.md)
