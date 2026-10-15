# Resistores em paralelo com CircuiTikZ

**Extensões:** `tikz`, `didactic`, `cross-references`.

## Ideias principais

Os resistores compartilham os mesmos dois nós, portanto têm a mesma tensão. O
esquema representa apenas a topologia do circuito ideal.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```circuitikz
\begin{circuitikz}[american]
\draw (0,0) to[battery1,l=$12\,V$] (0,3) -- (4,3);
\draw (2,3) to[R,l=$R_1$] (2,0);
\draw (4,3) to[R,l=$R_2$] (4,0) -- (0,0);
\end{circuitikz}
```

::::

## Prática

Se R1=6 ohms e R2=3 ohms, qual é a resistência equivalente?

::: solution Resposta comentada

1/Req=1/6+1/3=1/2, então Req=2 ohms. As correntes são 2 A e 4 A.

:::

[Índice da coleção](README.md)

[English](../en/resistores-em-paralelo.md) ·
[Español](../es/resistores-em-paralelo.md)
