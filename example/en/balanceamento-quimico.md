# Balancing equations: conserving atoms

**Objective:** adjust coefficients without changing chemical formulas.
**Extensions:** MathJax, MathJSLab.

## Key ideas

Balancing an equation means matching the number of atoms of each element in
reactants and products. Coefficients multiply molecules or amounts of
substance; subscripts within a formula define the substance and must not be
changed.

$$
\ce{2 H2 + O2 -> 2 H2O}.
$$

There are four hydrogens and two oxygens on each side. Replacing $\ce{H2O}$
with $\ce{H2O2}$ changes the substance instead of balancing the same reaction.
The smallest integer coefficients are 2, 1 and 2.

```mathjslab
A = [2, 0, -2; 0, 2, -1];
c = [2; 1; 2];
A * c
```

In the block, the rows of $A$ correspond to H and O; columns correspond to H₂,
O₂ and H₂O. Product atoms have negative signs. The coefficient vector produces
a zero residual. The ratio can also be interpreted in moles, but not as the
same ratio of masses.

## Practice

1. Balance $\ce{N2 + H2 -> NH3}$.
2. Does doubling all coefficients change the ratio?

## Answers with explanations

1. $\ce{N2 + 3 H2 -> 2 NH3}$.
2. No; it preserves the ratio but does not use the smallest integers.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/balanceamento-quimico.md) ·
[Español](../es/balanceamento-quimico.md)
