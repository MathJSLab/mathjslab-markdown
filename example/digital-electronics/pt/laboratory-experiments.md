# Apêndice E. Experimentos de laboratório {#appendix-e}

A aprendizagem de Eletrônica Digital envolve a passagem entre três representações complementares: **especificação lógica**, **simulação** e **comportamento de um circuito físico**. Este apêndice propõe roteiros experimentais que podem ser executados com circuitos integrados de lógica discreta, placas de prototipagem, instrumentos de bancada ou, quando indicado, dispositivos lógicos programáveis. Os roteiros complementam o Apêndice D, mas não pressupõem que um resultado de simulação comprove o funcionamento de uma montagem real.

Os experimentos são apresentados em ordem aproximada de complexidade. O professor poderá selecionar atividades conforme a carga horária, o laboratório disponível e os objetivos da disciplina. Os valores de componentes são **exemplos de dimensionamento**, não substituem as especificações dos fabricantes.

## E.1. Organização, segurança e registro experimental

### E.1.1. Requisitos de segurança

1. Trabalhe preferencialmente com fontes **CC isoladas e limitadas em corrente**, adequadas à família lógica escolhida. Não conecte circuitos didáticos diretamente à rede elétrica.
2. **Desligue a alimentação** antes de inserir ou remover circuitos integrados, alterar conexões ou reposicionar pontas de prova em regiões de risco de curto-circuito.
3. Confira pinagem, orientação, tensão de alimentação, polaridade, referência de terra e corrente admissível no *datasheet* de cada componente. Componentes com funções equivalentes podem ter pinagens ou limites distintos.
4. Use um capacitor de desacoplamento próximo de cada circuito integrado, conforme a recomendação do fabricante; **100 nF cerâmico** é um valor inicial frequente, mas não universal.
5. Nunca deixe entradas CMOS comuns flutuando. Use resistores de polarização, conforme a função e as especificações do circuito.
6. Nunca conecte diretamente uma saída configurada para nível alto a outra saída configurada para nível baixo. Use resistores limitadores para LEDs e não ultrapasse a capacidade de corrente das saídas.
7. Em medições com osciloscópio de bancada, verifique a ligação do terminal de terra da sonda à terra de proteção do instrumento. Não o conecte a um ponto energizado ou de potencial desconhecido.
8. Evite alimentação simultânea por USB e fonte externa sem verificar as condições da placa. Para FPGA e microcontroladores, respeite níveis lógicos, bancos de I/O e proteção contra sobretensão.

### E.1.2. Estrutura mínima do relatório

Cada atividade deve produzir um registro com: identificação e data; objetivo; materiais e versões; esquemático e pinagem; hipótese e previsão teórica; procedimento; resultados brutos (tabelas, capturas e medições); comparação com a previsão; fontes de incerteza e conclusão. Uma fotografia da montagem não substitui um esquemático verificável.

### E.1.3. Equipamentos e alternativas

| Recurso | Aplicação | Alternativa didática |
|---|---|---|
| Fonte CC regulada com limitação de corrente | Alimentação controlada | Fonte isolada de laboratório com proteção |
| Multímetro | Tensões, continuidade e corrente | Instrumento equivalente devidamente calibrado |
| Osciloscópio | Bordas, pulsos, atraso e ruído | Analisador lógico para sinais estritamente digitais |
| Gerador de funções/pulsos | Relógio e estímulos periódicos | Oscilador digital apropriado |
| Protoboard, fios curtos e componentes | Montagem física | Placa de treinamento |
| Simulador lógico ou HDL | Verificação anterior à montagem | Ferramentas apresentadas no Apêndice D |

**Limitação instrumental:** um analisador lógico geralmente informa estados discretizados a partir de limiares; não substitui o osciloscópio quando a pergunta envolve amplitude, tempo de subida, reflexões ou margens de ruído.

## E.2. Experimento 1 — Portas lógicas e tabelas-verdade {#appendix-e-experiment-01}

**Objetivo:** confrontar a tabela-verdade de portas NOT, AND, OR, NAND, NOR e XOR com medições em componentes reais.

**Materiais:** circuitos integrados apropriados a uma mesma família lógica, fonte compatível, chaves ou geradores de nível lógico, resistores de polarização, indicadores LED com resistores limitadores e multímetro.

**Preparação:** selecione um componente por função e consulte sua pinagem, alimentação e capacidade de corrente. Se o indicador LED exigir corrente maior do que a saída permite, use um estágio de acionamento adequado.

**Procedimento:**

1. Desenhe o circuito de teste, indicando a origem dos níveis `0` e `1` e a referência comum.
2. Com a fonte desligada, monte o circuito e confira as conexões.
3. Energize e meça a tensão de alimentação nos terminais do integrado.
4. Aplique todas as combinações de entradas: duas para NOT e quatro para cada porta de duas entradas.
5. Registre a tensão de saída e sua interpretação lógica, conforme os limites especificados para o dispositivo.
6. Compare os resultados com as expressões booleanas e repita o teste para uma porta universal NAND ou NOR.

| A | B | AND esperada | OR esperada | XOR esperada | NAND esperada |
|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 | 0 |

**Questões:** por que a tensão medida não é necessariamente exatamente 0 V ou igual à alimentação? Como os limiares de entrada diferem entre famílias? O que muda ao aumentar a carga da saída?

**Critério de aceitação:** todas as combinações produzem o valor lógico esperado e as tensões atendem aos limites da folha de dados, nas condições de carga e alimentação utilizadas.

## E.3. Experimento 2 — Álgebra booleana e equivalência de circuitos {#appendix-e-experiment-02}

**Objetivo:** verificar experimentalmente uma identidade de De Morgan e comparar duas implementações equivalentes.

Considere

$$
\overline{A\cdot B}=\overline A+\overline B.
$$

**Materiais:** portas NAND, NOT e OR ou um dispositivo programável; chaves de entrada e indicadores.

**Procedimento:** monte o lado esquerdo com NAND e o direito com inversores e OR. Alimente ambos com as mesmas entradas e compare suas saídas para as quatro combinações. Se houver osciloscópio e gerador de pulsos, observe as saídas durante transições rápidas.

| A | B | $\overline{AB}$ | $\overline A+\overline B$ | Coincidem? |
|---:|---:|---:|---:|---|
| 0 | 0 | 1 | 1 | |
| 0 | 1 | 1 | 1 | |
| 1 | 0 | 1 | 1 | |
| 1 | 1 | 0 | 0 | |

**Discussão:** equivalência booleana em regime estacionário não implica igualdade de atrasos ou ausência de transitórios. Identifique possíveis diferenças de propagação entre as implementações.

## E.4. Experimento 3 — Circuitos combinacionais: multiplexador e somador {#appendix-e-experiment-03}

**Objetivo:** construir blocos combinacionais e testar sistematicamente suas entradas.

### E.4.1. Multiplexador 2:1

Para entradas $D_0$, $D_1$ e seleção $S$, implemente

$$Y=\overline S D_0+SD_1.$$

**Procedimento:** construa o circuito com portas ou use um CI multiplexador. Varie as oito combinações de entrada e verifique que $Y=D_0$ para $S=0$ e $Y=D_1$ para $S=1$. Registre o resultado em uma tabela com as colunas $S,D_0,D_1,Y_{\mathrm{previsto}},Y_{\mathrm{medido}}$.

### E.4.2. Meio somador

Implemente as funções

$$S=A\oplus B,\qquad C=A\cdot B.$$

| A | B | Soma $S$ | Transporte $C$ |
|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

**Extensão:** conecte dois meios somadores e uma porta OR para obter um somador completo. Compare com as expressões $S=A\oplus B\oplus C_{in}$ e $C_{out}=AB+C_{in}(A\oplus B)$.

**Critério de aceitação:** verificação exaustiva das combinações para os blocos escolhidos, com registro de eventuais transitórios.

## E.5. Experimento 4 — Latches, flip-flops e antirrepique {#appendix-e-experiment-04}

**Objetivo:** distinguir armazenamento sensível a nível e a borda, além de observar o efeito de contatos mecânicos.

**Materiais:** latch ou flip-flop D, botão, gerador de clock, resistores de polarização, LEDs e, preferencialmente, osciloscópio.

**Procedimento:**

1. Aplique um sinal $D$ estável e observe a saída $Q$ antes e depois do evento de habilitação ou da borda ativa.
2. Varie $D$ fora do evento de amostragem e determine se $Q$ deve permanecer constante.
3. Aplique pulsos lentos e compare latch e flip-flop quanto à sensibilidade temporal.
4. Observe o sinal bruto de um botão. Registre a ocorrência de múltiplas transições durante uma única atuação, caso observável.
5. Acrescente um circuito de antirrepique apropriado, como uma rede RC seguida de entrada Schmitt, respeitando as especificações elétricas. Compare as formas de onda.

**Atenção:** não provoque deliberadamente violações de *setup* e *hold* para tentar observar metastabilidade como se fosse um estado lógico estável. Esses fenômenos exigem interpretação estatística e instrumentos adequados.

**Questões:** qual é a diferença entre atraso de propagação e tempo de estabelecimento? Por que um botão pode incrementar um contador várias vezes?

## E.6. Experimento 5 — Contadores, divisores e decodificação {#appendix-e-experiment-05}

**Objetivo:** observar a evolução de estados de um contador binário e seu emprego como divisor de frequência.

**Materiais:** contador síncrono de quatro bits ou implementação equivalente, clock, reset, LEDs e analisador lógico.

**Procedimento:** inicialize o contador em zero; aplique 16 bordas de clock; registre $Q_3Q_2Q_1Q_0$; verifique a transição de $1111$ para $0000$. Para cada saída, estime sua frequência de repetição, assumindo um contador binário livre e estável:

$$f_{Q_k}=\frac{f_{CLK}}{2^{k+1}},\quad k=0,1,2,3.$$

**Tabela de registro sugerida:** número da borda, estado previsto, estado observado, erro e observações. Teste o reset em condição segura e documente se ele é síncrono ou assíncrono.

**Extensão:** associe um decodificador e um mostrador de sete segmentos, verificando a correspondência entre entradas e segmentos. Não presuma que o mostrador seja de ânodo comum ou cátodo comum sem conferir sua identificação.

## E.7. Experimento 6 — Máquina de estados: controlador de semáforo {#appendix-e-experiment-06}

**Objetivo:** especificar, implementar e verificar uma máquina de estados finitos (FSM) com saídas observáveis.

**Especificação didática:** três estados $V$ (verde), $A$ (amarelo) e $R$ (vermelho), com transições $V\to A\to R\to V$ após períodos configuráveis. Este circuito é um **modelo educacional**, não um controlador certificado para uso viário.

| Estado | Verde | Amarelo | Vermelho | Próximo estado |
|---|---:|---:|---:|---|
| $V$ | 1 | 0 | 0 | $A$, após $T_V$ |
| $A$ | 0 | 1 | 0 | $R$, após $T_A$ |
| $R$ | 0 | 0 | 1 | $V$, após $T_R$ |

**Procedimento:** desenhe o diagrama de estados; escolha uma codificação; defina reset para $R$; implemente a lógica de transição e temporização em HDL ou portas e registradores; simule antes de conectar os LEDs; registre o ciclo completo e verifique que não existem duas saídas ativas simultaneamente.

**Critérios de aceitação:** sequência correta, tempos dentro da tolerância estabelecida, reset definido e comportamento documentado para estados não utilizados.

**Extensão:** inclua uma solicitação de pedestre com sincronização e lógica de prioridade, sem eliminar o intervalo de segurança especificado.

## E.8. Experimento 7 — Conversão analógico-digital e quantização {#appendix-e-experiment-07}

**Objetivo:** relacionar tensão de entrada, resolução, código digital e erro de quantização.

**Materiais:** módulo ADC didático ou placa com ADC integrado, fonte de tensão ajustável de baixa energia, voltímetro e interface de leitura. Confirme se a entrada tolera a faixa de tensão aplicada.

Para um conversor ideal unipolar de $N$ bits, com faixa de entrada de $0$ a $V_{ref}$ e codificação uniforme, o tamanho nominal de um intervalo é

$$\Delta=\frac{V_{ref}}{2^N}.$$

O código depende da convenção de transferência do ADC (truncamento, arredondamento, saturação e eventual deslocamento de meio LSB). **Não** utilize uma fórmula única de código sem consultar a característica de transferência do dispositivo.

**Procedimento:** determine $N$ e $V_{ref}$; calcule $\Delta$; aplique ao menos cinco tensões distribuídas pela faixa permitida; registre código, tensão e previsão; investigue os limites inferior e superior sem excedê-los.

| Tensão aplicada (V) | Código previsto | Código observado | Diferença | Observações |
|---:|---:|---:|---:|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

**Questões:** como ruído e incerteza da referência influenciam a leitura? Qual a diferença entre resolução, exatidão e número efetivo de bits (ENOB)?

## E.9. Experimento 8 — Comunicação serial UART {#appendix-e-experiment-08}

**Objetivo:** identificar enquadramento, ordem de bits, taxa de transmissão e integridade básica de uma comunicação serial assíncrona.

**Materiais:** dois módulos UART compatíveis ou um dispositivo e adaptador USB–UART **TTL/CMOS de tensão compatível**; analisador lógico; fios e terra comum. **Não conecte sinais RS-232 diretamente a pinos UART TTL/CMOS.**

**Configuração sugerida:** 8 bits de dados, sem paridade, um bit de parada (8N1), em uma taxa suportada por ambos os dispositivos.

**Procedimento:** ligue TX de um lado ao RX do outro e compartilhe a referência elétrica; transmita os bytes `0x55`, `0xA5` e `0x00`; capture a forma de onda; identifique bit de início, oito bits de dados transmitidos do menos significativo para o mais significativo e bit de parada; compare os bytes recebidos.

Em 8N1, cada quadro contém dez intervalos de bit. A duração nominal do quadro é

$$T_{quadro}=\frac{10}{B},$$

em que $B$ é a taxa de símbolos em baud, igual à taxa de bits neste caso de modulação binária.

**Critério de aceitação:** recepção correta dos bytes e temporização compatível com a configuração. **Extensão:** varie intencionalmente as configurações entre transmissor e receptor, documentando os erros observados, sem exceder os limites elétricos.

## E.10. Experimento 9 — Integridade de sinais e redes RC {#appendix-e-experiment-09}

**Objetivo:** investigar a relação entre resistência, capacitância, tempo de subida e interpretação de níveis lógicos.

**Materiais:** gerador de pulsos, resistores, capacitores, osciloscópio e, opcionalmente, entrada Schmitt de tensão compatível.

**Modelo inicial:** uma rede RC de primeira ordem excitada por um degrau ideal apresenta

$$v_C(t)=V_F\left(1-e^{-t/(RC)}\right),\qquad \tau=RC.$$

O tempo de subida entre 10% e 90% vale aproximadamente

$$t_{10\text{–}90}\approx 2{,}197\,RC.$$

**Procedimento:** escolha valores de $R$ e $C$ que produzam tempos mensuráveis; estime $\tau$ e $t_{10\text{–}90}$; monte a rede; registre a tensão no capacitor; compare com o modelo; altere $C$ e observe a mudança. Considere a impedância de saída do gerador e a carga introduzida pela sonda.

**Questões:** por que uma borda lenta pode ser problemática em uma entrada digital comum? Como a histerese de uma entrada Schmitt altera a resposta? Em que condições o modelo concentrado RC deixa de ser suficiente?

## E.11. Experimento 10 — Projeto integrado de aquisição e registro {#appendix-e-experiment-10}

**Objetivo:** integrar sensor ou fonte de sinal, aquisição, lógica de controle, buffer e apresentação ou armazenamento de dados, articulando os Capítulos 23–25.

**Requisitos mínimos:** amostragem periódica; indicação de amostra válida; registro de pelo menos oito amostras; sinalização de buffer cheio; reset definido; recuperação dos dados na ordem especificada.

**Etapas:**

1. Defina a grandeza medida, faixa, resolução, taxa de amostragem e formato de dados.
2. Desenhe a arquitetura em blocos e o diagrama de temporização dos sinais `sample`, `valid`, `write_en` e `full`.
3. Estabeleça uma política para buffer cheio: interromper aquisição, sobrescrever dados antigos ou sinalizar perda. A política deve ser explícita e testada.
4. Implemente inicialmente uma fonte de dados digital conhecida; só depois conecte o sensor ou ADC.
5. Verifique sequência, contagem, reset, integridade e tratamento de eventos simultâneos.
6. Registre um ensaio normal e ao menos dois ensaios de falha ou condição-limite.

**Critério de aceitação:** nenhuma amostra aceita é perdida ou duplicada dentro da capacidade e da política especificadas; a ordem de leitura é consistente; os indicadores de estado correspondem à ocupação real do buffer.

## E.12. Planejamento de medidas e análise de resultados

Uma medida deve ser apresentada com unidade, condições de teste e resolução instrumental. Em comparações quantitativas, calcule, quando pertinente,

$$e_{abs}=|x_m-x_{ref}|,\qquad e_{rel}=\frac{|x_m-x_{ref}|}{|x_{ref}|},\quad x_{ref}\ne0.$$

O erro relativo não é definido para referência nula. Evite concluir que uma diferença decorre de defeito do circuito sem antes avaliar tolerâncias de componentes, instrumento, temperatura, carga e modelo teórico.

| Grandeza | Valor previsto | Valor medido | Unidade | Condições de medição |
|---|---:|---:|---|---|
| Tensão de saída | | | V | |
| Frequência | | | Hz | |
| Tempo de subida | | | s | |
| Atraso de propagação | | | s | |

Em medições digitais, registre também a definição operacional do instante de transição (por exemplo, cruzamento de um limiar de tensão), pois o tempo obtido depende dessa escolha.

## E.13. Avaliação e critérios de qualidade

Uma proposta de avaliação pode distribuir a pontuação entre **preparação e especificação** ($20%$), **montagem e segurança** ($20%$), **medições e rastreabilidade** ($25%$), **análise crítica** ($25%$) e **comunicação técnica** ($10%$). Os percentuais são sugestivos e devem ser ajustados aos objetivos do curso.

A aprovação experimental não deve depender exclusivamente de o circuito funcionar na primeira tentativa. A identificação de uma falha, acompanhada de diagnóstico, correção fundamentada e documentação, também demonstra aprendizagem técnica. Em contrapartida, uma montagem aparentemente funcional sem evidências de teste não comprova atendimento à especificação.

## E.14. Exercícios e propostas de investigação

1. Elabore um esquema de teste para comparar a saída de duas famílias lógicas com tensões de alimentação diferentes, sem conectá-las diretamente quando houver incompatibilidade de níveis.
2. Projete uma tabela de medidas para investigar a influência da carga na tensão de saída de uma porta lógica.
3. Explique como verificar experimentalmente o teorema de De Morgan com quatro combinações de entrada.
4. Proponha um teste que diferencie um multiplexador correto de outro com as entradas $D_0$ e $D_1$ invertidas.
5. Desenvolva um procedimento para detectar múltiplas transições de um botão mecânico.
6. Calcule as frequências esperadas das quatro saídas de um contador binário com clock de $1\,\mathrm{kHz}$.
7. Explique por que o reset deve ser verificado em mais de um instante de um ciclo de operação.
8. Determine o tamanho do LSB de um ADC ideal unipolar de 10 bits com referência de $3{,}3\,\mathrm V$.
9. Para UART 8N1 a 9600 baud, calcule o tempo nominal de transmissão de um quadro.
10. Calcule $\tau$ e o tempo de subida $10%$–$90%$ para $R=4{,}7\,\mathrm{k\Omega}$ e $C=10\,\mathrm{nF}$.
11. Descreva uma estratégia para distinguir erro de lógica de erro de alimentação em uma montagem.
12. Proponha três testes de condição-limite para uma FIFO de oito posições.
13. Compare as evidências fornecidas por um LED, um analisador lógico e um osciloscópio.
14. Elabore um relatório de falha experimental contendo hipótese, teste de diagnóstico, resultado e correção.
15. Proponha um experimento adicional que integre dois conteúdos estudados em capítulos diferentes.

**Respostas numéricas selecionadas:** (6) $500$, $250$, $125$ e $62{,}5\,\mathrm{Hz}$, respectivamente; (8) $\Delta=3{,}3/1024\approx3{,}223\,\mathrm{mV}$; (9) $10/9600\approx1{,}042\,\mathrm{ms}$; (10) $\tau=47\,\mathrm{\mu s}$ e $t_{10\text{–}90}\approx103{,}3\,\mathrm{\mu s}$.

## E.15. Referências e documentação de apoio

- **Folhas de dados dos circuitos integrados empregados:** pinagem, alimentação, limites absolutos, características recomendadas e tempos de propagação.
- **IEEE Std 1800:** linguagem SystemVerilog, útil para preparação e verificação de implementações digitais.
- **Manuais dos instrumentos de laboratório:** precisão, largura de banda, impedância de entrada e práticas de segurança.
- **Documentação de Logisim-evolution, Icarus Verilog, GTKWave e ngspice:** apoio à simulação preparatória e à análise dos resultados.
- **Manuais de placas FPGA e módulos de aquisição:** níveis de entrada/saída, distribuição de clock, proteção e restrições de projeto.
- **Apêndice D — Introdução às ferramentas de simulação:** procedimentos de simulação e registro reproduzível.

**Síntese:** o laboratório não é apenas uma etapa de confirmação de tabelas-verdade. É o espaço em que modelos abstratos são confrontados com alimentação, temporização, instrumentos, ruído, cargas e decisões de implementação. O resultado experimental mais valioso é aquele que pode ser explicado, repetido e criticamente confrontado com uma especificação.
