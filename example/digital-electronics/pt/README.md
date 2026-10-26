# Eletrônica Digital

Obra de referência para cursos superiores de Engenharia Elétrica, Ciência da
Computação e áreas afins. A exposição parte da representação binária e da
lógica booleana, avança pela análise e síntese de circuitos digitais e alcança
a implementação eletrônica, as tecnologias programáveis e a integração de
sistemas.

## Parte I — Fundamentos dos sistemas digitais

### 1. Introdução à Eletrônica Digital {#chapter-01}

[Ler o Capítulo 1 — Introdução à Eletrônica Digital](introduction-to-digital-electronics-revisao-1.md)

- 1.1. Grandezas analógicas e digitais
- 1.2. Sinais contínuos, discretos e binários
- 1.3. Informação, representação e processamento digital
- 1.4. Níveis lógicos e sinais elétricos
- 1.5. Sistemas combinacionais e sequenciais
- 1.6. Abstração: dispositivos, portas, blocos e sistemas
- 1.7. Evolução dos circuitos e das tecnologias digitais
- 1.8. Aplicações e metodologias de projeto

### 2. Sistemas de numeração e representação da informação {#chapter-02}

[Ler o Capítulo 2 — Sistemas de numeração e representação da informação](number-systems-and-information-representation-revisao-1.md)

- 2.1. Sistemas posicionais e bases numéricas
- 2.2. Sistemas decimal, binário, octal e hexadecimal
- 2.3. Conversão entre bases
- 2.4. Aritmética binária
- 2.5. Complemento de um e complemento de dois
- 2.6. Números com e sem sinal
- 2.7. Ponto fixo e introdução à representação em ponto flutuante
- 2.8. Códigos BCD, Gray e códigos alfanuméricos
- 2.9. Códigos de detecção de erros e paridade

### 3. Álgebra booleana e funções lógicas {#chapter-03}

[Ler o Capítulo 3 — Álgebra booleana e funções lógicas](boolean-algebra-and-logic-functions-revisao-1.md)

- 3.1. Variáveis e funções booleanas
- 3.2. Operações lógicas fundamentais
- 3.3. Postulados, propriedades e teoremas
- 3.4. Princípio da dualidade
- 3.5. Teoremas de De Morgan
- 3.6. Tabelas-verdade e expressões lógicas
- 3.7. Formas canônicas: mintermos e maxtermos
- 3.8. Soma de produtos e produto de somas
- 3.9. Funções completamente e incompletamente especificadas

### 4. Portas lógicas e representação de circuitos {#chapter-04}

[Ler o Capítulo 4 — Portas lógicas e representação de circuitos](logic-gates-and-circuit-representation.md)

- 4.1. Portas NOT, AND e OR
- 4.2. Portas NAND e NOR
- 4.3. Portas XOR e XNOR
- 4.4. Portas universais
- 4.5. Símbolos e convenções de representação
- 4.6. Implementação de funções por portas lógicas
- 4.7. Circuitos multiníveis
- 4.8. Introdução ao atraso de propagação e aos diagramas temporais

## Parte II — Análise e síntese de circuitos combinacionais

### 5. Simplificação e minimização de funções lógicas {#chapter-05}

[Ler o Capítulo 5 — Simplificação e minimização de funções lógicas](logic-function-simplification-and-minimization.md)

- 5.1. Simplificação algébrica
- 5.2. Mapas de Karnaugh
- 5.3. Agrupamentos e implicantes
- 5.4. Condições indiferentes (_don’t care_)
- 5.5. Método de Quine–McCluskey
- 5.6. Seleção de implicantes essenciais
- 5.7. Minimização de circuitos multiníveis
- 5.8. Compromissos entre área, atraso e consumo
- 5.9. Riscos lógicos (_hazards_) e condições transitórias

### 6. Projeto de circuitos combinacionais {#chapter-06}

[Ler o Capítulo 6 — Projeto de circuitos combinacionais](combinational-circuit-design.md)

- 6.1. Especificação funcional
- 6.2. Modelagem por tabelas-verdade
- 6.3. Análise de circuitos existentes
- 6.4. Síntese de circuitos a partir de especificações
- 6.5. Circuitos de votação e decisão
- 6.6. Detectores e geradores de paridade
- 6.7. Circuitos de comparação
- 6.8. Validação e testes funcionais

### 7. Codificadores, decodificadores e seleção de dados {#chapter-07}

[Ler o Capítulo 7 — Codificadores, decodificadores e seleção de dados](encoders-decoders-and-data-selection.md)

- 7.1. Codificadores binários
- 7.2. Codificadores com prioridade
- 7.3. Decodificadores
- 7.4. Conversores de códigos
- 7.5. Displays de sete segmentos
- 7.6. Multiplexadores
- 7.7. Demultiplexadores
- 7.8. Implementação de funções com multiplexadores
- 7.9. Estruturas de seleção e roteamento de sinais

### 8. Circuitos aritméticos digitais {#chapter-08}

[Ler o Capítulo 8 — Circuitos aritméticos digitais](digital-arithmetic-circuits.md)

- 8.1. Meio somador e somador completo
- 8.2. Somadores de múltiplos bits
- 8.3. Propagação de transporte (_carry_)
- 8.4. Somadores com antecipação de transporte
- 8.5. Subtratores e circuitos somadores-subtratores
- 8.6. Detecção de transbordamento (_overflow_)
- 8.7. Comparadores aritméticos
- 8.8. Multiplicação binária e circuitos multiplicadores
- 8.9. Deslocadores e operações bit a bit
- 8.10. Unidade lógica e aritmética (ULA)

## Parte III — Circuitos sequenciais e sistemas síncronos

### 9. Fundamentos dos circuitos sequenciais {#chapter-09}

[Ler o Capítulo 9 — Fundamentos dos circuitos sequenciais](sequential-circuit-fundamentals.md)

- 9.1. Estado e memória
- 9.2. Realimentação lógica
- 9.3. Circuitos síncronos e assíncronos
- 9.4. Sinais de relógio (_clock_)
- 9.5. Diagramas temporais
- 9.6. Latches SR e D
- 9.7. Flip-flops SR, JK, D e T
- 9.8. Entradas assíncronas de controle
- 9.9. Equações características e tabelas de excitação

### 10. Temporização e confiabilidade de circuitos sequenciais {#chapter-10}

[Ler o Capítulo 10 — Temporização e confiabilidade de circuitos sequenciais](sequential-timing-and-reliability.md)

- 10.1. Atrasos de propagação
- 10.2. Tempos de estabelecimento (_setup_) e retenção (_hold_)
- 10.3. Frequência máxima de operação
- 10.4. Distribuição de relógio e _clock skew_
- 10.5. Metastabilidade
- 10.6. Sincronização de entradas assíncronas
- 10.7. Domínios de relógio e transferência de sinais
- 10.8. Condições de corrida e riscos temporais

### 11. Registradores e contadores {#chapter-11}

[Ler o Capítulo 11 — Registradores e contadores](registers-and-counters.md)

- 11.1. Registradores paralelos
- 11.2. Registradores de deslocamento
- 11.3. Conversão série-paralelo e paralelo-série
- 11.4. Registradores bidirecionais
- 11.5. Contadores assíncronos
- 11.6. Contadores síncronos
- 11.7. Contadores de módulo arbitrário
- 11.8. Contadores em anel e Johnson
- 11.9. Divisores de frequência
- 11.10. Aplicações de contadores e registradores

### 12. Máquinas de estados finitos {#chapter-12}

[Ler o Capítulo 12 — Máquinas de estados finitos](finite-state-machines.md)

- 12.1. Conceito de máquina de estados
- 12.2. Modelos de Moore e Mealy
- 12.3. Diagramas e tabelas de transição
- 12.4. Codificação de estados
- 12.5. Minimização de estados
- 12.6. Síntese de máquinas sequenciais
- 12.7. Detectores de sequências
- 12.8. Controladores digitais
- 12.9. Projeto de unidades de controle
- 12.10. Verificação funcional de máquinas de estados

## Parte IV — Implementação eletrônica dos circuitos digitais

### 13. Dispositivos semicondutores e chaveamento digital {#chapter-13}

[Ler o Capítulo 13 — Dispositivos semicondutores e chaveamento digital](semiconductor-devices-and-digital-switching.md)

- 13.1. Fundamentos de semicondutores aplicados à lógica digital
- 13.2. Diodos e transistores como chaves
- 13.3. Transistores bipolares de junção
- 13.4. Transistores MOSFET
- 13.5. Regiões de operação e chaveamento
- 13.6. Características estáticas e dinâmicas
- 13.7. Inversores implementados com transistores
- 13.8. Dissipação de potência e limitações físicas

### 14. Famílias lógicas e circuitos integrados digitais {#chapter-14}

[Ler o Capítulo 14 — Famílias lógicas e circuitos integrados digitais](logic-families-and-digital-integrated-circuits.md)

- 14.1. Parâmetros elétricos das famílias lógicas
- 14.2. Níveis de tensão e margens de ruído
- 14.3. _Fan-in_, _fan-out_ e capacidade de acionamento
- 14.4. Família TTL e Schottky TTL
- 14.5. Famílias NMOS e pseudo-NMOS
- 14.6. Tecnologia CMOS
- 14.7. Tecnologia BiCMOS
- 14.8. Família ECL
- 14.9. Portas especiais, saídas de três estados e coletor/dreno aberto
- 14.10. Compatibilidade e interfaces entre famílias
- 14.11. Potência estática, dinâmica e produto potência-atraso
- 14.12. Seleção de componentes por folhas de dados

### 15. Integridade de sinais e implementação física {#chapter-15}

[Ler o Capítulo 15 — Integridade de sinais e implementação física](signal-integrity-and-physical-implementation.md)

- 15.1. Modelos reais de entradas e saídas digitais
- 15.2. Capacitâncias parasitas e cargas
- 15.3. Tempos de subida e descida
- 15.4. Reflexões e linhas de transmissão
- 15.5. Ruído, interferência e diafonia
- 15.6. Aterramento e desacoplamento
- 15.7. Terminação de sinais
- 15.8. Interligação de circuitos integrados
- 15.9. Cuidados no projeto de placas de circuito impresso
- 15.10. Testes, medições e diagnóstico de falhas

## Parte V — Memórias, temporização e conversão de sinais

### 16. Memórias semicondutoras {#chapter-16}

[Ler o Capítulo 16 — Memórias semicondutoras](semiconductor-memories.md)

- 16.1. Organização e endereçamento
- 16.2. Células de memória
- 16.3. Memórias ROM, PROM, EPROM e EEPROM
- 16.4. Memórias SRAM e DRAM
- 16.5. Memórias Flash
- 16.6. Organização em palavras e bancos
- 16.7. Barramentos de endereço, dados e controle
- 16.8. Ciclos de leitura e escrita
- 16.9. Temporização e desempenho
- 16.10. Memórias síncronas e assíncronas
- 16.11. Seleção e expansão de memórias

### 17. Circuitos de temporização e geração de pulsos {#chapter-17}

[Ler o Capítulo 17 — Circuitos de temporização e geração de pulsos](timing-and-pulse-generation-circuits.md)

- 17.1. Redes RC de temporização
- 17.2. Comparadores com histerese e disparadores Schmitt
- 17.3. Circuitos monoestáveis, astáveis e biestáveis
- 17.4. Temporizadores integrados
- 17.5. Osciladores e geradores de relógio
- 17.6. Cristais e referências de frequência
- 17.7. Divisão e multiplicação de frequência
- 17.8. Circuitos de atraso e conformação de pulsos
- 17.9. Introdução aos PLLs
- 17.10. Aplicações de temporização

### 18. Conversores digital-analógico (DAC) {#chapter-18}

[Ler o Capítulo 18 — Conversores digital-analógico (DAC)](digital-to-analog-converters.md)

- 18.1. Princípios da conversão digital-analógica
- 18.2. Resolução, faixa e quantização
- 18.3. Conversores por resistores ponderados
- 18.4. Conversores em escada R–2R
- 18.5. Conversores por corrente
- 18.6. Erros de offset, ganho e linearidade
- 18.7. Tempo de acomodação
- 18.8. Conversão por modulação de largura de pulso
- 18.9. Aplicações e critérios de seleção

### 19. Conversores analógico-digitais (ADC) {#chapter-19}

[Ler o Capítulo 19 — Conversores analógico-digitais (ADC)](analog-to-digital-converters.md)

- 19.1. Amostragem e quantização
- 19.2. Teorema da amostragem
- 19.3. Erro de quantização e relação sinal-ruído
- 19.4. Conversores por comparação paralela (_flash_)
- 19.5. Conversores por rampa e contagem
- 19.6. Conversores por aproximações sucessivas (SAR)
- 19.7. Conversores sigma-delta
- 19.8. Resolução efetiva e desempenho dinâmico
- 19.9. Aliasing e filtragem antialiasing
- 19.10. Referências de tensão e condicionamento de entrada
- 19.11. Aplicações e critérios de seleção

## Parte VI — Dispositivos programáveis e projeto digital

### 20. Dispositivos lógicos programáveis {#chapter-20}

[Ler o Capítulo 20 — Dispositivos lógicos programáveis](programmable-logic-devices.md)

- 20.1. Conceito de lógica programável
- 20.2. ROM como implementação de funções lógicas
- 20.3. PLA e PAL
- 20.4. PLDs e CPLDs
- 20.5. Arquitetura básica de FPGAs
- 20.6. Blocos lógicos configuráveis
- 20.7. Redes de interconexão programáveis
- 20.8. Recursos de memória e processamento
- 20.9. Comparação entre lógica discreta, CPLDs e FPGAs
- 20.10. Aplicações de dispositivos programáveis

### 21. Linguagens de descrição de hardware {#chapter-21}

[Ler o Capítulo 21 — Linguagens de descrição de hardware](hardware-description-languages.md)

- 21.1. Descrição estrutural e comportamental
- 21.2. Conceitos de VHDL e Verilog
- 21.3. Representação de lógica combinacional
- 21.4. Representação de circuitos sequenciais
- 21.5. Processos síncronos e assíncronos
- 21.6. Simulação e bancos de testes
- 21.7. Síntese lógica
- 21.8. Restrições de temporização
- 21.9. Correspondência entre HDL e hardware implementado

### 22. Metodologia de projeto e verificação digital {#chapter-22}

[Ler o Capítulo 22 — Metodologia de projeto e verificação digital](digital-design-and-verification-methodology.md)

- 22.1. Especificação de requisitos
- 22.2. Decomposição funcional e arquitetura
- 22.3. Modelagem e simulação
- 22.4. Síntese e otimização
- 22.5. Análise estática de temporização
- 22.6. Testes funcionais e estruturais
- 22.7. Projeto para testabilidade
- 22.8. Implementação em circuitos discretos e FPGA
- 22.9. Validação experimental
- 22.10. Documentação técnica

## Parte VII — Integração e aplicações

### 23. Interfaces e comunicação entre sistemas digitais {#chapter-23}

[Ler o Capítulo 23 — Interfaces e comunicação entre sistemas digitais](digital-system-interfaces-and-communication-revisao-2.md)

- 23.1. Barramentos e sinais de controle
- 23.2. Comunicação paralela e serial
- 23.3. Interfaces síncronas e assíncronas
- 23.4. Princípios de UART, SPI e I²C
- 23.5. UART e camadas físicas: RS-232
- 23.6. Barramento 1-Wire e identificação de dispositivos
- 23.7. Sinalização diferencial: RS-422 e RS-485
- 23.8. PROFIBUS e redes industriais
- 23.9. JTAG: teste, depuração e programação
- 23.10. Integridade do sinal e dimensionamento das interconexões
- 23.11. Adaptação de níveis lógicos
- 23.12. Buffers e isolamento
- 23.13. Interface com sensores e atuadores
- 23.14. Integração com conversores e memórias
- 23.15. Comparação e critérios de escolha

### 24. Sistemas digitais integrados {#chapter-24}

[Ler o Capítulo 24 — Sistemas digitais integrados](integrated-digital-systems.md)

- 24.1. Organização em caminho de dados e controle
- 24.2. Interligação de blocos combinacionais e sequenciais
- 24.3. Temporização global do sistema
- 24.4. Projeto de controladores
- 24.5. Sistemas de aquisição de dados
- 24.6. Introdução à organização de processadores
- 24.7. Compromissos entre desempenho, consumo e custo
- 24.8. Exemplos de sistemas digitais completos

### 25. Projetos integradores {#chapter-25}

[Ler o Capítulo 25 — Projetos integradores](integrative-projects.md)

- 25.1. Sistema de votação digital
- 25.2. Controlador de semáforo
- 25.3. Relógio e cronômetro digital
- 25.4. Controlador de acesso por código
- 25.5. Unidade aritmética e lógica
- 25.6. Sistema de aquisição e apresentação de dados
- 25.7. Controlador baseado em máquina de estados
- 25.8. Projeto integrado com FPGA

## Apêndices

### Apêndice A. Fundamentos matemáticos complementares {#appendix-a}

[Ler o Apêndice A — Fundamentos matemáticos complementares](supplementary-mathematical-foundations.md)

- A.1. Potências, bases e representação posicional
- A.2. Aritmética modular e transbordamento
- A.3. Conjuntos, relações e funções
- A.4. Álgebra booleana e identidades úteis
- A.5. Análise combinatória e probabilidade elementar
- A.6. Sequências, somatórios e crescimento
- A.7. Logaritmos, decibéis e escalas
- A.8. Tempo, frequência e temporização digital
- A.9. Funções exponenciais e redes RC
- A.10. Amostragem, quantização e erro
- A.11. Impedância, reflexões e sinais diferenciais
- A.12. Exercícios de consolidação
- A.13. Leituras complementares

### Apêndice B. Convenções de representação e simbologia {#appendix-b}

[Ler o Apêndice B — Convenções de representação e simbologia](representation-conventions-and-symbols.md)

- B.1. Grandezas, unidades e prefixos
- B.2. Variáveis booleanas e operações lógicas
- B.3. Níveis lógicos, polaridade e estados especiais
- B.4. Símbolos de portas lógicas
- B.5. Diagramas elétricos, conexões e barramentos
- B.6. Símbolos de elementos sequenciais
- B.7. Diagramas de estados e fluxogramas
- B.8. Diagramas temporais e bordas de relógio
- B.9. Tabelas-verdade, tabelas de estados e condições indiferentes
- B.10. Numeração, representação de dados e convenções de código
- B.11. Diagramas de blocos, hierarquia e interfaces
- B.12. Convenções para figuras, equações e referências cruzadas
- B.13. Checklist de leitura e documentação
- B.14. Leituras complementares

### Apêndice C. Tabelas de referência {#appendix-c}

[Ler o Apêndice C — Tabelas de referência](reference-tables.md)

- C.1. Potências de dois, capacidades e faixas numéricas
- C.2. Conversão entre decimal, binário, octal e hexadecimal
- C.3. Códigos binários usuais
- C.4. Portas lógicas: tabelas-verdade
- C.5. Identidades de álgebra booleana
- C.6. Blocos combinacionais e equações características
- C.7. Latches, flip-flops e registradores
- C.8. Temporização digital e restrições de relógio
- C.9. Memórias e endereçamento
- C.10. Conversão analógico-digital e aquisição
- C.11. Interfaces e comunicação digital
- C.12. Grandezas elétricas, potência e sinais
- C.13. Parâmetros de folhas de dados e verificação de compatibilidade
- C.14. Lista rápida de conferência de projeto
- C.15. Leituras e fontes de referência

### Apêndice D. Introdução às ferramentas de simulação {#appendix-d}

[Ler o Apêndice D — Introdução às ferramentas de simulação](introduction-to-simulation-tools.md)

- D.1. Objetivos, modelos e níveis de abstração
- D.2. Panorama de ferramentas e critérios de escolha
- D.3. Um fluxo de trabalho de simulação reproduzível
- D.4. Simulação funcional de circuitos combinacionais
- D.5. Simulação de circuitos sequenciais e máquinas de estados
- D.6. Testbenches em Verilog: estímulos e autoverificação
- D.7. Formas de onda, VCD e interpretação temporal
- D.8. Simulação elétrica com SPICE
- D.9. Simulação, síntese e análise temporal de FPGA
- D.10. Erros comuns e estratégias de diagnóstico
- D.11. Atividades práticas orientadas
- D.12. Modelo de relatório de simulação
- D.13. Exercícios de consolidação
- D.14. Leituras complementares e documentação

### Apêndice E. Experimentos de laboratório {#appendix-e}

[Ler o Apêndice E — Experimentos de laboratório](laboratory-experiments.md)

- E.1. Organização, segurança e registro experimental
- E.2. Experimento 1 — Portas lógicas e tabelas-verdade
- E.3. Experimento 2 — Álgebra booleana e equivalência de circuitos
- E.4. Experimento 3 — Circuitos combinacionais: multiplexador e somador
- E.5. Experimento 4 — Latches, flip-flops e antirrepique
- E.6. Experimento 5 — Contadores, divisores e decodificação
- E.7. Experimento 6 — Máquina de estados: controlador de semáforo
- E.8. Experimento 7 — Conversão analógico-digital e quantização
- E.9. Experimento 8 — Comunicação serial UART
- E.10. Experimento 9 — Integridade de sinais e redes RC
- E.11. Experimento 10 — Projeto integrado de aquisição e registro
- E.12. Planejamento de medidas e análise de resultados
- E.13. Avaliação e critérios de qualidade
- E.14. Exercícios e propostas de investigação
- E.15. Referências e documentação de apoio

### Apêndice F. Respostas e soluções selecionadas {#appendix-f}

[Ler o Apêndice F — Respostas e soluções selecionadas](selected-answers-and-solutions.md)

- F.1. Convenções para a leitura das soluções
- F.2. Apêndice A — Fundamentos matemáticos complementares
- F.3. Apêndice D — Introdução às ferramentas de simulação
- F.4. Apêndice E — Experimentos de laboratório
- F.5. Capítulo 25 — Projetos integradores
- F.6. Limites e critérios de validação

### Apêndice G. Glossário técnico {#appendix-g}

[Ler o Apêndice G — Glossário técnico](technical-glossary.md)

- G.1. Organização e critérios de consulta
- G.2. A
- G.3. B
- G.4. C
- G.5. D
- G.6. E
- G.7. F
- G.8. G
- G.9. H
- G.10. I
- G.11. J
- G.12. L
- G.13. M
- G.14. N
- G.15. O
- G.16. P
- G.17. Q
- G.18. R
- G.19. S
- G.20. T
- G.21. U
- G.22. V
- G.23. X
- G.24. Siglas e unidades de uso recorrente
- G.25. Termos próximos que não devem ser confundidos
- G.26. Referências de consulta
