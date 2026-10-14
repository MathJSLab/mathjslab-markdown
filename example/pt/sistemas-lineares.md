# Sistemas lineares: resolver e verificar

**Objetivo:** resolver duas equações e conferir a solução por substituição.
**Extensões:** MathJSLab e MathJax.

## Um problema de quantidades

Dois tipos de caixas contêm 2 e 3 unidades, respectivamente. Um conjunto tem
sete caixas e dezoito unidades. Se $x$ é a quantidade de caixas do primeiro
tipo e $y$ a do segundo, temos:

$$
\begin{cases}
x+y=7,\\
2x+3y=18.
\end{cases}
$$

Multiplique a primeira equação por 2 e subtraia da segunda: $y=4$. Então $x=3$.
A solução respeita também a condição física de quantidades inteiras e não
negativas.

## Forma matricial

A matriz dos coeficientes é %`[1, 1; 2, 3]`% e o vetor dos termos independentes
é %`[7; 18]`%. A operação de divisão matricial à esquerda resolve o sistema no
bloco abaixo:

```mathjslab
A = [1, 1; 2, 3];
b = [7; 18];
solucao = A \ b
A * solucao
A * solucao - b
```

O vetor solução deve conter 3 e 4. O último resultado é o resíduo: zero indica
que a substituição satisfaz ambas as equações, dentro da precisão numérica. Nem
todo sistema tem solução única: equações dependentes ou incompatíveis exigem
análise adicional.

## Pratique

1. Confira a solução sem usar matrizes.
2. O que ocorre ao trocar a segunda equação por $2x+2y=14$?
3. E por $2x+2y=15$?

## Respostas comentadas

1. $3+4=7$ e $2\cdot3+3\cdot4=18$.
2. A segunda equação repete a primeira: há infinitas soluções reais.
3. As equações se contradizem: não há solução.
