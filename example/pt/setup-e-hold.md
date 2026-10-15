# Setup e hold: janela de estabilidade

**Extensões:** `wavedrom`, `didactic`, `cross-references`.

## Ideias principais

O dado deve estabilizar antes da borda de amostragem e permanecer estável
depois dela. Os marcadores mostram a ordem dos eventos; a escala é ilustrativa
e não especifica tempos de um dispositivo.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "DATA",
      "wave": "x.3...x",
      "data": [
        "estável"
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

## Prática

Qual marcador representa a amostragem? Qual intervalo corresponde ao hold?

::: solution Resposta comentada

c representa a borda de amostragem. O hold vai de c até b, depois da borda.

:::

[Índice da coleção](README.md)

[English](../en/setup-e-hold.md) · [Español](../es/setup-e-hold.md)
