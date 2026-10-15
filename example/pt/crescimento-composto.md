# Crescimento composto: um modelo multiplicativo

**Objetivo:** distinguir aumento fixo e aumento proporcional. **Extensões:**
MathJSLab, MathJax.

## Ideias centrais

Em um modelo didático, uma quantidade inicial de 1000 cresce 10% por período.
Cada novo valor é 1,1 vezes o anterior: $1000,1100,1210,1331$. O aumento
absoluto muda porque a porcentagem é aplicada ao valor atualizado.

$$
Q_n=Q_0(1+i)^n.
$$

Aqui $i=0{,}10$ e $n$ é o número de períodos completos. A fórmula não inclui
novos aportes, taxas ou variações da razão; é um modelo matemático, não uma
previsão de rendimento real.

```mathjslab
n = 0:5;
Q = 1000 * (1.1).^n;
L = 1000 + 100*n;
[n', Q', L']
```

Compare com $L_n=1000+100n$, que acrescenta sempre 100. Os modelos coincidem no
primeiro período, mas se afastam depois. Em `.^`, a potência é aplicada a cada
posição do vetor. As colunas mostram período, crescimento composto e
crescimento linear.

## Pratique

1. Compare os valores dos modelos no terceiro período.
2. Qual fator representa uma redução de 10% por período?

## Respostas comentadas

1. Composto: 1331; linear: 1300.
2. O fator é 0,9; usa-se $Q_n=Q_0(0{,}9)^n$.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/crescimento-composto.md) ·
[Español](../es/crescimento-composto.md)
