# 21. Linguagens de descrição de hardware {#chapter-21}

Os dispositivos lógicos programáveis estudados no capítulo anterior permitem
implementar circuitos complexos sem que cada conexão seja definida manualmente.
Para aproveitar esses recursos, é necessário descrever o **comportamento**, a
**estrutura** e as **relações temporais** do circuito em uma forma que possa
ser analisada por ferramentas de projeto. As **linguagens de descrição de
hardware** (_hardware description languages_, HDLs) atendem a essa finalidade.

Uma HDL não deve ser confundida com uma linguagem de programação convencional.
Embora ambas utilizem identificadores, expressões e estruturas de controle, a
descrição de hardware representa elementos que podem operar **simultaneamente**
e conservar estado. A execução de uma simulação também não é equivalente à
operação física do circuito sintetizado.

Neste capítulo, VHDL e Verilog são apresentados por meio de exemplos pequenos e
verificáveis. O objetivo não é esgotar suas normas, mas estabelecer os
conceitos necessários para escrever, interpretar, simular e sintetizar
descrições digitais. O fluxo completo de projeto e verificação será aprofundado
no Capítulo 22.

## 21.1. Descrição estrutural e comportamental

Uma descrição **estrutural** identifica componentes e as conexões entre eles.
Uma descrição **comportamental** especifica como as saídas e os estados
dependem das entradas, sem necessariamente determinar a implementação em
portas. Entre esses extremos, a descrição por **fluxo de dados** emprega
expressões concorrentes para representar as transformações dos sinais.

Considere a função booleana

$$
Y=(A\land B)\lor C.
$$

Ela pode ser representada por uma porta AND seguida de uma porta OR ou
diretamente por uma expressão lógica. Se a função for combinacional, seu valor
depende apenas das entradas presentes. Em um circuito sequencial, também seria
necessário especificar como o estado evolui.

<!-- prettier-ignore -->
::: figure Níveis de descrição de um circuito digital {#fig-hdl-abstraction-levels}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (0,0) rectangle (3.4,1.6);
\draw[thick] (5.6,0) rectangle (9.0,1.6);
\draw[thick] (11.2,0) rectangle (14.6,1.6);
\node[align=center] at (1.7,0.8) {Comportamento\\e requisitos};
\node[align=center] at (7.3,0.8) {Expressões e\\registradores};
\node[align=center] at (12.9,0.8) {Portas e\\interconexões};
\draw[->] (3.4,0.8)--(5.6,0.8);
\draw[->] (9.0,0.8)--(11.2,0.8);
\end{tikzpicture}
```

:::

A {@ref fig-hdl-abstraction-levels} apresenta níveis de abstração, não três
etapas obrigatórias ou independentes. A ferramenta de síntese transforma uma
descrição compatível com síntese em uma estrutura lógica, sujeita às restrições
do dispositivo e do projeto.

Em uma HDL, a ordem de apresentação de atribuições **concorrentes** não
estabelece uma sequência temporal de execução. Já dentro de certos processos, a
ordem das instruções possui significado para a semântica da linguagem. Essa
distinção é essencial para interpretar corretamente o código.

## 21.2. Conceitos de VHDL e Verilog

**VHDL** e **Verilog** são linguagens padronizadas amplamente utilizadas em
projeto digital. VHDL organiza frequentemente a interface em uma `entity` e a
implementação em uma `architecture`; Verilog utiliza o conceito de `module`,
com portas e uma descrição interna. Ambas permitem modelagem estrutural,
comportamental e por fluxo de dados.

O exemplo seguinte implementa a mesma função combinacional nas duas linguagens.

<!-- prettier-ignore -->
::: example Implementação de uma função booleana em VHDL {#ex-hdl-vhdl-logic}

```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity funcao_logica is
    port (
        a, b, c : in  std_logic;
        y       : out std_logic
    );
end entity;

architecture rtl of funcao_logica is
begin
    y <= (a and b) or c;
end architecture;
```

:::

<!-- prettier-ignore -->
::: example Implementação equivalente em Verilog {#ex-hdl-verilog-logic}

```verilog
module funcao_logica (
    input  wire a,
    input  wire b,
    input  wire c,
    output wire y
);
    assign y = (a & b) | c;
endmodule
```

:::

Os operadores lógicos, as regras de tipos e os valores possíveis dos sinais não
são idênticos nas duas linguagens. Em VHDL, `std_logic` admite, além de `'0'` e
`'1'`, estados de simulação como `'X'` e `'Z'`. No Verilog de quatro estados,
um bit pode assumir `0`, `1`, `x` ou `z`. Esses estados ajudam a representar
desconhecimento e alta impedância na simulação; não significam que uma porta
física tenha quatro níveis lógicos ordinários.

<!-- prettier-ignore -->
::: table Comparação introdutória de construções em VHDL e Verilog {#tab-hdl-language-constructs .full-width}

| Conceito                     | VHDL                                  | Verilog                             |
| :--------------------------- | :------------------------------------ | :---------------------------------- |
| Unidade de projeto           | `entity` e `architecture`             | `module`                            |
| Sinal lógico de um bit       | `std_logic`                           | `wire` ou `reg` no Verilog clássico |
| Atribuição concorrente       | `y <= a and b;`                       | `assign y = a & b;`                 |
| Processo combinacional       | `process(all)`                        | `always @(*)`                       |
| Processo acionado por borda  | `process(clk)` com `rising_edge(clk)` | `always @(posedge clk)`             |
| Atribuição sequencial típica | Atribuição de sinal `<=`              | Atribuição não bloqueante `<=`      |

:::

O identificador `reg` em Verilog clássico indica uma variável atribuída por
procedimento; **não garante a inferência de um registrador físico**. Em
SystemVerilog, a declaração `logic` e as construções `always_comb` e
`always_ff` oferecem formas mais explícitas de expressar a intenção do projeto.
A escolha da linguagem e de sua versão deve corresponder às ferramentas
disponíveis.

## 21.3. Representação de lógica combinacional

Um circuito combinacional satisfaz, idealmente, uma relação da forma

$$
\mathbf{Y}(t)=F\bigl(\mathbf{X}(t)\bigr),
$$

ignorando momentaneamente os atrasos físicos. Para descrevê-lo, pode-se usar
uma atribuição concorrente ou um processo que atribua valores a todas as saídas
em todos os caminhos de execução.

Considere um multiplexador de duas entradas, cuja função é

$$
Y=\overline{S}A+SB.
$$

<!-- prettier-ignore -->
::: example Multiplexador 2:1 em VHDL {#ex-hdl-vhdl-mux}

```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity mux2 is
    port (
        a, b, s : in  std_logic;
        y       : out std_logic
    );
end entity;

architecture rtl of mux2 is
begin
    y <= a when s = '0' else b;
end architecture;
```

:::

<!-- prettier-ignore -->
::: example Multiplexador 2:1 em Verilog {#ex-hdl-verilog-mux}

```verilog
module mux2 (
    input  wire a,
    input  wire b,
    input  wire s,
    output wire y
);
    assign y = s ? b : a;
endmodule
```

:::

<!-- prettier-ignore -->
::: table Tabela-verdade do multiplexador 2:1 {#tab-hdl-mux-truth .full-width}

| $S$ | $A$ | $B$ | $Y$ |
| :-: | :-: | :-: | :-: |
|  0  |  0  |  X  |  0  |
|  0  |  1  |  X  |  1  |
|  1  |  X  |  0  |  0  |
|  1  |  X  |  1  |  1  |

:::

Na {@ref tab-hdl-mux-truth}, `X` significa **valor indiferente da entrada não
selecionada**, e não necessariamente o estado desconhecido `'X'` da simulação.
Essa distinção entre notação de tabela-verdade e valores da linguagem evita
ambiguidades.

Uma descrição procedimental incompleta pode inferir armazenamento. Por exemplo,
se `y` receber um novo valor somente quando `habilita = 1`, será necessário
preservar o valor anterior quando `habilita = 0`; em síntese, isso pode
resultar em um _latch_. Quando se deseja lógica combinacional, todas as saídas
devem receber atribuição em todos os ramos, incluindo condições padrão.

## 21.4. Representação de circuitos sequenciais

Circuitos sequenciais dependem das entradas e do estado armazenado. Para um
registrador de um bit com captura na borda de subida,

$$
Q^{+}=D,
$$

onde $Q^{+}$ representa o valor armazenado após o evento de relógio, observadas
as condições temporais do dispositivo.

<!-- prettier-ignore -->
::: example Registrador D com reset síncrono em VHDL {#ex-hdl-vhdl-register}

```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity registrador_d is
    port (
        clk, rst : in  std_logic;
        d        : in  std_logic;
        q        : out std_logic
    );
end entity;

architecture rtl of registrador_d is
begin
    process(clk)
    begin
        if rising_edge(clk) then
            if rst = '1' then
                q <= '0';
            else
                q <= d;
            end if;
        end if;
    end process;
end architecture;
```

:::

<!-- prettier-ignore -->
::: example Registrador D com reset síncrono em Verilog {#ex-hdl-verilog-register}

```verilog
module registrador_d (
    input  wire clk,
    input  wire rst,
    input  wire d,
    output reg  q
);
    always @(posedge clk) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule
```

:::

Em ambos os exemplos, o reset é **síncrono**: ele só altera o estado na borda
ativa do relógio. Para um reset assíncrono, seria necessário modificar a lista
de sensibilidade e a condição de controle, além de verificar as restrições
físicas de liberação do reset. A escolha entre os dois mecanismos depende dos
requisitos do sistema e dos recursos do dispositivo.

<!-- prettier-ignore -->
::: figure Relação funcional entre lógica combinacional e registrador {#fig-hdl-register-datapath}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[thick] (1.0,2.0) rectangle (4.2,3.6);
\node[align=center] at (2.6,2.8) {Lógica\\combinacional};
\draw[thick] (7.0,2.0) rectangle (9.8,3.6);
\node[align=center] at (8.4,2.8) {Registrador\\D};
\draw[->] (-0.2,2.8)--(1.0,2.8);
\node[above] at (0.4,2.8) {$X$};
\draw[->] (4.2,2.8)--(7.0,2.8);
\node[above] at (5.6,2.8) {$D$};
\draw[->] (9.8,2.8)--(11.2,2.8);
\node[above] at (10.5,2.8) {$Q$};
\draw[->] (8.4,0.4)--(8.4,2.0);
\node[right] at (8.6,0.9) {$CLK$};
\end{tikzpicture}
```

:::

A {@ref fig-hdl-register-datapath} ilustra a separação entre cálculo e
armazenamento. Em sistemas reais, os atrasos da lógica combinacional, do
registrador e da distribuição do relógio determinam a frequência admissível,
conforme estudado no Capítulo 10.

## 21.5. Processos síncronos e assíncronos

A palavra **processo** designa uma construção da HDL, não necessariamente um
processador físico. Em VHDL, um `process` executa instruções sequenciais
internamente e pode suspender-se à espera de eventos. Em Verilog, blocos
`always` executam novamente quando ocorre um evento da lista de sensibilidade.

Em uma descrição combinacional, a sensibilidade deve abranger todas as entradas
lidas pelo processo. Em VHDL moderno, `process(all)` reduz o risco de omissões;
em Verilog, `always @(*)` possui finalidade semelhante. Para lógica sequencial
acionada por borda, utiliza-se um evento de relógio explícito.

É importante distinguir **atribuição bloqueante** (`=`) e **não bloqueante**
(`<=`) em Verilog. A primeira atualiza a variável durante a execução do
procedimento; a segunda agenda uma atualização para a região apropriada do
ciclo de simulação. Em blocos sequenciais de registradores, utiliza-se
normalmente a atribuição não bloqueante.

Considere dois registradores em cascata:

<!-- prettier-ignore -->
::: example Dois registradores em cascata em Verilog {#ex-hdl-verilog-pipeline}

```verilog
module pipeline2 (
    input  wire clk,
    input  wire d,
    output reg  q1,
    output reg  q2
);
    always @(posedge clk) begin
        q1 <= d;
        q2 <= q1;
    end
endmodule
```

:::

Na mesma borda, `q1` recebe o valor amostrado de `d`, enquanto `q2` recebe o
**valor anterior** de `q1`. Não há propagação instantânea de `d` por dois
estágios. Em VHDL, atribuições a sinais em um processo de relógio também
preservam essa distinção entre o valor lido durante o processo e a atualização
agendada.

<!-- prettier-ignore -->
::: table Interpretação de construções procedimentais {#tab-hdl-process-types .full-width}

| Construção                      | Intenção típica                       | Cuidado principal                                   |
| :------------------------------ | :------------------------------------ | :-------------------------------------------------- |
| Atribuição concorrente          | Lógica combinacional                  | Verificar tipos, larguras e valores desconhecidos   |
| Processo combinacional completo | Lógica combinacional                  | Atribuir todas as saídas em todos os caminhos       |
| Processo por borda de relógio   | Registradores e lógica sequencial     | Usar semântica correta de atualização de estado     |
| Processo com reset assíncrono   | Registradores com controle assíncrono | Verificar polaridade, recursos e liberação do reset |
| Atrasos explícitos de simulação | Modelo temporal ou banco de testes    | Não presumir que o atraso será sintetizado          |

:::

A distinção entre processos síncronos e assíncronos também aparece no nível do
sistema. Um circuito pode possuir entradas que mudam sem relação com seu
relógio; nesse caso, a sincronização física dessas entradas é uma questão
separada da forma de escrever o processo em HDL.

## 21.6. Simulação e bancos de testes

A **simulação funcional** avalia como a descrição responde a estímulos
definidos, antes da implementação física. Um **banco de testes** (_testbench_)
instancia o circuito sob teste, aplica entradas e verifica as saídas. Ele pode
conter comandos de espera, geração de relógio, relatórios e verificações
automáticas que não se destinam à síntese.

Para o multiplexador da Seção 21.3, podemos aplicar as oito combinações
binárias de três entradas e comparar a saída com o valor esperado.

<!-- prettier-ignore -->
::: example Banco de testes de multiplexador em Verilog {#ex-hdl-verilog-testbench}

```verilog
`timescale 1ns/1ps

module tb_mux2;
    reg a, b, s;
    wire y;
    integer i;
    reg esperado;

    mux2 dut (.a(a), .b(b), .s(s), .y(y));

    initial begin
        for (i = 0; i < 8; i = i + 1) begin
            {s, b, a} = i;
            esperado = s ? b : a;
            #1;
            if (y !== esperado)
                $error("Falha no vetor %0d", i);
        end
        $finish;
    end
endmodule
```

:::

A espera `#1` dá tempo para a propagação dos eventos no simulador; **não
especifica um atraso físico de um nanosegundo para o multiplexador
sintetizado**. A comparação `!==` considera também diferenças envolvendo
estados desconhecidos, sendo útil para detectar resultados não inicializados.

Um teste que passa demonstra apenas que a descrição satisfez as verificações
executadas. Ele não prova correção para todos os casos, nem garante atendimento
às restrições temporais ou elétricas. Cobertura, casos extremos, estados
ilegais e verificação de protocolos são assuntos centrais no planejamento dos
testes.

<!-- prettier-ignore -->
::: figure Fluxo básico de simulação com banco de testes {#fig-hdl-simulation-flow}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape]
\draw[thick] (0,0) rectangle (3.5,1.6);
\draw[thick] (6.0,0) rectangle (9.5,1.6);
\draw[thick] (12.0,0) rectangle (15.5,1.6);
\node[align=center] at (1.75,0.8) {Banco de testes\\e estímulos};
\node[align=center] at (7.75,0.8) {Simulador e\\circuito sob teste};
\node[align=center] at (13.75,0.8) {Resultados e\\verificações};
\draw[->] (3.5,0.8)--(6.0,0.8);
\draw[->] (9.5,0.8)--(12.0,0.8);
\end{tikzpicture}
```

:::

Na {@ref fig-hdl-simulation-flow}, a verificação compara respostas observadas
com uma especificação ou um modelo de referência. Para circuitos sequenciais,
também é necessário controlar a ordem dos estímulos em relação às bordas do
relógio.

## 21.7. Síntese lógica

A **síntese** transforma uma descrição HDL compatível com hardware em uma
representação lógica, frequentemente denominada _netlist_. O resultado pode
conter portas, multiplexadores, registradores, memórias e outros elementos,
posteriormente mapeados para os recursos de uma biblioteca de células ou de um
dispositivo programável.

De maneira simplificada, o processo envolve análise sintática e semântica,
elaboração da hierarquia, inferência de estruturas, otimização e mapeamento
tecnológico. Em FPGA, as etapas posteriores de posicionamento e roteamento
determinam onde os recursos serão usados e como serão conectados.

Nem toda construção válida para simulação é sintetizável. Um banco de testes
pode esperar um intervalo arbitrário, abrir arquivos ou produzir mensagens.
Essas operações descrevem o **ambiente de verificação**, não necessariamente
circuitos implementáveis.

<!-- prettier-ignore -->
::: figure Transformação de HDL em recursos físicos {#fig-hdl-synthesis-flow}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape]
\draw[thick] (0,0) rectangle (3.2,1.6);
\draw[thick] (5.2,0) rectangle (8.4,1.6);
\draw[thick] (10.4,0) rectangle (13.6,1.6);
\node[align=center] at (1.6,0.8) {Descrição HDL\\sintetizável};
\node[align=center] at (6.8,0.8) {Síntese e\\mapeamento};
\node[align=center] at (12.0,0.8) {Recursos lógicos\\implementados};
\draw[->] (3.2,0.8)--(5.2,0.8);
\draw[->] (8.4,0.8)--(10.4,0.8);
\end{tikzpicture}
```

:::

A {@ref fig-hdl-synthesis-flow} é conceitual. Em um projeto real, otimizações
podem alterar a estrutura intermediária sem modificar o comportamento
observável especificado. Por exemplo, uma expressão condicional pode ser
implementada por um multiplexador dedicado, uma LUT ou uma combinação de
portas.

Um risco importante é a **inferência não intencional de armazenamento**. Se uma
saída de processo combinacional não for definida em todos os caminhos, a
ferramenta poderá inferir um latch. Da mesma forma, um sinal atribuído em borda
de relógio tende a corresponder a um registrador, desde que a descrição seja
suportada pela ferramenta.

## 21.8. Restrições de temporização

A descrição funcional não estabelece, por si só, se o circuito pode operar na
frequência pretendida. O projeto precisa de **restrições temporais** que
informem às ferramentas quais caminhos e eventos devem ser analisados,
incluindo períodos de relógio, relações entre domínios e atrasos associados às
interfaces externas.

Para um caminho síncrono entre dois registradores, uma condição simplificada de
_setup_, sem explicitar _skew_ e margens de incerteza, é

$$
T_{clk}\ge t_{CQ,\max}+t_{comb,\max}+t_{setup}.
$$

Uma condição simplificada de _hold_ é

$$
t_{CQ,\min}+t_{comb,\min}\ge t_{hold}.
$$

As expressões completas, incluindo diferenças de chegada de relógio e
incertezas, foram estudadas no Capítulo 10. A verificação temporal deve
considerar o circuito **após o mapeamento e a implementação física**, pois
interconexões e recursos selecionados afetam os atrasos.

<!-- prettier-ignore -->
::: table Exemplos de restrições e sua finalidade {#tab-hdl-timing-constraints .full-width}

| Restrição           | Finalidade                                       | Observação                                                  |
| :------------------ | :----------------------------------------------- | :---------------------------------------------------------- |
| Período do relógio  | Definir o intervalo nominal entre bordas ativas  | Não garante, isoladamente, que o circuito atenda ao período |
| Atraso de entrada   | Modelar o tempo de chegada de sinais externos    | Deve considerar a interface e sua referência temporal       |
| Atraso de saída     | Modelar a exigência temporal do receptor externo | Depende do dispositivo conectado                            |
| Relógios gerados    | Descrever relações entre relógios derivados      | Exige identificar a origem e a transformação                |
| Exceções de caminho | Tratar caminhos falsos ou de múltiplos ciclos    | Uma exceção incorreta pode ocultar uma violação real        |

:::

Restrições incorretas podem ser tão perigosas quanto uma implementação
incorreta. Um caminho não analisado ou indevidamente declarado como falso pode
falhar no hardware mesmo que a ferramenta apresente um relatório sem violações.

## 21.9. Correspondência entre HDL e hardware implementado

O mesmo comportamento pode ser descrito de maneiras diferentes e resultar em
implementações com áreas, frequências e consumos distintos. A relação entre HDL
e circuito físico depende da semântica do código, das otimizações, dos recursos
disponíveis, das restrições e das decisões das ferramentas.

Considere um contador de quatro bits com habilitação:

<!-- prettier-ignore -->
::: example Contador síncrono de quatro bits em Verilog {#ex-hdl-verilog-counter}

```verilog
module contador4 (
    input  wire       clk,
    input  wire       rst,
    input  wire       en,
    output reg  [3:0] q
);
    always @(posedge clk) begin
        if (rst)
            q <= 4'b0000;
        else if (en)
            q <= q + 4'b0001;
    end
endmodule
```

:::

A descrição expressa um contador módulo 16, com reset síncrono e manutenção do
valor quando `en = 0`. Uma implementação pode empregar quatro flip-flops,
lógica de incremento e mecanismos de habilitação. Dependendo da arquitetura, a
ferramenta pode utilizar entradas de habilitação integradas aos registradores
ou multiplexadores adicionais.

A ausência de uma atribuição no ramo em que `en = 0` é **intencional** em um
processo acionado por borda: significa preservar o estado. Isso é diferente de
omitir uma atribuição em um processo que deveria ser puramente combinacional.

A correspondência entre descrição e implementação deve ser examinada em vários
níveis: equivalência funcional, inferência de armazenamento, largura dos
sinais, utilização de recursos, temporização e comportamento na inicialização.
A simulação RTL, a análise de síntese, a análise estática de temporização e os
testes físicos respondem a perguntas complementares.

<!-- prettier-ignore -->
::: table Relação entre construções HDL e estruturas de hardware {#tab-hdl-hardware-inference .full-width}

| Descrição HDL                            | Estrutura que pode ser inferida              | Condição ou ressalva                                     |
| :--------------------------------------- | :------------------------------------------- | :------------------------------------------------------- |
| Expressão booleana concorrente           | Portas ou LUTs                               | Depende do mapeamento tecnológico                        |
| Seleção condicional completa             | Multiplexador ou lógica equivalente          | Otimizações podem simplificar a estrutura                |
| Atribuição em borda de relógio           | Registrador                                  | Reset e habilitação influenciam o recurso utilizado      |
| Processo combinacional incompleto        | Latch                                        | Pode ser um erro de projeto                              |
| Arranjo de dados com acessos compatíveis | Memória distribuída ou em bloco              | Depende da capacidade e dos padrões de leitura e escrita |
| Operação aritmética                      | Somador, comparador ou recurso especializado | Largura e sinais de controle influenciam o resultado     |

:::

O princípio central é que uma HDL descreve **relações lógicas e temporais** que
devem ser interpretadas como hardware, não uma lista de instruções executadas
sequencialmente por um processador. Uma boa descrição deixa explícitos os
limites entre lógica combinacional e armazenamento, documenta as interfaces e
permite verificar o comportamento antes da implementação.

## Síntese do capítulo

As HDLs permitem representar circuitos digitais em diferentes níveis de
abstração. VHDL e Verilog expressam concorrência, combinacionalidade e
armazenamento, mas possuem regras próprias de tipos e atualização de sinais.
Processos combinacionais devem definir completamente suas saídas; processos
acionados por relógio modelam a evolução do estado. Bancos de testes verificam
o comportamento em simulação, enquanto a síntese transforma descrições
compatíveis em recursos lógicos. A implementação final exige restrições
temporais e análise dos resultados físicos.

## Exercícios

1. Explique a diferença entre descrição estrutural, comportamental e por fluxo
   de dados. Apresente uma situação em que cada abordagem seja conveniente.
2. Escreva, em VHDL e em Verilog, a função $Y=\overline{A}B+AC$ usando
   atribuições concorrentes.
3. Construa a tabela-verdade do multiplexador apresentado na Seção 21.3 e
   explique o papel do sinal de seleção.
4. Escreva um módulo Verilog combinacional que produza o bit de paridade de
   quatro entradas. Justifique a escolha do operador.
5. Explique como uma descrição combinacional incompleta pode inferir um latch.
   Reescreva um exemplo incompleto de modo a eliminar o armazenamento
   indesejado.
6. Compare os exemplos de registrador D em VHDL e Verilog. Em que momento o
   reset síncrono modifica a saída?
7. Para o exemplo `pipeline2`, determine os valores de `q1` e `q2` após três
   bordas de subida, supondo estado inicial zero e valores de `d` iguais a 1, 0
   e 1, nessa ordem.
8. Explique a diferença entre atribuições bloqueantes e não bloqueantes em
   Verilog e por que a segunda é preferida para modelar registradores.
9. Modifique o banco de testes do multiplexador para emitir uma mensagem de
   aprovação apenas se todos os vetores forem verificados sem falhas.
10. Cite três construções úteis em simulação que não devem ser interpretadas
    automaticamente como hardware sintetizável.
11. Um circuito apresenta $t_{CQ,\max}=0{,}8\ \mathrm{ns}$,
    $t_{comb,\max}=5{,}2\ \mathrm{ns}$ e $t_{setup}=0{,}6\ \mathrm{ns}$.
    Desconsiderando _skew_ e incertezas, determine o menor período nominal de
    relógio permitido pela condição simplificada de _setup_.
12. Descreva como o contador de quatro bits da Seção 21.9 pode ser realizado
    por registradores e lógica combinacional. Explique por que a implementação
    física pode diferir entre dispositivos.
13. Discuta por que uma simulação funcional bem-sucedida não substitui a
    análise estática de temporização.
14. Proponha um plano de verificação para uma máquina de estados com quatro
    estados, reset síncrono e duas entradas de comando.

## Referências bibliográficas

- BROWN, Stephen; VRANESIC, Zvonko. _Fundamentals of Digital Logic with Verilog
  Design_. McGraw-Hill.
- MANO, M. Morris; CILETTI, Michael D. _Digital Design_. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. _Digital Design and Computer
  Architecture_. Morgan Kaufmann.
- IEEE. _IEEE Standard VHDL Language Reference Manual_ (IEEE 1076). Consultar a
  edição adotada no projeto.
- IEEE. _IEEE Standard for SystemVerilog—Unified Hardware Design,
  Specification, and Verification Language_ (IEEE 1800). Consultar a edição
  adotada no projeto.
- Documentação das ferramentas de simulação, síntese e análise temporal
  utilizadas, incluindo suas versões e os recursos de linguagem suportados.
