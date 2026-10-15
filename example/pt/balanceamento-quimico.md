# Balanceamento: conservar átomos

**Objetivo:** ajustar coeficientes sem modificar fórmulas químicas.
**Extensões:** MathJax, MathJSLab.

## Ideias centrais

Balancear uma equação significa igualar o número de átomos de cada elemento nos
reagentes e produtos. Os coeficientes multiplicam moléculas ou quantidades de
matéria; índices dentro da fórmula definem a substância e não devem ser
alterados.

$$
\ce{2 H2 + O2 -> 2 H2O}.
$$

Há quatro hidrogênios e dois oxigênios de cada lado. Trocar $\ce{H2O}$ por
$\ce{H2O2}$ mudaria a substância, em vez de balancear a mesma reação. Os
menores coeficientes inteiros são 2, 1 e 2.

```mathjslab
A = [2, 0, -2; 0, 2, -1];
c = [2; 1; 2];
A * c
```

No bloco, as linhas de $A$ correspondem a H e O; as colunas a H₂, O₂ e H₂O. Os
átomos do produto recebem sinal negativo. O vetor de coeficientes produz
resíduo zero. A proporção também pode ser interpretada em mols, mas não como
uma proporção igual de massas.

## Pratique

1. Balanceie $\ce{N2 + H2 -> NH3}$.
2. Multiplicar todos os coeficientes por dois muda a proporção?

## Respostas comentadas

1. $\ce{N2 + 3 H2 -> 2 NH3}$.
2. Não; conserva a proporção, mas não usa os menores inteiros.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/balanceamento-quimico.md) ·
[Español](../es/balanceamento-quimico.md)
