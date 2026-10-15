# Matrices and transformations in the plane

**Objective:** interpret a matrix as a coordinate transformation rule.
**Extensions:** MathJSLab, MathJax.

## Key ideas

A matrix can transform a coordinate vector. Consider
$R=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$. Multiplying $R$ by $(x,y)^T$ gives
$(-y,x)^T$: a $90^\circ$ counterclockwise rotation about the origin. Length is
preserved.

```mathjslab
R = [0, -1; 1, 0];
P = [1, 0, 1; 0, 1, 1];
R * P
R * R
D = [2, 0; 0, 1];
R * D * [1; 1]
D * R * [1; 1]
```

Each column of $P$ is a point: $(1,0)$, $(0,1)$ and $(1,1)$. The `*` operator
performs matrix multiplication; it differs from elementwise multiplication
`.*`. Applying $R$ twice produces a half-turn.

The matrix $D=\begin{pmatrix}2&0\\0&1\end{pmatrix}$ instead doubles the
horizontal coordinate. It does not preserve all lengths. Different
transformations may produce different results when their order is reversed.

## Practice

1. Transform $(2,3)$ using $R$.
2. Compare $RD(1,1)^T$ and $DR(1,1)^T$.

## Answers with explanations

1. The result is $(-3,2)$.
2. They are $(-1,2)$ and $(-2,1)$; order matters.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/matrizes-transformacoes.md) ·
[Español](../es/matrizes-transformacoes.md)
