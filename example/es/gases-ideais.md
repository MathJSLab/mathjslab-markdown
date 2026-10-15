# Gases ideales: presión y volumen

**Objetivo:** interpretar una relación inversamente proporcional.
**Extensiones:** Vega-Lite, MathJax.

## Ideas clave

Para una cantidad fija de gas ideal a temperatura constante, $PV=k$. Si el
volumen se duplica, la presión se reduce a la mitad. Son magnitudes
inversamente proporcionales: su producto es constante, no su suma.

```vega-lite
{
  "title": "Presión y volumen",
  "data": {
    "values": [
      {
        "x": 1,
        "y": 12
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 6,
        "y": 2
      },
      {
        "x": 12,
        "y": 1
      }
    ]
  },
  "mark": {
    "type": "line",
    "point": true
  },
  "encoding": {
    "x": {
      "field": "x",
      "type": "quantitative",
      "title": "Volumen"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Presión",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Volumen"
      },
      {
        "field": "y",
        "title": "Presión"
      }
    ]
  }
}
```

Los datos simulados utilizan $k=12$ en unidades arbitrarias coherentes. La
curva une muestras de $P=12/V$ para volúmenes positivos. El modelo no está
definido en $V=0$ y no implica que los gases reales cumplan la relación en
cualquier condición.

La ecuación más general es $PV=nRT$, con temperatura absoluta en kelvins.
Mantener constantes la temperatura y la cantidad de sustancia es esencial para
obtener la relación del gráfico. Cambiarlas exige otro cálculo.

## Practica

1. ¿Cuál es la presión para $V=3$ en este modelo?
2. Si la temperatura absoluta se duplica a volumen fijo, ¿cómo cambia la
   presión?

## Respuestas comentadas

1. $P=4$ unidades de presión.
2. Se duplica, manteniendo $n$ constante en el modelo ideal.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/gases-ideais.md) ·
[English](../en/gases-ideais.md)
