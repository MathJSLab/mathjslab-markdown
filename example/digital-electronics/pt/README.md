# Eletrônica Digital

Obra de referência para cursos superiores de Engenharia Elétrica, Ciência da
Computação e áreas afins. A exposição parte da representação binária e da
lógica booleana, avança pela análise e síntese de circuitos digitais e alcança
a implementação eletrônica, as tecnologias programáveis e a integração de
sistemas.

## Parte I — Fundamentos dos sistemas digitais

### 1. [Introdução à Eletrônica Digital](introduction-to-digital-electronics.md) {#chapter-01}

- 1.1. Grandezas analógicas e digitais
- 1.2. Sinais contínuos, discretos e binários
- 1.3. Informação, representação e processamento digital
- 1.4. Níveis lógicos e sinais elétricos
- 1.5. Sistemas combinacionais e sequenciais
- 1.6. Abstração: dispositivos, portas, blocos e sistemas
- 1.7. Evolução dos circuitos e das tecnologias digitais
- 1.8. Aplicações e metodologias de projeto

### 2. [Sistemas de numeração e representação da informação](number-systems-and-information-representation.md) {#chapter-02}

- 2.1. Sistemas posicionais e bases numéricas
- 2.2. Sistemas decimal, binário, octal e hexadecimal
- 2.3. Conversão entre bases
- 2.4. Bits, palavras e significância posicional
- 2.5. Aritmética binária
- 2.6. Complemento de um e complemento de dois
- 2.7. Números com e sem sinal
- 2.8. Ponto fixo e introdução à representação em ponto flutuante
- 2.9. Códigos BCD, Gray e códigos alfanuméricos
- 2.10. Códigos de detecção de erros e paridade

### 3. [Fundamentos da lógica digital: representações matemáticas e circuitos lógicos](boolean-algebra-and-logic-functions.md) {#chapter-03}

- 3.1. Conjuntos, universo e operações
- 3.2. Lógica proposicional
- 3.3. Definição formal da álgebra de Boole
- 3.4. Funções booleanas e tabelas-verdade
- 3.5. Formas canônicas e síntese a partir de tabelas
- 3.6. Circuitos lógicos com interruptores
- 3.7. Portas lógicas e representação de circuitos
- 3.8. Equivalência das representações
- 3.9. Síntese conceitual e fronteiras do modelo

## Parte II — Análise e síntese de circuitos combinacionais

### 4. [Simplificação e minimização de funções lógicas](logic-function-simplification-and-minimization.md) {#chapter-04}

- 4.1. Simplificação algébrica
- 4.2. Mapas de Karnaugh
- 4.3. Agrupamentos e implicantes
- 4.4. Condições indiferentes (_don’t care_)
- 4.5. Método de Quine–McCluskey
- 4.6. Seleção de implicantes essenciais
- 4.7. Minimização de circuitos multiníveis
- 4.8. Compromissos entre área, atraso e consumo
- 4.9. Riscos lógicos (_hazards_) e condições transitórias

### 5. [Projeto de circuitos combinacionais](combinational-circuit-design.md) {#chapter-05}

- 5.1. Especificação funcional
- 5.2. Modelagem por tabelas-verdade
- 5.3. Análise de circuitos existentes
- 5.4. Síntese de circuitos a partir de especificações
- 5.5. Circuitos de votação e decisão
- 5.6. Detectores e geradores de paridade
- 5.7. Circuitos de comparação
- 5.8. Validação e testes funcionais

### 6. [Codificadores, decodificadores e seleção de dados](encoders-decoders-and-data-selection.md) {#chapter-06}

- 6.1. Codificadores binários
- 6.2. Codificadores com prioridade
- 6.3. Decodificadores
- 6.4. Conversores de códigos
- 6.5. Displays de sete segmentos
- 6.6. Multiplexadores
- 6.7. Demultiplexadores
- 6.8. Implementação de funções com multiplexadores
- 6.9. Estruturas de seleção e roteamento de sinais

### 7. [Circuitos aritméticos digitais](digital-arithmetic-circuits.md) {#chapter-07}

- 7.1. Meio somador e somador completo
- 7.2. Somadores de múltiplos bits
- 7.3. Propagação de transporte (_carry_)
- 7.4. Somadores com antecipação de transporte
- 7.5. Subtratores e circuitos somadores-subtratores
- 7.6. Detecção de transbordamento (_overflow_)
- 7.7. Comparadores aritméticos
- 7.8. Multiplicação binária e circuitos multiplicadores
- 7.9. Deslocadores e operações bit a bit
- 7.10. Unidade lógica e aritmética (ULA)

## Parte III — Circuitos sequenciais e sistemas síncronos

### 8. [Fundamentos dos circuitos sequenciais](sequential-circuit-fundamentals.md) {#chapter-08}

- 8.1. Estado e memória
- 8.2. Realimentação lógica
- 8.3. Circuitos síncronos e assíncronos
- 8.4. Sinais de relógio (_clock_)
- 8.5. Diagramas temporais
- 8.6. Latches SR e D
- 8.7. Flip-flops SR, JK, D e T
- 8.8. Entradas assíncronas de controle
- 8.9. Equações características e tabelas de excitação

### 9. [Temporização e confiabilidade de circuitos sequenciais](sequential-timing-and-reliability.md) {#chapter-09}

- 9.1. Atrasos de propagação
- 9.2. Tempos de estabelecimento (_setup_) e retenção (_hold_)
- 9.3. Frequência máxima de operação
- 9.4. Distribuição de relógio e _clock skew_
- 9.5. Metastabilidade
- 9.6. Sincronização de entradas assíncronas
- 9.7. Domínios de relógio e transferência de sinais
- 9.8. Condições de corrida e riscos temporais

### 10. [Registradores e contadores](registers-and-counters.md) {#chapter-10}

- 10.1. Registradores paralelos
- 10.2. Registradores de deslocamento
- 10.3. Conversão série-paralelo e paralelo-série
- 10.4. Registradores bidirecionais
- 10.5. Contadores assíncronos
- 10.6. Contadores síncronos
- 10.7. Contadores de módulo arbitrário
- 10.8. Contadores em anel e Johnson
- 10.9. Divisores de frequência
- 10.10. Aplicações de contadores e registradores

### 11. [Máquinas de estados finitos](finite-state-machines.md) {#chapter-11}

- 11.1. Conceito de máquina de estados
- 11.2. Modelos de Moore e Mealy
- 11.3. Diagramas e tabelas de transição
- 11.4. Codificação de estados
- 11.5. Minimização de estados
- 11.6. Síntese de máquinas sequenciais
- 11.7. Detectores de sequências
- 11.8. Controladores digitais
- 11.9. Projeto de unidades de controle
- 11.10. Verificação funcional de máquinas de estados

## Parte IV — Implementação eletrônica dos circuitos digitais

### 12. [Dispositivos semicondutores e chaveamento digital](semiconductor-devices-and-digital-switching.md) {#chapter-12}

- 12.1. Fundamentos de semicondutores aplicados à lógica digital
- 12.2. Diodos e transistores como chaves
- 12.3. Transistores bipolares de junção
- 12.4. Transistores MOSFET
- 12.5. Regiões de operação e chaveamento
- 12.6. Características estáticas e dinâmicas
- 12.7. Inversores implementados com transistores
- 12.8. Dissipação de potência e limitações físicas

### 13. [Famílias lógicas e circuitos integrados digitais](logic-families-and-digital-integrated-circuits.md) {#chapter-13}

- 13.1. Parâmetros elétricos das famílias lógicas
- 13.2. Níveis de tensão e margens de ruído
- 13.3. _Fan-in_, _fan-out_ e capacidade de acionamento
- 13.4. Família TTL e Schottky TTL
- 13.5. Famílias NMOS e pseudo-NMOS
- 13.6. Tecnologia CMOS
- 13.7. Tecnologia BiCMOS
- 13.8. Família ECL
- 13.9. Portas especiais, saídas de três estados e coletor/dreno aberto
- 13.10. Compatibilidade e interfaces entre famílias
- 13.11. Potência estática, dinâmica e produto potência-atraso
- 13.12. Seleção de componentes por folhas de dados

### 14. [Integridade de sinais e implementação física](signal-integrity-and-physical-implementation.md) {#chapter-14}

- 14.1. Modelos reais de entradas e saídas digitais
- 14.2. Capacitâncias parasitas e cargas
- 14.3. Tempos de subida e descida
- 14.4. Reflexões e linhas de transmissão
- 14.5. Ruído, interferência e diafonia
- 14.6. Aterramento e desacoplamento
- 14.7. Terminação de sinais
- 14.8. Interligação de circuitos integrados
- 14.9. Cuidados no projeto de placas de circuito impresso
- 14.10. Testes, medições e diagnóstico de falhas

## Parte V — Memórias, temporização e conversão de sinais

### 15. [Memórias semicondutoras](semiconductor-memories.md) {#chapter-15}

- 15.1. Organização e endereçamento
- 15.2. Células de memória
- 15.3. Memórias ROM, PROM, EPROM e EEPROM
- 15.4. Memórias SRAM e DRAM
- 15.5. Memórias Flash
- 15.6. Organização em palavras e bancos
- 15.7. Barramentos de endereço, dados e controle
- 15.8. Ciclos de leitura e escrita
- 15.9. Temporização e desempenho
- 15.10. Memórias síncronas e assíncronas
- 15.11. Seleção e expansão de memórias

### 16. [Circuitos de temporização e geração de pulsos](timing-and-pulse-generation-circuits.md) {#chapter-16}

- 16.1. Redes RC de temporização
- 16.2. Comparadores com histerese e disparadores Schmitt
- 16.3. Circuitos monoestáveis, astáveis e biestáveis
- 16.4. Temporizadores integrados
- 16.5. Osciladores e geradores de relógio
- 16.6. Cristais e referências de frequência
- 16.7. Divisão e multiplicação de frequência
- 16.8. Circuitos de atraso e conformação de pulsos
- 16.9. Introdução aos PLLs
- 16.10. Aplicações de temporização

### 17. [Conversores digital-analógico (DAC)](digital-to-analog-converters.md) {#chapter-17}

- 17.1. Princípios da conversão digital-analógica
- 17.2. Resolução, faixa e quantização
- 17.3. Conversores por resistores ponderados
- 17.4. Conversores em escada R–2R
- 17.5. Conversores por corrente
- 17.6. Erros de offset, ganho e linearidade
- 17.7. Tempo de acomodação
- 17.8. Conversão por modulação de largura de pulso
- 17.9. Aplicações e critérios de seleção

### 18. [Conversores analógico-digitais (ADC)](analog-to-digital-converters.md) {#chapter-18}

- 18.1. Amostragem e quantização
- 18.2. Teorema da amostragem
- 18.3. Erro de quantização e relação sinal-ruído
- 18.4. Conversores por comparação paralela (_flash_)
- 18.5. Conversores por rampa e contagem
- 18.6. Conversores por aproximações sucessivas (SAR)
- 18.7. Conversores sigma-delta
- 18.8. Resolução efetiva e desempenho dinâmico
- 18.9. Aliasing e filtragem antialiasing
- 18.10. Referências de tensão e condicionamento de entrada
- 18.11. Aplicações e critérios de seleção

## Parte VI — Dispositivos programáveis e projeto digital

### 19. [Dispositivos lógicos programáveis](programmable-logic-devices.md) {#chapter-19}

- 19.1. Conceito de lógica programável
- 19.2. ROM como implementação de funções lógicas
- 19.3. PLA e PAL
- 19.4. PLDs e CPLDs
- 19.5. Arquitetura básica de FPGAs
- 19.6. Blocos lógicos configuráveis
- 19.7. Redes de interconexão programáveis
- 19.8. Recursos de memória e processamento
- 19.9. Comparação entre lógica discreta, CPLDs e FPGAs
- 19.10. Aplicações de dispositivos programáveis

### 20. [Linguagens de descrição de hardware](hardware-description-languages.md) {#chapter-20}

- 20.1. Descrição estrutural e comportamental
- 20.2. Conceitos de VHDL e Verilog
- 20.3. Representação de lógica combinacional
- 20.4. Representação de circuitos sequenciais
- 20.5. Processos síncronos e assíncronos
- 20.6. Simulação e bancos de testes
- 20.7. Síntese lógica
- 20.8. Restrições de temporização
- 20.9. Correspondência entre HDL e hardware implementado

### 21. [Metodologia de projeto e verificação digital](digital-design-and-verification-methodology.md) {#chapter-21}

- 21.1. Especificação de requisitos
- 21.2. Decomposição funcional e arquitetura
- 21.3. Modelagem e simulação
- 21.4. Síntese e otimização
- 21.5. Análise estática de temporização
- 21.6. Testes funcionais e estruturais
- 21.7. Projeto para testabilidade
- 21.8. Implementação em circuitos discretos e FPGA
- 21.9. Validação experimental
- 21.10. Documentação técnica

## Parte VII — Integração e aplicações

### 22. [Interfaces e comunicação entre sistemas digitais](digital-system-interfaces-and-communication.md) {#chapter-22}

- 22.1. Barramentos e sinais de controle
- 22.2. Comunicação paralela e serial
- 22.3. Interfaces síncronas e assíncronas
- 22.4. Princípios de UART, SPI e I²C
- 22.5. UART e camadas físicas: RS-232
- 22.6. Barramento 1-Wire e identificação de dispositivos
- 22.7. Sinalização diferencial: RS-422 e RS-485
- 22.8. PROFIBUS e redes industriais
- 22.9. JTAG: teste, depuração e programação
- 22.10. Integridade do sinal e dimensionamento das interconexões
- 22.11. Adaptação de níveis lógicos
- 22.12. Buffers e isolamento
- 22.13. Interface com sensores e atuadores
- 22.14. Integração com conversores e memórias
- 22.15. Comparação e critérios de escolha

### 23. [Sistemas digitais integrados](integrated-digital-systems.md) {#chapter-23}

- 23.1. Organização em caminho de dados e controle
- 23.2. Interligação de blocos combinacionais e sequenciais
- 23.3. Temporização global do sistema
- 23.4. Projeto de controladores
- 23.5. Sistemas de aquisição de dados
- 23.6. Introdução à organização de processadores
- 23.7. Compromissos entre desempenho, consumo e custo
- 23.8. Exemplos de sistemas digitais completos

### 24. [Projetos integradores](integrative-projects.md) {#chapter-24}

- 24.1. Sistema de votação digital
- 24.2. Controlador de semáforo
- 24.3. Relógio e cronômetro digital
- 24.4. Controlador de acesso por código
- 24.5. Unidade aritmética e lógica
- 24.6. Sistema de aquisição e apresentação de dados
- 24.7. Controlador baseado em máquina de estados
- 24.8. Projeto integrado com FPGA

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
- F.5. Capítulo 24 — Projetos integradores
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
