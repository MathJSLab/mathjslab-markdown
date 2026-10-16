# UART: start, data and stop

**Extensions:** `wavedrom`, `didactic`, `cross-references`.

## Key ideas

An asynchronous transmission has no separate clock wire. This frame uses one
start bit, four data bits 1,0,1,1 and one stop bit, all with equal duration.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "TX",
      "wave": "10101.."
    },
    {
      "name": "frame",
      "wave": "x234567",
      "data": [
        "start",
        "D0=1",
        "D1=0",
        "D2=1",
        "D3=1",
        "stop"
      ]
    }
  ],
  "head": {
    "text": "UART",
    "tick": 0
  }
}
```

::::

## Practice

What is the idle level? How many bit periods does the frame occupy, excluding
idle?

::: solution Answer with explanation

Idle is high. The frame occupies six periods: one start, four data and one
stop. The last extended high level includes the stop.

:::

[Collection index](README.md)

[Português brasileiro](../pt/quadro-uart.md) · [Español](../es/quadro-uart.md)
