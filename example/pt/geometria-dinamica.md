# Geometria dinâmica: pontos médios e circunferências

**Extensões:** `geometry`, `didactic`, `cross-references`.

## Ideias principais

Arraste A e B na {@ref ponto-medio}. M depende das extremidades.

Na {@ref circulo}, P desliza sobre a circunferência; O é fixo e C altera o
raio. A capacidade `interactive` deve estar habilitada.

:::: figure Ponto médio {#ponto-medio}

```geometry
{
  "title": "Arraste A e B",
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

:::: figure Ponto sobre a circunferência {#circulo}

```geometry
{
  "title": "Arraste C e P",
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

## Prática

Se A=(2,2) e B=(4,2), onde fica M? Por que OP e OC têm o mesmo comprimento?

## Resposta comentada

M=(3,2), pela média das coordenadas. OP e OC são raios da mesma circunferência.

[Índice da coleção](README.md)

[English](../en/geometria-dinamica.md) · [Español](../es/geometria-dinamica.md)
