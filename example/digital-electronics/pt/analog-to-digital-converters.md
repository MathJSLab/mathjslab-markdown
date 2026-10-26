# 19. Conversores analógico-digitais (ADC) {#chapter-19}

Os **conversores analógico-digitais** (_analog-to-digital converters_, ADCs)
transformam uma grandeza elétrica contínua, geralmente uma tensão, em uma
representação numérica. Eles constituem a interface entre sensores, circuitos
analógicos e sistemas digitais de processamento e controle. Diferentemente de
um circuito lógico, que interpreta intervalos de tensão como níveis discretos,
um ADC procura distinguir numerosos níveis dentro de uma faixa de entrada
especificada.

A conversão não é perfeita: depende de amostragem temporal, quantização de
amplitude, referências de tensão, ruído, limitações dinâmicas e erros de
implementação. O objetivo deste capítulo é compreender esses mecanismos e
relacioná-los às principais arquiteturas de conversão.

## 19.1. Amostragem e quantização

Em um ADC, distinguem-se duas operações conceituais. A **amostragem** associa
instantes discretos a um sinal contínuo no tempo; a **quantização** associa
cada amplitude amostrada a um dos níveis disponíveis. A **codificação**
expressa o nível selecionado por uma palavra binária.

Para uma frequência de amostragem constante $f_s$, os instantes ideais são

$$
t_n=nT_s,\qquad T_s=\frac{1}{f_s},\qquad n\in\mathbb{Z}.
$$

Se a faixa de conversão for $[V_{\min},V_{\max})$ e a resolução nominal for $N$
bits, existem $2^N$ códigos e o intervalo ideal entre limiares adjacentes é

$$
\Delta=\frac{V_{\max}-V_{\min}}{2^N}.
$$

Para um quantizador ideal uniforme do tipo _mid-rise_, sem considerar
saturação, o código pode ser escrito como

$$
k=\left\lfloor\frac{v_{\mathrm{in}}-V_{\min}}{\Delta}\right\rfloor,
\qquad k\in\{0,1,\ldots,2^N-1\}.
$$

Fora da faixa nominal, o conversor pode saturar no primeiro ou último código; o
comportamento exato depende da arquitetura. A tensão representativa de cada
intervalo, nesse modelo, é seu ponto médio:

$$
\widehat v_k=V_{\min}+\left(k+\frac12\right)\Delta.
$$

<!-- prettier-ignore -->
::: figure Etapas conceituais da conversão analógico-digital {#fig-adc-conversion-chain}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]
% Blocos funcionais
\draw[thick] (0,0) rectangle (2.4,1.5);
\draw[thick] (4.2,0) rectangle (6.6,1.5);
\draw[thick] (8.4,0) rectangle (10.8,1.5);

% Identificação dos blocos
\node[align=center] at (1.2,0.75) {Amostragem\\temporal};
\node[align=center] at (5.4,0.75) {Quantização\\de amplitude};
\node[align=center] at (9.6,0.75) {Codificação\\binária};

% Entrada analógica
\draw[->] (-1.8,0.75)--(0,0.75);
\node[above] at (-0.9,0.75) {$v(t)$};

% Amostras
\draw[->] (2.4,0.75)--(4.2,0.75);
\node[above] at (3.3,0.75) {$v[n]$};

% Valores quantizados
\draw[->] (6.6,0.75)--(8.4,0.75);
\node[above] at (7.5,0.75) {$k[n]$};

% Palavra binária de saída
\draw[->] (10.8,0.75)--(14.0,0.75);
\node[above] at (12.4,0.75) {$b[N-1:0]$};
\end{tikzpicture}
```

:::

A {@ref fig-adc-conversion-chain} separa operações que, em um ADC real, podem
ocorrer em circuitos integrados e etapas temporais parcialmente sobrepostas. Em
muitos conversores, um circuito de aquisição acompanha a entrada e depois a
mantém aproximadamente constante durante a decisão.

::: example Exemplo 1 — Resolução de um ADC de 10 bits

Considere um ADC ideal unipolar de 10 bits, com faixa de entrada de $0$ a
$5\,\mathrm{V}$. A largura de um intervalo de quantização é

$$
\Delta=\frac{5}{1024}\,\mathrm{V}\approx4{,}883\,\mathrm{mV}.
$$

Uma entrada de $2{,}000\,\mathrm{V}$ corresponde, no modelo adotado, a
$k=\lfloor2/\Delta\rfloor=409$, cujo código binário é $0110011001_2$. A tensão
representativa do intervalo é aproximadamente $1{,}9995\,\mathrm{V}$. Os
valores dependem da convenção de quantização e da definição de escala do
dispositivo.

:::

## 19.2. Teorema da amostragem

Um sinal estritamente limitado em banda, sem componentes de frequência acima de
$B$, pode ser reconstruído idealmente a partir de amostras uniformes quando

$$
f_s>2B.
$$

O limite $f_s/2$ é chamado **frequência de Nyquist**. Essa condição pressupõe
amostragem ideal e conhecimento de que o sinal é limitado em banda. Na prática,
sinais físicos não são perfeitamente limitados, os filtros possuem transições
finitas e a frequência de amostragem é escolhida com margem.

A amostragem periódica replica o espectro do sinal em torno dos múltiplos de
$f_s$. Se essas réplicas se sobrepõem, diferentes frequências analógicas podem
produzir a mesma sequência amostrada: ocorre **aliasing**.

Para uma senoide de frequência $f$ amostrada a $f_s$, frequências da forma
$|f-mf_s|$, com $m$ inteiro, podem resultar em sequências indistinguíveis,
consideradas as simetrias de fase e sinal.

::: example Exemplo 2 — Frequência aparente

Uma senoide de $900\,\mathrm{Hz}$ amostrada a $1\,\mathrm{kHz}$ pode produzir
uma sequência equivalente, em frequência aparente, a uma senoide de
$100\,\mathrm{Hz}$. A amostragem não permite distinguir essas componentes sem
informação adicional sobre a banda original.

:::

## 19.3. Erro de quantização e relação sinal-ruído

O **erro de quantização** é a diferença entre a amplitude amostrada e sua
representação quantizada:

$$
e_q[n]=v[n]-\widehat v[n].
$$

Para um quantizador ideal uniforme, sem sobrecarga e com representação no
centro de cada intervalo,

$$
-\frac{\Delta}{2}\le e_q[n]<\frac{\Delta}{2}.
$$

Quando o erro pode ser aproximado como uma variável uniformemente distribuída e
não correlacionada com o sinal, sua potência média, expressa como variância de
tensão, é

$$
\sigma_q^2=\frac{\Delta^2}{12}.
$$

Sob essas hipóteses, para uma senoide de amplitude igual à metade da faixa
total de entrada e um ADC ideal de $N$ bits, a relação sinal-ruído de
quantização é aproximadamente

$$
\mathrm{SNR}_{q}\approx 6{,}02N+1{,}76\ \mathrm{dB}.
$$

Essa expressão **não** é uma especificação universal de SNR: ela pressupõe uma
senoide em escala plena, quantização ideal e um modelo estatístico adequado do
erro. Para sinais pequenos, entradas coerentes com os níveis de quantização ou
ruído fortemente correlacionado, a aproximação pode não representar o
comportamento observado.

<!-- prettier-ignore -->
::: table Relação sinal-ruído ideal de quantização para senoide em escala plena {#table-adc-ideal-snr .full-width}

| Resolução $N$ | Quantidade de códigos | $\mathrm{SNR}_q$ aproximada |
| ------------: | --------------------: | --------------------------: |
|        8 bits |                   256 |       $49{,}9\,\mathrm{dB}$ |
|       10 bits |                 1 024 |       $62{,}0\,\mathrm{dB}$ |
|       12 bits |                 4 096 |       $74{,}0\,\mathrm{dB}$ |
|       16 bits |                65 536 |       $98{,}1\,\mathrm{dB}$ |

:::

Aumentar a resolução nominal reduz o passo de quantização, mas não elimina
ruído térmico, distorção, instabilidade da referência ou erros de linearidade.

## 19.4. Conversores por comparação paralela (_flash_)

Um ADC **flash** emprega vários comparadores simultâneos, alimentados por
limiares derivados de uma rede de referência. Para $N$ bits, uma implementação
flash direta requer tipicamente $2^N-1$ comparadores, além de lógica de
codificação.

Cada comparador indica se a entrada ultrapassou seu limiar. O conjunto de
resultados forma, idealmente, um **código termométrico**, que é convertido em
código binário. Circuitos reais precisam lidar com decisões inconsistentes,
denominadas _bubbles_, e com atrasos distintos dos comparadores.

<!-- prettier-ignore -->
::: figure Arquitetura funcional simplificada de um ADC flash {#fig-adc-flash-architecture}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]

% Banco de comparadores
\draw[thick] (2.5,0) rectangle (5.8,2.4);
\node[align=center] at (4.15,1.2)
  {Banco de\\comparadores};

% Codificador termométrico-binário
\draw[thick] (9.5,0) rectangle (13.7,2.4);
\node[align=center] at (11.6,1.2)
  {Codificador\\termométrico-\\binário};

% Entrada analógica
\draw[->] (-0.5,1.8)--(2.5,1.8);
\node[above] at (1.0,1.8) {$V_{in}$};

% Referências dos comparadores
\draw[->] (-0.5,0.6)--(2.5,0.6);
\node[below] at (1.0,0.6) {Limiar(es)};

% Código termométrico
\draw[->] (5.8,1.2)--(9.5,1.2);
\node[above] at (7.65,1.2) {Termométrico};

% Palavra binária de saída
\draw[->] (13.7,1.2)--(16.5,1.2);
\node[above] at (15.1,1.2) {$N$ bits};

\end{tikzpicture}
```

:::

A {@ref fig-adc-flash-architecture} apresenta a estrutura funcional. Sua
principal vantagem é a baixa latência de decisão. Em contrapartida, a
quantidade de comparadores cresce exponencialmente com $N$, elevando área,
potência, capacitância de entrada e complexidade de calibração.

## 19.5. Conversores por rampa e contagem

Um conversor por **rampa simples** compara a entrada a uma tensão que varia com
o tempo. Um contador ou temporizador mede o instante em que a rampa cruza a
tensão de entrada. Em uma implementação com DAC e contador, a contagem é
incrementada até que a saída do DAC alcance a entrada.

<!-- prettier-ignore -->
::: figure Princípio de um conversor ADC por contagem {#fig-adc-counter-ramp}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]
\draw[thick] (0,0) rectangle (2.5,1.5);
\draw[thick] (4.0,0) rectangle (6.5,1.5);
\draw[thick] (8.0,0) rectangle (10.5,1.5);
\node at (1.25,0.75) {Contador};
\node at (5.25,0.75) {DAC};
\node at (9.25,0.75) {Comparador};
\draw[->] (2.5,0.75)--(4.0,0.75) node[midway,above] {$k$};
\draw[->] (6.5,0.75)--(8.0,0.75) node[midway,above] {$V_{DAC}$};
\draw[->] (9.25,2.5)--(9.25,1.5) node[midway,right] {$V_{in}$};
\draw[->] (10.5,0.75)--(11.7,0.75) node[midway,above] {Fim};
\end{tikzpicture}
```

:::

Na {@ref fig-adc-counter-ramp}, o comparador encerra a contagem quando a
condição de cruzamento é atingida. O tempo de conversão varia com o valor de
entrada e pode exigir até aproximadamente $2^N$ etapas, dependendo da
implementação.

Nos ADCs de **dupla inclinação**, integra-se a tensão desconhecida por um
intervalo fixo e depois integra-se uma referência de polaridade oposta até o
integrador retornar ao nível inicial. A duração da segunda fase é proporcional
à entrada. Essa técnica pode rejeitar perturbações periódicas, como as
associadas à rede elétrica, quando os tempos de integração são escolhidos
adequadamente.

## 19.6. Conversores por aproximações sucessivas (SAR)

O ADC de **aproximações sucessivas** (_successive-approximation register_, SAR)
determina os bits por decisões sucessivas, começando pelo mais significativo.
Uma arquitetura típica contém um circuito de amostragem, um DAC interno, um
comparador e lógica SAR.

A cada etapa, a lógica propõe um código, o DAC gera a tensão correspondente e o
comparador decide se o bit testado deve ser mantido ou removido. Após
aproximadamente $N$ decisões, obtém-se uma palavra de $N$ bits, embora o tempo
total também inclua aquisição, acomodação e eventuais etapas adicionais.

<!-- prettier-ignore -->
::: figure Arquitetura funcional de um conversor SAR {#fig-adc-sar-architecture}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]
\draw[thick] (1.2,2.2) rectangle (3.8,3.7);
\draw[thick] (5.4,2.2) rectangle (8.0,3.7);
\draw[thick] (5.4,-0.3) rectangle (8.0,1.2);
\node[align=center] at (2.5,2.95) {Comparador};
\node[align=center] at (6.7,2.95) {Lógica SAR};
\node at (6.7,0.45) {DAC interno};
\draw[->] (-0.4,3.3)--(1.2,3.3) node[midway,above] {$V_{in}$};
\draw[->] (3.8,2.95)--(5.4,2.95) node[midway,above] {Decisão};
\draw[->] (6.7,2.2)--(6.7,1.2);
\draw[->] (5.4,0.45)--(2.5,0.45)--(2.5,2.2);
\draw[->] (8.0,2.95)--(9.7,2.95) node[midway,above] {$N$ bits};
\end{tikzpicture}
```

:::

Na {@ref fig-adc-sar-architecture}, a realimentação analógica é produzida pelo
DAC interno. O conversor SAR oferece um compromisso favorável entre resolução,
consumo, velocidade e complexidade, sendo frequente em instrumentação e
sistemas embarcados.

::: example Exemplo 3 — Aproximações sucessivas

Para um ADC SAR ideal de 4 bits, com faixa de $0$ a $16\,\mathrm{V}$, considere
$V_{in}=10{,}3\,\mathrm{V}$. Testa-se inicialmente o bit de peso 8:
$8\,\mathrm{V}\le10{,}3\,\mathrm{V}$, portanto ele é mantido. O teste seguinte
propõe $12\,\mathrm{V}$, que é rejeitado. O teste de $10\,\mathrm{V}$ é aceito
e o de $11\,\mathrm{V}$ é rejeitado. O código final é $1010_2=10$,
correspondente ao intervalo $[10,11)\,\mathrm{V}$.

:::

## 19.7. Conversores sigma-delta

Conversores **sigma-delta** ($\Sigma\Delta$) utilizam sobreamostragem e
realimentação para moldar a distribuição espectral do ruído de quantização. Um
modulador pode operar com um quantizador de poucos níveis e produzir uma
sequência digital de alta taxa. Um filtro digital e um estágio de **decimação**
reduzem a taxa de saída e preservam a informação na banda útil.

<!-- prettier-ignore -->
::: figure Cadeia funcional simplificada de conversão sigma-delta {#fig-adc-sigma-delta-chain}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]

% Modulador sigma-delta
\draw[thick] (0,0) rectangle (2.6,1.5);
\node[align=center] at (1.3,0.75)
  {Modulador\\$\Sigma\Delta$};

% Filtro digital
\draw[thick] (5.3,0) rectangle (7.9,1.5);
\node[align=center] at (6.6,0.75)
  {Filtro digital};

% Estágio de decimação
\draw[thick] (10.6,0) rectangle (13.2,1.5);
\node[align=center] at (11.9,0.75)
  {Decimação};

% Entrada analógica
\draw[->] (-2.0,0.75)--(0,0.75);
\node[above] at (-1.0,0.75) {$V_{in}$};

% Saída do modulador: fluxo de alta taxa
\draw[->] (2.6,0.75)--(5.3,0.75);
\node[above] at (3.95,0.75) {Alta taxa};

% Saída do filtro digital
\draw[->] (7.9,0.75)--(10.6,0.75);

% Saída após decimação
\draw[->] (13.2,0.75)--(16.0,0.75);
\node[above] at (14.6,0.75) {Amostras};

\end{tikzpicture}
```

:::

A {@ref fig-adc-sigma-delta-chain} omite os detalhes internos do modulador, que
podem incluir integradores, quantizador e DAC de realimentação. O
**sobreamostramento** aumenta a razão entre a frequência interna de amostragem
e a largura de banda útil; a **modelagem de ruído** desloca parte da energia de
quantização para fora dessa banda. O filtro digital remove componentes
indesejadas antes da redução de taxa.

Essa arquitetura é especialmente adequada a medições de alta resolução em
bandas relativamente estreitas, embora latência, estabilidade do modulador e
comportamento diante de mudanças abruptas precisem ser considerados.

## 19.8. Resolução efetiva e desempenho dinâmico

A resolução nominal $N$ informa a quantidade de códigos, mas não descreve,
isoladamente, a qualidade de uma conversão. Entre as métricas utilizadas estão:

- **Erro de offset:** deslocamento da característica de transferência.
- **Erro de ganho:** diferença entre a inclinação real e a ideal, após a
  correção de offset conforme a convenção adotada.
- **DNL (_differential nonlinearity_):** desvio da largura de um código em
  relação a $1\,\mathrm{LSB}$ ideal.
- **INL (_integral nonlinearity_):** desvio da característica de transferência
  em relação a uma reta de referência especificada.
- **SNR:** relação entre potência do sinal e potência de ruído, com as
  exclusões de componentes harmônicas definidas pelo procedimento de medição.
- **SINAD:** relação entre a potência do sinal e a soma das potências de ruído
  e distorção.
- **SFDR:** diferença, em decibéis, entre o sinal fundamental e a maior
  componente espúria na banda de análise.

A **quantidade efetiva de bits**, ou _effective number of bits_ (ENOB), é
usualmente estimada a partir do SINAD de uma senoide:

$$
\mathrm{ENOB}=\frac{\mathrm{SINAD}_{\mathrm{dB}}-1{,}76}{6{,}02}.
$$

Essa relação adota o modelo de referência de um quantizador ideal sob teste
senoidal. O ENOB depende da frequência de entrada, da frequência de amostragem,
da amplitude e das condições de medição.

::: example Exemplo 4 — Resolução efetiva

Se um ADC de 12 bits apresentar $\mathrm{SINAD}=62\,\mathrm{dB}$ em uma
condição de ensaio especificada, então

$$
\mathrm{ENOB}\approx\frac{62-1{,}76}{6{,}02}\approx10{,}0\ \text{bits}.
$$

O resultado não significa que o dispositivo produza somente $2^{10}$ códigos:
significa que seu desempenho de ruído e distorção, nessa condição, é comparável
ao de um quantizador ideal de aproximadamente 10 bits.

:::

## 19.9. Aliasing e filtragem antialiasing

Um **filtro antialiasing** é colocado antes da amostragem para atenuar
componentes analógicas que poderiam se sobrepor à banda útil depois da
conversão. Como filtros físicos não possuem corte abrupto, o projeto precisa
estabelecer uma banda passante, uma banda de transição e uma atenuação mínima
na banda de rejeição.

<!-- prettier-ignore -->
::: figure Posicionamento funcional do filtro antialiasing {#fig-adc-antialias-filter}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]

% Filtro analógico antialiasing
\draw[thick] (0,0) rectangle (3.1,1.6);
\node[align=center] at (1.55,0.8)
  {Filtro analógico\\antialiasing};

% Conversor analógico-digital
\draw[thick] (6.9,0) rectangle (10.0,1.6);
\node[align=center] at (8.45,0.8) {ADC};

% Sinal analógico de entrada
\draw[->] (-1.8,0.8)--(0,0.8);
\node[above] at (-0.9,0.8) {$v(t)$};

% Sinal analógico com banda limitada
\draw[->] (3.1,0.8)--(6.9,0.8);
\node[above] at (5.0,0.8) {Banda limitada};

% Sequência digital de saída
\draw[->] (10.0,0.8)--(11.8,0.8);
\node[above] at (10.9,0.8) {$k[n]$};

\end{tikzpicture}
```

:::

Na {@ref fig-adc-antialias-filter}, o filtro é analógico porque a remoção de
frequências que causariam aliasing deve ocorrer **antes** da amostragem. A
filtragem digital posterior pode remover componentes já separadas em
frequência, mas não desfaz, em geral, a sobreposição espectral provocada pela
amostragem.

## 19.10. Referências de tensão e condicionamento de entrada

A referência de tensão estabelece a escala de conversão. Sua estabilidade,
ruído, deriva térmica e capacidade de fornecer corrente afetam diretamente a
precisão. Em aplicações ratiométricas, pode ser vantajoso utilizar uma
referência compartilhada pelo sensor e pelo ADC, de modo que variações comuns
se cancelem parcialmente.

O circuito de entrada deve atender à faixa de tensão de modo comum, aos limites
absolutos e ao tempo de aquisição do ADC. Conversores com amostragem por
capacitor podem exigir que a fonte apresente impedância suficientemente baixa
para carregar o capacitor interno durante a janela de aquisição.

O **condicionamento analógico** pode envolver amplificação, atenuação,
deslocamento de nível, filtragem, proteção contra sobretensão e conversão
diferencial. Cada etapa acrescenta potenciais erros de ganho, offset, ruído e
distorção.

::: example Exemplo 5 — Adequação da faixa de um sensor

Um sensor fornece tensões de $0{,}5$ a $2{,}5\,\mathrm{V}$, enquanto um ADC
ideal aceita de $0$ a $3{,}3\,\mathrm{V}$. É possível conectá-lo diretamente,
se os requisitos elétricos forem atendidos, mas somente parte da faixa de
códigos será utilizada. Um estágio de condicionamento que mapeie a faixa do
sensor para a faixa útil do ADC pode melhorar a utilização da resolução
nominal, desde que seus próprios erros não eliminem o benefício.

:::

## 19.11. Aplicações e critérios de seleção

A escolha de um ADC deve começar pelas exigências do sinal e do sistema, e não
apenas pela quantidade de bits anunciada. Convém estabelecer a banda útil, a
taxa de atualização, a faixa de entrada, a precisão requerida, o tempo máximo
de resposta, o consumo e a interface digital disponível.

<!-- prettier-ignore -->
::: table Comparação qualitativa de arquiteturas de ADC {#table-adc-architectures .full-width}

| Arquitetura      | Característica principal                       | Limitação típica                                         | Aplicações frequentes                 |
| ---------------- | ---------------------------------------------- | -------------------------------------------------------- | ------------------------------------- |
| Flash            | Conversão paralela e muito rápida              | Muitos comparadores e consumo elevado                    | Aquisição de alta velocidade          |
| Rampa/contagem   | Estrutura conceitualmente simples              | Tempo de conversão variável ou elevado                   | Instrumentação simples e didática     |
| Dupla inclinação | Boa rejeição de perturbações periódicas        | Conversão relativamente lenta                            | Instrumentos de medição               |
| SAR              | Bom equilíbrio entre taxa, resolução e energia | Exige acomodação e aquisição adequadas                   | Sistemas embarcados e aquisição geral |
| Sigma-delta      | Alta resolução em banda limitada               | Latência e largura de banda condicionadas pela filtragem | Sensores e instrumentação de precisão |

:::

A {@ref table-adc-architectures} apresenta tendências gerais; produtos
específicos podem utilizar técnicas híbridas e apresentar características fora
desses perfis.

Em sistemas com múltiplos canais, é necessário verificar se a taxa declarada é
por canal ou compartilhada, se existe multiplexação e qual é o tempo de
acomodação após a troca de entrada. Em aplicações de controle, a latência total
— incluindo aquisição, conversão, filtragem e comunicação — pode ser tão
importante quanto a taxa nominal de amostragem.

## Síntese do capítulo

A conversão analógico-digital combina discretização temporal e discretização de
amplitude. O teorema da amostragem orienta a escolha da frequência de
aquisição, enquanto a quantização define um limite ideal de resolução em
amplitude. Arquiteturas flash, por contagem, SAR e sigma-delta realizam
compromissos diferentes entre velocidade, consumo, precisão, área e latência.
Na aplicação real, o desempenho depende também do filtro antialiasing, do
condicionamento de entrada, da referência de tensão e dos critérios de medição.

## Exercícios

1. Um ADC ideal de 8 bits opera na faixa de $0$ a $3{,}3\,\mathrm{V}$. Calcule
   o passo de quantização e o número de códigos disponíveis.
2. Para o quantizador ideal uniforme definido na Seção 19.1, determine o código
   de saída para $v_{in}=1{,}25\,\mathrm{V}$, com $N=10$ e faixa
   $[0,5)\,\mathrm{V}$.
3. Explique por que a condição $f_s>2B$ não dispensa o filtro antialiasing em
   um sistema físico.
4. Uma senoide de $1{,}7\,\mathrm{kHz}$ é amostrada a $2\,\mathrm{kHz}$.
   Determine uma frequência aparente dentro da banda de Nyquist.
5. Calcule a SNR ideal aproximada de quantização para 14 bits, explicitando as
   hipóteses do modelo.
6. Determine a quantidade de comparadores de uma arquitetura flash direta de 6
   bits. Discuta o efeito de aumentar a resolução para 10 bits.
7. Compare os tempos de decisão de um ADC por contagem e de um SAR, ambos com
   $N$ bits, desconsiderando os tempos analógicos de acomodação.
8. Descreva as etapas de decisão de um SAR de 4 bits para
   $V_{in}=6{,}7\,\mathrm{V}$ e faixa de $0$ a $16\,\mathrm{V}$.
9. Explique a diferença entre sobreamostragem e modelagem espectral do ruído em
   um ADC sigma-delta.
10. Um ADC apresenta $\mathrm{SINAD}=74\,\mathrm{dB}$. Estime seu ENOB e
    explique por que ele pode diferir da resolução nominal.
11. Compare DNL e INL e explique por que ambas são relevantes para caracterizar
    um ADC.
12. Proponha critérios de seleção para dois sistemas: um voltímetro digital de
    alta precisão e um sistema de aquisição de sinais de alta frequência.

## Referências bibliográficas

- ANALOG DEVICES. _The Data Conversion Handbook_. Newnes, 2005.
- KESTER, Walt (ed.). _Analog-Digital Conversion_. Analog Devices, 2004.
- JOHNS, David A.; MARTIN, Ken. _Analog Integrated Circuit Design_.
  Wiley, 1997.
- SEDRA, Adel S.; SMITH, Kenneth C. _Microelectronic Circuits_. Oxford
  University Press.
- OPPENHEIM, Alan V.; SCHAFER, Ronald W. _Discrete-Time Signal Processing_.
  Pearson.
