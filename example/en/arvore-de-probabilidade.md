# Probability tree with TikZ

**Extensions:** `tikz`, `didactic`, `cross-references`.

## Key ideas

Two independent tosses of a fair coin produce four equally likely outcomes. The
tree makes each choice explicit; H and T denote heads and tails.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

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

## Practice

What is the probability of getting exactly one head?

::: solution Answer with explanation

HT and TH are favourable out of four outcomes: 2/4=1/2.

:::

[Collection index](README.md)

[Português brasileiro](../pt/arvore-de-probabilidade.md) ·
[Español](../es/arvore-de-probabilidade.md)
