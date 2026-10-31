<!-- prettier-ignore -->
::: figure Correspondência entre operações de conjuntos, lógica proposicional, álgebra booleana, circuitos digitais e programação {#fig-logic-representations}

```tikz
\begin{tikzpicture}[
    scale=1.5,
    transform shape,
    >=stealth,
    font=\small,
    line cap=round
]
\usetikzlibrary{circuits.logic.US,calc}

% ==================================================
% GEOMETRIA GERAL
% ==================================================

\def\colA{0}
\def\colB{4.2}
\def\colC{8.4}
\def\colD{12.6}
\def\colE{18.0}

\def\rowA{-2.4}
\def\rowB{-6.0}
\def\rowC{-9.6}
\def\rowD{-13.2}

% ==================================================
% CABEÇALHOS
% ==================================================

\node[align=center,font=\bfseries\small]
    at (\colA,0)
    {Diagrama de Venn\\(Conjuntos)};

\node[align=center,font=\bfseries\small]
    at (\colB,0)
    {Tabela-verdade\\(Lógica proposicional)};

\node[align=center,font=\bfseries\small]
    at (\colC,0)
    {Operação binária\\(Álgebra booleana)};

\node[align=center,font=\bfseries\small]
    at (\colD,0)
    {Bloco lógico\\(Circuitos digitais)};

\node[align=center,font=\bfseries\small]
    at (\colE,0)
    {Operação lógica\\(Programação)};

% ==================================================
% TÍTULOS DAS OPERAÇÕES
% ==================================================

% AND
\node[font=\bfseries] at (\colA,\rowA+1.15) {Interseção};
\node[font=\bfseries] at (\colB,\rowA+1.15) {Conjunção};
\node[font=\bfseries] at (\colC,\rowA+1.15) {E};
\node[font=\bfseries] at (\colD,\rowA+1.15) {AND};
\node[font=\bfseries] at (\colE,\rowA+1.15) {AND};

% OR
\node[font=\bfseries] at (\colA,\rowB+1.15) {União};
\node[font=\bfseries] at (\colB,\rowB+1.15) {Disjunção};
\node[font=\bfseries] at (\colC,\rowB+1.15) {OU};
\node[font=\bfseries] at (\colD,\rowB+1.15) {OR};
\node[font=\bfseries] at (\colE,\rowB+1.15) {OR};

% XOR
\node[align=center,font=\bfseries]
    at (\colA,\rowC+1.15)
    {Diferença\\simétrica};

\node[align=center,font=\bfseries]
    at (\colB,\rowC+1.15)
    {Disjunção\\exclusiva};

\node[align=center,font=\bfseries]
    at (\colC,\rowC+1.15)
    {OU\\exclusivo};

\node[font=\bfseries] at (\colD,\rowC+1.15) {XOR};
\node[font=\bfseries] at (\colE,\rowC+1.15) {XOR};

% NOT
\node[font=\bfseries] at (\colA,\rowD+1.15) {Complemento};
\node[font=\bfseries] at (\colB,\rowD+1.15) {Negação};
\node[font=\bfseries] at (\colC,\rowD+1.15) {NÃO};
\node[font=\bfseries] at (\colD,\rowD+1.15) {NOT};
\node[font=\bfseries] at (\colE,\rowD+1.15) {NOT};

% ==================================================
% COLUNA 1 — DIAGRAMAS DE VENN
% ==================================================

% Interseção
\begin{scope}[shift={(\colA,\rowA)}]
    \node at (0,0.55) {$A\cap B$};

    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \begin{scope}
        \clip (-0.42,-0.55) circle (0.65);
        \fill[gray!60] (0.42,-0.55) circle (0.65);
    \end{scope}

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% União
\begin{scope}[shift={(\colA,\rowB)}]
    \node at (0,0.55) {$A\cup B$};

    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \fill[gray!60] (-0.42,-0.55) circle (0.65);
    \fill[gray!60] (0.42,-0.55) circle (0.65);

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% Diferença simétrica
\begin{scope}[shift={(\colA,\rowC)}]
    \node at (0,0.55) {$(A\cup B)-(A\cap B)$};

    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \fill[gray!60] (-0.42,-0.55) circle (0.65);
    \fill[gray!60] (0.42,-0.55) circle (0.65);

    \begin{scope}
        \clip (-0.42,-0.55) circle (0.65);
        \fill[white] (0.42,-0.55) circle (0.65);
    \end{scope}

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% Complemento
\begin{scope}[shift={(\colA,\rowD)}]
    \node at (0,0.55) {$\overline A$};

    \fill[gray!60] (-1.25,-1.45) rectangle (1.25,0.30);
    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \fill[white] (-0.42,-0.55) circle (0.65);

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% ==================================================
% COLUNA 2 — LÓGICA PROPOSICIONAL
% ==================================================

% Tabelas ampliadas horizontalmente
\foreach \y in {\rowA,\rowB,\rowC}{
    \begin{scope}[shift={(\colB,\y-0.55)}]
        \draw (-1.35,-0.9) rectangle (1.35,0.9);
        \draw (-0.45,-0.9) -- (-0.45,0.9);
        \draw (0.45,-0.9) -- (0.45,0.9);

        \foreach \yy in {-0.54,-0.18,0.18,0.54}
            \draw (-1.35,\yy) -- (1.35,\yy);

        \fill[gray!25] (-1.35,0.54) rectangle (1.35,0.9);

        \node at (-0.90,0.72) {$a$};
        \node at (0,0.72) {$b$};

        \node at (-0.90,0.36) {F};
        \node at (0,0.36) {F};

        \node at (-0.90,0) {F};
        \node at (0,0) {V};

        \node at (-0.90,-0.36) {V};
        \node at (0,-0.36) {F};

        \node at (-0.90,-0.72) {V};
        \node at (0,-0.72) {V};
    \end{scope}
}

% AND
\begin{scope}[shift={(\colB,\rowA-0.55)}]
    \node at (0.90,0.72) {$a\land b$};
    \node at (0.90,0.36) {F};
    \node at (0.90,0) {F};
    \node at (0.90,-0.36) {F};
    \node at (0.90,-0.72) {V};
\end{scope}

% OR
\begin{scope}[shift={(\colB,\rowB-0.55)}]
    \node at (0.90,0.72) {$a\lor b$};
    \node at (0.90,0.36) {F};
    \node at (0.90,0) {V};
    \node at (0.90,-0.36) {V};
    \node at (0.90,-0.72) {V};
\end{scope}

% XOR — disjunção sublinhada
\begin{scope}[shift={(\colB,\rowC-0.55)}]
    \node at (0.90,0.72) {$a\underline{\lor}b$};
    \node at (0.90,0.36) {F};
    \node at (0.90,0) {V};
    \node at (0.90,-0.36) {V};
    \node at (0.90,-0.72) {F};
\end{scope}

% NOT
\begin{scope}[shift={(\colB,\rowD-0.55)}]
    \draw (-0.85,-0.50) rectangle (0.85,0.50);
    \draw (0,-0.50) -- (0,0.50);
    \draw (-0.85,0.16) -- (0.85,0.16);

    \fill[gray!25] (-0.85,0.16) rectangle (0.85,0.50);

    \node at (-0.425,0.33) {$a$};
    \node at (0.425,0.33) {$\neg a$};

    \node at (-0.425,-0.02) {F};
    \node at (0.425,-0.02) {V};

    \node at (-0.425,-0.33) {V};
    \node at (0.425,-0.33) {F};
\end{scope}

% ==================================================
% COLUNA 3 — ÁLGEBRA BOOLEANA
% ==================================================

\foreach \y in {\rowA,\rowB,\rowC}{
    \begin{scope}[shift={(\colC,\y-0.55)}]
        \draw (-1.35,-0.9) rectangle (1.35,0.9);
        \draw (-0.45,-0.9) -- (-0.45,0.9);
        \draw (0.45,-0.9) -- (0.45,0.9);

        \foreach \yy in {-0.54,-0.18,0.18,0.54}
            \draw (-1.35,\yy) -- (1.35,\yy);

        \fill[gray!25] (-1.35,0.54) rectangle (1.35,0.9);

        \node at (-0.90,0.72) {$a$};
        \node at (0,0.72) {$b$};

        \node at (-0.90,0.36) {0};
        \node at (0,0.36) {0};

        \node at (-0.90,0) {0};
        \node at (0,0) {1};

        \node at (-0.90,-0.36) {1};
        \node at (0,-0.36) {0};

        \node at (-0.90,-0.72) {1};
        \node at (0,-0.72) {1};
    \end{scope}
}

% AND
\begin{scope}[shift={(\colC,\rowA-0.55)}]
    \node at (0.90,0.72) {$a\cdot b$};
    \node at (0.90,0.36) {0};
    \node at (0.90,0) {0};
    \node at (0.90,-0.36) {0};
    \node at (0.90,-0.72) {1};
\end{scope}

% OR
\begin{scope}[shift={(\colC,\rowB-0.55)}]
    \node at (0.90,0.72) {$a+b$};
    \node at (0.90,0.36) {0};
    \node at (0.90,0) {1};
    \node at (0.90,-0.36) {1};
    \node at (0.90,-0.72) {1};
\end{scope}

% XOR
\begin{scope}[shift={(\colC,\rowC-0.55)}]
    \node at (0.90,0.72) {$a\oplus b$};
    \node at (0.90,0.36) {0};
    \node at (0.90,0) {1};
    \node at (0.90,-0.36) {1};
    \node at (0.90,-0.72) {0};
\end{scope}

% NOT
\begin{scope}[shift={(\colC,\rowD-0.55)}]
    \draw (-0.85,-0.50) rectangle (0.85,0.50);
    \draw (0,-0.50) -- (0,0.50);
    \draw (-0.85,0.16) -- (0.85,0.16);

    \fill[gray!25] (-0.85,0.16) rectangle (0.85,0.50);

    \node at (-0.425,0.33) {$a$};
    \node at (0.425,0.33) {$\overline a$};

    \node at (-0.425,-0.02) {0};
    \node at (0.425,-0.02) {1};

    \node at (-0.425,-0.33) {1};
    \node at (0.425,-0.33) {0};
\end{scope}

% ==================================================
% COLUNA 4 — PORTAS LÓGICAS (DOBRO DO TAMANHO)
% ==================================================

% AND
\begin{scope}[shift={(\colD,\rowA-0.55)}]
    \node[and gate US,draw,logic gate inputs=nn,
          scale=2.2,transform shape] (g) at (0,0) {};

    \draw (g.input 1) -- ++(-1.0,0)
        node[left] {$a$};
    \draw (g.input 2) -- ++(-1.0,0)
        node[left] {$b$};

    \draw (g.output) -- ++(0.35,0)
        node[right] {$a\cdot b$};
\end{scope}

% OR
\begin{scope}[shift={(\colD,\rowB-0.55)}]
    \node[or gate US,draw,logic gate inputs=nn,
          scale=2.2,transform shape] (g) at (0,0) {};

    \draw (g.input 1) -- ++(-1.0,0)
        node[left] {$a$};
    \draw (g.input 2) -- ++(-1.0,0)
        node[left] {$b$};

    \draw (g.output) -- ++(0.35,0)
        node[right] {$a+b$};
\end{scope}

% XOR
\begin{scope}[shift={(\colD,\rowC-0.55)}]
    \node[xor gate US,draw,logic gate inputs=nn,
          scale=2.2,transform shape] (g) at (0,0) {};

    \draw (g.input 1) -- ++(-1.0,0)
        node[left] {$a$};
    \draw (g.input 2) -- ++(-1.0,0)
        node[left] {$b$};

    \draw (g.output) -- ++(0.35,0)
        node[right] {$a\oplus b$};
\end{scope}

% NOT
\begin{scope}[shift={(\colD,\rowD-0.55)}]
    \node[not gate US,draw,
          scale=2.2,transform shape] (g) at (0,0) {};

    \draw (g.input) -- ++(-1.0,0)
        node[left] {$a$};

    \draw (g.output) -- ++(0.35,0)
        node[right] {$\overline a$};
\end{scope}

% ==================================================
% COLUNA 5 — LINGUAGEM DE PROGRAMAÇÃO
% ==================================================

\node[font=\ttfamily\large]
    at (\colE,\rowA-0.55)
    {a \& b};

\node[font=\ttfamily\large]
    at (\colE,\rowB-0.55)
    {a | b};

\node[font=\ttfamily\small]
    at (\colE,\rowC-0.55)
    {(a \& !b) | (!a \& b)};

\node[font=\ttfamily\large]
    at (\colE,\rowD-0.55)
    {!a};

\end{tikzpicture}
```

:::
