# Circuncentro de un triángulo

**Extensiones:** `geometry`, `didactic`, `cross-references`.

## Ideas principales

El circuncentro O es equidistante de los vértices. Arrastre A, B y C para
comparar triángulos agudos y obtusos. Evite vértices colineales, que hacen
degenerar la construcción.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```geometry
{
  "title": "Circuncentro de un triángulo",
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

## Práctica

¿El circuncentro está siempre dentro del triángulo? ¿Dónde está en un triángulo
rectángulo?

::: solution Respuesta comentada

No: está fuera de un triángulo obtuso. En un triángulo rectángulo es el punto
medio de la hipotenusa.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/circuncentro-do-triangulo.md) ·
[English](../en/circuncentro-do-triangulo.md)
