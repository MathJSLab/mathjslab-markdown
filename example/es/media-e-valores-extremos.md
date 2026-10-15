# Media, mediana y valores extremos

**Objetivo:** comparar medidas de centro y examinar el efecto de una
observación extrema. **Extensiones:** Vega-Lite, MathJax, relative-urls,
heading-ids, syntax-highlight.

## Ideas clave

Las cinco observaciones ficticias $10,11,12,13,54$ ilustran una distribución
asimétrica. La media es $100/5=20$; la mediana es 12, el valor central después
de ordenar. Una sola observación alta afecta mucho a la media.

```vega-lite
{
  "title": "Observaciones ficticias",
  "data": {
    "values": [
      {
        "x": 1,
        "y": 10
      },
      {
        "x": 2,
        "y": 11
      },
      {
        "x": 3,
        "y": 12
      },
      {
        "x": 4,
        "y": 13
      },
      {
        "x": 5,
        "y": 54
      }
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "x",
      "type": "ordinal",
      "title": "Observación"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Valor",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Observación"
      },
      {
        "field": "y",
        "title": "Valor"
      }
    ]
  }
}
```

```csv
id,value
1,10
2,11
3,12
4,13
5,54
```

Los mismos datos están en el [archivo CSV](resources/observacoes.csv). En el
encabezado, `id` identifica la observación y `value` guarda su valor. Los
identificadores son iguales en los tres idiomas para conservar la lectura
automatizada. El gráfico muestra valores individuales, no frecuencias.

Antes de eliminar 54, investiga su origen. Puede ser un error o una observación
válida. Sin contexto, excluirlo solo por ser diferente puede distorsionar el
análisis. Compara medidas y explica tus decisiones. Utiliza el enlace de
ejercicios al final para probar la navegación por títulos.

## Practica

1. Sustituye 54 por 14. Calcula media y mediana.
2. ¿Qué medida cambió más?

## Respuestas comentadas

1. Ambas pasan a 12.
2. La media bajó de 20 a 12; la mediana permaneció en 12.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/media-e-valores-extremos.md) ·
[English](../en/media-e-valores-extremos.md)
