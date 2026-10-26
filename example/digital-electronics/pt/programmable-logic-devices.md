# 20. Dispositivos lógicos programáveis {#chapter-20}

A implementação de uma função digital não exige, necessariamente, a montagem de
um circuito distinto para cada aplicação. Em um **dispositivo lógico
programável**, a estrutura física contém recursos que podem ser configurados
para realizar diferentes funções combinacionais e sequenciais. Essa
possibilidade aproxima o projeto lógico da descrição formal do comportamento
desejado, sem eliminar as restrições elétricas, temporais e físicas do
hardware.

Este capítulo apresenta a evolução conceitual das matrizes lógicas programáveis
até os dispositivos complexos e as FPGAs. O objetivo é compreender **o que é
configurado**, **como a lógica é realizada** e **quais critérios orientam a
escolha da tecnologia**. As linguagens de descrição de hardware e os
procedimentos detalhados de síntese e verificação serão aprofundados nos
capítulos seguintes.

## 20.1. Conceito de lógica programável

Na **lógica fixa**, a função implementada é determinada pelas interconexões e
pelos componentes do circuito. Na **lógica programável**, o fabricante fornece
uma estrutura com recursos configuráveis; o projetista determina, por meio de
dados de programação, quais funções e conexões serão utilizadas.

A programação pode alterar conexões de uma matriz, conteúdos de memória,
funções de tabelas de consulta (_look-up tables_, LUTs), habilitações de
registradores e rotas entre blocos. O termo _programação_ não implica
necessariamente a execução sequencial de instruções por um processador: em
muitos casos, os dados de configuração definem um **circuito que opera em
paralelo**.

É importante distinguir três propriedades:

- **Configurabilidade:** possibilidade de definir a função do dispositivo.
- **Reprogramabilidade:** possibilidade de modificar uma configuração já
  aplicada.
- **Volatilidade da configuração:** necessidade, ou não, de carregar novamente
  os dados após a interrupção da alimentação.

Essas propriedades dependem da tecnologia. Há dispositivos com conexões
programáveis uma única vez, dispositivos não voláteis reprogramáveis e FPGAs
baseadas em SRAM, cuja configuração precisa ser carregada após a energização.

<!-- prettier-ignore -->
::: figure Da especificação lógica à configuração de um dispositivo {#fig-pld-design-flow}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[thick] (0,0) rectangle (3.1,1.5);
\draw[thick] (5.2,0) rectangle (8.3,1.5);
\draw[thick] (10.4,0) rectangle (13.5,1.5);
\node[align=center] at (1.55,0.75) {Especificação\\funcional};
\node[align=center] at (6.75,0.75) {Mapeamento\\e configuração};
\node[align=center] at (11.95,0.75) {Circuito\\configurado};
\draw[->] (3.1,0.75)--(5.2,0.75);
\draw[->] (8.3,0.75)--(10.4,0.75);
\end{tikzpicture}
```

:::

A {@ref fig-pld-design-flow} resume a passagem da especificação para a
implementação. Trata-se de um fluxo conceitual: a configuração real pode exigir
síntese, posicionamento, roteamento, análise temporal e geração de um arquivo
próprio do dispositivo.

## 20.2. ROM como implementação de funções lógicas

Uma memória somente de leitura (**ROM**) pode implementar funções
combinacionais usando as variáveis de entrada como endereço e os valores da
função como dados armazenados. Para uma função com $n$ entradas e $m$ saídas,
uma organização direta requer $2^n$ palavras de $m$ bits, isto é,

$$
C_{\mathrm{ROM}}=m\,2^n\ \text{bits}.
$$

Cada endereço corresponde a uma linha da tabela-verdade. A ROM fornece
simultaneamente os valores das $m$ funções de saída associados à combinação de
entrada.

<!-- prettier-ignore -->
::: table Exemplo de conteúdo de ROM para duas funções de três entradas {#tab-pld-rom-truth .full-width}

| $A$ | $B$ | $C$ | Endereço $ABC$ | $F=A\oplus B\oplus C$ | $G=AB+AC+BC$ |
| :-: | :-: | :-: | :------------: | :-------------------: | :----------: |
|  0  |  0  |  0  |      000       |           0           |      0       |
|  0  |  0  |  1  |      001       |           1           |      0       |
|  0  |  1  |  0  |      010       |           1           |      0       |
|  0  |  1  |  1  |      011       |           0           |      1       |
|  1  |  0  |  0  |      100       |           1           |      0       |
|  1  |  0  |  1  |      101       |           0           |      1       |
|  1  |  1  |  0  |      110       |           0           |      1       |
|  1  |  1  |  1  |      111       |           1           |      1       |

:::

No exemplo da {@ref tab-pld-rom-truth}, uma ROM de $8\times2$ bits implementa a
paridade ímpar $F$ e a função majoritária $G$. A solução é sistemática, mas a
capacidade necessária cresce exponencialmente com o número de entradas, mesmo
quando a função possui uma expressão algébrica simples.

<!-- prettier-ignore -->
::: figure Implementação combinacional por memória ROM {#fig-pld-rom-architecture}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]
\draw[thick] (3,0) rectangle (6.5,2.4);
\node[align=center] at (4.75,1.5) {ROM\\$2^n\times m$};
\draw[->] (0,1.2)--(3,1.2);
\node[above] at (1.5,1.2) {$n$ entradas};
\draw[->] (6.5,1.2)--(9.5,1.2);
\node[above] at (8,1.2) {$m$ saídas};
\end{tikzpicture}
```

:::

A {@ref fig-pld-rom-architecture} representa a ROM como uma rede combinacional.
O tempo de acesso da memória integra o atraso do caminho lógico, e a
implementação física pode utilizar decodificação e matrizes internas diferentes
do modelo abstrato.

::: didactic Exemplo 1 — Capacidade de uma ROM Uma ROM que implementa quatro
funções de seis variáveis precisa, no mapeamento direto, de $2^6=64$ endereços
e quatro bits por endereço. Sua capacidade lógica é $64\times4=256$ bits. Esse
valor não inclui circuitos de decodificação e periféricos. :::

## 20.3. PLA e PAL

Uma **matriz lógica programável** (_programmable logic array_, PLA) é
organizada, no modelo clássico, em dois planos: um plano AND programável, que
forma termos-produto, e um plano OR também programável, que combina esses
termos. A arquitetura é especialmente adequada a funções expressas como **soma
de produtos**.

Uma **PAL** (_programmable array logic_) clássica emprega um plano AND
programável e um plano OR de conexões fixas. Essa restrição reduz a
flexibilidade em comparação com uma PLA inteiramente programável, mas pode
simplificar a implementação e tornar os atrasos mais previsíveis. As
capacidades reais variam conforme a família e o fabricante.

Considere as funções

$$
F_1=\overline{A}B+AC,\qquad F_2=\overline{A}B+BC.
$$

O termo $\overline{A}B$ aparece nas duas expressões. Em uma PLA, ele pode ser
gerado uma única vez e conectado às duas saídas, desde que os recursos
disponíveis permitam o compartilhamento.

<!-- prettier-ignore -->
::: figure Estrutura conceitual de uma PLA com dois planos programáveis {#fig-pld-pla-planes}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\draw[thick] (2.6,0) rectangle (5.6,2);
\draw[thick] (8.2,0) rectangle (11.2,2);
\node[align=center] at (4.1,1) {Plano AND\\programável};
\node[align=center] at (9.7,1) {Plano OR\\programável};
\draw[->] (-0.2,1)--(2.6,1);
\node[above] at (1.2,1) {Entradas};
\draw[->] (5.6,1)--(8.2,1);
\node[above] at (6.9,1) {Produtos};
\draw[->] (11.2,1)--(14,1);
\node[above] at (12.6,1) {Saídas};
\end{tikzpicture}
```

:::

A {@ref fig-pld-pla-planes} é funcional, não uma representação das posições
individuais dos pontos programáveis. A distribuição dos termos entre as saídas
pode impor limites de quantidade, compartilhamento e atraso.

<!-- prettier-ignore -->
::: table Comparação das estruturas ROM, PLA e PAL clássicas {#tab-pld-rom-pla-pal .full-width}

| Estrutura | Organização lógica                               | Principal característica                         |
| --------- | ------------------------------------------------ | ------------------------------------------------ |
| ROM       | Decodificação de endereços e valores armazenados | Implementação direta de tabelas-verdade          |
| PLA       | Planos AND e OR programáveis                     | Compartilhamento flexível de termos-produto      |
| PAL       | Plano AND programável e OR fixo                  | Menor flexibilidade, com estrutura mais restrita |

:::

## 20.4. PLDs e CPLDs

**PLD** (_programmable logic device_) é uma denominação abrangente para
dispositivos lógicos programáveis. Historicamente, inclui soluções simples
baseadas em matrizes de produtos e dispositivos de maior integração. O termo
**CPLD** (_complex programmable logic device_) identifica uma classe de
dispositivos que reúne múltiplos blocos lógicos programáveis e uma rede de
interconexão.

Uma organização comum de CPLD contém **macrocélulas**, que combinam lógica de
termos-produto, opções de polaridade, registradores e recursos de entrada e
saída. A configuração de muitos CPLDs é não volátil, embora isso não seja uma
propriedade universal de toda implementação comercial.

<!-- prettier-ignore -->
::: figure Organização funcional simplificada de um CPLD {#fig-pld-cpld-architecture}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (0,0) rectangle (11.4,5.3);
\draw[thick] (0.8,3.1) rectangle (3.8,4.5);
\draw[thick] (7.6,3.1) rectangle (10.6,4.5);
\draw[thick] (0.8,0.8) rectangle (3.8,2.2);
\draw[thick] (7.6,0.8) rectangle (10.6,2.2);
\node at (2.3,3.8) {Bloco lógico 1};
\node at (9.1,3.8) {Bloco lógico 2};
\node at (2.3,1.5) {Bloco lógico 3};
\node at (9.1,1.5) {Bloco lógico 4};
\draw[thick] (4.6,1.5) rectangle (6.8,3.8);
\node[align=center] at (5.7,2.65) {Rede de\\interconexão};
\draw[<->] (3.8,3.8)--(4.6,3.3);
\draw[<->] (6.8,3.3)--(7.6,3.8);
\draw[<->] (3.8,1.5)--(4.6,2.0);
\draw[<->] (6.8,2.0)--(7.6,1.5);
\end{tikzpicture}
```

:::

A {@ref fig-pld-cpld-architecture} representa apenas a organização geral. A
arquitetura de macrocélulas, os recursos de roteamento e os blocos de entrada e
saída dependem do dispositivo escolhido.

CPLDs são frequentemente adequados a decodificação de endereços, lógica de
controle, sequenciamento simples e integração de funções que, de outro modo,
exigiriam vários circuitos discretos. Não se deve, porém, supor que todos os
caminhos apresentem atraso idêntico: o desempenho depende do percurso efetivo e
da arquitetura.

## 20.5. Arquitetura básica de FPGAs

Uma **FPGA** (_field-programmable gate array_) contém uma quantidade
significativa de recursos lógicos configuráveis distribuídos espacialmente e
conectados por redes de roteamento programáveis. Diferentemente de uma matriz
de produtos típica, sua lógica combinacional costuma ser implementada em LUTs,
frequentemente associadas a registradores.

A organização exata varia entre famílias, mas uma FPGA moderna pode incluir
blocos lógicos, recursos de memória, blocos aritméticos especializados,
circuitos de relógio, interfaces de entrada e saída e, em determinados modelos,
processadores e transceptores de alta velocidade.

<!-- prettier-ignore -->
::: figure Visão conceitual dos recursos de uma FPGA {#fig-pld-fpga-fabric}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[thick] (0,0) rectangle (10.5,6.2);
\node at (5.25,5.75) {Malha de lógica e interconexão};
\foreach \x in {0.8,3.1,5.4,7.7} {
  \foreach \y in {0.9,2.5,4.1} {
    \draw[thick] (\x,\y) rectangle ++(1.5,1.1);
    \node at (\x+0.75,\y+0.55) {CLB};
  }
}
\end{tikzpicture}
```

:::

A {@ref fig-pld-fpga-fabric} ilustra uma malha regular de blocos lógicos
configuráveis (CLBs). Os recursos especializados e as redes reais de roteamento
foram omitidos para não confundir o modelo introdutório com a planta física de
um fabricante.

A configuração de uma FPGA baseada em SRAM é armazenada em células voláteis;
portanto, após a energização, normalmente é necessário carregar um arquivo de
configuração a partir de uma fonte externa ou integrada ao sistema. Existem
também FPGAs com outras tecnologias de configuração, inclusive não voláteis.

## 20.6. Blocos lógicos configuráveis

Uma **LUT de $k$ entradas** pode implementar qualquer função booleana de até
$k$ variáveis, armazenando os $2^k$ resultados da tabela-verdade. As entradas
selecionam uma posição da tabela, cujo bit constitui o valor da função.

$$
N_{\mathrm{LUT}}=2^k.
$$

Por exemplo, uma LUT de quatro entradas possui $16$ valores de configuração
para a função combinacional, desconsiderando os bits adicionais que possam
existir para controle e roteamento.

::: didactic Exemplo 2 — Programação de uma LUT de três entradas Para
implementar $F(A,B,C)=A\oplus B\oplus C$, atribuímos às posições endereçadas
por $ABC=000,001,010,011,100,101,110,111$ os valores $0,1,1,0,1,0,0,1$,
respectivamente. A ordem física desses bits em um arquivo de configuração
depende da convenção do dispositivo. :::

<!-- prettier-ignore -->
::: figure Bloco lógico simplificado com LUT, registrador e seleção de saída {#fig-pld-lut-register}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\draw[thick] (2,1.8) rectangle (4.8,3.8);
\node at (3.4,2.8) {LUT};
\draw[thick] (7.1,0.2) rectangle (9.9,2.2);
\node[align=center] at (8.5,1.2) {Registrador\\D};
\draw[thick] (11.7,1.7) rectangle (14.1,3.5);
\node at (12.9,2.6) {MUX};
\draw[->] (0,2.8)--(2,2.8);
\node[above] at (1,2.8) {$k$ entradas};
\draw[->] (4.8,2.8)--(11.7,2.8);
\draw[->] (6.0,2.8)--(6.0,1.2)--(7.1,1.2);
\draw[->] (9.9,1.2)--(10.8,1.2)--(10.8,2.1)--(11.7,2.1);
\draw[->] (14.1,2.6)--(16,2.6);
\node[above] at (15,2.6) {Saída};
\draw[->] (8.5,-1.0)--(8.5,0.2);
\node[right] at (8.7,-0.55) {$CLK$};
\end{tikzpicture}
```

:::

A {@ref fig-pld-lut-register} mostra que uma saída pode ser obtida diretamente
da LUT ou por um registrador. A seleção efetiva, as opções de habilitação,
reinicialização e as conexões internas dependem do bloco lógico disponível. A
capacidade de uma LUT não equivale à capacidade total do CLB, que pode agrupar
várias LUTs e registradores.

## 20.7. Redes de interconexão programáveis

A lógica configurável só se torna um circuito útil quando seus blocos podem ser
conectados. As **redes de interconexão programáveis** permitem escolher
caminhos entre saídas, entradas, registradores e recursos especializados. Elas
utilizam elementos de comutação e segmentos de fios de diferentes alcances,
conforme a arquitetura.

O roteamento afeta o atraso, o consumo dinâmico e a disponibilidade de
recursos. Dois circuitos logicamente equivalentes podem apresentar
temporizações diferentes se forem posicionados e roteados de maneiras
distintas.

Uma aproximação para o atraso de um caminho é

$$
t_{\mathrm{caminho}}\approx\sum_i t_{\mathrm{bloco},i}+\sum_j t_{\mathrm{interconexão},j},
$$

na qual os termos representam atrasos de elementos lógicos e de conexões. Em
projetos reais, esses atrasos dependem das cargas, das condições de operação e
dos modelos de temporização da tecnologia.

**Posicionamento** (_placement_) é a atribuição de funções a recursos físicos;
**roteamento** (_routing_) é a seleção das interconexões entre eles. A análise
de temporização verifica se os caminhos resultantes satisfazem as restrições do
projeto.

## 20.8. Recursos de memória e processamento

FPGAs frequentemente oferecem **memórias internas em blocos**, **memória
distribuída** construída a partir de recursos lógicos e **blocos de
processamento digital de sinais** (DSP). Esses recursos reduzem a necessidade
de implementar tudo com LUTs e registradores comuns.

Memórias em bloco podem servir a buffers, tabelas, filas e armazenamento
temporário. Os blocos DSP podem incluir multiplicadores, somadores e
acumuladores, úteis em filtros digitais, processamento de sinais e operações
aritméticas intensivas. Alguns dispositivos oferecem ainda interfaces
dedicadas, gerenciadores de relógio e processadores integrados.

<!-- prettier-ignore -->
::: table Exemplos de recursos de uma FPGA e suas funções {#tab-pld-fpga-resources .full-width}

| Recurso          | Função típica                      | Exemplo de aplicação            |
| ---------------- | ---------------------------------- | ------------------------------- |
| LUTs             | Lógica combinacional               | Decodificadores e controle      |
| Registradores    | Armazenamento de estado            | Máquinas de estados e pipelines |
| Memória em bloco | Armazenamento local                | Buffers e filas                 |
| Blocos DSP       | Operações aritméticas              | Multiplicação e filtragem       |
| Redes de relógio | Distribuição controlada de relógio | Circuitos síncronos             |
| Blocos de E/S    | Interface elétrica e lógica        | Comunicação com periféricos     |

:::

A existência, a quantidade e a precisão desses recursos são características
específicas do dispositivo. Uma FPGA não substitui automaticamente memórias
externas, processadores ou circuitos analógicos quando a aplicação exige
capacidades que ultrapassam seus recursos.

## 20.9. Comparação entre lógica discreta, CPLDs e FPGAs

A escolha de uma implementação não depende apenas da quantidade de portas
equivalentes. Devem ser considerados a complexidade funcional, o número de
entradas e saídas, a frequência, o consumo, a inicialização, a disponibilidade,
as ferramentas de projeto e o custo total.

<!-- prettier-ignore -->
::: table Critérios qualitativos de escolha da tecnologia {#tab-pld-technology-comparison .full-width}

| Critério           | Lógica discreta                | CPLD                        | FPGA                                                   |
| ------------------ | ------------------------------ | --------------------------- | ------------------------------------------------------ |
| Organização        | Componentes e conexões fixas   | Macrocélulas e interconexão | LUTs, registradores e recursos especializados          |
| Flexibilidade      | Alteração física do circuito   | Configuração lógica         | Configuração lógica ampla                              |
| Complexidade usual | Pequena                        | Pequena a intermediária     | Intermediária a elevada                                |
| Inicialização      | Sem arquivo de configuração    | Depende da tecnologia       | Depende da tecnologia                                  |
| Ferramentas        | Esquema e análise de circuitos | Ferramentas específicas     | Síntese, posicionamento, roteamento e análise temporal |
| Aplicações típicas | Funções simples e interfaces   | Controle e lógica auxiliar  | Processamento paralelo e sistemas digitais complexos   |

:::

As categorias da {@ref tab-pld-technology-comparison} descrevem tendências, não
limites absolutos. Uma função pequena pode ser mais econômica em lógica
discreta; um CPLD pode oferecer inicialização conveniente para controle; e uma
FPGA pode concentrar muitos blocos operando simultaneamente. Os custos e o
consumo devem ser avaliados em condições concretas, com base nas folhas de
dados.

::: didactic Exemplo 3 — Seleção preliminar de dispositivo Um sistema precisa
decodificar endereços, gerar sinais de habilitação e coordenar algumas
sequências de controle. Um CPLD pode ser uma opção a avaliar. Se a mesma
aplicação exigir múltiplos filtros digitais, buffers internos e processamento
paralelo de alta taxa, uma FPGA com recursos DSP e memória poderá ser mais
apropriada. A decisão definitiva exige verificar temporização, interfaces,
consumo, custo e disponibilidade. :::

## 20.10. Aplicações de dispositivos programáveis

Dispositivos lógicos programáveis aparecem em controle industrial,
instrumentação, telecomunicações, sistemas embarcados, aquisição de dados,
processamento de imagens, interfaces digitais e prototipagem de circuitos
integrados.

Entre as aplicações frequentes estão a substituição de múltiplas portas e
decodificadores discretos, a implementação de máquinas de estados, a criação de
interfaces temporizadas, o processamento paralelo de amostras e a integração de
controladores com caminhos de dados.

Uma FPGA permite que diferentes partes de um circuito operem simultaneamente.
Entretanto, **paralelismo de hardware não garante desempenho ilimitado**:
frequência máxima, atrasos de interconexão, largura de banda de memória,
sincronização entre domínios de relógio e consumo podem limitar o sistema.

O projeto deve considerar ainda a integridade dos sinais, os níveis elétricos
de entrada e saída, a sequência de energização e configuração, a confiabilidade
da inicialização e a possibilidade de atualização em campo.

O próximo capítulo introduz as **linguagens de descrição de hardware (HDLs)**,
que permitem expressar funções e estruturas digitais de maneira adequada à
simulação e à síntese.

## Síntese do capítulo

A lógica programável permite realizar funções digitais por configuração de
recursos físicos. ROMs representam funções por tabelas-verdade; PLAs e PALs
utilizam matrizes de termos-produto; CPLDs integram blocos lógicos e
interconexões; FPGAs combinam LUTs, registradores, roteamento e recursos
especializados. A escolha entre essas tecnologias exige avaliar não apenas a
função lógica, mas também temporização, interfaces, consumo, inicialização,
ferramentas e custo.

## Exercícios

1. Explique a diferença entre configuração de hardware e execução de um
   programa por um processador. Dê um exemplo de cada caso.
2. Determine a capacidade lógica mínima de uma ROM que implementa cinco funções
   de sete variáveis, supondo mapeamento direto da tabela-verdade.
3. Construa a tabela-verdade de $F(A,B,C)=AB+\overline{A}C$ e indique os oito
   bits de dados que uma ROM deve fornecer para os endereços de $000$ a $111$.
4. Compare os planos programáveis de uma PLA e de uma PAL clássica. Como o
   compartilhamento de termos-produto pode afetar uma implementação?
5. Para $F_1=AB+\overline{A}C$ e $F_2=AB+BC$, identifique os termos-produto
   distintos necessários a uma PLA que compartilhe o termo comum.
6. Uma LUT possui seis entradas. Quantas posições de tabela-verdade ela precisa
   para representar qualquer função booleana dessas entradas?
7. Explique por que duas implementações da mesma função em uma FPGA podem
   apresentar atrasos diferentes.
8. Distinga os papéis de LUTs, registradores, memórias em bloco e blocos DSP.
9. Compare uma solução com portas discretas, uma com CPLD e uma com FPGA para
   um controlador com poucas entradas e saídas. Quais informações faltam para
   escolher definitivamente?
10. Discuta por que a volatilidade da configuração é importante na
    inicialização de um sistema embarcado.
11. Proponha a divisão funcional de um sistema de aquisição de dados
    implementado em FPGA, identificando interfaces, buffers, processamento e
    controle.
12. Explique por que a presença de muitos recursos lógicos não elimina a
    necessidade de análise de temporização.

## Referências bibliográficas

- BROWN, Stephen; VRANESIC, Zvonko. _Fundamentals of Digital Logic with Verilog
  Design_. McGraw-Hill.
- MANO, M. Morris; CILETTI, Michael D. _Digital Design_. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. _Digital Design and Computer
  Architecture_. Morgan Kaufmann.
- Documentação técnica dos fabricantes dos dispositivos selecionados,
  especialmente manuais de arquitetura, guias de temporização e folhas de
  dados.
