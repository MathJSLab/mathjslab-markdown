# Parallel resistors with CircuiTikZ

**Extensions:** `tikz`, `didactic`, `cross-references`.

## Key ideas

The resistors share the same two nodes, so their voltages are equal. The
diagram represents only the ideal circuit topology.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```circuitikz
\begin{circuitikz}[american]
\draw (0,0) to[battery1,l=$12\,V$] (0,3) -- (4,3);
\draw (2,3) to[R,l=$R_1$] (2,0);
\draw (4,3) to[R,l=$R_2$] (4,0) -- (0,0);
\end{circuitikz}
```

::::

## Practice

If R1=6 ohms and R2=3 ohms, what is the equivalent resistance?

::: solution Answer with explanation

1/Req=1/6+1/3=1/2, so Req=2 ohms. The branch currents are 2 A and 4 A.

:::

[Collection index](README.md)

[Português brasileiro](../pt/resistores-em-paralelo.md) ·
[Español](../es/resistores-em-paralelo.md)
