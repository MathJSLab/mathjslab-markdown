# CMOS gates

The output terminals of {@ref cmos-gates} are marked with open circles.

::: figure CMOS NAND and NOR {#cmos-gates}

```circuitikz
\begin{circuitikz}[american]
  \node[pmos] (P1) at (0,2) {$T_1$};
  \node[pmos] (P2) at (2,2) {$T_2$};
  \node[nmos] (N1) at (1,0) {$T_3$};
  \node[nmos] (N2) at (1,-2) {$T_4$};
  \draw (P1.S) -- (0,3) node[vcc]{$V_{CC}$} -| (P2.S);
  \draw (P1.D) |- (1,1) node[circ]{} -| (P2.D);
  \draw (N1.D) -- (1,1) -- (3,1) node[ocirc,label=right:NAND]{};
  \draw (N1.S) -- (N2.D) (N2.S) node[ground]{};
  \draw (P1.G) -- ++(-0.5,0) node[ocirc,label=left:A]{};
  \draw (P2.G) -- ++(-0.5,0) node[ocirc,label=left:B]{};
  \draw (N1.G) -- ++(-0.5,0) node[ocirc,label=left:A]{};
  \draw (N2.G) -- ++(-0.5,0) node[ocirc,label=left:B]{};

  \node[pmos] (P3) at (7,3) {$T_5$};
  \node[pmos] (P4) at (7,1) {$T_6$};
  \node[nmos] (N3) at (6,-1) {$T_7$};
  \node[nmos] (N4) at (8,-1) {$T_8$};
  \draw (P3.S) node[vcc]{$V_{CC}$} (P3.D) -- (P4.S);
  \draw (N3.D) |- (7,0) node[circ]{} -| (N4.D);
  \draw (P4.D) -- (7,0) -- (9,0) node[ocirc,label=right:NOR]{};
  \draw (N3.S) |- (7,-2) node[ground]{} -| (N4.S);
  \draw (P3.G) -- ++(-0.5,0) node[ocirc,label=left:A]{};
  \draw (P4.G) -- ++(-0.5,0) node[ocirc,label=left:B]{};
  \draw (N3.G) -- ++(-0.5,0) node[ocirc,label=left:A]{};
  \draw (N4.G) -- ++(-0.5,0) node[ocirc,label=left:B]{};

  \draw (3,-0.5) -- (3,-1.5);
  \draw (2.5,-1) to[crossing] (3.5,-1);
\end{circuitikz}
```

:::
