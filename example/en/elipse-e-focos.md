# Ellipse: sum of distances to the foci

**Extensions:** `geometry`, `didactic`, `cross-references`.

## Key ideas

The ellipse has foci F1 and F2 and distance sum 6. Drag P along the curve and
compare the segments to the foci. The foci are fixed to preserve this ellipse.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```geometry
{
  "title": "Ellipse: sum of distances to the foci",
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

## Practice

What is PF1+PF2? Where are the major-axis endpoints?

::: solution Answer with explanation

The sum is 6. The endpoints are (-3,0) and (3,0), because the semi-major axis
is 3.

:::

[Collection index](README.md)

[Português brasileiro](../pt/elipse-e-focos.md) ·
[Español](../es/elipse-e-focos.md)
