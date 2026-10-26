# 18. Conversores digital-analógico (DAC) {#chapter-18}

Os sistemas digitais armazenam e processam códigos discretos, mas muitas de
suas aplicações exigem sinais elétricos capazes de atuar sobre equipamentos
analógicos. Um **conversor digital-analógico** (_digital-to-analog converter_,
DAC) estabelece uma correspondência entre um código digital e uma grandeza
analógica, geralmente tensão ou corrente. Essa correspondência não implica
continuidade temporal perfeita nem ausência de erros: a saída real é afetada
por tolerâncias, ruído, limitações dinâmicas e características da carga.

Neste capítulo são apresentados o modelo ideal de conversão, as principais
arquiteturas de DAC, os parâmetros de exatidão e os critérios de aplicação. As
expressões são deduzidas sob hipóteses explícitas; valores e limites de
componentes reais devem ser conferidos em suas folhas de dados.

## 18.1. Princípios da conversão digital-analógica {#sec-dac-principles}

Um DAC de $N$ bits recebe uma palavra $b_{N-1}\ldots b_1b_0$, com
$b_i\in\{0,1\}$, e produz uma saída associada ao número inteiro sem sinal

$$
D=\sum_{i=0}^{N-1}b_i2^i,\qquad 0\le D\le 2^N-1. \tag{18.1}
$$

Para um DAC ideal **unipolar**, com saída em tensão, referência positiva
$V_{\mathrm{ref}}$ e convenção de escala binária, a transferência é

$$
V_{\mathrm{out}}(D)=V_{\mathrm{ref}}\frac{D}{2^N}. \tag{18.2}
$$

A saída cresce em degraus iguais. O maior código não alcança
$V_{\mathrm{ref}}$: corresponde a $V_{\mathrm{ref}}(1-2^{-N})$. Alguns
dispositivos adotam outra convenção de escala ou de calibração; portanto, a
relação exata entre referência, código e saída é específica da arquitetura.

<!-- prettier-ignore -->
::: figure Conversão ideal de uma palavra digital em tensão analógica {#fig-dac-functional-block}

```tikz
\begin{tikzpicture}[scale=1.8,transform shape]
\draw[thick] (2,0.8) rectangle (5.4,3.0);
\node at (3.7,2.15) {DAC};
\node at (3.7,1.45) {$N$ bits};
\draw[->] (0.2,1.9)--(2,1.9);
\node[above] at (1.1,1.9) {$D$};
\draw[->] (5.4,1.9)--(7.7,1.9);
\node[above] at (6.55,1.9) {$V_{\mathrm{out}}$};
\draw[->] (3.7,4.0)--(3.7,3.0);
\node[above] at (3.7,4.0) {$V_{\mathrm{ref}}$};
\end{tikzpicture}
```

:::

A {@ref fig-dac-functional-block} representa apenas a função do conversor. Em
um componente real podem existir entradas de controle, alimentação analógica e
digital, interface serial, terra de referência e circuitos de saída.

Uma forma geral de representar um DAC unipolar é

$$
Y(D)=Y_0+K_D D, \tag{18.3}
$$

em que $Y$ é tensão ou corrente, $Y_0$ é o valor associado ao código zero e
$K_D$ é o incremento ideal por código. O modelo permite distinguir o ganho de
conversão da origem da escala.

## 18.2. Resolução, faixa e quantização {#sec-dac-resolution}

A **resolução nominal** de um DAC de $N$ bits corresponde à existência de $2^N$
códigos possíveis. Para a convenção da Equação (18.2), o tamanho do degrau,
frequentemente denominado **1 LSB** (_least significant bit_), é

$$
\Delta V=\frac{V_{\mathrm{ref}}}{2^N}. \tag{18.4}
$$

A **faixa de saída codificável** estende-se de zero até

$$
V_{\max}=(2^N-1)\Delta V=V_{\mathrm{ref}}-\Delta V. \tag{18.5}
$$

Não se deve confundir o intervalo nominal definido pela referência com a maior
tensão efetivamente gerada pelo código máximo.

::: example Resolução de um DAC de oito bits {#ex-dac-eight-bit-resolution}

Considere $N=8$ e $V_{\mathrm{ref}}=5\,\mathrm V$. Existem $256$ códigos e

$$
\Delta V=\frac{5}{256}=0{,}01953125\,\mathrm V.
$$

O código $D=100$ produz idealmente $V_{\mathrm{out}}=100\Delta
V\approx1{,}9531\,\mathrm V$. O código máximo $255$ produz $4{,}98047\,\mathrm
V$, e não exatamente $5\,\mathrm V$.

:::

<!-- prettier-ignore -->
::: table Códigos e tensões ideais de um DAC unipolar de três bits com referência de oito volts {#tbl-dac-three-bit-codes .full-width}

| Código binário | Decimal $D$ | Saída ideal ($\mathrm V$) |
| -------------- | ----------: | ------------------------: |
| `000`          |           0 |                         0 |
| `001`          |           1 |                         1 |
| `010`          |           2 |                         2 |
| `011`          |           3 |                         3 |
| `100`          |           4 |                         4 |
| `101`          |           5 |                         5 |
| `110`          |           6 |                         6 |
| `111`          |           7 |                         7 |

:::

<!-- prettier-ignore -->
::: figure Característica de transferência ideal de um DAC unipolar de três bits {#fig-dac-staircase}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[->] (0.5,0.5)--(9.0,0.5) node[right] {$D$};
\draw[->] (0.5,0.5)--(0.5,5.2) node[above] {$V_{\mathrm{out}}$};
\foreach \k in {0,...,7}{
  \draw[thick] (0.8+\k,0.8+0.52*\k)--(1.8+\k,0.8+0.52*\k);
  \node[below] at (1.3+\k,0.5) {\scriptsize \k};
}
\foreach \k in {0,...,6}{
  \draw[densely dotted] (1.8+\k,0.8+0.52*\k)--(1.8+\k,1.32+0.52*\k);
}
\node[left] at (0.5,0.8) {$0$};
\node[left] at (0.5,4.44) {$7\Delta V$};
\end{tikzpicture}
```

:::

A {@ref fig-dac-staircase} representa os níveis disponíveis, não uma forma de
onda temporal. Ao converter uma sequência de códigos, o DAC normalmente mantém
a saída correspondente a cada código até a próxima atualização, mas a transição
entre níveis não é instantânea.

O termo **quantização** descreve a representação por níveis discretos. Em um
DAC, o erro entre um valor analógico desejado e o nível selecionado depende da
regra usada para escolher o código. Com arredondamento ao nível mais próximo, o
erro de representação ideal fica limitado a aproximadamente $\pm\Delta V/2$
dentro da faixa representável; saturação nos extremos e convenções de
codificação exigem tratamento próprio. Esse erro de representação não deve ser
confundido com os erros físicos do conversor.

## 18.3. Conversores por resistores ponderados {#sec-dac-weighted-resistors}

Um método direto de conversão consiste em atribuir a cada bit uma contribuição
de corrente proporcional ao seu peso binário. Em uma implementação com
amplificador operacional somador, cada bit habilita ou desabilita um ramo
resistivo. Se o resistor associado ao bit $b_i$ for escolhido como

$$
R_i=2^{N-1-i}R, \tag{18.6}
$$

então, supondo uma tensão lógica ideal $V_H$ nos ramos ativos e terra virtual
na entrada inversora, a corrente do ramo será $I_i=b_iV_H/R_i$. Com resistor de
realimentação $R_f$, a saída ideal do somador inversor será

$$
V_{\mathrm{out}}=-\frac{R_fV_H}{R}\sum_{i=0}^{N-1}\frac{b_i}{2^{N-1-i}}. \tag{18.7}
$$

A polaridade negativa decorre da configuração inversora; outros estágios podem
inverter ou deslocar a saída.

<!-- prettier-ignore -->
::: figure Organização conceitual de um DAC por resistores ponderados {#fig-dac-weighted-architecture}

```tikz
\begin{tikzpicture}[scale=1.8,transform shape]
\draw[thick] (3.4,0.9) rectangle (6.8,3.5);
\node[align=center] at (5.1,2.55) {Somador de\\correntes};
\node at (5.1,1.65) {$I_\Sigma=\sum I_i$};
\foreach \y/\lab in {3.05/{b_{N-1}},2.3/{b_{N-2}},1.55/{b_0}}{
  \draw[->] (0.5,\y)--(3.4,\y);
  \node[above] at (1.35,\y) {$\lab$};
}
\draw[->] (6.8,2.2)--(8.7,2.2);
\node[above] at (7.75,2.2) {$V_{\mathrm{out}}$};
\end{tikzpicture}
```

:::

A {@ref fig-dac-weighted-architecture} enfatiza a soma de contribuições. O
circuito não detalha chaves nem o amplificador de transimpedância; esses
elementos devem ser considerados no projeto eletrônico.

A principal dificuldade dessa arquitetura é a necessidade de resistores com
razões muito diferentes. Para $N$ bits, a razão entre o maior e o menor
resistor ideal é $2^{N-1}$. Em resoluções elevadas, tolerâncias, resistências
das chaves e correntes de fuga tornam difícil manter os pesos relativos.

## 18.4. Conversores em escada R–2R {#sec-dac-r2r-ladder}

A **escada R–2R** usa apenas duas resistências nominais, $R$ e $2R$,
organizadas em uma rede repetitiva. Em condições ideais, cada estágio divide a
contribuição de modo que os bits sucessivos tenham pesos binários. A estrutura
facilita a fabricação integrada porque requer sobretudo o controle da razão
entre resistências, e não uma grande variedade de valores absolutos.

<!-- prettier-ignore -->
::: figure Trecho ilustrativo de uma escada resistiva R–2R {#fig-dac-r2r-ladder}

```tikz
\begin{circuitikz}[scale=1.8,transform shape]
% Resistores horizontais e trecho de entrada ampliado
\draw (0,3.2) -- (2.0,3.2)
      to[R,l=$R$] (4.4,3.2)
      to[R,l=$R$] (6.8,3.2)
      to[R,l=$R$] (9.2,3.2);

% Ramos verticais
\draw (4.4,3.2) to[R,l_=$2R$] (4.4,0.7);
\draw (6.8,3.2) to[R,l_=$2R$] (6.8,0.7);
\draw (9.2,3.2) to[R,l_=$2R$] (9.2,0.7);

% Pontos de conexão
\fill (4.4,3.2) circle (1.2pt);
\fill (6.8,3.2) circle (1.2pt);
\fill (9.2,3.2) circle (1.2pt);

% Identificação dos terminais
\node[left] at (0,3.2) {Nó de soma};
\node[below] at (4.4,0.7) {$S_2$};
\node[below] at (6.8,0.7) {$S_1$};
\node[below] at (9.2,0.7) {$S_0$};
\end{circuitikz}
```

:::

A {@ref fig-dac-r2r-ladder} apresenta somente um trecho conceitual. As
terminações da escada, as posições das chaves $S_i$ e a referência de tensão ou
corrente dependem da topologia específica. Em uma implementação típica, cada
chave conecta seu ramo a uma referência ou a um potencial de retorno
apropriado, preservando a rede de resistências vista pelos demais ramos.

Para um DAC ideal com escala binária, a soma ponderada continua sendo dada pela
Equação (18.2). A rede R–2R é um modo de realizar fisicamente esses pesos, não
uma mudança na regra de codificação.

A precisão depende do casamento entre resistores, da resistência e da injeção
de carga das chaves, das capacitâncias parasitas e das condições de referência.
Mesmo com resistores nominais idênticos, diferenças de fabricação podem gerar
erros de linearidade.

## 18.5. Conversores por corrente {#sec-dac-current-steering}

Em DACs por **direcionamento de corrente** (_current steering_), fontes de
corrente são comutadas entre um nó de saída e um caminho alternativo. Em uma
versão binariamente ponderada ideal,

$$
I_{\mathrm{out}}=I_{\mathrm{LSB}}\sum_{i=0}^{N-1}b_i2^i
=I_{\mathrm{LSB}}D. \tag{18.8}
$$

Uma alternativa utiliza **fontes de corrente unitárias**, com várias unidades
iguais selecionadas conforme o código. A codificação termométrica, na qual um
aumento de um nível ativa mais uma unidade, pode melhorar a monotonicidade e
reduzir determinados transientes de comutação, ao custo de maior quantidade de
elementos.

<!-- prettier-ignore -->
::: figure Princípio de soma de correntes unitárias em um DAC {#fig-dac-current-summing}

```tikz
\begin{tikzpicture}[scale=1.8,transform shape]
\foreach \x/\lab in {1.0/1,3.0/2,5.0/3}{
  \draw[thick] (\x,1.0) rectangle ++(1.25,1.4);
  \node at (\x+0.625,1.75) {$I_u$};
  \node[below] at (\x+0.625,1.0) {$S_{\lab}$};
  \draw (\x+0.625,2.4)--(\x+0.625,3.1);
}
\draw (1.625,3.1)--(6.625,3.1)--(7.5,3.1);
\draw[->] (7.5,3.1)--(8.6,3.1);
\node[above] at (7.95,3.1) {$I_{\mathrm{out}}$};
\end{tikzpicture}
```

:::

A {@ref fig-dac-current-summing} é funcional: as chaves e os caminhos de
corrente não estão detalhados. Em DACs reais, a corrente total pode ser
convertida em tensão por um resistor de carga ou por um amplificador de
transimpedância, respeitando a faixa de tensão admissível no nó de saída
(_compliance_).

DACs de corrente podem ser adequados a taxas de atualização elevadas.
Entretanto, exigem cuidado com casamento das fontes, capacitâncias,
temporização das chaves, ruído e distorção dinâmica.

<!-- prettier-ignore -->
::: table Comparação introdutória de arquiteturas de DAC {#tbl-dac-architectures .full-width}

| Arquitetura           | Princípio                    | Vantagem característica             | Limitação relevante                    |
| --------------------- | ---------------------------- | ----------------------------------- | -------------------------------------- |
| Resistores ponderados | Correntes com pesos binários | Modelo simples                      | Ampla razão de resistências            |
| Escada R–2R           | Divisão resistiva repetitiva | Apenas duas razões nominais         | Sensibilidade ao casamento e às chaves |
| Correntes binárias    | Soma de fontes ponderadas    | Conversão direta em corrente        | Casamento e transientes                |
| Correntes unitárias   | Seleção de unidades iguais   | Possibilidade de boa monotonicidade | Área e número de elementos             |
| PWM com filtro        | Média temporal de pulsos     | Implementação digital econômica     | Ondulação e resposta lenta             |

:::

## 18.6. Erros de offset, ganho e linearidade {#sec-dac-static-errors}

Um DAC real não produz exatamente os níveis previstos pela transferência ideal.
Os erros estáticos são caracterizados por medidas distintas.

**Erro de offset:** deslocamento da característica em relação ao nível esperado
para o código de referência, frequentemente o código zero em DACs unipolares. A
definição operacional deve acompanhar a folha de dados, sobretudo em
dispositivos bipolares.

**Erro de ganho:** diferença de inclinação entre a característica medida e a
ideal, geralmente avaliada após a remoção do offset. Não equivale simplesmente
ao erro observado no maior código quando há offset presente.

**Não linearidade integral (INL):** desvio de um nível medido em relação a uma
linha de referência especificada. A linha pode ser definida por extremos
(_endpoint_) ou por ajuste de melhor reta (_best fit_); os valores resultantes
não são necessariamente iguais.

**Não linearidade diferencial (DNL):** desvio do incremento entre dois códigos
adjacentes em relação ao degrau ideal. Se $Y(D)$ é a saída estática,

$$
\operatorname{DNL}(D)=\frac{Y(D)-Y(D-1)}{\Delta Y_{\mathrm{ideal}}}-1,
\quad D=1,\ldots,2^N-1. \tag{18.9}
$$

A DNL costuma ser expressa em LSB. Um DAC é **monotônico** se sua saída não
diminui quando o código aumenta (para uma transferência crescente). Se
$\operatorname{DNL}(D)\ge-1$ em todos os códigos, os degraus são não negativos,
condição suficiente para monotonicidade nessa convenção. Uma DNL inferior a
$-1$ em algum código indica um degrau negativo.

::: example Identificação de um erro diferencial {#ex-dac-dnl}

Um DAC tem degrau ideal de $10\,\mathrm{mV}$. Entre dois códigos consecutivos,
mede-se aumento de $7\,\mathrm{mV}$. Assim,

$$
\operatorname{DNL}=\frac{7}{10}-1=-0{,}3\,\mathrm{LSB}.
$$

Esse degrau é menor que o ideal, mas continua positivo. Portanto, isoladamente,
não viola a monotonicidade.

:::

Outras fontes de erro incluem deriva térmica, ruído da referência, resistência
de saída, sensibilidade à carga e interferências entre alimentação digital e
analógica. **Resolução nominal** não é sinônimo de **exatidão**: um DAC de
muitos bits pode apresentar erros maiores que um LSB.

## 18.7. Tempo de acomodação {#sec-dac-settling-time}

A saída de um DAC não muda instantaneamente quando o código é atualizado. O
**tempo de acomodação** (_settling time_) é o intervalo necessário para que a
saída, após uma transição especificada, entre e permaneça dentro de uma banda
de erro definida em torno do valor final. O valor informado depende da
amplitude do degrau, da banda de tolerância, da carga e das condições de
ensaio.

<!-- prettier-ignore -->
::: figure Resposta transitória e banda de acomodação de um DAC {#fig-dac-settling-response}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]
\draw[->] (0.5,0.5)--(8.6,0.5) node[right] {$t$};
\draw[->] (0.5,0.5)--(0.5,4.7) node[above] {$V_{\mathrm{out}}$};
\draw[dashed] (0.7,3.6)--(8.2,3.6);
\draw[densely dotted] (0.7,3.85)--(8.2,3.85);
\draw[densely dotted] (0.7,3.35)--(8.2,3.35);
\node[right] at (8.2,3.6) {$V_f$};
\draw[thick] (0.8,1.0)--(1.8,1.0)
  .. controls (2.15,1.0) and (2.35,4.45) .. (3.15,4.05)
  .. controls (3.75,3.72) and (3.85,3.05) .. (4.45,3.37)
  .. controls (5.0,3.55) and (5.2,3.7) .. (5.8,3.6)
  --(7.8,3.6);
\draw[dashed] (1.8,0.6)--(1.8,4.4);
\draw[dashed] (5.8,0.6)--(5.8,3.2);
\draw[<->] (1.8,0.8)--(5.8,0.8);
\node[below] at (3.8,0.8) {$t_{\mathrm{settle}}$};
\end{tikzpicture}
```

:::

A {@ref fig-dac-settling-response} é esquemática: a banda pontilhada representa
a tolerância escolhida. O sinal pode ultrapassar o valor final e oscilar antes
de estabilizar. O instante de acomodação não deve ser confundido com o primeiro
cruzamento do valor final.

Além da acomodação, podem surgir **glitches**, impulsos transitórios provocados
por diferenças de tempo na comutação de bits ou chaves. Uma transição como
`0111` para `1000` pode ser especialmente crítica em arquiteturas binárias,
pois vários bits mudam simultaneamente. A energia do glitch, e não apenas sua
amplitude máxima, pode ser importante para aplicações de alta velocidade.

Em sistemas de controle e geração de formas de onda, a taxa de atualização
admissível depende do tempo de acomodação exigido e da precisão necessária em
cada amostra.

## 18.8. Conversão por modulação de largura de pulso {#sec-dac-pwm-conversion}

A **modulação por largura de pulso** (_pulse-width modulation_, PWM) alterna um
sinal entre dois níveis, modificando a fração do período em que permanece no
nível alto. Para níveis $V_L$ e $V_H$ e ciclo de trabalho $d=t_H/T$, a média
ideal é

$$
\overline V=dV_H+(1-d)V_L. \tag{18.10}
$$

Quando $V_L=0$,

$$
\overline V=dV_H. \tag{18.11}
$$

Um filtro passa-baixas pode atenuar as componentes alternadas e aproximar a
tensão de saída do valor médio. Entretanto, a saída filtrada apresenta
compromisso entre **ondulação residual** (_ripple_) e **tempo de resposta**:
filtragem mais intensa reduz a ondulação, mas geralmente torna mais lenta a
mudança entre valores médios.

<!-- prettier-ignore -->
::: figure Conversão PWM em tensão média por filtragem {#fig-dac-pwm-filter}

```tikz
\begin{tikzpicture}[scale=1.8,transform shape]
\draw[thick] (0.6,1.0) rectangle (3.0,2.8);
\node at (1.8,2.15) {PWM};
\node at (1.8,1.55) {$d$};
\draw[->] (3.0,1.9)--(4.2,1.9);
\draw[thick] (4.2,1.0) rectangle (7.1,2.8);
\node[align=center] at (5.65,1.9) {Filtro\\passa-baixas};
\draw[->] (7.1,1.9)--(9.0,1.9);
\node[above] at (8.05,1.9) {$\overline V$};
\end{tikzpicture}
```

:::

A {@ref fig-dac-pwm-filter} apresenta o processamento funcional. O filtro pode
ser passivo ou ativo, e seu dimensionamento depende da frequência PWM, da
largura de banda desejada, da impedância da carga e da ondulação admissível.

::: example PWM com saída de cinco volts {#ex-dac-pwm-average}

Um sinal PWM ideal alterna entre $0$ e $5\,\mathrm V$ com ciclo de trabalho de
$30\%$. Sua tensão média é

$$
\overline V=0{,}30\times5=1{,}5\,\mathrm V.
$$

Esse resultado é a média do sinal antes da filtragem e o valor de referência
esperado após filtragem adequada. Não garante, por si só, que a saída
instantânea filtrada permaneça em $1{,}5\,\mathrm V$.

:::

PWM não substitui universalmente um DAC dedicado. É vantajoso quando já existe
um temporizador digital e a aplicação tolera filtragem e latência. Para sinais
de alta fidelidade, alta largura de banda ou baixa ondulação, outras
arquiteturas podem ser mais adequadas.

## 18.9. Aplicações e critérios de seleção {#sec-dac-applications}

DACs aparecem em geração de sinais de teste, instrumentação, controle de
atuadores, síntese de áudio, ajustes programáveis de referência, fontes
controladas e sistemas de comunicação. A escolha deve começar pela natureza do
sinal requerido: faixa, polaridade, precisão, velocidade, carga e condições
ambientais.

<!-- prettier-ignore -->
::: table Critérios para especificar um conversor digital-analógico {#tbl-dac-selection .full-width}

| Critério              | Questão de projeto                                                      |
| --------------------- | ----------------------------------------------------------------------- |
| Resolução nominal     | Quantos níveis de saída são necessários?                                |
| Exatidão estática     | Quais limites de offset, ganho, INL e DNL são admissíveis?              |
| Monotonicidade        | A saída pode retroceder quando o código aumenta?                        |
| Faixa e referência    | Qual amplitude, polaridade e estabilidade são necessárias?              |
| Tempo de acomodação   | Em quanto tempo a saída deve atingir a tolerância especificada?         |
| Glitch e ruído        | Quais transientes e componentes espúrias são toleráveis?                |
| Interface digital     | O controle será paralelo, SPI, I²C ou outra interface?                  |
| Saída analógica       | A carga exige buffer, conversão corrente-tensão ou estágio de potência? |
| Consumo e alimentação | Quais são os limites térmicos e energéticos?                            |

:::

### Integração com o sistema digital

A palavra enviada ao DAC pode representar uma amostra de sinal, uma referência
de controle ou uma configuração estática. A conversão digital-analógica não
realiza automaticamente amplificação de potência: um DAC pode exigir estágio de
saída específico para acionar uma carga. Também é necessário considerar a
integridade da referência e o retorno de corrente, sobretudo quando circuitos
digitais rápidos compartilham a placa com sinais analógicos de pequena
amplitude.

Em aplicações de geração de formas de onda, a saída em degraus contém
componentes espectrais associadas à atualização discreta. Pode ser necessário
um **filtro de reconstrução**, cuja escolha depende da frequência de
atualização e da banda útil. A discussão sistemática da amostragem e de suas
consequências será desenvolvida no capítulo seguinte, dedicado aos conversores
analógico-digitais.

## Síntese do capítulo {#sec-dac-summary}

Um DAC associa códigos digitais a níveis analógicos. Para uma transferência
unipolar ideal com escala binária, o tamanho de um LSB é $V_{\mathrm{ref}}/2^N$
e o código máximo produz $V_{\mathrm{ref}}-1\,\mathrm{LSB}$. Resistores
ponderados, escadas R–2R e fontes de corrente são diferentes maneiras de
realizar os pesos dos bits. A resolução nominal descreve a quantidade de
níveis, mas não determina a exatidão: offset, ganho, INL, DNL, ruído e deriva
caracterizam desvios adicionais. O tempo de acomodação e os glitches descrevem
limitações dinâmicas. PWM filtrado pode fornecer uma saída analógica
aproximada, desde que se aceite o compromisso entre ondulação e velocidade de
resposta.

## Exercícios propostos {#sec-dac-exercises}

1. Um DAC ideal de $10$ bits usa $V_{\mathrm{ref}}=5\,\mathrm V$. Determine o
   número de códigos e a resolução em milivolts.
2. Para o DAC do exercício anterior, calcule a saída ideal correspondente a
   $D=512$.
3. Qual é a maior tensão de saída ideal de um DAC de $8$ bits com referência de
   $3{,}3\,\mathrm V$ na convenção da Equação (18.2)?
4. Explique por que o código máximo não alcança a referência nessa convenção.
5. Em um DAC de $4$ bits por resistores ponderados, qual é a razão entre o
   maior e o menor resistor ideal?
6. Qual é a principal vantagem construtiva da rede R–2R em relação aos
   resistores ponderados?
7. Um DAC tem degrau ideal de $2\,\mathrm{mV}$ e incremento medido de
   $2{,}5\,\mathrm{mV}$. Determine a DNL desse degrau.
8. Um incremento medido é $-0{,}2\,\mathrm{mV}$ para um degrau ideal de
   $1\,\mathrm{mV}$. Calcule a DNL e indique se a monotonicidade foi violada.
9. Diferencie erro de offset e erro de ganho.
10. Por que valores de INL obtidos por ajuste de melhor reta podem diferir dos
    obtidos pela reta dos extremos?
11. Explique a diferença entre tempo de acomodação e tempo de primeira passagem
    pelo valor final.
12. Por que a transição binária `0111` para `1000` pode gerar glitches
    relevantes?
13. Um PWM alterna entre $0$ e $12\,\mathrm V$ com ciclo de trabalho de $25\%$.
    Calcule a tensão média ideal.
14. Explique o compromisso entre ondulação residual e tempo de resposta em um
    filtro de saída PWM.
15. Compare DAC por corrente e DAC por escada R–2R quanto ao princípio de
    funcionamento.
16. Cite quatro parâmetros que devem ser especificados antes da escolha de um
    DAC para instrumentação.

## Respostas e soluções selecionadas {#sec-dac-solutions}

1. $2^{10}=1024$ códigos; $\Delta V=5/1024\approx4{,}883\,\mathrm{mV}$.
2. $V_{\mathrm{out}}=5(512/1024)=2{,}5\,\mathrm V$.
3. $V_{\max}=3{,}3(255/256)\approx3{,}2871\,\mathrm V$.
4. Porque há $2^N$ códigos numerados de $0$ a $2^N-1$, e o degrau é definido
   como $V_{\mathrm{ref}}/2^N$.
5. $2^{4-1}=8$.
6. Emprega somente duas resistências nominais, $R$ e $2R$, facilitando o
   casamento de razões.
7. $\mathrm{DNL}=2{,}5/2-1=+0{,}25\,\mathrm{LSB}$.
8. $\mathrm{DNL}=-0{,}2/1-1=-1{,}2\,\mathrm{LSB}$; há um degrau negativo e,
   portanto, violação da monotonicidade.
9. Offset desloca a origem da transferência; ganho altera sua inclinação após a
   compensação do offset.
10. Porque as duas definições usam linhas de referência distintas.
11. A acomodação exige entrada e permanência dentro de uma banda de tolerância;
    a primeira passagem não garante permanência.
12. Vários bits mudam simultaneamente e diferenças nos tempos de comutação
    podem produzir correntes ou tensões transitórias.
13. $\overline V=0{,}25\times12=3\,\mathrm V$.
14. Filtragem mais intensa reduz componentes periódicas residuais, mas tende a
    aumentar a latência e a lentidão de resposta.
15. O primeiro comuta e soma fontes de corrente; o segundo realiza ponderações
    binárias por uma rede resistiva repetitiva.
16. Exemplos: resolução, INL, DNL, tempo de acomodação, referência, ruído,
    interface, carga e alimentação.

## Referências bibliográficas {#sec-dac-references}

1. HOROWITZ, Paul; HILL, Winfield. **The Art of Electronics**. 3. ed. Cambridge
   University Press, 2015.
2. SEDRA, Adel S.; SMITH, Kenneth C. **Microelectronic Circuits**. Oxford
   University Press.
3. FRANCO, Sergio. **Design with Operational Amplifiers and Analog Integrated
   Circuits**. McGraw-Hill.
4. KESTER, Walt (org.). **The Data Conversion Handbook**. Newnes, 2005.
5. ANALOG DEVICES; TEXAS INSTRUMENTS. **Folhas de dados e notas de aplicação
   sobre conversores digital-analógico**. Consultar documentação específica dos
   dispositivos empregados.

---

[Voltar ao sumário](README.md) ·
[Capítulo 17 — Circuitos de temporização e geração de pulsos](timing-and-pulse-generation-circuits.md)
·
[Capítulo 19 — Conversores analógico-digitais](analog-to-digital-converters.md)
