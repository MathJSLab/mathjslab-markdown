# Algoritmos: somar uma sequência em JavaScript

**Objetivo:** acompanhar uma repetição e distinguir código de resultado.
**Extensões:** syntax-highlight e MathJax.

## Um acumulador

O programa começa com soma zero. A cada passagem do laço, acrescenta o valor
corrente de `k`. Depois de dez passagens, a soma vale 55. O destaque de sintaxe
facilita a leitura; este bloco não executa JavaScript no documento.

```javascript
const n = 10;
let soma = 0;

for (let k = 1; k <= n; k += 1) {
    soma += k;
}

console.log(soma); // 55
```

## Conferir por outro caminho

A soma de 1 até $n$ é uma PA de razão 1:

$$
1+2+\cdots+n=\frac{n(n+1)}2.
$$

Para $n=10$, a fórmula também produz 55. A comparação entre algoritmo e fórmula
ajuda a detectar erros de limite: trocar `<=` por `<` omitiria o último termo e
produziria 45.

## Pratique

1. Qual é o valor de `soma` depois de `k=3`?
2. O que acontece com `n=0`?
3. Por que a fórmula usa menos operações do que o laço para valores grandes de
   `n`?

## Respostas comentadas

1. $1+2+3=6$.
2. O laço não é iniciado e a soma permanece zero.
3. Ela usa uma quantidade constante de operações; o laço cresce com `n`.
