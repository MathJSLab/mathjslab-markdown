# Technical drawings and electrical circuits

**Extensions:** `tikz`, `didactic`, `cross-references`.

## Key ideas

{@ref vetor} shows a vector in the plane. {@ref circuito} represents a source
and a resistor, without simulating the circuit. Enable `wasm` and `network` to
access the local runtime assets.

:::: figure Vector in the plane {#vetor}

```tikz
\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,0) -- (0,2) node[above] {$y$};
  \draw[blue,thick,->] (0,0) -- (2,1) node[above] {$\vec{v}$};
\end{tikzpicture}
```

::::

:::: figure Source and resistor {#circuito}

```circuitikz
\begin{circuitikz}[american]
  \draw (0,0) to[battery1,l=$V$] (0,2)
    to[R,l=$R$] (3,2) -- (3,0) -- (0,0);
\end{circuitikz}
```

::::

## Practice

What is the current for an ideal 12 V source and a 6 ohm resistor?

## Answer with explanation

By Ohm’s law, I=12/6=2 A.

[Collection index](README.md)

[Português brasileiro](../pt/circuitos-eletricos.md) ·
[Español](../es/circuitos-eletricos.md)
