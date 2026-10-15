# Média, mediana e valores extremos

**Objetivo:** comparar medidas de centro e examinar o efeito de uma observação
extrema. **Extensões:** Vega-Lite, MathJax, relative-urls, heading-ids,
syntax-highlight.

## Ideias centrais

As cinco observações fictícias $10,11,12,13,54$ ilustram uma distribuição
assimétrica. A média é $100/5=20$; a mediana é 12, o valor central após
ordenar. Uma única observação alta afeta bastante a média.

```vega-lite
{
  "title": "Observações fictícias",
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
      "title": "Observação"
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
        "title": "Observação"
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

Os mesmos dados estão no [arquivo CSV](resources/observacoes.csv). No
cabeçalho, `id` identifica a observação e `value` guarda seu valor. Esses
identificadores são iguais nos três idiomas para preservar a leitura
automatizada. O gráfico é de valores individuais, não de frequências.

Antes de remover 54, investigue sua origem. Ele pode ser um erro ou uma
observação válida. Sem contexto, excluí-lo apenas por ser diferente pode
distorcer a análise. Compare medidas e relate as escolhas feitas. Use o link de
exercícios ao final para testar a navegação pelos títulos.

## Pratique

1. Troque 54 por 14. Calcule média e mediana.
2. Qual medida mudou mais?

## Respostas comentadas

1. Ambas passam a 12.
2. A média caiu de 20 para 12; a mediana permaneceu em 12.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/media-e-valores-extremos.md) ·
[Español](../es/media-e-valores-extremos.md)
