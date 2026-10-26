# 14. Famílias lógicas e circuitos integrados digitais {#chapter-14}

O capítulo anterior mostrou como transistores bipolares e MOSFETs podem
realizar o chaveamento eletrônico. Entretanto, o projeto de um sistema digital
exige mais do que obter uma porta lógica isolada: é necessário assegurar que a
saída de um circuito seja reconhecida pela entrada do seguinte, que os atrasos
sejam compatíveis com a temporização do sistema e que o consumo e a dissipação
permaneçam dentro dos limites especificados.

Uma **família lógica** reúne circuitos que compartilham uma tecnologia e
determinadas características de alimentação, níveis de tensão, capacidade de
acionamento e desempenho. As denominações TTL, CMOS, ECL e BiCMOS identificam
princípios tecnológicos; já os prefixos comerciais de séries específicas
identificam conjuntos de características que precisam ser consultadas nas
respectivas folhas de dados. Não se deve presumir compatibilidade elétrica
apenas porque dois componentes implementam a mesma função booleana.

Este capítulo compara as famílias clássicas e introduz critérios quantitativos
de seleção e interligação de circuitos integrados digitais.

## 14.1. Parâmetros elétricos das famílias lógicas {#sec-logic-families-parameters}

Um circuito lógico real opera dentro de uma faixa de alimentação, temperatura e
carga. Sua folha de dados distingue **valores recomendados de operação** de
**limites absolutos máximos**: estes últimos não constituem condições normais
de funcionamento.

Os parâmetros fundamentais incluem tensões de entrada reconhecidas como baixa e
alta ($V_{IL}$ e $V_{IH}$), tensões de saída garantidas ($V_{OL}$ e $V_{OH}$),
correntes de entrada e saída, corrente de alimentação, atrasos de propagação,
tempos de subida e descida e capacitância de entrada. As letras $L$ e $H$
indicam os estados baixo e alto; índices adicionais como $\min$ e $\max$
identificam os extremos garantidos.

<!-- prettier-ignore -->
::: table Parâmetros elétricos de uma interface digital {#tbl-logic-families-parameters .full-width}

| Símbolo              | Significado                                    | Uso no projeto                        |
| -------------------- | ---------------------------------------------- | ------------------------------------- |
| $V_{IL,\max}$        | Maior tensão garantidamente reconhecida como 0 | Verificação do nível baixo            |
| $V_{IH,\min}$        | Menor tensão garantidamente reconhecida como 1 | Verificação do nível alto             |
| $V_{OL,\max}$        | Maior tensão de saída garantida em 0           | Margem de ruído baixa                 |
| $V_{OH,\min}$        | Menor tensão de saída garantida em 1           | Margem de ruído alta                  |
| $I_{IL}$, $I_{IH}$   | Correntes de entrada nos níveis especificados  | Carga estática da saída anterior      |
| $I_{OL}$, $I_{OH}$   | Correntes de saída nas condições especificadas | Capacidade de acionamento             |
| $t_{PLH}$, $t_{PHL}$ | Atrasos de propagação para transições de saída | Temporização                          |
| $C_{in}$             | Capacitância de entrada                        | Carga dinâmica e integridade do sinal |

:::

Os atrasos de propagação são definidos entre pontos de referência das formas de
onda e dependem da tensão de alimentação, da temperatura, da carga e da direção
da transição. Por isso, comparar números de catálogo sem comparar suas
condições de medição pode levar a conclusões incorretas.

## 14.2. Níveis de tensão e margens de ruído {#sec-logic-families-noise-margins}

Entre os níveis garantidos de entrada existe uma **região não especificada**,
na qual o fabricante não assegura a interpretação lógica. Essa região não deve
ser confundida com um terceiro nível lógico válido.

As margens de ruído estáticas, para uma saída que aciona uma entrada
compatível, são definidas por:

$$
NM_L=V_{IL,\max}-V_{OL,\max}. \tag{14.1}
$$

$$
NM_H=V_{OH,\min}-V_{IH,\min}. \tag{14.2}
$$

Valores positivos indicam uma separação estática entre os níveis garantidos,
mas não dispensam a análise de ruído transitório, deslocamentos de referência e
reflexões.

<!-- prettier-ignore -->
::: figure Faixas garantidas de tensão de saída e de entrada e margens de ruído {#fig-logic-families-noise-margins}

```tikz
\begin{tikzpicture}[scale=1.35,transform shape]
\draw[->,thick] (0,0)--(0,5.3) node[above] {$V$};
\draw[thick] (1,0) rectangle (2.5,1.0);
\draw[thick] (1,4.0) rectangle (2.5,5.0);
\node at (1.75,0.5) {Saída 0};
\node at (1.75,4.5) {Saída 1};
\draw[thick] (5,0) rectangle (6.5,1.8);
\draw[thick] (5,3.2) rectangle (6.5,5.0);
\node at (5.75,0.7) {Entrada 0};
\node at (5.75,4.3) {Entrada 1};
\draw[dashed] (0.2,1.0)--(3.2,1.0) node[right] {$V_{OL,\max}$};
\draw[dashed] (4.0,1.8)--(7.3,1.8) node[right] {$V_{IL,\max}$};
\draw[dashed] (4.0,3.2)--(7.3,3.2) node[right] {$V_{IH,\min}$};
\draw[dashed] (0.2,4.0)--(3.2,4.0) node[right] {$V_{OH,\min}$};
\node at (1.75,-0.4) {Saída};
\node at (5.75,-0.4) {Entrada};
\end{tikzpicture}
```

:::

A {@ref fig-logic-families-noise-margins} é conceitual: os níveis foram
desenhados em posições ilustrativas, sem representar uma família específica. As
duas colunas devem ser interpretadas com as equações (14.1) e (14.2), não como
uma escala numérica comum de valores garantidos.

::: example Cálculo das margens de ruído {#ex-logic-families-noise-margin}

Considere uma interface hipotética com $V_{OL,\max}=0{,}4\,\mathrm{V}$,
$V_{IL,\max}=0{,}8\,\mathrm{V}$, $V_{IH,\min}=2{,}0\,\mathrm{V}$ e
$V_{OH,\min}=2{,}4\,\mathrm{V}$. As margens são $NM_L=0{,}4\,\mathrm{V}$ e
$NM_H=0{,}4\,\mathrm{V}$. Esses valores são ilustrativos e não substituem a
especificação de um componente real.

:::

## 14.3. _Fan-in_, _fan-out_ e capacidade de acionamento {#sec-logic-families-fan-in-fan-out}

O **fan-in** é o número de entradas lógicas de uma porta. Aumentá-lo pode
alterar o número de transistores, a capacitância de entrada e a complexidade
interna, mas não determina sozinho o atraso de um circuito integrado.

O **fan-out** expressa quantas entradas podem ser acionadas por uma saída sob
condições definidas. Para cargas estáticas iguais e especificações de corrente
compatíveis, uma estimativa conservadora é:

$$
FO_L=\left\lfloor\frac{|I_{OL,\max}|}{|I_{IL}|}\right\rfloor,\qquad
FO_H=\left\lfloor\frac{|I_{OH,\max}|}{|I_{IH}|}\right\rfloor. \tag{14.3}
$$

$$
FO_{\mathrm{est}}=\min(FO_L,FO_H). \tag{14.4}
$$

Os módulos evitam ambiguidades de convenção de sinais. Os valores usados devem
corresponder às condições garantidas do fabricante. Em CMOS, correntes
estáticas de entrada pequenas podem produzir estimativas elevadas de fan-out
estático, enquanto a **capacitância total** e o tempo de transição impõem
limites dinâmicos muito mais restritivos.

::: example Capacidade de acionamento estática {#ex-logic-families-fan-out}

Uma saída hipotética pode absorver $8\,\mathrm{mA}$ em nível baixo e fornecer
$4\,\mathrm{mA}$ em nível alto. Cada entrada consome, em módulo,
$0{,}4\,\mathrm{mA}$ em nível baixo e $0{,}1\,\mathrm{mA}$ em nível alto.
Assim, $FO_L=20$, $FO_H=40$ e $FO_{\mathrm{est}}=20$. A conexão de vinte
entradas ainda exigiria verificar a carga capacitiva e os tempos de transição.

:::

## 14.4. Família TTL e Schottky TTL {#sec-logic-families-ttl}

A família **TTL** (_transistor–transistor logic_) emprega transistores
bipolares para realizar funções lógicas. Em suas arquiteturas clássicas, a
estrutura de entrada e os estágios de saída são projetados para distinguir
níveis de tensão e fornecer capacidade de acionamento. Variantes históricas
incluem TTL padrão, de baixa potência, de alta velocidade e séries Schottky.

O uso de diodos ou estruturas **Schottky** em determinados nós reduz a entrada
profunda em saturação de transistores, diminuindo o armazenamento de carga e
melhorando a velocidade de comutação. Esse ganho depende da arquitetura
específica e não significa que toda porta TTL Schottky tenha menor potência que
qualquer outra família.

Um estágio de saída **totem-pole** utiliza dispositivos ativos para elevar e
reduzir o nível da saída. Esse tipo de saída não deve ser ligado diretamente em
paralelo com outra saída push-pull, pois comandos opostos podem produzir
correntes excessivas.

<!-- prettier-ignore -->
::: table Comparação qualitativa de arquiteturas TTL {#tbl-logic-families-ttl .full-width}

| Arquitetura                  | Característica predominante                           | Observação                                   |
| ---------------------------- | ----------------------------------------------------- | -------------------------------------------- |
| TTL bipolar clássica         | Portas com transistores bipolares                     | Correntes de entrada e saída assimétricas    |
| TTL Schottky                 | Redução de armazenamento de carga em nós selecionados | Favorece comutação rápida                    |
| TTL de baixa potência        | Compromisso entre consumo e atraso                    | Verificar série e condições de carga         |
| TTL com saída coletor aberto | Necessita resistor de elevação externo                | Permite determinadas conexões compartilhadas |

:::

## 14.5. Famílias NMOS e pseudo-NMOS {#sec-logic-families-nmos}

Circuitos **NMOS** podem implementar funções lógicas com transistores de canal
n e uma carga que eleva a saída. Em arquiteturas clássicas, a carga pode ser
resistiva ou realizada por transistor. Na lógica **pseudo-NMOS**, um PMOS
mantido conduzindo funciona como carga ativa, enquanto a rede NMOS determina a
condição de descarga.

<!-- prettier-ignore -->
::: figure Estrutura conceitual de um inversor pseudo-NMOS {#fig-logic-families-pseudo-nmos}

```tikz
\begin{circuitikz}[scale=1.4,transform shape]
\node[pmos] (MP) at (4,5) {};
\node[nmos] (MN) at (4,2) {};
\draw (MP.S) -- ++(0,0.8) node[vcc] {$V_{DD}$};
\draw (MN.S) -- ++(0,-0.8) node[ground] {};
\draw (MP.D) -- (MN.D);
\draw (4,3.5) -- (6.4,3.5);
\node[right] at (6.4,3.5) {$V_{out}$};
\draw (MN.G) -- (1.5,2);
\node[left] at (1.5,2) {$V_{in}$};
\draw (MP.G) -- (2.6,5) -- (2.6,4.3) node[ground] {};
\node[right] at (MP) {$M_P$};
\node[right] at (MN) {$M_N$};
\end{circuitikz}
```

:::

Na {@ref fig-logic-families-pseudo-nmos}, a porta do PMOS permanece em
potencial baixo, mantendo-o ligado. Quando o NMOS conduz, há caminho estático
entre $V_{DD}$ e o terra. Portanto, diferentemente de um inversor CMOS
complementar ideal, o pseudo-NMOS pode dissipar potência estática significativa
no estado baixo de saída. As dimensões relativas dos transistores influenciam o
nível baixo obtido.

## 14.6. Tecnologia CMOS {#sec-logic-families-cmos}

A tecnologia **CMOS** (_complementary metal–oxide–semiconductor_) combina redes
de transistores PMOS e NMOS. Em uma porta estática complementar bem projetada,
a rede de elevação e a rede de redução implementam condições lógicas
complementares. Nos estados estáveis ideais, não existe caminho contínuo de
baixa resistência entre a alimentação e o terra.

O inversor CMOS estudado no Capítulo 13 é o exemplo mais simples. Uma porta
NAND de duas entradas pode ser construída com dois PMOS em paralelo na rede de
elevação e dois NMOS em série na rede de redução. A porta NOR utiliza o arranjo
dual: PMOS em série e NMOS em paralelo.

<!-- prettier-ignore -->
::: table Redes de transistores em portas CMOS estáticas {#tbl-logic-families-cmos-gates .full-width}

| Porta              | Rede de elevação (PMOS) | Rede de redução (NMOS) |
| ------------------ | ----------------------- | ---------------------- |
| NOT                | Um PMOS                 | Um NMOS                |
| NAND de 2 entradas | Dois PMOS em paralelo   | Dois NMOS em série     |
| NOR de 2 entradas  | Dois PMOS em série      | Dois NMOS em paralelo  |

:::

A tecnologia CMOS abrange muitas séries e tensões de alimentação. Um componente
CMOS de $3{,}3\,\mathrm{V}$ não deve ser considerado tolerante a sinais de
$5\,\mathrm{V}$ sem confirmação explícita da folha de dados. As entradas MOS
apresentam alta impedância estática, mas são sensíveis a cargas eletrostáticas
e não devem permanecer flutuantes em condições de uso não previstas.

## 14.7. Tecnologia BiCMOS {#sec-logic-families-bicmos}

A tecnologia **BiCMOS** integra dispositivos bipolares e MOSFETs no mesmo
processo de fabricação. Os MOSFETs podem realizar funções de controle com
elevada densidade de integração, enquanto transistores bipolares podem oferecer
características úteis em estágios de acionamento ou circuitos analógicos de
alta velocidade.

Não existe um único circuito BiCMOS universal. Sua vantagem depende da
aplicação, do processo de fabricação e da arquitetura. A combinação de
dispositivos também aumenta a complexidade tecnológica e pode não compensar em
produtos que priorizam custo e consumo muito baixos.

## 14.8. Família ECL {#sec-logic-families-ecl}

A família **ECL** (_emitter-coupled logic_) utiliza pares diferenciais
bipolares e evita, em arquiteturas clássicas, a saturação profunda dos
transistores. A comutação ocorre por redistribuição de corrente entre ramos,
com pequenas excursões de tensão. Essa abordagem favorece alta velocidade, mas
frequentemente exige corrente de polarização contínua.

A ECL histórica utiliza convenções de alimentação e níveis de tensão diferentes
dos encontrados em TTL e CMOS. Interfaces entre essas tecnologias requerem
análise dos níveis comuns de tensão, da polarização, da terminação e da
capacidade de acionamento. Não é correto ligar sinais ECL diretamente a
entradas CMOS apenas porque ambos representam 0 e 1.

## 14.9. Portas especiais, saídas de três estados e coletor/dreno aberto {#sec-logic-families-special-outputs}

Uma saída **push-pull** possui dispositivos ativos para estabelecer tanto o
nível alto quanto o baixo. Uma saída de **três estados** acrescenta a condição
de alta impedância, usualmente denotada por $Z$. Essa condição desconecta
eletricamente o estágio de saída dentro dos limites de fuga especificados; não
representa um terceiro valor lógico armazenado.

<!-- prettier-ignore -->
::: table Comportamento ideal de um buffer de três estados habilitado em nível alto {#tbl-logic-families-three-state .full-width}

| Habilitação $EN$ | Entrada $A$ | Saída $Y$ |
| ---------------- | ----------- | --------- |
| 0                | 0           | $Z$       |
| 0                | 1           | $Z$       |
| 1                | 0           | 0         |
| 1                | 1           | 1         |

:::

<!-- prettier-ignore -->
::: figure Barramento compartilhado com duas saídas de três estados {#fig-logic-families-three-state-bus}

```tikz
\begin{tikzpicture}[scale=1.5,transform shape]
\draw[thick] (1,3.2) rectangle (3.8,4.5);
\node at (2.4,3.85) {Buffer 1};
\draw[thick] (1,0.8) rectangle (3.8,2.1);
\node at (2.4,1.45) {Buffer 2};
\draw[->] (0,3.85)--(1,3.85) node[midway,above] {$A_1$};
\draw[->] (0,1.45)--(1,1.45) node[midway,above] {$A_2$};
\draw[->] (3.8,3.85)--(5.3,3.85)--(5.3,2.65);
\draw[->] (3.8,1.45)--(5.3,1.45)--(5.3,2.65);
\draw[thick] (5.3,1.1)--(5.3,4.2);
\draw[->] (5.3,2.65)--(7.0,2.65) node[right] {Barramento};
\draw[->] (2.4,5.3)--(2.4,4.5) node[midway,right] {$EN_1$};
\draw[->] (2.4,0.0)--(2.4,0.8) node[midway,right] {$EN_2$};
\end{tikzpicture}
```

:::

A {@ref fig-logic-families-three-state-bus} mostra a organização funcional de
duas saídas que compartilham um condutor. **No máximo uma saída push-pull deve
estar habilitada por vez**, salvo se o fabricante permitir explicitamente outra
configuração. O projeto precisa considerar os intervalos de desabilitação e
habilitação, pois uma breve sobreposição pode causar contenção de barramento.

Saídas de **coletor aberto** (BJT) ou **dreno aberto** (MOSFET) normalmente só
forçam o nível baixo; o nível alto é estabelecido por um resistor de _pull-up_
ou por outro circuito apropriado. Várias dessas saídas podem compartilhar um nó
para determinadas funções, desde que as tensões, correntes e limites de fuga
sejam respeitados.

<!-- prettier-ignore -->
::: figure Saída de dreno aberto com resistor de elevação {#fig-logic-families-open-drain}

```tikz
\begin{circuitikz}[scale=1.45,transform shape]
\node[nmos] (MN) at (4,2) {};
\draw (MN.S) -- ++(0,-0.9) node[ground] {};
\draw (MN.D) -- (4,3.6) to[R,l=$R_P$] (4,5.5) node[vcc] {$V_{DD}$};
\draw (4,3.6) -- (6.2,3.6);
\node[right] at (6.2,3.6) {$V_{out}$};
\draw (MN.G) -- (1.5,2);
\node[left] at (1.5,2) {$V_{in}$};
\node[right] at (MN) {$Q_1$};
\end{circuitikz}
```

:::

Para uma carga capacitiva equivalente $C_L$, o tempo de subida de uma saída de
dreno aberto pode ser aproximado por um circuito RC. Uma estimativa entre 10% e
90% da tensão final é:

$$
t_r\approx 2{,}2R_PC_L. \tag{14.5}
$$

A resistência menor acelera a subida, mas aumenta a corrente absorvida pelo
transistor quando a saída está baixa. Assim, o dimensionamento exige um
compromisso entre tempo de subida e corrente de condução.

## 14.10. Compatibilidade e interfaces entre famílias {#sec-logic-families-interfaces}

Uma interligação é válida somente se o dispositivo transmissor satisfizer
simultaneamente os requisitos de tensão, corrente, temporização e limites de
tensão aplicados ao receptor. Para os níveis estáticos, verificam-se:

$$
V_{OH,\min}^{(\mathrm{origem})}\ge V_{IH,\min}^{(\mathrm{destino})}, \tag{14.6}
$$

$$
V_{OL,\max}^{(\mathrm{origem})}\le V_{IL,\max}^{(\mathrm{destino})}. \tag{14.7}
$$

As desigualdades não bastam quando a tensão de saída pode ultrapassar os
limites absolutos de entrada do receptor. Também é necessário avaliar as
correntes de proteção, os circuitos parcialmente alimentados e a sequência de
energização.

<!-- prettier-ignore -->
::: example Interface de saída alta insuficiente {#ex-logic-families-level-interface}

Uma saída hipotética garante $V_{OH,\min}=2{,}4\,\mathrm{V}$, enquanto a
entrada de destino exige $V_{IH,\min}=0{,}7V_{DD}$, com $V_{DD}=5\,\mathrm{V}$.
O requisito é $3{,}5\,\mathrm{V}$; portanto, o nível alto **não é
garantidamente compatível**. A solução pode exigir um receptor com limiares
adequados ou um tradutor de níveis, conforme as folhas de dados.

:::

<!-- prettier-ignore -->
::: table Perguntas essenciais antes de conectar duas famílias {#tbl-logic-families-compatibility .full-width}

| Verificação          | Pergunta de projeto                                   |
| -------------------- | ----------------------------------------------------- |
| Alimentação          | As tensões recomendadas são respeitadas?              |
| Níveis lógicos       | $V_{OH}$ e $V_{OL}$ satisfazem $V_{IH}$ e $V_{IL}$?   |
| Limites de entrada   | A entrada suporta toda a excursão do sinal?           |
| Corrente             | A saída suporta a soma das cargas estáticas?          |
| Capacitância         | Os tempos de transição permanecem admissíveis?        |
| Sequenciamento       | Há risco de alimentação parasita com um CI desligado? |
| Integridade de sinal | Reflexões e ruído podem ultrapassar os limites?       |

:::

## 14.11. Potência estática, dinâmica e produto potência-atraso {#sec-logic-families-power-delay}

A potência média consumida por um circuito depende das correntes de alimentação
em repouso e durante as transições. Em primeira aproximação:

$$
P_{\mathrm{total}}\approx P_{\mathrm{est}}+P_{\mathrm{din}}+P_{\mathrm{curto}}. \tag{14.8}
$$

Para uma carga capacitiva efetiva em CMOS, sob a convenção de $\alpha$ como
número médio de transições $0\to1$ por ciclo:

$$
P_{\mathrm{din}}\approx \alpha C_LV_{DD}^{2}f. \tag{14.9}
$$

A potência estática inclui correntes de fuga e, em algumas famílias, correntes
de polarização ou de caminhos de condução permanentes. O termo de
curto-circuito representa a condução simultânea transitória dos dispositivos de
elevação e redução, quando aplicável.

Um indicador de compromisso entre consumo e velocidade é o **produto
potência-atraso**:

$$
PDP=P_{\mathrm{médio}}t_{pd}. \tag{14.10}
$$

Sua unidade é o joule. A interpretação como energia associada a uma operação
depende da definição de potência média, da frequência e da atividade de
comutação; portanto, não se deve equiparar automaticamente o PDP à energia real
de toda operação lógica.

::: example Estimativa de potência dinâmica {#ex-logic-families-dynamic-power}

Para $C_L=15\,\mathrm{pF}$, $V_{DD}=3{,}3\,\mathrm{V}$, $f=25\,\mathrm{MHz}$ e
$\alpha=0{,}2$, obtemos $P_{\mathrm{din}}\approx0{,}817\,\mathrm{mW}$. A
estimativa considera apenas a capacitância indicada, sem contabilizar outros
nós ou correntes internas.

:::

## 14.12. Seleção de componentes por folhas de dados {#sec-logic-families-datasheets}

A escolha de um circuito integrado começa pela função lógica e termina com a
verificação das condições físicas de uso. A mesma porta NAND pode existir em
encapsulamentos, tensões de alimentação, capacidades de acionamento e
tecnologias diferentes. Um código de série não deve ser interpretado
isoladamente: sufixos e variantes podem modificar o encapsulamento, a
temperatura de operação e outras características.

Uma sequência prática de seleção é: definir a função e o número de canais;
identificar a alimentação disponível; verificar níveis e tolerância de entrada;
calcular a carga; comparar atrasos e tempos de transição; estimar a potência;
verificar temperatura, encapsulamento e proteção; e conferir as condições de
teste dos parâmetros. Também se devem consultar notas de aplicação quando o
circuito opera com barramentos, cargas indutivas, sinais externos ou domínios
de alimentação distintos.

<!-- prettier-ignore -->
::: table Exemplo de ficha de verificação para escolha de um CI {#tbl-logic-families-datasheet-checklist .full-width}

| Item                                 | Registro a preencher                                |
| ------------------------------------ | --------------------------------------------------- |
| Função lógica e quantidade de portas | Tipo, canais e polaridade                           |
| Alimentação recomendada              | Faixa de $V_{CC}$ ou $V_{DD}$                       |
| Entradas                             | $V_{IL}$, $V_{IH}$, correntes e limites absolutos   |
| Saídas                               | $V_{OL}$, $V_{OH}$ e correntes garantidas           |
| Temporização                         | $t_{PLH}$, $t_{PHL}$, carga e condições de teste    |
| Consumo                              | Corrente estática e contribuição dinâmica           |
| Ambiente                             | Temperatura, dissipação e encapsulamento            |
| Integração                           | Desacoplamento, sinais não utilizados e energização |

:::

Uma especificação obtida em uma folha de dados é válida apenas dentro de suas
condições de ensaio e de operação. Valores típicos são úteis para estimativas,
mas, quando a confiabilidade exige garantia, o dimensionamento deve utilizar os
limites pertinentes.

## Síntese do capítulo {#sec-logic-families-summary}

As famílias lógicas transformam funções booleanas em interfaces elétricas
concretas. TTL e ECL exemplificam diferentes estratégias bipolares; NMOS e
pseudo-NMOS utilizam redes de transistores de canal n com cargas de elevação;
CMOS combina redes complementares para reduzir a dissipação estática ideal; e
BiCMOS integra características de tecnologias bipolares e MOS.

A compatibilidade entre circuitos não decorre de nomes de famílias ou da
igualdade de suas funções lógicas. Ela deve ser demonstrada por níveis
garantidos, correntes, cargas, atrasos e limites de operação. Saídas de três
estados e de coletor/dreno aberto ampliam as possibilidades de interligação,
mas exigem regras próprias de habilitação e dimensionamento. Esses conceitos
fundamentam o estudo de integridade de sinais e implementação física no
Capítulo 15.

## Exercícios propostos {#sec-logic-families-exercises}

1. Explique a diferença entre limite absoluto máximo e condição recomendada de
   operação de um circuito integrado.
2. Calcule $NM_L$ e $NM_H$ para $V_{OL,\max}=0{,}3\,\mathrm{V}$,
   $V_{IL,\max}=0{,}8\,\mathrm{V}$, $V_{IH,\min}=2{,}0\,\mathrm{V}$ e
   $V_{OH,\min}=2{,}7\,\mathrm{V}$.
3. Uma saída suporta $I_{OL}=12\,\mathrm{mA}$ e $|I_{OH}|=3\,\mathrm{mA}$. Cada
   entrada exige $|I_{IL}|=0{,}6\,\mathrm{mA}$ e $I_{IH}=0{,}15\,\mathrm{mA}$.
   Determine o fan-out estático estimado.
4. Por que a redução do armazenamento de carga pode melhorar a velocidade de
   uma porta TTL Schottky?
5. Compare o consumo estático ideal de um inversor CMOS complementar e de um
   inversor pseudo-NMOS quando a saída está baixa.
6. Descreva as redes de elevação e redução de uma porta NAND CMOS de duas
   entradas.
7. Qual é a função da condição de alta impedância em um barramento
   compartilhado? O que ocorre se duas saídas push-pull habilitadas impuserem
   níveis opostos?
8. Calcule o tempo de subida aproximado de uma saída de dreno aberto com
   $R_P=4{,}7\,\mathrm{k}\Omega$ e $C_L=100\,\mathrm{pF}$.
9. Verifique se uma saída com $V_{OH,\min}=2{,}6\,\mathrm{V}$ atende a uma
   entrada com $V_{IH,\min}=3{,}0\,\mathrm{V}$ e explique o resultado.
10. Estime $P_{\mathrm{din}}$ para $\alpha=0{,}1$, $C_L=20\,\mathrm{pF}$,
    $V_{DD}=5\,\mathrm{V}$ e $f=10\,\mathrm{MHz}$.

## Respostas e soluções selecionadas {#sec-logic-families-solutions}

1. Limites absolutos máximos definem condições que não devem ser excedidas; a
   operação funcional é especificada na faixa recomendada.
2. $NM_L=0{,}5\,\mathrm{V}$ e $NM_H=0{,}7\,\mathrm{V}$.
3. $FO_L=12/0{,}6=20$ e $FO_H=3/0{,}15=20$; portanto, $FO_{\mathrm{est}}=20$,
   sujeito à análise dinâmica.
4. A menor carga armazenada reduz o tempo necessário para desligar dispositivos
   anteriormente saturados.
5. No CMOS complementar ideal, um dos transistores está desligado em regime
   estável; no pseudo-NMOS, PMOS e NMOS podem conduzir simultaneamente,
   dissipando potência.
6. Dois PMOS em paralelo e dois NMOS em série.
7. A alta impedância permite compartilhar um condutor sem que a saída
   desabilitada imponha um nível. Saídas opostas simultaneamente habilitadas
   podem causar contenção e corrente excessiva.
8. $t_r\approx2{,}2(4{,}7\times10^3)(100\times10^{-12})\approx1{,}03\,\mu\mathrm{s}$.
9. Não. O nível alto mínimo garantido é inferior ao limiar alto mínimo exigido
   pelo receptor.
10. $P_{\mathrm{din}}=0{,}1\cdot20\,\mathrm{pF}\cdot(5\,\mathrm{V})^2\cdot10\,\mathrm{MHz}=0{,}5\,\mathrm{mW}$.

## Referências bibliográficas {#sec-logic-families-references}

1. WAKERLY, John F. **Digital Design: Principles and Practices**. 4. ed.
   Pearson, 2005.
2. RABAEY, Jan M.; CHANDRAKASAN, Anantha; NIKOLIĆ, Borivoje. **Digital
   Integrated Circuits: A Design Perspective**. 2. ed. Prentice Hall, 2003.
3. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer
   Architecture**. 2. ed. Morgan Kaufmann, 2012.
4. SEDRA, Adel S.; SMITH, Kenneth C. **Microelectronic Circuits**. 7. ed.
   Oxford University Press, 2014.
5. TEXAS INSTRUMENTS. **Logic Guide** e folhas de dados das famílias lógicas.
   Documentação técnica do fabricante.
6. NEXPERIA. **Logic handbook** e folhas de dados de circuitos lógicos.
   Documentação técnica do fabricante.

---

[Voltar ao sumário](README.md) ·
[Capítulo 13 — Dispositivos semicondutores e chaveamento digital](semiconductor-devices-and-digital-switching.md)
·
[Capítulo 15 — Integridade de sinais e implementação física](signal-integrity-and-physical-implementation.md)
