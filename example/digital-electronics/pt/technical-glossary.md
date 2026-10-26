# Apêndice G. Glossário técnico {#appendix-g}

Este glossário reúne termos, siglas e expressões empregados na análise, no projeto, na implementação e na verificação de sistemas digitais. Os equivalentes em inglês são indicados para facilitar a consulta a folhas de dados, normas e documentação técnica. As definições são contextualizadas à obra e acompanhadas de referências para aprofundamento.

## G.1. Organização e critérios de consulta

Os verbetes estão agrupados por letra inicial e apresentados com o termo em português, o equivalente em inglês, a definição e uma indicação de leitura. Siglas amplamente utilizadas na literatura são mantidas em sua forma internacional. O significado de uma sigla ou parâmetro deve ser confirmado no contexto do dispositivo e de sua folha de dados.


## G.2. A

**ADC — Conversor Analógico-Digital** (*Analog-to-digital converter*). Dispositivo que transforma amostras de uma grandeza analógica em códigos digitais de resolução e faixa especificadas. Consulte [Apêndice E](laboratory-experiments.md).

**ALU — Unidade Lógica e Aritmética** (*Arithmetic logic unit*). Bloco combinacional ou sequencial que executa operações aritméticas e lógicas selecionadas por sinais de controle. Consulte [Capítulo 25](integrative-projects.md).

**Amostragem** (*Sampling*). Processo de obter valores de um sinal em instantes definidos. A frequência de amostragem e o filtro antialiasing determinam quais componentes espectrais podem ser representadas adequadamente. Consulte [Apêndice A](supplementary-mathematical-foundations.md).

**Antialiasing** (*Anti-aliasing*). Filtragem aplicada antes da conversão analógico-digital para atenuar componentes acima da banda admitida pelo processo de amostragem. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**Assíncrono** (*Asynchronous*). Qualifica operações que não dependem de um relógio global comum; seu significado específico varia conforme o circuito ou protocolo. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**Atraso de propagação** (*Propagation delay*). Intervalo entre uma mudança na entrada de um circuito e a correspondente mudança na saída, medido sob condições especificadas de alimentação, carga e temperatura. Consulte [Apêndice C](reference-tables.md).

**Álgebra booleana** (*Boolean algebra*). Sistema algébrico de valores lógicos e operações como AND, OR e NOT, utilizado na descrição e simplificação de funções digitais. Consulte [Capítulo 3](boolean-algebra-and-logic-functions.md).


## G.3. B

**Barramento** (*Bus*). Conjunto de condutores ou canais lógicos usado para transportar dados, endereços ou sinais de controle entre blocos. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**Baud** (*Baud*). Unidade de taxa de símbolos, igual a um símbolo por segundo; não equivale necessariamente a um bit por segundo. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**BCD — Decimal Codificado em Binário** (*Binary-coded decimal*). Representação em que cada algarismo decimal é codificado separadamente, em geral por quatro bits. Consulte [Capítulo 2](number-systems-and-information-representation.md).

**Bit** (*Binary digit*). Unidade binária de informação representada por um dos valores 0 ou 1. Consulte [Capítulo 2](number-systems-and-information-representation.md).

**Borda de clock** (*Clock edge*). Transição de subida ou descida do sinal de relógio utilizada para sincronizar eventos em circuitos sequenciais. Consulte [Apêndice B](representation-conventions-and-symbols.md).

**Buffer** (*Buffer*). Elemento de isolamento ou armazenamento temporário. Em circuitos lógicos pode reforçar acionamento; em sistemas de dados pode desacoplar taxas de produção e consumo. Consulte [Capítulo 24](integrated-digital-systems.md).


## G.4. C

**Caminho de dados** (*Datapath*). Conjunto de registradores, multiplexadores, operadores e conexões que realiza as transformações de dados comandadas pela unidade de controle. Consulte [Capítulo 24](integrated-digital-systems.md).

**Capacitância parasita** (*Parasitic capacitance*). Capacitância não intencional associada a trilhas, terminais e estruturas físicas, capaz de afetar atrasos e formas de onda. Consulte [Apêndice E](laboratory-experiments.md).

**Carry — Transporte** (*Carry*). Bit que indica transferência para uma posição de maior peso em operações aritméticas; não deve ser confundido com transbordamento com sinal. Consulte [Apêndice F](selected-answers-and-solutions.md).

**Clock — Relógio** (*Clock*). Sinal periódico que estabelece instantes de referência para a atualização de elementos sequenciais síncronos. Consulte [Capítulo 24](integrated-digital-systems.md).

**CMOS** (*Complementary metal-oxide-semiconductor*). Tecnologia de circuitos integrados que emprega redes complementares de transistores MOS, amplamente utilizada em lógica digital. Consulte [Capítulo 19](logic-families-and-digital-integrated-circuits.md).

**Complemento de dois** (*Two's complement*). Representação usual de inteiros com sinal em largura fixa, na qual a negação aritmética é obtida pela inversão dos bits seguida de adição de uma unidade. Consulte [Capítulo 2](number-systems-and-information-representation.md).

**Contador** (*Counter*). Circuito sequencial que percorre uma sequência definida de estados, frequentemente associada à contagem de pulsos. Consulte [Apêndice E](laboratory-experiments.md).

**CPLD** (*Complex programmable logic device*). Dispositivo lógico programável composto por blocos lógicos e interconexões configuráveis, geralmente destinado a funções de controle e lógica de integração. Consulte [Capítulo 25](integrative-projects.md).

**Código Gray** (*Gray code*). Código em que valores adjacentes, segundo a sequência especificada, diferem em apenas um bit. Consulte [Capítulo 2](number-systems-and-information-representation.md).


## G.5. D

**DAC — Conversor Digital-Analógico** (*Digital-to-analog converter*). Circuito que converte um código digital em uma grandeza analógica correspondente, dentro de sua resolução e faixa de operação. Consulte [Apêndice C](reference-tables.md).

**Debounce — Antirrepique** (*Debouncing*). Técnica de filtragem de transições espúrias provocadas pelo contato mecânico de chaves e botões. Consulte [Apêndice E](laboratory-experiments.md).

**Decodificador** (*Decoder*). Circuito combinacional que ativa saídas em função de um código de entrada, segundo uma tabela de correspondência definida. Consulte [Apêndice C](reference-tables.md).

**Diagrama temporal** (*Timing diagram*). Representação da evolução dos sinais ao longo do tempo, com transições, intervalos e relações de sincronização. Consulte [Apêndice B](representation-conventions-and-symbols.md).

**DMA — Acesso Direto à Memória** (*Direct memory access*). Mecanismo pelo qual dados são transferidos entre periféricos e memória com intervenção reduzida do processador, sob controle de um mecanismo dedicado. Consulte [Capítulo 24](integrated-digital-systems.md).


## G.6. E

**Enable — Habilitação** (*Enable*). Sinal de controle que autoriza uma operação, transferência ou atualização quando se encontra no nível lógico definido como ativo. Consulte [Apêndice B](representation-conventions-and-symbols.md).

**Endereçamento** (*Addressing*). Processo de selecionar uma posição de memória, registrador ou dispositivo por meio de um endereço. Consulte [Apêndice C](reference-tables.md).

**Estado lógico** (*Logic state*). Valor abstrato de um sinal digital, tipicamente 0 ou 1, podendo incluir estados de simulação como desconhecido e alta impedância. Consulte [Apêndice B](representation-conventions-and-symbols.md).


## G.7. F

**Fan-out** (*Fan-out*). Quantidade de entradas que uma saída pode acionar respeitando limites de corrente, tensão e temporização; depende das condições elétricas. Consulte [Apêndice C](reference-tables.md).

**FIFO** (*First in, first out*). Estrutura de armazenamento em que os dados são retirados na mesma ordem em que foram inseridos. Consulte [Capítulo 24](integrated-digital-systems.md).

**Flip-flop** (*Flip-flop*). Elemento de memória sequencial que atualiza seu estado em resposta a um evento de relógio, com entradas de controle conforme seu tipo. Consulte [Apêndice C](reference-tables.md).

**FPGA** (*Field-programmable gate array*). Circuito integrado reconfigurável com recursos lógicos, registradores, interconexões e frequentemente memórias e blocos especializados. Consulte [Capítulo 25](integrative-projects.md).

**FSM — Máquina de Estados Finitos** (*Finite-state machine*). Modelo de comportamento com conjunto finito de estados, transições condicionadas por entradas e saídas associadas a estados ou transições. Consulte [Capítulo 24](integrated-digital-systems.md).


## G.8. G

**Glitch** (*Glitch*). Pulso transitório indesejado que pode surgir devido a diferenças de atraso em caminhos lógicos. Consulte [Capítulo 5](logic-function-simplification-and-minimization.md).

**GND — Referência de potencial** (*Ground*). Nó escolhido como referência de tensão de um circuito; nem sempre corresponde à terra de proteção. Consulte [Apêndice B](representation-conventions-and-symbols.md).


## G.9. H

**Hazard — Risco lógico** (*Hazard*). Condição estrutural em que atrasos diferentes podem provocar transições espúrias em uma saída lógica. Consulte [Capítulo 5](logic-function-simplification-and-minimization.md).

**HDL — Linguagem de Descrição de Hardware** (*Hardware description language*). Linguagem usada para descrever estrutura, comportamento e temporização de sistemas digitais, como Verilog e VHDL. Consulte [Apêndice D](introduction-to-simulation-tools.md).


## G.10. I

**Integridade de sinais** (*Signal integrity*). Conjunto de condições que permite reconhecer corretamente níveis e transições elétricas, considerando ruído, reflexões, acoplamentos e temporização. Consulte [Apêndice E](laboratory-experiments.md).

**Interrupção** (*Interrupt*). Evento que solicita tratamento por uma unidade de processamento ou controle, alterando temporariamente o fluxo normal de execução. Consulte [Capítulo 24](integrated-digital-systems.md).

**I²C** (*Inter-integrated circuit*). Barramento serial síncrono de dois sinais, SDA e SCL, tipicamente com saídas de dreno aberto e resistores de pull-up. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).


## G.11. J

**JTAG** (*Joint Test Action Group*). Nome usual de uma interface e de mecanismos de teste e acesso a dispositivos digitais associados à família de normas IEEE 1149.1. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).


## G.12. L

**Latch** (*Latch*). Elemento de armazenamento sensível ao nível de um sinal de habilitação; pode acompanhar a entrada enquanto estiver transparente. Consulte [Apêndice C](reference-tables.md).

**LSB — Bit Menos Significativo** (*Least significant bit*). Bit de menor peso em uma palavra binária; o termo também pode designar o passo nominal de quantização, conforme o contexto. Consulte [Apêndice C](reference-tables.md).


## G.13. M

**Mapa de Karnaugh** (*Karnaugh map*). Organização gráfica de combinações booleanas usada para identificar agrupamentos e simplificar funções lógicas. Consulte [Capítulo 5](logic-function-simplification-and-minimization.md).

**Memória RAM** (*Random-access memory*). Memória endereçável para leitura e escrita; o termo não implica, por si só, retenção dos dados sem alimentação. Consulte [Apêndice C](reference-tables.md).

**Metastabilidade** (*Metastability*). Condição transitória de elemento biestável em que a saída pode demorar a assumir um nível lógico válido, especialmente após violação de requisitos temporais. Consulte [Capítulo 24](integrated-digital-systems.md).

**Minterno — Mintermo** (*Minterm*). Produto lógico que inclui cada variável de uma função uma vez, direta ou complementada, e corresponde a uma combinação de entrada. Consulte [Capítulo 3](boolean-algebra-and-logic-functions.md).

**MSB — Bit Mais Significativo** (*Most significant bit*). Bit de maior peso posicional em uma palavra binária. Consulte [Capítulo 2](number-systems-and-information-representation.md).

**Multiplexador** (*Multiplexer*). Circuito combinacional que seleciona uma entre várias entradas de dados por meio de sinais de seleção. Consulte [Apêndice C](reference-tables.md).


## G.14. N

**NAND** (*NOT AND*). Operação lógica correspondente à negação do produto booleano; é funcionalmente completa para a síntese de circuitos combinacionais. Consulte [Capítulo 4](logic-gates-and-circuit-representation.md).

**NOR** (*NOT OR*). Operação lógica correspondente à negação da soma booleana; também é funcionalmente completa. Consulte [Capítulo 4](logic-gates-and-circuit-representation.md).

**Nível lógico** (*Logic level*). Intervalo de tensão reconhecido como 0 ou 1 por uma família lógica, conforme as especificações de entrada e saída. Consulte [Apêndice B](representation-conventions-and-symbols.md).


## G.15. O

**One-Wire — 1-Wire** (*1-Wire*). Protocolo de comunicação serial que utiliza uma linha de dados compartilhada e referência comum, com temporização específica e topologias dependentes dos dispositivos. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**Overflow — Transbordamento** (*Overflow*). Indicação de que o resultado aritmético não pode ser representado na faixa numérica adotada; em complemento de dois, difere do transporte final. Consulte [Apêndice F](selected-answers-and-solutions.md).


## G.16. P

**Paridade** (*Parity*). Bit ou propriedade usada para detectar determinadas alterações no número de bits 1 de uma palavra transmitida ou armazenada. Consulte [Capítulo 2](number-systems-and-information-representation.md).

**Pipeline** (*Pipeline*). Organização que divide uma operação em estágios capazes de processar diferentes itens simultaneamente, aumentando potencialmente a vazão. Consulte [Capítulo 24](integrated-digital-systems.md).

**PLL** (*Phase-locked loop*). Malha de controle usada, entre outras aplicações, para geração e sincronização de sinais de relógio. Consulte [Capítulo 24](integrated-digital-systems.md).

**Pull-up** (*Pull-up resistor*). Resistor que tende a estabelecer nível alto em um nó quando os dispositivos conectados não o forçam a nível baixo. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**PWM — Modulação por Largura de Pulso** (*Pulse-width modulation*). Representação ou controle de uma grandeza pela fração do período em que um sinal permanece ativo. Consulte [Apêndice C](reference-tables.md).


## G.17. Q

**Quantização** (*Quantization*). Mapeamento de amplitudes contínuas para um conjunto discreto de códigos ou níveis; introduz erro de quantização em relação ao valor original. Consulte [Apêndice A](supplementary-mathematical-foundations.md).


## G.18. R

**Registrador** (*Register*). Conjunto de elementos de memória que armazena uma palavra binária, geralmente com controle de carga e relógio. Consulte [Capítulo 24](integrated-digital-systems.md).

**Reset** (*Reset*). Sinal ou operação que conduz o circuito a um estado inicial definido; pode atuar de modo síncrono ou assíncrono. Consulte [Apêndice B](representation-conventions-and-symbols.md).

**RISC** (*Reduced instruction set computer*). Abordagem de arquitetura de processadores associada a conjuntos de instruções e organização de execução relativamente regulares; não define uma implementação única. Consulte [Capítulo 24](integrated-digital-systems.md).

**RS-485** (*Recommended Standard 485*). Padrão de características elétricas de transceptores diferenciais, empregado em enlaces e barramentos multiponto; não define sozinho um protocolo de aplicação. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**RTL** (*Register-transfer level*). Nível de descrição de hardware centrado em registradores, operações entre eles e sinais de controle. Consulte [Apêndice D](introduction-to-simulation-tools.md).


## G.19. S

**Hold time — Tempo de retenção** (*Hold time*). Intervalo mínimo durante o qual um dado deve permanecer estável após o evento de captura especificado. Consulte [Apêndice C](reference-tables.md).

**Setup time — Tempo de preparação** (*Setup time*). Intervalo mínimo durante o qual um dado deve permanecer estável antes do evento de captura especificado. Consulte [Apêndice C](reference-tables.md).

**Sincronizador** (*Synchronizer*). Circuito que reduz a probabilidade de propagação de metastabilidade ao receber sinais assíncronos em um domínio de clock; não elimina o risco absoluto. Consulte [Capítulo 24](integrated-digital-systems.md).

**SPI** (*Serial peripheral interface*). Interface serial síncrona geralmente baseada em clock, dados transmitidos, dados recebidos e seleção de dispositivo; seus detalhes dependem da implementação. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**SPICE** (*Simulation program with integrated circuit emphasis*). Família de simuladores e formatos de descrição de circuitos para análise elétrica, incluindo regimes transitório e de frequência. Consulte [Apêndice D](introduction-to-simulation-tools.md).


## G.20. T

**Tabela-verdade** (*Truth table*). Tabela que relaciona todas as combinações de entradas de uma função lógica com seus valores de saída. Consulte [Apêndice B](representation-conventions-and-symbols.md).

**Testbench** (*Testbench*). Ambiente de estímulos, observação e verificação utilizado para testar modelos de circuitos em simulação. Consulte [Apêndice D](introduction-to-simulation-tools.md).

**Throughput — Vazão** (*Throughput*). Quantidade de dados ou operações concluídas por unidade de tempo, distinta da latência de uma operação individual. Consulte [Capítulo 24](integrated-digital-systems.md).

**Tri-state — Três estados** (*Three-state output*). Saída digital que pode assumir nível baixo, alto ou alta impedância, permitindo determinadas arquiteturas de compartilhamento de linhas. Consulte [Apêndice B](representation-conventions-and-symbols.md).

**TTL** (*Transistor-transistor logic*). Família de circuitos lógicos baseada historicamente em transistores bipolares; seus níveis elétricos não devem ser generalizados para todas as tecnologias. Consulte [Capítulo 19](logic-families-and-digital-integrated-circuits.md).


## G.21. U

**UART** (*Universal asynchronous receiver-transmitter*). Bloco de transmissão e recepção serial assíncrona que implementa enquadramento por bits de início, dados e parada, com opções como paridade. Consulte [Capítulo 23](digital-system-interfaces-and-communication-revisao-2.md).

**Unidade de controle** (*Control unit*). Bloco que determina operações e transferências de um caminho de dados a partir de estado, instruções e entradas. Consulte [Capítulo 24](integrated-digital-systems.md).


## G.22. V

**VCD** (*Value change dump*). Formato de arquivo que registra mudanças de valores de sinais em simulações digitais, frequentemente visualizado por analisadores de formas de onda. Consulte [Apêndice D](introduction-to-simulation-tools.md).

**Verilog** (*Verilog HDL*). Linguagem de descrição de hardware utilizada na modelagem, simulação e síntese de circuitos digitais. Consulte [Apêndice D](introduction-to-simulation-tools.md).

**VHDL** (*VHSIC hardware description language*). Linguagem de descrição de hardware utilizada para modelar e implementar sistemas digitais. Consulte [Apêndice D](introduction-to-simulation-tools.md).


## G.23. X

**XNOR** (*Exclusive NOR*). Negação da XOR; para duas entradas, resulta em 1 quando os valores são iguais. Consulte [Capítulo 4](logic-gates-and-circuit-representation.md).

**XOR** (*Exclusive OR*). Operação que resulta em 1 quando há um número ímpar de entradas em nível 1; para duas entradas, quando são diferentes. Consulte [Capítulo 4](logic-gates-and-circuit-representation.md).

## G.24. Siglas e unidades de uso recorrente

| Sigla ou símbolo | Significado | Observação |
|---|---|---|
| b / B | bit / byte | 1 byte = 8 bits na convenção usual |
| Hz | hertz | Ciclos ou eventos periódicos por segundo |
| s, ms, µs, ns | segundo, milissegundo, microssegundo, nanossegundo | $10^0$, $10^{-3}$, $10^{-6}$ e $10^{-9}$ s |
| V, A, Ω, F | volt, ampere, ohm, farad | Grandezas elétricas |
| k, M, G | quilo, mega, giga | Prefixos decimais: $10^3$, $10^6$, $10^9$ |
| Ki, Mi, Gi | kibi, mebi, gibi | Prefixos binários: $2^{10}$, $2^{20}$, $2^{30}$ |
| LSB / MSB | bit menos / mais significativo | Posições relativas na palavra binária |
| $V_{IH}$ / $V_{IL}$ | tensão de entrada reconhecida como alta / baixa | Limites definidos em folha de dados |
| $V_{OH}$ / $V_{OL}$ | tensão de saída em alto / baixo | Dependem da carga e das condições de ensaio |
| $t_{pd}$ | atraso de propagação | Pode ter valores distintos para subida e descida |
| $t_{setup}$ / $t_{hold}$ | tempos de preparação / retenção | Requisitos temporais de captura |
| $f_{clk}$ | frequência do relógio | $T_{clk}=1/f_{clk}$ |

## G.25. Termos próximos que não devem ser confundidos

| Termos | Distinção |
|---|---|
| Bit e baud | Bit mede informação binária; baud mede símbolos por segundo. |
| Transporte e transbordamento | O primeiro relaciona-se à aritmética posicional; o segundo, à faixa representável. |
| Latência e vazão | Latência é o tempo de uma operação; vazão é a quantidade concluída por unidade de tempo. |
| Clock e habilitação | O relógio fornece eventos de sincronização; a habilitação autoriza uma operação. |
| Latch e flip-flop | O latch é tipicamente sensível a nível; o flip-flop, a borda. |
| Reset síncrono e assíncrono | O primeiro atua no evento de clock; o segundo pode atuar independentemente dele. |
| Simulação funcional e análise temporal | A primeira avalia comportamento; a segunda examina restrições e atrasos. |
| Alta impedância e nível lógico alto | Alta impedância não significa tensão alta. |
| RS-485 e protocolo de comunicação | RS-485 especifica características elétricas; o enquadramento e as mensagens dependem do protocolo usado. |

## G.26. Referências de consulta

Para notação, unidades e símbolos, consulte o [Apêndice B](representation-conventions-and-symbols.md). Para relações numéricas e tabelas, consulte o [Apêndice C](reference-tables.md). Para ferramentas e verificação, consulte o [Apêndice D](introduction-to-simulation-tools.md). Os conceitos de integração de sistemas e interfaces são aprofundados nos [Capítulos 23](digital-system-interfaces-and-communication-revisao-2.md) e [24](integrated-digital-systems.md).
