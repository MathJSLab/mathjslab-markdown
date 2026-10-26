# 22. Metodologia de projeto e verificação digital {#chapter-22}

Nos capítulos anteriores, foram estudados os circuitos combinacionais e sequenciais, as tecnologias de implementação e as linguagens de descrição de hardware (HDLs). O domínio dessas técnicas, entretanto, não garante isoladamente que um sistema digital satisfaça sua finalidade. É necessário estabelecer um **processo de projeto** no qual requisitos, arquitetura, implementação e evidências de verificação permaneçam relacionados.

Um projeto pode apresentar uma descrição HDL sintaticamente correta e, ainda assim, conter uma interpretação equivocada dos requisitos, um erro de protocolo, uma violação de temporização ou uma interface elétrica incompatível. Por isso, a metodologia deve distinguir **verificação** — avaliação da conformidade com uma especificação — de **validação** — avaliação da adequação do sistema à aplicação pretendida. Essa distinção orienta todo o capítulo.

O desenvolvimento será ilustrado por um **controlador síncrono de requisições**, cuja entrada `req` solicita uma operação e cuja saída `done` sinaliza sua conclusão. O exemplo é deliberadamente pequeno: permite acompanhar o mesmo requisito desde sua formulação até os ensaios, sem confundir o método com a complexidade de um produto particular.

## 22.1. Especificação de requisitos

A **especificação de requisitos** estabelece o comportamento observável e as condições em que ele deve ser garantido. Um requisito útil deve ser compreensível, verificável e suficientemente preciso para distinguir implementações conformes das não conformes. Expressões como “responder rapidamente” ou “funcionar sem falhas” são insuficientes quando não acompanhadas de critérios mensuráveis.

Os requisitos podem ser classificados, para fins de organização, em **funcionais**, **temporais**, **elétricos**, **ambientais** e **de implementação**. Um requisito funcional define uma relação entre entradas, saídas e estados; um requisito temporal estabelece limites de latência ou frequência; requisitos elétricos especificam tensões, correntes e condições de interface. Restrições de área, potência e recursos podem orientar a arquitetura, mas não substituem a descrição do comportamento esperado.

<!-- prettier-ignore -->
::: table Exemplo de requisitos verificáveis para um controlador síncrono {#tab-method-requirements .full-width}

| Identificador | Requisito | Critério de verificação |
|:--|:--|:--|
| RF-01 | Uma solicitação `req` deve ser aceita quando o controlador estiver ocioso. | Aplicar `req=1` no estado ocioso e observar a transição especificada. |
| RF-02 | A conclusão deve ser indicada por `done=1` durante um ciclo de relógio. | Contar os ciclos em que `done` permanece ativo. |
| RF-03 | Uma solicitação mantida em nível alto não deve iniciar repetidamente novas operações. | Manter `req=1` e observar a ausência de novas aceitações até seu retorno a zero. |
| RT-01 | A conclusão deve ser indicada após a borda de relógio seguinte à aceitação. | Comparar os instantes de aceitação e de conclusão em bordas de relógio. |
| RI-01 | O reset síncrono deve levar o controlador ao estado ocioso na próxima borda ativa. | Acionar o reset e observar o estado após a borda. |

:::

O exemplo pressupõe que `req` e o reset atendam aos requisitos de temporização em relação ao relógio. Se `req` vier de outro domínio de relógio ou de um dispositivo assíncrono, serão necessários mecanismos adicionais de sincronização e uma especificação própria para a travessia de domínios. Não se deve supor que a simples presença de um registrador elimine todos os riscos de metastabilidade.

Um requisito deve ser acompanhado por sua **origem**, prioridade, versão e procedimento de aceitação. Quando uma mudança altera a latência, por exemplo, ela pode afetar simultaneamente a máquina de estados, os bancos de testes, as restrições temporais e a documentação de interface.

## 22.2. Decomposição funcional e arquitetura

A **arquitetura** divide o sistema em blocos com responsabilidades e interfaces definidas. Essa decomposição facilita a análise e permite verificar cada componente antes da integração. Um bloco não deve ser definido apenas por sua aparência em um diagrama: suas entradas, saídas, temporização e condições excepcionais precisam ser especificadas.

No controlador ilustrativo, podemos separar o **caminho de controle**, que determina a sequência de estados, e a **interface de requisição**, que recebe `req` e produz `done`. Em sistemas maiores, essa distinção se estende ao caminho de dados (*datapath*), formado por registradores, operadores e multiplexadores, e à unidade de controle, que coordena suas operações.

<!-- prettier-ignore -->
::: figure Decomposição funcional de um sistema digital {#fig-method-architecture}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\draw[thick] (2.0,0.6) rectangle (6.4,3.6);
\node at (4.2,3.2) {Controlador};
\draw[thick] (2.55,1.15) rectangle (5.85,2.55);
\node[align=center] at (4.2,1.85) {Máquina de estados\\e lógica de saída};
\draw[->] (-0.5,2.45)--(2.0,2.45);
\node[above] at (0.7,2.45) {$req$};
\draw[->] (-0.5,1.15)--(2.0,1.15);
\node[below] at (0.7,1.15) {$reset$};
\draw[->] (6.4,2.45)--(8.9,2.45);
\node[above] at (7.65,2.45) {$done$};
\draw[->] (4.2,-0.8)--(4.2,0.6);
\node[right] at (4.35,-0.35) {$CLK$};
\end{tikzpicture}
```

:::

A {@ref fig-method-architecture} identifica a fronteira do módulo e os sinais de sua interface. Em uma arquitetura real, a especificação também deve estabelecer a polaridade do reset, a borda ativa do relógio, os níveis lógicos, o tratamento de entradas inválidas e as regras de comunicação com os blocos vizinhos.

A divisão em módulos deve equilibrar **coesão** e **acoplamento**: cada módulo deve reunir uma responsabilidade identificável e depender de interfaces explícitas. Uma decomposição excessiva pode criar complexidade de integração; uma decomposição insuficiente dificulta testes e reutilização.

## 22.3. Modelagem e simulação

A **modelagem** transforma a arquitetura em representações que permitem raciocinar sobre o comportamento antes da implementação física. Tabelas de transição, diagramas de estados, expressões booleanas, modelos temporais e descrições HDL são representações complementares. O modelo deve deixar claro o que acontece a cada borda de relógio e quais sinais são combinacionais.

Para o controlador, adotaremos quatro estados: `IDLE`, `WORK1`, `WORK2` e `WAIT_LOW`. Uma solicitação é aceita em `IDLE` quando `req=1`; o controlador passa por dois estados de processamento e indica a conclusão em `WORK2`. O estado `WAIT_LOW` impede que uma entrada mantida em nível alto produza aceitações repetidas. Nesta convenção, `done` é uma saída de Moore ativa enquanto o estado corrente é `WORK2`, entre a primeira e a segunda bordas seguintes à aceitação.

<!-- prettier-ignore -->
::: table Transições do controlador de exemplo {#tab-method-state-transitions .full-width}

| Estado presente | Condição | Próximo estado | `done` |
|:--|:--|:--|:--:|
| `IDLE` | `req=0` | `IDLE` | 0 |
| `IDLE` | `req=1` | `WORK1` | 0 |
| `WORK1` | Qualquer valor de `req` | `WORK2` | 0 |
| `WORK2` | Qualquer valor de `req` | `WAIT_LOW` | 1 |
| `WAIT_LOW` | `req=1` | `WAIT_LOW` | 0 |
| `WAIT_LOW` | `req=0` | `IDLE` | 0 |

:::

<!-- prettier-ignore -->
::: example Modelo RTL do controlador em Verilog {#ex-method-controller-rtl}

```verilog
module controlador (
    input  wire clk,
    input  wire rst,
    input  wire req,
    output wire done
);
    localparam [1:0] IDLE     = 2'd0,
                     WORK1    = 2'd1,
                     WORK2    = 2'd2,
                     WAIT_LOW = 2'd3;

    reg [1:0] state, next_state;

    always @(*) begin
        next_state = state;
        case (state)
            IDLE:     if (req)  next_state = WORK1;
            WORK1:              next_state = WORK2;
            WORK2:              next_state = WAIT_LOW;
            WAIT_LOW: if (!req) next_state = IDLE;
            default:            next_state = IDLE;
        endcase
    end

    always @(posedge clk) begin
        if (rst)
            state <= IDLE;
        else
            state <= next_state;
    end

    assign done = (state == WORK2);
endmodule
```

:::

O código é compatível com a estrutura de uma máquina de Moore e separa a lógica de próximo estado do registrador de estado. A atribuição inicial `next_state = state` evita armazenamento acidental na lógica combinacional. O reset é **síncrono**: seu efeito sobre o estado ocorre na borda de subida de `clk`, não imediatamente quando `rst` muda.

A simulação RTL verifica a lógica descrita, mas não reproduz automaticamente atrasos físicos, integridade de sinal ou condições elétricas da placa. É necessário construir cenários que incluam operação nominal, reset durante a operação, solicitações mantidas e sequências próximas às fronteiras de estado.

## 22.4. Síntese e otimização

A **síntese lógica** transforma uma descrição HDL sintetizável em uma rede de elementos lógicos e de armazenamento. A representação intermediária pode ser otimizada por simplificação booleana, propagação de constantes, compartilhamento de recursos e recodificação de estados. Em FPGA, o mapeamento utiliza recursos como LUTs, flip-flops, blocos de memória e operadores especializados, conforme o dispositivo.

<!-- prettier-ignore -->
::: figure Etapas conceituais entre especificação e implementação {#fig-method-design-flow}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (0,0) rectangle (3.0,1.5);
\draw[thick] (4.7,0) rectangle (7.7,1.5);
\draw[thick] (9.4,0) rectangle (12.4,1.5);
\draw[thick] (14.1,0) rectangle (17.1,1.5);
\node[align=center] at (1.5,0.75) {Requisitos\\e arquitetura};
\node[align=center] at (6.2,0.75) {Modelo RTL\\e simulação};
\node[align=center] at (10.9,0.75) {Síntese\\e mapeamento};
\node[align=center] at (15.6,0.75) {Implementação\\e ensaios};
\draw[->] (3.0,0.75)--(4.7,0.75);
\draw[->] (7.7,0.75)--(9.4,0.75);
\draw[->] (12.4,0.75)--(14.1,0.75);
\end{tikzpicture}
```

:::

A {@ref fig-method-design-flow} representa uma sequência conceitual, não um processo irreversível. Resultados de simulação, síntese e ensaios podem exigir revisão da arquitetura e dos requisitos. A verificação deve acompanhar cada etapa, e não ocorrer somente após a implementação.

O relatório de síntese deve ser examinado criticamente. Uma contagem inesperada de registradores pode indicar duplicação de armazenamento ou inferência indesejada; uma frequência estimada insuficiente pode exigir redução do caminho combinacional, segmentação em estágios ou mudança de arquitetura. A otimização deve respeitar a equivalência funcional e as restrições do projeto.

## 22.5. Análise estática de temporização

A **análise estática de temporização** (*static timing analysis*, STA) verifica relações de tempo em caminhos do circuito sem depender de vetores de estímulo específicos. Ela utiliza um modelo de atrasos e restrições que definem relógios, interfaces e exceções legítimas. A análise deve contemplar condições de operação e modelos tecnológicos adequados.

Para um caminho síncrono de registrador a registrador, uma condição simplificada de *setup* é

$$
T_{clk}\geq t_{CQ,\max}+t_{comb,\max}+t_{setup}-t_{skew}+t_{unc},
$$

em que $t_{CQ,\max}$ é o maior atraso entre a borda do relógio e a saída do registrador de origem, $t_{comb,\max}$ é o maior atraso da lógica combinacional, $t_{setup}$ é o tempo de preparação do registrador de destino, $t_{skew}$ é a chegada do relógio ao destino menos a chegada à origem, e $t_{unc}$ é uma margem de incerteza aplicável ao teste. A convenção de sinais deve ser mantida ao interpretar o relatório.

A condição simplificada de *hold* pode ser escrita como

$$
t_{CQ,\min}+t_{comb,\min}\geq t_{hold}+t_{skew}+t_{unc,h}.
$$

Um deslocamento positivo do relógio pode favorecer *setup* e prejudicar *hold*. A ferramenta também deve analisar caminhos entre entradas e registradores e entre registradores e saídas, desde que as restrições de interface estejam corretamente definidas. Caminhos assíncronos e travessias de domínios de relógio exigem tratamento específico; simplesmente declarar um caminho falso não corrige problemas de sincronização.

<!-- prettier-ignore -->
::: example Cálculo simplificado de um período mínimo {#ex-method-setup-budget}

Considere $t_{CQ,\max}=0{,}7\ \mathrm{ns}$, $t_{comb,\max}=5{,}1\ \mathrm{ns}$, $t_{setup}=0{,}6\ \mathrm{ns}$, $t_{skew}=0{,}2\ \mathrm{ns}$ e $t_{unc}=0{,}3\ \mathrm{ns}$. Então,

$$
T_{clk}\geq 0{,}7+5{,}1+0{,}6-0{,}2+0{,}3=6{,}5\ \mathrm{ns}.
$$

A frequência correspondente ao limite simplificado é aproximadamente $153{,}8\ \mathrm{MHz}$. Esse resultado não substitui a análise completa dos caminhos, dos atrasos de roteamento e das condições reais de operação.

:::

## 22.6. Testes funcionais e estruturais

Os **testes funcionais** verificam resultados observáveis diante de estímulos definidos. Os **testes estruturais** procuram detectar defeitos associados à estrutura implementada, como falhas de interconexão, armazenamento ou fabricação. As duas abordagens têm objetivos complementares: um circuito pode passar em um conjunto limitado de testes funcionais e ainda conter defeitos não exercitados.

Uma estratégia funcional deve reunir testes **dirigidos**, que examinam situações previstas, e, quando apropriado, testes **aleatórios ou restritos**, que ampliam a exploração do espaço de entradas. A qualidade não é medida apenas pela quantidade de vetores: é necessário avaliar **cobertura** de requisitos, estados, transições e condições de fronteira. Cobertura elevada não demonstra, por si só, ausência de erros.

<!-- prettier-ignore -->
::: table Matriz resumida de verificação do controlador {#tab-method-verification-matrix .full-width}

| Requisito | Cenário | Resultado esperado | Evidência |
|:--|:--|:--|:--|
| RF-01 | Pulso de `req` em `IDLE` | Entrada em `WORK1` na borda de aceitação | Traço de estados e asserção |
| RF-02 | Operação completa | `done` ativo apenas durante `WORK2` | Verificação ciclo a ciclo |
| RF-03 | `req` mantido em 1 | Nenhuma segunda aceitação antes de `req=0` | Teste de entrada sustentada |
| RT-01 | Solicitação válida | `done` ativo após a borda seguinte à aceitação | Contagem de bordas |
| RI-01 | Reset durante `WORK1` | Retorno a `IDLE` na borda de reset | Teste de interrupção |

:::

<!-- prettier-ignore -->
::: example Banco de testes dirigido para o controlador {#ex-method-controller-testbench}

```verilog
`timescale 1ns/1ps
module tb_controlador;
    reg clk = 0;
    reg rst = 1;
    reg req = 0;
    wire done;

    controlador dut (
        .clk(clk), .rst(rst), .req(req), .done(done)
    );

    always #5 clk = ~clk;

    initial begin
        // Reset amostrado na primeira borda de subida.
        @(negedge clk);
        rst = 0;
        req = 1;

        @(posedge clk); #1;
        if (done !== 1'b0) $fatal(1, "done prematuro");
        @(posedge clk); #1;
        if (done !== 1'b1) $fatal(1, "conclusao ausente");
        @(posedge clk); #1;
        if (done !== 1'b0) $fatal(1, "pulso longo");

        // Requisicao mantida: nao deve haver novo pulso.
        repeat (3) begin
            @(posedge clk); #1;
            if (done !== 1'b0) $fatal(1, "reaceitacao indevida");
        end

        @(negedge clk);
        req = 0;
        @(posedge clk); #1;
        $display("Teste dirigido concluido");
        $finish;
    end
endmodule
```

:::

O banco de testes emprega `$fatal`, `$display`, atrasos e eventos de simulação: essas construções pertencem ao **ambiente de verificação** e não devem ser confundidas com hardware sintetizável. Os estímulos são alterados na borda de descida para evitar disputas com a amostragem na borda de subida. Um banco de testes de produção deve incluir casos adicionais, como reset durante diferentes estados e novas solicitações após a liberação da entrada.

## 22.7. Projeto para testabilidade

O **projeto para testabilidade** (*design for testability*, DFT) incorpora recursos que facilitam controlar e observar estados internos. Em circuitos integrados complexos, nem todos os nós podem ser acessados por terminais externos; por isso, mecanismos específicos podem melhorar a detecção e o diagnóstico de defeitos.

Entre as técnicas empregadas estão cadeias de varredura (*scan chains*), autoteste integrado (*built-in self-test*, BIST), pontos de teste e acesso padronizado de depuração. A escolha depende da tecnologia e da escala do sistema. Uma cadeia de varredura, por exemplo, pode permitir deslocar padrões para registradores internos e observar suas respostas, mas introduz custos de área, roteamento, potência e controle.

<!-- prettier-ignore -->
::: figure Princípio conceitual de observabilidade por cadeia de varredura {#fig-method-scan-chain}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[thick] (1.5,0.4) rectangle (3.5,1.8);
\draw[thick] (5.3,0.4) rectangle (7.3,1.8);
\draw[thick] (9.1,0.4) rectangle (11.1,1.8);
\node at (2.5,1.1) {FF 0};
\node at (6.3,1.1) {FF 1};
\node at (10.1,1.1) {FF 2};
\draw[->] (-0.3,1.1)--(1.5,1.1);
\node[above] at (0.55,1.1) {Scan in};
\draw[->] (3.5,1.1)--(5.3,1.1);
\draw[->] (7.3,1.1)--(9.1,1.1);
\draw[->] (11.1,1.1)--(13.0,1.1);
\node[above] at (12.05,1.1) {Scan out};
\draw (2.5,-0.4)--(10.1,-0.4);
\draw[->] (2.5,-0.4)--(2.5,0.4);
\draw[->] (6.3,-0.4)--(6.3,0.4);
\draw[->] (10.1,-0.4)--(10.1,0.4);
\node[below] at (6.3,-0.4) {Relógio de teste};
\end{tikzpicture}
```

:::

A {@ref fig-method-scan-chain} é um diagrama funcional simplificado. Em uma implementação real, registradores de varredura precisam selecionar entre os caminhos de operação normal e de teste, e o procedimento deve especificar a sequência de captura e deslocamento. A existência de recursos de teste não dispensa a verificação funcional.

## 22.8. Implementação em circuitos discretos e FPGA

A implementação em **circuitos discretos** utiliza componentes separados, como portas, flip-flops, buffers e dispositivos de memória. A implementação em **FPGA** configura recursos lógicos e interconexões de um dispositivo programável. Ambas realizam funções digitais, mas apresentam compromissos diferentes de flexibilidade, custo, desempenho, consumo e esforço de integração.

Em circuitos discretos, devem ser verificados os níveis lógicos compatíveis, a capacidade de acionamento, os tempos de propagação, a distribuição do relógio, o desacoplamento e o arranjo físico. Em FPGA, além da descrição RTL, são necessários a seleção do dispositivo, a atribuição de pinos, as restrições de temporização, o mapeamento, o posicionamento e o roteamento. A configuração do dispositivo e a inicialização de seus recursos também precisam ser previstas.

<!-- prettier-ignore -->
::: table Comparação de aspectos de implementação {#tab-method-implementation-comparison .full-width}

| Aspecto | Circuitos discretos | FPGA |
|:--|:--|:--|
| Organização | Componentes e conexões físicas individuais | Recursos configuráveis e interconexões internas |
| Alterações funcionais | Podem exigir mudança de componentes ou placa | Frequentemente possíveis por nova configuração |
| Temporização | Atrasos dos componentes e da interligação externa | Atrasos de recursos e roteamento interno |
| Verificação física | Montagem, alimentação, sinais e conexões | Configuração, pinos, relógios, sinais e restrições |
| Escalabilidade | Limitada pela quantidade de componentes e interconexões | Limitada pelos recursos e pela arquitetura do dispositivo |

:::

A equivalência funcional entre duas implementações não implica igualdade de comportamento temporal ou elétrico. Uma solução que funciona em baixa frequência sobre uma matriz de contatos pode falhar em uma placa final devido a atrasos, ruído, conexões longas ou desacoplamento inadequado.

## 22.9. Validação experimental

A **validação experimental** verifica o comportamento do sistema em condições representativas de uso. Ela complementa a simulação e a análise estática porque envolve componentes reais, alimentação, interfaces e instrumentos de medição. A validação deve partir de um **plano de ensaio**: condição inicial, estímulo aplicado, instrumento, grandeza observada, critério de aprovação e forma de registro.

Osciloscópios e analisadores lógicos são úteis para observar níveis, bordas, relações temporais e sequências digitais. A escolha do instrumento deve considerar largura de banda, taxa de amostragem, resolução, referência de terra e efeitos da ponta de prova. Uma medição inadequada pode ocultar uma falha ou introduzir perturbações no circuito.

<!-- prettier-ignore -->
::: figure Encadeamento de evidências de validação experimental {#fig-method-validation-flow}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (0,0) rectangle (3.3,1.5);
\draw[thick] (5.2,0) rectangle (8.5,1.5);
\draw[thick] (10.4,0) rectangle (13.7,1.5);
\node[align=center] at (1.65,0.75) {Plano\\de ensaio};
\node[align=center] at (6.85,0.75) {Montagem e\\medição};
\node[align=center] at (12.05,0.75) {Comparação com\\critérios};
\draw[->] (3.3,0.75)--(5.2,0.75);
\draw[->] (8.5,0.75)--(10.4,0.75);
\end{tikzpicture}
```

:::

Para o controlador, um ensaio pode aplicar `req` com duração definida, registrar o relógio e `done` e confirmar o número de ciclos até a conclusão. Outros ensaios devem explorar reset durante a operação, solicitações sucessivas e limites de frequência e alimentação previstos. Os resultados devem ser registrados com identificação do hardware, versão da configuração e condições de teste.

A aprovação experimental é sempre relativa às condições efetivamente examinadas. Um ensaio bem-sucedido em temperatura ambiente, por exemplo, não comprova o funcionamento em toda a faixa térmica especificada.

## 22.10. Documentação técnica

A **documentação técnica** preserva as decisões de projeto e permite reproduzir, revisar e manter o sistema. Deve relacionar requisitos, arquitetura, interfaces, modelos HDL, versões de ferramentas, restrições, relatórios de síntese, resultados de simulação, esquemas e evidências experimentais. Diagramas e código devem corresponder à versão efetivamente avaliada.

Uma prática importante é manter **rastreabilidade bidirecional**: cada requisito aponta para os elementos que o implementam e para os testes que o verificam; cada teste, por sua vez, identifica os requisitos que pretende avaliar. Isso facilita a análise do impacto de alterações e a identificação de lacunas de verificação.

<!-- prettier-ignore -->
::: table Conjunto mínimo de registros de um projeto digital {#tab-method-documentation .full-width}

| Registro | Conteúdo essencial | Finalidade |
|:--|:--|:--|
| Especificação | Requisitos identificados e critérios de aceitação | Definir o comportamento esperado |
| Arquitetura | Blocos, interfaces e domínios de relógio | Explicar a organização |
| Fontes | HDL, bancos de testes e arquivos de restrições | Permitir reprodução e revisão |
| Relatórios | Síntese, temporização e cobertura de testes | Documentar evidências de verificação |
| Implementação | Esquemas, atribuições de pinos e configuração | Reproduzir o hardware |
| Validação | Procedimentos, medições, resultados e desvios | Comprovar o desempenho observado |
| Histórico de versões | Alterações, responsáveis e decisões | Controlar a evolução do projeto |

:::

O processo de projeto não termina com um arquivo de configuração ou uma placa funcionando. Um sistema digital tecnicamente confiável exige que seu funcionamento seja **explicável**, seus resultados sejam **verificáveis** e suas decisões possam ser **revisitadas** quando requisitos ou tecnologias mudarem.

## Síntese do capítulo

O projeto digital começa com requisitos verificáveis e uma arquitetura de interfaces explícitas. A modelagem e a simulação permitem examinar o comportamento antes da implementação, enquanto a síntese transforma descrições compatíveis em recursos físicos. A análise estática de temporização verifica limites de tempo; testes funcionais e estruturais investigam classes distintas de falhas. Recursos de testabilidade aumentam a observabilidade, e a implementação em circuitos discretos ou FPGA introduz restrições específicas. A validação experimental reúne evidências em condições reais, e a documentação estabelece a rastreabilidade entre requisitos, decisões e resultados.

## Exercícios

1. Diferencie verificação e validação. Dê um exemplo de falha que possa passar pela verificação de um modelo incorretamente especificado.
2. Reescreva o requisito “o controlador deve responder rapidamente” de forma mensurável, explicitando a convenção de contagem de ciclos.
3. Identifique os requisitos funcionais, temporais e de interface da {@ref tab-method-requirements}.
4. Construa o diagrama de estados correspondente à {@ref tab-method-state-transitions} e indique a saída associada a cada estado.
5. Explique por que o estado `WAIT_LOW` impede novas operações enquanto `req` permanece em nível alto.
6. Modifique o controlador em Verilog para produzir uma saída `busy` ativa nos estados `WORK1` e `WORK2`.
7. Proponha três testes adicionais para o controlador e associe cada teste a um requisito.
8. Explique a diferença entre uma simulação RTL e uma análise estática de temporização.
9. Um caminho apresenta $t_{CQ,\max}=0{,}9\ \mathrm{ns}$, $t_{comb,\max}=6{,}0\ \mathrm{ns}$, $t_{setup}=0{,}5\ \mathrm{ns}$, $t_{skew}=0{,}1\ \mathrm{ns}$ e $t_{unc}=0{,}2\ \mathrm{ns}$. Determine o período mínimo pelo modelo simplificado e a frequência máxima correspondente.
10. Explique por que uma restrição de caminho falso não deve ser utilizada como solução para uma travessia de domínios de relógio mal projetada.
11. Diferencie cobertura de estados, cobertura de transições e cobertura de requisitos.
12. Descreva a finalidade de uma cadeia de varredura e uma de suas desvantagens de implementação.
13. Compare dois riscos típicos de uma montagem com circuitos discretos e dois de uma implementação em FPGA.
14. Elabore um plano de validação experimental para o controlador, especificando estímulos, medições e critérios de aceitação.
15. Organize uma matriz de rastreabilidade que associe RF-01, RF-02, RF-03, RT-01 e RI-01 aos módulos e testes correspondentes.
16. Discuta por que a documentação deve registrar versões de ferramentas, restrições temporais e resultados de ensaios, além do código HDL.

## Referências bibliográficas

- WAKERLY, John F. *Digital Design: Principles and Practices*. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. *Digital Design and Computer Architecture*. Morgan Kaufmann.
- MANO, M. Morris; CILETTI, Michael D. *Digital Design*. Pearson.
- BROWN, Stephen; VRANESIC, Zvonko. *Fundamentals of Digital Logic with Verilog Design*. McGraw-Hill.
- IEEE. *IEEE Standard for SystemVerilog—Unified Hardware Design, Specification, and Verification Language* (IEEE 1800). Consultar a edição adotada no projeto.
- IEEE. *IEEE Standard Test Access Port and Boundary-Scan Architecture* (IEEE 1149.1). Consultar a edição adotada no projeto.
- Documentação do fabricante do dispositivo e das ferramentas de síntese, temporização, simulação e depuração empregadas, incluindo versões e condições de operação.
