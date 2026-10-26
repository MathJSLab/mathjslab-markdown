# Apêndice A. Fundamentos matemáticos complementares {#appendix-a}

Este apêndice reúne ferramentas matemáticas recorrentes na análise, no projeto e na verificação de sistemas digitais. Seu propósito é servir de referência aos capítulos da obra: apresenta definições, deduções curtas, exemplos numéricos e exercícios, sem substituir o estudo aprofundado de matemática discreta, circuitos elétricos ou processamento de sinais.

**Convenções.** Usaremos $\mathbb{N}=\{0,1,2,\ldots\}$, $\mathbb{Z}$ para os inteiros, $\mathbb{R}$ para os reais e $\mathbb{B}=\{0,1\}$ para os valores booleanos. Em expressões booleanas, $+$ representa OR, a justaposição representa AND e a barra superior representa NOT. Em expressões aritméticas, $+$ e a multiplicação conservam seus significados usuais. O contexto distingue as duas operações.

## A.1. Potências, bases e representação posicional

Um numeral de base inteira $b\geq 2$, com algarismos $d_i\in\{0,\ldots,b-1\}$, representa o valor

$$X=\sum_{i=-m}^{n}d_i b^i.$$

Os índices negativos representam posições fracionárias. Por exemplo,

$$(1011{,}01)_2=1\cdot2^3+0\cdot2^2+1\cdot2^1+1\cdot2^0+0\cdot2^{-1}+1\cdot2^{-2}=11{,}25.$$

Para inteiros não negativos, a conversão de decimal para base $b$ pode ser feita por divisões sucessivas por $b$, lendo-se os restos em ordem inversa. Para frações, a multiplicação sucessiva por $b$ fornece os algarismos à direita da vírgula, mas nem toda fração decimal tem representação binária finita.

A identidade

$$\sum_{i=0}^{n-1}2^i=2^n-1$$

explica por que $n$ bits sem sinal representam os inteiros de $0$ a $2^n-1$. Com complemento de dois, a faixa é $-2^{n-1}$ a $2^{n-1}-1$.

| Largura | Combinações | Faixa sem sinal | Faixa com sinal (complemento de dois) |
|---:|---:|---:|---:|
| 4 bits | 16 | 0 a 15 | -8 a 7 |
| 8 bits | 256 | 0 a 255 | -128 a 127 |
| 12 bits | 4096 | 0 a 4095 | -2048 a 2047 |
| 16 bits | 65536 | 0 a 65535 | -32768 a 32767 |

A quantidade mínima de bits para distinguir $M\geq 2$ estados é

$$n=\lceil\log_2 M\rceil.$$

**Exemplo.** Para codificar 20 estados distintos, $\lceil\log_2 20\rceil=5$ bits, pois quatro bits codificam apenas 16 estados.

## A.2. Aritmética modular e transbordamento

Dizemos que $a$ e $c$ são congruentes módulo $m>0$ quando sua diferença é múltipla de $m$:

$$a\equiv c\pmod m\quad\Longleftrightarrow\quad m\mid(a-c).$$

Em um registrador de $n$ bits sem sinal, a soma armazenada corresponde ao resultado aritmético reduzido módulo $2^n$:

$$s=(a+b)\bmod 2^n.$$

**Exemplo.** Em oito bits, $250+10=260\equiv4\pmod{256}$. O valor armazenado é $00000100_2$ e ocorre transporte para além do bit mais significativo.

O **transporte de saída** não deve ser confundido com o **transbordamento com sinal**. Para soma em complemento de dois, ocorre transbordamento quando operandos de mesmo sinal produzem resultado de sinal oposto. Em uma implementação por somador binário, também pode ser detectado pelo XOR entre o transporte de entrada e o de saída do bit de sinal.

Um contador de módulo $M$ percorre os estados $0,1,\ldots,M-1$ e retorna a zero. Se recebe pulsos a frequência $f_{in}$ e produz um pulso a cada $M$ contagens, a frequência média desses pulsos é $f_{in}/M$.

## A.3. Conjuntos, relações e funções

Uma **função** $f:A\to B$ associa a cada elemento de $A$ exatamente um elemento de $B$. Uma função lógica de $n$ variáveis é um mapeamento

$$f:\mathbb{B}^n\to\mathbb{B}.$$

Como $\mathbb{B}^n$ possui $2^n$ entradas possíveis, uma tabela-verdade completa de uma saída tem $2^n$ linhas. Existem $2^{2^n}$ funções booleanas distintas de $n$ variáveis, porque cada uma das $2^n$ linhas pode receber independentemente saída 0 ou 1.

Uma relação binária $R\subseteq A\times B$ descreve pares associados. Em máquinas de estados, a relação de transição pode ser representada por uma função determinística

$$\delta:S\times I\to S,$$

em que $S$ é o conjunto de estados e $I$ o conjunto de combinações de entrada. Para uma máquina de Mealy, a saída é descrita por $\lambda:S\times I\to O$; para Moore, por $\lambda:S\to O$.

**Exemplo.** Uma máquina com três estados exige pelo menos dois bits na codificação binária, embora o código restante possa ser reservado para recuperação de falhas ou outras finalidades.

## A.4. Álgebra booleana e identidades úteis

Na álgebra booleana, as variáveis assumem 0 ou 1. Algumas identidades fundamentais são:

| Propriedade | Identidade |
|---|---|
| Identidade | $A+0=A$, $A\cdot1=A$ |
| Dominação | $A+1=1$, $A\cdot0=0$ |
| Idempotência | $A+A=A$, $AA=A$ |
| Complementação | $A+\overline A=1$, $A\overline A=0$ |
| Absorção | $A+AB=A$, $A(A+B)=A$ |
| De Morgan | $\overline{A+B}=\overline A\,\overline B$ |
| De Morgan | $\overline{AB}=\overline A+\overline B$ |

A distributividade funciona nos dois sentidos:

$$A(B+C)=AB+AC,\qquad A+BC=(A+B)(A+C).$$

**Demonstração por manipulação.** A identidade de absorção decorre de

$$A+AB=A(1+B)=A.$$

É importante distinguir o XOR da soma booleana: $A\oplus B$ vale 1 quando as entradas diferem, enquanto $A+B$ vale 1 quando ao menos uma entrada vale 1. Para bits individuais,

$$A\oplus B=A\overline B+\overline A B.$$

Na soma binária de dois bits, o bit de soma é $S=A\oplus B$ e o transporte é $C=AB$.

## A.5. Análise combinatória e probabilidade elementar

O princípio multiplicativo estabelece que, se uma escolha possui $m$ possibilidades e outra possui $n$, existem $mn$ pares ordenados possíveis. Assim, $k$ sinais binários independentes têm $2^k$ combinações.

O número de maneiras de selecionar $r$ elementos de um conjunto com $n$ elementos, sem considerar a ordem, é

$$\binom nr=\frac{n!}{r!(n-r)!}.$$

O número de palavras binárias de comprimento $n$ com exatamente $r$ bits iguais a 1 é $\binom nr$. A identidade

$$\sum_{r=0}^{n}\binom nr=2^n$$

resulta da expansão de $(1+1)^n$.

**Exemplo.** Há $\binom83=56$ palavras de oito bits com exatamente três bits iguais a 1.

Se cada bit transmitido tem probabilidade de erro independente $p$, a probabilidade de nenhum erro em $n$ bits é $(1-p)^n$; logo,

$$P(\text{ao menos um erro})=1-(1-p)^n.$$

A hipótese de independência é um modelo simplificado: erros em enlaces reais podem ocorrer em rajadas. Um bit de paridade detecta qualquer número **ímpar** de inversões no bloco protegido, mas não detecta um número par de inversões.

## A.6. Sequências, somatórios e crescimento

Uma progressão geométrica com primeiro termo $a$ e razão $r$ possui termos $a,ar,ar^2,\ldots$. Para $r\neq1$, a soma dos primeiros $n$ termos é

$$S_n=a\frac{1-r^n}{1-r}.$$

As potências de dois são especialmente importantes em memórias e endereçamento. Se cada nova linha de endereço dobra o número de posições, $n$ linhas distinguem $2^n$ endereços.

Para uma memória organizada em $2^n$ palavras de $w$ bits, a capacidade nominal é

$$C=2^n w\ \text{bits}.$$

**Exemplo.** Uma memória de $2^{12}$ palavras de 16 bits possui $4096\times16=65536$ bits, equivalentes a 8192 bytes, ou 8 KiB.

É necessário distinguir prefixos decimais e binários: $1\,\mathrm{kB}=1000$ bytes, enquanto $1\,\mathrm{KiB}=1024$ bytes.

## A.7. Logaritmos, decibéis e escalas

O logaritmo na base $b>0$, $b\neq1$, é definido por

$$y=\log_b x\quad\Longleftrightarrow\quad b^y=x,\qquad x>0.$$

Duas propriedades úteis são

$$\log_b(xy)=\log_b x+\log_b y,\qquad \log_b(x^k)=k\log_b x.$$

Para uma razão de potências $P_2/P_1$, a representação em decibéis é

$$L_P=10\log_{10}\left(\frac{P_2}{P_1}\right)\ \mathrm{dB}.$$

Quando as potências são proporcionais ao quadrado de amplitudes medidas sob **a mesma impedância**, vale

$$L_A=20\log_{10}\left(\frac{A_2}{A_1}\right)\ \mathrm{dB}.$$

**Exemplo.** Uma razão de amplitudes igual a 10 corresponde a 20 dB, nas condições indicadas. Uma razão de potências igual a 100 também corresponde a 20 dB.

Para um conversor ideal com sinal senoidal de amplitude plena e quantização uniforme, uma aproximação conhecida para a relação sinal-ruído de quantização é

$$\mathrm{SNR}_{\mathrm{ideal}}\approx 6{,}02N+1{,}76\ \mathrm{dB},$$

em que $N$ é o número de bits. A fórmula pressupõe condições específicas, incluindo quantização ideal e tratamento estatístico apropriado do erro; não descreve por si só ruído térmico, distorção ou interferência de um ADC real.

## A.8. Tempo, frequência e temporização digital

Para um fenômeno periódico com período $T>0$, a frequência é

$$f=\frac1T.$$

Em um relógio de $50\,\mathrm{MHz}$, o período nominal é $20\,\mathrm{ns}$. O tempo de propagação de um circuito deve ser comparado a esse intervalo, mas o limite de frequência de um caminho síncrono depende também dos tempos de estabelecimento e das características da distribuição de relógio.

Para um caminho entre registradores, uma condição simplificada de estabelecimento é

$$T_{clk}\geq t_{cq,max}+t_{comb,max}+t_{setup}+t_{skew},$$

adotando-se $t_{skew}$ como penalidade não negativa no pior caso. A análise de retenção (*hold*) impõe uma condição independente envolvendo atrasos **mínimos** e a relação temporal entre as bordas de relógio. Em projetos reais, devem-se incluir incerteza, variações de processo, tensão, temperatura e restrições específicas das ferramentas de análise estática.

**Exemplo.** Se $t_{cq,max}=1{,}5\,\mathrm{ns}$, $t_{comb,max}=8\,\mathrm{ns}$, $t_{setup}=1\,\mathrm{ns}$ e a penalidade de *skew* é $0{,}5\,\mathrm{ns}$, então $T_{clk}\geq11\,\mathrm{ns}$, correspondendo a uma frequência máxima teórica de aproximadamente $90{,}9\,\mathrm{MHz}$ para esse caminho e esse modelo.

## A.9. Funções exponenciais e redes RC

Em uma rede RC de primeira ordem, a constante de tempo é

$$\tau=RC.$$

Para a carga de um capacitor a partir de tensão inicial nula, por uma fonte constante ideal $V_\infty$ através de um resistor,

$$V_C(t)=V_\infty\left(1-e^{-t/(RC)}\right).$$

Para a descarga a partir de $V_0$, em condições equivalentes,

$$V_C(t)=V_0e^{-t/(RC)}.$$

O tempo de subida entre 10% e 90% da tensão final é aproximadamente $2{,}197\tau$. Entre 30% e 70%, é aproximadamente $0{,}8473\tau$.

**Exemplo.** Em um barramento com resistor de *pull-up* de $4{,}7\,\mathrm{k\Omega}$ e capacitância equivalente de $100\,\mathrm{pF}$, $\tau=470\,\mathrm{ns}$ e o tempo de subida de 30% a 70% é aproximadamente $398\,\mathrm{ns}$.

Esse modelo é útil para I²C e outras saídas de dreno aberto, mas não substitui o tratamento de linhas de transmissão quando as interconexões são longas ou as bordas são rápidas.

## A.10. Amostragem, quantização e erro

A amostragem uniforme de um sinal contínuo $x(t)$ produz uma sequência

$$x[n]=x(nT_s),\qquad f_s=\frac1{T_s}.$$

Para um sinal **estritamente limitado em banda** a frequências inferiores a $B$, a reconstrução ideal requer, sob as hipóteses do teorema de amostragem, uma taxa $f_s>2B$. Na prática, o filtro antialiasing deve atenuar componentes que poderiam se sobrepor após a amostragem.

Para um quantizador uniforme ideal com faixa de entrada de amplitude total $V_{FS}$ e $N$ bits, o passo nominal pode ser definido por

$$\Delta=\frac{V_{FS}}{2^N}.$$

Essa convenção corresponde a $2^N$ intervalos de quantização. Outras especificações de conversores podem usar convenções distintas para os códigos extremos e a escala plena; por isso, a folha de dados deve ser consultada.

Quando o erro de arredondamento permanece dentro de meio passo,

$$|e_q|\leq\frac\Delta2.$$

Sob o modelo idealizado de erro uniformemente distribuído em $[-\Delta/2,\Delta/2]$, a variância é

$$\sigma_q^2=\frac{\Delta^2}{12}.$$

**Exemplo.** Um ADC ideal de 10 bits com faixa nominal de $0$ a $5\,\mathrm{V}$ possui $\Delta=5/1024\approx4{,}883\,\mathrm{mV}$ por intervalo. A atribuição de códigos depende da convenção de quantização adotada.

## A.11. Impedância, reflexões e sinais diferenciais

Em uma linha de transmissão com impedância característica $Z_0$ e carga resistiva $Z_L$, o coeficiente de reflexão de tensão na carga é

$$\Gamma_L=\frac{Z_L-Z_0}{Z_L+Z_0}.$$

Se $Z_L=Z_0$, a reflexão ideal é nula. Se a extremidade estiver aberta, $\Gamma_L\to+1$; se estiver em curto-circuito, $\Gamma_L\to-1$. Esses resultados se aplicam ao modelo ideal de linha e ajudam a explicar a necessidade de terminação em enlaces rápidos.

Para sinalização diferencial, define-se

$$V_D=V_A-V_B,\qquad V_{CM}=\frac{V_A+V_B}{2}.$$

Um receptor diferencial interpreta $V_D$, desde que $V_{CM}$ permaneça dentro da faixa admissível. Ruído comum aos dois condutores pode ser rejeitado, mas a rejeição não é perfeita e depende do receptor e do equilíbrio do enlace.

## A.12. Exercícios de consolidação

1. Converta $(110101{,}101)_2$ para decimal e identifique o peso de cada posição fracionária.
2. Determine o número mínimo de bits necessário para representar 73 estados distintos.
3. Calcule o resultado armazenado de $245+30$ em um registrador de oito bits sem sinal e indique se há transporte de saída.
4. Explique por que transporte de saída e transbordamento com sinal não são equivalentes.
5. Quantas funções booleanas de três variáveis existem? Justifique.
6. Simplifique $A+\overline A B$ usando identidades booleanas.
7. Quantas palavras binárias de dez bits possuem exatamente quatro bits iguais a 1?
8. Uma memória tem 14 linhas de endereço e palavras de 8 bits. Calcule a capacidade em bits e em KiB.
9. Determine o período de um relógio de $80\,\mathrm{MHz}$.
10. Para $R=2{,}2\,\mathrm{k\Omega}$ e $C=150\,\mathrm{pF}$, estime o tempo de subida de 30% a 70%.
11. Calcule o passo nominal de um quantizador ideal de 12 bits com faixa de $0$ a $3{,}3\,\mathrm{V}$, usando $\Delta=V_{FS}/2^N$.
12. Uma linha de $100\,\Omega$ termina em $150\,\Omega$. Determine o coeficiente de reflexão de tensão.
13. Um caminho síncrono possui $t_{cq,max}=2\,\mathrm{ns}$, $t_{comb,max}=6\,\mathrm{ns}$, $t_{setup}=1\,\mathrm{ns}$ e penalidade de *skew* de $1\,\mathrm{ns}$. Determine o menor período segundo o modelo simplificado.
14. Para transmissão de 100 bits com probabilidade independente de erro por bit de $10^{-4}$, estime a probabilidade de ocorrer ao menos um erro.
15. Explique a diferença entre a condição ideal de amostragem e as limitações práticas de um filtro antialiasing.

### Respostas selecionadas

| Questão | Resultado ou indicação |
|---|---|
| 1 | $53{,}625$ |
| 2 | 7 bits |
| 3 | $275\bmod256=19$; há transporte |
| 5 | $2^{2^3}=256$ funções |
| 6 | $A+B$ |
| 7 | $\binom{10}{4}=210$ |
| 8 | $2^{14}\cdot8=131072$ bits = 16 KiB |
| 9 | $12{,}5\,\mathrm{ns}$ |
| 10 | Aproximadamente $280\,\mathrm{ns}$ |
| 11 | Aproximadamente $0{,}806\,\mathrm{mV}$ |
| 12 | $\Gamma=0{,}2$ |
| 13 | $10\,\mathrm{ns}$ |
| 14 | $1-(1-10^{-4})^{100}\approx0{,}00995$ |

## A.13. Leituras complementares

- ROSEN, Kenneth H. *Discrete Mathematics and Its Applications*. McGraw-Hill.
- MANO, M. Morris; CILETTI, Michael D. *Digital Design*. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. *Digital Design and Computer Architecture*. Morgan Kaufmann.
- HOROWITZ, Paul; HILL, Winfield. *The Art of Electronics*. Cambridge University Press.
- OPPENHEIM, Alan V.; WILLSKY, Alan S.; NAWAB, S. Hamid. *Signals and Systems*. Pearson.

As fórmulas apresentadas neste apêndice adotam modelos ideais ou simplificados, explicitados em cada seção. O dimensionamento de circuitos reais requer a consideração das especificações dos componentes, tolerâncias, condições ambientais e margens de projeto.
