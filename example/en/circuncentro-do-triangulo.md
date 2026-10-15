# Circumcenter of a triangle

**Extensions:** `geometry`, `didactic`, `cross-references`.

## Key ideas

Circumcenter O is equidistant from the vertices. Drag A, B and C to compare
acute and obtuse triangles. Avoid collinear vertices, which make the
construction degenerate.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```geometry
{
  "title": "Circumcenter of a triangle",
  "boundingBox": [
    -3,
    6,
    7,
    -3
  ],
  "axis": true,
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
        0
      ]
    },
    {
      "id": "C",
      "type": "point",
      "parents": [
        1,
        3
      ]
    },
    {
      "id": "triangle",
      "type": "polygon",
      "parents": [
        "A",
        "B",
        "C"
      ]
    },
    {
      "id": "O",
      "type": "circumcenter",
      "parents": [
        "A",
        "B",
        "C"
      ]
    },
    {
      "id": "circle",
      "type": "circumcircle",
      "parents": [
        "A",
        "B",
        "C"
      ]
    },
    {
      "id": "OA",
      "type": "segment",
      "parents": [
        "O",
        "A"
      ]
    }
  ]
}
```

::::

## Practice

Is the circumcenter always inside the triangle? Where is it in a right
triangle?

::: solution Answer with explanation

No: it lies outside an obtuse triangle. In a right triangle it is the midpoint
of the hypotenuse.

:::

[Collection index](README.md)

[Português brasileiro](../pt/circuncentro-do-triangulo.md) ·
[Español](../es/circuncentro-do-triangulo.md)
