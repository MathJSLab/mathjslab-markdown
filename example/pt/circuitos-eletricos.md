# Desenhos técnicos e circuitos elétricos

**Extensões:** `tikz`, `didactic`, `cross-references`.

## Ideias principais

A {@ref vetor} mostra um vetor no plano. A {@ref circuito} representa uma fonte
e um resistor, sem simular o circuito. Habilite `wasm` e `network` para acessar
os arquivos locais do runtime.

:::: figure Vetor no plano {#vetor}

```tikz
\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,0) -- (0,2) node[above] {$y$};
  \draw[blue,thick,->] (0,0) -- (2,1) node[above] {$\vec{v}$};
\end{tikzpicture}
```

::::

:::: figure Fonte e resistor {#circuito}

```circuitikz
\begin{circuitikz}[american]
  \draw (0,0) to[battery1,l=$V$] (0,2)
    to[R,l=$R$] (3,2) -- (3,0) -- (0,0);
\end{circuitikz}
```

::::

## Prática

Qual é a corrente para uma fonte ideal de 12 V e um resistor de 6 ohms?

## Resposta comentada

Pela lei de Ohm, I=12/6=2 A.

[Índice da coleção](README.md)

[English](../en/circuitos-eletricos.md) ·
[Español](../es/circuitos-eletricos.md)
