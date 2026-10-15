# Geometría dinámica: puntos medios y circunferencias

**Extensiones:** `geometry`, `didactic`, `cross-references`.

## Ideas principales

Arrastre A y B en la {@ref ponto-medio}. M depende de los extremos.

En la {@ref circulo}, P se desliza por la circunferencia; O es fijo y C cambia
el radio. Habilite la capacidad `interactive`.

:::: figure Punto medio {#ponto-medio}

```geometry
{
  "title": "Arrastre A y B",
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

:::: figure Punto sobre la circunferencia {#circulo}

```geometry
{
  "title": "Arrastre C y P",
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

## Práctica

Si A=(2,2) y B=(4,2), ¿dónde está M? ¿Por qué OP y OC tienen la misma longitud?

## Respuesta comentada

M=(3,2), por el promedio de las coordenadas. OP y OC son radios de la misma
circunferencia.

[Índice de la colección](README.md)

[Português brasileiro](../pt/geometria-dinamica.md) ·
[English](../en/geometria-dinamica.md)
