# Números binários e valor posicional

**Objetivo:** converter um número pequeno entre bases 2 e 10. **Extensões:**
syntax-highlight, MathJax.

## Ideias centrais

No sistema decimal, as posições usam potências de 10; no binário, potências
de 2. Os únicos algarismos binários são 0 e 1. A escrita $1011_2$ significa:

$$
1\cdot2^3+0\cdot2^2+1\cdot2^1+1\cdot2^0=11_{10}.
$$

```javascript
const bits = "1011";
let value = 0;
for (const digit of bits) {
    if (digit !== "0" && digit !== "1")
        throw new Error("Dígito binário inválido");
    value = 2 * value + Number(digit);
}
console.log(value);
```

O código percorre os dígitos da esquerda para a direita. A cada passo,
multiplica o valor acumulado por 2 e acrescenta o próximo dígito. Ele trabalha
com inteiros pequenos; não pretende tratar todos os limites numéricos de
JavaScript. O destaque de sintaxe não executa o bloco.

Zeros à esquerda não mudam o valor: $0011_2=11_2=3_{10}$. Já acrescentar zero à
direita multiplica por 2. Isso corresponde ao deslocamento de posições, não a
uma soma de zero sem efeito.

## Pratique

1. Converta $1101_2$ para decimal.
2. Escreva 6 em binário.

## Respostas comentadas

1. $8+4+1=13$.
2. $110_2$, pois $4+2=6$.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/numeros-binarios.md) · [Español](../es/numeros-binarios.md)
