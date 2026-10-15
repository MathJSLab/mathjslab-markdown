# Elipse: soma das distâncias aos focos

**Extensões:** `geometry`, `didactic`, `cross-references`.

## Ideias principais

A elipse tem focos F1 e F2 e soma das distâncias igual a 6. Arraste P sobre a
curva e compare os segmentos até os focos. Os focos são fixos para manter a
mesma elipse.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```geometry
{
  "title": "Elipse: soma das distâncias aos focos",
  "boundingBox": [
    -5,
    4,
    5,
    -4
  ],
  "axis": true,
  "elements": [
    {
      "id": "F1",
      "type": "point",
      "parents": [
        -2,
        0
      ],
      "attributes": {
        "fixed": true
      }
    },
    {
      "id": "F2",
      "type": "point",
      "parents": [
        2,
        0
      ],
      "attributes": {
        "fixed": true
      }
    },
    {
      "id": "ellipse",
      "type": "ellipse",
      "parents": [
        "F1",
        "F2",
        6
      ]
    },
    {
      "id": "P",
      "type": "glider",
      "parents": [
        3,
        0,
        "ellipse"
      ]
    },
    {
      "id": "d1",
      "type": "segment",
      "parents": [
        "F1",
        "P"
      ]
    },
    {
      "id": "d2",
      "type": "segment",
      "parents": [
        "F2",
        "P"
      ]
    }
  ]
}
```

::::

## Prática

Quanto vale PF1+PF2? Onde estão os extremos do eixo maior?

::: solution Resposta comentada

A soma vale 6. Os extremos são (-3,0) e (3,0), pois o semieixo maior vale 3.

:::

[Índice da coleção](README.md)

[English](../en/elipse-e-focos.md) · [Español](../es/elipse-e-focos.md)
