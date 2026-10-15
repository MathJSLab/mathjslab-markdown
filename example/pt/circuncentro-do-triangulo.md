# Circuncentro de um triângulo

**Extensões:** `geometry`, `didactic`, `cross-references`.

## Ideias principais

O circuncentro O é equidistante dos vértices. Arraste A, B e C para comparar
triângulos agudos e obtusos. Evite deixá-los colineares, pois a construção
degenera.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```geometry
{
  "title": "Circuncentro de um triângulo",
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

## Prática

O circuncentro está sempre dentro do triângulo? Qual é sua posição em um
triângulo retângulo?

::: solution Resposta comentada

Não: fica fora de um triângulo obtuso. No triângulo retângulo, é o ponto médio
da hipotenusa.

:::

[Índice da coleção](README.md)

[English](../en/circuncentro-do-triangulo.md) ·
[Español](../es/circuncentro-do-triangulo.md)
