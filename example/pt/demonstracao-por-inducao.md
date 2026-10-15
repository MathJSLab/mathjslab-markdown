# Indução: soma dos primeiros inteiros

**Extensões:** `didactic`, `cross-references`, `mathjax`.

## Ideias principais

A indução precisa de uma base e de um passo que preserve a afirmação.

A {@ref soma} enuncia o resultado. A {@ref identidade} registra a fórmula que
será usada.

::: theorem Soma dos inteiros {#soma}

Para todo inteiro $n\ge1$, a soma de 1 até n é $n(n+1)/2$.

:::

::: equation Identidade {#identidade}

$$\sum_{j=1}^{n}j=\frac{n(n+1)}{2}.$$

:::

::: proof Base e passo

A base n=1 satisfaz a fórmula. Supondo a identidade para n=k, somamos k+1 e
obtemos:

$$\frac{k(k+1)}{2}+(k+1)=\frac{(k+1)(k+2)}{2}.$$

:::

## Prática

Use a fórmula para calcular 1+2+...+10. Por que verificar apenas n=10 não prova
o teorema?

## Resposta comentada

A soma vale 55. Um caso isolado não estabelece a afirmação para todos os
inteiros positivos.

[Índice da coleção](README.md)

[English](../en/demonstracao-por-inducao.md) ·
[Español](../es/demonstracao-por-inducao.md)
