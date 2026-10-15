# Árvore de probabilidade com TikZ

**Extensões:** `tikz`, `didactic`, `cross-references`.

## Ideias principais

Dois lançamentos independentes de uma moeda equilibrada geram quatro resultados
equiprováveis. A árvore explicita cada escolha; H e T são símbolos de cara e
coroa.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```tikz
\begin{tikzpicture}[every node/.style={circle,draw,minimum size=7mm}]
\node (S) at (0,0) {$S$};
\node (H) at (2,1) {$H$}; \node (T) at (2,-1) {$T$};
\node (HH) at (4,1.5) {$HH$}; \node (HT) at (4,.5) {$HT$};
\node (TH) at (4,-.5) {$TH$}; \node (TT) at (4,-1.5) {$TT$};
\draw[->] (S)--(H); \draw[->] (S)--(T);
\draw[->] (H)--(HH); \draw[->] (H)--(HT);
\draw[->] (T)--(TH); \draw[->] (T)--(TT);
\end{tikzpicture}
```

::::

## Prática

Qual é a probabilidade de obter exatamente uma cara?

::: solution Resposta comentada

HT e TH são favoráveis, dentre quatro resultados: 2/4=1/2.

:::

[Índice da coleção](README.md)

[English](../en/arvore-de-probabilidade.md) ·
[Español](../es/arvore-de-probabilidade.md)
