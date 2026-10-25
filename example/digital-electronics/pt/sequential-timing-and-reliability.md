# 10. Temporização e confiabilidade de circuitos sequenciais {#chapter-10}

O estudo dos elementos de memória, desenvolvido no Capítulo 9, estabeleceu como os circuitos sequenciais preservam e atualizam informações. Em dispositivos físicos, entretanto, as mudanças de estado não são instantâneas: portas, interconexões e flip-flops apresentam atrasos, e a amostragem de um sinal exige condições temporais específicas. O funcionamento correto depende, portanto, não apenas da lógica booleana, mas também de **quando** cada sinal muda.

Este capítulo apresenta os parâmetros de temporização, os limites de frequência e os principais mecanismos de falha associados à sincronização. Ao final, o leitor deverá ser capaz de analisar caminhos entre registradores, distinguir violações de *setup* e *hold*, compreender a metastabilidade e escolher estratégias básicas de transferência entre domínios de relógio.

## 10.1. Atrasos de propagação {#sec-timing-propagation-delays}

O **atraso de propagação** é o intervalo entre uma transição de entrada e a correspondente transição de saída, medido segundo níveis de referência especificados (frequentemente 50% das amplitudes). Como as transições de subida e descida podem apresentar comportamentos diferentes, distinguimos $t_{PLH}$, para saída de baixo para alto, e $t_{PHL}$, para saída de alto para baixo. O tempo de subida ou descida da forma de onda, por sua vez, não é o mesmo que atraso de propagação.

Em um caminho combinacional, o atraso total depende das portas atravessadas, das cargas, das interconexões e das condições de operação. Para uma estimativa simples de portas em cascata, podemos escrever:

$$
t_{pd,\mathrm{caminho}}\approx\sum_{i=1}^{n}t_{pd,i}+t_{\mathrm{interconexões}}.\tag{10.1}
$$

A expressão é aproximada: os atrasos de cada estágio dependem também da forma de onda que recebem. Em análises rigorosas, usam-se modelos e bibliotecas temporais específicos da tecnologia.

::: table Parâmetros temporais frequentemente encontrados em folhas de dados {#tbl-timing-parameters .full-width}

| Parâmetro | Significado | Aplicação |
| --- | --- | --- |
| $t_{PLH}$ | Atraso até uma transição de saída de 0 para 1 | Análise de propagação |
| $t_{PHL}$ | Atraso até uma transição de saída de 1 para 0 | Análise de propagação |
| $t_{CQ}$ | Atraso da borda de relógio até a saída $Q$ | Caminho entre registradores |
| $t_{setup}$ | Antecedência mínima de estabilidade de $D$ | Restrição de captura |
| $t_{hold}$ | Permanência mínima de estabilidade de $D$ após a borda | Restrição de captura |
| $t_{skew}$ | Diferença entre chegadas do relógio aos registradores | Margens de temporização |

:::

::: example Atraso de um caminho combinacional {#ex-timing-delay-chain}

Considere três estágios com atrasos estimados de $2\,\mathrm{ns}$, $3\,\mathrm{ns}$ e $4\,\mathrm{ns}$, mais $1\,\mathrm{ns}$ de interconexão. O atraso estimado do caminho é $10\,\mathrm{ns}$. Essa soma não determina, isoladamente, a frequência máxima do sistema: também devem ser considerados os registradores, o relógio e as margens temporais.

:::

## 10.2. Tempos de estabelecimento (*setup*) e retenção (*hold*) {#sec-timing-setup-hold}

Um flip-flop disparado por borda precisa receber uma entrada $D$ suficientemente estável em torno do instante de amostragem. O **tempo de estabelecimento**, $t_{setup}$, é o intervalo mínimo antes da borda ativa durante o qual $D$ deve permanecer estável. O **tempo de retenção**, $t_{hold}$, é o intervalo mínimo após essa borda durante o qual a estabilidade deve ser preservada. Os valores podem depender do dispositivo e das condições de operação.

<!-- prettier-ignore -->
::: figure Janela de estabilidade requerida em torno de uma borda ativa de relógio {#fig-timing-setup-hold-window}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[->] (0,0)--(8.6,0) node[right] {$t$};
\draw[thick] (0,1.4)--(4.0,1.4)--(4.0,2.2)--(5.0,2.2)--(5.0,1.4)--(8.0,1.4);
\node[left] at (0,1.8) {$CLK$};
\draw[thick] (0,0.65)--(2.5,0.65)--(2.5,1.0)--(5.5,1.0)--(5.5,0.65)--(8.0,0.65);
\node[left] at (0,0.8) {$D$};
\draw[dashed] (4.0,0.1)--(4.0,2.65);
\draw[dashed] (3.0,0.1)--(3.0,1.2);
\draw[dashed] (5.0,0.1)--(5.0,1.2);
\draw[<->] (3.0,2.55)--(4.0,2.55) node[midway,above] {$t_{setup}$};
\draw[<->] (4.0,2.55)--(5.0,2.55) node[midway,above] {$t_{hold}$};
\node[below] at (4.0,0) {borda ativa};
\end{tikzpicture}
```

:::

Na {@ref fig-timing-setup-hold-window}, a entrada $D$ mantém seu valor ao longo da janela delimitada pelos instantes anteriores e posteriores à borda ativa. O desenho é esquemático e não estabelece valores numéricos para os parâmetros.

O descumprimento de *setup* ou *hold* pode provocar captura incorreta ou metastabilidade. Uma violação não implica que a falha será observada em toda operação: implica que o comportamento garantido pelo fabricante deixou de estar assegurado.

## 10.3. Frequência máxima de operação {#sec-timing-maximum-frequency}

Considere um caminho síncrono formado por um registrador de origem, uma rede combinacional e um registrador de destino. Para relógios com bordas nominalmente coincidentes e sem considerar, inicialmente, a incerteza do relógio, a condição de *setup* é:

$$
T_{clk}\ge t_{CQ,\max}+t_{comb,\max}+t_{setup}.\tag{10.2}
$$

A frequência máxima estimada é, portanto:

$$
f_{\max}\le\frac{1}{t_{CQ,\max}+t_{comb,\max}+t_{setup}}.\tag{10.3}
$$

Essas relações usam **atrasos máximos**, porque a preocupação é que o dado chegue tarde demais ao registrador de destino. Na prática, é necessário acrescentar efeitos de distribuição do relógio, incertezas e demais restrições do projeto.

::: example Frequência máxima de um caminho registrado {#ex-timing-maximum-frequency}

Um caminho possui $t_{CQ,\max}=1{,}5\,\mathrm{ns}$, $t_{comb,\max}=6{,}0\,\mathrm{ns}$ e $t_{setup}=1{,}0\,\mathrm{ns}$. Sem *skew* nem incerteza, o período mínimo é:

$$
T_{\min}=1{,}5+6{,}0+1{,}0=8{,}5\,\mathrm{ns},
$$

logo $f_{\max}\approx117{,}6\,\mathrm{MHz}$. Esse resultado é um limite do modelo simplificado, não uma garantia de operação em uma implementação real.

:::

A restrição de *hold* é distinta: deve ser verificada com os **atrasos mínimos**, pois um dado que chega cedo demais pode substituir o valor que deveria permanecer estável após a borda de captura.

## 10.4. Distribuição de relógio e *clock skew* {#sec-timing-clock-skew}

O relógio não chega necessariamente ao mesmo instante a todos os elementos de memória. Denominamos **clock skew** a diferença entre os tempos de chegada do relógio a dois registradores. Adotaremos a convenção:

$$
t_{skew}=t_{clk,\mathrm{destino}}-t_{clk,\mathrm{origem}}.\tag{10.4}
$$

Assim, um *skew* positivo significa que a borda chega mais tarde ao registrador de destino. Sob essa convenção, e supondo captura na borda seguinte, as condições simplificadas são:

$$
T_{clk}\ge t_{CQ,\max}+t_{comb,\max}+t_{setup}-t_{skew}+t_{unc},\tag{10.5}
$$

$$
t_{CQ,\min}+t_{comb,\min}\ge t_{hold}+t_{skew}+t_{unc,h}.\tag{10.6}
$$

Aqui, $t_{unc}$ e $t_{unc,h}$ representam margens de incerteza aplicáveis às respectivas verificações. Observe que um *skew* positivo pode facilitar *setup* e, simultaneamente, dificultar *hold*. Por isso, não se deve interpretar o deslocamento do relógio como benefício universal.

<!-- prettier-ignore -->
::: figure Caminho de dados e chegadas distintas do relógio aos registradores {#fig-timing-clock-skew-path}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]

% Registrador de origem
\draw[thick] (1,2) rectangle (3.2,3.6);
\node[align=center] at (2.1,2.8) {FF origem};

% Lógica combinacional
\draw[thick] (5,2) rectangle (8.2,3.6);
\node[align=center] at (6.6,2.8)
  {Lógica\\combinacional};

% Registrador de destino
\draw[thick] (10,2) rectangle (12.2,3.6);
\node[align=center] at (11.1,2.8) {FF destino};

% Caminho de dados
\draw[->] (3.2,2.8) -- (5,2.8);
\draw[->] (8.2,2.8) -- (10,2.8);

% Linha de distribuição do relógio
\draw (0.6,0.5) -- (11.1,0.5);
\node[left] at (0.6,0.5) {$CLK$};

% Relógio do registrador de origem
\draw[->] (2.1,0.5) -- (2.1,2);
\node[below] at (2.1,0.5) {$t_o$};

% Relógio do registrador de destino
\draw[->] (11.1,0.5) -- (11.1,2);
\node[below] at (11.1,0.5) {$t_d$};

\end{tikzpicture}
```

:::

A {@ref fig-timing-clock-skew-path} representa dois caminhos físicos de distribuição de relógio. A linha horizontal é apenas uma representação funcional; os tempos efetivos de chegada dependem das interconexões e dos elementos de distribuição.

## 10.5. Metastabilidade {#sec-timing-metastability}

Quando uma entrada muda muito perto da borda de amostragem, um biestável pode entrar temporariamente em um estado **metastável**, no qual sua saída não alcança rapidamente um nível lógico estável. A metastabilidade é um fenômeno físico de circuitos regenerativos e não deve ser confundida com um terceiro estado lógico válido.

Um sincronizador não elimina a possibilidade de metastabilidade; ele reduz a probabilidade de que um estado ainda não resolvido alcance a lógica subsequente. Uma relação frequentemente usada para modelar qualitativamente o tempo médio entre falhas é:

$$
MTBF\propto\frac{e^{T_{res}/\tau}}{f_{clk}\,f_{data}}.\tag{10.7}
$$

Nessa expressão, $T_{res}$ é o tempo disponível para resolução, $\tau$ é uma constante tecnológica, $f_{clk}$ é a frequência de amostragem e $f_{data}$ representa a taxa de eventos da entrada. **Não é possível calcular um MTBF confiável apenas com essa proporcionalidade**: são necessários parâmetros caracterizados para o dispositivo, além de hipóteses sobre os eventos de entrada.

::: table Medidas para reduzir riscos associados à metastabilidade {#tbl-timing-metastability-mitigation .full-width}

| Medida | Benefício | Limitação |
| --- | --- | --- |
| Sincronizador de dois estágios | Aumenta o tempo disponível para resolução | Não elimina a probabilidade de falha |
| Estágio adicional | Pode melhorar substancialmente o MTBF | Acrescenta latência |
| Redução da taxa de eventos | Diminui oportunidades de amostragem crítica | Nem sempre é possível |
| Protocolo de transferência | Controla a validade e a aceitação dos dados | Requer lógica adicional |

:::

## 10.6. Sincronização de entradas assíncronas {#sec-timing-asynchronous-inputs}

Uma entrada proveniente de botão, sensor, interface externa ou outro domínio de relógio pode mudar em qualquer instante em relação ao relógio local. Para um **sinal de controle de um bit**, uma técnica comum é empregar dois flip-flops em série, acionados pelo mesmo relógio de destino. A saída do primeiro estágio deve alimentar diretamente o segundo, evitando lógica combinacional entre eles.

<!-- prettier-ignore -->
::: figure Sincronizador de dois estágios para um sinal de controle de um bit {#fig-timing-two-stage-synchronizer}

```tikz
\begin{tikzpicture}[scale=1.75,transform shape]
\draw[thick] (1.2,1.3) rectangle (3.2,2.8);
\draw[thick] (4.7,1.3) rectangle (6.7,2.8);
\node at (2.2,2.05) {FF 1};
\node at (5.7,2.05) {FF 2};
\draw[->] (0,2.2)--(1.2,2.2) node[midway,above] {$D_{async}$};
\draw[->] (3.2,2.2)--(4.7,2.2) node[midway,above] {$Q_1$};
\draw[->] (6.7,2.2)--(8.0,2.2) node[right] {$Q_{sync}$};
\draw (0.5,0.4)--(5.7,0.4);
\node[left] at (0.5,0.4) {$CLK$};
\draw[->] (2.2,0.4)--(2.2,1.3);
\draw[->] (5.7,0.4)--(5.7,1.3);
\end{tikzpicture}
```

:::

Na {@ref fig-timing-two-stage-synchronizer}, o primeiro estágio pode tornar-se metastável, mas dispõe de quase um período de relógio para estabilizar-se antes da amostragem pelo segundo estágio, descontados os atrasos e margens aplicáveis. A implementação física deve favorecer um caminho curto entre os dois estágios.

**Limitações importantes:** um pulso assíncrono muito curto pode não ser capturado; sincronizar independentemente cada bit de um barramento não garante uma palavra coerente; e um botão mecânico pode exigir também tratamento de *bounce* (repique), que é um problema diferente de metastabilidade.

::: example Captura de um pulso assíncrono {#ex-timing-asynchronous-pulse}

Um pulso de $4\,\mathrm{ns}$ chega a um circuito com relógio de $100\,\mathrm{MHz}$, cujo período é $10\,\mathrm{ns}$. Dependendo de sua fase, o pulso pode ocorrer inteiramente entre duas bordas de amostragem e não ser detectado. Um sincronizador de dois flip-flops não resolve, por si só, a perda desse evento. Uma alternativa é converter o evento em um nível persistente até a confirmação de recebimento, usando protocolo apropriado.

:::

## 10.7. Domínios de relógio e transferência de sinais {#sec-timing-clock-domains}

Um **domínio de relógio** reúne elementos de estado controlados por um relógio com relações temporais definidas. A transferência de informações entre domínios sem relação de fase garantida é chamada de *clock-domain crossing* (CDC). Sua implementação depende da natureza do sinal e da frequência de eventos.

::: table Estratégias de transferência entre domínios de relógio {#tbl-timing-cdc-strategies .full-width}

| Tipo de informação | Estratégia usual | Cuidado essencial |
| --- | --- | --- |
| Nível de controle de um bit | Sincronizador em cadeia | Latência e metastabilidade residual |
| Pulso ou evento isolado | *Handshake*, alternância de estado ou captura persistente | Não perder eventos |
| Barramento de múltiplos bits | Protocolo de dados estáveis com confirmação | Evitar captura de bits de instantes distintos |
| Contador de posição em FIFO assíncrona | Codificação Gray e sincronização dos ponteiros | Restrições de temporização e comparação correta |
| Fluxo contínuo de dados | FIFO assíncrona | Controle seguro de cheio/vazio |

:::

Uma codificação Gray reduz o número de bits que mudam em uma transição entre valores consecutivos, mas **não substitui** a análise temporal nem as restrições físicas necessárias ao circuito. Em um barramento binário comum, a sincronização bit a bit pode produzir combinações que nunca existiram simultaneamente na origem.

## 10.8. Condições de corrida e riscos temporais {#sec-timing-races-hazards}

Uma **condição de corrida** ocorre quando o resultado depende da ordem relativa de eventos ou de trajetórias de propagação. Um **hazard** é uma transição transitória indesejada causada por atrasos diferentes em caminhos lógicos. Em sistemas sequenciais, tais efeitos podem produzir pulsos espúrios, violar requisitos de temporização ou afetar controles assíncronos.

Os *hazards* combinacionais foram introduzidos no Capítulo 5. Aqui, o foco é sua interação com elementos de memória e com o relógio. Um pulso espúrio que desaparece antes da borda de captura pode não ser registrado; um pulso que coincide com a janela de amostragem pode ser capturado. Em sinais assíncronos de *reset* ou *set*, mesmo pulsos curtos podem ter consequências importantes.

::: table Diferenças entre falhas temporais {#tbl-timing-failure-modes .full-width}

| Fenômeno | Causa típica | Consequência possível |
| --- | --- | --- |
| Violação de *setup* | Dados chegam tarde | Captura incorreta ou metastabilidade |
| Violação de *hold* | Dados mudam cedo | Captura incorreta ou metastabilidade |
| *Hazard* combinacional | Atrasos desiguais de caminhos | Pulso espúrio |
| Corrida | Ordem não controlada de transições | Resultado dependente dos atrasos |
| CDC inadequado | Transferência sem protocolo ou sincronização | Perda de evento, incoerência ou metastabilidade |

:::

A prevenção combina arquitetura apropriada, verificação estática de temporização, análise de CDC, simulação e validação física. Nenhuma dessas atividades, isoladamente, substitui as demais.

## Síntese do capítulo {#sec-timing-summary}

A confiabilidade de circuitos sequenciais exige considerar os limites temporais dos dispositivos reais. A restrição de *setup* impõe um limite inferior ao período do relógio; a restrição de *hold* depende dos atrasos mínimos e não é corrigida simplesmente reduzindo a frequência. O *clock skew* altera as margens de ambas. Entradas assíncronas e transferências entre domínios exigem técnicas próprias, pois a metastabilidade não pode ser eliminada por simplificação booleana. A escolha da estratégia depende de se transmitir um nível, um evento, uma palavra ou um fluxo de dados.

## Exercícios propostos {#sec-timing-exercises}

1. **Atraso de propagação:** estime o atraso de um caminho com quatro portas de $1{,}5\,\mathrm{ns}$ cada e interconexões totalizando $2\,\mathrm{ns}$.
2. **Setup e hold:** explique por que ambos são necessários, mesmo em um circuito que usa apenas flip-flops disparados por borda.
3. **Frequência máxima:** calcule $T_{\min}$ e $f_{\max}$ para $t_{CQ,\max}=2\,\mathrm{ns}$, $t_{comb,\max}=7\,\mathrm{ns}$ e $t_{setup}=1\,\mathrm{ns}$, sem *skew* ou incerteza.
4. **Clock skew:** usando a convenção da equação (10.4), determine o período mínimo do exercício anterior quando $t_{skew}=+1\,\mathrm{ns}$ e $t_{unc}=0{,}5\,\mathrm{ns}$.
5. **Hold:** verifique a condição simplificada de *hold* com $t_{CQ,\min}=0{,}5\,\mathrm{ns}$, $t_{comb,\min}=0{,}4\,\mathrm{ns}$, $t_{hold}=0{,}6\,\mathrm{ns}$, $t_{skew}=0{,}5\,\mathrm{ns}$ e $t_{unc,h}=0$.
6. **Metastabilidade:** explique por que um sincronizador de dois estágios reduz a probabilidade de falha, mas não a elimina.
7. **Pulso assíncrono:** um pulso de $3\,\mathrm{ns}$ precisa ser recebido em um domínio de $50\,\mathrm{MHz}$. Por que a sincronização direta pode falhar? Indique uma alternativa.
8. **Barramento:** explique por que oito sincronizadores independentes não asseguram a captura coerente de uma palavra de oito bits.
9. **CDC:** escolha uma estratégia apropriada para transferir um fluxo de amostras entre dois relógios independentes e justifique.
10. **Hazard:** descreva uma situação em que um pulso espúrio de uma rede combinacional pode alterar indevidamente o estado de um circuito sequencial.

## Respostas e soluções selecionadas {#sec-timing-solutions}

1. $t_{pd}\approx4(1{,}5)+2=8\,\mathrm{ns}$.
2. *Setup* garante estabilidade antes da borda; *hold* garante estabilidade depois. A amostragem física requer uma janela temporal, não um instante matemático sem duração.
3. $T_{\min}=2+7+1=10\,\mathrm{ns}$; $f_{\max}=100\,\mathrm{MHz}$.
4. Pela equação (10.5), $T_{\min}=2+7+1-1+0{,}5=9{,}5\,\mathrm{ns}$; $f_{\max}\approx105{,}3\,\mathrm{MHz}$. A verificação de *hold* continua necessária.
5. Lado esquerdo: $0{,}5+0{,}4=0{,}9\,\mathrm{ns}$; lado direito: $0{,}6+0{,}5=1{,}1\,\mathrm{ns}$. Há violação de $0{,}2\,\mathrm{ns}$.
6. O primeiro estágio recebe o sinal assíncrono e pode tornar-se metastável; o intervalo até a próxima amostragem aumenta a chance de resolução antes do segundo estágio.
7. O período é $20\,\mathrm{ns}$; o pulso pode ocorrer entre bordas e ser perdido. Um protocolo de solicitação/confirmação ou retenção do evento é mais apropriado.
8. Os bits podem ser capturados em ciclos diferentes, produzindo uma palavra incoerente.
9. Uma FIFO assíncrona, com controle de ponteiros e condições de cheio/vazio adequados, desacopla os domínios.
10. Um pulso transitório na entrada de um controle assíncrono, por exemplo, pode limpar um registrador mesmo sem uma borda de relógio.

## Referências bibliográficas {#sec-timing-references}

1. MANO, M. Morris; CILETTI, Michael D. **Digital Design**. 5. ed. Pearson, 2013.
2. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed. Pearson, 2005.
3. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer Architecture**. 2. ed. Morgan Kaufmann, 2012.
4. CUMMINGS, Clifford E. **Clock Domain Crossing (CDC) Design & Verification Techniques Using SystemVerilog**. SNUG Boston, 2008.
5. CUMMINGS, Clifford E. **Simulation and Synthesis Techniques for Asynchronous FIFO Design**. SNUG San Jose, 2002.

---

[Voltar ao sumário](README.md) · [Capítulo 9 — Fundamentos dos circuitos sequenciais](sequential-circuit-fundamentals.md) · [Capítulo 11 — Registradores e contadores](registers-and-counters.md)
