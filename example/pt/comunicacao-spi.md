# SPI: clock e seleção

**Extensões:** `wavedrom`, `didactic`, `cross-references`.

## Ideias principais

A seleção ativa em nível baixo delimita a troca de dados. Este desenho é
esquemático: cada segmento D0–D3 representa um intervalo de dado, não um byte
completo.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

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

## Prática

Quando a seleção está ativa? Quantos intervalos de dados estão identificados?

::: solution Resposta comentada

CS_n está ativa quando vale zero. Há quatro intervalos, D0 a D3; o barramento
pode transportar dados nos dois sentidos.

:::

[Índice da coleção](README.md)

[English](../en/comunicacao-spi.md) · [Español](../es/comunicacao-spi.md)
