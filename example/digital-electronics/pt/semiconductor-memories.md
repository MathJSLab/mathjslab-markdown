# 16. Memórias semicondutoras {#chapter-16}

A memória é um componente essencial dos sistemas digitais: permite conservar
instruções, dados, resultados intermediários e informações de configuração.
Diferentemente de um circuito combinacional, cuja saída depende das entradas
presentes, um dispositivo de memória mantém informação associada a um estado
físico. Essa propriedade pode persistir apenas enquanto há alimentação ou
permanecer mesmo após sua interrupção.

Este capítulo apresenta a organização lógica e os princípios físicos das
principais memórias semicondutoras. Serão estudados o endereçamento, as células
de armazenamento, as tecnologias voláteis e não voláteis, os sinais de
controle, os ciclos de acesso e a expansão de capacidade. As especificações
elétricas e temporais devem sempre ser confirmadas na folha de dados do
dispositivo empregado.

## 16.1. Organização e endereçamento {#sec-memory-organization}

Uma memória pode ser descrita como um conjunto de **posições endereçáveis**.
Cada posição contém uma palavra com determinado número de bits. Uma memória
organizada em $N$ palavras de $W$ bits possui capacidade lógica de
armazenamento

$$
C=N\,W\quad\text{bits}. \tag{16.1}
$$

Quando todos os endereços binários de um barramento de $A$ bits são utilizados,
há

$$
N=2^A,\qquad C=2^A W. \tag{16.2}
$$

Assim, uma memória de $2^{12}$ palavras de 8 bits armazena $4096$ bytes, ou
$4\,\mathrm{KiB}$. A notação **KiB** corresponde a $2^{10}$ bytes, enquanto
**kB** corresponde a $10^3$ bytes. Essa distinção evita ambiguidades nas
especificações de capacidade.

O endereço identifica a posição, não necessariamente um byte. Em uma memória
organizada por palavras de 16 bits, cada endereço pode selecionar uma palavra
de dois bytes; em sistemas endereçados por byte, dois endereços consecutivos
são necessários para identificar os mesmos dois bytes.

<!-- prettier-ignore -->
::: figure Organização lógica de uma memória com endereços e palavras {#fig-memory-addressed-array}

```tikz
\begin{tikzpicture}[scale=2.7,transform shape]
\draw[thick] (2,0) rectangle (6,4.8);
\foreach \y in {0.6,1.2,1.8,2.4,3.0,3.6,4.2}{
  \draw (2,\y)--(6,\y);
}
\draw[dashed] (4,0)--(4,4.8);
\node at (3,4.5) {$0$};
\node at (3,3.9) {$1$};
\node at (3,3.3) {$2$};
\node at (3,2.7) {$3$};
\node at (3,2.1) {$\vdots$};
\node at (3,1.5) {$N-3$};
\node at (3,0.9) {$N-2$};
\node at (3,0.3) {$N-1$};
\node at (5,4.5) {$W$ bits};
\node[above] at (3,4.95) {Endereço};
\node[above] at (5,4.95) {Palavra};
\draw[->] (0,3.9)--(1.9,3.9);
\node[above] at (0.95,3.9) {$A$ bits};
\draw[->] (6.1,3.9)--(8,3.9);
\node[above] at (7,3.9) {Dados};
\end{tikzpicture}
```

:::

A {@ref fig-memory-addressed-array} mostra uma organização abstrata. Os
endereços são decodificados internamente para selecionar linhas, colunas ou
grupos de células; não correspondem necessariamente a uma disposição física
linear.

::: table Unidades e exemplos de organização {#tbl-memory-units .full-width}

| Organização             | Endereços | Largura |         Capacidade |
| ----------------------- | --------: | ------: | -----------------: |
| $1\,\mathrm{K}\times8$  |    $1024$ |  8 bits |  $1\,\mathrm{KiB}$ |
| $4\,\mathrm{K}\times16$ |    $4096$ | 16 bits |  $8\,\mathrm{KiB}$ |
| $64\,\mathrm{K}\times8$ |   $65536$ |  8 bits | $64\,\mathrm{KiB}$ |
| $1\,\mathrm{M}\times32$ |  $2^{20}$ | 32 bits |  $4\,\mathrm{MiB}$ |

:::

::: example Dimensionamento de uma memória {#ex-memory-capacity}

Uma memória possui 15 linhas de endereço e 16 linhas de dados. Admitindo todos
os endereços válidos, ela contém $2^{15}=32768$ palavras. Sua capacidade é
$32768\times16=524288$ bits, equivalentes a $64\,\mathrm{KiB}$.

:::

## 16.2. Células de memória {#sec-memory-cells}

Uma **célula de memória** armazena uma quantidade elementar de informação,
geralmente um bit. O armazenamento pode resultar da realimentação regenerativa
entre transistores, da carga elétrica de um capacitor ou de um estado de carga
retida em uma estrutura isolante.

Na **célula estática**, dois estados estáveis de um circuito realimentado
representam os valores binários. Em uma SRAM CMOS convencional, uma célula de
seis transistores (6T) utiliza dois inversores cruzados e dois transistores de
acesso. A informação é preservada enquanto a alimentação permanecer adequada,
sem necessidade de atualização periódica.

Na **célula dinâmica**, um capacitor armazena carga e um transistor controla
seu acesso. Como a carga sofre perdas, o conteúdo deve ser periodicamente
restaurado. A leitura típica de DRAM altera a carga da célula e exige
restauração após a detecção.

<!-- prettier-ignore -->
::: figure Comparação conceitual entre armazenamento estático e dinâmico {#fig-memory-cell-principles}

```tikz
\begin{tikzpicture}[scale=2.6,transform shape]

% Bloco da célula estática
\draw[thick] (0,0.3) rectangle (3.2,3.5);
\node[align=center] at (1.6,3.1) {Célula estática};

% Inversores cruzados
\draw[thick] (0.6,1.65) rectangle (1.35,2.5);
\draw[thick] (1.85,1.65) rectangle (2.6,2.5);

\node at (0.975,2.08) {INV};
\node at (2.225,2.08) {INV};

\draw[->] (1.35,2.3)--(1.85,2.3);
\draw[->] (1.85,1.85)--(1.35,1.85);

% Bloco da célula dinâmica
\draw[thick] (4.2,0.3) rectangle (7.4,3.5);
\node[align=center] at (5.8,3.1) {Célula dinâmica};

% Transistor de acesso
\draw (4.6,2.1)--(5.3,2.1);
\draw[thick] (5.3,1.8) rectangle (6.0,2.4);
\node at (5.65,2.1) {T};

% Capacitor de armazenamento
\draw (6.0,2.1)--(6.6,2.1)--(6.6,1.75);
\draw (6.3,1.75)--(6.9,1.75);
\draw (6.3,1.55)--(6.9,1.55);

% Identificação do capacitor
\node at (6.6,1.05) {$C$};

\end{tikzpicture}
```

:::

A {@ref fig-memory-cell-principles} compara apenas os princípios de retenção: a
representação de inversores cruzados não mostra os transistores de acesso da
SRAM, e a célula dinâmica é ilustrada de forma funcional, não como um esquema
completo de DRAM.

Além da célula, uma memória real incorpora decodificadores, amplificadores de
leitura, circuitos de escrita, temporização e interfaces de entrada e saída. Em
muitos dispositivos, esses circuitos ocupam parcela relevante da área do chip.

## 16.3. Memórias ROM, PROM, EPROM e EEPROM {#sec-memory-rom}

As memórias **somente de leitura** (_read-only memory_, ROM) são destinadas ao
armazenamento de dados que, durante a operação normal do sistema, não precisam
ser alterados com frequência. A expressão designa uma função de uso; algumas
tecnologias permitem reprogramação em condições específicas.

- **ROM de máscara:** conteúdo definido durante a fabricação do circuito
  integrado.
- **PROM:** memória programável uma única vez, conforme a tecnologia empregada.
- **EPROM:** memória apagável por exposição apropriada à radiação ultravioleta,
  em encapsulamentos que permitem esse procedimento, e posteriormente
  reprogramável.
- **EEPROM:** memória eletricamente apagável e programável, frequentemente com
  granularidade de alteração menor que a de uma memória Flash.

A persistência sem alimentação caracteriza essas tecnologias como **não
voláteis**. Entretanto, não volatilidade não significa retenção ilimitada:
tempo, temperatura, desgaste de programação e condições elétricas podem afetar
a confiabilidade.

<!-- prettier-ignore -->
::: table Comparação de memórias não voláteis tradicionais {#tbl-memory-rom-types .full-width}

| Tecnologia     | Programação   | Apagamento                              | Característica principal                 |
| -------------- | ------------- | --------------------------------------- | ---------------------------------------- |
| ROM de máscara | Na fabricação | Não disponível ao usuário               | Conteúdo fixo                            |
| PROM           | Uma vez       | Não disponível                          | Personalização após fabricação           |
| EPROM          | Elétrica      | Ultravioleta, no dispositivo apropriado | Reutilização com remoção para apagamento |
| EEPROM         | Elétrica      | Elétrico                                | Alteração sem exposição à luz            |
| Flash          | Elétrica      | Elétrico, tipicamente por blocos        | Alta densidade de armazenamento          |

:::

Em aplicações embarcadas, dados de calibração, parâmetros de configuração e
programas podem ser armazenados em EEPROM ou Flash, conforme a capacidade e a
frequência de atualização exigidas.

## 16.4. Memórias SRAM e DRAM {#sec-memory-sram-dram}

A **SRAM** (_static random-access memory_) utiliza células bistáveis. Oferece
acesso rápido e dispensa atualização periódica de dados, mas a célula típica
requer mais transistores e área que uma célula DRAM. É amplamente empregada em
caches, buffers e pequenas memórias internas.

A **DRAM** (_dynamic random-access memory_) utiliza células capacitivas de
elevada densidade. Exige operações de atualização (_refresh_) e possui
procedimentos específicos de ativação de linhas, leitura, escrita e pré-carga.
Sua maior densidade a torna adequada a memórias principais de grande
capacidade.

O termo _random-access_ significa que diferentes posições podem ser
selecionadas sem percorrer sequencialmente todas as anteriores. Não implica que
todos os acessos apresentem exatamente a mesma latência: a organização em
bancos e linhas, especialmente na DRAM, influencia o tempo efetivo.

<!-- prettier-ignore -->
::: table Comparação geral entre SRAM e DRAM {#tbl-memory-sram-dram .full-width}

| Propriedade                | SRAM                   | DRAM              |
| -------------------------- | ---------------------- | ----------------- |
| Princípio de armazenamento | Realimentação bistável | Carga capacitiva  |
| Atualização periódica      | Não                    | Sim               |
| Densidade típica           | Menor                  | Maior             |
| Complexidade de célula     | Maior                  | Menor             |
| Uso frequente              | Cache e buffers        | Memória principal |
| Volatilidade               | Volátil                | Volátil           |

:::

As expressões “mais rápida” ou “mais barata” devem ser contextualizadas:
desempenho, custo por bit e consumo dependem do processo de fabricação, da
capacidade, da interface e das condições de operação.

## 16.5. Memórias Flash {#sec-memory-flash}

A memória **Flash** é uma forma de armazenamento não volátil eletricamente
reprogramável. Seu funcionamento depende de dispositivos cuja carga armazenada
modifica o comportamento elétrico de leitura. A programação e o apagamento
envolvem mecanismos físicos diferentes dos empregados em SRAM e DRAM.

Duas organizações são particularmente relevantes:

- **NOR Flash:** favorece acesso aleatório de leitura e, em certas interfaces,
  execução direta de código (_execute in place_, XIP).
- **NAND Flash:** favorece elevada densidade e armazenamento em páginas e
  blocos, sendo comum em unidades de estado sólido e cartões de memória.

A programação costuma ocorrer em unidades menores que as de apagamento. Em NAND
Flash, por exemplo, dados são normalmente programados em páginas e apagados em
blocos. A tentativa de regravar livremente um endereço, como em SRAM, não
corresponde ao modelo físico de operação.

O desgaste por ciclos de programação e apagamento, os erros de leitura e a
retenção de carga tornam necessários mecanismos como correção de erros (ECC),
gerenciamento de blocos defeituosos e distribuição de desgaste (_wear
leveling_). Esses mecanismos podem ser implementados no controlador ou em
outras camadas do sistema.

<!-- prettier-ignore -->
::: table Características comparativas de NOR e NAND Flash {#tbl-memory-flash .full-width}

| Aspecto                | NOR Flash                                     | NAND Flash                     |
| ---------------------- | --------------------------------------------- | ------------------------------ |
| Uso típico             | Firmware e código                             | Armazenamento de massa         |
| Acesso de leitura      | Pode permitir acesso aleatório direto         | Geralmente orientado a páginas |
| Densidade usual        | Menor                                         | Maior                          |
| Apagamento             | Por setores ou blocos, conforme o dispositivo | Por blocos                     |
| Gerenciamento de erros | Depende do dispositivo                        | Frequentemente essencial       |

:::

## 16.6. Organização em palavras e bancos {#sec-memory-banks}

Uma memória física pode ser construída a partir de vários circuitos integrados.
A associação **em paralelo de largura** aumenta o número de bits de cada
palavra; a associação **em profundidade** aumenta o número de endereços
disponíveis.

Para obter palavras de 16 bits usando dispositivos de $8$ bits, dois circuitos
podem compartilhar endereços e sinais de controle, fornecendo metade da palavra
cada um. Para duplicar a quantidade de posições, bancos distintos podem ser
selecionados por um bit adicional de endereço.

<!-- prettier-ignore -->
::: figure Expansão da largura de palavra com duas memórias de oito bits {#fig-memory-width-expansion}

```tikz
\begin{tikzpicture}[scale=2.6,transform shape]
\draw[thick] (2,2) rectangle (4.2,4.2);
\draw[thick] (5.3,2) rectangle (7.5,4.2);
\node[align=center] at (3.1,3.1) {Memória\\$8$ bits};
\node[align=center] at (6.4,3.1) {Memória\\$8$ bits};
\draw (0.2,5.15)--(6.4,5.15);
\draw[->] (3.1,5.15)--(3.1,4.2);
\draw[->] (6.4,5.15)--(6.4,4.2);
\node[above] at (0.9,5.15) {Endereço $A$};
\draw[->] (3.1,2)--(3.1,0.9);
\draw[->] (6.4,2)--(6.4,0.9);
\node[below] at (3.1,0.9) {$D[7:0]$};
\node[below] at (6.4,0.9) {$D[15:8]$};
\end{tikzpicture}
```

:::

A {@ref fig-memory-width-expansion} representa a divisão de uma palavra de 16
bits em dois grupos de 8 bits. Os sinais de controle, omitidos para
simplificar, devem ser coordenados para que os dois dispositivos correspondam
ao mesmo endereço lógico.

::: example Expansão de capacidade {#ex-memory-expansion}

Deseja-se construir uma memória de $16\,\mathrm{K}\times16$ a partir de
dispositivos de $4\,\mathrm{K}\times8$. São necessários dois dispositivos em
paralelo para obter 16 bits por palavra e quatro grupos em profundidade para
obter $16\,\mathrm{K}$ posições. Portanto, são necessários $2\times4=8$
dispositivos.

:::

## 16.7. Barramentos de endereço, dados e controle {#sec-memory-buses}

O **barramento de endereço** seleciona a posição lógica de acesso. O
**barramento de dados** transporta a informação lida ou escrita. O **barramento
de controle** define a operação e, em muitos dispositivos, habilita a saída ou
o circuito integrado.

Em memórias assíncronas paralelas, são comuns sinais como:

- **CE** ou **CS** (_chip enable/select_): habilitação ou seleção do circuito;
- **OE** (_output enable_): habilitação dos drivers de saída;
- **WE** (_write enable_): comando de escrita.

A polaridade varia conforme o componente. Um nome como $\overline{CE}$ indica,
pela convenção usual, ativação em nível baixo. A interpretação correta depende
da folha de dados e dos diagramas temporais.

<!-- prettier-ignore -->
::: figure Interface funcional de uma memória paralela {#fig-memory-parallel-interface}

```tikz
\begin{tikzpicture}[scale=2.7,transform shape]
\draw[thick] (3,0.6) rectangle (6.5,5.4);
\node[align=center] at (4.75,3) {Memória\\semicondutora};
\draw[->] (0,4.7)--(3,4.7);
\node[above] at (1.5,4.7) {$A[m-1:0]$};
\draw[<->] (0,3.6)--(3,3.6);
\node[above] at (1.5,3.6) {$D[W-1:0]$};
\draw[->] (0,2.3)--(3,2.3);
\draw[->] (0,1.6)--(3,1.6);
\draw[->] (0,0.9)--(3,0.9);
\node[above] at (1.5,2.3) {$CE$};
\node[above] at (1.5,1.6) {$OE$};
\node[above] at (1.5,0.9) {$WE$};
\end{tikzpicture}
```

:::

Na {@ref fig-memory-parallel-interface}, o barramento de dados é bidirecional
para representar uma memória de leitura e escrita. Em ROMs, a interface de
dados pode ser somente de saída; em memórias seriais, endereço, dados e
comandos podem compartilhar linhas físicas.

A presença de vários dispositivos em um barramento exige evitar contenção: duas
saídas não devem dirigir simultaneamente valores opostos sobre a mesma linha.
Saídas de três estados e seleção apropriada são mecanismos usuais de
compartilhamento.

## 16.8. Ciclos de leitura e escrita {#sec-memory-read-write}

Um **ciclo de leitura** solicita o conteúdo de um endereço. Em uma memória
assíncrona paralela típica, o controlador estabiliza o endereço, seleciona o
dispositivo e habilita a saída. Após os atrasos especificados, os dados
tornam-se válidos.

Um **ciclo de escrita** fornece endereço e dados e aplica a condição de
controle exigida. Para que a escrita seja confiável, devem ser respeitados os
tempos de preparação (_setup_), manutenção (_hold_) e duração do pulso de
escrita.

As condições de habilitação variam conforme a família. A tabela seguinte é
apenas um exemplo funcional de memória assíncrona com sinais ativos em nível
baixo, não uma especificação universal.

<!-- prettier-ignore -->
::: table Exemplo de comandos de memória assíncrona {#tbl-memory-control .full-width}

| $\overline{CE}$ | $\overline{OE}$ | $\overline{WE}$ | Operação típica    |
| :-------------: | :-------------: | :-------------: | ------------------ |
|        1        |        X        |        X        | Não selecionada    |
|        0        |        0        |        1        | Leitura            |
|        0        |        X        |        0        | Escrita            |
|        0        |        1        |        1        | Saída desabilitada |

:::

A letra **X** indica condição indiferente para a operação descrita, desde que
não haja restrições adicionais na folha de dados. Durante uma escrita, o estado
elétrico dos pinos de dados deve corresponder à direção definida pelo
dispositivo.

## 16.9. Temporização e desempenho {#sec-memory-timing}

As memórias apresentam diferentes medidas de tempo. Em uma SRAM assíncrona, o
**tempo de acesso por endereço** $t_{AA}$ representa o intervalo máximo entre a
estabilização do endereço e a validade dos dados, nas condições especificadas.
Também podem existir tempos relativos à seleção do chip ($t_{CE}$) e à
habilitação da saída ($t_{OE}$).

Se os três eventos ocorrerem em instantes diferentes, uma estimativa
conservadora para o instante em que os dados se tornam válidos é

$$
t_{\mathrm{válido}}\ge
\max\!\left(t_A+t_{AA},\,t_{CE,\mathrm{evento}}+t_{CE},\,
t_{OE,\mathrm{evento}}+t_{OE}\right). \tag{16.3}
$$

A expressão pressupõe que as demais condições de leitura estejam satisfeitas; a
nomenclatura e as relações precisas devem ser verificadas no componente real.

O **tempo de ciclo** é o intervalo mínimo entre operações sucessivas de
determinado tipo. Pode ser maior que o tempo de acesso, pois inclui
recuperação, pré-carga ou outras restrições. Em DRAM, latências como CAS, RAS e
tempos de pré-carga dependem do protocolo e do estado do banco.

::: example Estimativa de acesso {#ex-memory-access}

Uma memória especifica $t_{AA}=45\,\mathrm{ns}$, $t_{CE}=40\,\mathrm{ns}$ e
$t_{OE}=20\,\mathrm{ns}$. Se endereço, seleção e habilitação de saída se tornam
válidos simultaneamente, os dados estarão válidos, no pior caso, após o maior
dos três atrasos: $45\,\mathrm{ns}$. Isso não significa que operações
sucessivas possam necessariamente ocorrer a cada $45\,\mathrm{ns}$.

:::

A **largura de banda teórica** de uma interface que transfere $W$ bits por
operação a uma taxa de $f$ operações por segundo é

$$
B=\frac{Wf}{8}\quad\text{bytes/s}. \tag{16.4}
$$

O desempenho sustentado costuma ser inferior, devido a comandos, esperas,
alternância de direção, atualização e outros custos de protocolo.

## 16.10. Memórias síncronas e assíncronas {#sec-memory-sync-async}

Uma memória **assíncrona** realiza operações controladas por níveis e
transições de sinais, sem exigir que cada acesso seja iniciado por uma borda de
relógio comum. Uma memória **síncrona** coordena comandos, endereços e/ou
transferências com um sinal de relógio.

A classificação diz respeito à **interface de acesso**, não à volatilidade.
Existem memórias voláteis e não voláteis com diferentes tipos de interface.

Nas interfaces síncronas, uma operação pode ser solicitada em uma borda e
produzir dados após uma latência definida em ciclos. Interfaces modernas também
podem transferir dados em rajadas (_bursts_), permitindo elevada taxa de
transferência após o início do acesso.

<!-- prettier-ignore -->
::: figure Comparação conceitual entre acesso assíncrono e síncrono {#fig-memory-access-comparison}

```tikz
\begin{tikzpicture}[scale=2.5,transform shape]
\node[left] at (0,3.4) {Assíncrona};
\draw[->] (0,3.0)--(8,3.0) node[right] {$t$};
\draw[thick] (0.5,3.4)--(2,3.4)--(2,3.8)--(4.4,3.8)--(4.4,3.4)--(7.5,3.4);
\node[above] at (3.2,3.8) {Endereço estável};
\draw[thick] (0.5,2.4)--(3.4,2.4)--(3.4,2.8)--(7.5,2.8);
\node[above] at (6.2,2.8) {Dados válidos};
\node[left] at (0,1.45) {Síncrona};
\draw[->] (0,1.0)--(8,1.0) node[right] {$t$};
\draw[thick] (0.5,1.45)--(1.3,1.45)--(1.3,1.85)--(2.1,1.85)--(2.1,1.45)
--(2.9,1.45)--(2.9,1.85)--(3.7,1.85)--(3.7,1.45)
--(4.5,1.45)--(4.5,1.85)--(5.3,1.85)--(5.3,1.45)
--(6.1,1.45)--(6.1,1.85)--(6.9,1.85)--(6.9,1.45);
\node[above] at (7.15,1.85) {$CLK$};
\draw[thick] (0.5,0.45)--(4.5,0.45)--(4.5,0.8)--(7.5,0.8);
\node[above] at (6.3,0.8) {Dados válidos};
\end{tikzpicture}
```

:::

A {@ref fig-memory-access-comparison} é ilustrativa e não está em escala. O
atraso assíncrono depende dos sinais de controle e do endereço; o exemplo
síncrono mostra dados disponíveis após bordas de relógio, sem especificar um
protocolo ou uma latência particular.

## 16.11. Seleção e expansão de memórias {#sec-memory-selection}

A seleção de um dispositivo deve considerar capacidade, largura de palavra,
latência, largura de banda, tensão de alimentação, consumo, volatilidade,
retenção, resistência à reprogramação, encapsulamento e disponibilidade. Em
sistemas com requisitos de segurança ou confiabilidade, devem ser avaliadas
também integridade de dados, ECC e condições ambientais.

Para expandir a **profundidade**, o controlador pode utilizar bits mais
significativos do endereço para selecionar um entre vários bancos. Para
expandir a **largura**, vários dispositivos respondem ao mesmo endereço e
fornecem segmentos distintos da palavra.

<!-- prettier-ignore -->
::: figure Seleção de dois bancos de memória por bit de endereço {#fig-memory-bank-selection}

```tikz
\begin{tikzpicture}[scale=2.6,transform shape]

% Bancos de memória
\draw[thick] (6.0,3.1) rectangle (8.7,4.8);
\draw[thick] (6.0,0.6) rectangle (8.7,2.3);

\node at (7.35,3.95) {Banco 0};
\node at (7.35,1.45) {Banco 1};

% Decodificador
\draw[thick] (1.3,2.15) rectangle (3.7,3.25);
\node at (2.5,2.7) {Decodificador};

% Entrada de endereço
\draw[->] (0,2.7)--(1.3,2.7);
\node[above] at (0.65,2.7) {$A_k$};

% Seleção do Banco 0
\draw[->] (3.7,2.95)
  -- (4.5,2.95)
  -- (4.5,3.95)
  -- (6.0,3.95);

\node[above] at (5.25,3.95) {$CS_0$};

% Seleção do Banco 1
\draw[->] (3.7,2.45)
  -- (4.2,2.45)
  -- (4.2,1.45)
  -- (6.0,1.45);

\node[above] at (5.1,1.45) {$CS_1$};

% Saídas de dados
\draw[->] (8.7,3.95)--(9.9,3.95);
\node[right] at (9.9,3.95) {Dados};

\draw[->] (8.7,1.45)--(9.9,1.45);
\node[right] at (9.9,1.45) {Dados};

\end{tikzpicture}
```

:::

A {@ref fig-memory-bank-selection} destaca apenas a seleção dos bancos. Na
implementação, os bits inferiores do endereço são compartilhados, e o
barramento de dados deve ser conectado de forma a evitar conflitos entre
saídas. Os sinais de seleção podem ser ativos em nível alto ou baixo conforme
os dispositivos.

::: example Expansão de profundidade {#ex-memory-depth}

Duas memórias de $8\,\mathrm{K}\times8$ podem formar uma organização de
$16\,\mathrm{K}\times8$. As 13 linhas de endereço menos significativas
selecionam uma das $8192$ posições dentro de cada dispositivo; o 14º bit de
endereço seleciona o banco. O controlador deve assegurar que apenas o banco
selecionado dirija o barramento durante a leitura.

:::

## Síntese do capítulo {#sec-memory-summary}

As memórias semicondutoras combinam células físicas de armazenamento com
circuitos de endereçamento, leitura, escrita e controle. A capacidade depende
do número de palavras e de sua largura; o comportamento temporal depende tanto
da tecnologia quanto da interface. SRAM e DRAM são voláteis, mas diferem em
estrutura e necessidade de atualização. ROM, EEPROM e Flash permitem retenção
sem alimentação, com diferentes formas e granularidades de programação.

O dimensionamento de uma memória em um sistema digital exige avaliar a
organização lógica, os sinais elétricos, os tempos de acesso, a largura de
banda e a seleção de bancos. Essas decisões preparam o estudo dos circuitos de
temporização, das interfaces e das arquiteturas digitais nos capítulos
seguintes.

## Exercícios propostos {#sec-memory-exercises}

1. Uma memória possui 14 bits de endereço e 8 bits de dados. Determine o número
   de posições e a capacidade em KiB.
2. Quantas linhas de endereço são necessárias para selecionar $64\,\mathrm{Ki}$
   palavras?
3. Determine a capacidade em bytes de uma memória $32\,\mathrm{K}\times16$.
4. Explique por que uma célula SRAM típica não necessita de _refresh_
   periódico, enquanto uma célula DRAM necessita.
5. Compare EPROM, EEPROM e Flash quanto ao processo de apagamento.
6. Quantos dispositivos de $2\,\mathrm{K}\times8$ são necessários para
   construir $8\,\mathrm{K}\times16$?
7. Explique a função de $\overline{CE}$, $\overline{OE}$ e $\overline{WE}$ em
   uma SRAM assíncrona típica.
8. Uma memória tem $t_{AA}=55\,\mathrm{ns}$, $t_{CE}=45\,\mathrm{ns}$ e
   $t_{OE}=25\,\mathrm{ns}$. Se todos os sinais pertinentes forem aplicados
   simultaneamente, estime o instante máximo de validade dos dados.
9. Uma interface de 32 bits transfere uma palavra por ciclo a
   $100\,\mathrm{MHz}$. Calcule a largura de banda teórica em MB/s decimais.
10. Descreva como dois dispositivos de $4\,\mathrm{K}\times8$ podem ser
    organizados para formar $8\,\mathrm{K}\times8$.
11. Justifique por que a classificação síncrona/assíncrona não é equivalente à
    classificação volátil/não volátil.
12. Cite quatro critérios técnicos para selecionar uma memória destinada ao
    armazenamento frequente de parâmetros de um sistema embarcado.

## Respostas e soluções selecionadas {#sec-memory-solutions}

1. $2^{14}=16384$ posições; $16384$ bytes = $16\,\mathrm{KiB}$.
2. $16$ linhas, pois $2^{16}=65536$.
3. $32768\times16/8=65536$ bytes = $64\,\mathrm{KiB}$.
4. A SRAM mantém o estado por realimentação regenerativa enquanto alimentada; a
   DRAM armazena carga sujeita a perdas e exige restauração periódica.
5. EPROM é apagada por radiação ultravioleta em dispositivos apropriados;
   EEPROM é eletricamente apagável; Flash também é eletricamente apagável,
   normalmente por blocos.
6. São $4$ grupos em profundidade e $2$ dispositivos em largura: $8$
   dispositivos.
7. $\overline{CE}$ seleciona o chip, $\overline{OE}$ habilita a saída e
   $\overline{WE}$ comanda a escrita, observada a tabela de operação do
   fabricante.
8. $55\,\mathrm{ns}$, sob as hipóteses indicadas.
9. $B=32(100\times10^6)/8=400\times10^6$ bytes/s = $400\,\mathrm{MB/s}$.
10. Compartilham-se as 12 linhas inferiores de endereço; o 13º bit seleciona um
    dos dois dispositivos. O barramento de dados é comum, desde que somente a
    saída selecionada seja habilitada.
11. A primeira classificação descreve o protocolo de acesso; a segunda descreve
    a retenção de informação sem alimentação.
12. Por exemplo: retenção, resistência à escrita, granularidade de apagamento,
    capacidade, tensão de operação, consumo e tempo de programação.

## Referências bibliográficas {#sec-memory-references}

1. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed.
   Pearson, 2005.
2. MANO, M. Morris; CILETTI, Michael D. **Digital Design**. 5. ed.
   Pearson, 2013.
3. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer
   Architecture**. 2. ed. Morgan Kaufmann, 2012.
4. PATTERSON, David A.; HENNESSY, John L. **Computer Organization and Design:
   The Hardware/Software Interface**. Morgan Kaufmann.
5. JEDEC SOLID STATE TECHNOLOGY ASSOCIATION. **Padrões e especificações para
   dispositivos de memória semicondutora**. Documentação técnica.
6. Fabricantes de SRAM, DRAM e Flash. **Folhas de dados e notas de aplicação**.
   Consultar as especificações do componente escolhido.

---

[Voltar ao sumário](README.md) ·
[Capítulo 15 — Integridade de sinais e implementação física](signal-integrity-and-physical-implementation.md)
·
[Capítulo 17 — Circuitos de temporização e geração de pulsos](timing-and-pulse-generation-circuits.md)
