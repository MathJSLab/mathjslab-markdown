# 15. Integridade de sinais e implementação física {#chapter-15}

No capítulo anterior, os níveis lógicos, as margens de ruído e a capacidade de
acionamento foram apresentados como condições para interligar circuitos
integrados. Na montagem real, entretanto, os condutores não são ideais:
apresentam resistência, indutância, capacitância e atraso de propagação. Uma
saída digital pode produzir níveis estáticos corretos e, ainda assim,
apresentar oscilações, reflexões ou perturbações que causem falhas de
temporização.

A **integridade de sinais** estuda a preservação das características elétricas
necessárias à interpretação correta de um sinal durante sua transmissão. Seu
estudo envolve tanto o circuito integrado quanto as trilhas, cabos, conectores,
retornos de corrente e redes de alimentação. O objetivo não é obter uma forma
de onda perfeitamente retangular, mas garantir que tensões e tempos permaneçam
dentro das condições admissíveis para o receptor.

## 15.1. Modelos reais de entradas e saídas digitais {#sec-signal-integrity-io-models}

Uma saída digital pode ser aproximada, em primeira análise, por uma fonte de
tensão dependente do estado lógico, associada a uma resistência de saída
$R_{\mathrm{out}}$. A entrada do receptor apresenta capacitância
$C_{\mathrm{in}}$, correntes de fuga e limites de tensão especificados. A
interconexão acrescenta elementos parasitas.

<!-- prettier-ignore -->
::: figure Modelo elétrico simplificado de uma interligação digital {#fig-signal-integrity-lumped-link}

```tikz
\begin{circuitikz}[scale=1.25,transform shape]
\draw (0,0) node[ground] {} to[V,l_=$V_{\mathrm{drv}}$] (0,3)
      to[R,l=$R_{\mathrm{out}}$] (3,3)
      to[R,l=$R_{\mathrm{trilha}}$] (6,3)
      -- (8,3);
\draw (8,3) to[C,l=$C_L$] (8,0) node[ground] {};
\draw (8,3) -- (9.4,3);
\node[right] at (9.4,3) {$V_{\mathrm{in}}$};
\end{circuitikz}
```

:::

A {@ref fig-signal-integrity-lumped-link} é um modelo **concentrado**
(_lumped_): substitui uma interconexão distribuída por componentes
equivalentes. Ele é útil quando o tempo de propagação ao longo da conexão é
pequeno em comparação com o tempo de transição do sinal. A figura omite a
indutância e as não linearidades do estágio de saída; não deve ser interpretada
como um modelo universal.

<!-- prettier-ignore -->
::: table Elementos de um modelo de interligação digital {#tbl-signal-integrity-elements .full-width}

| Elemento              | Origem física                   | Efeito predominante                   |
| --------------------- | ------------------------------- | ------------------------------------- |
| $R_{\mathrm{out}}$    | Transistores de saída           | Limitação da corrente e amortecimento |
| $C_{\mathrm{in}}$     | Estruturas internas do receptor | Carga capacitiva                      |
| $R_{\mathrm{trilha}}$ | Resistividade do condutor       | Queda de tensão e perdas              |
| $L_{\mathrm{trilha}}$ | Campo magnético da corrente     | Sobretensões e resposta transitória   |
| $C_{\mathrm{trilha}}$ | Campo elétrico entre condutores | Carga e acoplamento                   |
| $t_p$                 | Propagação eletromagnética      | Atraso e possibilidade de reflexões   |

:::

A validade do modelo depende da geometria e da escala temporal do problema.
Quando a conexão se comporta como linha de transmissão, seus parâmetros devem
ser tratados como distribuídos ao longo do comprimento.

## 15.2. Capacitâncias parasitas e cargas {#sec-signal-integrity-capacitance}

A capacitância total acionada por uma saída pode incluir as entradas dos
receptores, a interconexão e os elementos de proteção:

$$
C_L \approx \sum_{k=1}^{N}C_{\mathrm{in},k}+C_{\mathrm{trilha}}+C_{\mathrm{extra}}. \tag{15.1}
$$

Essa soma é uma aproximação válida quando os elementos podem ser representados
como capacitâncias concentradas. A energia fornecida pela alimentação para
carregar uma capacitância ideal de $0$ até $V_{DD}$, através de uma chave
resistiva, é $C_LV_{DD}^2$; metade fica armazenada no capacitor e metade é
dissipada no processo resistivo idealizado. A energia armazenada é

$$
E_C=\frac{1}{2}C_LV^2. \tag{15.2}
$$

Uma carga maior geralmente eleva os tempos de transição e a energia de
comutação. Contudo, o comportamento real também depende da impedância de saída,
das condições de operação e da distribuição espacial da carga.

::: example Estimativa de carga capacitiva {#ex-signal-integrity-load}

Uma saída aciona quatro entradas de $5\,\mathrm{pF}$ cada e uma trilha cuja
capacitância equivalente é $18\,\mathrm{pF}$. Desconsiderando outras
contribuições,

$$
C_L=4(5)+18=38\,\mathrm{pF}.
$$

Para uma excursão de $3{,}3\,\mathrm{V}$, a energia armazenada ao final da
carga é aproximadamente $E_C=0{,}207\,\mathrm{nJ}$. A estimativa não inclui a
energia dissipada nos circuitos internos.

:::

## 15.3. Tempos de subida e descida {#sec-signal-integrity-edges}

O **tempo de subida** $t_r$ é medido entre dois níveis de referência durante
uma transição ascendente; o **tempo de descida** $t_f$ é definido de maneira
análoga na transição descendente. São comuns as referências de 10% e 90% da
amplitude, mas alguns fabricantes utilizam outros percentuais. A convenção deve
ser indicada.

No modelo RC de primeira ordem, para um degrau aplicado a uma capacitância
inicialmente descarregada,

$$
v_C(t)=V_{DD}\left(1-e^{-t/(RC)}\right). \tag{15.3}
$$

Para referências de 10% e 90%,

$$
t_r=RC\ln 9\approx 2{,}20RC. \tag{15.4}
$$

O tempo para atingir metade da excursão é $t_{50\%}=RC\ln2$. Esses resultados
descrevem um circuito RC ideal; não substituem os tempos especificados para
portas lógicas reais.

<!-- prettier-ignore -->
::: figure Resposta RC e referências de tempo de subida {#fig-signal-integrity-rc-rise}

```tikz
\begin{tikzpicture}[scale=1.45,transform shape]
\draw[->] (0,0)--(7,0) node[right] {$t$};
\draw[->] (0,0)--(0,4.0) node[above] {$v_C$};
\draw[thick,domain=0:6.5,samples=90,smooth,variable=\x]
  plot ({\x},{3.5*(1-exp(-\x/1.2))});
\draw[dashed] (0,0.35)--(6.6,0.35);
\draw[dashed] (0,3.15)--(6.6,3.15);
\node[left] at (0,0.35) {$10\%$};
\node[left] at (0,3.15) {$90\%$};
\draw[dotted] (0.126,0)--(0.126,0.35);
\draw[dotted] (2.763,0)--(2.763,3.15);
\draw[<->] (0.126,-0.45)--(2.763,-0.45);
\node[below] at (1.45,-0.45) {$t_r$};
\end{tikzpicture}
```

:::

Na {@ref fig-signal-integrity-rc-rise}, o tempo foi normalizado para ilustrar a
curva; as marcas de 10% e 90% correspondem aproximadamente aos instantes
$0{,}105RC$ e $2{,}303RC$.

::: example Tempo de subida de uma carga {#ex-signal-integrity-rise-time}

Com $R=100\,\Omega$ e $C=50\,\mathrm{pF}$, a constante de tempo é
$\tau=5\,\mathrm{ns}$. Assim, o tempo de subida de 10% a 90% é aproximadamente
$t_r=11\,\mathrm{ns}$.

:::

## 15.4. Reflexões e linhas de transmissão {#sec-signal-integrity-transmission-lines}

Uma interconexão deve ser tratada como **linha de transmissão** quando seu
atraso de propagação não é desprezível em relação ao tempo de transição. O
critério não depende apenas da frequência de repetição dos pulsos: uma onda com
bordas rápidas pode exigir esse tratamento mesmo em um sistema de baixa
frequência de relógio.

Em uma linha aproximadamente uniforme, a impedância característica $Z_0$
relaciona tensão e corrente das ondas viajantes. Para uma linha ideal sem
perdas, com indutância e capacitância por unidade de comprimento $L'$ e $C'$,

$$
Z_0=\sqrt{\frac{L'}{C'}}, \qquad
v_p=\frac{1}{\sqrt{L'C'}}. \tag{15.5}
$$

O atraso unidirecional de uma conexão de comprimento $\ell$ é

$$
t_p=\frac{\ell}{v_p}. \tag{15.6}
$$

Quando uma onda encontra uma terminação resistiva $R_L$, o coeficiente de
reflexão de tensão é

$$
\Gamma_L=\frac{R_L-Z_0}{R_L+Z_0}. \tag{15.7}
$$

Assim, uma terminação igual a $Z_0$ produz $\Gamma_L=0$ no modelo resistivo
ideal. Uma extremidade aberta aproxima-se de $\Gamma_L=+1$ e um curto-circuito,
de $\Gamma_L=-1$.

<!-- prettier-ignore -->
::: figure Linha de transmissão com fonte, impedância característica e terminação {#fig-signal-integrity-line}

```tikz
\begin{circuitikz}[scale=1.3,transform shape]
\draw (0,0) node[ground] {} to[V,l_=$V_s$] (0,3)
      to[R,l=$R_s$] (2.5,3)
      -- (4,3);
\draw[thick] (4,3)--(7.5,3);
\draw[thick] (4,0)--(7.5,0);
\draw (4,0)--(0,0);
\draw (7.5,3) to[R,l=$R_L$] (7.5,0);
\node[above] at (5.75,3.2) {$Z_0,\ t_p$};
\node[above] at (7.5,3.3) {$V_L$};
\end{circuitikz}
```

:::

A {@ref fig-signal-integrity-line} é uma representação conceitual: os dois
condutores indicam o caminho de ida e o de retorno da corrente. A impedância
característica não é um resistor discreto inserido em série na trilha.

::: example Reflexão em uma terminação {#ex-signal-integrity-reflection}

Uma linha de $Z_0=50\,\Omega$ termina em $R_L=100\,\Omega$. Pela equação
(15.7),

$$
\Gamma_L=\frac{100-50}{100+50}=\frac{1}{3}.
$$

A onda refletida de tensão tem amplitude igual a um terço da onda incidente,
com a mesma polaridade, no modelo ideal.

:::

## 15.5. Ruído, interferência e diafonia {#sec-signal-integrity-noise}

O ruído em circuitos digitais pode ser conduzido pela alimentação, acoplado por
campos elétricos ou magnéticos ou introduzido por retornos de corrente
compartilhados. A **diafonia** (_crosstalk_) é a perturbação de um sinal por
outro através do acoplamento entre condutores próximos.

O acoplamento capacitivo tende a aumentar com a taxa de variação de tensão,
pois a corrente através de uma capacitância é

$$
i_C=C\frac{dv}{dt}. \tag{15.8}
$$

Já a tensão associada à indutância é

$$
v_L=L\frac{di}{dt}. \tag{15.9}
$$

Essas relações ajudam a compreender por que transições rápidas podem produzir
perturbações mesmo quando a corrente média é pequena. Não permitem,
isoladamente, prever o ruído em uma placa real: a geometria, as impedâncias e
os caminhos de retorno também importam.

<!-- prettier-ignore -->
::: table Fontes de perturbação e medidas de mitigação {#tbl-signal-integrity-noise .full-width}

| Fenômeno               | Manifestação possível                        | Medidas usuais                                           |
| ---------------------- | -------------------------------------------- | -------------------------------------------------------- |
| Acoplamento capacitivo | Pulso induzido em trilha vizinha             | Afastamento, referência contínua, redução de paralelismo |
| Acoplamento indutivo   | Tensão induzida por variação de corrente     | Redução da área de laço, retorno próximo                 |
| Ruído na alimentação   | Variação transitória de $V_{DD}$             | Desacoplamento e distribuição de baixa impedância        |
| Reflexão               | Sobressinal, subsinal, múltiplos cruzamentos | Terminação e controle de impedância                      |
| Retorno compartilhado  | Deslocamento de referência local             | Plano de referência e topologia adequada                 |

:::

As margens de ruído estudadas no capítulo 14 referem-se a condições estáticas
especificadas. Um pulso transitório de duração suficiente para atravessar a
lógica ou violar a temporização pode provocar falhas mesmo quando os níveis
estáticos são compatíveis.

## 15.6. Aterramento e desacoplamento {#sec-signal-integrity-ground-decoupling}

O termo **terra** pode designar funções distintas: referência de potencial do
circuito, retorno de corrente, ligação de proteção ou conexão ao solo. Em uma
placa digital, a referência de sinais é parte do caminho físico percorrido
pelas correntes de retorno; não deve ser imaginada como um nó de impedância
rigorosamente nula.

Uma trilha de sinal sobre um plano de referência contínuo tende a apresentar
retorno de alta frequência próximo à projeção da trilha, reduzindo a área do
laço. Interrupções no plano podem obrigar a corrente a contornar aberturas,
aumentando a indutância e o acoplamento.

Os **capacitores de desacoplamento** fornecem corrente local durante variações
rápidas de consumo e ajudam a reduzir a impedância da rede de alimentação em
determinadas faixas de frequência. Seu desempenho depende da capacitância,
resistência série equivalente, indutância série equivalente, montagem e
posição.

<!-- prettier-ignore -->
::: figure Desacoplamento local de um circuito integrado digital {#fig-signal-integrity-decoupling}

```tikz
\begin{circuitikz}[scale=1.3,transform shape]

% Alimentação VDD
\draw (0,5.3) node[vcc] {$V_{DD}$} -- (0,4.5);
\draw (0,4.5) -- (5.5,4.5);

% Capacitor de desacoplamento
\draw (1.5,4.5)
  to[C,l=$C_{\mathrm{dec}}$] (1.5,0)
  node[ground] {};

% Bloco do circuito integrado
\draw[thick] (4,1) rectangle (6.5,3.7);
\node[align=center] at (5.25,2.35) {Circuito\\integrado};

% Conexão da alimentação ao terminal superior
\draw (5.5,4.5) -- (5.5,3.7);

% Conexão do terminal inferior ao terra
\draw (5.5,1) -- (5.5,0)
  node[ground] {};

\end{circuitikz}
```

:::

A {@ref fig-signal-integrity-decoupling} ilustra a função elétrica do
capacitor. Na placa, o desacoplamento deve ser conectado aos pinos apropriados
com trajetos curtos e baixa indutância; a representação não indica a geometria
física ideal.

## 15.7. Terminação de sinais {#sec-signal-integrity-termination}

A **terminação** busca controlar reflexões e melhorar a forma de onda recebida.
Sua necessidade depende do comprimento elétrico da conexão, da impedância
característica, dos tempos de borda, da topologia e das características do
transmissor e do receptor.

Na **terminação paralela**, coloca-se uma impedância próxima da carga para
aproximar a impedância vista pela onda incidente de $Z_0$. Em uma terminação
resistiva ideal, $R_T\approx Z_0$, mas a dissipação estática pode ser
relevante.

Na **terminação série**, acrescenta-se um resistor próximo à fonte, de modo que
a resistência efetiva do transmissor mais a resistência externa se aproxime de
$Z_0$:

$$
R_{\mathrm{out}}+R_T\approx Z_0. \tag{15.10}
$$

Essa abordagem pode funcionar bem em conexões ponto a ponto com receptor de
alta impedância, mas exige avaliar a reflexão no receptor e o tempo de
estabelecimento. Terminações Thévenin, em corrente alternada e diferenciais são
alternativas conforme o barramento.

<!-- prettier-ignore -->
::: table Estratégias usuais de terminação {#tbl-signal-integrity-termination .full-width}

| Estratégia  | Local típico                    | Principal compromisso                                      |
| ----------- | ------------------------------- | ---------------------------------------------------------- |
| Série       | Próximo ao transmissor          | Baixa dissipação estática; resposta depende da topologia   |
| Paralela    | Próximo ao receptor             | Reduz reflexão na carga; pode consumir potência contínua   |
| Thévenin    | Próximo ao receptor             | Define nível de polarização; requer dois resistores        |
| RC          | Próximo ao receptor             | Reduz corrente contínua; resposta dependente da frequência |
| Diferencial | Entre os dois condutores do par | Adequada a padrões diferenciais especificados              |

:::

<!-- prettier-ignore -->
::: example Estimativa de resistor série {#ex-signal-integrity-series-termination}

Para uma linha de $Z_0=60\,\Omega$ e um transmissor com resistência de saída
efetiva de $20\,\Omega$, uma estimativa inicial é $R_T\approx40\,\Omega$. O
valor final deve ser verificado com as tolerâncias, a forma de onda e as
especificações do circuito integrado.

:::

## 15.8. Interligação de circuitos integrados {#sec-signal-integrity-interconnect}

Ao interligar circuitos integrados, é necessário verificar simultaneamente
**compatibilidade lógica, compatibilidade elétrica, temporização e integridade
de sinais**. Uma interface não se torna segura apenas porque ambos os
dispositivos usam lógica binária.

Entre os pontos de verificação estão: tensões de alimentação e limites
absolutos; níveis $V_{OH}$, $V_{OL}$, $V_{IH}$ e $V_{IL}$; correntes de saída e
entrada; capacitância e número de cargas; tempos de propagação, _setup_ e
_hold_; estados durante inicialização; direção e habilitação de barramentos; e
requisitos de proteção contra descargas eletrostáticas.

Em interligações entre domínios de tensão diferentes, podem ser necessários
conversores de nível. Um pino não tolerante a tensões superiores à sua
alimentação não deve receber diretamente um nível mais alto, mesmo que a lógica
pareça funcionar em testes ocasionais.

Sinais assíncronos que cruzam domínios de relógio exigem técnicas específicas
de sincronização. A integridade elétrica da forma de onda não elimina o risco
de metastabilidade discutido no capítulo 10.

<!-- prettier-ignore -->
::: example Verificação de compatibilidade estática {#ex-signal-integrity-compatibility}

Um transmissor garante $V_{OH,\min}=2{,}7\,\mathrm{V}$ e
$V_{OL,\max}=0{,}4\,\mathrm{V}$. O receptor exige
$V_{IH,\min}=2{,}0\,\mathrm{V}$ e $V_{IL,\max}=0{,}8\,\mathrm{V}$. As margens
estáticas são:

$$
NM_H=2{,}7-2{,}0=0{,}7\,\mathrm{V},\qquad
NM_L=0{,}8-0{,}4=0{,}4\,\mathrm{V}.
$$

Os valores são positivos, mas ainda é preciso conferir correntes, alimentação,
limites absolutos e condições dinâmicas.

:::

## 15.9. Cuidados no projeto de placas de circuito impresso {#sec-signal-integrity-pcb}

O projeto de uma placa de circuito impresso (PCI) transforma o esquema elétrico
em uma geometria tridimensional. Largura e espessura de trilhas, distância até
planos de referência, material dielétrico, vias e conectores influenciam a
impedância e o atraso de propagação.

Boas práticas incluem manter caminhos de retorno contínuos, posicionar
desacoplamentos junto aos pinos de alimentação, evitar ramificações longas em
sinais rápidos, controlar impedâncias quando necessário, limitar áreas de laço
e preservar o espaçamento adequado entre redes sensíveis. Em pares
diferenciais, o equilíbrio geométrico e as recomendações do padrão elétrico
utilizado são especialmente importantes.

<!-- prettier-ignore -->
::: figure Caminho de sinal sobre plano de referência contínuo {#fig-signal-integrity-return-path}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape]
\draw[very thick,->] (0,2.4)--(7,2.4);
\node[above] at (3.5,2.4) {Trilha de sinal};
\draw[fill=gray!15] (0,0.4) rectangle (7,0.8);
\node[below] at (3.5,0.4) {Plano de referência};
\draw[thick,->] (6.3,0.6)--(0.7,0.6);
\draw[dashed] (1.2,2.25)--(1.2,0.85);
\draw[dashed] (5.8,2.25)--(5.8,0.85);
\node[right] at (7.1,1.45) {Dielétrico};
\end{tikzpicture}
```

:::

A {@ref fig-signal-integrity-return-path} é conceitual: o retorno de corrente
não está confinado a uma única linha. Sua distribuição depende da frequência e
da geometria eletromagnética.

O uso de vias, mudanças de camada e descontinuidades de referência deve ser
avaliado conforme a velocidade das bordas. Para sinais críticos, modelos de
campo, calculadoras de impedância e simulações podem complementar as regras
práticas.

## 15.10. Testes, medições e diagnóstico de falhas {#sec-signal-integrity-testing}

A observação de uma forma de onda digital exige instrumentos e procedimentos
compatíveis com sua escala temporal. Um osciloscópio com largura de banda
insuficiente pode apresentar bordas artificialmente lentas; uma ponta de prova
com conexão longa de terra pode introduzir indutância e oscilações que não
pertencem ao circuito sob teste.

Como estimativa para um sistema de medição com resposta aproximadamente
gaussiana,

$$
t_{r,\mathrm{instrumento}}\approx\frac{0{,}35}{BW}. \tag{15.11}
$$

A relação é aproximada e depende da resposta em frequência do instrumento.
Quando as respostas podem ser tratadas como gaussianas, uma estimativa para a
composição de tempos de subida é

$$
t_{r,\mathrm{medido}}^2\approx
t_{r,\mathrm{sinal}}^2+t_{r,\mathrm{instrumento}}^2. \tag{15.12}
$$

Em uma investigação, deve-se distinguir defeitos permanentes de falhas
intermitentes e correlacionar as formas de onda com eventos de relógio,
chaveamento e alimentação.

<!-- prettier-ignore -->
::: table Procedimento orientativo de diagnóstico {#tbl-signal-integrity-diagnosis .full-width}

| Etapa | Verificação                                   | Possível conclusão                           |
| ----- | --------------------------------------------- | -------------------------------------------- |
| 1     | Alimentações, referências e limites absolutos | Problema de energia ou conexão               |
| 2     | Níveis estáticos e margens                    | Incompatibilidade elétrica                   |
| 3     | Tempos de subida, descida e propagação        | Carga excessiva ou limitação de acionamento  |
| 4     | Sobressinal, subsinal e múltiplos cruzamentos | Reflexões, acoplamento ou medição inadequada |
| 5     | Ruído nos pinos de alimentação                | Desacoplamento ou retorno insuficiente       |
| 6     | Comparação com temporização especificada      | Violação de requisitos dinâmicos             |

:::

::: example Largura de banda e tempo de subida {#ex-signal-integrity-scope}

Para um osciloscópio com $BW=100\,\mathrm{MHz}$, a aproximação (15.11) fornece
$t_{r,\mathrm{instrumento}}\approx3{,}5\,\mathrm{ns}$. Se a borda real for de
$2\,\mathrm{ns}$ e a aproximação gaussiana for aplicável, o tempo medido seria
aproximadamente $\sqrt{2^2+3{,}5^2}=4{,}03\,\mathrm{ns}$. Portanto, a medição
pode superestimar significativamente o tempo de subida do sinal.

:::

## Síntese do capítulo {#sec-signal-integrity-summary}

A implementação física acrescenta resistência, capacitância, indutância e
atraso às conexões lógicas. Para interligações eletricamente curtas, modelos RC
concentrados permitem estimar tempos de transição e cargas; para conexões
eletricamente longas, a análise de linhas de transmissão e reflexões torna-se
necessária. O desempenho depende ainda dos caminhos de retorno, da alimentação,
do acoplamento entre condutores e das condições de medição.

Um projeto digital confiável exige integrar as especificações das famílias
lógicas, a temporização dos circuitos, a geometria das interligações e a
verificação experimental. As equações deste capítulo são modelos de primeira
aproximação e devem ser confrontadas com as folhas de dados e com as condições
reais de operação.

## Exercícios propostos {#sec-signal-integrity-exercises}

1. Explique a diferença entre um modelo concentrado e um modelo distribuído de
   interligação.
2. Uma saída aciona três entradas de $6\,\mathrm{pF}$ e uma trilha equivalente
   a $12\,\mathrm{pF}$. Estime $C_L$.
3. Calcule a energia armazenada em $C=30\,\mathrm{pF}$ submetido a
   $3{,}3\,\mathrm{V}$.
4. Para $R=150\,\Omega$ e $C=40\,\mathrm{pF}$, estime $t_r$ entre 10% e 90%.
5. Uma linha ideal tem $L'=250\,\mathrm{nH/m}$ e $C'=100\,\mathrm{pF/m}$.
   Determine $Z_0$ e $v_p$.
6. Para $Z_0=75\,\Omega$ e $R_L=150\,\Omega$, calcule $\Gamma_L$.
7. Uma conexão de $0{,}6\,\mathrm{m}$ apresenta
   $v_p=2\times10^8\,\mathrm{m/s}$. Calcule seu atraso unidirecional.
8. Estime um resistor de terminação série para $Z_0=50\,\Omega$ e
   $R_{\mathrm{out}}=15\,\Omega$.
9. Explique por que um plano de referência interrompido pode aumentar a
   interferência.
10. Um osciloscópio de $200\,\mathrm{MHz}$ observa uma borda de
    $3\,\mathrm{ns}$. Estime o tempo de subida instrumental e, sob a
    aproximação gaussiana, o tempo real do sinal.

## Respostas e soluções selecionadas {#sec-signal-integrity-solutions}

1. O modelo concentrado reúne os efeitos elétricos em componentes equivalentes;
   o distribuído considera sua variação ao longo da conexão e o atraso das
   ondas.
2. $C_L=3(6)+12=30\,\mathrm{pF}$.
3. $E_C=\frac12(30\,\mathrm{pF})(3{,}3\,\mathrm{V})^2\approx0{,}163\,\mathrm{nJ}$.
4. $\tau=RC=6\,\mathrm{ns}$ e $t_r\approx2{,}20\tau=13{,}2\,\mathrm{ns}$.
5. $Z_0=\sqrt{250\,\mathrm{nH/m}/(100\,\mathrm{pF/m})}=50\,\Omega$;
   $v_p=1/\sqrt{L'C'}=2\times10^8\,\mathrm{m/s}$.
6. $\Gamma_L=(150-75)/(150+75)=1/3$.
7. $t_p=0{,}6/(2\times10^8)=3\,\mathrm{ns}$.
8. $R_T\approx50-15=35\,\Omega$.
9. O retorno precisa contornar a interrupção, podendo aumentar a área do laço,
   a indutância e o acoplamento.
10. $t_{r,\mathrm{instrumento}}\approx0{,}35/(200\,\mathrm{MHz})=1{,}75\,\mathrm{ns}$;
    $t_{r,\mathrm{sinal}}\approx\sqrt{3^2-1{,}75^2}=2{,}44\,\mathrm{ns}$. A
    estimativa depende do modelo de resposta adotado.

## Referências bibliográficas {#sec-signal-integrity-references}

1. JOHNSON, Howard; GRAHAM, Martin. **High-Speed Digital Design: A Handbook of
   Black Magic**. Prentice Hall, 1993.
2. BOGATIN, Eric. **Signal and Power Integrity — Simplified**. 3. ed.
   Pearson, 2018.
3. OTT, Henry W. **Electromagnetic Compatibility Engineering**. Wiley, 2009.
4. PAUL, Clayton R. **Analysis of Multiconductor Transmission Lines**. 2. ed.
   Wiley-IEEE Press, 2007.
5. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed.
   Pearson, 2005.
6. TEXAS INSTRUMENTS. **Documentação técnica de lógica digital e integridade de
   sinais**. Notas de aplicação e folhas de dados do fabricante.

---

[Voltar ao sumário](README.md) ·
[Capítulo 14 — Famílias lógicas e circuitos integrados digitais](logic-families-and-digital-integrated-circuits.md)
· [Capítulo 16 — Memórias semicondutoras](semiconductor-memories.md)
