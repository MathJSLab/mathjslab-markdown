# Filtro RC: tensión en el condensador

**Extensiones:** `tikz`, `didactic`, `cross-references`.

## Ideas principales

La resistencia conecta la entrada con el nodo de salida; el condensador conecta
ese nodo con el retorno común. La salida es la tensión del condensador. El
dibujo no calcula la respuesta temporal.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```circuitikz
\begin{circuitikz}[american]
\draw (0,0) to[V,l=$V_{in}$] (0,2) to[R,l=$R$] (3,2)
  to[C,l=$C$] (3,0) -- (0,0);
\draw (3,2) -- (4,2) node[right] {$V_{out}$};
\end{circuitikz}
```

::::

## Práctica

Para R=1000 ohmios y C=1 microfaradio, ¿cuál es la constante de tiempo RC?

::: solution Respuesta comentada

RC=1000×10⁻⁶ s=0,001 s, o 1 ms.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/filtro-rc.md) · [English](../en/filtro-rc.md)
