# Apêndice C. Tabelas de referência {#appendix-c}

Este apêndice reúne tabelas para consulta durante a análise, a síntese, a
implementação e a verificação de circuitos digitais. Os valores matemáticos e
as relações lógicas são gerais; **limites elétricos, tempos de propagação e
frequências máximas de componentes reais dependem da tecnologia, da
alimentação, da temperatura, da carga e da folha de dados**. Os exemplos
numéricos identificados como ilustrativos não constituem especificações de
projeto.

As convenções de notação seguem o
[Apêndice B](representation-conventions-and-symbols.md). Em expressões
booleanas, $+$ indica OR, a justaposição indica AND, a barra superior indica
NOT e $\oplus$ indica XOR.

## C.1. Potências de dois, capacidades e faixas numéricas

| $n$ (bits) | $2^n$ combinações | Máximo sem sinal $2^n-1$ | Intervalo com sinal (complemento de dois) |
| ---------: | ----------------: | -----------------------: | ----------------------------------------: |
|          1 |                 2 |                        1 |                                $-1$ a $0$ |
|          2 |                 4 |                        3 |                                $-2$ a $1$ |
|          3 |                 8 |                        7 |                                $-4$ a $3$ |
|          4 |                16 |                       15 |                                $-8$ a $7$ |
|          5 |                32 |                       31 |                              $-16$ a $15$ |
|          6 |                64 |                       63 |                              $-32$ a $31$ |
|          7 |               128 |                      127 |                              $-64$ a $63$ |
|          8 |               256 |                      255 |                            $-128$ a $127$ |
|         10 |             1 024 |                    1 023 |                            $-512$ a $511$ |
|         12 |             4 096 |                    4 095 |                      $-2\,048$ a $2\,047$ |
|         16 |            65 536 |                   65 535 |                    $-32\,768$ a $32\,767$ |
|         24 |        16 777 216 |               16 777 215 |            $-8\,388\,608$ a $8\,388\,607$ |
|         32 |     4 294 967 296 |            4 294 967 295 |  $-2\,147\,483\,648$ a $2\,147\,483\,647$ |

Para representar $M\geq 2$ estados distintos, o número mínimo de bits é
$n=\lceil\log_2 M\rceil$. Uma memória com $a$ linhas de endereço possui até
$2^a$ posições endereçáveis; sua capacidade em bits é $2^a w$, quando cada
posição contém $w$ bits.

| Prefixo decimal | Símbolo |     Fator | Prefixo binário | Símbolo |    Fator |
| --------------- | ------- | --------: | --------------- | ------- | -------: |
| quilo           | k       |    $10^3$ | kibi            | Ki      | $2^{10}$ |
| mega            | M       |    $10^6$ | mebi            | Mi      | $2^{20}$ |
| giga            | G       |    $10^9$ | gibi            | Gi      | $2^{30}$ |
| tera            | T       | $10^{12}$ | tebi            | Ti      | $2^{40}$ |

**Atenção:** $1\ \mathrm{kB}=1\,000$ bytes, enquanto $1\ \mathrm{KiB}=1\,024$
bytes. O símbolo **b** representa bit; **B**, byte.

## C.2. Conversão entre decimal, binário, octal e hexadecimal

| Decimal | Binário (4 bits) | Octal | Hexadecimal |
| ------: | :--------------: | ----: | :---------: |
|       0 |       0000       |     0 |      0      |
|       1 |       0001       |     1 |      1      |
|       2 |       0010       |     2 |      2      |
|       3 |       0011       |     3 |      3      |
|       4 |       0100       |     4 |      4      |
|       5 |       0101       |     5 |      5      |
|       6 |       0110       |     6 |      6      |
|       7 |       0111       |     7 |      7      |
|       8 |       1000       |    10 |      8      |
|       9 |       1001       |    11 |      9      |
|      10 |       1010       |    12 |      A      |
|      11 |       1011       |    13 |      B      |
|      12 |       1100       |    14 |      C      |
|      13 |       1101       |    15 |      D      |
|      14 |       1110       |    16 |      E      |
|      15 |       1111       |    17 |      F      |

Cada algarismo hexadecimal corresponde a quatro bits; cada algarismo octal, a
três bits. A separação em grupos é feita a partir da vírgula posicional, para
ambos os lados.

## C.3. Códigos binários usuais

| Decimal | BCD 8421 | Gray refletido (4 bits) | Excesso-3 |
| ------: | :------: | :---------------------: | :-------: |
|       0 |   0000   |          0000           |   0011    |
|       1 |   0001   |          0001           |   0100    |
|       2 |   0010   |          0011           |   0101    |
|       3 |   0011   |          0010           |   0110    |
|       4 |   0100   |          0110           |   0111    |
|       5 |   0101   |          0111           |   1000    |
|       6 |   0110   |          0101           |   1001    |
|       7 |   0111   |          0100           |   1010    |
|       8 |   1000   |          1100           |   1011    |
|       9 |   1001   |          1101           |   1100    |

As colunas BCD e excesso-3 representam **algarismos decimais individuais**; a
coluna Gray apresenta os dez primeiros valores de uma sequência Gray de quatro
bits, que prossegue até 15. Para um valor binário $b$, seu Gray refletido é
$g=b\oplus(b\gg1)$, onde $\gg$ é deslocamento lógico à direita.

| Código/representação | Característica                                           | Aplicação típica                                        |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Binário natural      | Posicional, base 2                                       | Aritmética e endereçamento                              |
| Complemento de dois  | Inteiros com sinal                                       | Operações aritméticas                                   |
| BCD 8421             | Cada dígito decimal ocupa 4 bits                         | Interfaces decimais                                     |
| Gray refletido       | Valores adjacentes diferem em um bit                     | Encoders de posição e travessias específicas de domínio |
| Paridade par         | Bit de paridade ajustado para número total par de bits 1 | Detecção de erro simples                                |
| ASCII                | Codificação de caracteres de 7 bits                      | Textos e protocolos legados                             |
| UTF-8                | Codificação Unicode de comprimento variável              | Textos e sistemas modernos                              |

Um bit de paridade detecta qualquer quantidade **ímpar** de inversões de bits,
mas não detecta todos os erros múltiplos e não corrige erros.

## C.4. Portas lógicas: tabelas-verdade

| $A$ | $B$ | AND $AB$ | OR $A+B$ | NAND $\overline{AB}$ | NOR $\overline{A+B}$ | XOR $A\oplus B$ | XNOR $\overline{A\oplus B}$ |
| :-: | :-: | :------: | :------: | :------------------: | :------------------: | :-------------: | :-------------------------: |
|  0  |  0  |    0     |    0     |          1           |          1           |        0        |              1              |
|  0  |  1  |    0     |    1     |          1           |          0           |        1        |              0              |
|  1  |  0  |    0     |    1     |          1           |          0           |        1        |              0              |
|  1  |  1  |    1     |    1     |          0           |          0           |        0        |              1              |

| $A$ | NOT $\overline A$ | Buffer $A$ |
| :-: | :---------------: | :--------: |
|  0  |         1         |     0      |
|  1  |         0         |     1      |

## C.5. Identidades de álgebra booleana

| Propriedade      | Identidade                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| Identidade       | $A+0=A$; $A\cdot1=A$                                                               |
| Dominação        | $A+1=1$; $A\cdot0=0$                                                               |
| Idempotência     | $A+A=A$; $AA=A$                                                                    |
| Complementação   | $A+\overline A=1$; $A\overline A=0$                                                |
| Dupla negação    | $\overline{\overline A}=A$                                                         |
| Comutatividade   | $A+B=B+A$; $AB=BA$                                                                 |
| Associatividade  | $(A+B)+C=A+(B+C)$; $(AB)C=A(BC)$                                                   |
| Distributividade | $A(B+C)=AB+AC$; $A+BC=(A+B)(A+C)$                                                  |
| Absorção         | $A+AB=A$; $A(A+B)=A$                                                               |
| De Morgan        | $\overline{AB}=\overline A+\overline B$; $\overline{A+B}=\overline A\,\overline B$ |
| XOR              | $A\oplus B=\overline AB+A\overline B$                                              |
| Consenso         | $AB+\overline AC+BC=AB+\overline AC$                                               |

A forma de consenso indicada é uma identidade algébrica; a remoção de termos
redundantes deve ser avaliada separadamente quando o circuito precisar ser
livre de determinados riscos transitórios (_hazards_).

## C.6. Blocos combinacionais e equações características

| Bloco                    | Entradas             | Saídas / relações fundamentais                                                     |
| ------------------------ | -------------------- | ---------------------------------------------------------------------------------- |
| Meio somador             | $A,B$                | Soma $S=A\oplus B$; transporte $C=AB$                                              |
| Somador completo         | $A,B,C_{in}$         | $S=A\oplus B\oplus C_{in}$; $C_{out}=AB+C_{in}(A\oplus B)$                         |
| Meio subtrator           | $A,B$                | Diferença $D=A\oplus B$; empréstimo $B_{out}=\overline AB$                         |
| Comparador de 1 bit      | $A,B$                | Igualdade $E=\overline{A\oplus B}$; maior $G=A\overline B$; menor $L=\overline AB$ |
| MUX 2:1                  | $D_0,D_1,S$          | $Y=\overline S D_0+SD_1$                                                           |
| DEMUX 1:2                | $D,S$                | $Y_0=D\overline S$; $Y_1=DS$                                                       |
| Detector de paridade par | $D_0,\ldots,D_{n-1}$ | $P=D_0\oplus\cdots\oplus D_{n-1}$ (bit a acrescentar)                              |

| Seletores de MUX | Entradas de dados selecionáveis |
| ---------------: | ------------------------------: |
|                1 |                               2 |
|                2 |                               4 |
|                3 |                               8 |
|                4 |                              16 |
|              $k$ |                           $2^k$ |

## C.7. Latches, flip-flops e registradores

| Elemento                  | Comportamento de próximo estado                               | Observação                                        |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| Latch D                   | $Q^+=D$ enquanto habilitado; caso contrário, mantém $Q$       | Sensível a nível                                  |
| Flip-flop D               | $Q^+=D$ na borda ativa                                        | Sensível a borda                                  |
| Flip-flop T               | $Q^+=Q\oplus T$                                               | Alterna quando $T=1$                              |
| Flip-flop JK              | $Q^+=J\overline Q+\overline KQ$                               | $J=K=1$: alterna                                  |
| Flip-flop SR (ativo alto) | Set para $S=1,R=0$; reset para $S=0,R=1$; mantém para $S=R=0$ | $S=R=1$ é condição proibida no modelo SR clássico |

| $J$ | $K$ | Ação JK  |
| :-: | :-: | -------- |
|  0  |  0  | Manter   |
|  0  |  1  | Reset    |
|  1  |  0  | Set      |
|  1  |  1  | Alternar |

| Estrutura                               | Quantidade mínima de flip-flops (codificação binária) |
| --------------------------------------- | ----------------------------------------------------- |
| Contador módulo $M\geq2$                | $\lceil\log_2 M\rceil$                                |
| Máquina de estados com $N\geq2$ estados | $\lceil\log_2 N\rceil$                                |
| Registrador de $w$ bits                 | $w$                                                   |
| Contador binário de $n$ bits            | $n$; módulo natural $2^n$                             |

A codificação _one-hot_ de uma máquina de estados pode utilizar $N$ flip-flops,
em troca de uma lógica de decodificação potencialmente mais simples.

## C.8. Temporização digital e restrições de relógio

| Parâmetro    | Significado                     | Observação                                           |
| ------------ | ------------------------------- | ---------------------------------------------------- |
| $t_{pd}$     | Atraso de propagação            | Deve-se distinguir máximo e mínimo quando necessário |
| $t_{cd}$     | Atraso de contaminação          | Menor intervalo até uma saída poder começar a mudar  |
| $t_{setup}$  | Tempo de preparação             | Dado estável antes da borda de captura               |
| $t_{hold}$   | Tempo de retenção               | Dado estável após a borda de captura                 |
| $t_{cq,max}$ | Atraso máximo relógio–Q         | Do flip-flop de origem                               |
| $t_{cq,min}$ | Atraso mínimo relógio–Q         | Do flip-flop de origem                               |
| $t_{skew}$   | Diferença de chegada do relógio | Sinal e convenção precisam ser declarados            |
| $T_{clk}$    | Período de relógio              | $T_{clk}=1/f_{clk}$                                  |

Para um caminho registrador–lógica–registrador, com relógios ideais e sem
considerar incertezas adicionais:

$$T_{clk}\geq t_{cq,max}+t_{comb,max}+t_{setup}.$$

A condição de retenção simplificada é

$$t_{cq,min}+t_{comb,min}\geq t_{hold}.$$

Em projetos reais, acrescentam-se _skew_, _jitter_, incertezas de relógio e
demais restrições apropriadas. **Não** se deve aplicar as equações
simplificadas sem essas verificações.

|          Frequência |               Período |
| ------------------: | --------------------: |
|   $1\ \mathrm{kHz}$ |      $1\ \mathrm{ms}$ |
|  $10\ \mathrm{kHz}$ | $100\ \mathrm{\mu s}$ |
| $100\ \mathrm{kHz}$ |  $10\ \mathrm{\mu s}$ |
|   $1\ \mathrm{MHz}$ |   $1\ \mathrm{\mu s}$ |
|  $10\ \mathrm{MHz}$ |    $100\ \mathrm{ns}$ |
|  $50\ \mathrm{MHz}$ |     $20\ \mathrm{ns}$ |
| $100\ \mathrm{MHz}$ |     $10\ \mathrm{ns}$ |
| $200\ \mathrm{MHz}$ |      $5\ \mathrm{ns}$ |

## C.9. Memórias e endereçamento

| Organização          | Endereços | Largura | Capacidade total |
| -------------------- | --------: | ------: | ---------------: |
| $256\times8$         |       256 |  8 bits |            256 B |
| $1\,024\times8$      |     1 024 |  8 bits |            1 KiB |
| $4\,096\times8$      |     4 096 |  8 bits |            4 KiB |
| $1\,024\times16$     |     1 024 | 16 bits |            2 KiB |
| $65\,536\times8$     |    65 536 |  8 bits |           64 KiB |
| $1\,048\,576\times8$ | 1 048 576 |  8 bits |            1 MiB |

| Recurso                                                           | Relação útil                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------- |
| Linhas de endereço para $N$ posições                              | $a=\lceil\log_2N\rceil$                              |
| Capacidade de memória                                             | $C=Nw$ bits                                          |
| Profundidade de FIFO                                              | $D$ palavras                                         |
| Capacidade de FIFO                                                | $Dw$ bits                                            |
| Tempo para encher FIFO sem leitura, taxa de escrita constante $R$ | $t=D/R$ (FIFO inicialmente vazio; $R$ em palavras/s) |
| Taxa bruta de leitura de palavras                                 | $R_b=wf$ bit/s (uma palavra por ciclo a $f$ Hz)      |

## C.10. Conversão analógico-digital e aquisição

| Grandeza                      | Relação idealizada  | Hipóteses                                                               |
| ----------------------------- | ------------------- | ----------------------------------------------------------------------- |
| Níveis de quantização         | $L=2^N$             | ADC de $N$ bits                                                         |
| Passo nominal de quantização  | $\Delta=V_{FS}/2^N$ | Faixa de entrada de amplitude $V_{FS}$, quantizador uniforme ideal      |
| Erro de quantização           | $                   | e_q                                                                     | \leq\Delta/2$ | Arredondamento ao nível mais próximo, sem saturação |
| Frequência de Nyquist         | $f_s>2f_{max}$      | Sinal estritamente limitado em banda e condições ideais de reconstrução |
| Taxa bruta de amostras        | $R_b=Nf_s$          | Uma amostra de $N$ bits por período, sem cabeçalhos                     |
| Armazenamento de $K$ amostras | $KN$ bits           | Sem metadados ou alinhamento                                            |
| Duração de $K$ amostras       | $t=K/f_s$           | Amostragem uniforme                                                     |

**Exemplo ilustrativo.** Um ADC ideal de 12 bits, faixa de 0 a 3,3 V, possui
$2^{12}=4\,096$ códigos e passo nominal $\Delta\approx0{,}806\ \mathrm{mV}$. A
definição exata de escala, código de fundo de escala, linearidade e erro
depende do conversor real.

## C.11. Interfaces e comunicação digital

| Interface | Sinais característicos            | Topologia / propriedade                                     | Cuidados                                                              |
| --------- | --------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| UART      | TX, RX e referência comum         | Assíncrona, ponto a ponto na forma básica                   | Baud, enquadramento e níveis elétricos                                |
| SPI       | SCLK, MOSI, MISO, CS              | Síncrona, seleção de periféricos                            | Modo CPOL/CPHA e temporização                                         |
| I²C       | SDA, SCL                          | Barramento de dois fios, saídas tipicamente de dreno aberto | Resistores de pull-up, capacitância e endereços                       |
| 1-Wire    | DQ e referência comum             | Comunicação por uma linha de dados                          | Pull-up, alimentação e janelas temporais                              |
| RS-232    | TXD, RXD e referência             | Interface elétrica de comunicação serial                    | Não ligar diretamente a GPIO de nível lógico sem transceptor adequado |
| RS-422    | Par(es) diferencial(is)           | Comunicação diferencial                                     | Terminação e polaridade                                               |
| RS-485    | Par diferencial                   | Barramento multiponto em implementações típicas             | Terminação, polarização, direção de transmissão                       |
| JTAG      | TCK, TMS, TDI, TDO; TRST opcional | Teste e acesso de depuração                                 | Tensão de referência e pinagem                                        |

| Configuração UART                               | Bits por quadro | Eficiência de dados úteis |
| ----------------------------------------------- | --------------: | ------------------------: |
| 8N1 (1 início, 8 dados, sem paridade, 1 parada) |              10 |               $8/10=80\%$ |
| 8E1 (1 início, 8 dados, paridade par, 1 parada) |              11 |     $8/11\approx72{,}7\%$ |
| 7E1 (1 início, 7 dados, paridade par, 1 parada) |              10 |               $7/10=70\%$ |

As taxas efetivas dependem ainda de intervalos ociosos, cabeçalhos,
retransmissões e restrições do sistema. **UART** define enquadramento lógico;
**RS-232/RS-422/RS-485** definem características elétricas e não são sinônimos
de UART.

## C.12. Grandezas elétricas, potência e sinais

| Grandeza / relação                                 | Equação                       | Condições                                                       |
| -------------------------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| Lei de Ohm                                         | $V=RI$                        | Elemento resistivo ôhmico                                       |
| Potência elétrica                                  | $P=VI$                        | Grandezas instantâneas ou DC conforme contexto                  |
| Potência em resistor                               | $P=I^2R=V^2/R$                | Resistor ideal                                                  |
| Constante de tempo RC                              | $\tau=RC$                     | Circuito RC de primeira ordem                                   |
| Frequência e período                               | $f=1/T$                       | Sinal periódico                                                 |
| Energia dinâmica capacitiva por transição de carga | $E\approx CV^2$               | Ciclo completo carga-descarga, aproximação ideal                |
| Potência dinâmica CMOS                             | $P_{dyn}\approx\alpha CV^2f$  | $\alpha$ definido como atividade de comutação efetiva por ciclo |
| Ganho de potência em decibéis                      | $G_{dB}=10\log_{10}(P_2/P_1)$ | Potências positivas                                             |
| Razão de amplitudes em decibéis                    | $G_{dB}=20\log_{10}(A_2/A_1)$ | Mesma impedância ou grandezas proporcionais à raiz da potência  |

| Prefixo SI | Símbolo | Multiplicador |
| ---------- | ------- | ------------: |
| pico       | p       |    $10^{-12}$ |
| nano       | n       |     $10^{-9}$ |
| micro      | $\mu$   |     $10^{-6}$ |
| mili       | m       |     $10^{-3}$ |
| quilo      | k       |        $10^3$ |
| mega       | M       |        $10^6$ |
| giga       | G       |        $10^9$ |

## C.13. Parâmetros de folhas de dados e verificação de compatibilidade

| Parâmetro          | Interpretação                             | Verificação necessária                               |
| ------------------ | ----------------------------------------- | ---------------------------------------------------- |
| $V_{IL,max}$       | Maior tensão garantida como entrada baixa | Saída baixa $V_{OL,max}\leq V_{IL,max}$              |
| $V_{IH,min}$       | Menor tensão garantida como entrada alta  | Saída alta $V_{OH,min}\geq V_{IH,min}$               |
| $V_{OL,max}$       | Maior tensão de saída baixa garantida     | Considerar corrente de carga                         |
| $V_{OH,min}$       | Menor tensão de saída alta garantida      | Considerar corrente de carga                         |
| $I_{OL}$, $I_{OH}$ | Correntes especificadas de saída          | Fan-out e dissipação                                 |
| $I_{IL}$, $I_{IH}$ | Correntes de entrada                      | Soma das cargas conectadas                           |
| $t_{pd}$           | Atraso de propagação                      | Temperatura, alimentação, carga e condições de teste |
| $t_r$, $t_f$       | Tempos de subida e descida                | Integridade de sinal e carga                         |
| $V_{DD}$, $V_{CC}$ | Alimentação                               | Faixa recomendada e limites absolutos são diferentes |
| $P_{tot}$, $T_J$   | Dissipação e temperatura de junção        | Análise térmica                                      |

As margens estáticas de ruído, quando aplicáveis, podem ser estimadas por

$$NM_H=V_{OH,min}-V_{IH,min},\qquad NM_L=V_{IL,max}-V_{OL,max}.$$

**Importante:** não existe uma tabela universal de tensões TTL, CMOS, LVTTL,
LVCMOS ou de tolerância a 5 V válida para todos os componentes. A
compatibilidade deve ser determinada a partir das folhas de dados dos
dispositivos efetivamente utilizados.

## C.14. Lista rápida de conferência de projeto

| Etapa                | Pergunta de verificação                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| Especificação        | Entradas, saídas, polaridades, estados inválidos e condições de falha estão definidos? |
| Representação        | Bases numéricas, larguras e sinais foram explicitados?                                 |
| Lógica combinacional | Funções, tabelas-verdade e condições indiferentes foram validadas?                     |
| Lógica sequencial    | Reset, estados iniciais e transições estão especificados?                              |
| Temporização         | Setup, hold, atrasos e cruzamentos de domínios de relógio foram avaliados?             |
| Interface elétrica   | Tensões, correntes, referências e terminações são compatíveis?                         |
| Armazenamento        | Profundidade, largura, taxa e risco de overflow/underflow foram considerados?          |
| Comunicação          | Enquadramento, integridade, endereçamento e erros foram tratados?                      |
| Verificação          | Há testes para casos normais, limites e falhas?                                        |
| Documentação         | Versões, unidades, fontes de dados e condições de ensaio estão registradas?            |

## C.15. Leituras e fontes de referência

As tabelas matemáticas e as relações booleanas sintetizam conteúdos
consolidados de lógica digital e organização de computadores. Para
especificações de componentes, consultar **sempre** a documentação do
fabricante e a revisão correspondente ao dispositivo.

- MANO, M. Morris; CILETTI, Michael D. _Digital Design_. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. _Digital Design and Computer
  Architecture_. Morgan Kaufmann.
- WAKERLY, John F. _Digital Design: Principles and Practices_. Pearson.
- IEEE. _IEEE Standard for SystemVerilog—Unified Hardware Design,
  Specification, and Verification Language_ (IEEE 1800), edição aplicável.
- NIST. _Guide for the Use of the International System of Units (SI)_ (SP 811).
- IEC. _Letter symbols to be used in electrical technology_ (IEC 60027), partes
  aplicáveis.

Este apêndice é uma referência de consulta, não um substituto para normas,
manuais de interfaces ou folhas de dados de componentes específicos.
