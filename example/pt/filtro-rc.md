# Filtro RC: tensão no capacitor

**Extensões:** `tikz`, `didactic`, `cross-references`.

## Ideias principais

O resistor liga a entrada ao nó de saída; o capacitor liga esse nó ao retorno
comum. A saída é a tensão no capacitor. O desenho não calcula a resposta
temporal.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

```circuitikz
\begin{circuitikz}[american]
\draw (0,0) to[V,l=$V_{in}$] (0,2) to[R,l=$R$] (3,2)
  to[C,l=$C$] (3,0) -- (0,0);
\draw (3,2) -- (4,2) node[right] {$V_{out}$};
\end{circuitikz}
```

::::

## Prática

Para R=1000 ohms e C=1 microfarad, qual é a constante de tempo RC?

::: solution Resposta comentada

RC=1000×10⁻⁶ s=0,001 s, ou 1 ms.

:::

[Índice da coleção](README.md)

[English](../en/filtro-rc.md) · [Español](../es/filtro-rc.md)
