# Física: movimento uniforme e inclinação do gráfico

**Objetivo:** relacionar posição, tempo e velocidade constante. **Extensões:**
Vega-Lite e MathJax.

## Um modelo idealizado

Um móvel parte da posição 2 m e avança a 3 m/s em uma trajetória retilínea. Sem
aceleração, sua posição é $s(t)=2+3t$. Os dados são calculados pelo modelo, e
não obtidos de uma medição.

```vega-lite
{
  "title": "Posição em função do tempo",
  "data": {"values": [
    {"tempo":0,"posicao":2},{"tempo":1,"posicao":5},
    {"tempo":2,"posicao":8},{"tempo":3,"posicao":11},
    {"tempo":4,"posicao":14}
  ]},
  "mark": {"type":"line","point":true},
  "encoding": {
    "x":{"field":"tempo","type":"quantitative","title":"Tempo (s)"},
    "y":{"field":"posicao","type":"quantitative","title":"Posição (m)","scale":{"zero":true}}
  }
}
```

A inclinação é $\Delta s/\Delta t=3$ m/s. O intercepto vertical é a posição
inicial, não a velocidade. Posição e distância percorrida também não são
sinônimos: entre 0 e 4 s, o deslocamento é 12 m, embora a posição final seja 14
m.

## Pratique

1. Determine a posição em 6 s.
2. Como seria a reta para velocidade de -3 m/s e mesma posição inicial?
3. Uma reta horizontal nesse gráfico representa o quê?

## Respostas comentadas

1. $s(6)=20$ m.
2. Seria decrescente, com equação $s(t)=2-3t$.
3. Posição constante e velocidade zero no referencial adotado.
