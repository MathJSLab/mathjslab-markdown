# Matrizes e transformações no plano

**Objetivo:** interpretar uma matriz como regra de transformação de
coordenadas. **Extensões:** MathJSLab, MathJax.

## Ideias centrais

Uma matriz pode transformar um vetor de coordenadas. Considere
$R=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$. Multiplicando $R$ por $(x,y)^T$,
obtemos $(-y,x)^T$: uma rotação de $90^\circ$ no sentido anti-horário em torno
da origem. O comprimento é preservado.

```mathjslab
R = [0, -1; 1, 0];
P = [1, 0, 1; 0, 1, 1];
R * P
R * R
D = [2, 0; 0, 1];
R * D * [1; 1]
D * R * [1; 1]
```

Cada coluna de $P$ é um ponto: $(1,0)$, $(0,1)$ e $(1,1)$. O operador `*`
realiza a multiplicação matricial; não é a multiplicação elemento a elemento
`.*`. Duas aplicações de $R$ produzem uma meia-volta.

A matriz $D=\begin{pmatrix}2&0\\0&1\end{pmatrix}$, por sua vez, dobra a
coordenada horizontal. Ela não preserva todos os comprimentos. Transformações
diferentes podem dar resultados diferentes quando sua ordem é trocada.

## Pratique

1. Transforme o ponto $(2,3)$ com $R$.
2. Compare $RD(1,1)^T$ e $DR(1,1)^T$.

## Respostas comentadas

1. O resultado é $(-3,2)$.
2. São $(-1,2)$ e $(-2,1)$; a ordem importa.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/matrizes-transformacoes.md) ·
[Español](../es/matrizes-transformacoes.md)
