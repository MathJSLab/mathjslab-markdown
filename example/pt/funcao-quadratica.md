# Função quadrática: raízes e vértice

**Objetivo:** relacionar expressão algébrica, zeros e gráfico de uma parábola.
**Extensões:** MathJax, Vega-Lite.

## Ideias centrais

Uma função quadrática tem forma $f(x)=ax^2+bx+c$, com $a\ne0$. O sinal de $a$
determina a concavidade: positiva para cima, negativa para baixo. No exemplo
$f(x)=x^2-4x+3$, a fatoração $(x-1)(x-3)$ revela os zeros 1 e 3. Os zeros são
valores de entrada que produzem saída zero, não pontos de máximo.

Completando o quadrado, $f(x)=(x-2)^2-1$. Como um quadrado é não negativo, o
menor valor é -1, atingido em $x=2$. O vértice é $(2,-1)$ e o eixo de simetria
é a reta $x=2$.

```vega-lite
{
  "title": "Uma parábola",
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

Os pontos foram calculados pela fórmula. A linha conecta amostras para
facilitar a leitura; a função é definida também entre esses pontos. Compare os
valores em 0 e 4, que ficam à mesma distância do eixo de simetria.

## Pratique

1. Calcule $f(0)$ e $f(4)$.
2. Qual é o conjunto de valores possíveis de $f(x)$ para $x$ real?

## Respostas comentadas

1. Ambos valem 3, confirmando a simetria.
2. Todos os reais maiores ou iguais a -1.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/funcao-quadratica.md) · [Español](../es/funcao-quadratica.md)
