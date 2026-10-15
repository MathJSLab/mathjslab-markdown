# Comparación de mediciones: dos grupos

**Extensiones:** `vega-lite`, `mathjax`.

## Ideas principales

Los datos simulados comparan tres mediciones en dos grupos. Las líneas ayudan a
seguir la secuencia, pero no demuestran causalidad ni una tendencia
poblacional.

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

## Práctica

¿Cuál es el promedio de cada grupo? ¿Promedios iguales implican trayectorias
iguales?

## Respuesta comentada

Ambos promedios valen $12/3=4$. Las trayectorias difieren en las dos primeras
etapas.

[Índice de la colección](README.md)

[Português brasileiro](../pt/comparacao-de-medicoes.md) ·
[English](../en/comparacao-de-medicoes.md)
