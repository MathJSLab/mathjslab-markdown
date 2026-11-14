# Implementação de funções booleanas com componentes discretos - Integração em pequena escala

Os blocos lógicos “Ou” e “E” podem ser implementados simplesmente,
empregando-se lógica de diodos e resistores. Consideremos que estamos operando
em lógica positiva, e que a correspondência entre valores digitais e níveis de
tensão seja tal que

$$
V(0)=0\,\mathrm{V}\qquad V(1)=+5\,\mathrm{V}.
$$

Nessas condições, o leitor pode verificar facilmente que a tensão de saída do
circuito da Fig. 1-3a é igual, aproximadamente, a 5 V, ou seja, igual a $V(1)$,
somente quando todas entradas estiverem em $V(1)$.

<!-- prettier-ignore -->
::: figure Circuito E com diodos e resistor de polarização {#fig-original-1-3a}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% Barramento vertical e resistor de pull-up
\draw (6,4.5) to[R,l=$R$] (6,6)
    -- (6,6.5)
    node[vcc] {$+V_{CC}>5\,\mathrm{V}$};

% Entradas a, b e n
% Diodos: cátodo à esquerda, ânodo à direita
\draw (1,4.5) node[left] {$a$}
    to[short,o-] (2,4.5)
    to[D,invert] (4,4.5)
    -- (6,4.5);

\draw (1,3.5) node[left] {$b$}
    to[short,o-] (2,3.5)
    to[D,invert] (4,3.5)
    -- (6,3.5);

\draw (1,1.5) node[left] {$n$}
    to[short,o-] (2,1.5)
    to[D,invert] (4,1.5)
    -- (6,1.5);

% Barramento comum
\draw (6,4.5) -- (6,1.5);

% Junções elétricas
\draw (6,4.5) node[circ] {};
\draw (6,3.5) node[circ] {};
\draw (6,1.5) node[circ] {};

% Reticências indicando entradas intermediárias
\node at (3,2.5) {$\vdots$};

% Saída
\draw (6,1.5) -- (8,1.5)
    node[ocirc] {}
    node[right] {$Y$};

\end{circuitikz}
```

:::

<!-- prettier-ignore -->
::: figure Circuito Ou com diodos e resistor de polarização {#fig-original-1-3b}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% Entradas a, b e n
% Diodos: ânodo à esquerda, cátodo à direita
\draw (1,5.5) node[left] {$a$}
    to[short,o-] (2,5.5)
    to[D] (4,5.5)
    -- (6,5.5);

\draw (1,4.5) node[left] {$b$}
    to[short,o-] (2,4.5)
    to[D] (4,4.5)
    -- (6,4.5);

\draw (1,2.5) node[left] {$n$}
    to[short,o-] (2,2.5)
    to[D] (4,2.5)
    -- (6,2.5);

% Reticências indicando entradas intermediárias
\node at (3,3.5) {$\vdots$};

% Barramento comum
\draw (6,5.5) -- (6,2.5);

% Junções elétricas
\draw (6,4.5) node[circ] {};
\draw (6,2.5) node[circ] {};

% Saída
\draw (6,2.5) -- (8,2.5)
    node[ocirc] {}
    node[right] {$Y$};

% Resistor de pull-down e alimentação negativa
\draw (6,2.5) to[R,l=$R$] (6,0.8)
    -- (6,0.3)
    node[vee] {$-V_{CC}$};

\end{circuitikz}
```

:::

Da mesma forma, reportando-nos agora à Fig. 1-3b, podemos notar que a tensão de
saída será aproximadamente igual a $V(1)$ quando uma ou mais quaisquer entradas
estiverem no nível $V(1)$. Na prática não se utiliza mais que dois estágios em
cascata, compostos de circuitos com diodos, devido à rápida degeneração dos
níveis de tensão e dos tempos de transição do sinal.

<!-- prettier-ignore -->
::: figure Circuito NE em lógica positiva implementado com componentes discretos {#fig-original-1-4a}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% Transistor inversor NPN
\node[npn] (T1) at (10,3) {};
\node[anchor=west] at ($(T1)+(0.45,0)$) {$T_1$};

% Resistor de coletor e alimentação
\draw (T1.C) to[R,l=$R_4$,a=$2{,}7\,\mathrm{k}\Omega$]
    ++(0,3) node[vcc] {$+V_{CC}$};

% Saída
\draw (T1.C) -- ++(2,0)
    node[ocirc] {}
    node[right] {$S$};

% Emissor aterrado
\draw (T1.E) -- ++(0,-0.5) node[ground] {};

% Rede de diodos: cátodos voltados para as entradas
\draw (1,5) node[left] {$a$}
    to[short,o-] (2,5)
    to[D,invert] (4,5)
    -- (6,5);

\draw (1,4) node[left] {$b$}
    to[short,o-] (2,4)
    to[D,invert] (4,4)
    -- (6,4);

\draw (1,2) node[left] {$n$}
    to[short,o-] (2,2)
    to[D,invert] (4,2)
    -- (6,2);

% Entradas intermediárias
\node at (3,3) {$\vdots$};

% Barramento dos diodos
\draw (6,5) -- (6,2);

% Polarização positiva
\draw (6,5) to[R,l=$R_1$,a=$18\,\mathrm{k}\Omega$]
    ++(0,2) node[vcc] {$+V_{CC}$};

% Resistor de base
\draw (6,4) to[R,l=$R_2$,a=$10\,\mathrm{k}\Omega$]
    (8.5,4) -- (8.5,3) -- (T1.B);

% Polarização negativa da base
\draw (8.5,3) to[R]
    ++(0,-2.2) node[vee] {$-V_{CC}$};

\node[anchor=east,align=right] at (8.25,1.9)
    {$R_3$\\[2pt]$100\,\mathrm{k}\Omega$};

% Junções elétricas
\draw (6,5) node[circ] {};
\draw (6,4) node[circ] {};
\draw (8.5,3) node[circ] {};
\draw (T1.C) node[circ] {};

\end{circuitikz}
```

:::

<!-- prettier-ignore -->
::: figure Circuito Nou em lógica positiva implementado com componentes discretos {#fig-original-1-4b}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% Transistor inversor NPN
\node[npn] (T1) at (10,3) {};
\node[anchor=west] at ($(T1)+(0.45,0)$) {$T_1$};

% Resistor de coletor
\draw (T1.C) to[R,l=$R_3$,a=$2{,}7\,\mathrm{k}\Omega$]
    ++(0,3) node[vcc] {$+V_{CC}$};

% Saída
\draw (T1.C) -- ++(2,0)
    node[ocirc] {}
    node[right] {$S$};

% Emissor aterrado
\draw (T1.E) -- ++(0,-0.5) node[ground] {};

% Rede de diodos: ânodos voltados para as entradas
\draw (1,5) node[left] {$a$}
    to[short,o-] (2,5)
    to[D] (4,5)
    -- (6,5);

\draw (1,4) node[left] {$b$}
    to[short,o-] (2,4)
    to[D] (4,4)
    -- (6,4);

\draw (1,2) node[left] {$n$}
    to[short,o-] (2,2)
    to[D] (4,2)
    -- (6,2);

% Entradas intermediárias
\node at (3,3) {$\vdots$};

% Barramento comum
\draw (6,5) -- (6,2);

% Resistor de base
\draw (6,4) to[R,l=$R_1$,a=$10\,\mathrm{k}\Omega$]
    (8.5,4) -- (8.5,3) -- (T1.B);

% Polarização negativa
\draw (8.5,3) to[R]
    ++(0,-2.2) node[vee] {$-V_{CC}$};

\node[anchor=east,align=right] at (8.25,1.9)
    {$R_2$\\[2pt]$100\,\mathrm{k}\Omega$};

% Junções elétricas
\draw (6,4) node[circ] {};
\draw (8.5,3) node[circ] {};
\draw (T1.C) node[circ] {};

\end{circuitikz}
```

:::

Associando-se os circuitos descritos anteriormente, com blocos inversores,
construídos com transistores, obtemos blocos “NE” e “Nou” que se encontram
esquematizados na Fig. 1-4. Em tais circuitos o transistor opera como
amplificador, podendo resultar na saída um sinal com tempo de transição mais
rápido que o tempo de transição do sinal aplicado na entrada.

O desenvolvimento das técnicas de circuitos integrados fez com que se tornasse
indiferente a construção de componentes passivos e componentes ativos, já que
todos esses eram construídos em uma única pastilha de silício. O primeiro passo
dado dentro da tecnologia de circuitos integrados na adaptação do circuito
esquematizado na Fig. 1-4a foi a substituição do resistor $R_2$ por diodos
polarizados diretamente, cuja única função é ajustar os níveis de tensão para a
operação correta do transistor $T_1$. Na Fig. 1-5 temos desenvolvido um
circuito onde foram introduzidas essas modificações, estando indicadas as
tensões correspondentes à aplicação na entrada dos valores digitais 1 e 0.

<!-- prettier-ignore -->
::: figure Valores de tensão em um circuito NE — Figura 1-5 {#fig-original-1-5}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% ==================================================
% Coordenadas principais
% ==================================================

% Barramento de entrada: x = 5
% Ponto B: x = 12
% Transistor: x = 15

% ==================================================
% Transistor inversor NPN
% ==================================================

\node[npn] (T1) at (15,2.5) {};

% Identificação à direita do transistor
\node[anchor=west] at ($(T1)+(0.75,0)$)
    {$T_1$};

% Emissor aterrado
\draw (T1.E)
    -- ++(0,-1)
    node[ground] {};

% ==================================================
% Resistor R3 e alimentação positiva
% ==================================================

\draw (T1.C)
    to[R,l=$R_3$] ++(0,3)
    node[vcc] {$+5\,\mathrm{V}$};

% ==================================================
% Saída C = S
% ==================================================

\draw (T1.C)
    -- ++(3.2,0)
    node[ocirc] {}
    node[right] {$C=S$};

% Junção entre R3, coletor de T1 e saída
\draw (T1.C) node[circ] {};

% Tensões possíveis na saída
\node[anchor=south] at (17.1,3.05)
    {$0{,}3\,\mathrm{V}$};

\node[anchor=north] at (17.1,2.65)
    {$5\,\mathrm{V}$};

% ==================================================
% Entradas a, b e n
% Diodos com cátodos voltados para as entradas
% ==================================================

\draw (0.5,4.5)
    node[left] {$a$}
    to[short,o-] (1.5,4.5)
    to[D,invert,l=$D_1$] (3.5,4.5)
    -- (5,4.5);

\draw (0.5,2.5)
    node[left] {$b$}
    to[short,o-] (1.5,2.5)
    to[D,invert,l=$D_2$] (3.5,2.5)
    -- (5,2.5);

\draw (0.5,-1.5)
    node[left] {$n$}
    to[short,o-] (1.5,-1.5)
    to[D,invert,l=$D_n$] (3.5,-1.5)
    -- (5,-1.5);

% Entradas intermediárias
\node at (2.5,0.4) {$\vdots$};

% Barramento comum dos diodos
\draw (5,4.5) -- (5,-1.5);

% Junção entre D1, R1 e o barramento
\draw (5,4.5) node[circ] {};

% ==================================================
% Resistor R1 e alimentação positiva
% ==================================================

\draw (5,4.5)
    to[R,l=$R_1$] (5,6)
    node[vcc] {$+5\,\mathrm{V}$};

% ==================================================
% Ponto A e tensões correspondentes
% ==================================================

\draw (5,2.5) node[circ] {};

\node[anchor=north east] at (4.85,2.35)
    {$A$};

\node[anchor=west] at (5.35,3.75)
    {$1{,}9\,\mathrm{V}$};

\node[anchor=west] at (5.35,3.25)
    {$0{,}9\,\mathrm{V}$};

% ==================================================
% Diodos DA e DB
% Condução da esquerda para a direita
% ==================================================

\draw (5,2.5)
    -- (6,2.5)
    to[D,l_=$D_A$] (8,2.5)
    -- (8.5,2.5)
    to[D,l_=$D_B$] (10.5,2.5)
    -- (12,2.5);

% Queda de tensão nos dois diodos
\draw[<->] (6.5,4) -- (10,4);

\node[above] at (8.25,4)
    {$1{,}2\,\mathrm{V}$};

% ==================================================
% Ponto B
% ==================================================

\draw (12,2.5) node[circ] {};

\node[anchor=south] at (12,2.75)
    {$B$};

% ==================================================
% Resistor R2 e alimentação negativa
% ==================================================

\draw (12,2.5)
    to[R,l=$R_2$] (12,-0.5)
    node[vee] {$-5\,\mathrm{V}$};

% ==================================================
% Ligação à base do transistor
% ==================================================

\draw (12,2.5) -- (T1.B);

% Tensões características na base
\node[anchor=south] at (13.4,2.9)
    {$0{,}7\,\mathrm{V}$};

\node[anchor=north] at (13.4,2.15)
    {$-0{,}3\,\mathrm{V}$};

\end{circuitikz}
```

:::

Para o valor digital 1, fixamos $V(1)=5\,\mathrm{V}$ e para o valor digital 0,
fixamos $V(0)=0{,}3\,\mathrm{V}$, valor de tensão, esse, correspondente à
tensão de saturação de um transistor de junção. Vamos admitir que a queda de
tensão através dos diodos seja $0{,}6\,\mathrm{V}$. Caso todas entradas estejam
no valor digital 1, correspondente a $+5\,\mathrm{V}$, os diodos
$D_1,D_2,\ldots,D_n$ estarão cortados. O resistor $R_1$, nesse caso, é
projetado de tal forma que impõe a saturação do transistor $T_1$, de forma que
a tensão $V_{be}$ de $T_1$ é igual a $0{,}7\,\mathrm{V}$, enquanto que a tensão
no ponto A é $1{,}9\,\mathrm{V}$ e, finalmente, a tensão do coletor de $T_1$ é
aproximadamente $0{,}3\,\mathrm{V}$. O leitor deve observar que uma grande
vantagem do circuito esquematizado na Fig. 1-5 é que os valores de tensões nos
pontos A, B e C são praticamente independentes do valor dos resistores $R_1$,
$R_2$ e $R_3$.

Quando uma das entradas passar ao valor digital 0, ou seja, quando passar a
$0{,}3\,\mathrm{V}$, no ponto A teremos imposta a tensão de $0{,}9\,\mathrm{V}$
e, no ponto B, uma tensão de $0{,}3\,\mathrm{V}$, o que é suficiente para
cortar o transistor e fazer com que a tensão no ponto C tenda a
$+5\,\mathrm{V}$.

Retornando novamente à técnica de circuitos integrados, habitualmente os diodos
são obtidos a partir de determinadas interconexões do transistor, sendo a mais
utilizada a interconexão base-coletor, como mostra o esquema da Fig. 1-6.

<!-- prettier-ignore -->
::: figure Interconexão entre base e coletor de um transistor de junção para operação como diodo {#fig-original-1-6}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% Transistor NPN:
% emissor à esquerda, coletor à direita,
% base voltada para baixo
\node[npn,rotate=-90,xscale=-1] (T1) at (5,3) {};

% Identificação
\node[above] at (5,3.65) {$T_1$};

% Emissor: terminal esquerdo, sem conexão com a base
\draw (T1.E) -- ++(-1.5,0)
    node[ocirc] {};

% Coletor: terminal direito
\draw (T1.C) -- ++(1.5,0)
    coordinate (J)
    -- ++(1,0)
    node[ocirc] {};

% Interligação exclusiva entre base e coletor
\draw (T1.B)
    -- ++(0,-1.2)
    -| (J);

% Junção elétrica entre base e coletor
\node[circ] at (J) {};

\end{circuitikz}
```

:::

Vamos nos reportar agora à Fig. 1-7. Se colocado sem simplificações o circuito
da Fig. 1-7 poderia ser distribuído de forma mostrada na Fig. 1-7a. Todavia são
possíveis simplificações. Os coletores dos transistores correspondentes aos
diodos $D_1$, $D_2$, $D_3$ (estamos admitindo três entradas) estão conectados
no mesmo ponto, o mesmo acontecendo com as respectivas bases, de forma que
esses elementos podem ser reduzidos a um único, como mostra a Fig. 1-7c e d. Da
mesma forma que na ilha $n$, onde está o resistor $R_1$, as ilhas onde estão os
resistores $R_2$ e $R_3$ podem ser conectadas em $+V_{cc}$.

Finalmente o coletor do transistor correspondente a $D_A$ está conectado no
mesmo ponto que os coletores dos transistores correspondentes a $D_1$, $D_2$ e
$D_3$, podendo formar com isso uma única ilha $n$.

Esquematicamente representa-se os circuitos semelhantes aos mostrados na Fig.
1-7c, de acordo com os diagramas delineados na Fig. 1-8.

<!-- prettier-ignore -->
::: figure Esquema de um circuito de lógica de diodos e transistores (LTD) integrado — Figura 1-8 {#fig-original-1-8}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% --------------------------------------------------
% Transistores
% --------------------------------------------------

% Transistores conectados como diodos
\node[npn,rotate=90,xscale=-1] (DA) at (6.2,4) {};
\node[npn,rotate=90,xscale=-1] (DB) at (8.6,4) {};

% Q1: coletor alinhado horizontalmente ao de DA
\node[bjtnpn,emitters=3,rotate=-90,anchor=C]
    (Q1) at (3.8,4 |- DA.C) {};

% Transistor de saída
\node[npn] (T1) at (11.8,4) {};

% --------------------------------------------------
% Identificação dos transistores e do ponto A
% --------------------------------------------------

% Linha de base comum aos quatro rótulos
\def\labelY{3.5}

\node[anchor=base] at (3.4,\labelY) {$Q_1$};
\node[anchor=base] at (DA.C |- 0,\labelY) {$A$};
\node[anchor=base] at (6.2,\labelY) {$D_A$};
\node[anchor=base] at (8.6,\labelY) {$D_B$};

\node[right] at (T1) {$T_1$};

% --------------------------------------------------
% Entradas independentes de Q1
% --------------------------------------------------

% Entradas alinhadas verticalmente
% Espaçamento uniforme de 0.6 unidade
% A entrada a fica alinhada ao emissor E3

\coordinate (INa) at (1,4 |- Q1.E3);
\coordinate (INb) at ($(INa)+(0,-0.6)$);
\coordinate (INc) at ($(INa)+(0,-1.2)$);

% Entrada a: ligação horizontal direta
\draw (INa)
    node[ocirc] {}
    node[left] {$a$}
    -- (Q1.E3);

% Entrada b: ligação ortogonal
\draw (Q1.E2)
    -- (Q1.E2 |- INb)
    -- (INb)
    node[ocirc] {}
    node[left] {$b$};

% Entrada c: ligação ortogonal
\draw (Q1.E1)
    -- (Q1.E1 |- INc)
    -- (INc)
    node[ocirc] {}
    node[left] {$c$};

% --------------------------------------------------
% Polarização de Q1
% --------------------------------------------------

\draw (Q1.B)
    to[R,l=$R_1$] ++(0,2)
    node[vcc] {$+V_{CC}$};

% --------------------------------------------------
% Ligação horizontal direta Q1 -> DA
% --------------------------------------------------

\draw (Q1.C) -- (DA.C);

% Ponto A: junção elétrica
\node[circ] at (DA.C) {};

% --------------------------------------------------
% DA: conexão base-coletor pela parte superior
% --------------------------------------------------

\draw (DA.B)
    -- ++(0,1.0)
    -| (DA.C);

% Ligação horizontal ao estágio DB
\draw (DA.E) -- (DB.C);

% --------------------------------------------------
% DB: conexão base-coletor pela parte superior
% --------------------------------------------------

\draw (DB.B)
    -- ++(0,1.0)
    -| (DB.C);

\node[circ] at (DB.C) {};

% --------------------------------------------------
% Estágio de saída
% --------------------------------------------------

% Ligação de DB à base de T1
\draw (DB.E) -- (T1.B);

% Resistor R2 ligado ao nó da base de T1
\coordinate (JB) at ($(DB.E)!0.55!(T1.B)$);

\draw (JB)
    to[R,l=$R_2$] ++(0,-2.5)
    node[vee] {$-V_{CC}$};

\node[circ] at (JB) {};

% Emissor aterrado
\draw (T1.E)
    -- ++(0,-0.6)
    node[ground] {};

% Resistor de coletor
\draw (T1.C)
    to[R,l=$R_3$] ++(0,2.5)
    node[vcc] {$+V_{CC}$};

% Saída S
\draw (T1.C)
    -- ++(1.5,0)
    node[ocirc] {}
    node[right] {$S$};

\end{circuitikz}
```

:::

Uma posterior inovação nos circuitos LTD foi a ideia de permitir a saturação do
transistor de emissores múltiplos, presente na entrada, cuja função, como
vimos, é substituir os diodos $D_1$, $D_2$ e $D_3$. A saturação do transistor
de entrada baixa o valor da tensão do ponto A a tal ponto, que torna
dispensáveis os diodos $D_A$ e $D_B$ e o resistor $R_2$. O tipo de circuito
lógico Integrado em Pequena Escala, IPE, que resulta disso é o LTT (em inglês
TTL).

Na Fig. 1-9, temos esquematizado um circuito LTT simples. Com relação ao
circuito da Fig. 1-8, foram eliminados os diodos $D_A$ e $D_B$ e o resistor
$R_2$, tendo sido, porém, acrescentados outros transistores cuja função é
baixar a impedância de saída.

Para analisarmos os níveis de tensão do circuito esquematizado na Fig. 1-9,
vamos admitir que a tensão $V_{ce}$ de saturação nos transistores $T_2$ e $T_5$
seja no máximo igual a $0{,}3\,\mathrm{V}$, e que a tensão $V_{ce}$ de
saturação do transistor $T_1$ seja $0{,}1\,\mathrm{V}$, em virtude desse
transistor não possuir resistor de carga. Vamos admitir também que a queda de
tensão direta nos diodos e a tensão $V_{be}$, correspondente aos transistores
na região ativa, sejam de $0{,}6\,\mathrm{V}$. Finalmente, a tensão $V_{be}$ de
transistores, na saturação, será considerada igual a $0{,}7\,\mathrm{V}$.

<!-- prettier-ignore -->
::: figure Circuito LTT derivado da lógica de transistores e diodos — Figura 1-9 {#fig-original-1-9}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

\begin{scope}[xshift=2cm]

% --------------------------------------------------
% Transistores
% --------------------------------------------------

\node[bjtnpn,emitters=3,rotate=-90,anchor=C]
    (T1) at (3.5,4.0) {};

\node[npn] (T2) at (6.5,4.0) {};
\node[npn] (T3) at (9.5,5.7) {};
\node[npn] (T4) at (13.0,4.6) {};
\node[npn] (T5) at (13.0,1.6) {};

% Identificação
\node[below right,yshift=-7pt] at (T1) {$T_1$};
\node[right] at (T2) {$T_2$};
\node[right] at (T3) {$T_3$};
\node[right] at (T4) {$T_4$};
\node[right] at (T5) {$T_5$};

% --------------------------------------------------
% Barramento positivo de alimentação
% --------------------------------------------------

\coordinate (VCC1) at (3.5,8.2);
\coordinate (VCC2) at (6.5,8.2);
\coordinate (VCC3) at (9.5,8.2);
\coordinate (VCC4) at (13.0,8.2);

\draw (VCC1) -- (VCC4);

\draw (VCC4)
    -- ++(0,0.55)
    node[vcc] {$+V_{CC}=5\,\mathrm{V}$};

\node[circ] at (VCC2) {};
\node[circ] at (VCC3) {};
\node[circ] at (VCC4) {};

% --------------------------------------------------
% Entradas a, b e c
% --------------------------------------------------

\coordinate (INa) at (-1.0,4.0 |- T1.E3);
\coordinate (INb) at ($(INa)+(0,-0.6)$);
\coordinate (INc) at ($(INa)+(0,-1.2)$);

% Entrada a
\draw (INa)
    node[ocirc] {}
    node[left] {$a$}
    -- (T1.E3);

% Entrada b
\draw (T1.E2)
    -- (T1.E2 |- INb)
    -- (INb)
    node[ocirc] {}
    node[left] {$b$};

% Entrada c
\draw (T1.E1)
    -- (T1.E1 |- INc)
    -- (INc)
    node[ocirc] {}
    node[left] {$c$};

% Tensões nas entradas: mesma coordenada horizontal
\coordinate (VINa) at (0.35,4.0 |- INa);
\coordinate (VINb) at (0.35,4.0 |- INb);
\coordinate (VINc) at (0.35,4.0 |- INc);

\node[above,font=\scriptsize,inner sep=1pt]
    at (VINa) {$5\,\mathrm{V};\ 0{,}3\,\mathrm{V}$};

\node[above,font=\scriptsize,inner sep=1pt]
    at (VINb) {$5\,\mathrm{V};\ 0{,}3\,\mathrm{V}$};

\node[above,font=\scriptsize,inner sep=1pt]
    at (VINc) {$5\,\mathrm{V};\ 0{,}3\,\mathrm{V}$};

% --------------------------------------------------
% R1: polarização da base de T1
% --------------------------------------------------

\coordinate (R1top) at (T1.B |- VCC1);

\draw (T1.B)
    to[R,l=$R_1$] (R1top);

\draw (R1top) -- (VCC1);

% --------------------------------------------------
% Ponto A e suas tensões
% --------------------------------------------------

% Rótulo A à esquerda do condutor
\coordinate (Aref) at ($(T1.B)+(0,0.65)$);

\node[left] at (Aref) {$A$};

% Tensões empilhadas com espaçamento uniforme.
% O centro do conjunto fica na altura do rótulo A.
\node[
    right,
    font=\scriptsize,
    align=center,
    inner sep=1pt
] at ($(Aref)+(0.25,0)$)
    {$\begin{array}{c}
        2{,}0\,\mathrm{V}\\[2pt]
        1{,}0\,\mathrm{V}
    \end{array}$};

% --------------------------------------------------
% Ponto B: coletor de T1 à base de T2
% --------------------------------------------------

\draw (T1.C) -- (T2.B);

\coordinate (B) at ($(T1.C)!0.78!(T2.B)$);

\node[above] at (B) {$B$};

\node[below,font=\scriptsize,yshift=-3pt]
    at (B)
    {$\begin{array}{c}
        1{,}4\,\mathrm{V}\\
        0{,}4\,\mathrm{V}
    \end{array}$};

% --------------------------------------------------
% R2 e ponto D
% --------------------------------------------------

\coordinate (D) at (6.5,5.7);

\draw (D)
    to[R,l=$R_2$] (D |- VCC2);

\draw (T2.C) |- (D);

\node[circ] at (D) {};

% Rótulo D alinhado verticalmente com as tensões
\coordinate (Dlabel) at ($(D)+(0.45,0.03)$);

\node[anchor=south] at (Dlabel) {$D$};

\node[
    anchor=north,
    font=\scriptsize,
    align=center
] at ($(Dlabel)+(0,-0.13)$)
    {$\begin{array}{c}
        1{,}0\,\mathrm{V}\\
        4{,}6\,\mathrm{V}
    \end{array}$};

% --------------------------------------------------
% T3
% --------------------------------------------------

\draw (D) -- (T3.B);

\draw (T3.C) -- (T3.C |- VCC3);

% --------------------------------------------------
% Ponto C e resistor R3
% --------------------------------------------------

\coordinate (C) at (6.5,2.5);

\draw (T2.E) -- (C);

\node[circ] at (C) {};
\node[above left] at (C) {$C$};

\draw (C)
    to[R,l=$R_3$] ++(0,-2.0)
    node[ground] {};

% --------------------------------------------------
% Ponto E: emissor de T3 e base de T4
% --------------------------------------------------

\coordinate (E) at (9.5,4.6);

\draw (T3.E) -- (E);
\draw (E) -- (T4.B);

\node[circ] at (E) {};

% Rótulo E alinhado verticalmente com as tensões
\coordinate (Elabel) at ($(E)+(0.45,0.03)$);

\node[anchor=south] at (Elabel) {$E$};

\node[
    anchor=north,
    font=\scriptsize,
    align=center
] at ($(Elabel)+(0,-0.13)$)
    {$\begin{array}{c}
        0{,}4\,\mathrm{V}\\
        4{,}2\,\mathrm{V}
    \end{array}$};

% R4
\draw (E)
    -- ++(0,-2.1)
    to[R,l=$R_4$] ++(0,-2.0)
    node[ground] {};

% --------------------------------------------------
% Ponto C conectado à base de T5
% --------------------------------------------------

\coordinate (C5) at (11.2,2.5);

% Cruzamento sem conexão com R4
\draw (C)
    -- ($(E |- C)+(-0.18,0)$);

\draw
    ($(E |- C)+(-0.18,0)$)
    arc[start angle=180,end angle=0,radius=0.18];

\draw
    ($(E |- C)+(0.18,0)$)
    -- (C5)
    |- (T5.B);

% Tensão na base de T5
\node[below left,font=\scriptsize,xshift=-2pt]
    at (T5.B) {$0{,}7\,\mathrm{V}$};

% --------------------------------------------------
% R5: coletor de T4 ao barramento positivo
% --------------------------------------------------

\draw (T4.C)
    to[R,l=$R_5$] (T4.C |- VCC4);

% --------------------------------------------------
% Estágio de saída T4 e T5
% --------------------------------------------------

\coordinate (F) at (13.0,3.0);

\draw (T4.E) -- (F);
\draw (T5.C) -- (F);

\node[circ] at (F) {};

% Rótulo F alinhado verticalmente com as tensões
\coordinate (Flabel) at ($(F)+(0.45,0.03)$);

\node[anchor=south] at (Flabel) {$F$};

\node[
    anchor=north,
    font=\scriptsize,
    align=center
] at ($(Flabel)+(0,-0.13)$)
    {$\begin{array}{c}
        0{,}3\,\mathrm{V}\\
        3{,}6\,\mathrm{V}
    \end{array}$};

% Emissor de T5 aterrado
\draw (T5.E)
    -- (T5.E |- 6.5,0.5)
    node[ground] {};

% Saída S
\draw (F)
    -- ++(2.5,0)
    node[ocirc] {}
    node[right] {$S$};

\end{scope}

\end{circuitikz}
```

:::

Admitindo no circuito esquematizado na Fig. 1-9 que todas entradas estejam no
nível lógico 1 (qualquer tensão maior que $+2\,\mathrm{V}$) a tensão no ponto C
é de $+0{,}7\,\mathrm{V}$ em virtude de o transistor $T_5$ estar saturado e a
tensão no ponto B será igual a $1{,}4\,\mathrm{V}$ em virtude de $T_2$ também
estar saturado. O transistor $T_1$ está operando na região reversa, portanto,
com a junção base-coletor polarizada diretamente, no que resulta a tensão no
ponto A igual a $2{,}0\,\mathrm{V}$ (o que justifica nossa imposição prévia de
que $V(1)\geq 2{,}0$). Por $T_2$ estar saturado, a tensão no ponto D é de cerca
de $1{,}0\,\mathrm{V}$ e, pelo fato do transistor $T_3$ estar na região ativa,
a tensão no ponto E é de cerca de $0{,}4\,\mathrm{V}$, o que garante o corte do
transistor $T_4$.

Consideremos agora que uma entrada qualquer esteja no valor digital zero,
correspondente à tensão de $0{,}3\,\mathrm{V}$. Estando o transistor $T_1$
saturado, a tensão no ponto A será de $1{,}0\,\mathrm{V}$ e a tensão no ponto B
cerca de $0{,}4\,\mathrm{V}$.

Esse valor de tensão garante o corte dos transistores $T_2$ e $T_5$. O
transistor $T_2$, estando cortado, faz com que a tensão no ponto D seja
aproximadamente igual a $+V_{cc}$, pois temos apenas a queda de tensão em
$R_2$, devida à corrente de base do transistor $T_3$.

Admitindo a tensão $+V_{cc}=5\,\mathrm{V}$ e a queda de tensão através de
$R_2$, devida à corrente de base de $T_3$ cerca de $0{,}2\,\mathrm{V}$, a
tensão no ponto D é igual a $4{,}8\,\mathrm{V}$. Estando o transistor $T_3$ na
região ativa, a tensão no ponto E é de $4{,}2\,\mathrm{V}$ aproximadamente.
Finalmente, tendo em conta também que o transistor $T_4$ se encontra na região
ativa, a tensão de saída é de $3{,}6\,\mathrm{V}$. O leitor deve observar que
esse valor é suficientemente maior que os $2{,}0\,\mathrm{V}$ previamente
estabelecidos, de forma que é possível encadear grande número de circuitos
semelhantes em cascata, sem termos problemas mais sérios com a propagação de
sinais espúrios e ruídos.

A partir de 1967, até hoje (1976), os circuitos LTT (TTL) integrados em pequena
escala dominaram de forma quase absoluta o mercado de circuitos digitais.
Existem hoje circuitos LTT associados com diodos Schottky, que apresentam tempo
de transição de ordem de $0{,}007\,\mu\mathrm{s}$. Todavia, apesar de todo esse
domínio, estamos atualmente assistindo o ocaso de dominância dos circuitos LTT,
que estão sendo rapidamente substituídos por circuitos MOS complementares. De
fato, a enorme vantagem apresentada pelos circuitos MOS Complementares — quer
sob o ponto de vista de consumo de potência das fontes, quer sob o ponto de
vista de maior margem de ruído — parece condenar a lógica LTT irremediavelmente
ao obsoletismo. Provavelmente, dentro de poucos anos, os circuitos LTT serão
apenas utilizados em aplicações onde se requer grande velocidade de operação e
grande excursão de sinais. Outra família de circuitos integrados IPE
constituídos por transistores de junção que encontra aplicação prática
relativamente extensa é a Lógica por Acoplamento de Emissor, LAE (em inglês
ECL).

Nos circuitos integrados LAE, procura-se fazer a excursão lógica dos sinais
$[V(1)-V(0)]$ o menor possível, evitando-se a saturação dos transistores e
considerando-se a comutação entre esses dispositivos predominantemente de
corrente ao invés de tensão.

Admitamos inicialmente que as entradas $a$, $b$ e $c$ no valor digital 0, ou
seja, em $V(0)$, de forma que os transistores $T_1$, $T_2$ e $T_3$ estão
cortados. Nessas condições, coincide praticamente com a tensão $+V_{cc}$ se
dispensarmos o efeito da corrente de base do transistor $T_5$. A tensão no
ponto $S_1$ é, então, aproximadamente igual a $+V_{cc}-0{,}6$ ou seja $\cong
4{,}4\,\mathrm{V}$. Vamos fixar $V(1)=4{,}4\,\mathrm{V}$. Aplicando essa tensão
em uma das entradas, digamos “a”, o transistor $T_1$ deve começar a conduzir,
não entrando todavia em saturação, de modo que vamos fixar a tensão, no ponto
B, também em $4{,}4\,\mathrm{V}$, o que resulta numa tensão de saída, em $S_1$,
de $3{,}8\,\mathrm{V}$, tensão essa correspondente ao valor digital zero.
Determinados esses dois níveis, para a operação correta do circuito, é
interessante que a base do transistor $T_4$ seja voltada para uma tensão
$V_{bb}=4{,}1\,\mathrm{V}$.

Admitindo novamente a tensão $V(0)=3{,}8\,\mathrm{V}$ nas entradas $a$, $b$,
$c$, a tensão no ponto A comum aos emissores é de $3{,}5\,\mathrm{V}$, de forma
que a tensão $V_{be}$ de $T_1$, $T_2$ e $T_3$ é igual a $0{,}3\,\mathrm{V}$,
insuficiente para que esses transistores conduzam. O transistor $T_4$, uma vez
conduzindo, faz com que a tensão no ponto C seja $4{,}4\,\mathrm{V}$ e a tensão
na saída $S_2$, igual a $3{,}8\,\mathrm{V}$, correspondente ao valor digital
zero. O leitor deve observar que os transistores $T_5$ e $T_6$ encontram-se
sempre na região ativa, de forma que sua tensão $V_{be}$ foi considerada, em
qualquer caso, igual a $0{,}6\,\mathrm{V}$.

Quando uma das entradas $a$, $b$ ou $c$ passa ao valor digital 1, ou seja,
passa a $4{,}4\,\mathrm{V}$, o correspondente transistor passa à região ativa
impondo a tensão de $3{,}8\,\mathrm{V}$, no ponto A.

Essa imposição de tensão leva o transistor $T_4$ ao corte, fazendo com que a
tensão do ponto C se aproxime de $+V_{cc}$ e, assim, a tensão de saída em $S_2$
passe ao valor digital 1.

O circuito da Fig. 1-10 apresenta uma inconveniência. A ilha $n$ correspondente
ao ponto B coletor comum dos transistores de entrada é muito grande, bem maior
que a ilha $n$ correspondente ao ponto C, coletor do transistor $T_4$. Esse
fato, além de introduzir no regime transitório assimetrias no circuito, limita
a máxima velocidade de operação do circuito.

<!-- prettier-ignore -->
::: figure Circuito integrado lógico utilizando lógica por acoplamento de emissor — Figura 1-10 {#fig-original-1-10}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

\usetikzlibrary{circuits.logic.US}

% --------------------------------------------------
% Transistores NPN
% --------------------------------------------------

% Transistores de entrada
\node[npn] (T1) at (3.0,4.0) {};
\node[npn] (T2) at (5.5,4.0) {};
\node[npn] (T3) at (8.0,4.0) {};

% Transistor de referência espelhado
\node[npn,xscale=-1] (T4) at (9.6,4.0) {};

% Seguidores de emissor
\node[npn] (T5) at (12.8,4.7) {};
\node[npn] (T6) at (15.8,5.8) {};

% --------------------------------------------------
% Identificação dos transistores
% --------------------------------------------------

\node[below left,xshift=-2pt,yshift=9pt]
    at (T1.E) {$T_1$};

\node[below left,xshift=-2pt,yshift=9pt]
    at (T2.E) {$T_2$};

\node[below left,xshift=-2pt,yshift=9pt]
    at (T3.E) {$T_3$};

% Demais rótulos
\node[left] at (T4) {$T_4$};
\node[right] at (T5) {$T_5$};
\node[right] at (T6) {$T_6$};

% --------------------------------------------------
% Barramento positivo de alimentação
% --------------------------------------------------

\coordinate (VCC2) at (5.5,8.0);
\coordinate (VCC4) at (9.6,8.0);
\coordinate (VCC5) at (12.8,8.0);
\coordinate (VCC6) at (15.8,8.0);

\draw (VCC2) -- (VCC6);

\draw (VCC6)
    -- ++(0,0.6)
    node[vcc] {$+V_{CC}=5\,\mathrm{V}$};

% Junções no barramento
\node[circ] at (VCC4) {};
\node[circ] at (VCC5) {};
\node[circ] at (VCC6) {};

% --------------------------------------------------
% Entradas a, b e c
% --------------------------------------------------

\draw (T1.B)
    -- ++(-1.0,0)
    node[ocirc] {}
    node[left] {$a$};

\draw (T2.B)
    -- ++(-1.0,0)
    node[ocirc] {}
    node[left] {$b$};

\draw (T3.B)
    -- ++(-1.0,0)
    node[ocirc] {}
    node[left] {$c$};

% --------------------------------------------------
% Barramento comum dos coletores T1, T2 e T3
% --------------------------------------------------

\coordinate (B1) at (T1.C |- 3.0,5.8);
\coordinate (B2) at (T2.C |- B1);
\coordinate (B3) at (T3.C |- B1);

\draw (T1.C) -- (B1);
\draw (T2.C) -- (B2);
\draw (T3.C) -- (B3);

\draw (B1) -- (B3);

% Ponto B
\coordinate (B) at (5.5,5.8);

\node[circ] at (B) {};
\node[below right] at (B) {$B$};

% --------------------------------------------------
% R2: alimentação do barramento B
% --------------------------------------------------

\draw (B)
    to[R,l=$R_2$] (B |- VCC2);

% --------------------------------------------------
% Barramento comum dos emissores
% --------------------------------------------------

\coordinate (A1) at (T1.E |- 3.0,2.6);
\coordinate (A2) at (T2.E |- A1);
\coordinate (A3) at (T3.E |- A1);
\coordinate (A4) at (T4.E |- A1);

\draw (T1.E) -- (A1);
\draw (T2.E) -- (A2);
\draw (T3.E) -- (A3);
\draw (T4.E) -- (A4);

\draw (A1) -- (A4);

% --------------------------------------------------
% Ponto A: alinhado verticalmente ao coletor de T2
% --------------------------------------------------

\coordinate (A) at (T2.C |- A1);

\node[circ] at (A) {};
\node[above right] at (A) {$A$};

% Junção do emissor de T3
\node[circ] at (A3) {};

% --------------------------------------------------
% R3: resistor comum dos emissores
% --------------------------------------------------

\draw (A)
    to[R,l=$R_3$] ++(0,-2.0)
    node[ground] {};

% --------------------------------------------------
% Base de T4: tensão de referência Vbb
% --------------------------------------------------

\coordinate (VBB) at ($(T4.B)+(1.0,0)$);

\draw (T4.B)
    -- (VBB)
    node[ocirc] {};

\node[
    below,
    xshift=-5pt,
    yshift=-5pt
] at (VBB) {$V_{bb}=4{,}1\,\mathrm{V}$};

% --------------------------------------------------
% R4 e ponto C
% --------------------------------------------------

\coordinate (C) at (9.6,5.8);

\draw (T4.C) -- (C);

\draw (C)
    to[R,l=$R_4$] (C |- VCC4);

\node[circ] at (C) {};
\node[below right] at (C) {$C$};

% --------------------------------------------------
% Base de T5: conexão ao coletor de T3
% --------------------------------------------------

\coordinate (X) at (C |- T5.B);
\coordinate (B5) at (T3.C |- T5.B);

\def\bridgeRadius{0.18}

% Trecho à direita do cruzamento
\draw (T5.B)
    -- ($(X)+(\bridgeRadius,0)$);

% Semicírculo indicando cruzamento sem conexão
\draw
    ($(X)+(\bridgeRadius,0)$)
    arc[
        start angle=0,
        end angle=180,
        radius=\bridgeRadius
    ];

% Trecho à esquerda do cruzamento
\draw
    ($(X)+(-\bridgeRadius,0)$)
    -- (B5);

% Junção no coletor de T3
\node[circ] at (B5) {};

% --------------------------------------------------
% Ponto C conectado à base de T6
% Cruzamento sem conexão com o coletor de T5
% --------------------------------------------------

\def\jumpRadius{0.18}

\coordinate (CrossT5) at (T5.C |- C);

\draw (C)
    -- ($(CrossT5)+(-\jumpRadius,0)$);

\draw
    ($(CrossT5)+(-\jumpRadius,0)$)
    arc[
        start angle=180,
        end angle=0,
        radius=\jumpRadius
    ];

\draw
    ($(CrossT5)+(\jumpRadius,0)$)
    -- (T6.B);

% --------------------------------------------------
% Coletores de T5 e T6
% --------------------------------------------------

\draw (T5.C) -- (T5.C |- VCC5);
\draw (T6.C) -- (T6.C |- VCC6);

% --------------------------------------------------
% Saída S1: emissor de T5
% --------------------------------------------------

\coordinate (S1) at (12.8,3.0);

\draw (T5.E) -- (S1);

\draw (S1)
    -- ++(1.2,0)
    node[ocirc] {}
    node[right] {$S_1$};

\node[circ] at (S1) {};

% Resistor R1
\draw (S1)
    to[R,l=$R_1$] ++(0,-2.4)
    node[ground] {};

% --------------------------------------------------
% Saída S2: emissor de T6
% --------------------------------------------------

\coordinate (S2) at (15.8,3.0);

\draw (T6.E) -- (S2);

\draw (S2)
    -- ++(1.2,0)
    node[ocirc] {}
    node[right] {$S_2$};

\node[circ] at (S2) {};

% Resistor R5
\draw (S2)
    to[R,l=$R_5$] ++(0,-2.4)
    node[ground] {};

% ==================================================
% REPRESENTAÇÕES LÓGICAS
% ==================================================

% Coordenada horizontal comum aos terminais
% de entrada das portas NOR e OR.
\def\logicInputX{18.7}

% --------------------------------------------------
% Porta NOR de três entradas — saída S1
% --------------------------------------------------

\node[
    nor gate US,
    draw,
    logic gate inputs=nnn,
    minimum width=1.5cm
] (NOR) at (20.0,5.0) {};

% Entradas a, b e c
\foreach \i/\nome in {1/a,2/b,3/c} {
    \draw (NOR.input \i)
        -- (\logicInputX,0 |- NOR.input \i)
        node[ocirc] {}
        node[left] {$\nome$};
}

% Saída S1
\draw (NOR.output)
    -- ++(0.85,0)
    node[ocirc] {}
    node[right] {$S_1$};

% --------------------------------------------------
% Porta OR de três entradas — saída S2
% --------------------------------------------------

\node[
    or gate US,
    draw,
    logic gate inputs=nnn,
    minimum width=1.5cm
] (OR) at (20.0,2.7) {};

% Entradas a, b e c
\foreach \i/\nome in {1/a,2/b,3/c} {
    \draw (OR.input \i)
        -- (\logicInputX,0 |- OR.input \i)
        node[ocirc] {}
        node[left] {$\nome$};
}

% Saída S2
\draw (OR.output)
    -- ++(0.85,0)
    node[ocirc] {}
    node[right] {$S_2$};

\end{circuitikz}
```

:::

Por isso, algumas vezes, emprega-se Lógica de Seguidores de Emissor, ao invés
de LAE. Um circuito LSE está esquematizado na Fig. 1-11.

Os circuitos LAE são empregados onde se exige velocidade de operação
ultraelevada, sendo muito sensíveis ao nível de ruído elétrico ambiente.

Os circuitos lógicos a MOS complementar representam, sem dúvida alguma, o mais
promissor desenvolvimento dentro da tecnologia de circuitos integrados. Para
entender a operação desses circuitos vamos, inicialmente, considerar a operação
de um circuito inversor, como o esquematizado na Fig. 1-12.

<!-- prettier-ignore -->
::: figure Lógica de seguidores de emissor — Figura 1-11 {#fig-original-1-11}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% --------------------------------------------------
% Transistores NPN
% --------------------------------------------------

% Transistores de entrada
\node[npn] (T1) at (3.0,4.0) {};
\node[npn] (T2) at (5.5,4.0) {};
\node[npn] (T3) at (8.0,4.0) {};

% Transistor de referência espelhado horizontalmente
\node[npn,xscale=-1] (T4) at (10.5,4.0) {};

% Seguidor de emissor deslocado para cima
\node[npn] (T5) at (14.0,5.3) {};

% --------------------------------------------------
% Identificação dos transistores
% --------------------------------------------------

\node[below left,xshift=-2pt,yshift=9pt]
    at (T1.E) {$T_1$};

\node[below left,xshift=-2pt,yshift=9pt]
    at (T2.E) {$T_2$};

\node[below left,xshift=-2pt,yshift=9pt]
    at (T3.E) {$T_3$};

\node[left] at (T4) {$T_4$};
\node[right] at (T5) {$T_5$};

% --------------------------------------------------
% Barramento positivo de alimentação
% --------------------------------------------------

\coordinate (VCC1) at (3.0,7.0);
\coordinate (VCC2) at (5.5,7.0);
\coordinate (VCC3) at (8.0,7.0);
\coordinate (VCC4) at (10.5,7.0);
\coordinate (VCC5) at (14.0,7.0);

\draw (VCC1) -- (VCC5);

\draw (VCC5)
    -- ++(0,0.6)
    node[vcc] {$+V_{CC}$};

% Junções no barramento
\node[circ] at (VCC2) {};
\node[circ] at (VCC3) {};
\node[circ] at (VCC4) {};
\node[circ] at (VCC5) {};

% --------------------------------------------------
% Entradas a, b e c
% --------------------------------------------------

\draw (T1.B)
    -- ++(-0.9,0)
    node[ocirc] {}
    node[left] {$a$};

\draw (T2.B)
    -- ++(-0.9,0)
    node[ocirc] {}
    node[left] {$b$};

\draw (T3.B)
    -- ++(-0.9,0)
    node[ocirc] {}
    node[left] {$c$};

% --------------------------------------------------
% Coletores dos transistores de entrada
% --------------------------------------------------

\draw (T1.C) -- (T1.C |- VCC1);
\draw (T2.C) -- (T2.C |- VCC2);
\draw (T3.C) -- (T3.C |- VCC3);

% --------------------------------------------------
% Barramento comum dos emissores
% --------------------------------------------------

\coordinate (A1) at (T1.E |- 3.0,2.5);
\coordinate (A2) at (T2.E |- A1);
\coordinate (A3) at (T3.E |- A1);
\coordinate (A4) at (T4.E |- A1);

\draw (T1.E) -- (A1);
\draw (T2.E) -- (A2);
\draw (T3.E) -- (A3);
\draw (T4.E) -- (A4);

\draw (A1) -- (A4);

% Junções dos emissores
\node[circ] at (A2) {};
\node[circ] at (A3) {};

% --------------------------------------------------
% R1: resistor comum dos emissores
% --------------------------------------------------

\draw (A2)
    to[R,l=$R_1$] ++(0,-2.0)
    node[ground] {};

% --------------------------------------------------
% Base de T4: tensão de referência Vbb
% Terminal e rótulo à direita
% --------------------------------------------------

\draw (T4.B)
    -- ++(1.0,0)
    node[ocirc] {}
    node[right] {$V_{bb}$};

% --------------------------------------------------
% Coletor de T4 e resistor R3
% --------------------------------------------------

\coordinate (C4) at (T4.C |- 10.5,5.3);

\draw (T4.C) -- (C4);

\draw (C4)
    to[R,l=$R_3$] (C4 |- VCC4);

\node[circ] at (C4) {};

% --------------------------------------------------
% Base de T5 conectada ao coletor de T4
% Conexão horizontal
% --------------------------------------------------

\draw (C4) -- (T5.B);

% --------------------------------------------------
% Coletor de T5 conectado ao barramento VCC
% --------------------------------------------------

\draw (T5.C) -- (T5.C |- VCC5);

% --------------------------------------------------
% Saída S: emissor de T5
% --------------------------------------------------

\coordinate (S) at (14.0,2.5);

\draw (T5.E) -- (S);

\draw (S)
    -- ++(1.5,0)
    node[ocirc] {}
    node[right] {$S$};

\node[circ] at (S) {};

% --------------------------------------------------
% R2: resistor de carga do seguidor de emissor
% --------------------------------------------------

\draw (S)
    to[R,l=$R_2$] ++(0,-2.0)
    node[ground] {};

\end{circuitikz}
```

:::

<!-- prettier-ignore -->
::: figure Circuito inversor MOS complementar — Figura 1-12a {#fig-original-1-12a}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    european resistors,
    line width=0.7pt
]

% --------------------------------------------------
% Transistores MOS complementares
% --------------------------------------------------

% T2: transistor PMOS superior
\node[pmos] (T2) at (5.0,5.5) {};

% T1: transistor NMOS inferior
\node[nmos] (T1) at (5.0,2.5) {};

% --------------------------------------------------
% Identificação dos transistores
% --------------------------------------------------

\node[right] at (T2) {$T_2$};
\node[right] at (T1) {$T_1$};

% --------------------------------------------------
% Alimentação positiva
% --------------------------------------------------

\draw (T2.S)
    -- ++(0,1.0)
    node[vcc] {$+V_{CC}$};

% --------------------------------------------------
% Aterramento
% --------------------------------------------------

\draw (T1.S)
    -- ++(0,-1.0)
    node[ground] {};

% --------------------------------------------------
% Entrada E: portas interligadas
% --------------------------------------------------

\coordinate (GIN) at (2.5,4.0);

\draw (T2.G)
    -- (3.5,5.5)
    -- (3.5,4.0);

\draw (T1.G)
    -- (3.5,2.5)
    -- (3.5,4.0);

\draw (GIN)
    node[ocirc] {}
    node[left] {$E$}
    -- (3.5,4.0);

\node[circ] at (3.5,4.0) {};

% --------------------------------------------------
% Drenos interligados: saída S
% --------------------------------------------------

\coordinate (OUT) at (5.0,4.0);

\draw (T2.D) -- (OUT);
\draw (T1.D) -- (OUT);

\draw (OUT)
    -- ++(1.8,0)
    node[ocirc] {}
    node[right] {$S$};

\node[circ] at (OUT) {};

\end{circuitikz}
```

:::

<!-- prettier-ignore -->
::: figure Curvas características justapostas dos transistores MOS complementares — Figura 1-12b {#fig-original-1-12b}

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Reconstrução qualitativa das características justapostas de transistores MOS complementares, com famílias de curvas, escalas opostas e trajetória de operação.",
  "width": 900,
  "height": 500,
  "padding": {
    "left": 85,
    "right": 95,
    "top": 65,
    "bottom": 80
  },
  "background": "white",
  "config": {
    "view": {
      "stroke": null
    },
    "axis": {
      "grid": false,
      "domain": false,
      "ticks": false,
      "labels": false,
      "title": null
    }
  },
  "encoding": {
    "x": {
      "field": "x",
      "type": "quantitative",
      "scale": {
        "domain": [-1.65, 12],
        "nice": false,
        "zero": false
      },
      "axis": null
    },
    "y": {
      "field": "y",
      "type": "quantitative",
      "scale": {
        "domain": [-2.2, 11.7],
        "nice": false,
        "zero": false
      },
      "axis": null
    }
  },
  "layer": [
    {
      "data": {
        "values": [
          {"x": 0, "y": -0.8, "x2": 0, "y2": 10.2},
          {"x": 10, "y": -0.8, "x2": 10, "y2": 10.2},
          {"x": -1.1, "y": 0, "x2": 11.15, "y2": 0}
        ]
      },
      "mark": {
        "type": "rule",
        "color": "black",
        "strokeWidth": 2.2
      },
      "encoding": {
        "x2": {"field": "x2"},
        "y2": {"field": "y2"}
      }
    },
    {
      "data": {
        "values": [
          {"x": 0, "y": 10.2, "angle": 0},
          {"x": 10, "y": 10.2, "angle": 0},
          {"x": -1.1, "y": 0, "angle": 270},
          {"x": 11.15, "y": 0, "angle": 90}
        ]
      },
      "mark": {
        "type": "point",
        "shape": "triangle",
        "filled": true,
        "size": 240,
        "fill": "#000000",
        "stroke": "#000000",
        "strokeWidth": 0,
        "opacity": 1,
        "fillOpacity": 1
      },
      "encoding": {
        "angle": {
          "field": "angle",
          "type": "quantitative",
          "scale": null
        }
      }
    },

    {
      "data": {
        "sequence": {
          "start": 0,
          "stop": 8.151,
          "step": 0.005,
          "as": "x"
        }
      },
      "transform": [
        {
          "calculate": "4.05*(1-exp(-pow(datum.x/0.7514166,0.95)))",
          "as": "base"
        },
        {
          "calculate": "0.38",
          "as": "xb"
        },
        {
          "calculate": "4.05*(1-exp(-pow(datum.xb/0.7514166,0.95)))",
          "as": "yb"
        },
        {
          "calculate": "4.05*(1-exp(-pow(datum.x/0.74,0.95)))",
          "as": "orig3"
        },
        {
          "calculate": "6.4*(1-exp(-pow(datum.x/1.27,1.07)))",
          "as": "orig6"
        },
        {
          "calculate": "8.75*(1-exp(-pow(datum.x/1.35,1.4)))",
          "as": "orig9"
        },
        {
          "calculate": "4.05*(1-exp(-pow(datum.xb/0.74,0.95)))",
          "as": "orig3b"
        },
        {
          "calculate": "6.4*(1-exp(-pow(datum.xb/1.27,1.07)))",
          "as": "orig6b"
        },
        {
          "calculate": "8.75*(1-exp(-pow(datum.xb/1.35,1.4)))",
          "as": "orig9b"
        },
        {
          "calculate": "datum.x <= datum.xb ? datum.base : datum.yb + (4.05-datum.yb)*(datum.orig3-datum.orig3b)/(4.05-datum.orig3b)",
          "as": "c0"
        },
        {
          "calculate": "datum.x <= datum.xb ? datum.base : datum.yb + (6.4-datum.yb)*(datum.orig6-datum.orig6b)/(6.4-datum.orig6b)",
          "as": "c1"
        },
        {
          "calculate": "datum.x <= datum.xb ? datum.base : datum.yb + (8.75-datum.yb)*(datum.orig9-datum.orig9b)/(8.75-datum.orig9b)",
          "as": "c2"
        },
        {
          "fold": ["c0", "c1", "c2"],
          "as": ["serie", "y"]
        }
      ],
      "mark": {
        "type": "line",
        "color": "black",
        "strokeWidth": 2.3,
        "interpolate": "linear"
      },
      "encoding": {
        "detail": {
          "field": "serie",
          "type": "nominal"
        },
        "order": {
          "field": "x",
          "type": "quantitative"
        }
      }
    },

    {
      "data": {
        "sequence": {
          "start": -0.5,
          "stop": 10.001,
          "step": 0.025,
          "as": "x"
        }
      },
      "transform": [
        {
          "calculate": "(datum.x+0.5)/10.5",
          "as": "u"
        },
        {
          "calculate": "1.65*(1-0.018*datum.u)*(1-pow(datum.u,8))",
          "as": "c0"
        },
        {
          "calculate": "4.65*(1-0.018*datum.u)*(1-pow(datum.u,8))",
          "as": "c1"
        },
        {
          "calculate": "6.9*(1-0.018*datum.u)*(1-pow(datum.u,10))",
          "as": "c2"
        },
        {
          "calculate": "9.2*(1-0.018*datum.u)*(1-pow(datum.u,12))",
          "as": "c3"
        },
        {
          "fold": ["c0", "c1", "c2", "c3"],
          "as": ["serie", "y"]
        }
      ],
      "mark": {
        "type": "line",
        "color": "black",
        "strokeWidth": 2.3,
        "interpolate": "linear"
      },
      "encoding": {
        "detail": {
          "field": "serie",
          "type": "nominal"
        },
        "order": {
          "field": "x",
          "type": "quantitative"
        }
      }
    },

    {
      "data": {
        "sequence": {
          "start": 0.1,
          "stop": 9.651,
          "step": 0.025,
          "as": "x"
        }
      },
      "transform": [
        {
          "calculate": "0.85*(1-exp(-(datum.x-0.1)/1.35))",
          "as": "c0"
        },
        {
          "fold": ["c0"],
          "as": ["serie", "y"]
        }
      ],
      "mark": {
        "type": "line",
        "color": "black",
        "strokeWidth": 2.3,
        "interpolate": "linear"
      },
      "encoding": {
        "detail": {
          "field": "serie",
          "type": "nominal"
        },
        "order": {
          "field": "x",
          "type": "quantitative"
        }
      }
    },

    {
      "data": {
        "sequence": {
          "start": 0,
          "stop": 1.0001,
          "step": 0.001,
          "as": "t"
        }
      },
      "transform": [
        {
          "calculate": "datum.t",
          "as": "u"
        },
        {
          "calculate": "1-datum.u",
          "as": "v"
        },
        {
          "calculate": "6.75*pow(datum.v,3)+3*6.75*pow(datum.v,2)*datum.u+3*7.70*datum.v*pow(datum.u,2)+9.0718678*pow(datum.u,3)",
          "as": "x"
        },
        {
          "calculate": "9.50*pow(datum.v,3)+3*6.20*pow(datum.v,2)*datum.u+3*1.55*datum.v*pow(datum.u,2)+0.8488955*pow(datum.u,3)",
          "as": "y"
        }
      ],
      "mark": {
        "type": "line",
        "interpolate": "linear",
        "strokeDash": [10, 7],
        "strokeWidth": 2.2,
        "color": "black"
      },
      "encoding": {
        "x": {
          "field": "x",
          "type": "quantitative"
        },
        "y": {
          "field": "y",
          "type": "quantitative"
        },
        "order": {
          "field": "t",
          "type": "quantitative"
        }
      }
    },

    {
      "data": {
        "values": [
          {"x": 0.38, "y": 1.65},
          {"x": 9.0718678, "y": 0.8488955}
        ]
      },
      "mark": {
        "type": "point",
        "filled": true,
        "size": 65,
        "color": "black",
        "opacity": 1
      }
    },

    {
      "data": {
        "values": [
          {"x": 0.50, "y": 1.10, "label": "B"},
          {"x": 9.25, "y": 1.30, "label": "A"}
        ]
      },
      "mark": {
        "type": "text",
        "fontSize": 22,
        "fontWeight": "bold",
        "color": "black"
      },
      "encoding": {
        "text": {"field": "label"}
      }
    },

    {
      "data": {
        "values": [
          {"x": -0.59, "y": 1.65, "label": "0"},
          {"x": -0.59, "y": 4.65, "label": "−4"},
          {"x": -0.59, "y": 6.9, "label": "−8"},
          {"x": -0.59, "y": 9.2, "label": "−12"}
        ]
      },
      "mark": {
        "type": "text",
        "fontSize": 19,
        "align": "right",
        "baseline": "middle",
        "color": "black"
      },
      "encoding": {
        "text": {"field": "label"}
      }
    },

    {
      "data": {
        "values": [
          {"x": 8.4, "y": 0.48, "label": "0"},
          {"x": 8.37, "y": 4.5, "label": "4"},
          {"x": 8.37, "y": 6.77, "label": "8"},
          {"x": 8.37, "y": 8.75, "label": "12"}
        ]
      },
      "mark": {
        "type": "text",
        "fontSize": 19,
        "align": "left",
        "baseline": "middle",
        "color": "black"
      },
      "encoding": {
        "text": {"field": "label"}
      }
    },

    {
      "data": {
        "values": [
          {"x": 0.55, "y": 10.25, "label": "Iᴅ₂"},
          {"x": 10.5, "y": 10.25, "label": "Iᴅ₁"},
          {"x": -1.15, "y": -0.65, "label": "Vᴅꜰ₂"},
          {"x": 11.15, "y": -0.65, "label": "Vᴅꜰ₁"}
        ]
      },
      "mark": {
        "type": "text",
        "fontSize": 21,
        "color": "black"
      },
      "encoding": {
        "text": {"field": "label"}
      }
    }
  ],
  "resolve": {
    "scale": {
      "x": "shared",
      "y": "shared"
    }
  }
}
```

:::

Vamos admitir que, na entrada do circuito esquematizado na Fig. 1-12a, tenhamos
aplicado $V(0)$ aproximadamente igual a $0\,\mathrm{V}$. A tensão porta-fonte
do transistor $T_1$ é igual a zero, enquanto que a tensão porta-fonte do
transistor $T_2$ é igual a $-V_{cc}$. (Habitualmente procura-se fazer
$V_{cc}=+5\,\mathrm{V}$.) O circuito inversor estará, nessas condições,
operando com o transistor $T_1$ cortado e o transistor $T_2$ operando na região
do triodo, de forma que a tensão de saída é igual a praticamente
$+5\,\mathrm{V}$.

Admitamos agora que tenhamos aplicado à entrada E uma tensão de
$+5\,\mathrm{V}$. A tensão porta-fonte do transistor $T_2$ é igual a
$0\,\mathrm{V}$. O transistor $T_1$ vai estar conduzindo na região de triodo,
enquanto que o transistor $T_2$ estará cortado. A tensão de saída, nessas
condições, é praticamente igual a 0, pois os transistores estarão operando no
ponto B das curvas características Fig. 1-12b.

Já existem, no mercado consumidor, grande número de circuitos MOS
complementares, com funções lógicas equivalentes às dos circuitos LTT, com a
vantagem, como já dissemos, de termos a potência consumida muitíssimo menor (em
regime permanente, cerca de $10^5$ vezes menor). Nas Figs. 1-13 e 1-14, temos
esquematizados blocos “NE” e blocos “Nou” fabricados dentro dessa tecnologia.

<!-- prettier-ignore -->
::: figure Bloco Nou de três entradas — Figura 1-13 {#fig-original-1-13}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    line width=0.7pt
]

% ==================================================
% Transistores PMOS — associação em série
% ==================================================

\node[pmos] (P2) at (8.0,8.0) {};
\node[pmos] (P4) at (8.0,6.2) {};
\node[pmos] (P6) at (8.0,4.4) {};

\node[right] at (P2) {$T_2$};
\node[right] at (P4) {$T_4$};
\node[right] at (P6) {$T_6$};

% Alimentação
\draw (P2.S)
    -- ++(0,0.6)
    node[vcc] {$+V_{CC}$};

% Associação em série
\draw (P2.D) -- (P4.S);
\draw (P4.D) -- (P6.S);

% ==================================================
% Transistores NMOS — associação em paralelo
% ==================================================

\node[nmos] (N1) at (4.0,2.0) {};
\node[nmos] (N3) at (6.0,2.0) {};
\node[nmos] (N5) at (8.0,2.0) {};

\node[right] at (N1) {$T_5$};
\node[right] at (N3) {$T_3$};
\node[right] at (N5) {$T_1$};

% ==================================================
% Barramento superior dos NMOS e saída S
% ==================================================

\coordinate (OUT) at (8.0,3.2);

\draw (P6.D) -- (OUT);

\draw (N1.D) -- (N1.D |- OUT);
\draw (N3.D) -- (N3.D |- OUT);
\draw (N5.D) -- (OUT);

\draw (N1.D |- OUT) -- (OUT);

% Junções elétricas efetivas
% Sem ponto na extremidade esquerda do barramento
\node[circ] at (N3.D |- OUT) {};
\node[circ] at (OUT) {};

% Saída
\draw (OUT)
    -- ++(2.0,0)
    node[ocirc] {}
    node[right] {$S$};

% ==================================================
% Barramento inferior dos NMOS
% ==================================================

\coordinate (GND) at (6.0,0.7);

\draw (N1.S) -- (N1.S |- GND);
\draw (N3.S) -- (GND);
\draw (N5.S) -- (N5.S |- GND);

\draw (N1.S |- GND) -- (N5.S |- GND);

\node[circ] at (GND) {};

\draw (GND)
    -- ++(0,-0.5)
    node[ground] {};

% ==================================================
% Entrada a — transistores T2 e T5
% ==================================================

\coordinate (A) at (1.0,8.0);

\draw (A)
    node[ocirc] {}
    node[left] {$a$}
    -- (P2.G);

% Derivação vertical para T5
% Pontes sobre as entradas b e c e sobre
% o barramento superior dos NMOS

\draw (6.7,8.0)
    -- (6.7,6.35)
    to[crossing] (6.7,6.05)
    -- (6.7,4.55)
    to[crossing] (6.7,4.25)
    -- (6.7,3.35)
    to[crossing] (6.7,3.05)
    -- (6.7,2.0)
    -- (N5.G);

\node[circ] at (6.7,8.0) {};

% ==================================================
% Entrada b — transistores T4 e T3
% ==================================================

\coordinate (B) at (1.0,6.2);

\draw (B)
    node[ocirc] {}
    node[left] {$b$}
    -- (P4.G);

% Derivação vertical para T3
% Pontes sobre a entrada c e o barramento
% superior dos NMOS

\draw (5.0,6.2)
    -- (5.0,4.55)
    to[crossing] (5.0,4.25)
    -- (5.0,3.35)
    to[crossing] (5.0,3.05)
    -- (5.0,2.0)
    -- (N3.G);

\node[circ] at (5.0,6.2) {};

% ==================================================
% Entrada c — transistores T6 e T1
% ==================================================

\coordinate (C) at (1.0,4.4);

\draw (C)
    node[ocirc] {}
    node[left] {$c$}
    -- (P6.G);

% Derivação direta para T1
\draw (3.0,4.4)
    -- (3.0,2.0)
    -- (N1.G);

\node[circ] at (3.0,4.4) {};

\end{circuitikz}
```

:::

<!-- prettier-ignore -->
::: figure Bloco NE de três entradas — adaptação da Figura 1-14 {#fig-original-1-14}

```circuitikz
\begin{circuitikz}[
    scale=1.5,
    transform shape,
    line width=0.7pt
]

% ==================================================
% Transistores PMOS — associação em paralelo
% ==================================================

\node[pmos] (P2) at (3.0,7.0) {};
\node[pmos] (P4) at (5.5,7.0) {};
\node[pmos] (P6) at (8.0,7.0) {};

% Numeração após inversão das entradas a e c
\node[right] at (P2) {$T_6$};
\node[right] at (P4) {$T_4$};
\node[right] at (P6) {$T_2$};

% Barramento de alimentação
\coordinate (VCC) at (5.5,8.3);

\draw (P2.S) -- (P2.S |- VCC);
\draw (P4.S) -- (VCC);
\draw (P6.S) -- (P6.S |- VCC);

\draw (P2.S |- VCC) -- (P6.S |- VCC);

\node[circ] at (VCC) {};

\draw (VCC)
    -- ++(0,0.5)
    node[vcc] {$+V_{CC}$};

% ==================================================
% Barramento de saída dos PMOS
% ==================================================

\coordinate (OUT) at (8.0,5.6);

\draw (P2.D) -- (P2.D |- OUT);
\draw (P4.D) -- (P4.D |- OUT);
\draw (P6.D) -- (OUT);

% Ponte 1: barramento de saída sobre a
% derivação vertical da entrada b (x=4.2)
\draw (P2.D |- OUT)
    -- (4.05,5.6)
    to[crossing] (4.35,5.6)
    -- (5.5,5.6);

% Ponte 2: barramento de saída sobre a
% derivação vertical da entrada a (x=6.7)
\draw (5.5,5.6)
    -- (6.55,5.6)
    to[crossing] (6.85,5.6)
    -- (OUT);

\node[circ] at (P4.D |- OUT) {};
\node[circ] at (OUT) {};

% Terminal de saída
\draw (OUT)
    -- ++(2.0,0)
    node[ocirc] {}
    node[right] {$S$};

% ==================================================
% Transistores NMOS — associação em série
% ==================================================

\node[nmos] (N5) at (8.0,4.1) {};
\node[nmos] (N3) at (8.0,2.6) {};
\node[nmos] (N1) at (8.0,1.1) {};

% Numeração após inversão das entradas a e c
\node[right] at (N5) {$T_1$};
\node[right] at (N3) {$T_3$};
\node[right] at (N1) {$T_5$};

% Associação em série
\draw (OUT) -- (N5.D);
\draw (N5.S) -- (N3.D);
\draw (N3.S) -- (N1.D);

% Aterramento
\draw (N1.S)
    -- ++(0,-0.5)
    node[ground] {};

% ==================================================
% Entrada c — transistores T5 e T6
% Posição inferior
% ==================================================

\coordinate (C) at (0.5,1.1);

\draw (C)
    node[ocirc] {}
    node[left] {$c$}
    -- (N1.G);

% Derivação para o PMOS da esquerda
\draw (1.7,1.1)
    -- (1.7,7.0)
    -- (P2.G);

\node[circ] at (1.7,1.1) {};

% ==================================================
% Entrada b — transistores T3 e T4
% Posição intermediária
% ==================================================

\coordinate (B) at (0.5,2.6);

% Ponte 3: entrada b sobre a derivação
% vertical da entrada c (x=1.7)
\draw (B)
    node[ocirc] {}
    node[left] {$b$}
    -- (1.55,2.6)
    to[crossing] (1.85,2.6)
    -- (N3.G);

% Derivação para o PMOS central
\draw (4.2,2.6)
    -- (4.2,7.0)
    -- (P4.G);

\node[circ] at (4.2,2.6) {};

% ==================================================
% Entrada a — transistores T1 e T2
% Posição superior
% ==================================================

\coordinate (A) at (0.5,4.1);

% Ponte 4: entrada a sobre a derivação
% vertical da entrada c (x=1.7)
\draw (A)
    node[ocirc] {}
    node[left] {$a$}
    -- (1.55,4.1)
    to[crossing] (1.85,4.1)
    -- (4.05,4.1);

% Ponte 5: entrada a sobre a derivação
% vertical da entrada b (x=4.2)
\draw (4.05,4.1)
    to[crossing] (4.35,4.1)
    -- (N5.G);

% Derivação para o PMOS da direita
\draw (6.7,4.1)
    -- (6.7,7.0)
    -- (P6.G);

\node[circ] at (6.7,4.1) {};

\end{circuitikz}
```

:::
