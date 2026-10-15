# Compound growth: a multiplicative model

**Objective:** distinguish fixed increases from proportional increases.
**Extensions:** MathJSLab, MathJax.

## Key ideas

In a teaching model, an initial quantity of 1000 grows by 10% per period. Each
new value is 1.1 times the previous one: $1000,1100,1210,1331$. The absolute
increase changes because the percentage applies to the updated value.

$$
Q_n=Q_0(1+i)^n.
$$

Here $i=0.10$ and $n$ counts complete periods. The formula includes no
additional contributions, fees or changing ratios; it is a mathematical model,
not a prediction of actual returns.

```mathjslab
n = 0:5;
Q = 1000 * (1.1).^n;
L = 1000 + 100*n;
[n', Q', L']
```

Compare it with $L_n=1000+100n$, which always adds 100. The models agree after
the first period but diverge later. In `.^`, the power is applied to each
vector entry. The columns show period, compound growth and linear growth.

## Practice

1. Compare the models at the third period.
2. What factor represents a 10% decrease per period?

## Answers with explanations

1. Compound: 1331; linear: 1300.
2. The factor is 0.9; use $Q_n=Q_0(0.9)^n$.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/crescimento-composto.md) ·
[Español](../es/crescimento-composto.md)
