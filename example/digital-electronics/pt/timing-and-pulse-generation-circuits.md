# 17. Circuitos de temporização e geração de pulsos {#chapter-17}

A temporização é uma dimensão fundamental dos sistemas digitais. Além dos
valores lógicos, importa saber **quando** uma transição ocorre, por quanto
tempo um sinal permanece ativo e como diferentes eventos se relacionam no
tempo. A geração de pulsos, o condicionamento de entradas, a produção de
relógios e a medição de intervalos dependem de circuitos capazes de converter
grandezas elétricas e processos físicos em eventos temporais controlados.

Este capítulo apresenta as redes resistivo-capacitivas, os comparadores com
histerese, os circuitos monoestáveis e astáveis, os temporizadores integrados e
os principais métodos de geração e distribuição de frequências. Os modelos
matemáticos são aproximações úteis para projeto; os limites elétricos,
tolerâncias e condições de operação devem ser verificados nas folhas de dados
dos componentes.

## 17.1. Redes RC de temporização {#sec-timing-rc-networks}

Uma rede formada por um resistor e um capacitor pode transformar uma mudança
abrupta de tensão em uma evolução gradual. A rapidez dessa evolução depende da
**constante de tempo**

$$
\tau=RC. \tag{17.1}
$$

No Sistema Internacional, $R$ é expresso em ohms, $C$ em farads e $\tau$ em
segundos.

Considere um capacitor inicialmente descarregado, ligado a uma fonte ideal de
tensão contínua $V_S$ por meio de um resistor $R$. Aplicando a lei das tensões
de Kirchhoff e a relação constitutiva do capacitor,

$$
V_S=Ri_C+v_C,\qquad i_C=C\frac{dv_C}{dt}. \tag{17.2}
$$

A solução, para $t\ge0$, é

$$
v_C(t)=V_S\left(1-e^{-t/(RC)}\right). \tag{17.3}
$$

Para uma condição inicial arbitrária $V_0$ e uma tensão final $V_F$,

$$
v_C(t)=V_F+(V_0-V_F)e^{-t/\tau}. \tag{17.4}
$$

Essa expressão descreve tanto a carga quanto a descarga, desde que o circuito
possa ser representado por uma resistência equivalente constante e por um único
capacitor ideal.

<!-- prettier-ignore -->
::: figure Rede RC elementar para temporização por carga de capacitor {#fig-timing-rc-network}

```tikz
\begin{circuitikz}[scale=2,transform shape]
\draw (0,0) node[ground] {}
      to[V,l_=$V_S$] (0,3)
      to[R,l=$R$] (3,3)
      -- (5,3)
      to[C,l_=$C$] (5,0)
      -- (0,0);

\node[right] at (5.8,1.5) {$v_C(t)$};
\end{circuitikz}
```

:::

A {@ref fig-timing-rc-network} mostra uma rede de primeira ordem. O capacitor
atinge aproximadamente $63,2\%$ da variação total após uma constante de tempo,
e aproximadamente $99,3\%$ após cinco constantes de tempo. Esses percentuais
não definem, por si sós, o instante de comutação de um circuito digital: isso
depende de seus limiares de entrada.

Para determinar o instante $t_L$ em que a tensão atinge um limiar $V_L$ durante
a carga a partir de zero, obtemos

$$
t_L=-RC\ln\left(1-\frac{V_L}{V_S}\right),
\qquad 0<V_L<V_S. \tag{17.5}
$$

Durante a descarga de $V_0$ em direção a zero,

$$
v_C(t)=V_0e^{-t/(RC)},\qquad
t_L=RC\ln\left(\frac{V_0}{V_L}\right). \tag{17.6}
$$

::: example Cálculo de um atraso RC {#ex-timing-rc-delay}

Um capacitor de $10\,\mathrm{\mu F}$ carrega-se através de um resistor de
$10\,\mathrm{k\Omega}$, a partir de $0\,\mathrm V$, em direção a $5\,\mathrm
V$. A constante de tempo é

$$
\tau=(10\times10^3)(10\times10^{-6})=0{,}1\,\mathrm s.
$$

Se o circuito seguinte comuta quando $v_C=3\,\mathrm V$, o tempo ideal de
cruzamento é

$$
t_L=-0{,}1\ln\left(1-\frac35\right)
\approx0{,}0916\,\mathrm s.
$$

O resultado não inclui tolerâncias, corrente de fuga nem variação do limiar do
dispositivo de entrada.

:::

### Limitações práticas

As redes RC são simples, mas sua precisão é limitada por tolerâncias de
resistores e capacitores, dependência térmica, correntes de fuga, impedância de
entrada e variações dos limiares de comutação. Capacitores eletrolíticos, em
particular, podem apresentar dispersão significativa de capacitância e corrente
de fuga.

**Não se deve aplicar indiscriminadamente uma rampa RC lenta a uma entrada
lógica convencional.** Se a entrada permanecer por muito tempo na região de
transição, o circuito pode apresentar comutações indesejadas ou consumo
elevado. Uma entrada com histerese é frequentemente mais apropriada.

## 17.2. Comparadores com histerese e disparadores Schmitt {#sec-timing-schmitt}

Um comparador ideal sem histerese muda de estado quando a tensão de entrada
cruza uma referência. Na presença de ruído, pequenas oscilações em torno desse
limiar podem provocar múltiplas transições.

Um **disparador Schmitt** (_Schmitt trigger_) emprega dois limiares: $V_{T+}$,
utilizado quando a entrada cresce, e $V_{T-}$, utilizado quando ela decresce. A
largura de histerese é

$$
V_H=V_{T+}-V_{T-},\qquad V_{T+}>V_{T-}. \tag{17.7}
$$

No comportamento não inversor ideal, a saída passa ao nível alto quando a
entrada crescente ultrapassa $V_{T+}$ e retorna ao nível baixo quando a entrada
decrescente fica abaixo de $V_{T-}$. Entre esses limiares, a saída conserva o
estado anterior.

<!-- prettier-ignore -->
::: figure Dois limiares de comutação de um disparador Schmitt {#fig-timing-schmitt-thresholds}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape]
\draw[->] (0,0)--(5.8,0) node[right] {$v_{in}$};
\draw[->] (0,0)--(0,3.4) node[above] {$v_{out}$};
\draw[dashed] (1.7,0)--(1.7,2.9);
\draw[dashed] (3.7,0)--(3.7,2.9);
\node[below] at (1.7,-0.1) {$V_{T-}$};
\node[below] at (3.7,-0.1) {$V_{T+}$};
\draw[very thick,->] (0.6,0.7)--(3.7,0.7)--(3.7,2.7)--(5.0,2.7);
\draw[very thick,->] (5.0,2.35)--(1.7,2.35)--(1.7,0.35)--(0.6,0.35);
\node[right] at (5.05,2.7) {Subida};
\node[right] at (5.05,2.35) {Descida};
\end{tikzpicture}
```

:::

A {@ref fig-timing-schmitt-thresholds} representa a histerese de forma
conceitual. As trajetórias foram separadas verticalmente para tornar visíveis
os sentidos de comutação; os níveis reais de saída dependem do circuito.

A histerese é útil na leitura de botões, sensores e sinais com bordas lentas.
Entretanto, ela não substitui necessariamente o tratamento de **repique
mecânico** (_bounce_): dependendo da duração e amplitude dos repiques, pode ser
necessário um circuito ou algoritmo adicional de antirrepique (_debounce_).

Em dispositivos comerciais, os limiares e sua dispersão devem ser obtidos da
folha de dados. Não se deve assumir que sejam iguais a frações fixas da tensão
de alimentação, a menos que isso seja especificado.

## 17.3. Circuitos monoestáveis, astáveis e biestáveis {#sec-timing-stable-circuits}

Os circuitos regenerativos podem ser classificados pelo número de estados
estáveis e pela forma como mudam de estado.

- **Biestável:** possui dois estados estáveis e pode armazenar um bit;
  flip-flops e latches são exemplos.
- **Monoestável:** possui um estado estável e, após um disparo, produz uma
  excursão temporária antes de retornar ao estado inicial.
- **Astável:** não possui estado de repouso estável na operação normal e
  alterna periodicamente entre estados, produzindo oscilações.

Um monoestável é frequentemente utilizado para gerar pulsos de duração definida
a partir de eventos de entrada. Em uma realização baseada em RC, a duração é
determinada pelo intervalo entre o início da evolução da tensão e o cruzamento
de um limiar.

<!-- prettier-ignore -->
::: figure Relação entre disparo e pulso de saída de um monoestável {#fig-timing-monostable-pulse}

```tikz
\begin{tikzpicture}[scale=1.9,transform shape]
\node[left] at (0,3.0) {Disparo};
\node[left] at (0,1.2) {Saída};
\draw[->] (0,0)--(8.2,0) node[right] {$t$};
\draw[thick] (0,2.5)--(1.3,2.5)--(1.3,3.35)--(1.65,3.35)--(1.65,2.5)--(7.7,2.5);
\draw[thick] (0,0.7)--(1.3,0.7)--(1.3,1.6)--(5.7,1.6)--(5.7,0.7)--(7.7,0.7);
\draw[dashed] (1.3,0.2)--(1.3,2.3);
\draw[dashed] (5.7,0.2)--(5.7,1.45);
\draw[<->] (1.3,0.3)--(5.7,0.3);
\node[above] at (3.5,0.3) {$t_p$};
\end{tikzpicture}
```

:::

Na {@ref fig-timing-monostable-pulse}, o pulso de saída começa após um disparo
e dura $t_p$. A figura é idealizada: não apresenta atrasos de propagação,
tempos de subida e descida nem eventuais requisitos de largura mínima do
disparo.

Os monoestáveis podem ser **redisparáveis** (_retriggerable_), quando um novo
evento prolonga ou reinicia o intervalo temporizado, ou **não redisparáveis**,
quando disparos adicionais são ignorados durante o pulso ativo. Essa
característica altera significativamente seu comportamento em aplicações de
supervisão.

O circuito astável, por sua vez, gera uma sequência de pulsos. Seu período $T$
e frequência $f$ satisfazem

$$
f=\frac1T. \tag{17.8}
$$

Se o tempo em nível alto é $t_H$ e o tempo em nível baixo é $t_L$, então

$$
T=t_H+t_L,\qquad
D=\frac{t_H}{T}. \tag{17.9}
$$

A grandeza $D$ é o **ciclo de trabalho** (_duty cycle_). Pode ser expressa como
fração ou porcentagem.

<!-- prettier-ignore -->
::: table Comparação de circuitos segundo a estabilidade {#tbl-timing-stability-types .full-width}

| Tipo        | Estados estáveis | Comportamento típico         | Aplicação                    |
| ----------- | ---------------: | ---------------------------- | ---------------------------- |
| Biestável   |                2 | Conserva um dos dois estados | Armazenamento de bits        |
| Monoestável |                1 | Produz pulso após disparo    | Temporização de eventos      |
| Astável     |                0 | Oscila continuamente         | Geração de pulsos e relógios |

:::

## 17.4. Temporizadores integrados {#sec-timing-integrated-timers}

Os temporizadores integrados reúnem comparadores, referências de tensão,
elementos de armazenamento e estágios de saída para facilitar a implementação
de funções temporizadas. O **555** é um exemplo clássico, disponível em
diferentes versões bipolares e CMOS.

Em uma configuração tradicional, dois comparadores monitoram uma tensão
relacionada ao capacitor. Os limiares nominais são próximos de $V_{CC}/3$ e
$2V_{CC}/3$, quando não há alteração externa do pino de controle e são
atendidas as condições especificadas pelo fabricante.

### 555 em modo monoestável

Na configuração monoestável clássica, o capacitor parte aproximadamente de zero
e carrega-se em direção a $V_{CC}$ por meio de $R$. O pulso termina quando a
tensão atinge aproximadamente $2V_{CC}/3$. Da equação de carga,

$$
\frac{2V_{CC}}3
=V_{CC}\left(1-e^{-t_p/(RC)}\right),
$$

segue que

$$
t_p=RC\ln3\approx1{,}099RC. \tag{17.10}
$$

É comum utilizar a aproximação $t_p\approx1{,}1RC$. A precisão real depende das
tolerâncias e das condições elétricas.

### 555 em modo astável

Na ligação astável tradicional com resistores $R_A$, $R_B$ e capacitor $C$, o
capacitor carrega-se por $R_A+R_B$ e descarrega-se por $R_B$. Considerando os
limiares ideais de $V_{CC}/3$ e $2V_{CC}/3$,

$$
t_H=\ln2\,(R_A+R_B)C, \tag{17.11}
$$

$$
t_L=\ln2\,R_BC, \tag{17.12}
$$

e, portanto,

$$
T=\ln2\,(R_A+2R_B)C,\qquad
f\approx\frac{1{,}443}{(R_A+2R_B)C}. \tag{17.13}
$$

O ciclo de trabalho ideal é

$$
D=\frac{R_A+R_B}{R_A+2R_B}. \tag{17.14}
$$

Como $R_A>0$, essa configuração ideal não produz ciclo de trabalho inferior a
$50\%$. Para outras relações de tempo, podem ser utilizadas topologias
modificadas, diodos ou circuitos específicos.

::: example Frequência de um 555 astável {#ex-timing-555-astable}

Considere $R_A=10\,\mathrm{k\Omega}$, $R_B=20\,\mathrm{k\Omega}$ e
$C=10\,\mathrm{nF}$. Aplicando as expressões ideais,

$$
t_H\approx0{,}693(30\times10^3)(10\times10^{-9})
=207{,}9\,\mathrm{\mu s},
$$

$$
t_L\approx0{,}693(20\times10^3)(10\times10^{-9})
=138{,}6\,\mathrm{\mu s}.
$$

Logo, $T\approx346{,}5\,\mathrm{\mu s}$, $f\approx2{,}89\,\mathrm{kHz}$ e
$D\approx60\%$.

:::

É necessário observar as limitações de faixa de alimentação, capacidade de
saída, correntes de descarga e valores recomendados de componentes, que diferem
entre variantes do temporizador.

## 17.5. Osciladores e geradores de relógio {#sec-timing-clock-generators}

Um **oscilador** produz um sinal periódico a partir de energia fornecida por
uma fonte de alimentação. Em sistemas digitais, esse sinal frequentemente serve
como referência de relógio para registradores, contadores, controladores e
interfaces síncronas.

As características relevantes de um relógio incluem frequência nominal,
tolerância, estabilidade térmica, ruído de fase, _jitter_, ciclo de trabalho,
amplitude, tempos de subida e descida e compatibilidade com os níveis lógicos
dos circuitos receptores.

O **jitter** é a variação temporal das transições em relação às posições
esperadas. Já o **skew**, estudado no capítulo sobre temporização digital, é a
diferença de chegada de uma mesma referência de relógio a pontos distintos.
Embora relacionados à integridade temporal, não são conceitos equivalentes.

<!-- prettier-ignore -->
::: figure Período e ciclo de trabalho de um sinal de relógio {#fig-timing-clock-period}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape]

% Eixo do tempo
\draw[->] (0,-0.5)--(8.5,-0.5) node[right] {$t$};

% Forma de onda do relógio
\draw[thick]
(0.4,0.8)--(1.2,0.8)
--(1.2,2.8)
--(3.5,2.8)
--(3.5,0.8)
--(5.1,0.8)
--(5.1,2.8)
--(7.4,2.8)
--(7.4,0.8)
--(8.0,0.8);

% Linhas auxiliares
\draw[dashed] (1.2,-0.2)--(1.2,3.1);
\draw[dashed] (3.5,-0.2)--(3.5,3.1);
\draw[dashed] (5.1,-0.2)--(5.1,3.1);

% Período completo
\draw[<->] (1.2,3.25)--(5.1,3.25);
\node[above] at (3.15,3.25) {$T$};

% Intervalo em nível alto
\draw[<->] (1.2,1.65)--(3.5,1.65);
\node[above] at (2.35,1.65) {$t_H$};

% Intervalo em nível baixo
\draw[<->] (3.5,0.15)--(5.1,0.15);
\node[below] at (4.3,0.15) {$t_L$};

\end{tikzpicture}
```

:::

Na {@ref fig-timing-clock-period}, o período $T$ é medido entre bordas
equivalentes consecutivas. Os intervalos $t_H$ e $t_L$ definem o ciclo de
trabalho.

Um oscilador RC costuma ser simples e econômico, mas pode apresentar
estabilidade inferior à de uma referência ressonante. Osciladores de anel,
redes RC com histerese e osciladores controlados eletricamente atendem a
necessidades diferentes. A escolha depende do compromisso entre precisão,
consumo, custo e integração.

## 17.6. Cristais e referências de frequência {#sec-timing-crystals}

Cristais de quartzo exploram o efeito **piezoelétrico**: deformações mecânicas
e grandezas elétricas interagem, permitindo ressonâncias de elevada
seletividade. Quando associado a um circuito oscilador adequado, o cristal
fornece uma referência de frequência geralmente mais estável que uma rede RC
simples.

Um cristal não é, isoladamente, um gerador de sinal digital. Ele integra uma
malha osciladora que deve fornecer ganho, fase e condições de partida
adequados. O circuito pode exigir capacitores de carga e cuidados específicos
de montagem.

<!-- prettier-ignore -->
::: figure Organização funcional de um oscilador referenciado por cristal {#fig-timing-crystal-oscillator}

```tikz
\begin{tikzpicture}[scale=1.9,transform shape]
\draw[thick] (0.3,1.1) rectangle (2.9,2.7);
\node[align=center] at (1.6,1.9) {Cristal\\ressonante};
\draw[thick] (4.4,1.1) rectangle (7.0,2.7);
\node[align=center] at (5.7,1.9) {Circuito\\oscilador};
\draw[->] (2.9,1.9)--(4.4,1.9);
\draw[->] (7.0,1.9)--(8.7,1.9);
\node[right] at (8.7,1.9) {$CLK$};
\draw[->] (5.7,1.1)--(5.7,0.3)--(1.6,0.3)--(1.6,1.1);
\node[below] at (3.7,0.3) {Realimentação};
\end{tikzpicture}
```

:::

A {@ref fig-timing-crystal-oscillator} representa apenas a relação funcional
entre ressonador, circuito ativo e realimentação. Não substitui um esquema de
oscilador com valores de componentes definidos.

A frequência de um oscilador a cristal é afetada pela especificação de carga,
temperatura, envelhecimento e tolerâncias de fabricação. Em projetos que exigem
precisão elevada, podem ser utilizados osciladores compensados em temperatura
(TCXO), controlados por temperatura (OCXO) ou referências externas.

## 17.7. Divisão e multiplicação de frequência {#sec-timing-frequency-scaling}

A divisão de frequência é frequentemente realizada com contadores e flip-flops.
Um flip-flop configurado para alternar seu estado a cada borda ativa divide por
dois a frequência do sinal de entrada:

$$
f_{\mathrm{out}}=\frac{f_{\mathrm{in}}}{2}. \tag{17.15}
$$

Uma cadeia de $n$ estágios divide a frequência por $2^n$, quando cada estágio
realiza divisão por dois:

$$
f_{\mathrm{out}}=\frac{f_{\mathrm{in}}}{2^n}. \tag{17.16}
$$

Contadores programáveis permitem outros fatores inteiros de divisão. Deve-se
distinguir a divisão lógica de frequência da distribuição de relógio: atrasos e
_skew_ podem limitar a utilização direta de sinais derivados como relógios em
circuitos maiores.

<!-- prettier-ignore -->
::: figure Divisão de frequência por dois em cascata {#fig-timing-frequency-divider}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape]
\draw[thick] (1.4,1) rectangle (3.3,2.6);
\draw[thick] (5.1,1) rectangle (7.0,2.6);
\node[align=center] at (2.35,1.8) {Divisor\\por 2};
\node[align=center] at (6.05,1.8) {Divisor\\por 2};
\draw[->] (0,1.8)--(1.4,1.8);
\node[above] at (0.7,1.8) {$f_{\mathrm{in}}$};
\draw[->] (3.3,1.8)--(5.1,1.8);
\node[above] at (4.2,1.8) {$f_{\mathrm{in}}/2$};
\draw[->] (7.0,1.8)--(8.7,1.8);
\node[above] at (7.85,1.8) {$f_{\mathrm{in}}/4$};
\end{tikzpicture}
```

:::

A {@ref fig-timing-frequency-divider} ilustra dois estágios sucessivos de
divisão por dois. A forma de onda e os atrasos dependem da implementação.

A **multiplicação de frequência** não pode ser obtida apenas por uma cadeia de
divisores. Ela requer outro mecanismo, como síntese por PLL, síntese digital de
frequência ou geração de harmônicos com filtragem adequada. A escolha depende
da pureza espectral, do intervalo de frequências e da estabilidade exigida.

::: example Divisão de um relógio {#ex-timing-frequency-divider}

Uma referência de $16\,\mathrm{MHz}$ alimenta uma cadeia de cinco divisores por
dois. A frequência ao final é

$$
f_{\mathrm{out}}=\frac{16\,\mathrm{MHz}}{2^5}
=500\,\mathrm{kHz}.
$$

:::

## 17.8. Circuitos de atraso e conformação de pulsos {#sec-timing-pulse-shaping}

Um circuito de **conformação de pulsos** modifica a duração, a amplitude ou a
qualidade das transições de um sinal. Exemplos incluem antirrepique, limitação
de largura de pulso, geração de impulsos estreitos e recuperação de bordas a
partir de sinais lentos.

Um atraso lógico pode ser implementado por uma cadeia de portas, mas esse
método normalmente não é apropriado para obter intervalos precisos: os atrasos
de propagação variam com tensão, temperatura, carga e processo de fabricação.

Uma alternativa é combinar redes RC e entradas Schmitt para criar atrasos
relativamente simples, desde que as tolerâncias sejam aceitáveis. Para
temporização reprodutível, costuma ser preferível utilizar contadores acionados
por uma referência de relógio estável.

Em uma temporização digital por contagem de $N$ períodos de um relógio de
frequência $f_{\mathrm{clk}}$,

$$
t=N\,T_{\mathrm{clk}}=\frac{N}{f_{\mathrm{clk}}}. \tag{17.17}
$$

O intervalo efetivo pode apresentar erro de quantização temporal, dependendo de
como o evento de entrada é sincronizado com o relógio.

::: example Temporização por contador {#ex-timing-counter}

Um contador é acionado por um relógio de $1\,\mathrm{MHz}$, cujo período é
$1\,\mathrm{\mu s}$. Para produzir um intervalo nominal de $25\,\mathrm{ms}$,
são necessários $N=25000$ períodos. O circuito deve possuir largura suficiente
para representar a contagem e uma lógica de controle que determine o instante
exato de início e término.

:::

A conformação de pulsos também exige atenção à **largura mínima de pulso**
reconhecida pelo dispositivo receptor. Um pulso estreito demais pode não ser
detectado ou pode produzir comportamento não especificado.

## 17.9. Introdução aos PLLs {#sec-timing-pll}

Um **laço de travamento de fase** (_phase-locked loop_, PLL) é um sistema de
realimentação que ajusta a frequência e a fase de um oscilador controlado para
acompanhar uma referência.

Uma arquitetura típica contém detector de fase ou de fase e frequência, filtro
de laço, oscilador controlado e, frequentemente, um divisor no caminho de
realimentação.

<!-- prettier-ignore -->
::: figure Organização funcional simplificada de um PLL {#fig-timing-pll-blocks}

```tikz
\begin{tikzpicture}[scale=1.8,transform shape]
\draw[thick] (1.6,3.0) rectangle (3.8,4.3);
\node[align=center] at (2.7,3.65) {Detector\\de fase};
\draw[thick] (5.0,3.0) rectangle (7.1,4.3);
\node[align=center] at (6.05,3.65) {Filtro\\de laço};
\draw[thick] (8.3,3.0) rectangle (10.4,4.3);
\node at (9.35,3.65) {VCO};
\draw[thick] (5.0,0.4) rectangle (7.1,1.7);
\node[align=center] at (6.05,1.05) {Divisor\\$N$};
\draw[->] (0,3.65)--(1.6,3.65);
\node[above] at (0.8,3.65) {$f_{\mathrm{ref}}$};
\draw[->] (3.8,3.65)--(5.0,3.65);
\draw[->] (7.1,3.65)--(8.3,3.65);
\draw[->] (10.4,3.65)--(12.0,3.65);
\node[above] at (11.2,3.65) {$f_{\mathrm{out}}$};
\draw[->] (11.2,3.65)--(11.2,1.05)--(7.1,1.05);
\draw[->] (5.0,1.05)--(2.7,1.05)--(2.7,3.0);
\node[below] at (8.9,1.05) {Realimentação};
\end{tikzpicture}
```

:::

Na {@ref fig-timing-pll-blocks}, o divisor $N$ integra a realimentação. Sob
condições ideais de travamento e supondo divisão inteira, a relação de
frequências é

$$
f_{\mathrm{out}}=Nf_{\mathrm{ref}}. \tag{17.18}
$$

Em arquiteturas mais gerais, pode haver também um divisor de referência $R$,
levando a $f_{\mathrm{out}}=(N/R)f_{\mathrm{ref}}$, sob as hipóteses
correspondentes.

O PLL não elimina automaticamente ruído ou _jitter_. Seu comportamento depende
da largura de banda do laço, das características do oscilador e da referência,
da dinâmica de aquisição e de possíveis instabilidades. Um projeto completo
exige análise de controle e de ruído de fase, além do escopo introdutório deste
capítulo.

## 17.10. Aplicações de temporização {#sec-timing-applications}

Os circuitos de temporização aparecem em numerosas funções de sistemas
digitais:

- **Inicialização:** geração de atrasos de partida e sequências de reset,
  observando a estabilização da alimentação.
- **Supervisão:** temporizadores de vigilância (_watchdog_) para detectar
  ausência de atividade esperada.
- **Interfaces:** geração de pulsos de controle, seleção de janelas de
  amostragem e delimitação de transações.
- **Sensores e comandos:** antirrepique e conversão de sinais lentos em
  transições lógicas bem definidas.
- **Controle:** produção de PWM (_pulse-width modulation_) para regular
  potência média entregue a cargas, com estágios de potência adequados.
- **Medição:** contagem de períodos, captura de bordas e determinação de
  frequência ou largura de pulsos.

### Modulação por largura de pulso

Em uma sequência PWM de período fixo, varia-se o tempo ativo $t_H$ e,
consequentemente, o ciclo de trabalho $D$. Para uma saída ideal que alterna
entre $0$ e $V_H$, a tensão média é

$$
\overline V=D\,V_H. \tag{17.19}
$$

A tensão média não descreve, sozinha, a resposta de qualquer carga. Em motores,
LEDs e filtros, os efeitos dependem da frequência, das características
elétricas e da dinâmica física do sistema.

### Escolha do método de temporização

<!-- prettier-ignore -->
::: table Critérios gerais de seleção de circuitos de temporização {#tbl-timing-method-selection .full-width}

| Método                | Vantagem principal                   | Limitação relevante            | Uso típico                |
| --------------------- | ------------------------------------ | ------------------------------ | ------------------------- |
| Rede RC               | Simplicidade                         | Tolerâncias e limiares         | Atrasos aproximados       |
| RC com Schmitt        | Transições definidas                 | Precisão ainda limitada        | Condicionamento de sinais |
| Monoestável integrado | Pulso após disparo                   | Dispersão de componentes       | Pulsos temporizados       |
| Contador digital      | Repetibilidade por ciclos            | Depende do relógio             | Intervalos programáveis   |
| Cristal e oscilador   | Boa estabilidade de referência       | Custo e requisitos de montagem | Relógios de sistema       |
| PLL                   | Síntese e rastreamento de frequência | Complexidade e ruído           | Geração de frequências    |

:::

Em projetos reais, o circuito escolhido deve ser avaliado também quanto à
segurança funcional, tolerâncias, envelhecimento e comportamento na energização
e na perda de alimentação.

## Síntese do capítulo {#sec-timing-summary}

A temporização pode ser obtida por processos analógicos, como a carga de
capacitores, ou por processos digitais, como a contagem de períodos de relógio.
Redes RC relacionam resistência, capacitância e tempo por meio de respostas
exponenciais; entradas Schmitt tornam a comutação mais robusta frente a
variações lentas e ruído. Monoestáveis geram pulsos após disparos, astáveis
produzem oscilações e biestáveis conservam estados.

Temporizadores integrados simplificam funções usuais, enquanto cristais,
divisores e PLLs permitem construir referências de frequência e relógios para
sistemas maiores. A qualidade da temporização depende não apenas das equações
nominais, mas também dos limiares, tolerâncias, ruído, atrasos e condições
físicas de operação.

## Exercícios propostos {#sec-timing-exercises}

1. Calcule a constante de tempo de uma rede com $R=47\,\mathrm{k\Omega}$ e
   $C=22\,\mathrm{\mu F}$.
2. Um capacitor inicialmente descarregado carrega-se em direção a $12\,\mathrm
   V$ com $\tau=50\,\mathrm{ms}$. Determine sua tensão após uma constante de
   tempo.
3. Calcule o instante em que uma carga RC ideal alcança $75\%$ da tensão final.
4. Explique a diferença entre os limiares $V_{T+}$ e $V_{T-}$ de um disparador
   Schmitt.
5. Diferencie circuitos monoestáveis, astáveis e biestáveis quanto ao número de
   estados estáveis.
6. Um monoestável 555 ideal usa $R=100\,\mathrm{k\Omega}$ e $C=1\,\mathrm{\mu
   F}$. Estime a largura do pulso.
7. Em um 555 astável tradicional, $R_A=4{,}7\,\mathrm{k\Omega}$,
   $R_B=10\,\mathrm{k\Omega}$ e $C=100\,\mathrm{nF}$. Calcule $t_H$, $t_L$, $f$
   e $D$.
8. Um sinal periódico tem $t_H=3\,\mathrm{ms}$ e $t_L=7\,\mathrm{ms}$.
   Determine período, frequência e ciclo de trabalho.
9. Uma referência de $24\,\mathrm{MHz}$ passa por três divisores por dois.
   Determine a frequência resultante.
10. Quantos ciclos de um relógio de $8\,\mathrm{MHz}$ correspondem a um
    intervalo de $2\,\mathrm{ms}$?
11. Explique a diferença entre _jitter_ e _skew_ de relógio.
12. Um PLL ideal, com divisor de realimentação $N=12$, está travado a uma
    referência de $2\,\mathrm{MHz}$. Qual é sua frequência de saída?
13. Por que uma rede RC ligada diretamente a uma entrada lógica sem histerese
    pode ser problemática?
14. Compare um temporizador RC e um contador digital quanto à precisão e à
    necessidade de referência de frequência.

## Respostas e soluções selecionadas {#sec-timing-solutions}

1. $\tau=47\times10^3\cdot22\times10^{-6}=1{,}034\,\mathrm s$.
2. $v_C(\tau)=12(1-e^{-1})\approx7{,}59\,\mathrm V$.
3. $t=-\tau\ln(0{,}25)\approx1{,}386\tau$.
4. $V_{T+}$ é o limiar de comutação na subida; $V_{T-}$, na descida. A
   diferença define a histerese.
5. Monoestável: um; astável: nenhum; biestável: dois.
6. $t_p\approx1{,}1(100\times10^3)(10^{-6})=0{,}11\,\mathrm s$.
7. $t_H\approx1{,}019\,\mathrm{ms}$, $t_L\approx0{,}693\,\mathrm{ms}$,
   $T\approx1{,}712\,\mathrm{ms}$, $f\approx584\,\mathrm{Hz}$,
   $D\approx59{,}6\%$.
8. $T=10\,\mathrm{ms}$, $f=100\,\mathrm{Hz}$, $D=30\%$.
9. $24\,\mathrm{MHz}/8=3\,\mathrm{MHz}$.
10. $N=(8\times10^6)(2\times10^{-3})=16000$ ciclos.
11. _Jitter_ descreve a variação temporal de transições; _skew_ descreve
    diferenças de chegada de uma referência a pontos distintos.
12. $f_{\mathrm{out}}=12(2\,\mathrm{MHz})=24\,\mathrm{MHz}$.
13. Uma transição lenta pode manter a entrada na região de limiar, provocando
    comutação instável e consumo adicional.
14. A rede RC depende das tolerâncias e dos limiares; o contador determina
    intervalos em múltiplos do período de uma referência de relógio, cuja
    precisão passa a ser determinante.

## Referências bibliográficas {#sec-timing-references}

1. HOROWITZ, Paul; HILL, Winfield. **The Art of Electronics**. 3. ed. Cambridge
   University Press, 2015.
2. SEDRA, Adel S.; SMITH, Kenneth C. **Microelectronic Circuits**. Oxford
   University Press.
3. MANO, M. Morris; CILETTI, Michael D. **Digital Design**. 5. ed.
   Pearson, 2013.
4. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer
   Architecture**. 2. ed. Morgan Kaufmann, 2012.
5. TEXAS INSTRUMENTS. **Documentação técnica de temporizadores 555 e variantes
   CMOS**. Folhas de dados e notas de aplicação.
6. Fabricantes de osciladores, cristais e circuitos de síntese de relógio.
   **Folhas de dados e notas de aplicação**. Consultar as especificações do
   componente utilizado.

---

[Voltar ao sumário](README.md) ·
[Capítulo 16 — Memórias semicondutoras](semiconductor-memories.md) ·
[Capítulo 18 — Conversores digital-analógico](digital-to-analog-converters.md)
