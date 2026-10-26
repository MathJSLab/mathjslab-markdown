# 25. Projetos integradores {#chapter-25}

Os projetos integradores transformam conceitos de representação binária, álgebra booleana, circuitos combinacionais e sequenciais, temporização e interfaces em sistemas verificáveis. O objetivo não é apenas obter um circuito que aparentemente funcione, mas **especificar, implementar, testar e documentar** uma solução cuja operação possa ser explicada e reproduzida.

Os oito projetos deste capítulo possuem complexidade progressiva. Em cada um, as escolhas de arquitetura são exemplos didáticos: devem ser adaptadas às restrições de componentes, frequência, alimentação, ambiente de operação e recursos de laboratório. As implementações em HDL podem ser simuladas antes de serem transferidas para uma FPGA.

## 25.1. Sistema de votação digital

### Problema e requisitos

Considere um painel de votação com três entradas binárias $A$, $B$ e $C$. A saída $Y$ deve assumir nível lógico alto quando **ao menos duas** entradas estiverem em nível alto. Trata-se de uma função majoritária de três variáveis, útil também para ilustrar redundância e decisão por maioria.

| A | B | C | Y |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 |

A expressão mínima em soma de produtos é

$$Y=AB+AC+BC.$$

Ela pode ser implementada com três portas AND de duas entradas e uma porta OR de três entradas, ou transformada para utilizar somente portas NAND. Se as entradas vierem de botões mecânicos, a implementação física deve prever **tratamento de repique** (*debouncing*) e definição dos níveis de repouso; caso contrário, oscilações transitórias podem ser interpretadas como votos.

<!-- prettier-ignore -->
::: figure Organização funcional do sistema de votação {#fig-project-voting}

```tikz
\begin{tikzpicture}[scale=1.35,transform shape]
\draw[thick] (0,0) rectangle (3.2,2.5);
\node[align=center] at (1.6,1.25) {Entradas e\\condicionamento};
\draw[thick] (6.4,0) rectangle (9.6,2.5);
\node[align=center] at (8.0,1.25) {Lógica\\majoritária};
\draw[thick] (12.8,0) rectangle (16.0,2.5);
\node[align=center] at (14.4,1.25) {Indicador\\de resultado};
\draw[->,thick] (3.2,1.25)--(6.4,1.25);
\node[above] at (4.8,1.25) {$A,B,C$};
\draw[->,thick] (9.6,1.25)--(12.8,1.25);
\node[above] at (11.2,1.25) {$Y$};
\end{tikzpicture}
```

:::

**Verificação:** testar as oito combinações da tabela-verdade, verificar a condição de maioria e, em bancada, observar o comportamento durante o acionamento dos botões. Para ampliar o projeto, podem-se registrar os votos com flip-flops e exigir um sinal `CONFIRMAR` antes da contabilização.

## 25.2. Controlador de semáforo

### Especificação e máquina de estados

Um semáforo simples possui três estados: verde ($S_V$), amarelo ($S_A$) e vermelho ($S_R$). A passagem entre estados é comandada por eventos de término de temporização. As saídas devem ser mutuamente exclusivas em operação normal: somente uma lâmpada fica ativa por vez.

| Estado | Verde | Amarelo | Vermelho | Próximo estado ao término do tempo |
|---|---:|---:|---:|---|
| $S_V$ | 1 | 0 | 0 | $S_A$ |
| $S_A$ | 0 | 1 | 0 | $S_R$ |
| $S_R$ | 0 | 0 | 1 | $S_V$ |

<!-- prettier-ignore -->
::: figure Estados de um controlador de semáforo {#fig-project-traffic-fsm}

```tikz
\begin{tikzpicture}[scale=1.4,transform shape,>=stealth]
\node[draw,thick,circle,minimum size=2.0cm] (v) at (0,0) {$S_V$};
\node[draw,thick,circle,minimum size=2.0cm] (a) at (6,0) {$S_A$};
\node[draw,thick,circle,minimum size=2.0cm] (r) at (12,0) {$S_R$};
\draw[->,thick] (v)--node[above] {$T_V$} (a);
\draw[->,thick] (a)--node[above] {$T_A$} (r);
\draw[->,thick] (r.south) -- (12,-2.6) -- (0,-2.6) -- (v.south);
\node[below] at (6,-2.6) {$T_R$};
\end{tikzpicture}
```

:::

Um contador síncrono produz a base de tempo. Se o relógio disponível tiver frequência $f_{clk}$ e a duração desejada for $T$, a contagem ideal de ciclos é $N=f_{clk}T$. Um divisor ou um gerador de habilitação periódica pode reduzir a largura dos contadores de estado. A lógica deve definir o comportamento de **reset**, inclusive quando acionado durante uma transição.

**Exemplo:** para uma habilitação de 1 Hz, os intervalos de 20 s, 3 s e 17 s correspondem a 20, 3 e 17 eventos de habilitação, respectivamente. É preciso especificar se a contagem começa em zero e em qual borda ocorre a troca, para evitar erros de uma unidade.

**Verificação:** testar reset, sequência de estados, duração de cada fase e a propriedade de exclusão mútua. Este é um modelo didático: um controlador de tráfego real requer supervisão de falhas, estados seguros e requisitos normativos adicionais.

## 25.3. Relógio e cronômetro digital

Um relógio digital pode ser dividido em quatro subsistemas: referência de frequência, base de tempo, contadores de tempo e apresentação. Um cronômetro acrescenta comandos de iniciar, pausar e zerar, com prioridade definida.

<!-- prettier-ignore -->
::: figure Arquitetura de um relógio e cronômetro digital {#fig-project-clock}

```tikz
\begin{tikzpicture}[scale=1.25,transform shape]
\draw[thick] (0,0) rectangle (3.2,2.2);
\draw[thick] (6.0,0) rectangle (9.2,2.2);
\draw[thick] (12.0,0) rectangle (15.2,2.2);
\draw[thick] (18.0,0) rectangle (21.2,2.2);
\node[align=center] at (1.6,1.1) {Oscilador\\e divisor};
\node[align=center] at (7.6,1.1) {Habilitação\\periódica};
\node[align=center] at (13.6,1.1) {Contadores\\de tempo};
\node[align=center] at (19.6,1.1) {Decodificação\\e display};
\draw[->,thick] (3.2,1.1)--(6.0,1.1);
\draw[->,thick] (9.2,1.1)--(12.0,1.1);
\draw[->,thick] (15.2,1.1)--(18.0,1.1);
\node[above] at (4.6,1.1) {$CLK$};
\node[above] at (10.6,1.1) {$EN$};
\node[above] at (16.6,1.1) {BCD};
\end{tikzpicture}
```

:::

Para produzir uma habilitação a cada segundo a partir de $f_{clk}=50\,\mathrm{MHz}$, são necessários $50\,000\,000$ ciclos por período. O contador do divisor deve comportar os valores de 0 a $49\,999\,999$, o que exige

$$n=\left\lceil\log_2(50\,000\,000)\right\rceil=26\text{ bits}.$$

É recomendável manter um **único domínio de relógio** e gerar pulsos de habilitação em vez de criar novos relógios por lógica combinacional. Os contadores de segundos e minutos operam módulo 60; o de horas pode operar módulo 24. Os valores podem ser convertidos para BCD antes de alimentar decodificadores de sete segmentos.

**Verificação:** conferir transições 09→10, 59→00 e 23:59:59→00:00:00, além da prioridade de `RESET`, `PAUSE` e `START`. Em displays multiplexados, verificar também a frequência de atualização e a corrente admissível dos segmentos.

## 25.4. Controlador de acesso por código

Considere um dispositivo que recebe uma sequência de quatro símbolos, compara-a com uma senha armazenada e habilita uma saída `ABRIR` durante um intervalo definido. Uma implementação modular contém interface de entrada, registrador da sequência, comparador, contador de tentativas e máquina de estados.

| Estado | Significado | Ação principal |
|---|---|---|
| ESPERA | Aguardando entrada | Limpar índice da sequência |
| RECEBE | Coletando símbolos | Armazenar símbolo confirmado |
| CONFERE | Sequência completa | Comparar com a referência |
| LIBERA | Código correto | Acionar saída por tempo limitado |
| BLOQUEIA | Excesso de tentativas | Ignorar entradas por intervalo definido |

A especificação precisa resolver ambiguidades: quando uma entrada é aceita, o que acontece após uma pausa, como cancelar uma digitação e qual é o número máximo de tentativas. A comparação não deve depender de um sinal de botão mantido continuamente em nível alto; cada acionamento deve produzir um evento de confirmação.

**Verificação:** testar códigos corretos e incorretos, entradas incompletas, repetição rápida de teclas, reset e expiração do bloqueio. Trata-se de um exemplo educacional; sistemas de segurança reais exigem proteção contra manipulação física e ataques que ultrapassam a lógica apresentada.

## 25.5. Unidade aritmética e lógica

Uma ULA reúne operações selecionadas por um código de controle. Como projeto inicial, considere duas entradas de quatro bits, $A$ e $B$, uma seleção de dois bits $S$ e uma saída de quatro bits $F$.

| $S$ | Operação | Definição |
|---|---|---|
| 00 | AND | $F=A\land B$ |
| 01 | OR | $F=A\lor B$ |
| 10 | Soma | $F=(A+B)\bmod 16$ |
| 11 | Subtração | $F=(A-B)\bmod 16$ |

Os sinais de estado podem incluir `Z` (resultado zero), `C` (transporte da soma) e `V` (transbordamento com sinal). É importante **não confundir transporte com transbordamento**: o primeiro diz respeito à operação sem sinal; o segundo, à faixa representável em complemento de dois.

```verilog
module ula4 (
    input  wire [3:0] a, b,
    input  wire [1:0] sel,
    output reg  [3:0] f,
    output wire       z
);
    always @* begin
        case (sel)
            2'b00: f = a & b;
            2'b01: f = a | b;
            2'b10: f = a + b;
            2'b11: f = a - b;
            default: f = 4'b0000;
        endcase
    end
    assign z = (f == 4'b0000);
endmodule
```

Esse exemplo demonstra apenas as operações e o indicador de zero; os indicadores `C` e `V` exigem lógica adicional e devem ser especificados para cada operação. Um teste exaustivo de quatro bits pode percorrer as $16\times16\times4=1024$ combinações de entrada e seleção.

## 25.6. Sistema de aquisição e apresentação de dados

Um sistema de aquisição combina sensor, condicionamento, ADC, controle digital e saída de apresentação ou armazenamento. A especificação deve estabelecer a frequência de amostragem $f_s$, a resolução $N$ e a latência máxima aceitável.

A taxa útil de dados, antes de cabeçalhos e eventuais códigos de integridade, é

$$R_{\mathrm{útil}}=Nf_s.$$

**Exemplo resolvido:** um ADC de 12 bits produz $10\,000$ amostras por segundo. A taxa útil é $120\,000\,\mathrm{bit/s}$. Se cada amostra ocupar uma palavra de 16 bits, o armazenamento exigirá $160\,000\,\mathrm{bit/s}$, equivalentes a $20\,000\,\mathrm{bytes/s}$. Em um minuto, sem metadados, serão necessários $1\,200\,000$ bytes.

<!-- prettier-ignore -->
::: figure Aquisição, processamento e apresentação de dados {#fig-project-acquisition}

```tikz
\begin{tikzpicture}[scale=1.2,transform shape]
\draw[thick] (0,0) rectangle (3.1,2.2);
\draw[thick] (6.0,0) rectangle (9.1,2.2);
\draw[thick] (12.0,0) rectangle (15.1,2.2);
\draw[thick] (18.0,0) rectangle (21.1,2.2);
\node[align=center] at (1.55,1.1) {Sensor e\\condicionamento};
\node at (7.55,1.1) {ADC};
\node[align=center] at (13.55,1.1) {Controle e\\buffer};
\node[align=center] at (19.55,1.1) {Display ou\\memória};
\draw[->,thick] (3.1,1.1)--(6.0,1.1);
\draw[->,thick] (9.1,1.1)--(12.0,1.1);
\draw[->,thick] (15.1,1.1)--(18.0,1.1);
\node[above] at (4.55,1.1) {Analógico};
\node[above] at (10.55,1.1) {Amostras};
\node[above] at (16.55,1.1) {Dados};
\end{tikzpicture}
```

:::

Uma FIFO pode absorver diferenças temporárias entre a produção de amostras e o acesso à memória. O dimensionamento deve considerar a **maior rajada** e a duração máxima de indisponibilidade do destino, não apenas as taxas médias. A interface elétrica e a referência de tensão do ADC devem ser compatíveis com o condicionamento analógico.

**Verificação:** testar perda de amostras, saturação do ADC, validade dos dados, transbordamento da FIFO e correspondência entre valor medido e apresentado.

## 25.7. Controlador baseado em máquina de estados

Este projeto enfatiza a metodologia de construção de uma FSM a partir de requisitos. Considere uma máquina de distribuição que aceita um comando `REQ`, executa uma operação por três ciclos e sinaliza `DONE` por um ciclo. Uma implementação Moore pode empregar os estados `IDLE`, `P1`, `P2`, `P3` e `DONE`.

| Estado | Condição de transição | Próximo estado | `BUSY` | `DONE` |
|---|---|---|---:|---:|
| IDLE | `REQ=0` | IDLE | 0 | 0 |
| IDLE | `REQ=1` | P1 | 0 | 0 |
| P1 | Incondicional | P2 | 1 | 0 |
| P2 | Incondicional | P3 | 1 | 0 |
| P3 | Incondicional | DONE | 1 | 0 |
| DONE | Incondicional | IDLE | 0 | 1 |

A tabela define uma operação com latência de três estados ocupados, seguida de um ciclo de confirmação. Para evitar múltiplas operações por um pedido mantido em nível alto, é necessário definir se `REQ` representa nível ou pulso e, se necessário, incluir detecção de borda ou um protocolo de aceitação.

```verilog
module controlador_fsm (
    input  wire clk, rst, req,
    output wire busy, done
);
    localparam IDLE = 3'd0, P1 = 3'd1,
               P2 = 3'd2, P3 = 3'd3, FIM = 3'd4;
    reg [2:0] estado, proximo;

    always @(posedge clk or posedge rst) begin
        if (rst) estado <= IDLE;
        else     estado <= proximo;
    end

    always @* begin
        proximo = IDLE;
        case (estado)
            IDLE: proximo = req ? P1 : IDLE;
            P1:   proximo = P2;
            P2:   proximo = P3;
            P3:   proximo = FIM;
            FIM:  proximo = IDLE;
            default: proximo = IDLE;
        endcase
    end

    assign busy = (estado == P1) || (estado == P2) || (estado == P3);
    assign done = (estado == FIM);
endmodule
```

**Verificação:** confirmar o reset, a duração exata de `BUSY`, a duração unitária de `DONE`, o comportamento de pedidos durante uma operação e a recuperação de estados não previstos. A simulação deve usar um banco de testes que confira automaticamente a sequência esperada.

## 25.8. Projeto integrado com FPGA

Como síntese dos projetos anteriores, propõe-se um sistema em FPGA que recebe uma entrada analógica por ADC externo, calcula um valor médio sobre uma janela de amostras, apresenta o resultado em display e transmite medições por uma interface serial. Essa arquitetura reúne controle, caminho de dados, memória, temporização e comunicação.

<!-- prettier-ignore -->
::: figure Arquitetura de referência de um projeto integrado em FPGA {#fig-project-fpga-system}

```tikz
\begin{tikzpicture}[scale=1.2,transform shape]
\draw[thick] (0,1.0) rectangle (3.1,3.2);
\node[align=center] at (1.55,2.1) {Sensor\\e ADC};
\draw[thick] (6.0,0.0) rectangle (16.1,4.4);
\node[above] at (11.05,4.4) {FPGA};
\draw[thick] (6.7,1.1) rectangle (10.3,3.3);
\node[align=center] at (8.5,2.2) {Aquisição\\e controle};
\draw[thick] (11.6,1.1) rectangle (15.3,3.3);
\node[align=center] at (13.45,2.2) {Acumulador\\e média};
\draw[thick] (19.0,1.0) rectangle (22.4,3.2);
\node[align=center] at (20.7,2.1) {Display\\e UART};
\draw[->,thick] (3.1,2.2)--(6.7,2.2);
\node[above] at (4.9,2.2) {Amostras};
\draw[->,thick] (10.3,2.2)--(11.6,2.2);
\draw[->,thick] (15.3,2.2)--(19.0,2.2);
\node[above] at (17.15,2.2) {Resultado};
\end{tikzpicture}
```

:::

### Etapas de desenvolvimento

1. **Especificação:** definir resolução, frequência de amostragem, tamanho da janela, precisão da média e formato da mensagem serial.
2. **Arquitetura:** separar controlador, registradores, acumulador, contador de amostras, buffer e interfaces.
3. **Modelagem RTL:** descrever os módulos em VHDL ou Verilog e estabelecer regras de reset e habilitação.
4. **Simulação:** criar estímulos normais e extremos, incluindo entrada máxima, zero, mudanças rápidas e interrupções de transferência.
5. **Síntese e implementação:** atribuir pinos, estabelecer restrições de relógio, analisar utilização de recursos e verificar temporização.
6. **Validação experimental:** comparar os resultados com valores conhecidos e registrar divergências entre simulação e hardware.

Para uma média aritmética de $M$ amostras de $N$ bits sem sinal, o acumulador deve comportar até $M(2^N-1)$. Uma largura suficiente é

$$W=\left\lceil\log_2\!\left(M(2^N-1)+1\right)\right\rceil.$$

Por exemplo, para $N=12$ e $M=16$, o máximo acumulado é $65\,520$, que cabe em 16 bits. A divisão por 16 pode ser realizada por deslocamento de quatro posições, desde que a política de arredondamento seja explicitada. Em uma FPGA real, o tratamento de sinais assíncronos e as restrições de temporização são tão importantes quanto a correção funcional.

### Critérios de avaliação do projeto

| Dimensão | Evidência esperada |
|---|---|
| Especificação | Requisitos mensuráveis e casos de uso |
| Projeto lógico | Diagrama de blocos, tabelas e/ou FSM |
| Implementação | Código ou esquemático organizado em módulos |
| Verificação | Banco de testes e resultados reproduzíveis |
| Temporização | Análise de frequência e interfaces |
| Hardware | Testes de bancada, quando disponível |
| Documentação | Limitações, decisões e resultados registrados |

## Síntese do capítulo

Projetos integradores exigem articular abstrações que, isoladamente, parecem simples. A mesma função lógica pode demandar sincronização de entradas, armazenamento de estado, tratamento de falhas e adaptação elétrica para funcionar em um sistema físico. Um processo consistente começa com requisitos, passa por modelagem e simulação e termina com evidências de verificação. O projeto não está concluído apenas porque sua saída se comportou corretamente em um único ensaio.

## Exercícios e propostas de extensão

1. Expanda o sistema de votação para cinco entradas e determine a condição de maioria.
2. Implemente a função majoritária de três entradas utilizando apenas portas NAND.
3. Acrescente um registrador de confirmação ao sistema de votação e defina seu reset.
4. Proponha um estado de falha para o semáforo, com todas as lâmpadas desligadas ou com sinalização segura conforme os requisitos escolhidos.
5. Determine a largura mínima de um contador que produza uma habilitação de 1 Hz a partir de 100 MHz.
6. Especifique os testes para a transição de 23:59:59 para 00:00:00.
7. Descreva uma estratégia de tratamento de repique para os botões do cronômetro.
8. Projete uma política de bloqueio após três senhas incorretas consecutivas.
9. Calcule a saída da ULA de quatro bits para $A=1111_2$, $B=0001_2$ e $S=10$; discuta transporte e transbordamento.
10. Amplie a ULA para incluir XOR e deslocamento lógico.
11. Determine a taxa de armazenamento para um ADC de 10 bits a 25 ksample/s com palavras de 16 bits.
12. Estime a capacidade mínima de buffer para 20 ms de interrupção de escrita no cenário do exercício anterior.
13. Escreva um banco de testes que verifique o sinal `DONE` da FSM por exatamente um ciclo.
14. Discuta como evitar que um pedido contínuo provoque operações repetidas na FSM.
15. Calcule a largura do acumulador para a média de 32 amostras de 12 bits.
16. Defina um protocolo simples de mensagem UART para o projeto em FPGA, incluindo um mecanismo de detecção de erros.
17. Proponha uma matriz de rastreabilidade entre requisitos e testes para o sistema de aquisição.
18. Compare a implementação de um dos projetos em portas discretas, CPLD e FPGA, considerando recursos, consumo, custo e manutenção.

## Referências e leituras complementares

- MANO, M. Morris; CILETTI, Michael D. *Digital Design*. Pearson.
- WAKERLY, John F. *Digital Design: Principles and Practices*. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. *Digital Design and Computer Architecture*. Morgan Kaufmann.
- BROWN, Stephen; VRANESIC, Zvonko. *Fundamentals of Digital Logic with Verilog Design*. McGraw-Hill.
- IEEE. *IEEE Standard for Verilog Hardware Description Language* (IEEE 1364), para implementações baseadas em Verilog tradicional.
- Documentação do fabricante da FPGA e dos periféricos utilizados, especialmente manuais de temporização, restrições e interfaces elétricas.
