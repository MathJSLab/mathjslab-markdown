# 13. Dispositivos semicondutores e chaveamento digital {#chapter-13}

Nos capítulos anteriores, portas lógicas, registradores e máquinas de estados
foram estudados como estruturas funcionais. A implementação física desses
blocos, entretanto, depende de componentes que respondem a tensões e correntes
reais. Neste capítulo, investigamos os **dispositivos semicondutores**
utilizados para construir chaves eletrônicas, com ênfase nos transistores
bipolares de junção (BJT) e nos transistores de efeito de campo de óxido
metálico (MOSFET).

O objetivo não é substituir um curso de Física dos Semicondutores, mas
estabelecer a ligação necessária entre a lógica binária e o comportamento
elétrico. Uma variável lógica ideal assume os valores 0 e 1; um terminal físico
apresenta tensão, corrente, capacitância, dissipação e atraso. Essa distinção
orienta a análise de todos os circuitos deste capítulo.

## 13.1. Fundamentos de semicondutores aplicados à lógica digital {#sec-semiconductor-fundamentals}

Materiais semicondutores, como o silício, apresentam condutividade elétrica que
pode ser modificada pela temperatura, pela iluminação, por campos elétricos e
pela introdução controlada de impurezas. Em termos de bandas de energia, existe
uma **banda de valência**, uma **banda de condução** e uma região de energias
proibidas entre elas. No silício, a largura da banda proibida é de
aproximadamente $1{,}12\,\mathrm{eV}$ à temperatura ambiente; esse valor varia
com a temperatura.

A dopagem com impurezas doadoras produz material do **tipo n**, no qual os
elétrons são os portadores majoritários. A dopagem com impurezas aceitadoras
produz material do **tipo p**, no qual as lacunas são os portadores
majoritários. Em ambos os casos existem portadores minoritários. O equilíbrio
entre geração, recombinação e transporte de portadores determina as
propriedades elétricas do dispositivo.

A junção entre regiões p e n origina uma região de depleção e uma barreira de
potencial. A aplicação de tensão externa modifica essa barreira e,
consequentemente, a corrente que atravessa a junção.

<!-- prettier-ignore -->
::: table Conceitos físicos relevantes para o chaveamento {#tbl-semiconductor-concepts .full-width}

| Conceito                | Significado                               | Relevância para circuitos digitais             |
| ----------------------- | ----------------------------------------- | ---------------------------------------------- |
| Dopagem                 | Introdução controlada de impurezas        | Formação de regiões p e n                      |
| Junção p–n              | Interface entre materiais dopados         | Retificação e controle de corrente             |
| Portadores minoritários | Elétrons ou lacunas em menor concentração | Armazenamento de carga em BJTs                 |
| Campo elétrico          | Força sobre portadores de carga           | Controle de canal em MOSFETs                   |
| Capacitância parasita   | Armazenamento involuntário de carga       | Atrasos e consumo dinâmico                     |
| Temperatura de junção   | Temperatura interna do dispositivo        | Limites de corrente, potência e confiabilidade |

:::

A tensão que representa um nível lógico não é determinada diretamente pelo
valor da banda proibida. Ela resulta da arquitetura do circuito e das
especificações de alimentação e de entrada/saída. As margens de ruído e a
compatibilidade entre famílias lógicas serão examinadas no Capítulo 14.

## 13.2. Diodos e transistores como chaves {#sec-semiconductor-switches}

Uma **chave eletrônica** alterna entre condições de baixa e alta condução. O
modelo ideal considera resistência nula no estado fechado e infinita no estado
aberto. Dispositivos reais possuem queda de tensão, correntes de fuga,
capacitâncias e tempos de comutação finitos.

O diodo é um dispositivo de dois terminais que, em condições usuais, conduz
mais facilmente quando polarizado diretamente do que quando polarizado
inversamente. Uma aproximação frequente para sua característica corrente–tensão
é a equação de Shockley:

$$
I_D=I_S\left(e^{V_D/(nV_T)}-1\right),\qquad V_T=\frac{kT}{q}. \tag{13.1}
$$

Nessa expressão, $I_S$ é a corrente de saturação do modelo, $n$ é o fator de
idealidade, $k$ é a constante de Boltzmann, $T$ é a temperatura absoluta e $q$
é o módulo da carga elementar. A equação descreve a junção em condições
apropriadas, mas não incorpora, por si só, todos os efeitos de resistência
série, ruptura e alta injeção.

Transistores permitem que um sinal de controle altere a corrente entre outros
terminais. Essa propriedade é essencial à implementação de inversores e portas
lógicas, porque a saída de um estágio deve ser controlada por uma ou mais
entradas.

<!-- prettier-ignore -->
::: table Comparação funcional de dispositivos usados como chaves {#tbl-semiconductor-switch-types .full-width}

| Dispositivo | Terminais principais        | Mecanismo de controle                | Limitação importante                         |
| ----------- | --------------------------- | ------------------------------------ | -------------------------------------------- |
| Diodo       | Ânodo e cátodo              | Polarização da junção                | Não oferece entrada de controle independente |
| BJT         | Base, coletor e emissor     | Injeção de portadores pela base      | Corrente de base e carga armazenada          |
| MOSFET      | Porta, dreno, fonte e corpo | Campo elétrico controlado pela porta | Carga de porta e capacitâncias parasitas     |

:::

Um circuito de chaveamento deve ser analisado considerando a **carga**
conectada à saída. A mesma chave pode funcionar adequadamente com uma carga
resistiva pequena e apresentar transições lentas ao acionar uma capacitância
elevada.

## 13.3. Transistores bipolares de junção {#sec-semiconductor-bjt}

O transistor bipolar de junção (BJT) é formado por três regiões semicondutoras,
constituindo dispositivos NPN ou PNP. Na configuração NPN, uma corrente de base
pode controlar uma corrente de coletor maior. Em operação ativa direta,
utiliza-se frequentemente a aproximação:

$$
I_C\approx\beta I_B, \tag{13.2}
$$

em que $\beta$ representa o ganho de corrente em condições específicas. Essa
relação **não deve ser aplicada indiscriminadamente à saturação**, na qual a
corrente de coletor passa a depender principalmente da alimentação e da carga.

Em um chaveamento NPN de baixa tensão com resistor de coletor $R_C$,
alimentação $V_{CC}$ e emissor aterrado, uma estimativa da corrente de coletor
em saturação é:

$$
I_{C,\mathrm{sat}}\approx\frac{V_{CC}-V_{CE,\mathrm{sat}}}{R_C}. \tag{13.3}
$$

Para assegurar saturação com margem, é comum projetar uma razão forçada
$\beta_{\mathrm{forçado}}=I_C/I_B$ inferior ao ganho mínimo esperado na região
ativa, respeitando as condições da folha de dados. Não existe um valor
universal de corrente de base adequado a todos os BJTs.

<!-- prettier-ignore -->
::: figure Chave inversora com transistor bipolar NPN {#fig-semiconductor-bjt-switch}

```tikz
\begin{circuitikz}[scale=1.5,transform shape]
% Transistor bipolar NPN
\node[npn] (Q1) at (4,2.5) {};
\node[right] at (Q1) {$Q_1$};

% Resistor de coletor e alimentação
\draw (Q1.C) to[R,l=$R_C$] (4,5.5) node[vcc] {$V_{CC}$};

% Saída no coletor, com rótulo afastado do terminal
\draw (Q1.C) -- (6.5,3.3);
\draw (6.5,3.3) node[ocirc] {};
\node[right] at (6.8,3.3) {$V_{out}$};

% Resistor de base e entrada
\draw (Q1.B) to[R,l_=$R_B$] (0.5,2.5);
\draw (0.5,2.5) node[ocirc] {};
\node[left] at (0.1,2.5) {$V_{in}$};

% Emissor aterrado
\draw (Q1.E) -- (4,0.8) node[ground] {};
\end{circuitikz}
```

:::

A {@ref fig-semiconductor-bjt-switch} apresenta uma chave inversora com
transistor bipolar NPN na configuração de emissor comum. O resistor $R_B$
limita a corrente de base, enquanto $R_C$ conecta o coletor à alimentação
$V_{CC}$. Quando a entrada $V_{in}$ fornece corrente de base suficiente para
levar o transistor à saturação, a tensão de saída $V_{out}$ aproxima-se de
$V_{CE,\mathrm{sat}}$. Quando a entrada mantém o transistor em corte, a saída
tende a $V_{CC}$, desde que a carga conectada não altere significativamente
esse nível.

<!-- prettier-ignore -->
::: example Dimensionamento aproximado de uma chave BJT {#ex-semiconductor-bjt-current}

Considere $V_{CC}=5\,\mathrm{V}$, $R_C=1\,\mathrm{k\Omega}$ e
$V_{CE,\mathrm{sat}}=0{,}2\,\mathrm{V}$ como hipótese de projeto. Pela equação
(13.3), $I_{C,\mathrm{sat}}\approx4{,}8\,\mathrm{mA}$. Se for adotado
$\beta_{\mathrm{forçado}}=10$, a corrente de base desejada é de aproximadamente
$0{,}48\,\mathrm{mA}$. Para uma entrada de $5\,\mathrm{V}$ e uma hipótese de
$V_{BE}=0{,}8\,\mathrm{V}$, obtém-se
$R_B\approx(5-0{,}8)/0{,}48\,\mathrm{mA}=8{,}75\,\mathrm{k\Omega}$. A escolha
comercial deve ser validada pela folha de dados, pela capacidade da fonte de
controle e pela dissipação.

:::

## 13.4. Transistores MOSFET {#sec-semiconductor-mosfet}

O MOSFET utiliza um campo elétrico associado à tensão entre porta e fonte para
controlar a condução entre dreno e fonte. Em MOSFETs de enriquecimento, o canal
condutor é formado quando a tensão de porta ultrapassa uma condição de limiar.
Existem dispositivos de canal n (NMOS) e de canal p (PMOS).

O terminal de porta é isolado do canal por um dielétrico, de modo que a
corrente contínua ideal de porta é nula. Entretanto, **a porta possui
capacitância**: durante as transições, é necessário fornecer ou retirar carga.
Assim, uma corrente média pequena não implica ausência de demanda transitória
de corrente.

Em um modelo elementar de NMOS de canal longo, desprezando modulação de
comprimento de canal, as regiões de operação podem ser aproximadas por:

$$
I_D\approx
\begin{cases}
0, & V_{GS}\le V_{TH},\\
k_n\!\left[(V_{GS}-V_{TH})V_{DS}-\dfrac{V_{DS}^{2}}{2}\right],
& 0\le V_{DS}<V_{GS}-V_{TH},\\
\dfrac{k_n}{2}(V_{GS}-V_{TH})^2,
& V_{DS}\ge V_{GS}-V_{TH}.
\end{cases} \tag{13.4}
$$

Aqui, $k_n=\mu_n C_{ox}(W/L)$ é um parâmetro simplificado, $V_{TH}$ é a tensão
de limiar e as tensões são referidas à fonte. O modelo não descreve
adequadamente todos os transistores modernos, especialmente os de canal curto,
e não deve ser empregado para estimar com precisão a resistência de condução de
um MOSFET de potência.

É importante distinguir duas utilizações da palavra **saturação**: em um BJT,
saturação costuma designar o estado de baixa tensão coletor–emissor da chave
ligada; em um MOSFET, a região denominada saturação no modelo de canal longo
ocorre para $V_{DS}\ge V_{GS}-V_{TH}$, enquanto uma chave MOSFET ligada com
baixa queda de tensão normalmente opera na região ôhmica (ou triodo).

<!-- prettier-ignore -->
::: table Comparação de características de BJTs e MOSFETs {#tbl-semiconductor-bjt-mosfet .full-width}

| Aspecto                        | BJT                                      | MOSFET                                                     |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| Grandeza de controle principal | Corrente de base / tensão base–emissor   | Tensão porta–fonte                                         |
| Condução                       | Portadores majoritários e minoritários   | Predominantemente portadores majoritários                  |
| Entrada de controle            | Requer corrente em regime ativo          | Requer principalmente carga e descarga capacitivas         |
| Chave ligada                   | Queda $V_{CE,\mathrm{sat}}$ em saturação | Queda aproximadamente $I_D R_{DS(on)}$ na região ôhmica    |
| Comutação                      | Pode envolver carga armazenada           | Fortemente influenciada por capacitâncias e carga de porta |

:::

A tensão de limiar $V_{TH}$ **não** é a tensão que garante baixa resistência de
condução. Para escolher um MOSFET acionado por uma tensão específica, é
necessário consultar a especificação de $R_{DS(on)}$ nessa tensão de porta, nas
condições relevantes de corrente e temperatura.

## 13.5. Regiões de operação e chaveamento {#sec-semiconductor-operating-regions}

O projeto de uma chave procura estabelecer dois estados estáveis bem definidos
e atravessar rapidamente a região de transição. Para um BJT NPN, costuma-se
distinguir corte, região ativa direta e saturação. Para um NMOS de
enriquecimento, distinguem-se corte, região ôhmica e saturação de canal,
conforme o modelo utilizado.

<!-- prettier-ignore -->
::: table Regiões de operação e interpretação em chaveamento {#tbl-semiconductor-operating-regions .full-width}

| Dispositivo | Região          | Interpretação física                               | Utilização típica                  |
| ----------- | --------------- | -------------------------------------------------- | ---------------------------------- |
| BJT         | Corte           | Corrente de coletor muito pequena                  | Chave aberta                       |
| BJT         | Ativa direta    | Corrente de coletor controlada pela base           | Amplificação ou transição          |
| BJT         | Saturação       | Junções de entrada e saída polarizadas diretamente | Chave fechada                      |
| NMOS        | Corte           | Canal não formado no modelo ideal                  | Chave aberta                       |
| NMOS        | Ôhmica / triodo | Canal conduz com baixa $V_{DS}$                    | Chave fechada                      |
| NMOS        | Saturação       | Canal com região de pinçamento próxima ao dreno    | Amplificação ou parte da transição |

:::

A mudança de estado exige redistribuição de cargas elétricas. Em circuitos
rápidos, a dinâmica de carga pode ser mais importante que a relação estática
corrente–tensão. Para uma carga puramente capacitiva, a corrente instantânea é:

$$
i_C=C_L\frac{dV_{out}}{dt}. \tag{13.5}
$$

A equação evidencia que, para uma mesma capacitância $C_L$, transições mais
rápidas exigem maior corrente instantânea. Em dispositivos reais, a corrente
varia durante a transição, e o atraso depende também da resistência efetiva de
condução e das capacitâncias internas.

## 13.6. Características estáticas e dinâmicas {#sec-semiconductor-static-dynamic}

As **características estáticas** descrevem correntes e tensões em condições
aproximadamente estacionárias. Entre elas estão correntes de fuga, quedas de
tensão, resistência de condução e limiares de entrada. As **características
dinâmicas** descrevem a resposta às mudanças: tempos de subida e descida,
atrasos de propagação, carga de porta e capacitâncias parasitas.

Para um circuito equivalente de primeira ordem, formado por resistência $R$ e
capacitância $C$, a constante de tempo é:

$$
\tau=RC. \tag{13.6}
$$

Na carga de um capacitor inicialmente descarregado por uma fonte ideal
$V_{DD}$, tem-se:

$$
V_C(t)=V_{DD}\left(1-e^{-t/RC}\right). \tag{13.7}
$$

O instante em que $V_C$ atinge metade de $V_{DD}$ é $t_{50\%}=RC\ln
2\approx0{,}693RC$. Esse resultado é útil como aproximação de atraso de uma
transição, mas **não** substitui a medição ou os parâmetros de temporização
especificados para uma porta lógica real.

<!-- prettier-ignore -->
::: example Atraso aproximado de uma carga capacitiva {#ex-semiconductor-rc-delay}

Se a resistência equivalente de acionamento for $R=200\,\Omega$ e a carga total
$C=50\,\mathrm{pF}$, então $\tau=10\,\mathrm{ns}$. O tempo para alcançar 50% do
valor final, sob as hipóteses do modelo RC, é aproximadamente
$6{,}93\,\mathrm{ns}$. A presença de interconexões, correntes dependentes da
tensão e capacitâncias não lineares altera o resultado real.

:::

<!-- prettier-ignore -->
::: figure Resposta de primeira ordem de uma carga capacitiva normalizada {#fig-semiconductor-rc-response}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\draw[->] (0,0)--(5.8,0) node[right] {$t/RC$};
\draw[->] (0,0)--(0,3.2) node[above] {$V_C/V_{DD}$};
\draw[dashed] (0,2.6)--(5.5,2.6);
\node[left] at (0,2.6) {$1$};
\draw[thick,domain=0:5,samples=70,smooth] plot (\x,{2.6*(1-exp(-\x))});
\draw[dashed] (0,1.3)--(0.693,1.3)--(0.693,0);
\node[left] at (0,1.3) {$0{,}5$};
\node[below] at (0.693,0) {$\ln 2$};
\end{tikzpicture}
```

:::

A {@ref fig-semiconductor-rc-response} mostra a resposta normalizada de um
modelo RC ideal. Ela não representa uma forma de onda medida em um componente
específico.

## 13.7. Inversores implementados com transistores {#sec-semiconductor-inverters}

Um **inversor lógico** produz um nível de saída oposto ao nível de entrada. O
inversor pode ser implementado com uma chave transistorada e um resistor de
carga, como no exemplo BJT da Seção 13.3. Entretanto, o uso de resistores de
carga pode provocar dissipação estática significativa quando a chave conduz.

Na arquitetura **CMOS complementar**, um PMOS conecta a saída à alimentação
positiva quando a entrada está baixa, enquanto um NMOS conecta a saída ao
potencial de referência quando a entrada está alta. Idealmente, nos estados
estáveis, apenas um dos transistores conduz de forma significativa. Durante a
comutação, ambos podem conduzir por um intervalo, produzindo corrente
transitória de curto-circuito entre os trilhos de alimentação.

<!-- prettier-ignore -->
::: figure Inversor CMOS complementar com transistores PMOS e NMOS {#fig-semiconductor-cmos-inverter}

```tikz
\begin{circuitikz}[scale=1.6,transform shape]
% Transistor PMOS superior
\node[pmos] (MP) at (4,5) {};
\node[right] at (MP) {$Q_P$};

% Transistor NMOS inferior
\node[nmos] (MN) at (4,2) {};
\node[right] at (MN) {$Q_N$};

% Fonte do PMOS na alimentação positiva
\draw (MP.S) -- ++(0,1.0) node[vcc] {$V_{DD}$};

% Fonte do NMOS no terra
\draw (MN.S) -- ++(0,-1.0) node[ground] {};

% Drenos conectados à saída
\draw (MP.D) -- (MN.D);
\draw (4,3.5) -- (6.5,3.5);
\draw (6.5,3.5) node[ocirc] {};
\node[right] at (6.8,3.5) {$V_{out}$};

% Portas conectadas à entrada comum
\draw (MP.G) -- (2,5);
\draw (MN.G) -- (2,2);
\draw (2,2) -- (2,5);
\draw (0.5,3.5) -- (2,3.5);
\draw (0.5,3.5) node[ocirc] {};
\node[left] at (0.2,3.5) {$V_{in}$};
\end{circuitikz}
```

:::

A {@ref fig-semiconductor-cmos-inverter} apresenta o esquema eletrônico de um
inversor CMOS complementar, constituído por um transistor PMOS e um transistor
NMOS. As portas dos dois dispositivos estão conectadas à entrada $V_{in}$,
enquanto seus drenos compartilham o nó de saída $V_{out}$. O PMOS estabelece o
caminho de condução entre $V_{DD}$ e a saída quando a entrada está em nível
lógico baixo; o NMOS estabelece o caminho entre a saída e o terra quando a
entrada está em nível lógico alto. Essa disposição complementar permite obter
os dois níveis lógicos com dissipação estática idealmente desprezível,
desconsideradas as correntes de fuga.

<!-- prettier-ignore -->
::: table Comportamento lógico ideal de um inversor CMOS {#tbl-semiconductor-cmos-truth .full-width}

| Entrada $V_{in}$ | PMOS     | NMOS     | Saída $V_{out}$ |
| ---------------- | -------- | -------- | --------------- |
| Baixa (0)        | Conduz   | Bloqueia | Alta (1)        |
| Alta (1)         | Bloqueia | Conduz   | Baixa (0)       |

:::

Na implementação física, o **corpo** de cada transistor deve receber a
polarização apropriada, e a faixa admissível de tensão de entrada deve ser
respeitada. A saída de um inversor CMOS não deve ser confundida com uma fonte
ideal capaz de fornecer corrente ilimitada.

## 13.8. Dissipação de potência e limitações físicas {#sec-semiconductor-power}

A potência dissipada por um dispositivo elétrico é, instantaneamente,

$$
p(t)=v(t)i(t). \tag{13.8}
$$

Em um MOSFET conduzindo na região ôhmica, uma estimativa da potência de
condução é:

$$
P_{\mathrm{cond}}\approx I_{D,\mathrm{rms}}^2R_{DS(on)}. \tag{13.9}
$$

Em uma chave BJT saturada, uma aproximação para a dissipação no caminho
coletor–emissor é $P_{CE}\approx V_{CE,\mathrm{sat}}I_C$, à qual se somam
contribuições relevantes de outros terminais e das transições. Para circuitos
CMOS, a potência dinâmica associada à carga e descarga de capacitâncias pode
ser aproximada por:

$$
P_{\mathrm{din}}\approx\alpha C_LV_{DD}^{2}f, \tag{13.10}
$$

em que $\alpha$ é o número médio de transições de carga $0\to1$ por ciclo de
relógio, na convenção adotada, $C_L$ é a capacitância efetivamente comutada e
$f$ é a frequência de referência. A potência total também inclui fuga e
corrente de curto-circuito durante as transições.

::: example Potência dinâmica de uma saída CMOS {#ex-semiconductor-cmos-power}

Uma saída com $C_L=20\,\mathrm{pF}$, $V_{DD}=3{,}3\,\mathrm{V}$,
$f=10\,\mathrm{MHz}$ e $\alpha=0{,}25$ apresenta potência dinâmica estimada de
$P_{\mathrm{din}}\approx0{,}5445\,\mathrm{mW}$. O resultado considera somente a
carga capacitiva representada no modelo; não inclui fugas, perdas internas nem
outros nós do circuito.

:::

O aquecimento do dispositivo pode ser estimado por uma resistência térmica
equivalente, em condições especificadas:

$$
T_J\approx T_A+P_D\theta_{JA}, \tag{13.11}
$$

em que $T_J$ é a temperatura de junção, $T_A$ a temperatura ambiente, $P_D$ a
potência dissipada e $\theta_{JA}$ a resistência térmica junção–ambiente. A
relação é uma aproximação de regime estacionário; seu uso depende do
encapsulamento, da placa, do fluxo de ar e das condições de montagem.

A confiabilidade também depende de sobretensões, descargas eletrostáticas,
corrente máxima, polarização do corpo, envelhecimento, limites de temperatura e
efeitos parasitas. Para um projeto real, **as folhas de dados e as condições de
operação recomendadas prevalecem sobre os modelos simplificados deste
capítulo**.

## Síntese do capítulo {#sec-semiconductor-summary}

A implementação de funções digitais depende de dispositivos que atuam como
chaves eletrônicas. Os BJTs utilizam a injeção de portadores e podem sofrer
armazenamento de carga; os MOSFETs utilizam o controle eletrostático de um
canal e exigem carga e descarga de capacitâncias. O inversor CMOS combina
dispositivos complementares para obter níveis lógicos com baixa dissipação
estática ideal. Em todos os casos, corrente, tensão, atraso, carga capacitiva,
potência e temperatura impõem limites físicos à abstração booleana.

## Exercícios propostos {#sec-semiconductor-exercises}

1. Explique por que a dopagem altera a condutividade de um semicondutor e
   diferencie portadores majoritários e minoritários.
2. Por que um diodo isolado não substitui diretamente um transistor como chave
   controlada por uma entrada independente?
3. Um NPN saturado possui $V_{CC}=12\,\mathrm{V}$,
   $R_C=2{,}2\,\mathrm{k\Omega}$ e $V_{CE,\mathrm{sat}}=0{,}2\,\mathrm{V}$.
   Estime a corrente de coletor.
4. Para o circuito do exercício 3, estime a corrente de base correspondente a
   $\beta_{\mathrm{forçado}}=10$.
5. Diferencie a região de saturação de um BJT da região de saturação de um
   MOSFET.
6. Explique por que $V_{TH}$ não garante que um MOSFET esteja adequadamente
   ligado como chave de baixa resistência.
7. Calcule a constante de tempo de um circuito com $R=500\,\Omega$ e
   $C=40\,\mathrm{pF}$.
8. Para o circuito do exercício 7, estime o tempo para a tensão alcançar 50% de
   seu valor final.
9. Descreva os estados ideais de condução do PMOS e do NMOS de um inversor CMOS
   para entrada alta e entrada baixa.
10. Estime a potência dinâmica de uma carga de $10\,\mathrm{pF}$, alimentada a
    $2{,}5\,\mathrm{V}$, com frequência de $20\,\mathrm{MHz}$ e fator de
    atividade $\alpha=0{,}1$.

## Respostas e soluções selecionadas {#sec-semiconductor-solutions}

1. A dopagem introduz níveis doadores ou aceitadores e altera a concentração de
   elétrons ou lacunas. Os portadores majoritários predominam em cada material
   dopado; os minoritários são menos abundantes.
2. O diodo possui apenas dois terminais; a polarização aplicada a eles
   determina diretamente a condução. O transistor dispõe de um terminal de
   controle adicional.
3. $I_C\approx(12-0{,}2)/2200=5{,}36\,\mathrm{mA}$.
4. $I_B\approx I_C/10=0{,}536\,\mathrm{mA}$.
5. A saturação do BJT corresponde à condição usual de chave fechada; a
   saturação do MOSFET, no modelo de canal longo, corresponde à região
   $V_{DS}\ge V_{GS}-V_{TH}$.
6. O limiar é definido para uma condição de corrente especificada e não
   informa, sozinho, a resistência de condução na corrente de trabalho.
7. $\tau=RC=20\,\mathrm{ns}$.
8. $t_{50\%}=\tau\ln2\approx13{,}9\,\mathrm{ns}$.
9. Entrada baixa: PMOS conduz e NMOS bloqueia. Entrada alta: PMOS bloqueia e
   NMOS conduz.
10. $P_{\mathrm{din}}=0{,}1\cdot10\,\mathrm{pF}\cdot(2{,}5\,\mathrm{V})^2\cdot20\,\mathrm{MHz}=0{,}125\,\mathrm{mW}$.

## Referências bibliográficas {#sec-semiconductor-references}

1. SEDRA, Adel S.; SMITH, Kenneth C. **Microelectronic Circuits**. 7. ed.
   Oxford University Press, 2014.
2. RAZAVI, Behzad. **Fundamentals of Microelectronics**. 2. ed. Wiley, 2013.
3. NEAMEN, Donald A. **Semiconductor Physics and Devices: Basic
   Principles**. 4. ed. McGraw-Hill, 2012.
4. RABAEY, Jan M.; CHANDRAKASAN, Anantha; NIKOLIĆ, Borivoje. **Digital
   Integrated Circuits: A Design Perspective**. 2. ed. Prentice Hall, 2003.
5. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed.
   Pearson, 2005.

---

[Voltar ao sumário](README.md) ·
[Capítulo 12 — Máquinas de estados finitos](finite-state-machines.md) ·
[Capítulo 14 — Famílias lógicas e circuitos integrados digitais](logic-families-and-digital-integrated-circuits.md)
