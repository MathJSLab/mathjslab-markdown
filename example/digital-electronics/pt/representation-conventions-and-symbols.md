# Apêndice B. Convenções de representação e simbologia {#appendix-b}

A leitura de um circuito digital exige distinguir três aspectos que
frequentemente aparecem no mesmo desenho: **a função lógica**, **a
implementação elétrica** e **a evolução temporal dos sinais**. Este apêndice
estabelece uma referência de notação para a obra, apresenta símbolos usuais e
explicita convenções que devem ser declaradas quando houver risco de
ambiguidade. As representações aqui adotadas são didáticas; em projetos
industriais, prevalecem a norma aplicável, a documentação do componente e as
convenções da equipe.

## B.1. Grandezas, unidades e prefixos

Adotam-se, sempre que possível, as unidades do Sistema Internacional. Os
símbolos de grandezas são escritos em itálico nas expressões matemáticas; os
símbolos de unidades, em caracteres retos. O espaço entre número e unidade deve
ser preservado: $5\ \mathrm{V}$, $20\ \mathrm{ns}$, $10\ \mathrm{MHz}$.

| Grandeza          | Símbolo típico | Unidade        | Observação                                                |
| ----------------- | -------------- | -------------- | --------------------------------------------------------- |
| Tensão elétrica   | $v$, $V$       | volt (V)       | $V_{DD}$ e $V_{SS}$ podem designar trilhos de alimentação |
| Corrente elétrica | $i$, $I$       | ampere (A)     | O sentido positivo deve ser definido                      |
| Resistência       | $R$            | ohm ($\Omega$) | —                                                         |
| Capacitância      | $C$            | farad (F)      | —                                                         |
| Tempo             | $t$            | segundo (s)    | —                                                         |
| Período           | $T$            | segundo (s)    | $T=1/f$ para sinal periódico                              |
| Frequência        | $f$            | hertz (Hz)     | —                                                         |
| Potência          | $P$            | watt (W)       | —                                                         |
| Energia           | $E$            | joule (J)      | —                                                         |
| Taxa de dados     | $R_b$          | bit/s          | Distinguir de baud (símbolos/s)                           |

| Prefixo | Símbolo |      Fator | Prefixo | Símbolo |     Fator |
| ------- | ------- | ---------: | ------- | ------- | --------: |
| pico    | p       | $10^{-12}$ | quilo   | k       |    $10^3$ |
| nano    | n       |  $10^{-9}$ | mega    | M       |    $10^6$ |
| micro   | $\mu$   |  $10^{-6}$ | giga    | G       |    $10^9$ |
| mili    | m       |  $10^{-3}$ | tera    | T       | $10^{12}$ |

Em capacidade de memória, **kB** significa $10^3$ bytes e **KiB** significa
$2^{10}$ bytes. Analogamente, MB e MiB não são equivalentes. Um byte
corresponde, por convenção corrente, a oito bits; a largura de uma palavra
depende da arquitetura.

## B.2. Variáveis booleanas e operações lógicas

As variáveis booleanas pertencem a $\mathbb{B}=\{0,1\}$. Nesta obra, o contexto
determina se uma expressão é aritmética ou booleana. Para expressões booleanas,
adotam-se:

| Operação            | Notação principal      | Notações alternativas  | Exemplo                  |
| ------------------- | ---------------------- | ---------------------- | ------------------------ |
| Negação (NOT)       | $\overline A$          | $\neg A$, $A'$         | $Y=\overline A$          |
| Conjunção (AND)     | $AB$                   | $A\cdot B$, $A\land B$ | $Y=AB$                   |
| Disjunção (OR)      | $A+B$                  | $A\lor B$              | $Y=A+B$                  |
| OU exclusivo (XOR)  | $A\oplus B$            | —                      | $Y=A\oplus B$            |
| Equivalência (XNOR) | $\overline{A\oplus B}$ | $A\odot B$             | $Y=\overline{A\oplus B}$ |
| NAND                | $\overline{AB}$        | —                      | $Y=\overline{AB}$        |
| NOR                 | $\overline{A+B}$       | —                      | $Y=\overline{A+B}$       |

A precedência usual é **NOT**, depois **AND**, depois **OR**; XOR e outras
combinações devem receber parênteses quando a ordem não for evidente. Por
exemplo, $\overline{AB}$ nega o produto inteiro, enquanto $\overline A B$ nega
apenas $A$.

O símbolo $+$ em $A+B$ não representa soma aritmética: $1+1=1$ na operação OR.
Já $1+1=2$ em aritmética convencional. O símbolo $\oplus$ é particularmente
útil para expressar soma binária sem transporte.

## B.3. Níveis lógicos, polaridade e estados especiais

**Nível lógico** é uma interpretação de um sinal físico segundo limiares
elétricos e condições de operação. O valor lógico 1 não deve ser
automaticamente identificado com uma tensão fixa, nem o valor 0 com exatamente
$0\ \mathrm{V}$. Os limites $V_{IL}$, $V_{IH}$, $V_{OL}$ e $V_{OH}$ dependem da
família lógica e das condições especificadas em folha de dados.

| Notação    | Significado                                      | Cuidado de interpretação                               |
| ---------- | ------------------------------------------------ | ------------------------------------------------------ |
| `0`, `1`   | Valores lógicos binários                         | Não indicam, isoladamente, uma tensão absoluta         |
| `X`        | Valor desconhecido ou indeterminado em simulação | Não equivale necessariamente a _don't care_ de síntese |
| `Z`        | Alta impedância na modelagem de sinais           | Não constitui terceiro valor lógico booleano           |
| `-` ou `d` | Condição indiferente em tabela de minimização    | Usar apenas quando a especificação permitir            |
| `H`, `L`   | Nível elétrico alto ou baixo                     | Não definem sozinhos polaridade funcional              |

Em simulações HDL de quatro estados, `X` pode resultar de falta de
inicialização, contenção ou propagação de valores desconhecidos. Já o símbolo
de condição indiferente (_don't care_) indica que determinada combinação pode
receber qualquer valor para fins de otimização. **Esses conceitos não devem ser
confundidos.**

Um sinal **ativo em nível baixo** pode ser indicado por uma barra superior, por
sufixo `_n` ou pelo símbolo `#`, conforme a convenção adotada:
$\overline{RESET}$, `RESET_n`, `RESET#`. Nesta obra, preferem-se `RESET_n` e
`CS_n` em código e barra superior em expressões matemáticas. A bolha desenhada
no terminal de um símbolo indica inversão ou ativação em nível baixo, conforme
a função do terminal.

## B.4. Símbolos de portas lógicas

As portas podem ser representadas por símbolos de formato distintivo, comuns em
material didático, ou por simbologia retangular funcional, utilizada em
determinadas normas e documentação técnica. A forma gráfica não altera a função
booleana. A tabela resume as relações fundamentais.

| Porta  | Relação                  | Condição de saída 1         |
| ------ | ------------------------ | --------------------------- |
| Buffer | $Y=A$                    | $A=1$                       |
| NOT    | $Y=\overline A$          | $A=0$                       |
| AND    | $Y=AB$                   | Ambas as entradas em 1      |
| OR     | $Y=A+B$                  | Pelo menos uma entrada em 1 |
| NAND   | $Y=\overline{AB}$        | Pelo menos uma entrada em 0 |
| NOR    | $Y=\overline{A+B}$       | Ambas as entradas em 0      |
| XOR    | $Y=A\oplus B$            | Entradas diferentes         |
| XNOR   | $Y=\overline{A\oplus B}$ | Entradas iguais             |

<!-- prettier-ignore -->
::: figure Portas lógicas representadas por blocos funcionais {#fig-appendix-b-logic-blocks}

```tikz
\begin{tikzpicture}[scale=1.25,transform shape]
\draw[thick] (0,0) rectangle (3.2,2.4);
\node at (1.6,1.2) {AND};
\draw[thick] (-1.5,1.7)--(0,1.7);
\draw[thick] (-1.5,0.7)--(0,0.7);
\node[left] at (-1.5,1.7) {$A$};
\node[left] at (-1.5,0.7) {$B$};
\draw[->,thick] (3.2,1.2)--(5.0,1.2);
\node[right] at (5.0,1.2) {$Y=AB$};
\draw[thick] (9,0) rectangle (12.2,2.4);
\node at (10.6,1.2) {NAND};
\draw[thick] (7.5,1.7)--(9,1.7);
\draw[thick] (7.5,0.7)--(9,0.7);
\node[left] at (7.5,1.7) {$A$};
\node[left] at (7.5,0.7) {$B$};
\draw[thick] (12.2,1.2)--(12.5,1.2);
\draw[thick] (12.75,1.2) circle (0.25);
\draw[->,thick] (13.0,1.2)--(15.0,1.2);
\node[right] at (15.0,1.2) {$Y=\overline{AB}$};
\end{tikzpicture}
```

:::

Na figura, a **bolha de saída** representa a inversão que distingue NAND de
AND. Trata-se de uma representação funcional simplificada; para diagramas
normativos, devem ser usados símbolos apropriados à norma selecionada.

## B.5. Diagramas elétricos, conexões e barramentos

Nos esquemas elétricos, uma linha contínua representa uma conexão elétrica, mas
**o cruzamento de duas linhas não implica, por si só, ligação**. Para evitar
ambiguidade, recomenda-se assinalar derivações com um ponto de junção e
desenhar cruzamentos sem conexão de forma inequívoca. Conectores, nomes de
redes e referências de pinos devem ser consistentes.

<!-- prettier-ignore -->
::: figure Junção elétrica e cruzamento sem conexão {#fig-appendix-b-junctions}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape]
\draw[thick] (0,1.6)--(4,1.6);
\draw[thick] (2,0)--(2,3.2);
\fill (2,1.6) circle (2.4pt);
\node[below] at (2,-0.4) {Junção};
\draw[thick] (7,1.6)--(11,1.6);
\draw[thick] (9,0)--(9,1.35);
\draw[thick] (9,1.85)--(9,3.2);
\draw[thick] (9,1.35) arc[start angle=-90,end angle=90,radius=0.25];
\node[below,align=center] at (9,-0.4) {Cruzamento sem conexão};
\end{tikzpicture}
```

:::

Um **barramento** reúne vários sinais relacionados. Adota-se a notação
`DATA[7:0]` para oito bits indexados de 7 a 0; `DATA[0]` é o bit de índice
zero. Essa escrita **não determina** por si só a ordem de transmissão dos bits,
o _endianness_ dos bytes ou a polaridade elétrica. A ordem dos bits e dos bytes
deve ser declarada na especificação da interface.

Nomes de redes usuais incluem `VDD`, `GND`, `CLK`, `RESET_n`, `ADDR`, `DATA`,
`WE_n` e `OE_n`. Nomes semelhantes não garantem equivalência elétrica entre
dispositivos de famílias distintas.

## B.6. Símbolos de elementos sequenciais

Registradores, _latches_, flip-flops, contadores e memórias são representados
como blocos funcionais quando o objetivo é destacar entradas, saídas e sinais
de controle.

| Identificação      | Significado                                                |
| ------------------ | ---------------------------------------------------------- |
| `D`                | Entrada de dados de um flip-flop tipo D                    |
| `Q`                | Saída armazenada                                           |
| $\overline Q$      | Saída complementar, quando disponível                      |
| `CLK`              | Entrada de relógio                                         |
| `EN`               | Habilitação                                                |
| `RESET`, `RESET_n` | Reinicialização ativa em alto ou em baixo, respectivamente |
| `SET`, `SET_n`     | Ajuste para 1, com polaridade indicada                     |
| `CE`               | Habilitação de relógio ou de operação, conforme componente |

O triângulo junto à entrada de relógio indica sensibilidade a borda; combinado
com uma bolha, costuma indicar borda de descida. Um _latch_ sensível a nível e
um flip-flop sensível a borda não são intercambiáveis. Além da polaridade, é
indispensável declarar se _reset_ e _set_ são **síncronos ou assíncronos**.

<!-- prettier-ignore -->
::: figure Representação funcional de um flip-flop tipo D {#fig-appendix-b-d-flipflop}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (0,0) rectangle (3.6,3.2);
\node at (1.8,2.8) {FF tipo D};
\draw[->,thick] (-2,2.1)--(0,2.1);
\node[above] at (-1.1,2.1) {$D$};
\draw[->,thick] (-2,0.8)--(0,0.8);
\node[above] at (-1.1,0.8) {$CLK$};
\draw[thick] (0,0.5)--(0.35,0.8)--(0,1.1);
\draw[->,thick] (3.6,2.1)--(5.6,2.1);
\node[above] at (4.6,2.1) {$Q$};
\node[below,align=center] at (1.8,-0.5) {Acionamento por borda de subida};
\end{tikzpicture}
```

:::

A figura apresenta apenas o comportamento de captura de dados; não especifica
tempos de _setup_, _hold_, atraso de propagação nem condição de inicialização.

## B.7. Diagramas de estados e fluxogramas

Em uma **máquina de estados finitos (FSM)**, cada estado deve ter um
identificador estável, e as setas representam transições condicionadas por
entradas ou eventos. Para máquinas de Moore, as saídas são associadas aos
estados; para máquinas de Mealy, às transições ou à combinação de estado e
entrada.

Uma notação recomendada para rótulos de transição é `condição / ação`, quando
houver ação associada. A ausência de rótulo deve ser explicada no texto. O
estado inicial pode ser indicado por uma seta proveniente de um ponto sem
estado. Condições de transição devem ser completas e, em sistemas
determinísticos, não ambíguas.

Em fluxogramas de algoritmos, os símbolos representam **passos de processamento
e decisões**, não necessariamente estados de hardware. A distinção importa: um
fluxograma sequencial não demonstra, sozinho, que o circuito pode ser
implementado como FSM síncrona.

## B.8. Diagramas temporais e bordas de relógio

Nos diagramas temporais, o tempo cresce da esquerda para a direita. Uma forma
de onda digital idealizada representa estados lógicos; os tempos reais de
subida e descida não são nulos. As transições podem ocorrer após atrasos de
propagação e não devem ser interpretadas como instantâneas em circuitos
físicos.

| Símbolo   | Interpretação usual                                       |
| --------- | --------------------------------------------------------- |
| $T_{clk}$ | Período do relógio                                        |
| $f_{clk}$ | Frequência do relógio, $1/T_{clk}$                        |
| $t_{PLH}$ | Atraso de propagação de saída de baixo para alto          |
| $t_{PHL}$ | Atraso de propagação de saída de alto para baixo          |
| $t_{su}$  | Tempo mínimo de preparação (_setup_)                      |
| $t_h$     | Tempo mínimo de manutenção (_hold_)                       |
| $t_{pd}$  | Atraso de propagação, quando não discriminado por direção |

<!-- prettier-ignore -->
::: figure Janela de preparação e manutenção de dados em torno da borda de amostragem {#fig-appendix-b-setup-hold}

```tikz
\begin{tikzpicture}[scale=1.45,transform shape]
\draw[->] (0,0)--(11.5,0) node[right] {$t$};
\draw[thick] (0,3)--(5.5,3)--(5.5,4)--(9,4)--(9,3)--(11,3);
\node[left] at (0,3.5) {$CLK$};
\draw[thick] (0,1.5)--(3.8,1.5)--(4.3,2.2)--(8,2.2)--(8.5,1.5)--(11,1.5);
\node[left] at (0,1.9) {$D$};
\draw[dashed] (5.5,0.25)--(5.5,4.65);
\node[above] at (5.5,4.65) {Borda de amostragem};
\draw[<->] (4.3,1.0)--(5.5,1.0);
\node[below] at (4.9,1.0) {$t_{su}$};
\draw[<->] (5.5,1.0)--(8,1.0);
\node[below] at (6.75,1.0) {$t_h$};
\end{tikzpicture}
```

:::

**Observação:** a figura é esquemática e destaca a estabilidade dos dados em
torno de uma borda de referência; os intervalos indicados não estão em escala e
não representam valores de um dispositivo específico. Na análise de
temporização, os instantes de captura, os atrasos do caminho de dados e a
incerteza do relógio devem ser considerados em conjunto.

## B.9. Tabelas-verdade, tabelas de estados e condições indiferentes

Uma **tabela-verdade** descreve o comportamento combinacional para cada
combinação relevante de entradas. Uma **tabela de transição de estados**
acrescenta estado presente e próximo estado. Uma **tabela de excitação** indica
entradas necessárias para provocar uma transição em determinado elemento
sequencial.

| Tipo de tabela         | Colunas típicas                                         | Uso                                   |
| ---------------------- | ------------------------------------------------------- | ------------------------------------- |
| Tabela-verdade         | Entradas, saídas                                        | Definição e verificação combinacional |
| Tabela de estados      | Estado presente, entradas, próximo estado, saídas       | Especificação de FSM                  |
| Tabela de excitação    | Estado presente, estado seguinte, entradas de excitação | Síntese com flip-flops                |
| Tabela de temporização | Evento, condição, intervalo                             | Restrições de funcionamento           |

Em tabelas de minimização, uma condição indiferente pode ser usada como 0 ou 1
para simplificar uma expressão, **somente** quando a especificação funcional
permitir. Combinações impossíveis no modelo lógico podem tornar-se transitórias
ou alcançáveis por falhas físicas; o tratamento de segurança deve ser
explicitado.

## B.10. Numeração, representação de dados e convenções de código

Para distinguir bases numéricas em texto matemático, utiliza-se
preferencialmente o subscrito: $(1011)_2$, $(27)*8$, $(2F)*{16}$ e $(47)_{10}$.
Em código e documentação de registradores, são comuns os prefixos `0b` e `0x`,
como `0b1011` e `0x2F`. A interpretação de números com sinal requer declarar
largura e representação (por exemplo, complemento de dois de oito bits).

A notação `DATA[7:0]` denota uma faixa de índices. A concatenação em HDL, como
`{a, b}`, e a replicação, como `{4{1'b0}}`, pertencem à sintaxe da linguagem e
não devem ser confundidas com conjuntos matemáticos. Para valores literais
Verilog, `8'b10100101` indica explicitamente largura de oito bits e base
binária.

Em exemplos de código, adotam-se nomes de sinais em inglês para facilitar a
correspondência com folhas de dados e ferramentas de desenvolvimento; a
explicação conceitual permanece em português. Nomes e estilos de HDL podem
variar, mas **largura, sinal, borda ativa e polaridade** devem permanecer
inequívocos.

## B.11. Diagramas de blocos, hierarquia e interfaces

Diagramas de blocos representam **funções e relações**, não necessariamente
componentes físicos separados. Uma seta pode representar fluxo de dados,
controle ou dependência; a legenda deve indicar qual interpretação se aplica.
Sinais bidirecionais devem ser identificados explicitamente, assim como os
domínios de relógio e os pontos de sincronização.

Recomenda-se que cada diagrama apresente, quando pertinente: (1) entradas e
saídas; (2) nomes dos blocos; (3) sentido dos sinais; (4) largura dos
barramentos; (5) relógio e reset; (6) domínio de alimentação; e (7) legenda
para sinais ativos em nível baixo.

Na descrição de interfaces, distinguir:

- **Lógica do protocolo:** significado de comandos, dados, endereços e
  confirmações.
- **Temporização:** quando cada sinal deve ser amostrado ou alterado.
- **Camada elétrica:** níveis, impedâncias, terminação e topologia física.

Uma mesma função lógica pode exigir adaptações elétricas distintas em TTL,
CMOS, LVTTL, LVCMOS ou sinalização diferencial. A simbologia funcional não
substitui a análise da interface elétrica.

## B.12. Convenções para figuras, equações e referências cruzadas

Os títulos de figuras e tabelas devem identificar seu conteúdo sem depender
exclusivamente do parágrafo anterior. Quando uma ilustração for simplificada,
isso deve ser informado na legenda ou no texto. A obra utiliza identificadores
estáveis em inglês e minúsculas para referências cruzadas, por exemplo:

````markdown
<!-- prettier-ignore -->
::: figure Representação funcional de um circuito {#fig-appendix-b-example}

```tikz
% Código TikZ da figura
```

:::
````

O trecho anterior é apenas um **modelo de sintaxe**. Os identificadores reais
devem ser únicos em toda a obra. Equações e tabelas devem seguir as convenções
da ferramenta de publicação utilizada; referências internas devem apontar para
o identificador, e não depender de numeração manual suscetível a mudanças
editoriais.

Na produção de diagramas TikZ para o MathJSLab, convém preferir comandos
explícitos e construções suportadas pelo ambiente de renderização. Em
particular, textos de nós devem ser escritos entre chaves, como em
`\node at (0,0) {Texto};`. Recursos próprios de CircuiTikZ não devem ser
utilizados em um ambiente TikZ puro sem a biblioteca correspondente.

## B.13. Checklist de leitura e documentação

Antes de interpretar ou publicar um esquema, é recomendável verificar:

1. **Polaridade:** sinais ativos em baixo estão identificados?
2. **Unidades:** valores elétricos e temporais estão acompanhados das unidades
   corretas?
3. **Largura:** barramentos e registradores indicam quantidade de bits?
4. **Temporização:** bordas de amostragem, atrasos e domínios de relógio estão
   claros?
5. **Conexões:** junções e cruzamentos estão desenhados sem ambiguidade?
6. **Estados especiais:** `X`, `Z` e condições indiferentes estão sendo usados
   corretamente?
7. **Modelo:** o desenho é lógico, funcional, elétrico ou temporal?
8. **Escopo:** simplificações e hipóteses estão declaradas?

**Exemplo de leitura integrada.** Considere um registrador de oito bits, com
entrada `DATA[7:0]`, relógio `CLK` e reset `RESET_n`. A representação indica
largura de dados e reset ativo em nível baixo, mas **não** informa,
isoladamente, se o reset é síncrono ou assíncrono, se a captura ocorre na borda
de subida ou de descida e qual é o valor de inicialização. Essas propriedades
precisam constar no símbolo, no diagrama temporal ou na especificação textual.

## B.14. Leituras complementares

- **IEEE Std 91 / IEC 60617:** referências históricas e normativas para
  simbologia de funções lógicas e diagramas eletrotécnicos, conforme edição
  aplicável.
- **IEC 80000:** grandezas e unidades utilizadas em ciência e tecnologia.
- **IEEE Std 1800:** linguagem SystemVerilog, incluindo tipos, literais e
  semântica de valores lógicos.
- **IEEE Std 1076:** linguagem VHDL, com convenções próprias de sinais e tipos.
- **Manuais e folhas de dados dos fabricantes:** fonte primária para
  polaridade, níveis elétricos, temporização, pinagem e condições de operação
  de dispositivos específicos.

As normas citadas devem ser consultadas em suas edições vigentes quando o
objetivo for conformidade técnica. Este apêndice é uma síntese pedagógica e não
reproduz integralmente nenhuma norma.
