# Estatística: distribuição de notas e média

**Objetivo:** interpretar frequências e calcular uma média ponderada.
**Extensões:** Vega-Lite e MathJax.

## Dados de uma turma fictícia

A tabela representa 20 estudantes. Os dados são simulados para estudo, sem
relação com uma escola real. Cada barra mostra quantos estudantes obtiveram
determinada nota.

```vega-lite
{
  "title": "Distribuição de notas — turma fictícia",
  "data": {"values": [
    {"nota":4,"frequencia":2},
    {"nota":5,"frequencia":3},
    {"nota":6,"frequencia":5},
    {"nota":7,"frequencia":6},
    {"nota":8,"frequencia":3},
    {"nota":9,"frequencia":1}
  ]},
  "mark": "bar",
  "encoding": {
    "x": {"field":"nota","type":"ordinal","title":"Nota"},
    "y": {"field":"frequencia","type":"quantitative","title":"Número de estudantes"},
    "tooltip": [{"field":"nota","type":"ordinal"},{"field":"frequencia","type":"quantitative"}]
  }
}
```

## Resumos distintos

A moda é 7, a nota mais frequente. A média pondera cada nota pelo número de
estudantes que a obtiveram:

$$
\bar x=\frac{4\cdot2+5\cdot3+6\cdot5+7\cdot6+8\cdot3+9\cdot1}{20}=6{,}4.
$$

Para a mediana, ordenamos as 20 notas e tomamos a média entre as posições 10
e 11. Elas são 6 e 7; logo, a mediana é 6,5. Média, mediana e moda respondem a
perguntas diferentes e podem não coincidir.

## Pratique

1. Quantos estudantes obtiveram nota pelo menos 7?
2. A média das seis notas distintas equivale à média da turma?

## Respostas comentadas

1. $6+3+1=10$ estudantes.
2. Não; as notas têm frequências diferentes e precisam desses pesos.
