# Paralelas y perpendiculares

**Extensiones:** `geometry`, `didactic`, `cross-references`.

## Ideas principales

A y B definen una recta. Las dos rectas que pasan por P dependen de la
dirección de AB: una es paralela y la otra perpendicular. Arrastre los tres
puntos sin hacer coincidir A y B.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```geometry
{
  "title": "Paralelas y perpendiculares",
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

## Práctica

AB tiene pendiente 1/2. ¿Cuáles son las pendientes de la paralela y la
perpendicular?

::: solution Respuesta comentada

La paralela tiene pendiente 1/2; la perpendicular tiene pendiente -2. El
producto de las pendientes es -1.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/paralelas-e-perpendiculares.md) ·
[English](../en/paralelas-e-perpendiculares.md)
