# Dibujos técnicos y circuitos eléctricos

**Extensiones:** `tikz`, `didactic`, `cross-references`.

## Ideas principales

La {@ref vetor} muestra un vector en el plano. La {@ref circuito} representa
una fuente y una resistencia, sin simular el circuito. Habilite `wasm` y
`network` para acceder a los archivos locales del runtime.

:::: figure Vector en el plano {#vetor}

```tikz
\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,0) -- (0,2) node[above] {$y$};
  \draw[blue,thick,->] (0,0) -- (2,1) node[above] {$\vec{v}$};
\end{tikzpicture}
```

::::

:::: figure Fuente y resistencia {#circuito}

```circuitikz
\begin{circuitikz}[american]
  \draw (0,0) to[battery1,l=$V$] (0,2)
    to[R,l=$R$] (3,2) -- (3,0) -- (0,0);
\end{circuitikz}
```

::::

## Práctica

¿Cuál es la corriente para una fuente ideal de 12 V y una resistencia de 6
ohmios?

## Respuesta comentada

Por la ley de Ohm, I=12/6=2 A.

[Índice de la colección](README.md)

[Português brasileiro](../pt/circuitos-eletricos.md) ·
[English](../en/circuitos-eletricos.md)
