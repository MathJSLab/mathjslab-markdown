# Probabilidad: sumas de dos dados

**Objetivo:** contar resultados equiprobables y distinguir resultados de
sucesos. **Extensiones:** Vega-Lite, MathJax.

## Ideas clave

Dos dados equilibrados e independientes producen 36 pares ordenados igualmente
probables. El par $(1,6)$ es distinto de $(6,1)$ porque asigna resultados a
dados diferentes. Una suma es un suceso que puede reunir varios pares.

```vega-lite
{
  "title": "Sumas de dos dados",
  "data": {
    "values": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 6,
        "y": 5
      },
      {
        "x": 7,
        "y": 6
      },
      {
        "x": 8,
        "y": 5
      },
      {
        "x": 9,
        "y": 4
      },
      {
        "x": 10,
        "y": 3
      },
      {
        "x": 11,
        "y": 2
      },
      {
        "x": 12,
        "y": 1
      }
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "x",
      "type": "ordinal",
      "title": "Suma"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Pares posibles",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Suma"
      },
      {
        "field": "y",
        "title": "Pares posibles"
      }
    ]
  }
}
```

La suma 7 aparece en seis pares; la suma 2 solo aparece en $(1,1)$. Así,
$P(S=7)=6/36=1/6$ y $P(S=2)=1/36$. Las sumas posibles no son equiprobables,
aunque los pares sí lo sean. El gráfico muestra recuentos teóricos, no
frecuencias observadas en un experimento.

Con pocos lanzamientos, las frecuencias pueden alejarse bastante de las
probabilidades. Un resultado anterior no modifica el siguiente lanzamiento si
se mantiene la independencia. Esto evita pensar que un resultado está
“pendiente”.

## Practica

1. Cuenta los pares que producen suma 4.
2. Calcula la probabilidad de una suma de al menos 11.

## Respuestas comentadas

1. $(1,3),(2,2),(3,1)$: tres pares.
2. Hay dos pares para 11 y uno para 12: $3/36=1/12$.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/probabilidade-dados.md) ·
[English](../en/probabilidade-dados.md)
