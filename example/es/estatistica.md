# Estadística: distribución de calificaciones y media

**Objetivo:** interpretar frecuencias y calcular una media ponderada.
**Extensiones:** Vega-Lite y MathJax.

## Datos de una clase ficticia

La tabla representa a 20 estudiantes. Los datos son simulados para el estudio y
no corresponden a una escuela real. Cada barra muestra cuántos estudiantes
obtuvieron una determinada calificación.

```vega-lite
{
  "title": "Distribución de calificaciones — clase ficticia",
  "data": {
    "values": [
      {
        "nota": 4,
        "frequencia": 2
      },
      {
        "nota": 5,
        "frequencia": 3
      },
      {
        "nota": 6,
        "frequencia": 5
      },
      {
        "nota": 7,
        "frequencia": 6
      },
      {
        "nota": 8,
        "frequencia": 3
      },
      {
        "nota": 9,
        "frequencia": 1
      }
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "nota",
      "type": "ordinal",
      "title": "Calificación"
    },
    "y": {
      "field": "frequencia",
      "type": "quantitative",
      "title": "Número de estudiantes"
    },
    "tooltip": [
      {
        "field": "nota",
        "type": "ordinal",
        "title": "Calificación"
      },
      {
        "field": "frequencia",
        "type": "quantitative",
        "title": "Número de estudiantes"
      }
    ]
  }
}
```

## Resúmenes diferentes

La moda es 7, la calificación más frecuente. La media pondera cada calificación
por el número de estudiantes que la obtuvieron:

$$
\bar x=\frac{4\cdot2+5\cdot3+6\cdot5+7\cdot6+8\cdot3+9\cdot1}{20}=6{,}4.
$$

Para la mediana, ordenamos las 20 calificaciones y tomamos la media de las
posiciones 10 y 11. Son 6 y 7; por tanto, la mediana es 6,5. La media, la
mediana y la moda responden a preguntas diferentes y pueden no coincidir.

## Practica

1. ¿Cuántos estudiantes obtuvieron una calificación de al menos 7?
2. ¿La media de las seis calificaciones distintas equivale a la media de la
   clase?

## Respuestas comentadas

1. $6+3+1=10$ estudiantes.
2. No; las calificaciones tienen distintas frecuencias y necesitan esos pesos.
