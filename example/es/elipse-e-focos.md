# Elipse: suma de distancias a los focos

**Extensiones:** `geometry`, `didactic`, `cross-references`.

## Ideas principales

La elipse tiene focos F1 y F2 y suma de distancias igual a 6. Arrastre P sobre
la curva y compare los segmentos hasta los focos. Los focos son fijos para
conservar la misma elipse.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```geometry
{
  "title": "Elipse: suma de distancias a los focos",
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

## Práctica

¿Cuánto vale PF1+PF2? ¿Dónde están los extremos del eje mayor?

::: solution Respuesta comentada

La suma vale 6. Los extremos son (-3,0) y (3,0), porque el semieje mayor
vale 3.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/elipse-e-focos.md) ·
[English](../en/elipse-e-focos.md)
