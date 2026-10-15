# UART: inicio, datos y parada

**Extensiones:** `wavedrom`, `didactic`, `cross-references`.

## Ideas principales

Una transmisión asíncrona no utiliza un cable de reloj separado. Esta trama usa
un bit de inicio, cuatro bits de datos 1,0,1,1 y un bit de parada, todos con
igual duración.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "TX",
      "wave": "1010111"
    },
    {
      "name": "frame",
      "wave": "x234567",
      "data": [
        "inicio",
        "D0=1",
        "D1=0",
        "D2=1",
        "D3=1",
        "parada"
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

## Práctica

¿Cuál es el nivel de reposo? ¿Cuántos períodos de bit ocupa la trama,
excluyendo el reposo?

::: solution Respuesta comentada

El reposo es alto. La trama ocupa seis períodos: un inicio, cuatro datos y una
parada. El último nivel alto prolongado incluye la parada.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/quadro-uart.md) · [English](../en/quadro-uart.md)
