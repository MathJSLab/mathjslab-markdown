# Probabilidade: somas de dois dados

**Objetivo:** contar resultados equiprováveis e distinguir resultados de
eventos. **Extensões:** Vega-Lite, MathJax.

## Ideias centrais

Dois dados honestos e independentes produzem 36 pares ordenados igualmente
prováveis. O par $(1,6)$ é diferente de $(6,1)$ porque indica resultados em
dados diferentes. A soma é um evento que pode reunir vários pares.

```vega-lite
{
  "title": "Somas de dois dados",
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
      "title": "Soma"
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "title": "Pares possíveis",
      "scale": {
        "zero": true
      }
    },
    "tooltip": [
      {
        "field": "x",
        "title": "Soma"
      },
      {
        "field": "y",
        "title": "Pares possíveis"
      }
    ]
  }
}
```

A soma 7 ocorre em seis pares; a soma 2 ocorre somente em $(1,1)$. Assim,
$P(S=7)=6/36=1/6$ e $P(S=2)=1/36$. As somas possíveis não são equiprováveis,
embora os pares sejam. O gráfico mostra contagens teóricas, não frequências
observadas em uma experiência.

Em poucos lançamentos, frequências podem se afastar bastante das
probabilidades. Um resultado anterior não altera o próximo lançamento quando a
independência é mantida. Essa distinção evita a ideia de que um resultado está
“atrasado”.

## Pratique

1. Conte os pares que produzem soma 4.
2. Calcule a probabilidade de soma pelo menos 11.

## Respostas comentadas

1. $(1,3),(2,2),(3,1)$: três pares.
2. Há dois pares para 11 e um para 12: $3/36=1/12$.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/probabilidade-dados.md) ·
[Español](../es/probabilidade-dados.md)
