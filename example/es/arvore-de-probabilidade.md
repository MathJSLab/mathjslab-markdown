# Árbol de probabilidad con TikZ

**Extensiones:** `tikz`, `didactic`, `cross-references`.

## Ideas principales

Dos lanzamientos independientes de una moneda equilibrada producen cuatro
resultados equiprobables. El árbol explicita cada elección; H y T representan
cara y cruz.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

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

## Práctica

¿Cuál es la probabilidad de obtener exactamente una cara?

::: solution Respuesta comentada

HT y TH son favorables entre cuatro resultados: 2/4=1/2.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/arvore-de-probabilidade.md) ·
[English](../en/arvore-de-probabilidade.md)
