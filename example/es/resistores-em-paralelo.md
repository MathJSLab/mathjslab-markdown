# Resistencias en paralelo con CircuiTikZ

**Extensiones:** `tikz`, `didactic`, `cross-references`.

## Ideas principales

Las resistencias comparten los mismos dos nodos, por lo que tienen la misma
tensión. El esquema representa únicamente la topología del circuito ideal.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```circuitikz
\begin{circuitikz}[american]
\draw (0,0) to[battery1,l=$12\,V$] (0,3) -- (4,3);
\draw (2,3) to[R,l=$R_1$] (2,0);
\draw (4,3) to[R,l=$R_2$] (4,0) -- (0,0);
\end{circuitikz}
```

::::

## Práctica

Si R1=6 ohmios y R2=3 ohmios, ¿cuál es la resistencia equivalente?

::: solution Respuesta comentada

1/Req=1/6+1/3=1/2, por lo que Req=2 ohmios. Las corrientes son 2 A y 4 A.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/resistores-em-paralelo.md) ·
[English](../en/resistores-em-paralelo.md)
