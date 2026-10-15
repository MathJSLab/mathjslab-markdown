# Paralelas e perpendiculares

**Extensões:** `geometry`, `didactic`, `cross-references`.

## Ideias principais

A e B definem uma reta. As duas retas que passam por P dependem da direção de
AB: uma é paralela, a outra perpendicular. Arraste os três pontos sem fazer A
coincidir com B.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```geometry
{
  "title": "Paralelas e perpendiculares",
  "boundingBox": [
    -4,
    5,
    6,
    -4
  ],
  "axis": true,
  "grid": true,
  "elements": [
    {
      "id": "A",
      "type": "point",
      "parents": [
        -1,
        0
      ]
    },
    {
      "id": "B",
      "type": "point",
      "parents": [
        3,
        2
      ]
    },
    {
      "id": "P",
      "type": "point",
      "parents": [
        0,
        3
      ]
    },
    {
      "id": "base",
      "type": "line",
      "parents": [
        "A",
        "B"
      ]
    },
    {
      "id": "parallel",
      "type": "parallel",
      "parents": [
        "base",
        "P"
      ],
      "attributes": {
        "strokeColor": "#16a34a"
      }
    },
    {
      "id": "perpendicular",
      "type": "perpendicular",
      "parents": [
        "base",
        "P"
      ],
      "attributes": {
        "strokeColor": "#dc2626"
      }
    }
  ]
}
```

::::

## Prática

A inclinação de AB é 1/2. Quais são as inclinações da paralela e da
perpendicular?

::: solution Resposta comentada

A paralela tem inclinação 1/2; a perpendicular tem inclinação -2. O produto das
inclinações é -1.

:::

[Índice da coleção](README.md)

[English](../en/paralelas-e-perpendiculares.md) ·
[Español](../es/paralelas-e-perpendiculares.md)
