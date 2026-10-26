# Apêndice D. Introdução às ferramentas de simulação {#appendix-d}

A simulação permite investigar o comportamento de um circuito antes de sua
montagem física ou implementação em um dispositivo programável. Seu principal
valor não está em produzir uma forma de onda visualmente convincente, mas em
**confrontar uma especificação com um modelo**, identificar inconsistências e
documentar evidências de funcionamento. Este apêndice apresenta procedimentos
reproduzíveis de simulação lógica, temporal, elétrica e em linguagens de
descrição de hardware (HDL), com exemplos associados aos capítulos de
_Eletrônica Digital_.

Uma simulação não substitui a análise teórica, a inspeção do circuito nem a
validação experimental. Seus resultados são válidos dentro das hipóteses do
modelo: uma porta lógica ideal não reproduz automaticamente atrasos, ruído,
consumo, metastabilidade ou limites elétricos de um circuito integrado real.

## D.1. Objetivos, modelos e níveis de abstração

Em projetos digitais, convém distinguir quatro níveis de investigação:

| Nível           | Modelo                                           | Perguntas principais                                            | Limitações típicas                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Funcional       | Expressões booleanas, tabelas-verdade, FSM       | A lógica implementa a função desejada?                          | Não inclui atrasos físicos por padrão                               |
| Temporal lógico | Eventos, atrasos, bordas de relógio              | A sequência de sinais e estados é coerente?                     | Depende dos atrasos e das verificações modelados                    |
| RTL/HDL         | Registradores, operadores, processos e testbench | A descrição sintetizável atende ao protocolo e à especificação? | Simulação RTL não representa automaticamente a implementação física |
| Elétrico        | Componentes e redes com parâmetros elétricos     | Tensões, correntes, transientes e margens são aceitáveis?       | Fidelidade limitada pelos modelos de dispositivos                   |

A seleção da ferramenta deve partir da pergunta a responder. Para verificar a
tabela-verdade de um multiplexador, um simulador lógico é suficiente. Para
avaliar a subida de uma linha com resistor de pull-up e capacitância
distribuída, é necessário um modelo elétrico, como uma análise transitória
SPICE.

**Terminologia:** _simulação_ executa um modelo; _síntese_ transforma uma
descrição lógica em uma implementação; _verificação_ compara o comportamento
com requisitos; _validação_ investiga se o sistema atende à necessidade real de
uso. Esses processos são relacionados, mas não equivalentes.

## D.2. Panorama de ferramentas e critérios de escolha

Existem ferramentas gráficas de circuitos lógicos, simuladores de eventos para
HDL, simuladores elétricos e ambientes de projeto de FPGA. A tabela apresenta
exemplos, sem pressupor que todos tenham as mesmas licenças, recursos ou
formatos de arquivo.

| Categoria                          | Exemplos                                                    | Uso principal                                                  |
| ---------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Simulação lógica didática          | Logisim-evolution e ambientes equivalentes                  | Montagem de portas, registradores e circuitos por blocos       |
| Simulação de Verilog/SystemVerilog | Icarus Verilog, Verilator e simuladores de fabricantes      | Testbenches, eventos, rastreamento de sinais e verificação RTL |
| Visualização de formas de onda     | GTKWave e visualizadores integrados                         | Inspeção de arquivos VCD e de transições digitais              |
| Simulação elétrica                 | ngspice, LTspice e equivalentes                             | Análise DC, transitória e de redes analógicas ou mistas        |
| Projeto de FPGA                    | Vivado, Quartus e ferramentas compatíveis com o dispositivo | Síntese, implementação, análise temporal e programação         |

A escolha deve considerar: sistema operacional, formato de entrada, suporte à
linguagem utilizada, possibilidade de automação, rastreabilidade dos
resultados, disponibilidade de modelos, restrições de licença e compatibilidade
com o dispositivo-alvo. Recursos e comandos variam conforme a versão; consulte
a documentação da ferramenta instalada.

No **MathJSLab**, blocos Markdown e extensões como `tikz`, `wavedrom`, `vcd`,
`netlist`, `hdl` e `hdl-interactive` podem auxiliar a apresentação de exemplos.
A disponibilidade de execução, interpretação ou visualização depende das
extensões habilitadas e do aplicativo hospedeiro. Um bloco de código exibido
corretamente não comprova que o circuito foi efetivamente simulado.

## D.3. Um fluxo de trabalho de simulação reproduzível

Recomenda-se organizar cada experimento nas seguintes etapas:

1. **Especificar:** definir entradas, saídas, estados, relógio, reset e
   comportamento esperado.
2. **Modelar:** escolher o nível de abstração e explicitar as hipóteses
   adotadas.
3. **Estimular:** produzir entradas normais, casos extremos e situações
   inválidas relevantes.
4. **Observar:** registrar sinais internos e externos, mensagens de erro e
   parâmetros da execução.
5. **Conferir:** comparar resultados com tabela-verdade, equações, invariantes
   ou modelo de referência.
6. **Documentar:** guardar versão do código, parâmetros, ferramenta, casos de
   teste e conclusão.

Um teste que apenas mostra sinais alternando não é suficiente. É importante
estabelecer um **oráculo de verificação**: um procedimento independente que
determine o resultado esperado. Para um somador, por exemplo, o oráculo pode
ser a operação aritmética aplicada às entradas com a largura correta.

<!-- prettier-ignore -->
::: figure Fluxo básico de verificação por simulação {#fig-appendix-d-verification-flow}

```tikz
\begin{tikzpicture}[scale=1.1,transform shape]
\draw[thick] (0,0) rectangle (3.0,1.5);
\draw[thick] (4.5,0) rectangle (7.5,1.5);
\draw[thick] (9.0,0) rectangle (12.0,1.5);
\draw[thick] (13.5,0) rectangle (16.5,1.5);
\node[align=center] at (1.5,0.75) {Especificação};
\node[align=center] at (6.0,0.75) {Modelo};
\node[align=center] at (10.5,0.75) {Estímulos};
\node[align=center] at (15.0,0.75) {Comparação};
\draw[->,thick] (3.0,0.75)--(4.5,0.75);
\draw[->,thick] (7.5,0.75)--(9.0,0.75);
\draw[->,thick] (12.0,0.75)--(13.5,0.75);
\draw[->,thick] (15.0,0)--(15.0,-1.0)--(1.5,-1.0)--(1.5,0);
\node[fill=white] at (8.25,-1.0) {Revisão e correção};
\end{tikzpicture}
```

:::

A seta de retorno indica que uma divergência pode revelar erro na
especificação, no modelo, nos estímulos ou na própria verificação; não se deve
assumir de imediato que o circuito está incorreto.

## D.4. Simulação funcional de circuitos combinacionais

Considere um multiplexador de duas entradas, com dados $A$ e $B$, seletor $S$ e
saída $Y$:

$$Y=\overline{S}A+SB.$$

A tabela-verdade é:

| $S$ | $A$ | $B$ | $Y$ |
| --: | --: | --: | --: |
|   0 |   0 |   0 |   0 |
|   0 |   0 |   1 |   0 |
|   0 |   1 |   0 |   1 |
|   0 |   1 |   1 |   1 |
|   1 |   0 |   0 |   0 |
|   1 |   0 |   1 |   1 |
|   1 |   1 |   0 |   0 |
|   1 |   1 |   1 |   1 |

Em um simulador gráfico, monte duas portas AND, uma inversora e uma porta OR,
ou utilize o componente multiplexador equivalente. Percorra as oito combinações
e registre a saída. A verificação é **exaustiva** para esse exemplo, pois todas
as combinações de entrada são avaliadas.

A mesma função pode ser descrita em Verilog:

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

O operador condicional expressa a função do multiplexador, mas não determina
sozinho a tecnologia de implementação nem o atraso físico. Em projetos maiores,
os testes exaustivos tornam-se rapidamente inviáveis: um bloco com $n$ entradas
binárias possui $2^n$ combinações. Nesses casos, utilizam-se testes dirigidos,
aleatórios, propriedades e técnicas formais complementares.

## D.5. Simulação de circuitos sequenciais e máquinas de estados

Um circuito sequencial depende tanto das entradas atuais quanto do estado
armazenado. A simulação precisa, portanto, especificar **condições iniciais**,
bordas ativas, reset e sequência temporal dos estímulos.

Considere um contador binário síncrono de quatro bits, com reset ativo em nível
alto e habilitação `en`:

```verilog
module counter4 (
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

A atribuição não bloqueante `<=` é adequada à atualização de registradores em
processos acionados por borda. O contador avança módulo $16$, isto é, após
`1111` retorna a `0000`. Se `en=0`, conserva seu valor. Como o reset está
dentro de `always @(posedge clk)`, ele é **síncrono**: sua ativação só altera
`q` na próxima borda de subida.

Um roteiro de teste deve contemplar: reset inicial, contagem habilitada, pausa
com `en=0`, retomada, transbordamento e reset durante a operação. Também deve
verificar que mudanças em `en` fora da borda ativa não modificam imediatamente
o registrador.

<!-- prettier-ignore -->
::: figure Sequência conceitual de um contador síncrono habilitado {#fig-appendix-d-counter-timing}

```wavedrom
{ "signal": [
  { "name": "clk", "wave": "p......." },
  { "name": "rst", "wave": "10......" },
  { "name": "en",  "wave": "1..0.1.." },
  { "name": "q",   "wave": "=.=.=..=", "data": ["0", "1", "2", "3"] }
], "head": { "text": "Exemplo ilustrativo: evolução de estados" } }
```

:::

A figura é esquemática: para validar instantes e valores específicos, utilize
uma simulação com estímulos e registros de eventos explicitamente definidos.

## D.6. Testbenches em Verilog: estímulos e autoverificação

Um _testbench_ é um módulo de verificação que instancia o circuito sob teste
(_design under test_, DUT), aplica estímulos e avalia as saídas. O exemplo
seguinte verifica o multiplexador da Seção D.4, percorrendo todas as
combinações de entradas.

```verilog
`timescale 1ns/1ps

module tb_mux2;
    reg a, b, s;
    wire y;
    integer i;
    reg expected;

    mux2 dut (.a(a), .b(b), .s(s), .y(y));

    initial begin
        $dumpfile("mux2.vcd");
        $dumpvars(0, tb_mux2);

        for (i = 0; i < 8; i = i + 1) begin
            {s, a, b} = i;
            #1;
            expected = s ? b : a;
            if (y !== expected) begin
                $display("FALHA: s=%b a=%b b=%b y=%b esperado=%b",
                         s, a, b, y, expected);
                $fatal(1);
            end
        end

        $display("SUCESSO: 8 combinacoes verificadas.");
        $finish;
    end
endmodule
```

O operador `!==` realiza comparação sensível a valores desconhecidos (`X`) e de
alta impedância (`Z`), útil para evitar que uma saída indefinida seja aceita
como correta. O atraso `#1` concede tempo para a propagação dos eventos na
simulação; ele não representa, por si só, um atraso físico de um componente.

### Execução ilustrativa com Icarus Verilog

Salve o circuito em `mux2.v` e o teste em `tb_mux2.v`. Em uma instalação que
disponibilize os comandos correspondentes:

```bash
iverilog -g2012 -s tb_mux2 -o mux2_sim mux2.v tb_mux2.v
vvp mux2_sim
```

O teste cria `mux2.vcd` quando executado em um ambiente que permita a gravação
do arquivo. A inspeção visual pode ser feita em um visualizador VCD, como o
GTKWave:

```bash
gtkwave mux2.vcd
```

A mensagem de sucesso deve ser interpretada em conjunto com a cobertura dos
testes. Oito combinações cobrem completamente a função combinacional de três
entradas, mas não comprovam aspectos elétricos ou temporais da implementação
final.

## D.7. Formas de onda, VCD e interpretação temporal

O formato **VCD** (_Value Change Dump_) registra mudanças de valor de sinais ao
longo do tempo de simulação. Sua utilidade é permitir observar relações entre
relógio, entradas, estados e saídas.

Ao interpretar uma forma de onda, verifique:

- a unidade temporal indicada pela simulação;
- a borda de relógio à qual cada mudança está associada;
- se um sinal é binário, vetorial ou assume `X`/`Z`;
- se o reset é síncrono ou assíncrono;
- se os estímulos são aplicados suficientemente afastados das bordas para
  evitar ambiguidades de teste;
- se a saída observada corresponde à especificação, e não apenas a uma
  sequência aparentemente plausível.

Uma transição que aparece no mesmo instante nominal de outra pode pertencer a
uma etapa diferente da fila de eventos do simulador. Por isso, a ordem de
avaliação e o uso de atribuições bloqueantes ou não bloqueantes são relevantes
para a modelagem RTL.

### Exemplo de verificação temporal

Para um contador de quatro bits, o teste pode conferir a propriedade:

$$ q_{k+1}=\begin{cases}
0, & \text{se }rst_k=1,\\
(q_k+1)\bmod 16, & \text{se }rst_k=0\text{ e }en_k=1,\\
q_k, & \text{se }rst_k=0\text{ e }en_k=0.
\end{cases}$$

Aqui, $k$ identifica bordas sucessivas de subida do relógio. A comparação deve ocorrer após a atualização dos registradores no simulador, evitando amostrar o valor antigo por engano.

## D.8. Simulação elétrica com SPICE

Modelos lógicos ideais são insuficientes quando o problema envolve tempo de subida, capacitância, correntes, resistência de saída ou integridade de sinal. Um exemplo simples é uma linha com resistor de pull-up $R$ e capacitância equivalente $C$.

A resposta ideal à energização, partindo de $v(0)=0$, é:

$$v(t)=V_{DD}\left(1-e^{-t/(RC)}\right).$$

O tempo para atingir uma fração $\alpha$ da tensão final é:

$$t_\alpha=-RC\ln(1-\alpha).$$

Para $R=4{,}7\,\mathrm{k\Omega}$ e $C=200\,\mathrm{pF}$, a constante de tempo é $\tau=RC=0{,}94\,\mathrm{\mu s}$. O tempo entre 30% e 70% da tensão final é aproximadamente $0{,}8473RC\approx0{,}80\,\mathrm{\mu s}$.

Um arquivo de entrada compatível com a sintaxe SPICE convencional pode ser escrito como:

```spice
* Subida de uma linha com pull-up e capacitancia
VDD vdd 0 DC 3.3
RPU vdd dq 4.7k
CBUS dq 0 200p IC=0
.tran 10n 5u UIC
.control
run
plot v(dq)
.endc
.end
```

Esse exemplo é destinado a um ambiente que interprete comandos de controle do ngspice. Outras ferramentas podem exigir ajustes. A condição inicial e a opção `UIC` são utilizadas aqui para observar a carga do capacitor a partir de zero; em uma análise transitória com cálculo prévio do ponto de operação, a forma de onda inicial pode ser diferente.

**Limites do modelo:** não foram incluídos fugas, indutâncias, resistência dinâmica de transistores, limiares de entrada nem parâmetros específicos de dispositivos. O resultado ilustra o mecanismo RC, não certifica a conformidade de um barramento real.

## D.9. Simulação, síntese e análise temporal de FPGA

O desenvolvimento de circuitos programáveis normalmente envolve etapas distintas:

| Etapa | Produto | O que se verifica |
|---|---|---|
| Simulação RTL | Eventos e formas de onda do HDL | Comportamento lógico da descrição |
| Síntese | Rede lógica e registradores inferidos | Estrutura obtida e advertências de inferência |
| Implementação | Posicionamento e roteamento | Viabilidade no dispositivo e recursos utilizados |
| Análise temporal estática | Relatórios de caminhos e restrições | Cumprimento de requisitos de temporização |
| Teste em hardware | Medidas e observações reais | Comportamento físico do protótipo |

Um circuito pode funcionar na simulação RTL e falhar no dispositivo devido a restrições de pinos, domínio de relógio, reset, atraso de propagação, interfaces elétricas ou condições de inicialização.

Para um caminho síncrono simplificado entre dois registradores, uma restrição básica é:

$$T_{CLK}\geq t_{CQ}+t_{comb}+t_{setup}+t_{margem},$$

em que $t_{CQ}$ é o atraso de saída do registrador de origem, $t_{comb}$ representa a lógica e a interconexão, $t_{setup}$ é o tempo de preparação do registrador de destino e $t_{margem}$ reúne as demais parcelas pertinentes à análise adotada. Uma análise real também considera incerteza de relógio, *skew*, restrições de entrada/saída e verificações de *hold*.

**Exemplo ilustrativo:** se $t_{CQ}=0{,}4\,\mathrm{ns}$, $t_{comb}=5{,}0\,\mathrm{ns}$, $t_{setup}=0{,}6\,\mathrm{ns}$ e $t_{margem}=1{,}0\,\mathrm{ns}$, então $T_{CLK}\geq7{,}0\,\mathrm{ns}$, correspondendo a uma frequência de aproximadamente $142{,}9\,\mathrm{MHz}$. Esse cálculo não substitui o relatório temporal da implementação.

## D.10. Erros comuns e estratégias de diagnóstico

| Sintoma | Possível causa | Investigação recomendada |
|---|---|---|
| Saída indefinida (`X`) | Registrador sem reset, múltiplos drivers ou entrada não inicializada | Inspecionar sinais de origem e condições iniciais |
| Saída em alta impedância (`Z`) | Rede não acionada ou atribuição tri-state | Verificar drivers e habilitações |
| Contador não avança | Relógio ausente, reset ativo ou habilitação desativada | Observar `clk`, `rst`, `en` e `q` conjuntamente |
| Teste passa sem exercitar o circuito | Estímulos insuficientes ou verificação incorreta | Contabilizar casos e introduzir falhas deliberadas no DUT |
| Divergência entre RTL e hardware | Temporização, inicialização, pinos ou interface física | Conferir restrições e relatórios de implementação |
| Forma de onda elétrica inesperada | Condição inicial, unidade ou modelo incorreto | Conferir netlist, parâmetros e ponto de operação |
| Simulação não termina | Ausência de `$finish`, laço infinito ou relógio permanente sem limite | Definir condição de parada e tempo máximo |

Ao diagnosticar uma falha, reduza o problema a um caso mínimo reproduzível, registre a versão do arquivo e altere uma hipótese por vez. Mudanças simultâneas em estímulos, código e parâmetros dificultam identificar a causa.

## D.11. Atividades práticas orientadas

### Atividade 1 — Decodificador combinacional

Implemente um decodificador de duas entradas e quatro saídas. Escreva a tabela-verdade, simule todas as quatro combinações e confirme que exatamente uma saída está ativa em cada caso, considerando saídas ativas em nível alto. Repita o exercício com uma entrada de habilitação.

### Atividade 2 — Somador de quatro bits

Descreva um somador de quatro bits com `carry-out`. Verifique os casos $0+0$, $7+1$, $15+1$ e $15+15$. Compare o resultado com uma referência aritmética de cinco bits para não descartar o transporte final.

### Atividade 3 — Contador com pausa e reset

Utilize o contador da Seção D.5. Elabore um testbench autoverificável que confirme reset, habilitação, retenção de estado e retorno de `15` para `0`. Produza um arquivo VCD e identifique os instantes de transição.

### Atividade 4 — Máquina de estados de semáforo

Modele uma FSM com três estados: verde, amarelo e vermelho. Defina explicitamente as condições de transição, o reset e as saídas. Verifique que não existam estados com verde e vermelho simultaneamente ativos para a mesma direção.

### Atividade 5 — Subida de linha RC

Simule uma linha com $R=4{,}7\,\mathrm{k\Omega}$ e capacitâncias de $100$, $200$ e $400\,\mathrm{pF}$. Compare os tempos de subida entre 30% e 70% com a expressão $t_r\approx0{,}8473RC$. Explique por que o aumento de capacitância reduz a velocidade de subida.

### Atividade 6 — Verificação de interface

Escolha um protocolo simples de transmissão serial abordado no Capítulo 23. Defina quadro, polaridade, temporização e condições de erro. Desenvolva estímulos que cubram pelo menos uma transmissão válida e uma situação inválida. Registre os critérios utilizados para declarar aprovação ou falha.

## D.12. Modelo de relatório de simulação

Um relatório curto, mas reproduzível, deve conter:

| Campo | Informação a registrar |
|---|---|
| Identificação | Nome do projeto, autor, data e revisão |
| Objetivo | Requisito ou propriedade verificada |
| Ferramenta | Nome, versão, sistema operacional e opções relevantes |
| Modelo | Arquivos, parâmetros, módulos e hipóteses |
| Estímulos | Casos de teste, relógios, reset e condições iniciais |
| Critério de aceitação | Tabela-verdade, equação, asserção ou referência independente |
| Resultados | Mensagens, formas de onda, medidas e falhas |
| Conclusão | Requisitos atendidos, limitações e próximos testes |

Quando possível, arquive também o comando exato de execução e um identificador de versão do código. Imagens isoladas de formas de onda, sem descrição dos estímulos e dos critérios de comparação, têm valor limitado como evidência técnica.

## D.13. Exercícios de consolidação

1. Diferencie simulação funcional, temporal lógica e elétrica, indicando um problema adequado a cada uma.
2. Explique por que a simulação RTL bem-sucedida não garante o funcionamento de uma FPGA após implementação.
3. Quantas combinações devem ser avaliadas para testar exaustivamente um bloco combinacional com seis entradas binárias independentes?
4. Escreva um testbench para uma porta XOR e verifique todas as combinações de entrada.
5. Modifique o contador da Seção D.5 para reset assíncrono e explique a mudança na lista de sensibilidade.
6. Elabore um teste que detecte a falha de um contador que avança mesmo quando `en=0`.
7. Explique o significado de `X` e `Z` em simulação lógica e por que não correspondem diretamente a níveis elétricos fixos.
8. Para uma rede RC com $R=2{,}2\,\mathrm{k\Omega}$ e $C=300\,\mathrm{pF}$, calcule a constante de tempo e o tempo de subida entre 30% e 70%.
9. Proponha uma forma de verificar se o *carry-out* de um somador de oito bits está correto.
10. Diferencie o papel de um arquivo VCD e o de um relatório de análise temporal estática.
11. Explique por que um teste com saída esperada calculada pela mesma expressão defeituosa do DUT pode não detectar certos erros.
12. Descreva um procedimento para diagnosticar um registrador cuja saída permanece indefinida desde o início da simulação.
13. Elabore uma lista de verificações para uma FSM que contém estados não utilizados.
14. Discuta como condições iniciais podem alterar o resultado de uma análise transitória SPICE.
15. Defina um critério de cobertura para testar um transmissor serial com diferentes palavras de dados e condições de erro.

**Respostas selecionadas:** (3) $2^6=64$ combinações; (8) $\tau=0{,}66\,\mathrm{\mu s}$ e $t_r\approx0{,}56\,\mathrm{\mu s}$; (10) o VCD registra transições simuladas, enquanto a análise temporal estática avalia caminhos e restrições de temporização sem depender de uma sequência específica de estímulos.

## D.14. Leituras complementares e documentação

As referências a seguir são pontos de partida para consultar sintaxe, comandos e limites de cada ambiente. É recomendável verificar a documentação correspondente à versão instalada.

- **IEEE Std 1800 — SystemVerilog:** linguagem de descrição e verificação de hardware, incluindo semântica de eventos e construções de teste.
- **IEEE Std 1364 — Verilog HDL:** referência histórica da linguagem Verilog e de seus mecanismos de simulação.
- **Icarus Verilog:** documentação do compilador e do ambiente de execução (`iverilog`, `vvp`).
- **Verilator:** documentação sobre simulação e verificação de descrições SystemVerilog.
- **GTKWave:** documentação do visualizador de formas de onda e de formatos de rastreamento.
- **ngspice:** manual do simulador SPICE e dos tipos de análise elétrica.
- **Logisim-evolution:** documentação de construção e simulação de circuitos digitais.
- **Documentação dos fabricantes de FPGA:** guias de síntese, restrições, implementação e análise temporal relativos à família de dispositivos utilizada.

**Síntese:** uma simulação confiável resulta da combinação de especificação explícita, modelo apropriado, estímulos representativos, comparação automática e registro reproduzível. O objetivo não é apenas observar que um circuito funciona em determinada execução, mas reunir evidências suficientes para identificar **em quais condições** ele satisfaz os requisitos estabelecidos.
$$
