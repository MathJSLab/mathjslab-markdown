# Comparação de medições: dois grupos

**Extensões:** `vega-lite`, `mathjax`.

## Ideias principais

Os dados simulados comparam três medições em dois grupos. Linhas ajudam a
seguir a sequência, mas não demonstram causalidade nem uma tendência
populacional.

```vega-lite
{
  "data": {
    "values": [
      {
        "step": 1,
        "group": "A",
        "value": 2
      },
      {
        "step": 2,
        "group": "A",
        "value": 4
      },
      {
        "step": 3,
        "group": "A",
        "value": 6
      },
      {
        "step": 1,
        "group": "B",
        "value": 3
      },
      {
        "step": 2,
        "group": "B",
        "value": 3
      },
      {
        "step": 3,
        "group": "B",
        "value": 6
      }
    ]
  },
  "mark": {
    "type": "line",
    "point": true
  },
  "encoding": {
    "x": {
      "field": "step",
      "type": "ordinal",
      "title": "Etapa"
    },
    "y": {
      "field": "value",
      "type": "quantitative",
      "title": "Valor"
    },
    "color": {
      "field": "group",
      "type": "nominal",
      "title": "Grupo"
    }
  }
}
```

## Prática

Qual é a média de cada grupo? Médias iguais implicam trajetórias iguais?

## Resposta comentada

Ambas as médias valem $12/3=4$. As trajetórias diferem nas duas primeiras
etapas.

[Índice da coleção](README.md)

[English](../en/comparacao-de-medicoes.md) ·
[Español](../es/comparacao-de-medicoes.md)
