# Parallel and perpendicular lines

**Extensions:** `geometry`, `didactic`, `cross-references`.

## Key ideas

A and B define a line. The two lines through P depend on AB’s direction: one is
parallel and the other perpendicular. Drag the three points without making A
coincide with B.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```geometry
{
  "title": "Parallel and perpendicular lines",
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

## Practice

AB has slope 1/2. What are the slopes of the parallel and perpendicular lines?

::: solution Answer with explanation

The parallel has slope 1/2; the perpendicular has slope -2. The product of the
slopes is -1.

:::

[Collection index](README.md)

[Português brasileiro](../pt/paralelas-e-perpendiculares.md) ·
[Español](../es/paralelas-e-perpendiculares.md)
