# 24. Sistemas digitais integrados {#chapter-24}

Um sistema digital integrado reúne circuitos combinacionais, elementos de memória, interfaces e mecanismos de controle para realizar uma função completa. Um conversor analógico-digital, isoladamente, transforma uma grandeza em um código; um sistema de aquisição, por sua vez, precisa iniciar conversões, identificar quando os resultados estão disponíveis, transferi-los, armazená-los e eventualmente apresentá-los ou transmiti-los. A integração exige, portanto, raciocinar simultaneamente sobre **função, estado, comunicação e tempo**.

Este capítulo consolida os conhecimentos dos capítulos anteriores. A ênfase não está em um componente específico, mas na passagem de blocos individuais para arquiteturas verificáveis. Estudaremos o particionamento entre caminho de dados e controle, a conexão entre lógica combinacional e sequencial, o fechamento de temporização, a concepção de controladores, a aquisição de dados e uma introdução à organização de processadores. Ao final, examinaremos compromissos de implementação e dois sistemas completos.

## 24.1. Organização em caminho de dados e controle

Uma maneira produtiva de organizar um sistema digital é separar **caminho de dados** (*datapath*) e **unidade de controle**. O caminho de dados contém registradores, multiplexadores, somadores, comparadores, contadores e outros blocos que armazenam ou transformam valores. A unidade de controle determina quais operações ocorrem em cada etapa, produzindo sinais como `LOAD`, `SEL`, `EN` e `WRITE` a partir do estado atual e das condições observadas.

Essa separação é funcional, não necessariamente física: ambos podem ocupar a mesma FPGA ou o mesmo circuito integrado. Ela também não é absoluta, pois um comparador pode fornecer ao controlador uma condição derivada do caminho de dados, enquanto o controlador seleciona entradas e habilita registradores.

<!-- prettier-ignore -->
::: figure Separação funcional entre caminho de dados e unidade de controle {#fig-integrated-datapath-control}

```tikz
\begin{tikzpicture}[scale=1.45,transform shape]
\draw[thick] (0,0) rectangle (4.3,2.7);
\node[align=center] at (2.15,1.35) {Caminho de dados\\registradores, ULA, MUX};
\draw[thick] (8.0,0) rectangle (12.3,2.7);
\node[align=center] at (10.15,1.35) {Unidade de controle\\FSM / sequenciador};
\draw[->,thick] (4.3,1.95)--(8.0,1.95);
\node[above] at (6.15,1.95) {Condições};
\draw[<-,thick] (4.3,0.75)--(8.0,0.75);
\node[below] at (6.15,0.75) {Habilitações e seleção};
\draw[->] (-2.1,1.35)--(0,1.35);
\node[above] at (-1.05,1.35) {Entradas};
\draw[->] (2.15,0)--(2.15,-1.3);
\node[below] at (2.15,-1.3) {Resultados};
\draw[->] (10.15,4.0)--(10.15,2.7);
\node[above] at (10.15,4.0) {Comandos externos};
\end{tikzpicture}
```

:::

Na {@ref fig-integrated-datapath-control}, as setas entre os blocos representam grupos de sinais, não um único fio. O relógio e o sinal de reinicialização, omitidos para simplificar, podem alcançar registradores tanto do caminho de dados quanto da unidade de controle.

Considere um acumulador de $N$ bits que soma um novo operando quando `EN=1`. Seu comportamento pode ser escrito como

$$
A[n+1]=\begin{cases}
0,&\text{se RESET estiver ativo},\\
(A[n]+X[n])\bmod 2^N,&\text{se EN}=1,\\
A[n],&\text{caso contrário}.
\end{cases}
$$

A soma é realizada por lógica combinacional; o registrador atualiza seu conteúdo na borda ativa do relógio. Se o projeto exigir sinalização de transbordamento, a definição dessa condição precisa distinguir aritmética com e sem sinal.

<!-- prettier-ignore -->
::: table Exemplos de elementos do caminho de dados e de controle {#tab-integrated-functional-partition .full-width}

| Elemento | Função predominante | Sinais relevantes |
|:--|:--|:--|
| Registrador | Reter uma palavra | `D`, `Q`, `CLK`, `EN` |
| Multiplexador | Escolher um operando | `SEL` |
| ULA | Executar operações aritméticas e lógicas | `OP`, operandos, flags |
| Comparador | Informar uma condição | `EQ`, `LT`, `GT` |
| Contador | Manter posição ou número de eventos | `EN`, `CLEAR` |
| Máquina de estados | Sequenciar operações | estado, condições, comandos |

:::

## 24.2. Interligação de blocos combinacionais e sequenciais

Em um sistema síncrono, registradores delimitam etapas de processamento. Entre dois conjuntos de registradores pode existir uma rede combinacional, cuja saída precisa estabilizar antes da próxima borda de captura. Essa organização permite decompor um sistema complexo em transferências de registrador (*register transfers*).

<!-- prettier-ignore -->
::: figure Caminho síncrono entre registradores {#fig-integrated-register-path}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape]
\draw[thick] (0,0) rectangle (2.5,2.0);
\draw[thick] (5.3,0) rectangle (8.5,2.0);
\draw[thick] (11.3,0) rectangle (13.8,2.0);
\node[align=center] at (1.25,1.0) {Registrador\\de origem};
\node[align=center] at (6.9,1.0) {Lógica\\combinacional};
\node[align=center] at (12.55,1.0) {Registrador\\de destino};
\draw[->,thick] (2.5,1.0)--(5.3,1.0);
\node[above] at (3.9,1.0) {$Q$};
\draw[->,thick] (8.5,1.0)--(11.3,1.0);
\node[above] at (9.9,1.0) {$D$};
\draw[->] (1.25,-1.8)--(1.25,0);
\draw[->] (12.55,-1.8)--(12.55,0);
\node[below] at (6.9,-1.8) {$CLK$ comum (distribuição não representada)};
\end{tikzpicture}
```

:::

O diagrama da {@ref fig-integrated-register-path} pressupõe um único domínio de relógio. Em um projeto real, cada registrador possui atrasos de propagação, requisitos de estabelecimento e retenção, além de possíveis diferenças na chegada do relógio. A conexão direta de uma entrada assíncrona a vários registradores não elimina a possibilidade de metastabilidade; a estratégia de sincronização deve ser apropriada à natureza do sinal.

### Exemplo: registrador habilitado

Uma descrição RTL concisa de um registrador com habilitação é:

```verilog
module enabled_register #(
    parameter WIDTH = 8
) (
    input  wire                 clk,
    input  wire                 rst,
    input  wire                 en,
    input  wire [WIDTH-1:0]     d,
    output reg  [WIDTH-1:0]     q
);
    always @(posedge clk) begin
        if (rst)
            q <= {WIDTH{1'b0}};
        else if (en)
            q <= d;
    end
endmodule
```

O reinício apresentado é **síncrono**. Quando `en=0`, a ausência de atribuição dentro do processo acionado por borda significa retenção do valor anterior; não implica a criação de um *latch*. Já em processos combinacionais, atribuições incompletas podem inferir armazenamento indesejado.

## 24.3. Temporização global do sistema

O período do relógio deve comportar o atraso do registrador de origem, a propagação pela lógica e pelas interconexões e o tempo de estabelecimento do registrador de destino. Para um caminho de um mesmo domínio, uma forma simplificada da restrição é

$$
T_{CLK}\ge t_{CQ,\max}+t_{comb,\max}+t_{setup}+t_{skew,\mathrm{efetivo}}+t_{margem},
$$

em que o termo de *skew* efetivo é definido com sinal conservador para representar uma diferença desfavorável de chegada do relógio. Em análise estática real, o cálculo depende das bordas de lançamento e captura, das incertezas e das restrições configuradas.

O requisito de retenção (*hold*) é diferente: ele impõe um limite **mínimo** ao atraso do caminho, e não é corrigido simplesmente reduzindo a frequência do relógio. Em uma convenção simplificada,

$$
t_{CQ,\min}+t_{comb,\min}\ge t_{hold}+t_{skew,\mathrm{hold}}.
$$

**Exemplo resolvido 1 — Frequência máxima.** Suponha $t_{CQ,\max}=0{,}7\,\mathrm{ns}$, $t_{comb,\max}=5{,}2\,\mathrm{ns}$, $t_{setup}=0{,}6\,\mathrm{ns}$ e uma margem total desfavorável de $0{,}5\,\mathrm{ns}$. Então

$$T_{CLK,\min}=0{,}7+5{,}2+0{,}6+0{,}5=7{,}0\,\mathrm{ns},$$

$$f_{\max}\approx\frac{1}{7{,}0\,\mathrm{ns}}\approx142{,}9\,\mathrm{MHz}.$$

Esse valor é uma estimativa do caminho analisado, não uma garantia de desempenho do circuito inteiro. A frequência máxima depende do pior caminho relevante e da implementação física.

<!-- prettier-ignore -->
::: table Problemas de temporização e respostas de projeto {#tab-integrated-timing-issues .full-width}

| Problema | Consequência possível | Estratégia típica |
|:--|:--|:--|
| Caminho combinacional longo | Violação de *setup* | Redução da lógica, paralelismo ou *pipeline* |
| Caminho excessivamente curto | Violação de *hold* | Ajuste de atrasos na implementação física |
| Entrada assíncrona | Metastabilidade | Sincronizador ou protocolo de transferência |
| Cruzamento de barramento entre domínios | Palavra inconsistente | *Handshake*, FIFO assíncrona ou codificação apropriada |
| Distribuição inadequada de clock | *Skew* e incerteza | Rede de relógio e restrições corretas |

:::

### Latência e vazão

A introdução de registradores intermediários (*pipeline*) pode reduzir a lógica por estágio e aumentar a frequência, mas acrescenta ciclos de latência. Em regime permanente, um pipeline pode entregar um resultado por ciclo mesmo quando cada resultado individual percorre vários estágios. **Latência** e **vazão** são métricas diferentes e devem ser especificadas separadamente.

## 24.4. Projeto de controladores

Um controlador sequencial pode ser descrito como uma máquina de estados finitos (FSM). Para cada estado, definem-se as saídas de controle e as condições de transição. A escolha entre os modelos de Moore e Mealy depende, entre outros fatores, dos requisitos de temporização das saídas.

Considere um controlador que recebe `START`, aciona `REQ` para iniciar uma operação e aguarda `DONE` para registrar sua conclusão. Uma especificação simples utiliza três estados: `IDLE`, `WAIT` e `FINISH`.

<!-- prettier-ignore -->
::: figure Máquina de estados de um controlador de operação {#fig-integrated-controller-fsm}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape,>=stealth]
\node[draw,rounded corners,minimum width=2.8cm,minimum height=1.1cm] (idle) at (0,0) {IDLE};
\node[draw,rounded corners,minimum width=2.8cm,minimum height=1.1cm] (wait) at (6,0) {WAIT};
\node[draw,rounded corners,minimum width=2.8cm,minimum height=1.1cm] (finish) at (12,0) {FINISH};
\draw[->,thick] (idle) to[bend left=18] node[above] {$START=1$} (wait);
\draw[->,thick] (wait) to[bend left=18] node[above] {$DONE=1$} (finish);
\draw[->,thick] (finish.south) -- ++(0,-2.0) -| (idle.south);
\node[below] at (6,-2.0) {Próxima borda de relógio};
\draw[->] (idle) edge[loop above] node {$START=0$} (idle);
\draw[->] (wait) edge[loop above] node {$DONE=0$} (wait);
\end{tikzpicture}
```

:::

Na {@ref fig-integrated-controller-fsm}, `REQ` pode permanecer ativo em `WAIT` e `COMPLETE` pode ser ativado em `FINISH`. Essa escolha é apenas um exemplo de protocolo: alguns periféricos exigem um pulso de solicitação, enquanto outros utilizam níveis mantidos até o reconhecimento. O contrato de interface deve definir explicitamente essas condições.

<!-- prettier-ignore -->
::: table Transições e saídas do controlador {#tab-integrated-controller-states .full-width}

| Estado | Condição | Próximo estado | `REQ` | `COMPLETE` |
|:--|:--|:--|:--:|:--:|
| `IDLE` | `START=0` | `IDLE` | 0 | 0 |
| `IDLE` | `START=1` | `WAIT` | 0 | 0 |
| `WAIT` | `DONE=0` | `WAIT` | 1 | 0 |
| `WAIT` | `DONE=1` | `FINISH` | 1 | 0 |
| `FINISH` | qualquer | `IDLE` | 0 | 1 |

:::

A tabela adota saídas de Moore. Um comando `START` mantido em nível alto pode iniciar uma nova operação quando a FSM retornar a `IDLE`; se isso não for desejado, o projeto deve exigir liberação do comando ou detectar uma borda válida. Também é necessário definir a recuperação após reinicialização e a reação a um `DONE` que nunca chega, por exemplo por meio de um *timeout*.

## 24.5. Sistemas de aquisição de dados

Um sistema de aquisição de dados pode combinar condicionamento analógico, filtro antialiasing, ADC, controlador, buffer e memória. A frequência de amostragem, a resolução e o formato de armazenamento determinam a taxa de produção de dados, enquanto a interface de memória determina a capacidade de absorvê-los.


<!-- prettier-ignore -->
::: figure Arquitetura de aquisição com buffer e armazenamento {#fig-integrated-acquisition-buffer}

```tikz
\begin{tikzpicture}[scale=1.25,transform shape]
% Blocos funcionais
\draw[thick] (0,0) rectangle (2.8,2.2);
\draw[thick] (5.5,0) rectangle (8.3,2.2);
\draw[thick] (11.0,0) rectangle (13.8,2.2);
\draw[thick] (16.5,0) rectangle (19.3,2.2);
\draw[thick] (22.0,0) rectangle (24.8,2.2);

% Identificacao dos blocos
\node[align=center] at (1.4,1.1) {Filtro\\analógico};
\node at (6.9,1.1) {ADC};
\node at (12.4,1.1) {Controlador};
\node at (17.9,1.1) {FIFO};
\node at (23.4,1.1) {Memória};

% Entrada analogica
\draw[->,thick] (-2.0,1.1)--(0,1.1);
\node[above] at (-1.0,1.1) {$v(t)$};

% Conexoes entre os blocos
\draw[->,thick] (2.8,1.1)--(5.5,1.1);
\draw[->,thick] (8.3,1.1)--(11.0,1.1);
\draw[->,thick] (13.8,1.1)--(16.5,1.1);
\draw[->,thick] (19.3,1.1)--(22.0,1.1);

% Rotulos das conexoes
\node[above] at (4.15,1.1) {Sinal};
\node[above] at (9.65,1.1) {Amostras};
\node[above] at (15.15,1.1) {Dados};
\node[above] at (20.65,1.1) {Dados};
\end{tikzpicture}
```

:::

A FIFO (*first in, first out*) desacopla a chegada das amostras das variações de latência do armazenamento. Contudo, uma FIFO finita não resolve uma diferença permanente entre a taxa de entrada e a taxa de saída: se a taxa média de escrita for inferior à de produção, o buffer acabará transbordando.

Se um ADC produz $N$ bits por amostra a uma frequência $f_s$, a taxa útil é

$$R_{\mathrm{útil}}=Nf_s.$$

Se cada amostra ocupar uma palavra de memória de $W$ bits, com $W\ge N$, a taxa de armazenamento em bits será

$$R_{\mathrm{mem}}=Wf_s,$$

sem contar cabeçalhos, metadados e alinhamento adicional.

**Exemplo resolvido 2 — Aquisição contínua.** Um ADC de 12 bits produz $80\,000$ amostras por segundo, armazenadas em palavras de 16 bits. A taxa útil é $960\,000\ \mathrm{bit/s}$, enquanto a taxa de escrita é $1\,280\,000\ \mathrm{bit/s}=160\,000\ \mathrm{byte/s}$. Para $60\,\mathrm{s}$, o armazenamento mínimo dos dados brutos é

$$160\,000\times60=9\,600\,000\ \mathrm{bytes}\approx9{,}6\ \mathrm{MB}.$$

Se o destino puder ficar indisponível por $20\,\mathrm{ms}$, a FIFO precisa acomodar pelo menos $80\,000\times0{,}020=1\,600$ amostras **durante esse intervalo**, supondo que não haja consumo e desconsiderando margens. O dimensionamento final exige avaliar rajadas, sinalização de cheio e comportamento em caso de perda de amostras.

## 24.6. Introdução à organização de processadores

Um processador é um sistema digital programável que busca instruções, interpreta seus campos e executa operações sobre dados. Uma organização didática contém **contador de programa (PC)**, memória de instruções, banco de registradores, ULA, unidade de controle e interface de memória de dados. Processadores reais podem empregar caches, pipelines, execução fora de ordem e outros recursos que ultrapassam o escopo introdutório deste capítulo.

<!-- prettier-ignore -->
::: figure Organização funcional simplificada de um processador {#fig-integrated-processor-blocks}

```tikz
\begin{tikzpicture}[scale=1.35,transform shape]
\draw[thick] (0,3.0) rectangle (3.2,5.0);
\node[align=center] at (1.6,4.0) {PC e busca\\de instruções};
\draw[thick] (6.3,3.0) rectangle (9.5,5.0);
\node[align=center] at (7.9,4.0) {Decodificação\\e controle};
\draw[thick] (0,-0.5) rectangle (3.2,1.5);
\node[align=center] at (1.6,0.5) {Banco de\\registradores};
\draw[thick] (6.3,-0.5) rectangle (9.5,1.5);
\node at (7.9,0.5) {ULA};
\draw[thick] (12.6,-0.5) rectangle (15.8,1.5);
\node[align=center] at (14.2,0.5) {Interface\\de memória};
\draw[->] (3.2,4.0)--(6.3,4.0);
\node[above] at (4.75,4.0) {Instrução};
\draw[->] (7.9,3.0)--(7.9,1.5);
\node[right] at (7.9,2.25) {Operação};
\draw[<->] (3.2,0.5)--(6.3,0.5);
\node[above] at (4.75,0.5) {Operandos};
\draw[<->] (9.5,0.5)--(12.6,0.5);
\node[above] at (11.05,0.5) {Dados};
\draw[->] (1.6,3.0)--(1.6,1.5);
\node[right] at (1.6,2.25) {Endereço};
\end{tikzpicture}
```

:::

A {@ref fig-integrated-processor-blocks} é uma visão conceitual: a localização física de memórias e os caminhos efetivos de dados variam entre arquiteturas. Em uma máquina de ciclo múltiplo, as etapas de busca, decodificação e execução podem compartilhar recursos em instantes diferentes. Em uma máquina com pipeline, diferentes instruções ocupam simultaneamente etapas distintas, exigindo mecanismos para tratar dependências e desvios.

Uma instrução como `ADD R1, R2, R3` pode ser interpretada, abstratamente, como $R_1\leftarrow R_2+R_3$. O banco de registradores fornece operandos, a ULA efetua a soma e o resultado é escrito no destino. A unidade de controle determina as seleções e habilitações necessárias. Esse exemplo ilustra como as operações estudadas em circuitos combinacionais e sequenciais formam uma arquitetura programável.

## 24.7. Compromissos entre desempenho, consumo e custo

Projetar um sistema digital envolve conciliar objetivos que podem competir entre si. Uma solução com maior paralelismo tende a exigir mais recursos; aumentar a frequência pode elevar a potência dinâmica e dificultar a integridade dos sinais; introduzir buffers melhora o desacoplamento temporal, mas consome memória e acrescenta latência.

Uma aproximação frequente para a potência dinâmica de circuitos CMOS é

$$P_{din}\approx\alpha C_{ef}V_{DD}^{2}f,$$

em que $\alpha$ representa a atividade de comutação, $C_{ef}$ a capacitância efetivamente comutada, $V_{DD}$ a tensão de alimentação e $f$ a frequência. A potência total inclui também parcelas estáticas e outras perdas, de modo que essa expressão não substitui a análise energética do dispositivo.

<!-- prettier-ignore -->
::: table Compromissos de arquitetura em sistemas digitais {#tab-integrated-design-tradeoffs .full-width}

| Decisão | Benefício potencial | Custo ou risco associado |
|:--|:--|:--|
| Aumentar paralelismo | Maior vazão | Mais área, conexões e potência |
| Inserir pipeline | Maior frequência | Mais registradores e latência |
| Usar FIFO | Absorver rajadas e latências | Área de memória e controle de fluxo |
| Reduzir largura de palavra | Menor armazenamento e tráfego | Perda de faixa ou precisão |
| Elevar frequência de clock | Menor tempo por ciclo | Maior consumo e restrições temporais |
| Usar FPGA | Reconfiguração e desenvolvimento ágil | Restrições de recursos, potência e custo |
| Usar lógica dedicada | Otimização para função específica | Menor flexibilidade de alteração |

:::

A comparação de alternativas deve considerar não apenas o custo unitário do componente, mas também desenvolvimento, testes, manutenção, disponibilidade, segurança, consumo em operação e possibilidade de atualização.

### Exemplo: escolher a largura do barramento

Para transportar uma taxa útil de $R$ bits/s por uma interface que transfere $W$ bits a cada ciclo, com eficiência de transferência $\eta$, uma estimativa é

$$f\ge\frac{R}{W\eta}.$$

Se $R=80\,\mathrm{Mbit/s}$ e $\eta=0{,}8$, um barramento de 8 bits exige pelo menos $12{,}5\,\mathrm{MHz}$; com 16 bits, a frequência mínima ideal cai para $6{,}25\,\mathrm{MHz}$. A decisão real também depende de pinos, temporização e organização do protocolo.

## 24.8. Exemplos de sistemas digitais completos

### 24.8.1. Sistema de aquisição e registro de temperatura

Considere um sistema que mede periodicamente uma tensão proporcional à temperatura, converte o valor em uma palavra digital, acrescenta uma marca de tempo e armazena o registro. Uma arquitetura possível contém sensor e condicionamento, ADC, contador de tempo, controlador de aquisição, FIFO e memória não volátil.

**Especificação funcional ilustrativa:** uma amostra a cada $10\,\mathrm{ms}$; conversão iniciada pelo controlador; escrita somente quando `DATA_VALID=1`; contador de amostras incrementado após aceitação; sinalização de erro se a FIFO ficar cheia. A seleção dos componentes requer verificar se o tempo de conversão e a latência máxima de escrita são compatíveis com o período de amostragem.


<!-- prettier-ignore -->
::: figure Fluxo de aquisição e armazenamento com controle de validade {#fig-integrated-acquisition-flow}

```tikz
\begin{tikzpicture}[scale=1.3,transform shape]
% Blocos funcionais
\draw[thick] (0,0) rectangle (3.0,2.2);
\draw[thick] (6.0,0) rectangle (9.0,2.2);
\draw[thick] (12.0,0) rectangle (15.0,2.2);
\draw[thick] (18.0,0) rectangle (21.0,2.2);

% Identificacao dos blocos
\node[align=center] at (1.5,1.1) {Sensor e\\condicionamento};
\node at (7.5,1.1) {ADC};
\node[align=center] at (13.5,1.1) {Controle e\\registro};
\node[align=center] at (19.5,1.1) {FIFO e\\memória};

% Conexoes entre os blocos
\draw[->,thick] (3.0,1.1)--(6.0,1.1);
\draw[->,thick] (9.0,1.1)--(12.0,1.1);
\draw[->,thick] (15.0,1.1)--(18.0,1.1);

% Rotulos das conexoes
\node[above] at (4.5,1.1) {Analógico};
\node[above] at (10.5,1.1) {Amostra};
\node[above] at (16.5,1.1) {Registro};
\end{tikzpicture}
```

:::

A validação deve incluir variação de entrada, reinicialização durante a aquisição, memória temporariamente indisponível, perda de alimentação e recuperação após erro. Em sistemas reais, também importam a calibração do sensor, a precisão da referência de tensão e a proteção contra perturbações externas.

### 24.8.2. Controlador de acesso digital

Um segundo exemplo é um controlador que recebe uma sequência de dígitos, compara-a a uma senha armazenada e aciona uma saída durante um intervalo determinado. O caminho de dados contém registrador de entrada, contador de dígitos e comparador; a unidade de controle coordena os estados `ESPERA`, `RECEBIMENTO`, `VERIFICAÇÃO`, `AUTORIZADO` e `NEGADO`.

O projeto precisa definir o que acontece com entradas inválidas, tempo limite entre dígitos, tentativas sucessivas e reinicialização. Para aplicações reais de segurança, uma comparação simples de senha não basta: armazenamento protegido, resistência a ataques, controle de tentativas e requisitos de segurança física exigem mecanismos adicionais.

### Verificação de um sistema integrado

A verificação deve conectar cada requisito a pelo menos um teste. Não basta comprovar isoladamente que o ADC converte, que a memória escreve e que o controlador transita entre estados; é preciso demonstrar que **a sequência completa funciona sob temporizações e falhas plausíveis**.

<!-- prettier-ignore -->
::: table Exemplo de matriz de verificação para aquisição de dados {#tab-integrated-verification-matrix .full-width}

| Requisito | Estímulo | Resultado esperado |
|:--|:--|:--|
| Amostrar na cadência definida | Gerar pulsos periódicos de amostragem | Uma solicitação por período |
| Não armazenar dado inválido | Manter `DATA_VALID=0` | Nenhuma escrita |
| Preservar ordem das amostras | Inserir sequência conhecida | Mesma sequência na memória |
| Detectar buffer cheio | Bloquear temporariamente o destino | Sinalização de overflow conforme especificação |
| Reinicializar de forma definida | Aplicar `RESET` durante operação | Retorno ao estado inicial sem escrita espúria |

:::

## Síntese do capítulo

A integração de sistemas digitais exige articular arquitetura, temporização e comportamento funcional. O particionamento entre caminho de dados e controle facilita a compreensão e a verificação; registradores delimitam transferências síncronas; controladores coordenam operações; buffers desacoplam ritmos distintos; e a análise de desempenho deve distinguir vazão, latência e consumo. Em todos os casos, a implementação correta depende de requisitos verificáveis e de testes que incluam condições normais e de exceção.

## Exercícios propostos

1. Diferencie caminho de dados e unidade de controle e apresente dois exemplos de sinais trocados entre eles.
2. Desenhe o caminho de dados de um acumulador de 8 bits com habilitação e reinicialização síncrona.
3. Explique por que a saída de um circuito combinacional não deve ser tratada automaticamente como estável durante toda a duração de um ciclo.
4. Um caminho possui $t_{CQ}=0{,}8\,\mathrm{ns}$, $t_{comb}=6{,}1\,\mathrm{ns}$, $t_{setup}=0{,}7\,\mathrm{ns}$ e margem de $0{,}4\,\mathrm{ns}$. Estime o período mínimo e a frequência máxima.
5. Explique a diferença entre uma violação de *setup* e uma violação de *hold*.
6. Descreva uma situação em que uma FIFO assíncrona seja mais apropriada que um registrador simples.
7. Diferencie latência e vazão em um pipeline de quatro estágios.
8. Projete uma FSM que aceite `START`, espere `DONE` e produza um pulso `COMPLETE`. Defina como evitar reinício indesejado quando `START` permanecer alto.
9. Proponha uma estratégia de *timeout* para o controlador do exercício anterior.
10. Um ADC de 14 bits gera $25\,000$ amostras/s e cada amostra ocupa 16 bits na memória. Calcule as taxas útil e armazenada e o espaço necessário para dez minutos.
11. Uma memória fica indisponível por $15\,\mathrm{ms}$ enquanto chegam $40\,000$ amostras/s. Determine o número mínimo de posições para absorver essa interrupção, sem margens.
12. Explique as funções do PC, do banco de registradores, da ULA e da unidade de controle em um processador didático.
13. Compare uma implementação de ciclo múltiplo com uma implementação em pipeline quanto a compartilhamento de recursos e latência.
14. Estime a razão entre potências dinâmicas de dois circuitos com mesma atividade e capacitância, mas tensões de alimentação de $1{,}0\,\mathrm{V}$ e $1{,}2\,\mathrm{V}$, operando na mesma frequência.
15. Um enlace precisa transmitir $120\,\mathrm{Mbit/s}$ com eficiência de $75\%$. Calcule a frequência mínima de um barramento de 16 bits com uma transferência por ciclo.
16. Elabore uma matriz de verificação para um controlador de acesso com três tentativas permitidas.
17. Identifique três condições de falha relevantes em um sistema de aquisição contínua e descreva a resposta esperada para cada uma.
18. Proponha uma arquitetura integrada que leia sensores, processe resultados e transmita dados por uma interface serial. Justifique os blocos e a estratégia de temporização.

## Referências bibliográficas

- WAKERLY, John F. *Digital Design: Principles and Practices*. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. *Digital Design and Computer Architecture*. Morgan Kaufmann.
- MANO, M. Morris; CILETTI, Michael D. *Digital Design*. Pearson.
- PATTERSON, David A.; HENNESSY, John L. *Computer Organization and Design*. Morgan Kaufmann.
- IEEE. *IEEE Standard for SystemVerilog—Unified Hardware Design, Specification, and Verification Language* (IEEE 1800). Consultar a edição aplicável.
- Documentação dos fabricantes dos FPGAs, conversores, memórias e controladores utilizados, incluindo restrições de temporização e características elétricas.
