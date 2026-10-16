# UART: início, dados e parada

**Extensões:** `wavedrom`, `didactic`, `cross-references`.

## Ideias principais

Uma transmissão assíncrona não usa um clock separado no fio. Este quadro usa um
bit de início, quatro bits de dados 1,0,1,1 e um bit de parada, todos com a
mesma duração.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

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
        "início",
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

## Prática

Qual é o nível de repouso? Quantos períodos de bit ocupa o quadro, excluindo o
repouso?

::: solution Resposta comentada

O repouso é alto. O quadro ocupa seis períodos: um início, quatro dados e uma
parada. O último nível alto prolongado inclui a parada.

:::

[Índice da coleção](README.md)

[English](../en/quadro-uart.md) · [Español](../es/quadro-uart.md)
