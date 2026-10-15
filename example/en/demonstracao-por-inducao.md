# Induction: sum of the first integers

**Extensions:** `didactic`, `cross-references`, `mathjax`.

## Key ideas

Induction needs a base case and a step preserving the claim. {@ref soma} states
the result and {@ref identidade} records the formula to be used.

::: theorem Integer sum {#soma}

For every integer $n\ge1$, the sum from 1 to n is $n(n+1)/2$.

:::

::: equation Identity {#identidade}

$$\sum_{j=1}^{n}j=\frac{n(n+1)}{2}.$$

:::

::: proof Base and step

The base n=1 satisfies the formula. Assuming the identity for n=k, add k+1 to
obtain:

$$\frac{k(k+1)}{2}+(k+1)=\frac{(k+1)(k+2)}{2}.$$

:::

## Practice

Use the formula to compute 1+2+...+10. Why does checking only n=10 not prove
the theorem?

## Answer with explanation

The sum is 55. One case does not establish the claim for every positive
integer.

[Collection index](README.md)

[Português brasileiro](../pt/demonstracao-por-inducao.md) ·
[Español](../es/demonstracao-por-inducao.md)
