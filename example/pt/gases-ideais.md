# Gases ideais: pressão e volume

**Objetivo:** interpretar uma relação inversamente proporcional. **Extensões:**
Vega-Lite, MathJax.

## Ideias centrais

Para uma quantidade fixa de gás ideal a temperatura constante, $PV=k$. Se o
volume dobra, a pressão cai à metade. Pressão e volume são inversamente
proporcionais: o produto é constante, não a soma.

```vega-lite
{
  "title": "Pressão e volume",
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
      "title": "Volume"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Pressão",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Volume"
      },
      {
        "field": "y",
        "title": "Pressão"
      }
    ]
  }
}
```

Os dados simulados usam $k=12$ em unidades arbitrárias coerentes. A curva liga
amostras de $P=12/V$ para volumes positivos. O modelo não está definido em
$V=0$ e não permite concluir que gases reais obedecem à relação em qualquer
condição.

A equação mais geral é $PV=nRT$, com temperatura absoluta em kelvins. Manter
temperatura e quantidade de matéria fixas é essencial para obter a relação
usada no gráfico. Mudar essas variáveis exige outro cálculo.

## Pratique

1. Qual é a pressão para $V=3$ neste modelo?
2. Se a temperatura absoluta dobra a volume fixo, como muda a pressão?

## Respostas comentadas

1. $P=4$ unidades de pressão.
2. Ela dobra, mantendo $n$ constante no modelo ideal.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/gases-ideais.md) · [Español](../es/gases-ideais.md)
