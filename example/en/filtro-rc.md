# RC filter: capacitor voltage

**Extensions:** `tikz`, `didactic`, `cross-references`.

## Key ideas

The resistor connects the input to the output node; the capacitor connects that
node to the common return. The output is the capacitor voltage. The drawing
does not calculate a time response.

Observe {@ref diagram}.

:::: figure Construction {#diagram}

```circuitikz
\begin{circuitikz}[american]
\draw (0,0) to[V,l=$V_{in}$] (0,2) to[R,l=$R$] (3,2)
  to[C,l=$C$] (3,0) -- (0,0);
\draw (3,2) -- (4,2) node[right] {$V_{out}$};
\end{circuitikz}
```

::::

## Practice

For R=1000 ohms and C=1 microfarad, what is the RC time constant?

::: solution Answer with explanation

RC=1000×10⁻⁶ s=0.001 s, or 1 ms.

:::

[Collection index](README.md)

[Português brasileiro](../pt/filtro-rc.md) · [Español](../es/filtro-rc.md)
