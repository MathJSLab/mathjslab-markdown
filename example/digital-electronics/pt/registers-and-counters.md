# 11. Registradores e contadores {#chapter-11}

Os *flip-flops* apresentados no Capítulo 9 armazenam um bit de informação. Quando vários elementos de memória são organizados sob sinais de controle comuns, formam **registradores**, capazes de guardar e transferir palavras binárias. Quando o próximo estado é calculado de modo a percorrer uma sequência determinada, formam **contadores**. Esses blocos estão presentes em processadores, interfaces, instrumentos de medição, temporizadores e sistemas de comunicação.

Este capítulo relaciona a descrição funcional dos circuitos à sua implementação sequencial. Os exemplos consideram, salvo indicação contrária, *flip-flops* D acionados pela borda de subida de um relógio comum. A análise temporal desenvolvida no Capítulo 10 continua válida: as expressões lógicas descrevem o comportamento pretendido, mas a implementação deve satisfazer as restrições de temporização.

## 11.1. Registradores paralelos {#sec-registers-parallel}

Um **registrador paralelo de $n$ bits** contém $n$ elementos de armazenamento, cada um responsável por um bit da palavra. Todos recebem a mesma borda de relógio, de modo que a palavra de entrada $D_{n-1:0}$ seja capturada como uma unidade lógica.

Para um registrador sem habilitação, a equação de próximo estado é:

$$
Q_i^{+}=D_i,\qquad 0\le i<n.\tag{11.1}
$$

O sobrescrito $+$ designa o estado após a próxima borda ativa. Com uma entrada de habilitação $E$, a atualização passa a ser:

$$
Q_i^{+}=ED_i+\overline E Q_i.\tag{11.2}
$$

A expressão (11.2) representa um multiplexador por bit: quando $E=1$, captura-se $D_i$; quando $E=0$, conserva-se $Q_i$. Um sinal de limpeza síncrona, por sua vez, só atua na borda ativa, ao contrário de uma entrada assíncrona de *reset*.

::: table Operação de um registrador paralelo com habilitação {#tbl-registers-parallel-enable .full-width}

| Borda ativa de $CLK$ | $E$ | Próximo estado $Q^{+}$ | Operação |
| --- | --- | --- | --- |
| Não | X | $Q$ | Estado preservado |
| Sim | 0 | $Q$ | Retenção |
| Sim | 1 | $D$ | Carga paralela |

:::

<!-- prettier-ignore -->
::: figure Organização funcional de um registrador paralelo de quatro bits {#fig-registers-parallel-block}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[thick] (2,1.3) rectangle (6.5,4.2);
\node at (4.25,3.6) {Registrador de 4 bits};
\draw[->] (0.5,3.0)--(2,3.0);
\node[above] at (1.2,3.0) {$D_{3:0}$};
\draw[->] (6.5,3.0)--(8.1,3.0);
\node[above] at (7.3,3.0) {$Q_{3:0}$};
\draw[->] (3.0,0.3)--(3.0,1.3);
\node[below] at (3.0,0.3) {$CLK$};
\draw[->] (5.5,0.3)--(5.5,1.3);
\node[below] at (5.5,0.3) {$E$};
\end{tikzpicture}
```

:::

O bloco da {@ref fig-registers-parallel-block} representa um barramento de quatro bits. Cada seta de dados corresponde a quatro condutores lógicos, não a um único bit.

::: example Carga e retenção de uma palavra {#ex-registers-parallel-load}

Considere $Q=0101_2$. Na primeira borda ativa, $D=1100_2$ e $E=0$: o estado permanece $0101_2$. Na borda seguinte, com $D=1100_2$ e $E=1$, o registrador passa a armazenar $1100_2$. Se $D$ mudar depois da borda, $Q$ permanece constante até uma nova atualização habilitada.

:::

## 11.2. Registradores de deslocamento {#sec-registers-shift}

Um **registrador de deslocamento** transfere os bits entre estágios sucessivos a cada borda ativa. Pode ser usado para produzir atrasos discretos, converter formatos de transmissão ou implementar pequenas filas de dados.

Para quatro estágios $Q_3,Q_2,Q_1,Q_0$, com deslocamento em direção ao bit mais significativo e entrada serial $SI$, definimos:

$$
\begin{aligned}
Q_3^{+}&=Q_2,\\
Q_2^{+}&=Q_1,\\
Q_1^{+}&=Q_0,\\
Q_0^{+}&=SI.
\end{aligned}\tag{11.3}
$$

A escolha da direção é uma convenção de projeto: deve-se sempre explicitar qual estágio recebe o novo bit e de qual estágio se obtém a saída serial.

<!-- prettier-ignore -->
::: figure Registrador de deslocamento de quatro estágios {#fig-registers-shift-chain}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\foreach \x/\bit in {1/Q_0,3.2/Q_1,5.4/Q_2,7.6/Q_3}{
  \draw[thick] (\x,1.4) rectangle ++(1.3,1.3);
  \node at (\x+0.65,2.05) {$\bit$};
}
\draw[->] (0.1,2.05)--(1,2.05);
\node[above] at (0.55,2.05) {$SI$};
\draw[->] (2.3,2.05)--(3.2,2.05);
\draw[->] (4.5,2.05)--(5.4,2.05);
\draw[->] (6.7,2.05)--(7.6,2.05);
\draw[->] (8.9,2.05)--(9.8,2.05);
\node[above] at (9.35,2.05) {$SO$};
\draw (0.6,0.45)--(8.25,0.45);
\node[left] at (0.6,0.45) {$CLK$};
\foreach \x in {1.65,3.85,6.05,8.25}{
  \draw[->] (\x,0.45)--(\x,1.4);
}
\end{tikzpicture}
```

:::

Na {@ref fig-registers-shift-chain}, a linha inferior distribui o mesmo relógio aos quatro estágios. As setas horizontais representam o fluxo de dados; as conexões de relógio não são entradas de dados.

::: table Exemplo de deslocamento com entrada serial {#tbl-registers-shift-sequence .full-width}

| Borda | $SI$ | $Q_3Q_2Q_1Q_0$ após a borda |
| --- | --- | --- |
| Estado inicial | — | 0000 |
| 1 | 1 | 0001 |
| 2 | 0 | 0010 |
| 3 | 1 | 0101 |
| 4 | 1 | 1011 |

:::

## 11.3. Conversão série-paralelo e paralelo-série {#sec-registers-serial-parallel}

Na **conversão série-paralelo (SIPO)**, os bits chegam um por vez e são acumulados em um registrador. Após $n$ bordas, uma palavra de $n$ bits pode ser lida simultaneamente. A ordem dos bits recebidos e a direção do deslocamento determinam a posição de cada bit na palavra final.

Na **conversão paralelo-série (PISO)**, uma palavra é carregada simultaneamente e transmitida por deslocamentos sucessivos. É necessário distinguir o comando de carga do comando de deslocamento para não sobrescrever a palavra antes de transmiti-la.

::: table Modos usuais de entrada e saída de registradores {#tbl-registers-io-modes .full-width}

| Sigla | Entrada | Saída | Aplicação típica |
| --- | --- | --- | --- |
| SISO | Serial | Serial | Atraso de bits |
| SIPO | Serial | Paralela | Recepção de palavras |
| PISO | Paralela | Serial | Transmissão de palavras |
| PIPO | Paralela | Paralela | Armazenamento temporário |

:::

::: example Recepção serial de quatro bits {#ex-registers-sipo}

Um SIPO inicialmente zerado recebe, nessa ordem, $1,0,1,1$, com o novo bit entrando em $Q_0$ e deslocamento em direção a $Q_3$. Após quatro bordas, a palavra armazenada é $1011_2$. A interpretação dessa palavra pressupõe que o primeiro bit recebido se torna o mais significativo.

:::

Em interfaces reais, o deslocamento de bits deve ser coordenado com o protocolo de comunicação: borda de amostragem, ordem de transmissão, habilitação e delimitação de palavra.

## 11.4. Registradores bidirecionais {#sec-registers-bidirectional}

Um **registrador bidirecional** desloca os dados para qualquer um dos dois sentidos, segundo sinais de controle. Registradores universais frequentemente oferecem ainda retenção e carga paralela.

Para um registrador de quatro bits, pode-se adotar a seguinte convenção: deslocar à direita significa $Q_3^{+}=SR$ e $Q_i^{+}=Q_{i+1}$ para $i<3$; deslocar à esquerda significa $Q_0^{+}=SL$ e $Q_i^{+}=Q_{i-1}$ para $i>0$.

::: table Modos de operação de um registrador universal {#tbl-registers-universal-modes .full-width}

| $M_1$ | $M_0$ | Operação | Próximo estado $Q_3^{+}Q_2^{+}Q_1^{+}Q_0^{+}$ |
| --- | --- | --- | --- |
| 0 | 0 | Reter | $Q_3Q_2Q_1Q_0$ |
| 0 | 1 | Deslocar à direita | $SR\,Q_3Q_2Q_1$ |
| 1 | 0 | Deslocar à esquerda | $Q_2Q_1Q_0\,SL$ |
| 1 | 1 | Carga paralela | $D_3D_2D_1D_0$ |

:::

Os sinais $SR$ e $SL$ são entradas seriais distintas. As quatro operações podem ser implementadas com multiplexadores que selecionam a entrada de cada *flip-flop* D. O controle deve permanecer estável durante a janela de amostragem.

## 11.5. Contadores assíncronos {#sec-registers-asynchronous-counters}

Um **contador** é um circuito sequencial cujos estados percorrem uma sequência prescrita. Em um **contador assíncrono**, ou *ripple counter*, a saída de um estágio é usada como evento de relógio do estágio seguinte. As mudanças, portanto, não ocorrem simultaneamente: propagam-se em cascata.

Um contador binário de $n$ bits possui, idealmente, $2^n$ estados distintos. Em um contador crescente, a sequência natural é:

$$
0,1,2,\ldots,2^n-1,0,\ldots\tag{11.4}
$$

::: table Sequência de um contador binário de três bits {#tbl-registers-binary-count .full-width}

| Contagem decimal | $Q_2$ | $Q_1$ | $Q_0$ |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 1 |
| 2 | 0 | 1 | 0 |
| 3 | 0 | 1 | 1 |
| 4 | 1 | 0 | 0 |
| 5 | 1 | 0 | 1 |
| 6 | 1 | 1 | 0 |
| 7 | 1 | 1 | 1 |

:::

Como cada estágio pode alterar o seguinte após seu próprio atraso de propagação, transições como $011\to100$ podem atravessar estados transitórios intermediários. Por esse motivo, saídas de contadores assíncronos não devem ser tratadas automaticamente como um barramento estável durante a transição.

## 11.6. Contadores síncronos {#sec-registers-synchronous-counters}

Em um **contador síncrono**, todos os *flip-flops* recebem o mesmo relógio. Uma rede combinacional calcula os próximos estados a partir do valor atual. Para um contador binário crescente de três bits com *flip-flops* D:

$$
\begin{aligned}
D_0&=\overline{Q_0},\\
D_1&=Q_1\oplus Q_0,\\
D_2&=Q_2\oplus(Q_1Q_0).
\end{aligned}\tag{11.5}
$$

A primeira expressão alterna o bit menos significativo a cada borda. A segunda alterna $Q_1$ quando $Q_0=1$; a terceira alterna $Q_2$ quando ambos os bits inferiores são 1.

<!-- prettier-ignore -->
::: figure Organização funcional de um contador síncrono {#fig-registers-synchronous-counter}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (1,2.4) rectangle (4.3,4.0);
\node[align=center] at (2.65,3.2) {Lógica de\\próximo estado};
\draw[thick] (6.0,2.4) rectangle (9.0,4.0);
\node[align=center] at (7.5,3.2) {Registrador\\de estado};
\draw[->] (4.3,3.2)--(6.0,3.2);
\node[above] at (5.15,3.2) {$D_{2:0}$};
\draw[->] (9.0,3.2)--(10.4,3.2);
\node[above] at (9.7,3.2) {$Q_{2:0}$};
\draw[->] (9.7,3.2)--(9.7,1.2)--(2.65,1.2)--(2.65,2.4);
\draw[->] (7.5,1.55)--(7.5,2.4);
\node[right] at (7.65,1.8) {$CLK$};
\end{tikzpicture}
```

:::

Na {@ref fig-registers-synchronous-counter}, o barramento $Q_{2:0}$ retorna à lógica combinacional, que calcula $D_{2:0}$. O relógio atua apenas sobre o registrador de estado.

::: example Próximo estado de um contador síncrono {#ex-registers-sync-next}

Se $Q_2Q_1Q_0=011$, então $D_0=0$, $D_1=0$ e $D_2=1$. Na borda seguinte, o estado passa a $100$, como esperado para a contagem de três para quatro.

:::

Embora as saídas sejam atualizadas em resposta à mesma borda, elas podem apresentar pequenas diferenças de atraso de relógio até $Q$. Portanto, a ausência de *ripple* não implica transições perfeitamente simultâneas em termos físicos.

## 11.7. Contadores de módulo arbitrário {#sec-registers-modulo-counters}

O **módulo** $M$ de um contador é o número de estados distintos percorridos antes de repetir a sequência. O número mínimo de bits de estado para um contador binário de módulo $M$ é:

$$
n=\left\lceil\log_2 M\right\rceil.\tag{11.6}
$$

Um contador de módulo 10, por exemplo, necessita de quatro bits, mas utiliza apenas os estados $0000$ a $1001$. Os seis estados restantes exigem tratamento definido pelo projeto, especialmente quando se deseja recuperação após inicialização incorreta ou perturbação.

Para um contador síncrono crescente, uma regra de próximo estado pode ser escrita como:

$$
Q^{+}=
\begin{cases}
0,&Q=M-1,\\
Q+1,&0\le Q<M-1.
\end{cases}\tag{11.7}
$$

A expressão não especifica o comportamento para $Q\ge M$. Uma implementação robusta pode redirecionar esses estados para zero, embora outras estratégias sejam possíveis.

::: example Contador síncrono módulo 6 {#ex-registers-modulo-six}

Um contador de módulo 6 percorre $000,001,010,011,100,101$ e retorna a $000$. Três *flip-flops* são suficientes, pois $2^2<6\le2^3$. Os estados $110$ e $111$ podem ser definidos como transições para $000$ na borda seguinte, assegurando recuperação em um ciclo.

:::

A implementação de contadores truncados por decodificação assíncrona de estados exige cuidado: atrasos e *hazards* podem produzir pulsos de limpeza indevidos. Quando possível, a transição de retorno síncrona é mais previsível.

## 11.8. Contadores em anel e Johnson {#sec-registers-ring-johnson}

Um **contador em anel** é um registrador de deslocamento em que a saída do último estágio retorna diretamente à entrada do primeiro. Com uma única posição em nível alto e $n$ estágios, a sequência ideal possui $n$ estados.

Um **contador Johnson**, ou anel torcido, realimenta o complemento da saída do último estágio. Com $n$ estágios, pode percorrer até $2n$ estados distintos, desde que seja inicializado em uma sequência válida.

::: table Sequências ilustrativas para quatro estágios {#tbl-registers-ring-johnson .full-width}

| Passo | Anel ($Q_3Q_2Q_1Q_0$) | Johnson ($Q_3Q_2Q_1Q_0$) |
| --- | --- | --- |
| 0 | 0001 | 0000 |
| 1 | 0010 | 0001 |
| 2 | 0100 | 0011 |
| 3 | 1000 | 0111 |
| 4 | 0001 | 1111 |
| 5 | — | 1110 |
| 6 | — | 1100 |
| 7 | — | 1000 |
| 8 | — | 0000 |

:::

Na sequência Johnson apresentada, a cada borda os bits deslocam-se em direção a $Q_3$ e a nova entrada em $Q_0$ recebe $\overline{Q_3}$. Para o contador em anel, a entrada em $Q_0$ recebe $Q_3$.

Esses contadores são úteis para geração de fases e decodificação simples, mas exigem atenção à inicialização. Um anel de quatro bits iniciado em $0000$, por exemplo, permanece nesse estado e não entra espontaneamente na sequência de um único bit alto.

## 11.9. Divisores de frequência {#sec-registers-frequency-dividers}

Um *flip-flop* configurado para alternar a saída a cada borda ativa produz uma frequência de saída igual à metade da frequência de entrada, desde que o sinal seja periódico e respeite os requisitos do dispositivo:

$$
f_{out}=\frac{f_{clk}}{2}.\tag{11.8}
$$

Uma cadeia ideal de $n$ estágios divisores por dois permite obter:

$$
f_{out}=\frac{f_{clk}}{2^n}.\tag{11.9}
$$

Para um contador de módulo $M$ que gera um evento de saída uma vez por ciclo completo de contagem, a **frequência de repetição dos eventos** é:

$$
f_{\mathrm{evento}}=\frac{f_{clk}}{M}.\tag{11.10}
$$

Essa última relação não assegura que o sinal de saída seja uma onda quadrada com razão cíclica de 50%. É necessário distinguir frequência de eventos, frequência de transições e frequência de um sinal periódico completo.

::: example Divisão de frequência por 16 {#ex-registers-divide-sixteen}

Com $f_{clk}=8\,\mathrm{MHz}$, quatro estágios binários produzem uma saída periódica de $8\,\mathrm{MHz}/16=500\,\mathrm{kHz}$ no bit mais significativo, após o estabelecimento da contagem. Em projetos síncronos, é geralmente preferível usar sinais de habilitação derivados do contador em vez de distribuir indiscriminadamente saídas combinacionais como novos relógios.

:::

## 11.10. Aplicações de contadores e registradores {#sec-registers-applications}

Registradores e contadores aparecem em temporizadores, divisores de frequência, máquinas de estados, aquisição de dados, comunicação serial, endereçamento de memórias e controle de periféricos. A escolha da arquitetura depende da capacidade, da taxa de atualização, das restrições de temporização e do comportamento exigido em estados excepcionais.

::: table Seleção de arquiteturas para aplicações usuais {#tbl-registers-applications .full-width}

| Necessidade | Bloco adequado | Observação de projeto |
| --- | --- | --- |
| Reter uma palavra por vários ciclos | Registrador paralelo habilitado | Definir prioridade de carga e limpeza |
| Receber bits seriais | SIPO | Especificar ordem dos bits |
| Transmitir uma palavra | PISO | Coordenar carga e deslocamento |
| Gerar sequência binária | Contador síncrono | Verificar atrasos do caminho crítico |
| Dividir frequência por potência de dois | Contador binário | Preferir habilitação quando apropriado |
| Gerar fases sucessivas | Contador em anel ou Johnson | Garantir inicialização válida |
| Contar eventos externos | Contador com sincronização de eventos | Evitar perdas e metastabilidade |

:::

O exemplo a seguir descreve um contador síncrono de quatro bits com habilitação e *reset* síncrono, utilizando Verilog:

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
            q <= q + 4'd1;
    end
endmodule
```

O operador `<=` realiza uma atribuição não bloqueante, adequada para descrever atualização de estado em processos sensíveis a borda. O código utiliza aritmética modular de quatro bits: após $1111_2$, a contagem retorna a $0000_2$. A ausência de uma atribuição no caso `en=0` implica retenção do estado em uma descrição sequencial.

::: example Temporizador por contagem de ciclos {#ex-registers-timer}

Um sistema com relógio de $1\,\mathrm{MHz}$ deseja gerar um evento a cada $1\,\mathrm{ms}$. São necessários $1000$ períodos de relógio por evento. Um contador de módulo 1000 pode gerar um pulso de habilitação a cada 1000 bordas. Como $\lceil\log_2 1000\rceil=10$, são necessários ao menos dez bits para representar os estados de 0 a 999.

:::

## Síntese do capítulo {#sec-registers-summary}

Registradores armazenam e movimentam palavras binárias; contadores geram sequências de estados. O projeto exige especificar o próximo estado, a prioridade dos controles, a ordem dos bits e a forma de inicialização. Contadores síncronos evitam a propagação em cascata de bordas de relógio característica dos contadores assíncronos, mas continuam sujeitos a atrasos físicos. Contadores de módulo arbitrário, em anel e Johnson devem prever estados não utilizados e condições de recuperação. A seleção entre diferentes arquiteturas é, portanto, uma decisão funcional e temporal.

## Exercícios propostos {#sec-registers-exercises}

1. **Registrador paralelo:** um registrador de quatro bits contém $Q=1010$. Na próxima borda, $D=0111$ e $E=0$. Qual será o novo estado? E se $E=1$?
2. **Deslocamento:** partindo de $Q_3Q_2Q_1Q_0=0000$, aplique a sequência serial $1,1,0,1$ segundo a equação (11.3). Determine os quatro estados sucessivos.
3. **SIPO:** explique como a direção de deslocamento e a ordem de transmissão influenciam a interpretação da palavra recebida.
4. **Registrador universal:** para $Q=1010$, determine o estado após deslocar à direita com $SR=1$ e após deslocar à esquerda com $SL=0$, considerando operações independentes.
5. **Contador assíncrono:** por que uma transição binária de $0111$ para $1000$ pode apresentar valores intermediários transitórios?
6. **Contador síncrono:** use a equação (11.5) para determinar o próximo estado de $Q_2Q_1Q_0=101$.
7. **Módulo arbitrário:** determine o número mínimo de bits para um contador de módulo 12 e indique quantos estados binários não são utilizados.
8. **Anel e Johnson:** quantos estados úteis apresentam, respectivamente, um contador em anel de cinco estágios com um único bit alto e um contador Johnson de cinco estágios em sequência válida?
9. **Divisor de frequência:** um contador binário de cinco bits recebe um relógio de $3{,}2\,\mathrm{MHz}$. Qual é a frequência do bit mais significativo?
10. **Temporizador:** com relógio de $50\,\mathrm{MHz}$, quantos ciclos são necessários para gerar um evento a cada $20\,\mathrm{\mu s}$? Qual é a largura mínima do contador?

## Respostas e soluções selecionadas {#sec-registers-solutions}

1. Com $E=0$, $Q^{+}=1010$; com $E=1$, $Q^{+}=0111$.
2. Os estados são $0001$, $0011$, $0110$ e $1101$.
3. A primeira amostra pode ocupar o bit mais ou menos significativo ao final da recepção, conforme a direção e a convenção adotadas. O transmissor e o receptor precisam concordar.
4. Deslocamento à direita: $1101$; deslocamento à esquerda: $0100$.
5. Os estágios não comutam ao mesmo tempo, porque a borda de cada estágio depende da transição do estágio anterior e de seu atraso.
6. $D_0=0$, $D_1=1$ e $D_2=1$; portanto, $Q^{+}=110$.
7. $\lceil\log_2 12\rceil=4$ bits; $16-12=4$ estados não utilizados.
8. Anel: 5 estados; Johnson: 10 estados, desde que inicializado na sequência apropriada.
9. $3{,}2\,\mathrm{MHz}/32=100\,\mathrm{kHz}$.
10. $50\times10^6\cdot20\times10^{-6}=1000$ ciclos; $\lceil\log_2 1000\rceil=10$ bits.

## Referências bibliográficas {#sec-registers-references}

1. MANO, M. Morris; CILETTI, Michael D. **Digital Design**. 5. ed. Pearson, 2013.
2. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed. Pearson, 2005.
3. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer Architecture**. 2. ed. Morgan Kaufmann, 2012.
4. FLOYD, Thomas L. **Digital Fundamentals**. 11. ed. Pearson, 2015.

---

[Voltar ao sumário](README.md) · [Capítulo 10 — Temporização e confiabilidade de circuitos sequenciais](sequential-timing-and-reliability.md) · [Capítulo 12 — Máquinas de estados finitos](finite-state-machines.md)
