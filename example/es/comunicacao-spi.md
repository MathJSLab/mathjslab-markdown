# SPI: reloj y selección

**Extensiones:** `wavedrom`, `didactic`, `cross-references`.

## Ideas principales

Una selección activa en nivel bajo delimita el intercambio. Este dibujo es
esquemático: cada segmento D0–D3 representa un intervalo de datos, no un byte
completo.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "CS_n",
      "wave": "10....1."
    },
    {
      "name": "SCLK",
      "wave": "0p...l.."
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

## Práctica

¿Cuándo está activa la selección? ¿Cuántos intervalos de datos están
identificados?

::: solution Respuesta comentada

CS_n está activa cuando vale cero. Hay cuatro intervalos, D0 a D3; el bus puede
transferir datos en ambos sentidos.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/comunicacao-spi.md) ·
[English](../en/comunicacao-spi.md)
