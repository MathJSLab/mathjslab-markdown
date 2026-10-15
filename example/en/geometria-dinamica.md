# Dynamic geometry: midpoints and circles

**Extensions:** `geometry`, `didactic`, `cross-references`.

## Key ideas

Drag A and B in {@ref ponto-medio}. M depends on the endpoints.

In {@ref circulo}, P slides along the circle; O is fixed and C changes the
radius. Enable the `interactive` capability.

:::: figure Midpoint {#ponto-medio}

```geometry
{
  "title": "Drag A and B",
  "boundingBox": [
    -2,
    5,
    7,
    -3
  ],
  "axis": true,
  "grid": true,
  "elements": [
    {
      "id": "A",
      "type": "point",
      "parents": [
        0,
        0
      ]
    },
    {
      "id": "B",
      "type": "point",
      "parents": [
        4,
        2
      ]
    },
    {
      "id": "AB",
      "type": "segment",
      "parents": [
        "A",
        "B"
      ]
    },
    {
      "id": "M",
      "type": "midpoint",
      "parents": [
        "A",
        "B"
      ],
      "attributes": {
        "strokeColor": "#16a34a",
        "fillColor": "#16a34a"
      }
    }
  ]
}
```

::::

:::: figure Point on the circle {#circulo}

```geometry
{
  "title": "Drag C and P",
  "boundingBox": [
    -4,
    4,
    4,
    -4
  ],
  "axis": true,
  "elements": [
    {
      "id": "O",
      "type": "point",
      "parents": [
        0,
        0
      ],
      "attributes": {
        "fixed": true
      }
    },
    {
      "id": "C",
      "type": "point",
      "parents": [
        2,
        0
      ]
    },
    {
      "id": "circle",
      "type": "circle",
      "parents": [
        "O",
        "C"
      ]
    },
    {
      "id": "P",
      "type": "glider",
      "parents": [
        0,
        2,
        "circle"
      ]
    },
    {
      "id": "radius",
      "type": "segment",
      "parents": [
        "O",
        "P"
      ]
    },
    {
      "id": "angle",
      "type": "angle",
      "parents": [
        "C",
        "O",
        "P"
      ],
      "attributes": {
        "fillColor": "#93c5fd",
        "fillOpacity": 0.4
      }
    }
  ]
}
```

::::

## Practice

If A=(2,2) and B=(4,2), where is M? Why do OP and OC have the same length?

## Answer with explanation

M=(3,2), from the coordinate averages. OP and OC are radii of the same circle.

[Collection index](README.md)

[Português brasileiro](../pt/geometria-dinamica.md) ·
[Español](../es/geometria-dinamica.md)
