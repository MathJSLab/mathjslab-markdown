# Función cuadrática: raíces y vértice

**Objetivo:** relacionar la expresión algebraica, los ceros y el gráfico de una
parábola. **Extensiones:** MathJax, Vega-Lite.

## Ideas clave

Una función cuadrática tiene la forma $f(x)=ax^2+bx+c$, con $a\ne0$. El signo
de $a$ determina si la parábola abre hacia arriba o hacia abajo. En
$f(x)=x^2-4x+3$, la factorización $(x-1)(x-3)$ revela los ceros 1 y 3. Los
ceros son entradas que producen una salida nula, no puntos de máximo.

Completando el cuadrado, $f(x)=(x-2)^2-1$. Como un cuadrado no es negativo, el
valor mínimo es -1 y se alcanza en $x=2$. El vértice es $(2,-1)$ y el eje de
simetría es la recta $x=2$.

```vega-lite
{
  "title": "Una parábola",
  "data": {
    "values": [
      {
        "x": -1,
        "y": 8
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": -1
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 8
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
      "title": "x"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "f(x)",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "x"
      },
      {
        "field": "y",
        "title": "f(x)"
      }
    ]
  }
}
```

Los puntos se calcularon con la fórmula. La línea une muestras para facilitar
la lectura; la función también está definida entre ellas. Compara los valores
en 0 y 4, que están a la misma distancia del eje de simetría.

## Practica

1. Calcula $f(0)$ y $f(4)$.
2. ¿Qué valores puede tomar $f(x)$ para $x$ real?

## Respuestas comentadas

1. Ambos valen 3, lo que confirma la simetría.
2. Todos los reales mayores o iguales a -1.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/funcao-quadratica.md) ·
[English](../en/funcao-quadratica.md)
