<!-- prettier-ignore -->
::: figure Representação posicional do número decimal 1349 na base decimal {#fig-decimal-place-value}

```tikz
\begin{tikzpicture}[
    scale=1.6,
    transform shape,
    >=stealth,
    line cap=round,
    term/.style={font=\large,inner sep=0pt},
    digit/.style={font=\Large,inner sep=0pt}
]

% Coordenadas das quatro colunas
% Espaçamento reduzido de 3.0 para 2.5
\coordinate (c1) at (0,0);
\coordinate (c2) at (2.5,0);
\coordinate (c3) at (5.0,0);
\coordinate (c4) at (7.5,0);

% Tabela de potências de dez (à esquerda)
% Deslocada 0.4 unidade para a direita
\node[anchor=west,font=\large] at (-4.0,4.3) {$10^0=1$};
\node[anchor=west,font=\large] at (-4.0,3.7) {$10^1=10$};
\node[anchor=west,font=\large] at (-4.0,3.1) {$10^2=100$};
\node[anchor=west,font=\large] at (-4.0,2.5) {$10^3=1000$};
\node[anchor=west,font=\large] at (-4.0,1.9) {$10^4=10000$};
\node[anchor=west,font=\large] at (-4.0,1.3) {$10^5=100000$};

\node[font=\large] at (-3.65,0.65) {$\vdots$};
\node[font=\large] at (-2.35,0.65) {$\vdots$};

% Pesos das posições decimais
\node[font=\large] at (0,4.2) {$10^3$};
\node[font=\large] at (2.5,4.2) {$10^2$};
\node[font=\large] at (5.0,4.2) {$10^1$};
\node[font=\large] at (7.5,4.2) {$10^0$};

% Identificação dos pesos, dígitos e decomposição
\node[anchor=west,font=\large] at (9.0,4.2) {Peso};
\node[anchor=west,font=\large] at (9.0,2.4) {Dígito};
\node[anchor=west,font=\large] at (9.0,0.9) {Decomposição};

% Setas indicando os pesos
\draw[->,line width=1.2pt] (0,2.9) -- (0,3.85);
\draw[->,line width=1.2pt] (2.5,2.9) -- (2.5,3.85);
\draw[->,line width=1.2pt] (5.0,2.9) -- (5.0,3.85);
\draw[->,line width=1.2pt] (7.5,2.9) -- (7.5,3.85);

% Algarismos do número 1349 em negrito
\node[digit] (dig1) at (0,2.4) {$\mathbf{1}$};
\node[digit] (dig2) at (2.5,2.4) {$\mathbf{3}$};
\node[digit] (dig3) at (5.0,2.4) {$\mathbf{4}$};
\node[digit] (dig4) at (7.5,2.4) {$\mathbf{9}$};

% Decomposição: sinais de multiplicação centralizados
% nas mesmas colunas dos pesos e dígitos

% Termo 1
\node[term,anchor=east] at (-0.35,0.9) {$1$};
\node[term] (mul1) at (0,0.9) {$\times$};
\node[term,anchor=west] at (0.35,0.9) {$10^3$};

% Termo 2
\node[term,anchor=east] at (2.15,0.9) {$3$};
\node[term] (mul2) at (2.5,0.9) {$\times$};
\node[term,anchor=west] at (2.85,0.9) {$10^2$};

% Termo 3
\node[term,anchor=east] at (4.65,0.9) {$4$};
\node[term] (mul3) at (5.0,0.9) {$\times$};
\node[term,anchor=west] at (5.35,0.9) {$10^1$};

% Termo 4
\node[term,anchor=east] at (7.15,0.9) {$9$};
\node[term] (mul4) at (7.5,0.9) {$\times$};
\node[term,anchor=west] at (7.85,0.9) {$10^0$};

% Sinais de adição com espaçamento equilibrado
% entre os termos da decomposição
\node[term] at (1.48,0.9) {$+$};
\node[term] at (3.98,0.9) {$+$};
\node[term] at (6.48,0.9) {$+$};

% Traços verticais de associação
\draw[line width=0.9pt] (0,1.95) -- (0,1.35);
\draw[line width=0.9pt] (2.5,1.95) -- (2.5,1.35);
\draw[line width=0.9pt] (5.0,1.95) -- (5.0,1.35);
\draw[line width=0.9pt] (7.5,1.95) -- (7.5,1.35);

% Chave inferior ajustada à largura da decomposição
\draw[line width=0.9pt]
    (-0.65,0.45)
    .. controls (-0.65,0.15) and (-0.50,0.1) .. (-0.30,0.1)
    -- (3.30,0.1)
    .. controls (3.60,0.1) and (3.65,-0.2) .. (3.75,-0.35)
    .. controls (3.85,-0.2) and (3.90,0.1) .. (4.20,0.1)
    -- (8.05,0.1)
    .. controls (8.25,0.1) and (8.40,0.15) .. (8.40,0.45);

% Resultado
\node[font=\Large] at (3.75,-0.85) {$1349$};

\end{tikzpicture}
```

:::

<!-- prettier-ignore -->
::: figure Representação posicional do número 322 na base 4 {#fig-base4-place-value}

```tikz
\begin{tikzpicture}[
    scale=1.6,
    transform shape,
    >=stealth,
    line cap=round,
    term/.style={font=\large,inner sep=0pt},
    digit/.style={font=\Large,inner sep=0pt}
]

% Coordenadas das três colunas
% Espaçamento reduzido de 3.0 para 2.5
\coordinate (c1) at (0,0);
\coordinate (c2) at (2.5,0);
\coordinate (c3) at (5.0,0);

% Tabela de potências de quatro (à esquerda)
% Aproximada do diagrama central
\node[anchor=west,font=\large] at (-3.8,4.3) {$4^0=1$};
\node[anchor=west,font=\large] at (-3.8,3.7) {$4^1=4$};
\node[anchor=west,font=\large] at (-3.8,3.1) {$4^2=16$};
\node[anchor=west,font=\large] at (-3.8,2.5) {$4^3=64$};
\node[anchor=west,font=\large] at (-3.8,1.9) {$4^4=256$};
\node[anchor=west,font=\large] at (-3.8,1.3) {$4^5=1024$};

\node[font=\large] at (-3.45,0.65) {$\vdots$};
\node[font=\large] at (-2.15,0.65) {$\vdots$};

% Pesos das posições na base 4
\node[font=\large] at (0,4.2) {$4^2$};
\node[font=\large] at (2.5,4.2) {$4^1$};
\node[font=\large] at (5.0,4.2) {$4^0$};

% Identificações à direita
% Deslocadas para evitar sobreposição com "=58"
\node[anchor=west,font=\large] at (7.8,4.2) {Peso};
\node[anchor=west,font=\large] at (7.8,2.4) {Dígito};
\node[anchor=west,font=\large] at (7.8,0.9) {Decomposição};

% Setas indicando os pesos
\draw[->,line width=1.2pt] (0,2.9) -- (0,3.85);
\draw[->,line width=1.2pt] (2.5,2.9) -- (2.5,3.85);
\draw[->,line width=1.2pt] (5.0,2.9) -- (5.0,3.85);

% Dígitos do número 322 na base 4
\node[digit] at (0,2.4) {$\mathbf{3}$};
\node[digit] at (2.5,2.4) {$\mathbf{2}$};
\node[digit] at (5.0,2.4) {$\mathbf{2}$};

% Decomposição em potências de quatro
% Sinais de multiplicação alinhados com pesos e dígitos

% Termo 1: 3 x 4^2
\node[term,anchor=east] at (-0.35,0.9) {$3$};
\node[term] at (0,0.9) {$\times$};
\node[term,anchor=west] at (0.35,0.9) {$4^2$};

% Termo 2: 2 x 4^1
\node[term,anchor=east] at (2.15,0.9) {$2$};
\node[term] at (2.5,0.9) {$\times$};
\node[term,anchor=west] at (2.85,0.9) {$4^1$};

% Termo 3: 2 x 4^0
\node[term,anchor=east] at (4.65,0.9) {$2$};
\node[term] at (5.0,0.9) {$\times$};
\node[term,anchor=west] at (5.35,0.9) {$4^0$};

% Sinais de adição com espaçamento equilibrado
\node[term] at (1.48,0.9) {$+$};
\node[term] at (3.98,0.9) {$+$};

% Resultado da decomposição na base decimal
\node[term,anchor=west] at (6.15,0.9) {$=58$};

% Traços verticais entre dígitos e multiplicações
\draw[line width=0.9pt] (0,1.95) -- (0,1.35);
\draw[line width=0.9pt] (2.5,1.95) -- (2.5,1.35);
\draw[line width=0.9pt] (5.0,1.95) -- (5.0,1.35);

% Chave inferior ajustada à largura dos três termos
% O extremo direito fica antes do sinal de igualdade
\draw[line width=0.9pt]
    (-0.65,0.45)
    .. controls (-0.65,0.15) and (-0.50,0.1) .. (-0.30,0.1)
    -- (2.05,0.1)
    .. controls (2.35,0.1) and (2.40,-0.2) .. (2.50,-0.35)
    .. controls (2.60,-0.2) and (2.65,0.1) .. (2.95,0.1)
    -- (5.45,0.1)
    .. controls (5.65,0.1) and (5.80,0.15) .. (5.80,0.45);

% Representação na base 4 e equivalência decimal
\node[font=\Large] at (2.5,-0.85) {$322_4=58_{10}$};

\end{tikzpicture}
```

:::

<!-- prettier-ignore -->
::: figure Representação posicional do número binário 110101 {#fig-binary-place-value}

```tikz
\begin{tikzpicture}[
    scale=1.6,
    transform shape,
    >=stealth,
    line cap=round,
    term/.style={font=\large,inner sep=0pt},
    digit/.style={font=\Large,inner sep=0pt}
]

% Parâmetros geométricos
% Espaçamento entre colunas reduzido para 2.2
% Centros das seis colunas: 0, 2.2, 4.4, 6.6, 8.8, 11.0

% Tabela de potências de dois (à esquerda)
% Aproximada do diagrama central
\node[anchor=west,font=\large] at (-3.25,4.3) {$2^0=1$};
\node[anchor=west,font=\large] at (-3.25,3.7) {$2^1=2$};
\node[anchor=west,font=\large] at (-3.25,3.1) {$2^2=4$};
\node[anchor=west,font=\large] at (-3.25,2.5) {$2^3=8$};
\node[anchor=west,font=\large] at (-3.25,1.9) {$2^4=16$};
\node[anchor=west,font=\large] at (-3.25,1.3) {$2^5=32$};

\node[font=\large] at (-2.90,0.65) {$\vdots$};
\node[font=\large] at (-1.75,0.65) {$\vdots$};

% Pesos das seis posições binárias
\node[font=\large] at (0,4.2) {$2^5$};
\node[font=\large] at (2.2,4.2) {$2^4$};
\node[font=\large] at (4.4,4.2) {$2^3$};
\node[font=\large] at (6.6,4.2) {$2^2$};
\node[font=\large] at (8.8,4.2) {$2^1$};
\node[font=\large] at (11.0,4.2) {$2^0$};

% Identificações à direita, mais próximas do diagrama
% Mantida uma distância suficiente do resultado = 53
\node[anchor=west,font=\large] at (13.35,4.2) {Peso};
\node[anchor=west,font=\large] at (13.35,2.4) {Dígito};
\node[anchor=west,font=\large] at (13.35,0.9) {Decomposição};

% Setas indicando os pesos
\draw[->,line width=1.2pt] (0,2.9) -- (0,3.85);
\draw[->,line width=1.2pt] (2.2,2.9) -- (2.2,3.85);
\draw[->,line width=1.2pt] (4.4,2.9) -- (4.4,3.85);
\draw[->,line width=1.2pt] (6.6,2.9) -- (6.6,3.85);
\draw[->,line width=1.2pt] (8.8,2.9) -- (8.8,3.85);
\draw[->,line width=1.2pt] (11.0,2.9) -- (11.0,3.85);

% Dígitos do número binário 110101
\node[digit] at (0,2.4) {$\mathbf{1}$};
\node[digit] at (2.2,2.4) {$\mathbf{1}$};
\node[digit] at (4.4,2.4) {$\mathbf{0}$};
\node[digit] at (6.6,2.4) {$\mathbf{1}$};
\node[digit] at (8.8,2.4) {$\mathbf{0}$};
\node[digit] at (11.0,2.4) {$\mathbf{1}$};

% Decomposição em potências de dois
% Os sinais de multiplicação permanecem alinhados
% verticalmente aos dígitos e pesos.

% Termo 1: 1 x 2^5
\node[term,anchor=east] at (-0.35,0.9) {$1$};
\node[term] at (0,0.9) {$\times$};
\node[term,anchor=west] at (0.35,0.9) {$2^5$};

% Termo 2: 1 x 2^4
\node[term,anchor=east] at (1.85,0.9) {$1$};
\node[term] at (2.2,0.9) {$\times$};
\node[term,anchor=west] at (2.55,0.9) {$2^4$};

% Termo 3: 0 x 2^3
\node[term,anchor=east] at (4.05,0.9) {$0$};
\node[term] at (4.4,0.9) {$\times$};
\node[term,anchor=west] at (4.75,0.9) {$2^3$};

% Termo 4: 1 x 2^2
\node[term,anchor=east] at (6.25,0.9) {$1$};
\node[term] at (6.6,0.9) {$\times$};
\node[term,anchor=west] at (6.95,0.9) {$2^2$};

% Termo 5: 0 x 2^1
\node[term,anchor=east] at (8.45,0.9) {$0$};
\node[term] at (8.8,0.9) {$\times$};
\node[term,anchor=west] at (9.15,0.9) {$2^1$};

% Termo 6: 1 x 2^0
\node[term,anchor=east] at (10.65,0.9) {$1$};
\node[term] at (11.0,0.9) {$\times$};
\node[term,anchor=west] at (11.35,0.9) {$2^0$};

% Sinais de adição
% Centralizados nos intervalos entre os termos
\node[term] at (1.10,0.9) {$+$};
\node[term] at (3.30,0.9) {$+$};
\node[term] at (5.50,0.9) {$+$};
\node[term] at (7.70,0.9) {$+$};
\node[term] at (9.90,0.9) {$+$};

% Resultado decimal da decomposição
\node[term,anchor=west] at (12.0,0.9) {$=53$};

% Traços verticais entre dígitos e multiplicações
\draw[line width=0.9pt] (0,1.95) -- (0,1.35);
\draw[line width=0.9pt] (2.2,1.95) -- (2.2,1.35);
\draw[line width=0.9pt] (4.4,1.95) -- (4.4,1.35);
\draw[line width=0.9pt] (6.6,1.95) -- (6.6,1.35);
\draw[line width=0.9pt] (8.8,1.95) -- (8.8,1.35);
\draw[line width=0.9pt] (11.0,1.95) -- (11.0,1.35);

% Chave inferior abrangendo somente os termos da decomposição
% Extremidades ligeiramente além do primeiro e último termos
% O resultado = 53 permanece fora da chave
\draw[line width=0.9pt]
    (-0.65,0.45)
    .. controls (-0.65,0.15) and (-0.50,0.1) .. (-0.30,0.1)
    -- (5.05,0.1)
    .. controls (5.35,0.1) and (5.40,-0.2) .. (5.50,-0.35)
    .. controls (5.60,-0.2) and (5.65,0.1) .. (5.95,0.1)
    -- (11.30,0.1)
    .. controls (11.50,0.1) and (11.65,0.15) .. (11.65,0.45);

% Número binário e equivalente decimal
\node[font=\Large] at (5.50,-0.85)
    {$110101_2=53_{10}$};

\end{tikzpicture}
```

:::

<!-- prettier-ignore -->
::: figure Conversão de 118 decimal para binário por divisões sucessivas {#fig-decimal-to-binary-118}

```tikz
\begin{tikzpicture}[
    scale=1.6,
    transform shape,
    >=stealth,
    line cap=round,
    num/.style={font=\Large,inner sep=0pt},
    resto/.style={num,font=\Large\bfseries}
]

% Parâmetros geométricos
% Passo horizontal: 1.15
% Passo vertical:   1.10
%
% Dividendos e subtraendos alinhados pela direita.
% Subtraendos elevados em 0.35 unidade.
% Traços das subtrações elevados em 0.30 unidade.
% Restos mantidos nas posições originais.
% Cada quociente aparece uma única vez.

% Escada contínua
\draw[line width=1.1pt]
    (0,9.3) -- (0,8.2) -- (1.15,8.2)
    -- (1.15,7.1) -- (2.30,7.1)
    -- (2.30,6.0) -- (3.45,6.0)
    -- (3.45,4.9) -- (4.60,4.9)
    -- (4.60,3.8) -- (5.75,3.8)
    -- (5.75,2.7) -- (6.90,2.7)
    -- (6.90,1.6) -- (8.05,1.6);

% Primeira divisão: 118 / 2 = 59, resto 0
% Subtração afastada do segmento vertical da escada

\node[num,anchor=east] (d118) at (-0.50,8.75) {$118$};
\node[num,anchor=west] at (0.10,8.75) {$2$};

% Subtraendo
\node[num,anchor=east] at (d118.east |- 0,8.20) {$-118$};

% Quociente e divisor da próxima divisão (inalterados)
\node[num,anchor=west] (q59) at (0.10,7.65) {$59$};
\node[num,anchor=west] at (1.25,7.65) {$2$};

% Traço da subtração
\draw[line width=0.8pt] (-1.75,7.82) -- (-0.50,7.82);

% Resto
\node[resto,anchor=east] at (d118.east |- 0,7.28) {$\mathbf{0}$};

% Segunda divisão: 59 / 2 = 29, resto 1
\node[num,anchor=east] at (q59.east |- 0,7.10) {$-58$};
\node[num,anchor=west] (q29) at (1.25,6.55) {$29$};
\node[num,anchor=west] at (2.40,6.55) {$2$};

\draw[line width=0.8pt]
    ([xshift=-0.95cm]q59.east |- 0,6.72)
    -- (q59.east |- 0,6.72);
\node[resto,anchor=east] at (q59.east |- 0,6.18) {$\mathbf{1}$};

% Terceira divisão: 29 / 2 = 14, resto 1
\node[num,anchor=east] at (q29.east |- 0,6.00) {$-28$};
\node[num,anchor=west] (q14) at (2.40,5.45) {$14$};
\node[num,anchor=west] at (3.55,5.45) {$2$};

\draw[line width=0.8pt]
    ([xshift=-0.95cm]q29.east |- 0,5.62)
    -- (q29.east |- 0,5.62);
\node[resto,anchor=east] at (q29.east |- 0,5.08) {$\mathbf{1}$};

% Quarta divisão: 14 / 2 = 7, resto 0
\node[num,anchor=east] at (q14.east |- 0,4.90) {$-14$};
\node[num,anchor=west] (q7) at (3.55,4.35) {$7$};
\node[num,anchor=west] at (4.70,4.35) {$2$};

\draw[line width=0.8pt]
    ([xshift=-0.95cm]q14.east |- 0,4.52)
    -- (q14.east |- 0,4.52);
\node[resto,anchor=east] at (q14.east |- 0,3.98) {$\mathbf{0}$};

% Quinta divisão: 7 / 2 = 3, resto 1
\node[num,anchor=east] at (q7.east |- 0,3.80) {$-6$};
\node[num,anchor=west] (q3) at (4.70,3.25) {$3$};
\node[num,anchor=west] at (5.85,3.25) {$2$};

\draw[line width=0.8pt]
    ([xshift=-0.75cm]q7.east |- 0,3.42)
    -- (q7.east |- 0,3.42);
\node[resto,anchor=east] at (q7.east |- 0,2.88) {$\mathbf{1}$};

% Sexta divisão: 3 / 2 = 1, resto 1
\node[num,anchor=east] at (q3.east |- 0,2.70) {$-2$};
\node[num,anchor=west] (q1) at (5.85,2.15) {$1$};
\node[num,anchor=west] at (7.00,2.15) {$2$};

\draw[line width=0.8pt]
    ([xshift=-0.75cm]q3.east |- 0,2.32)
    -- (q3.east |- 0,2.32);
\node[resto,anchor=east] at (q3.east |- 0,1.78) {$\mathbf{1}$};

% Sétima divisão: 1 / 2 = 0, resto 1
\node[num,anchor=east] at (q1.east |- 0,1.60) {$-0$};
\node[num,anchor=west] (q0) at (7.00,1.05) {$0$};

\draw[line width=0.8pt]
    ([xshift=-0.75cm]q1.east |- 0,1.22)
    -- (q1.east |- 0,1.22);
\node[resto,anchor=east] at (q1.east |- 0,0.68) {$\mathbf{1}$};

% Seta de leitura dos restos (inalterada)
\draw[->,line width=1.2pt]
    (6.70,0.10)
    -- (5.40,0.10)
    -- (-1.65,7.05);

% Legenda (inalterada)
\node[font=\large] at (3.5,-0.45)
    {Restos lidos de baixo para cima};

% Resultado (inalterado)
\node[font=\Large] at (3.5,-1.25)
    {$118_{10}=1110110_2$};

\end{tikzpicture}
```

:::

<!-- prettier-ignore -->
::: table Tabela de conversão de base {#tab-base-conversion .full-width}

| Decimal | Binário | Octal | Hexadecimal |
| :-----: | :-----: | :---: | :---------: |
|    0    |  0000   |  00   |      0      |
|    1    |  0001   |  01   |      1      |
|    2    |  0010   |  02   |      2      |
|    3    |  0011   |  03   |      3      |
|    4    |  0100   |  04   |      4      |
|    5    |  0101   |  05   |      5      |
|    6    |  0110   |  06   |      6      |
|    7    |  0111   |  07   |      7      |
|    8    |  1000   |  10   |      8      |
|    9    |  1001   |  11   |      9      |
|   10    |  1010   |  12   |      A      |
|   11    |  1011   |  13   |      B      |
|   12    |  1100   |  14   |      C      |
|   13    |  1101   |  15   |      D      |
|   14    |  1110   |  16   |      E      |
|   15    |  1111   |  17   |      F      |

:::

<!-- prettier-ignore -->
::: table Tabela de caracteres ASCII de 7 bits {#tab-ascii .full-width}

|             |                   |     |     |     | $b_6 b_5 b_4$ |     |     |     |     |
| :---------: | :---------------: | :-: | :-: | :-: | :-----------: | :-: | :-: | :-: | :-: |
| **Decimal** | $b_3 b_2 b_1 b_0$ | 000 | 001 | 010 |      011      | 100 | 101 | 110 | 111 |
|      0      |       0000        | NUL | DLE | SP  |       0       |  @  |  P  |  `  |  p  |
|      1      |       0001        | SOH | DC1 |  !  |       1       |  A  |  Q  |  a  |  q  |
|      2      |       0010        | STX | DC2 |  "  |       2       |  B  |  R  |  b  |  r  |
|      3      |       0011        | ETX | DC3 |  #  |       3       |  C  |  S  |  c  |  s  |
|      4      |       0100        | EOT | DC4 |  $  |       4       |  D  |  T  |  d  |  t  |
|      5      |       0101        | ENQ | NAK |  %  |       5       |  E  |  U  |  e  |  u  |
|      6      |       0110        | ACK | SYN |  &  |       6       |  F  |  V  |  f  |  v  |
|      7      |       0111        | BEL | ETB |  '  |       7       |  G  |  W  |  g  |  w  |
|      8      |       1000        | BS  | CAN |  (  |       8       |  H  |  X  |  h  |  x  |
|      9      |       1001        | HT  | EM  |  )  |       9       |  I  |  Y  |  i  |  y  |
|     10      |       1010        | LF  | SUB |  *  |       :       |  J  |  Z  |  j  |  z  |
|     11      |       1011        | VT  | ESC |  +  |       ;       |  K  |  [  |  k  |  {  |
|     12      |       1100        | FF  | FS  |  ,  |       <       |  L  |  \  |  l  | \|  |
|     13      |       1101        | CR  | GS  |  -  |       =       |  M  |  ]  |  m  |  }  |
|     14      |       1110        | SO  | RS  |  .  |       >       |  N  |  ^  |  n  |  ~  |
|     15      |       1111        | SI  | US  |  /  |       ?       |  O  |  _  |  o  | DEL |

:::

<!-- prettier-ignore -->
::: table Descrição dos caracteres de controle do código ASCII {#tab-ascii-control-characters .full-width}

| Sigla | Descrição                                                        |
| :---: | :--------------------------------------------------------------- |
|  ACK  | Aviso de que o terminal receptor está identificado               |
|  BEL  | Campainha                                                        |
|  BS   | Retorno de carro de uma posição                                  |
|  CAN  | Anulação                                                         |
|  CR   | Retorno de carro total                                           |
|  DC   | Comando para dispositivo auxiliar                                |
|  DEL  | Apagamento, invalidação                                          |
|  EM   | Fim do meio (papel, fita)                                        |
|  ENQ  | Pergunta para saber qual o receptor                              |
|  EOT  | Fim de transmissão                                               |
|  ESC  | Escape                                                           |
|  ETB  | Fim de transmissão do bloco                                      |
|  ETX  | Fim de texto                                                     |
|  FF   | Alimentação de formulário                                        |
|  FS   | Separação de arquivo                                             |
|  GS   | Separação de grupo                                               |
|  HT   | Tabulação horizontal                                             |
|  IS   | Separação de informação                                          |
|  LF   | Mudança de linha                                                 |
|  NAK  | Não reconhecimento do código de receptor enviado pelo transistor |
|  NL   | Nova linha                                                       |
|  NUL  | Nulo                                                             |
|  RS   | Separação de registro                                            |
|  SI   | No código                                                        |
|  SO   | Fora do código                                                   |
|  SOH  | Começo do texto, cabeçalho                                       |
|  SP   | Espaço                                                           |
|  STX  | Começo do texto                                                  |
|  SUB  | Substituição                                                     |
|  SYN  | Sincronização                                                    |
|  TC   | Comando de transmissão                                           |
|  US   | Separador de itens                                               |
|  VT   | Tabulação vertical                                               |

:::

<!-- prettier-ignore -->
::: table Tabela de caracteres ASCII estendido de 8 bits (IBM CP437) {#tab-ascii-extended .full-width}

|             |                   |      |      |      |      |      |      |      | $b_7 b_6 b_5 b_4$ |      |      |      |      |      |      |      |      |
| :---------: | :---------------: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :---------------: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| **Decimal** | $b_3 b_2 b_1 b_0$ | 0000 | 0001 | 0010 | 0011 | 0100 | 0101 | 0110 |       0111        | 1000 | 1001 | 1010 | 1011 | 1100 | 1101 | 1110 | 1111 |
|      0      |       0000        | NUL  | DLE  |  SP  |  0   |  @   |  P   |  `   |         p         |  Ç   |  É   |  á   |  ░   |  └   |  ┴   |  α   |  ≡   |
|      1      |       0001        | SOH  | DC1  |  !   |  1   |  A   |  Q   |  a   |         q         |  ü   |  æ   |  í   |  ▒   |  ┘   |  ┬   |  ß   |  ±   |
|      2      |       0010        | STX  | DC2  |  "   |  2   |  B   |  R   |  b   |         r         |  é   |  Æ   |  ó   |  ▓   |  ┌   |  ├   |  Γ   |  ≥   |
|      3      |       0011        | ETX  | DC3  |  #   |  3   |  C   |  S   |  c   |         s         |  â   |  ô   |  ú   |  │   |  ┐   |  ─   |  π   |  ≤   |
|      4      |       0100        | EOT  | DC4  |  $   |  4   |  D   |  T   |  d   |         t         |  ä   |  ö   |  ñ   |  ┤   |  └   |  ┼   |  Σ   |  ⌠   |
|      5      |       0101        | ENQ  | NAK  |  %   |  5   |  E   |  U   |  e   |         u         |  à   |  ò   |  Ñ   |  ╡   |  ┴   |  ╞   |  σ   |  ⌡   |
|      6      |       0110        | ACK  | SYN  |  &   |  6   |  F   |  V   |  f   |         v         |  å   |  û   |  ª   |  ╢   |  ┬   |  ╟   |  µ   |  ÷   |
|      7      |       0111        | BEL  | ETB  |  '   |  7   |  G   |  W   |  g   |         w         |  ç   |  ù   |  º   |  ╖   |  ├   |  ╚   |  τ   |  ≈   |
|      8      |       1000        |  BS  | CAN  |  (   |  8   |  H   |  X   |  h   |         x         |  ê   |  ÿ   |  ¿   |  ╕   |  ─   |  ╔   |  Φ   |  °   |
|      9      |       1001        |  HT  |  EM  |  )   |  9   |  I   |  Y   |  i   |         y         |  ë   |  Ö   |  ⌐   |  ╣   |  ┼   |  ╩   |  Θ   |  ∙   |
|     10      |       1010        |  LF  | SUB  |  *   |  :   |  J   |  Z   |  j   |         z         |  è   |  Ü   |  ¬   |  ║   |  ╞   |  ╦   |  Ω   |  ·   |
|     11      |       1011        |  VT  | ESC  |  +   |  ;   |  K   |  [   |  k   |         {         |  ï   |  ¢   |  ½   |  ╗   |  ╟   |  ╠   |  δ   |  √   |
|     12      |       1100        |  FF  |  FS  |  ,   |  <   |  L   |  \   |  l   |        \|         |  î   |  £   |  ¼   |  ╝   |  ╚   |  ═   |  ∞   |  ⁿ   |
|     13      |       1101        |  CR  |  GS  |  -   |  =   |  M   |  ]   |  m   |         }         |  ì   |  ¥   |  ¡   |  ╜   |  ╔   |  ╬   |  φ   |  ²   |
|     14      |       1110        |  SO  |  RS  |  .   |  >   |  N   |  ^   |  n   |         ~         |  Ä   |  ₧   |  «   |  ╛   |  ╩   |  ╧   |  ε   |  ■   |
|     15      |       1111        |  SI  |  US  |  /   |  ?   |  O   |  _   |  o   |        DEL        |  Å   |  ƒ   |  »   |  ┐   |  ╦   |  ╨   |  ∩   | NBSP |

:::
