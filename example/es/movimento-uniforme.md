# Física: movimiento uniforme y pendiente del gráfico

**Objetivo:** relacionar la posición, el tiempo y la velocidad constante.
**Extensiones:** Vega-Lite y MathJax.

## Un modelo idealizado

Un móvil parte de la posición 2 m y avanza a 3 m/s en una trayectoria
rectilínea. Sin aceleración, su posición es $s(t)=2+3t$. Los datos se calculan
mediante el modelo y no proceden de una medición.

```vega-lite
{
  "title": "Posición en función del tiempo",
  "data": {"values": [
    {"tempo":0,"posicao":2},{"tempo":1,"posicao":5},
    {"tempo":2,"posicao":8},{"tempo":3,"posicao":11},
    {"tempo":4,"posicao":14}
  ]},
  "mark": {"type":"line","point":true},
  "encoding": {
    "x":{"field":"tempo","type":"quantitative","title":"Tiempo (s)"},
    "y":{"field":"posicao","type":"quantitative","title":"Posición (m)","scale":{"zero":true}}
  }
}
```

La pendiente es $\Delta s/\Delta t=3$ m/s. La intersección con el eje vertical
es la posición inicial, no la velocidad. La posición y la distancia recorrida
tampoco son sinónimos: entre 0 y 4 s, el desplazamiento es 12 m, aunque la
posición final sea 14 m.

## Practica

1. Determina la posición a los 6 s.
2. ¿Cómo sería la recta para una velocidad de -3 m/s y la misma posición
   inicial?
3. ¿Qué representa una recta horizontal en este gráfico?

## Respuestas comentadas

1. $s(6)=20$ m.
2. Sería decreciente, con ecuación $s(t)=2-3t$.
3. Posición constante y velocidad nula en el sistema de referencia elegido.
