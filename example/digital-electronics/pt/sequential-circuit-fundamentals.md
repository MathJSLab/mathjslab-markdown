# 9. Fundamentos dos circuitos sequenciais {#chapter-09}

Os circuitos combinacionais estudados nos capítulos anteriores são descritos
por relações entre entradas e saídas em um mesmo instante, abstraídos os
atrasos de propagação. Nos **circuitos sequenciais**, a resposta depende também
de informações preservadas ao longo do tempo. Essa propriedade permite
construir registradores, contadores, controladores e memórias, que serão
aprofundados nos capítulos seguintes.

O objetivo deste capítulo é estabelecer os conceitos de **estado**,
**realimentação**, **sincronização** e **armazenamento de um bit**,
relacionando representações funcionais, circuitos e diagramas temporais. O
capítulo seguinte tratará, com maior profundidade, dos requisitos de
temporização e dos mecanismos de falha.

## 9.1. Estado e memória {#sec-sequential-state-memory}

Uma função combinacional ideal é descrita por $Y(t)=F(X(t))$. Em um sistema
sequencial, distinguimos as entradas $X$, o **estado interno** $Q$ e as saídas
$Y$. Para uma descrição síncrona discreta, escrevemos:

$$
Q_{k+1}=F(Q_k,X_k), \qquad Y_k=G(Q_k,X_k).\tag{9.1}
$$

A primeira relação é a **função de próximo estado**; a segunda é a **função de
saída**. Quando a saída depende apenas do estado, temos o caso particular
$Y_k=G(Q_k)$; quando depende também das entradas, temos $Y_k=G(Q_k,X_k)$. Essas
formas antecipam, respectivamente, os modelos de Moore e de Mealy, que serão
desenvolvidos adiante.

O estado não deve ser confundido com o valor instantâneo de uma entrada: ele
representa informação que permanece disponível após a condição que a produziu
ter desaparecido. Um elemento de armazenamento binário possui, em condições
estáveis, dois estados possíveis, convencionalmente representados por $Q=0$ e
$Q=1$.

::: example Memória de uma solicitação {#ex-sequential-request-memory}

Um circuito recebe um pulso de solicitação e deve manter a indicação de
atendimento até que um comando de limpeza seja aplicado. Uma rede combinacional
ligada apenas à solicitação não consegue manter a indicação depois do fim do
pulso. É necessário um elemento de estado, capaz de reter o valor armazenado.

:::

## 9.2. Realimentação lógica {#sec-sequential-feedback}

A **realimentação** ocorre quando uma saída, direta ou indiretamente,
influencia as entradas da rede que a produz. Duas portas NOR interligadas de
modo cruzado podem constituir um elemento biestável: a saída de cada porta
participa da determinação da saída da outra. Essa configuração permite manter
um estado mesmo após a retirada de um comando momentâneo.

A existência de realimentação não garante, por si só, um armazenamento
adequado. É preciso identificar os estados estáveis, as condições de comando,
as combinações proibidas e os possíveis comportamentos transitórios.

<!-- prettier-ignore -->
::: figure Relação funcional entre lógica de próximo estado e armazenamento {#fig-sequential-feedback-blocks}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]

% Bloco de lógica de próximo estado
\draw[thick] (1,2) rectangle (3.7,3.5);
\node[align=center] at (2.35,2.75)
  {Lógica de\\próximo estado};

% Bloco de memória
\draw[thick] (5.3,2) rectangle (7.8,3.5);
\node[align=center] at (6.55,2.75)
  {Elemento de\\memória};

% Entrada X
\draw[->] (0,3.1) -- (1,3.1)
  node[midway,above] {$X$};

% Sinal de próximo estado D
\draw[->] (3.7,2.75) -- (5.3,2.75)
  node[midway,above] {$D$};

% Saída Q
\draw[->] (7.8,2.75) -- (9.0,2.75)
  node[right] {$Q$};

% Realimentação de Q para a lógica de próximo estado
% A linha horizontal passa em y=0.3
% Uma ponte semicircular evita a conexão com CLK
\draw[->]
  (8.35,2.75)
  -- (8.35,0.3)
  -- (6.85,0.3)
  arc[start angle=0,end angle=-180,radius=0.3]
  -- (2.35,0.3)
  -- (2.35,2);

% Sinal de relógio CLK
\draw[->]
  (6.55,-0.4)
  -- (6.55,2);

\node[right] at (6.65,1.25) {$CLK$};

\end{tikzpicture}
```

:::

Na {@ref fig-sequential-feedback-blocks}, $D$ representa o valor calculado para
armazenamento e $Q$ o valor armazenado, que retorna à lógica de próximo estado.
A figura é funcional: não representa as conexões internas de um dispositivo
específico. A mudança efetiva de $Q$ depende do mecanismo de habilitação ou do
evento de relógio.

## 9.3. Circuitos síncronos e assíncronos {#sec-sequential-synchronous-asynchronous}

Em um **circuito sequencial síncrono**, as mudanças dos elementos de estado são
coordenadas por um sinal de relógio. Nos dispositivos disparados por borda, as
entradas são amostradas em eventos discretos, como a borda de subida do
relógio. Entre esses eventos, as saídas armazenadas permanecem constantes,
salvo atuação de controles assíncronos.

Em um **circuito sequencial assíncrono**, a evolução de estado não depende de
uma borda global comum: mudanças nas entradas podem desencadear transições após
os atrasos internos. Isso exige especial cuidado com corridas, condições de
estabilidade e temporização.

<!-- prettier-ignore -->
::: table Comparação entre organizações síncronas e assíncronas {#tbl-sequential-sync-async .full-width}

| Aspecto                            | Organização síncrona                                | Organização assíncrona                             |
| ---------------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Coordenação das mudanças de estado | Eventos de relógio                                  | Mudanças de sinais e atrasos internos              |
| Análise temporal                   | Referenciada a bordas de relógio                    | Referenciada a eventos e trajetórias de propagação |
| Vantagem frequente                 | Estrutura de projeto e verificação mais sistemática | Possibilidade de operar sem relógio global         |
| Cuidado principal                  | _Setup_, _hold_, distribuição do relógio            | Corridas, perigos e protocolos de transição        |

:::

Não se deve confundir **circuito assíncrono** com **entrada assíncrona de um
flip-flop**. Um sistema globalmente síncrono pode conter pinos de _preset_ ou
_clear_ que atuam independentemente do relógio.

## 9.4. Sinais de relógio (_clock_) {#sec-sequential-clock}

Um sinal de relógio periódico alterna entre níveis lógicos baixo e alto. Seu
**período** $T$ é o intervalo entre bordas equivalentes consecutivas, e a
**frequência** é:

$$
f=\frac{1}{T}.\tag{9.2}
$$

O **ciclo de trabalho** (_duty cycle_) é a fração do período durante a qual o
sinal permanece em nível alto:

$$
D=\frac{t_H}{T}\times 100\%.\tag{9.3}
$$

Em um dispositivo disparado por **borda de subida**, a atualização ocorre no
evento $0\to1$; em um dispositivo disparado por **borda de descida**, no evento
$1\to0$. Já um _latch_ habilitado por nível pode acompanhar a entrada durante
todo o intervalo ativo da habilitação.

::: example Frequência e ciclo de trabalho {#ex-sequential-clock-period}

Um relógio de $20\,\mathrm{MHz}$ tem período $T=50\,\mathrm{ns}$. Se permanece
alto durante $20\,\mathrm{ns}$ em cada período, seu ciclo de trabalho é
$D=40\%$. Isso não significa que um flip-flop de borda de subida atualize
continuamente durante esses $20\,\mathrm{ns}$: a amostragem é associada à borda
ativa.

:::

## 9.5. Diagramas temporais {#sec-sequential-timing-diagrams}

Diagramas temporais permitem comparar entradas, relógio e saídas em uma escala
de tempo comum. Para interpretar corretamente um diagrama, é necessário
identificar o tipo de dispositivo e o evento ou nível que autoriza a
atualização.

<!-- prettier-ignore -->
::: figure Amostragem de D em bordas de subida de um relógio {#fig-sequential-d-flipflop-waveform}

```wavedrom
{ "signal": [
  { "name": "CLK", "wave": "p......." },
  { "name": "D",   "wave": "0.1.0.1." },
  { "name": "Q",   "wave": "0...1.0." }
], "config": { "hscale": 2 } }
```

:::

A {@ref fig-sequential-d-flipflop-waveform} é uma ilustração conceitual de
amostragem: o valor de $Q$ deve ser interpretado nos instantes de borda ativa,
não como uma cópia contínua de $D$. Em implementações reais, a mudança de $Q$
ocorre após um atraso de propagação, e as entradas precisam respeitar janelas
temporais específicas.

<!-- prettier-ignore -->
::: table Diferença temporal entre latch D e flip-flop D {#tbl-sequential-latch-vs-flipflop .full-width}

| Dispositivo                     | Condição de atualização | Comportamento fora da condição                        |
| ------------------------------- | ----------------------- | ----------------------------------------------------- |
| _Latch_ D ativo em nível alto   | $EN=1$                  | Mantém $Q$ quando $EN=0$                              |
| Flip-flop D de borda de subida  | Borda $0\to1$ de $CLK$  | Mantém $Q$ entre bordas, exceto controles assíncronos |
| Flip-flop D de borda de descida | Borda $1\to0$ de $CLK$  | Mantém $Q$ entre bordas, exceto controles assíncronos |

:::

## 9.6. Latches SR e D {#sec-sequential-latches}

O **_latch_ SR** é um elemento biestável comandado por sinais de _set_ ($S$) e
_reset_ ($R$). Na implementação com duas portas NOR cruzadas, os comandos são
ativos em nível alto. Para $S=R=0$, o circuito mantém o estado anterior. Para
$S=1,R=0$, estabelece $Q=1$; para $S=0,R=1$, estabelece $Q=0$.

<!-- prettier-ignore -->
::: table Latch SR com NOR cruzadas e entradas ativas em nível alto {#tbl-sequential-sr-nor .full-width}

| $S$ | $R$ | $Q^+$ | Interpretação                                 |
| :-: | :-: | :---: | --------------------------------------------- |
|  0  |  0  |  $Q$  | Manutenção                                    |
|  0  |  1  |   0   | Reset                                         |
|  1  |  0  |   1   | Set                                           |
|  1  |  1  |   —   | Combinação não permitida para operação normal |

:::

Com $S=R=1$, ambas as saídas da estrutura NOR podem ser forçadas a zero,
contrariando a relação complementar esperada entre $Q$ e $\overline Q$. Quando
os comandos retornam simultaneamente a zero, o estado final pode depender de
atrasos internos. Portanto, não se deve atribuir a essa linha um próximo estado
lógico determinístico.

Uma implementação com duas portas NAND cruzadas usa comandos usualmente
designados $\overline S$ e $\overline R$, **ativos em nível baixo**. Nesse
caso, a manutenção ocorre para $\overline S=\overline R=1$ e a condição não
permitida é $\overline S=\overline R=0$. As duas convenções não devem ser
misturadas.

O **_latch_ D** elimina a necessidade de aplicar comandos independentes de
_set_ e _reset_. Quando habilitado, seu estado acompanha $D$; quando
desabilitado, mantém o valor armazenado:

$$
Q^+=EN\,D+\overline{EN}\,Q.\tag{9.4}
$$

<!-- prettier-ignore -->
::: table Latch D com habilitação ativa em nível alto {#tbl-sequential-d-latch .full-width}

| $EN$ | $D$ | $Q^+$ | Comportamento                     |
| :--: | :-: | :---: | --------------------------------- |
|  0   |  X  |  $Q$  | Mantém estado                     |
|  1   |  0  |   0   | Armazena zero enquanto habilitado |
|  1   |  1  |   1   | Armazena um enquanto habilitado   |

:::

O símbolo $X$ nessa tabela significa que o valor de $D$ é indiferente quando
$EN=0$; não representa um nível elétrico intermediário.

## 9.7. Flip-flops SR, JK, D e T {#sec-sequential-flipflops}

Um **flip-flop** é um elemento de armazenamento cuja atualização é associada a
uma borda ativa de relógio. As tabelas seguintes descrevem seu comportamento
funcional na borda ativa, supondo ausentes controles assíncronos e satisfeitos
os requisitos de temporização.

<!-- prettier-ignore -->
::: table Comportamento dos principais flip-flops na borda ativa {#tbl-sequential-flipflops .full-width}

| Tipo | Entradas | Condição                  | Próximo estado $Q^+$            |
| ---- | -------- | ------------------------- | ------------------------------- |
| SR   | $S,R$    | $00$ / $01$ / $10$ / $11$ | $Q$ / $0$ / $1$ / não permitido |
| JK   | $J,K$    | $00$ / $01$ / $10$ / $11$ | $Q$ / $0$ / $1$ / $\overline Q$ |
| D    | $D$      | $0$ / $1$                 | $0$ / $1$                       |
| T    | $T$      | $0$ / $1$                 | $Q$ / $\overline Q$             |

:::

No flip-flop **JK**, a combinação $J=K=1$ provoca alternância de estado a cada
borda ativa, ao contrário da condição não permitida do SR. No flip-flop **T**,
$T=0$ preserva o estado e $T=1$ provoca alternância. O flip-flop **D** é
especialmente conveniente para sistemas síncronos, pois sua entrada representa
diretamente o próximo valor a armazenar.

<!-- prettier-ignore -->
::: figure Representação funcional de um flip-flop D com disparo por borda de subida {#fig-sequential-d-flipflop-symbol}

```tikz
\begin{tikzpicture}[scale=2,transform shape]
\draw[thick] (1,0) rectangle (3.5,2.6);
\node at (2.25,1.3) {D FF};
\draw (0,1.95)--(1,1.95);
\node[left] at (0,1.95) {$D$};
\draw (0,0.55)--(1,0.55);
\node[left] at (0,0.55) {$CLK$};
\draw (1,0.35)--(1.3,0.55)--(1,0.75);
\draw (3.5,1.95)--(4.5,1.95);
\node[right] at (4.5,1.95) {$Q$};
\draw (3.5,0.55)--(4.5,0.55);
\node[right] at (4.5,0.55) {$\overline Q$};
\end{tikzpicture}
```

:::

Na {@ref fig-sequential-d-flipflop-symbol}, o triângulo junto à entrada de
relógio indica disparo por borda. A ausência de uma bolha de inversão indica
borda de subida na convenção ilustrada. A presença da saída complementar
$\overline Q$ depende do componente real; o desenho é funcional.

::: example Divisão de frequência com flip-flop T {#ex-sequential-t-divider}

Se um flip-flop T ideal opera com $T=1$ constante, seu estado alterna a cada
borda ativa. Para um relógio periódico de frequência $f_{CLK}$, a saída $Q$
apresenta, em regime, frequência $f_Q=f_{CLK}/2$, desde que o componente
consiga operar nessa frequência e não haja interferência de controles
adicionais.

:::

## 9.8. Entradas assíncronas de controle {#sec-sequential-asynchronous-controls}

Alguns flip-flops possuem entradas de **preset** e **clear** (também chamadas
_set_ e _reset_ assíncronos). Elas podem forçar o estado independentemente da
ocorrência de borda de relógio. É essencial observar a polaridade indicada na
simbologia ou na folha de dados.

<!-- prettier-ignore -->
::: table Exemplo de flip-flop D com preset e clear assíncronos ativos em nível baixo {#tbl-sequential-async-controls .full-width}

| $\overline{PRE}$ | $\overline{CLR}$ | Comportamento de $Q$                             |
| :--------------: | :--------------: | ------------------------------------------------ |
|        1         |        1         | Operação normal por borda de relógio             |
|        0         |        1         | Força $Q=1$                                      |
|        1         |        0         | Força $Q=0$                                      |
|        0         |        0         | Combinação proibida ou dependente do dispositivo |

:::

A tabela apresenta uma convenção comum, não uma regra universal para todos os
componentes. A liberação de uma entrada assíncrona próxima à borda ativa pode
violar requisitos de **recuperação** e **remoção** (_recovery_ e _removal_), a
serem estudados no Capítulo 10. Por isso, o acionamento e a liberação de
_reset_ devem ser projetados com atenção especial.

## 9.9. Equações características e tabelas de excitação {#sec-sequential-characteristic-excitation}

A **equação característica** descreve o próximo estado como função das entradas
e do estado atual. Para os tipos usuais, na borda ativa:

$$
\begin{aligned}
Q^+_{D}&=D,\\
Q^+_{T}&=T\oplus Q,\\
Q^+_{JK}&=J\overline Q+\overline KQ,\\
Q^+_{SR}&=S+\overline RQ\quad\text{(desde que }SR=0\text{)}.
\end{aligned}\tag{9.5}
$$

A **tabela de excitação** responde à pergunta inversa: quais entradas permitem
realizar uma transição desejada de $Q$ para $Q^+$? Ela é útil no projeto de
máquinas de estados e na escolha de elementos de memória.

<!-- prettier-ignore -->
::: table Tabelas de excitação de flip-flops SR, JK, D e T {#tbl-sequential-excitation .full-width}

| $Q$ | $Q^+$ | $S$ | $R$ | $J$ | $K$ | $D$ | $T$ |
| :-: | :---: | :-: | :-: | :-: | :-: | :-: | :-: |
|  0  |   0   |  0  |  X  |  0  |  X  |  0  |  0  |
|  0  |   1   |  1  |  0  |  1  |  X  |  1  |  1  |
|  1  |   0   |  0  |  1  |  X  |  1  |  0  |  1  |
|  1  |   1   |  X  |  0  |  X  |  0  |  1  |  0  |

:::

Aqui, $X$ significa **indiferente**: qualquer um dos valores 0 ou 1 é aceitável
naquela posição, respeitadas as demais entradas da mesma linha. Em particular,
as escolhas permitidas para o SR não autorizam $S=R=1$.

::: example Conversão funcional de flip-flop D em T {#ex-sequential-d-to-t}

Desejamos que um flip-flop D se comporte como um flip-flop T. Como $Q^+=D$ para
o primeiro e $Q^+=T\oplus Q$ para o segundo, basta implementar:

$$
D=T\oplus Q.\tag{9.6}
$$

Assim, quando $T=0$, $D=Q$ e o estado é mantido; quando $T=1$, $D=\overline Q$
e o estado alterna na próxima borda ativa.

:::

## Síntese do capítulo {#sec-sequential-summary}

A memória digital decorre da possibilidade de preservar estados estáveis. A
realimentação é um mecanismo fundamental de armazenamento; a sincronização
estabelece quando os estados podem mudar. _Latches_ são sensíveis a níveis de
habilitação, enquanto _flip-flops_ são associados a bordas de relógio. As
equações características descrevem a evolução do estado, e as tabelas de
excitação permitem determinar os sinais de controle necessários para transições
desejadas.

## Exercícios propostos {#sec-sequential-exercises}

1. **Estado:** explique por que um circuito que deve manter um alarme ativo
   após o fim de um pulso de entrada precisa de memória.
2. **Relógio:** determine o período de um relógio de $8\,\mathrm{MHz}$ e o
   ciclo de trabalho quando o nível alto dura $50\,\mathrm{ns}$.
3. **Latch SR:** para um _latch_ NOR, partindo de $Q=0$, aplique sucessivamente
   $(S,R)=(1,0),(0,0),(0,1),(0,0)$. Determine $Q$ após cada comando.
4. **Latch D:** um _latch_ D com habilitação ativa em nível alto inicia em
   $Q=0$. Para $(EN,D)=(1,1),(0,0),(1,0)$, determine os valores sucessivos de
   $Q$.
5. **Flip-flop D:** um flip-flop D de borda de subida recebe, nas quatro bordas
   sucessivas, $D=1,0,0,1$. Determine a sequência de $Q$ após cada borda.
6. **Flip-flop JK:** partindo de $Q=0$, determine $Q$ após quatro bordas ativas
   com $J=K=1$.
7. **Flip-flop T:** um flip-flop T com $T=1$ recebe relógio de
   $2\,\mathrm{kHz}$. Qual a frequência de $Q$ em regime ideal?
8. **Excitação:** determine as entradas necessárias de um flip-flop JK para a
   transição $Q=1\to Q^+=0$, indicando os valores indiferentes.
9. **Conversão:** obtenha a expressão da entrada $D$ para que um flip-flop D
   reproduza o comportamento de um flip-flop JK.
10. **Controle assíncrono:** explique a diferença entre a ativação de _clear_
    assíncrono e a captura de $D$ na borda de relógio.

## Respostas e soluções selecionadas {#sec-sequential-solutions}

1. A indicação precisa depender de um estado preservado; uma função apenas das
   entradas presentes deixaria de indicar o alarme quando o pulso terminasse.
2. $T=1/(8\times10^6)=125\,\mathrm{ns}$ e $D=50/125=40\%$.
3. Os estados sucessivos são $1,1,0,0$.
4. Os estados sucessivos são $1,1,0$; com $EN=0$, a mudança de $D$ não altera
   $Q$.
5. $Q=1,0,0,1$ após as respectivas bordas.
6. $Q=1,0,1,0$.
7. $f_Q=1\,\mathrm{kHz}$.
8. Para $1\to0$, $K=1$ e $J=X$ (indiferente).
9. Como $Q^+=J\overline Q+\overline KQ$ e $Q^+=D$, basta usar $D=J\overline
   Q+\overline KQ$.
10. O _clear_ assíncrono força o estado sem aguardar a borda; a captura de $D$
    ocorre na borda ativa e depende dos requisitos temporais do dispositivo.

## Referências bibliográficas {#sec-sequential-references}

1. MANO, M. Morris; CILETTI, Michael D. **Digital Design**. 5. ed.
   Pearson, 2013.
2. FLOYD, Thomas L. **Digital Fundamentals**. 11. ed. Pearson, 2015.
3. TOCCI, Ronald J.; WIDMER, Neal S.; MOSS, Gregory L. **Digital Systems:
   Principles and Applications**. 12. ed. Pearson, 2017.
4. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer
   Architecture**. 2. ed. Morgan Kaufmann, 2012.
5. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed.
   Pearson, 2005.

---

[Voltar ao sumário](README.md) ·
[Capítulo 8 — Circuitos aritméticos digitais](digital-arithmetic-circuits.md) ·
[Capítulo 10 — Temporização e confiabilidade de circuitos sequenciais](sequential-timing-and-reliability.md)
