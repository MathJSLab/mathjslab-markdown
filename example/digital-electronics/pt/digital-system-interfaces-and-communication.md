# 23. Interfaces e comunicação entre sistemas digitais {#chapter-23}

Um sistema digital raramente opera isoladamente. Processadores, controladores,
memórias, conversores, sensores e atuadores precisam trocar dados e sinais de
comando sob restrições elétricas e temporais. A **interface** define as
condições dessa troca: quais sinais existem, como são representados
eletricamente, quando podem mudar e como o receptor reconhece uma transferência
válida.

Uma conexão fisicamente possível não constitui, por si só, uma interface
correta. Dois dispositivos podem utilizar níveis lógicos compatíveis e, ainda
assim, discordar sobre a ordem dos bits, a polaridade do relógio, o instante de
amostragem ou a interpretação de um sinal de habilitação. De modo semelhante, a
compatibilidade de protocolo não dispensa a verificação das tensões, das
correntes e das condições de partida.

Neste capítulo, estudaremos a organização de barramentos, as alternativas de
comunicação paralela e serial, as interfaces síncronas e assíncronas e os
princípios de UART, SPI e I²C, além de 1-Wire, RS-232, RS-422, RS-485, PROFIBUS
e JTAG. Em seguida, examinaremos integridade do sinal, adaptação elétrica e
integração com dispositivos periféricos. O objetivo não é substituir as
especificações de fabricantes e normas, mas estabelecer critérios para
interpretá-las e empregá-las em projetos verificáveis.

## 23.1. Barramentos e sinais de controle

Um **barramento** é um conjunto de conexões utilizado para transportar
informação entre blocos. Conforme a arquitetura, pode reunir linhas de
**dados**, **endereços** e **controle**. A separação é conceitual: em algumas
interfaces, os mesmos condutores transportam diferentes tipos de informação em
instantes distintos, processo chamado _multiplexação temporal_.

Em um acesso de escrita a uma memória paralela, por exemplo, o controlador
fornece o endereço, apresenta os dados, habilita o dispositivo e ativa o
comando de escrita. Para uma leitura, o controlador apresenta o endereço e
solicita que a memória conduza o barramento de dados. As condições exatas de
temporização e polaridade dependem do dispositivo.

<!-- prettier-ignore -->
::: figure Organização funcional de um barramento de memória {#fig-interface-memory-bus}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\draw[thick] (0,0) rectangle (3.0,3.4);
\draw[thick] (7.0,0) rectangle (10.0,3.4);
\node[align=center] at (1.5,1.7) {Controlador};
\node[align=center] at (8.5,1.7) {Memória};
\draw[->,thick] (3.0,2.75)--(7.0,2.75);
\node[above] at (5.0,2.75) {Endereço};
\draw[<->,thick] (3.0,1.70)--(7.0,1.70);
\node[above] at (5.0,1.70) {Dados};
\draw[->,thick] (3.0,0.65)--(7.0,0.65);
\node[above] at (5.0,0.65) {Controle};
\end{tikzpicture}
```

:::

A {@ref fig-interface-memory-bus} apresenta a separação funcional dos sinais,
sem representar a quantidade de condutores nem um protocolo particular. A seta
bidirecional indica que, em uma memória de leitura e escrita, o fluxo de dados
pode ocorrer nos dois sentidos, mas **não simultaneamente pelos mesmos
condutores**, salvo se a interface tiver vias independentes.

<!-- prettier-ignore -->
::: table Sinais frequentes em interfaces digitais paralelas {#tab-interface-bus-signals .full-width}

| Grupo       | Função                              | Exemplos de identificação | Observação                                |
| :---------- | :---------------------------------- | :------------------------ | :---------------------------------------- |
| Endereço    | Selecionar posição ou registrador   | `A[7:0]`, `ADDR`          | Pode ser omitido em interfaces de fluxo   |
| Dados       | Transportar informação              | `D[7:0]`, `DATA`          | Pode ser unidirecional ou bidirecional    |
| Seleção     | Habilitar um dispositivo            | `CS`, `CE`                | A polaridade deve ser especificada        |
| Leitura     | Solicitar disponibilização de dados | `RD`, `OE`                | Nem sempre são sinais distintos           |
| Escrita     | Solicitar armazenamento de dados    | `WR`, `WE`                | Exige respeito aos tempos de setup e hold |
| Confirmação | Indicar conclusão ou aceitação      | `READY`, `ACK`            | Permite acomodar diferentes latências     |
| Interrupção | Solicitar atenção do controlador    | `IRQ`                     | Pode ser sensível a nível ou borda        |

:::

A notação `CS_n` ou `\overline{CS}` costuma indicar um sinal ativo em nível
baixo. Contudo, a convenção de nomes não substitui a consulta à documentação.
Em barramentos compartilhados, também é necessário definir **quem pode conduzir
cada linha** e em quais momentos, para evitar contenção elétrica.

Um mecanismo simples de transferência é o **handshake**. O emissor anuncia que
o dado está disponível (`VALID`) e o receptor informa que pode aceitá-lo
(`READY`). Em uma interface síncrona com essa convenção, a transferência ocorre
na borda ativa em que ambos estão em nível alto. A validade e a estabilidade
dos dados devem ser mantidas conforme o protocolo; não basta produzir pulsos
arbitrários.

## 23.2. Comunicação paralela e serial

Na **comunicação paralela**, vários bits de uma palavra são transportados por
condutores distintos. Na **comunicação serial**, os bits são transmitidos
sucessivamente por um número menor de linhas. Nenhuma das abordagens é
universalmente superior: a escolha depende da distância, da taxa requerida, da
quantidade de pinos, do consumo, da imunidade a ruído e da complexidade do
enlace.

Para uma interface paralela ideal de largura $W$ bits, que transfere uma
palavra por ciclo de frequência $f$, a taxa bruta de dados é

$$
R_{\mathrm{bruta}}=Wf.
$$

Essa expressão não considera ciclos de espera, comandos, endereços ou outras
sobrecargas. Para um enlace serial que transporta um bit por intervalo de
símbolo e usa taxa de símbolos $f_s$, a taxa bruta é $R_{\mathrm{bruta}}=f_s$.
Protocolos com codificação de linha, múltiplos bits por símbolo ou múltiplas
vias exigem modelos específicos.

<!-- prettier-ignore -->
::: figure Comparação conceitual entre transferência paralela e serial {#fig-interface-parallel-serial}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
\node[anchor=west] at (0,4.7) {Paralela: quatro bits em quatro vias};
\draw[thick] (0.4,2.2) rectangle (2.5,4.1);
\draw[thick] (7.1,2.2) rectangle (9.2,4.1);
\node at (1.45,3.15) {TX};
\node at (8.15,3.15) {RX};
\foreach \y/\lab in {3.8/{D_3},3.35/{D_2},2.9/{D_1},2.45/{D_0}} {
  \draw[->] (2.5,\y)--(7.1,\y);
  \node[above] at (4.8,\y) {$\lab$};
}
\node[anchor=west] at (0,1.55) {Serial: bits sucessivos em uma via};
\draw[thick] (0.4,-0.7) rectangle (2.5,0.8);
\draw[thick] (7.1,-0.7) rectangle (9.2,0.8);
\node at (1.45,0.05) {TX};
\node at (8.15,0.05) {RX};
\draw[->] (2.5,0.05)--(7.1,0.05);
\node[above] at (4.8,0.05) {$D_3,D_2,D_1,D_0$};
\end{tikzpicture}
```

:::

Em ligações paralelas de alta velocidade, diferenças entre os atrasos das vias
(_skew_) podem reduzir a janela de amostragem. Interfaces seriais evitam a
necessidade de alinhar muitos condutores de dados, mas introduzem requisitos de
sincronização, enquadramento e recuperação de informação. A distinção também
não implica que interfaces seriais sejam necessariamente lentas: enlaces
seriais modernos podem alcançar taxas muito superiores às de barramentos
paralelos simples.

<!-- prettier-ignore -->
::: table Compromissos típicos entre interfaces paralelas e seriais {#tab-interface-parallel-serial .full-width}

| Critério                       | Paralela                                   | Serial                                      |
| :----------------------------- | :----------------------------------------- | :------------------------------------------ |
| Número de vias para dados      | Geralmente maior                           | Geralmente menor                            |
| Transferência de uma palavra   | Vários bits por evento                     | Bits distribuídos no tempo                  |
| Sincronização entre condutores | Importante em barramentos largos           | Importante entre transmissor e receptor     |
| Conectores e roteamento        | Podem ser mais volumosos                   | Podem ser mais simples                      |
| Distância e taxa               | Dependem fortemente da tecnologia          | Dependem fortemente da tecnologia           |
| Aplicações típicas             | Barramentos locais e interfaces de memória | UART, SPI, I²C e enlaces de alta velocidade |

:::

## 23.3. Interfaces síncronas e assíncronas

Uma interface **síncrona** utiliza uma referência temporal comum, tipicamente
um sinal de relógio, para definir quando os sinais devem ser apresentados e
amostrados. Em uma interface **assíncrona**, não há necessariamente um relógio
compartilhado por condutor; os eventos podem ser reconhecidos por transições,
temporização previamente acordada ou sinais de requisição e confirmação.

Na comunicação serial UART, por exemplo, transmissor e receptor configuram
taxas nominais compatíveis, mas cada lado utiliza seu próprio relógio local. O
receptor identifica o início do quadro e amostra os bits em instantes estimados
a partir dessa transição. Já no SPI, a transferência é coordenada pelo relógio
serial `SCLK` gerado pelo controlador.

É importante distinguir a **classificação de uma interface** da organização
interna dos circuitos. Uma UART assíncrona pode ser implementada por máquinas
de estados inteiramente síncronas ao relógio local. Da mesma forma, sinais de
entrada externos podem exigir sincronizadores, mesmo quando o sistema utiliza
um único relógio principal.

<!-- prettier-ignore -->
::: figure Relação entre relógio e dados em uma transferência síncrona ilustrativa {#fig-interface-synchronous-timing}

```tikz
\begin{tikzpicture}[scale=1.75,transform shape]
\node[anchor=east] at (0.7,2.4) {$CLK$};
\node[anchor=east] at (0.7,0.8) {$DATA$};
\draw[thick] (1,2.0)--(2,2.0)--(2,2.8)--(3,2.8)--(3,2.0)--(4,2.0)--(4,2.8)--(5,2.8)--(5,2.0)--(6,2.0)--(6,2.8)--(7,2.8)--(7,2.0)--(8,2.0);
\draw[thick] (1,0.35)--(1.5,0.35)--(1.85,1.25)--(3.15,1.25)--(3.5,0.35)--(3.85,1.25)--(5.15,1.25)--(5.5,0.35)--(5.85,1.25)--(7.15,1.25)--(7.5,0.35)--(8,0.35);
\foreach \x in {2,4,6} {\draw[dashed] (\x,0.1)--(\x,3.05);}
\node at (2.5,0.8) {$b_0$};
\node at (4.5,0.8) {$b_1$};
\node at (6.5,0.8) {$b_2$};
\end{tikzpicture}
```

:::

A {@ref fig-interface-synchronous-timing} é apenas uma ilustração temporal: os
dados estão estáveis nas bordas de subida indicadas. Um protocolo real
especifica os intervalos mínimos de **preparação** (_setup_) e **retenção**
(_hold_) em relação à borda de amostragem, além dos atrasos de propagação. O
receptor não deve depender de mudanças instantâneas nem presumir que os sinais
chegam simultaneamente.

Para sinais que atravessam domínios de relógio, uma entrada de controle de um
único bit pode, conforme a aplicação, ser sincronizada por uma cadeia de
registradores. Porém, **barramentos multibit e pulsos curtos** podem exigir
protocolos de handshake, codificação Gray ou FIFOs assíncronas. Dois
registradores em série não garantem, isoladamente, uma transferência coerente
de uma palavra inteira.

## 23.4. Princípios de UART, SPI e I²C

UART, SPI e I²C são interfaces seriais muito empregadas na comunicação entre
circuitos integrados e sistemas embarcados. Diferem na organização temporal, na
topologia, no enquadramento e nas características elétricas. A semelhança de
serem seriais não implica compatibilidade direta.

### UART: comunicação serial assíncrona

A **UART** (_Universal Asynchronous Receiver/Transmitter_) converte dados
paralelos em quadros seriais e realiza a operação inversa na recepção. Uma
configuração comum utiliza uma linha em repouso no nível alto, um **bit de
início** em nível baixo, oito bits de dados transmitidos do menos significativo
para o mais significativo e um **bit de parada** em nível alto. Podem existir
bit de paridade, diferentes quantidades de bits de dados e diferentes durações
de parada.

<!-- prettier-ignore -->
::: figure Quadro UART ilustrativo com oito bits de dados, sem paridade e um bit de parada {#fig-interface-uart-frame}

```tikz
\begin{tikzpicture}[scale=1.45,transform shape]
\draw[->] (0,0)--(12.3,0) node[right] {$t$};
\node[anchor=east] at (0.6,1.9) {TX};
\draw[thick] (0.8,2.2)--(1.6,2.2)--(1.6,1.0)--(2.6,1.0)
--(2.6,2.2)--(3.6,2.2)--(3.6,1.0)--(4.6,1.0)
--(4.6,2.2)--(5.6,2.2)--(5.6,1.0)--(6.6,1.0)
--(6.6,1.0)--(7.6,1.0)--(7.6,2.2)--(8.6,2.2)
--(8.6,1.0)--(9.6,1.0)--(9.6,2.2)--(10.6,2.2)
--(11.6,2.2)--(12.0,2.2);
\foreach \x in {1.6,2.6,3.6,4.6,5.6,6.6,7.6,8.6,9.6,10.6,11.6} {\draw[densely dotted] (\x,0.65)--(\x,2.55);}
\node[below] at (2.1,0.7) {Start};
\foreach \x/\i in {3.1/0,4.1/1,5.1/2,6.1/3,7.1/4,8.1/5,9.1/6,10.1/7} {\node[below] at (\x,0.7) {$D_{\i}$};}
\node[below] at (11.1,0.7) {Stop};
\end{tikzpicture}
```

:::

A forma de onda da {@ref fig-interface-uart-frame} representa um **exemplo de
sequência de bits**, não um valor numérico universal. Para uma configuração
**8N1** (oito bits de dados, sem paridade e um bit de parada), cada caractere
utiliza dez intervalos de bit. Assim, a taxa útil máxima de dados, sem pausas e
desconsiderando protocolos superiores, é

$$
R_{\mathrm{útil}}=R_{\mathrm{baud}}\frac{8}{10}=0{,}8R_{\mathrm{baud}}.
$$

Em uma UART binária convencional, a taxa em baud coincide com a taxa bruta de
bits. Para $115\,200$ baud em 8N1, isso corresponde a $92\,160$ bit/s de dados
ou $11\,520$ bytes/s, em transmissão contínua ideal. **UART não define, por si
só, os níveis elétricos**: uma interface lógica CMOS e uma interface física
RS-232, por exemplo, não podem ser ligadas diretamente sem avaliar a adaptação
necessária.

### SPI: interface serial síncrona

A **SPI** (_Serial Peripheral Interface_) utiliza normalmente um relógio
`SCLK`, uma linha do controlador para o periférico (`MOSI` ou `COPI`), uma
linha do periférico para o controlador (`MISO` ou `CIPO`) e um sinal de seleção
(`CS`). O controlador determina o ritmo da transferência. Em topologias comuns,
diferentes periféricos compartilham o relógio e as linhas de dados, mas recebem
seleções individuais.

<!-- prettier-ignore -->
::: figure Ligação SPI funcional entre controlador e periférico {#fig-interface-spi-links}

```tikz
\begin{tikzpicture}[scale=1.6,transform shape]
\draw[thick] (0,0) rectangle (3.0,4.2);
\draw[thick] (8.0,0) rectangle (11.0,4.2);
\node at (1.5,2.1) {Controlador};
\node at (9.5,2.1) {Periférico};
\draw[->] (3.0,3.45)--(8.0,3.45);
\node[above] at (5.5,3.45) {SCLK};
\draw[->] (3.0,2.55)--(8.0,2.55);
\node[above] at (5.5,2.55) {MOSI / COPI};
\draw[<-] (3.0,1.65)--(8.0,1.65);
\node[above] at (5.5,1.65) {MISO / CIPO};
\draw[->] (3.0,0.75)--(8.0,0.75);
\node[above] at (5.5,0.75) {CS};
\end{tikzpicture}
```

:::

As combinações de polaridade e fase do relógio são frequentemente identificadas
pelos parâmetros **CPOL** e **CPHA**. Ambos os dispositivos devem concordar
sobre a borda de deslocamento e a borda de amostragem. A SPI não impõe um
formato universal de comandos, tamanho de palavra ou significado de `CS`; esses
detalhes pertencem à especificação do periférico. Embora a estrutura com duas
linhas de dados permita transferência simultânea nos dois sentidos, um
dispositivo pode utilizar apenas uma delas ou operar em modo de três fios.

### I²C: barramento serial de dois fios

O **I²C** (_Inter-Integrated Circuit_) utiliza as linhas `SDA` (dados) e `SCL`
(relógio), normalmente com saídas de dreno aberto ou coletor aberto e
**resistores de pull-up**. Os dispositivos podem puxar uma linha para nível
baixo, mas não devem forçá-la ativamente para nível alto no barramento
convencional. Essa propriedade permite compartilhar as linhas e sustenta
mecanismos de reconhecimento e arbitragem.

<!-- prettier-ignore -->
::: figure Organização elétrica simplificada de um barramento I²C {#fig-interface-i2c-bus}

```tikz
\begin{circuitikz}[scale=1.55,transform shape]
% Resistores de pull-up em posições invertidas
\draw (1.0,5.1) node[vcc] {$V_{DD}$}
      to[R,l=$R_{PU,SCL}$] (1.0,2.8);
\draw (3.0,5.1) node[vcc] {$V_{DD}$}
      to[R,l=$R_{PU,SDA}$] (3.0,3.8);

% Linhas do barramento
\draw[thick] (3.0,3.8)--(10.0,3.8);
\draw[thick] (1.0,2.8)--(10.0,2.8);

\node[right] at (10.0,3.8) {SDA};
\node[right] at (10.0,2.8) {SCL};

% Dispositivos
\draw[thick] (4.2,0.0) rectangle (6.3,1.8);
\draw[thick] (7.2,0.0) rectangle (9.3,1.8);

\node[align=center] at (5.25,0.9) {Dispositivo\\A};
\node[align=center] at (8.25,0.9) {Dispositivo\\B};

% Conexões dos dispositivos ao barramento
\draw (4.7,3.8)--(4.7,1.8);
\draw (5.8,2.8)--(5.8,1.8);
\draw (7.7,3.8)--(7.7,1.8);
\draw (8.8,2.8)--(8.8,1.8);
\end{circuitikz}
```

:::

A {@ref fig-interface-i2c-bus} mostra somente a conexão funcional e os
resistores de pull-up; **não** representa os transistores internos de dreno
aberto. Em uma transação típica, o controlador gera uma condição **START**,
transmite um endereço e um bit de direção, recebe ou envia dados com
reconhecimento (`ACK`/`NACK`) e encerra com **STOP** ou uma condição de início
repetida. Os detalhes variam com a modalidade de operação.

Os resistores de pull-up devem ser escolhidos considerando tensão, capacitância
total, corrente admissível e tempo de subida. Resistores muito altos podem
produzir bordas lentas; resistores muito baixos aumentam a corrente exigida
para manter o nível baixo.

<!-- prettier-ignore -->
::: table Comparação introdutória entre UART, SPI e I²C {#tab-interface-serial-protocols .full-width}

| Característica                        | UART                           | SPI                                     | I²C                                |
| :------------------------------------ | :----------------------------- | :-------------------------------------- | :--------------------------------- |
| Relógio compartilhado por fio         | Não                            | Sim                                     | Sim                                |
| Linhas principais                     | TX e RX                        | SCLK, dados e seleção                   | SDA e SCL                          |
| Organização típica                    | Ponto a ponto                  | Controlador e periféricos               | Barramento endereçado              |
| Enquadramento                         | Bits de início e parada        | Definido pela seleção e pelo periférico | START, endereço, ACK/NACK, STOP    |
| Operação simultânea nos dois sentidos | Possível com TX e RX separados | Possível com duas vias de dados         | Não, na mesma linha SDA            |
| Característica elétrica importante    | Depende da camada física       | Depende dos dispositivos                | Linhas de dreno aberto com pull-up |

:::

## 23.5. UART e camadas físicas: RS-232

É fundamental distinguir o **controlador UART**, responsável pelo enquadramento
e pela serialização, da **interface elétrica** que transporta seus sinais. Uma
UART integrada a um microcontrolador pode utilizar níveis lógicos CMOS de
$3{,}3\,\mathrm{V}$, enquanto uma conexão RS-232 convencional utiliza tensões
de sinalização distintas, inclusive negativas, e convenção de polaridade
diferente. Portanto, compatibilidade de formato de quadro não implica
compatibilidade elétrica.

Um **transceptor RS-232** adapta a interface lógica local aos níveis da ligação
externa. Sua escolha exige consultar limites elétricos, alimentação, taxa,
comprimento de cabo e eventuais sinais adicionais de controle de fluxo.

<!-- prettier-ignore -->
::: figure Separação entre controlador UART e interface física RS-232 {#fig-interface-uart-rs232}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\draw[thick] (0,0) rectangle (3.2,2);
\draw[thick] (6.2,0) rectangle (9.5,2);
\draw[thick] (12.5,0) rectangle (15.7,2);
\node[align=center] at (1.6,1) {Controlador\\UART CMOS};
\node[align=center] at (7.85,1) {Transceptor\\RS-232};
\node[align=center] at (14.1,1) {Equipamento\\remoto};
\draw[<->] (3.2,1)--(6.2,1);
\node[above] at (4.7,1) {TX / RX lógicos};
\draw[<->] (9.5,1)--(12.5,1);
\node[above] at (11,1) {RS-232};
\end{tikzpicture}
```

:::

## 23.6. Barramento 1-Wire e identificação de dispositivos

O **1-Wire** utiliza uma linha de dados (`DQ`) e uma referência elétrica comum.
A linha costuma operar com resistor de _pull-up_ e dispositivos que a conduzem
ao nível baixo durante intervalos definidos pelo protocolo. A comunicação é
coordenada por janelas temporais de reinicialização, presença, escrita e
leitura; não existe uma linha separada de relógio.

Dispositivos compatíveis podem incorporar identificadores ROM de **64 bits**,
que permitem selecionar unidades distintas em um mesmo barramento. Alguns
sensores admitem **alimentação parasita**, extraindo energia da linha de dados,
mas essa modalidade impõe requisitos específicos de corrente, armazenamento de
energia e, em certas operações, _strong pull-up_.

<!-- prettier-ignore -->
::: figure Topologia conceitual de um barramento 1-Wire {#fig-interface-onewire-bus}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
% Controlador
\draw[thick] (0,0) rectangle (2.7,1.7);
\node at (1.35,0.85) {Controlador};

% Barramento DQ
\draw[thick] (2.7,0.85)--(14.8,0.85);
\node[above] at (10.0,0.85) {DQ};

% Sensores conectados ao barramento
\foreach \x/\name in {5.0/A,9.0/B,13.0/C}{
  \draw[thick] (\x,-2.0) rectangle ++(2.0,1.4);
  \node at (\x+1,-1.3) {Sensor \name};
  \draw (\x+1,0.85)--(\x+1,-0.6);
  \fill (\x+1,0.85) circle (1.2pt);
}

% Resistor de pull-up desenhado em TikZ
\draw (4.2,0.85)--(4.2,1.8);
\draw[thick]
  (4.2,1.8)--
  (3.95,2.05)--
  (4.45,2.30)--
  (3.95,2.55)--
  (4.45,2.80)--
  (3.95,3.05)--
  (4.2,3.30);
\draw (4.2,3.30)--(4.2,4.1);

% Identificações
\node[right] at (4.5,2.55) {$R_P$};
\node[above] at (4.2,4.1) {$V_{DD}$};
\fill (4.2,0.85) circle (1.2pt);
\end{tikzpicture}
```

:::

A figura mostra apenas a conexão de dados e o _pull-up_. Em uma instalação
real, deve-se prever também a referência de terra e a alimentação dos
dispositivos que não operam em modo parasita.

## 23.7. Sinalização diferencial: RS-422 e RS-485

Uma interface diferencial representa a informação por uma diferença de
potencial entre dois condutores:

$$V_D=V_A-V_B.$$

Perturbações semelhantes induzidas nos dois fios tendem a ser rejeitadas pelo
receptor, desde que a tensão de modo comum permaneça em sua faixa admissível. O
uso de par trançado ajuda a equilibrar o acoplamento eletromagnético.

**RS-422** admite, em sua organização típica, um transmissor por par
diferencial e múltiplos receptores. **RS-485** permite que vários transmissores
compartilhem o mesmo par, desde que o protocolo de acesso impeça que dois
transmissores conduzam o barramento simultaneamente. Nenhuma das duas
interfaces define, por si só, endereços, quadros de aplicação ou significado
das mensagens.

Em enlaces nos quais o tempo de propagação não é desprezível frente ao tempo de
subida, o cabo deve ser tratado como **linha de transmissão**. O coeficiente de
reflexão na carga é

$$\Gamma=\frac{Z_L-Z_0}{Z_L+Z_0},$$

em que $Z_0$ é a impedância característica e $Z_L$ é a impedância de
terminação. Para $Z_L=Z_0$, a reflexão ideal na carga é nula. Em uma instalação
RS-485 linear com cabo de aproximadamente $120\,\Omega$, é comum utilizar
terminações próximas de $120\,\Omega$ nas **duas extremidades físicas** do
tronco, não em cada dispositivo. A polarização de repouso (_failsafe bias_) é
outra função e não deve ser confundida com terminação.

<!-- prettier-ignore -->
::: figure Tronco RS-485 com terminações nas duas extremidades {#fig-interface-rs485-termination}

```tikz
\begin{circuitikz}[scale=1.7,transform shape]
\draw (0,3) -- (10,3);
\draw (0,0) -- (10,0);
\draw (0.7,3) to[R,l=$R_{T1}$] (0.7,0);
\draw (9.3,3) to[R,l=$R_{T2}$] (9.3,0);
\node[above] at (5,3) {Condutor A};
\node[below] at (5,0) {Condutor B};
\node at (5,1.5) {$R_{T1}\approx R_{T2}\approx Z_0$};
\end{circuitikz}
```

:::

As letras `A` e `B` podem seguir convenções de polaridade diferentes entre
fabricantes. É indispensável verificar a documentação do transceptor antes da
ligação.

## 23.8. PROFIBUS e redes industriais

**PROFIBUS** designa uma família de redes de automação. Em **PROFIBUS DP**, a
comunicação frequentemente utiliza uma camada física baseada em RS-485, mas
incorpora regras próprias de acesso ao meio, estrutura de mensagens,
configuração e diagnóstico. **PROFIBUS PA** utiliza uma camada física
diferente, adequada a instrumentação de processo. Assim, PROFIBUS não deve ser
reduzido a um sinônimo de RS-485.

Em segmentos PROFIBUS DP baseados em RS-485, uma rede de terminação ativa
frequentemente emprega resistores de $390\,\Omega$ ligados a `VP` e `DGND` e um
resistor de $220\,\Omega$ entre os condutores. Essa rede não é intercambiável
com a terminação simples de $120\,\Omega$ de um enlace RS-485 genérico. Os
valores, a alimentação e a instalação devem obedecer às especificações dos
equipamentos.

<!-- prettier-ignore -->
::: figure Rede didática de terminação ativa de PROFIBUS DP {#fig-interface-profibus-termination}

```tikz
\begin{circuitikz}[scale=1.8,transform shape]
\draw (2,6) node[above] {VP (+5 V)} to[R,l=$390\,\Omega$] (2,4);
\draw (2,4) -- (5,4) node[right] {B};
\draw (2,4) to[R,l=$220\,\Omega$] (2,2);
\draw (2,2) -- (5,2) node[right] {A};
\draw (2,2) to[R,l=$390\,\Omega$] (2,0) node[ground] {};
\node[left] at (1.4,0) {DGND};
\end{circuitikz}
```

:::

A figura representa somente a terminação e a polarização, sem transceptor,
blindagem ou proteção. Como a terminação é ativa, seu funcionamento pressupõe
alimentação apropriada.

## 23.9. JTAG: teste, depuração e programação

**JTAG**, associado à norma IEEE 1149.1, foi concebido para **teste de
interconexões** por varredura de fronteira (_boundary scan_). As linhas usuais
são `TCK` (relógio), `TMS` (seleção de modo), `TDI` (entrada de dados de teste)
e `TDO` (saída); `TRST` pode existir como sinal opcional.

O dispositivo incorpora um controlador de estados **TAP** (_Test Access Port_)
e registradores de instruções e dados. Em uma cadeia, a saída `TDO` de um
circuito alimenta a entrada `TDI` do próximo, enquanto `TCK` e `TMS` são
compartilhados. Dependendo do componente, a infraestrutura também dá acesso a
recursos de programação e depuração. JTAG não substitui uma interface genérica
de comunicação com sensores.

<!-- prettier-ignore -->
::: figure Encadeamento de dispositivos por JTAG {#fig-interface-jtag-chain}

```tikz
\begin{tikzpicture}[scale=1.7,transform shape]
\draw[thick] (0,0) rectangle (2.6,1.8);
\draw[thick] (5.5,0) rectangle (8.1,1.8);
\draw[thick] (11,0) rectangle (13.6,1.8);
\node[align=center] at (1.3,0.9) {Interface\\de teste};
\node at (6.8,0.9) {TAP 1};
\node at (12.3,0.9) {TAP 2};
\draw[->] (2.6,1.15)--(5.5,1.15);
\node[above] at (4.05,1.15) {TDI};
\draw[->] (8.1,1.15)--(11,1.15);
\node[above] at (9.55,1.15) {TDO / TDI};
\draw[->] (13.6,0.6)--(15.5,0.6);
\node[right] at (15.5,0.6) {TDO};
\node[below] at (8,0) {TCK e TMS compartilhados (não desenhados)};
\end{tikzpicture}
```

:::

## 23.10. Integridade do sinal e dimensionamento das interconexões

A interconexão física apresenta resistência, indutância e capacitância
distribuídas. Para ligações curtas e bordas relativamente lentas, um modelo RC
concentrado pode oferecer uma primeira estimativa. Em I²C e outros barramentos
de dreno aberto, a subida depende do resistor de _pull-up_ e da capacitância
total:

$$V(t)=V_{DD}\left(1-e^{-t/(R_PC_B)}\right).$$

Para o intervalo de 30% a 70% da tensão final, a aproximação de primeira ordem
fornece

$$t_r\approx0{,}8473R_PC_B.$$

Com $R_P=4{,}7\,\mathrm{k\Omega}$ e $C_B=100\,\mathrm{pF}$, obtém-se
$t_r\approx398\,\mathrm{ns}$. Esse resultado precisa ser comparado ao limite de
tempo de subida da modalidade utilizada e à capacidade de drenar corrente em
nível baixo. Reduzir $R_P$ acelera a subida, mas aumenta a corrente quando a
linha é conduzida a zero.

Para ligações longas ou bordas rápidas, deve-se avaliar impedância
característica, reflexões, retorno de corrente, interferência, blindagem,
aterramento e eventual isolamento galvânico. A distância por si só não
determina se um enlace é seguro: **a velocidade das bordas e a geometria do
circuito** também importam.

<!-- prettier-ignore -->
::: example Estimativa de tempo de subida {#ex-interface-i2c-rise-time}

Um barramento apresenta $R_P=2{,}2\,\mathrm{k\Omega}$ e $C_B=150\,\mathrm{pF}$.
A estimativa entre 30% e 70% é

$$t_r\approx0{,}8473\times2200\times150\times10^{-12}\approx280\,\mathrm{ns}.$$

O cálculo não substitui a verificação das especificações do modo I²C e dos
níveis de tensão.

:::

## 23.11. Adaptação de níveis lógicos

Uma interface digital é eletricamente compatível quando o transmissor consegue
produzir níveis reconhecidos pelo receptor sem violar os limites de tensão,
corrente e integridade do sinal. É necessário distinguir os **limites
absolutos** dos **intervalos de operação recomendados**: operar dentro de
limites absolutos não significa que o dispositivo funcionará corretamente ou
terá confiabilidade adequada.

Para uma ligação unidirecional, as condições de margem estática de ruído podem
ser expressas por

$$
NM_H=V_{OH,\min}-V_{IH,\min},
\qquad
NM_L=V_{IL,\max}-V_{OL,\max}.
$$

Em que $V_{OH,\min}$ e $V_{OL,\max}$ são limites garantidos pelo transmissor,
enquanto $V_{IH,\min}$ e $V_{IL,\max}$ são os limites de reconhecimento do
receptor. Valores positivos indicam margens estáticas, mas não garantem,
isoladamente, o atendimento a requisitos dinâmicos nem a proteção contra
sobretensão.

<!-- prettier-ignore -->
::: table Verificações elétricas antes de interligar dispositivos {#tab-interface-level-checklist .full-width}

| Verificação         | Pergunta de projeto                                                        |
| :------------------ | :------------------------------------------------------------------------- |
| Alimentação         | Os circuitos operam em tensões compatíveis?                                |
| Níveis lógicos      | $V_{OH}$ e $V_{OL}$ atendem aos limiares $V_{IH}$ e $V_{IL}$?              |
| Limites de entrada  | A tensão aplicada permanece dentro da faixa permitida?                     |
| Corrente            | A saída consegue acionar a carga e os pull-ups previstos?                  |
| Sequenciamento      | Há risco de energizar um dispositivo por pinos de sinal?                   |
| Temporização        | As bordas e os atrasos atendem ao protocolo?                               |
| Referência elétrica | Os dispositivos compartilham uma referência adequada ou exigem isolamento? |

:::

A ligação entre um transmissor de $5\ \mathrm{V}$ e um receptor de $3{,}3\
\mathrm{V}$, por exemplo, **não deve ser presumida segura**. Algumas entradas
toleram $5\ \mathrm{V}$ em condições especificadas; outras não. As soluções
possíveis incluem transceptores tradutores, divisores resistivos para sinais
adequados de baixa velocidade, circuitos com MOSFET em topologias apropriadas e
interfaces dedicadas para barramentos bidirecionais.

Para I²C, a tradução bidirecional exige atenção especial à natureza de dreno
aberto, às tensões de pull-up e às condições de subida. Uma solução que
funcione para uma saída push-pull unidirecional não é automaticamente válida
para I²C. Também é necessário considerar a alimentação desligada de um dos
lados e eventuais caminhos de corrente por diodos de proteção.

## 23.12. Buffers e isolamento

Um **buffer** é um estágio destinado a reforçar ou condicionar a transmissão de
um sinal, sem necessariamente alterar sua informação lógica. Pode aumentar a
capacidade de acionamento, reduzir a carga percebida por uma fonte, permitir
saída de três estados ou adaptar características elétricas. Já um **isolador
galvânico** estabelece uma barreira elétrica entre domínios, mantendo a
transferência de informação por acoplamento óptico, magnético ou capacitivo,
conforme a tecnologia.

Um buffer de três estados possui três condições possíveis na saída: nível
lógico baixo, nível lógico alto e **alta impedância** (`Z`). Alta impedância
não é um terceiro valor lógico de dados; é a condição em que a saída deixa de
conduzir ativamente a linha. Ela permite que diferentes dispositivos
compartilhem um barramento, desde que o controle impeça acionamentos
conflitantes.

<!-- prettier-ignore -->
::: figure Compartilhamento de um barramento com saídas de três estados {#fig-interface-tristate-bus}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\draw[thick] (0.0,2.7) rectangle (2.8,4.2);
\draw[thick] (0.0,0.2) rectangle (2.8,1.7);
\node at (1.4,3.45) {Dispositivo A};
\node at (1.4,0.95) {Dispositivo B};
\draw[thick] (4.0,2.7) rectangle (6.5,4.2);
\draw[thick] (4.0,0.2) rectangle (6.5,1.7);
\node[align=center] at (5.25,3.45) {Buffer\\triestado};
\node[align=center] at (5.25,0.95) {Buffer\\triestado};
\draw[->] (2.8,3.45)--(4.0,3.45);
\draw[->] (2.8,0.95)--(4.0,0.95);
\draw[thick] (6.5,3.45)--(8.0,3.45)--(8.0,0.95)--(6.5,0.95);
\draw[thick] (8.0,2.2)--(10.2,2.2);
\node[right] at (10.2,2.2) {Barramento};
\draw[->] (5.25,4.95)--(5.25,4.2);
\node[above] at (5.25,4.95) {$EN_A$};
\draw[->] (5.25,-0.75)--(5.25,0.2);
\node[below] at (5.25,-0.75) {$EN_B$};
\end{tikzpicture}
```

:::

A {@ref fig-interface-tristate-bus} é funcional. Os buffers são representados
por blocos, pois o objetivo é mostrar a arbitragem do barramento, e não a
estrutura interna do componente. Em operação normal, o controlador deve impedir
que `EN_A` e `EN_B` habilitem simultaneamente saídas com valores opostos. Se
ambas estiverem desabilitadas, a linha poderá flutuar, a menos que exista um
mecanismo de polarização ou outro dispositivo a conduza.

O isolamento galvânico é relevante quando há diferenças de potencial de terra,
ambientes industriais, exigências de segurança ou necessidade de reduzir
determinados caminhos de ruído. **Isolamento e tradução de nível são funções
distintas**: um isolador pode necessitar de fontes separadas e de circuitos
adicionais para atender às tensões e ao protocolo. O uso de optoacopladores ou
isoladores digitais também introduz atrasos e limites de taxa que devem ser
verificados.

## 23.13. Interface com sensores e atuadores

Sensores transformam grandezas físicas em sinais elétricos ou digitais;
atuadores recebem energia e comandos para produzir uma ação física. A interface
com esses dispositivos pode envolver **aquisição analógica**, comunicação
digital, condicionamento, proteção e estágios de potência.

Um sensor digital com interface I²C pode oferecer registradores de configuração
e de medida. O controlador deve conhecer seu endereço, a ordem dos bytes, o
formato dos dados, a taxa de atualização e o significado dos bits de estado. A
existência de uma interface digital não elimina erros de calibração, limitações
de resolução ou efeitos ambientais.

Atuadores frequentemente exigem tensões ou correntes superiores às suportadas
pelos pinos de um controlador. Um GPIO não deve ser conectado diretamente a uma
carga indutiva ou de potência sem avaliar as condições de acionamento e
proteção. Transistores, drivers de ponte, relés e circuitos de proteção podem
ser necessários, conforme a aplicação.

<!-- prettier-ignore -->
::: figure Cadeia funcional de aquisição e atuação {#fig-interface-sensor-actuator-chain}

```tikz
\begin{tikzpicture}[scale=1.45,transform shape]
\draw[thick] (0,2.3) rectangle (2.6,3.8);
\draw[thick] (4.0,2.3) rectangle (6.6,3.8);
\draw[thick] (8.0,2.3) rectangle (10.6,3.8);
\node at (1.3,3.05) {Sensor};
\node[align=center] at (5.3,3.05) {Interface de\\entrada};
\node at (9.3,3.05) {Controlador};
\draw[->] (2.6,3.05)--(4.0,3.05);
\draw[->] (6.6,3.05)--(8.0,3.05);
\draw[thick] (8.0,0.0) rectangle (10.6,1.5);
\draw[thick] (4.0,0.0) rectangle (6.6,1.5);
\draw[thick] (0.0,0.0) rectangle (2.6,1.5);
\node[align=center] at (9.3,0.75) {Saída de\\controle};
\node[align=center] at (5.3,0.75) {Driver de\\potência};
\node at (1.3,0.75) {Atuador};
\draw[->] (9.3,2.3)--(9.3,1.5);
\draw[->] (8.0,0.75)--(6.6,0.75);
\draw[->] (4.0,0.75)--(2.6,0.75);
\end{tikzpicture}
```

:::

A {@ref fig-interface-sensor-actuator-chain} diferencia o caminho de aquisição
do caminho de atuação. As interfaces de entrada e saída não são necessariamente
circuitos únicos: podem compreender filtros, amplificadores, comparadores,
ADCs, DACs, transceptores e estágios de proteção.

<!-- prettier-ignore -->
::: example Dimensionamento preliminar de uma taxa de aquisição {#ex-interface-sampling-rate}

Um sensor fornece uma amostra de $16$ bits a cada $2\ \mathrm{ms}$. Sem
considerar cabeçalhos e comandos, a taxa média de dados é

$$
R=\frac{16\ \mathrm{bits}}{2\times10^{-3}\ \mathrm{s}}=8\,000\ \mathrm{bit/s}.
$$

Esse valor é uma **taxa útil mínima média**, não a frequência exigida do
barramento. Uma leitura I²C, por exemplo, inclui endereço, bits de
reconhecimento, eventuais comandos e intervalos entre transações. O projeto
deve calcular a duração completa da transação e garantir que ela termine antes
da próxima amostra, com margem adequada.

:::

Para sinais provenientes de botões e contatos mecânicos, o **repique**
(_bounce_) pode produzir várias transições em uma única atuação. Filtros
analógicos, temporização por software ou circuitos digitais de debounce podem
ser usados. Quando o sinal chega de outro domínio temporal, o debounce não
substitui necessariamente a sincronização contra metastabilidade.

## 23.14. Integração com conversores e memórias

A integração de **ADCs**, **DACs** e **memórias** exige compatibilizar formato
de dados, protocolo, latência e largura de banda. Um ADC pode entregar palavras
de $N$ bits por uma interface SPI; um DAC pode receber amostras por uma
interface serial; uma memória pode armazenar os resultados enquanto outro bloco
os processa.

Para uma sequência de amostras de $N$ bits produzidas à frequência $f_s$, a
taxa útil de geração de dados é

$$
R_{\mathrm{dados}}=Nf_s.
$$

Se cada amostra for armazenada em uma palavra de memória de $W$ bits, com
$W\geq N$, a taxa de escrita em bits de memória pode ser $Wf_s$, mesmo que
parte da palavra não contenha informação da medida. Cabeçalhos, marcas de tempo
e mecanismos de integridade também aumentam o volume de dados.

<!-- prettier-ignore -->
::: figure Arquitetura simplificada de aquisição com armazenamento {#fig-interface-acquisition-memory}

```tikz
\begin{tikzpicture}[scale=1.55,transform shape]
% Blocos funcionais
\draw[thick] (0,1.0) rectangle (2.6,2.8);
\draw[thick] (5.8,1.0) rectangle (8.4,2.8);
\draw[thick] (11.6,1.0) rectangle (14.2,2.8);

% Identificação dos blocos
\node[align=center] at (1.3,1.9) {ADC};
\node[align=center] at (7.1,1.9) {Controlador\\de aquisição};
\node[align=center] at (12.9,1.9) {Memória};

% Entrada analógica
\draw[->] (-1.8,1.9)--(0,1.9);
\node[above] at (-0.9,1.9) {$v(t)$};

% Conexão ADC - controlador
\draw[->] (2.6,1.9)--(5.8,1.9);
\node[above] at (4.2,1.9) {Amostras};

% Conexão controlador - memória
\draw[<->] (8.4,1.9)--(11.6,1.9);
\node[above] at (10.0,1.9) {Dados};

% Entrada de relógio
\draw[->] (7.1,0.0)--(7.1,1.0);
\node[below] at (7.1,0.0) {$CLK$};
\end{tikzpicture}
```

:::

Na {@ref fig-interface-acquisition-memory}, o controlador coordena a leitura do
conversor e a escrita na memória. Uma implementação real pode empregar buffers
FIFO para desacoplar a cadência de amostragem dos atrasos de acesso à memória
ou das transferências para um processador. O dimensionamento depende não apenas
da **taxa média**, mas também das rajadas e da maior duração esperada de
indisponibilidade do destino.

<!-- prettier-ignore -->
::: example Dimensionamento de armazenamento para aquisição contínua {#ex-interface-memory-capacity}

Considere um ADC de $12$ bits que produz $20\,000$ amostras por segundo. O
controlador armazena cada amostra em uma palavra de $16$ bits. Para registrar
$60\ \mathrm{s}$, a capacidade necessária, desconsiderando metadados, é

$$
M=20\,000\,\frac{\mathrm{amostras}}{\mathrm{s}}
\times60\ \mathrm{s}\times2\,\frac{\mathrm{bytes}}{\mathrm{amostra}}
=2\,400\,000\ \mathrm{bytes}.
$$

Isso corresponde a aproximadamente $2{,}4\ \mathrm{MB}$ (unidades decimais) ou
$2{,}29\ \mathrm{MiB}$ (unidades binárias). A taxa de escrita sustentada é de
$40\,000\ \mathrm{bytes/s}$. Na prática, a capacidade deve incluir cabeçalhos,
eventuais marcas de tempo e uma margem para a organização do armazenamento.

:::

A verificação de uma interface integrada deve contemplar **reinicialização**,
ausência ou atraso de resposta, saturação de buffers, perda de amostras,
corrupção de dados e comportamento durante a energização. Uma transação
bem-sucedida em condições nominais não demonstra que o sistema se recupera
corretamente de falhas de comunicação.

## 23.15. Comparação e critérios de escolha

As tecnologias estudadas atuam em **níveis distintos de especificação**. UART
descreve enquadramento serial; RS-232, RS-422 e RS-485 tratam de
características elétricas; SPI, I²C e 1-Wire definem mecanismos de comunicação
entre dispositivos; PROFIBUS especifica uma rede industrial mais abrangente;
JTAG é voltado a teste e acesso de depuração. Não é correto tratá-las como
protocolos equivalentes e intercambiáveis.

<!-- prettier-ignore -->
::: table Comparação de interfaces e tecnologias de comunicação {#tab-interface-technology-comparison .full-width}

| Tecnologia  | Referência temporal                         | Meio e organização usuais                   | Aplicação típica                   |
| :---------- | :------------------------------------------ | :------------------------------------------ | :--------------------------------- |
| UART        | Temporização local; sem clock compartilhado | TX/RX, normalmente ponto a ponto            | Comunicação entre controladores    |
| RS-232      | Não define clock serial                     | Sinalização desbalanceada, ponto a ponto    | Portas seriais externas            |
| SPI         | SCLK                                        | Dados e seleção individual de periféricos   | Memórias, ADCs e DACs              |
| I²C         | SCL                                         | SDA/SCL com pull-ups, barramento endereçado | Sensores e circuitos locais        |
| 1-Wire      | Janelas temporais                           | Dados com pull-up e terra comum             | Sensores e identificação           |
| RS-422      | Depende do protocolo                        | Par diferencial, um transmissor por par     | Enlaces diferenciais               |
| RS-485      | Depende do protocolo                        | Par diferencial multiponto                  | Redes industriais e automação      |
| PROFIBUS DP | Definida pela rede                          | Frequentemente RS-485                       | Automação industrial interoperável |
| JTAG        | TCK                                         | Cadeia de varredura                         | Teste, programação e depuração     |

:::

A seleção começa pelos requisitos: quantidade de dispositivos, distância, taxa
útil, latência, número de pinos, ambiente eletromagnético, alimentação,
interoperabilidade, segurança e possibilidade de manutenção. Para sensores
próximos, I²C ou 1-Wire podem ser adequados; para memória flash local, SPI é
frequente; para módulos industriais distantes, pode ser necessária uma camada
diferencial RS-485 associada a um protocolo definido ou uma rede como PROFIBUS.
Essas são orientações, não regras universais.

## Síntese do capítulo

Interfaces digitais relacionam comportamento lógico, temporização e condições
elétricas. Barramentos organizam sinais de dados, endereço e controle;
transferências paralelas e seriais oferecem diferentes compromissos de largura,
taxa e roteamento. Interfaces síncronas utilizam uma referência temporal
compartilhada, enquanto interfaces assíncronas dependem de mecanismos próprios
de enquadramento e reconhecimento. UART, SPI, I²C e 1-Wire ilustram diferentes
soluções de comunicação serial. RS-232, RS-422 e RS-485 especificam
características elétricas; PROFIBUS define uma rede industrial, enquanto JTAG
atende a teste e depuração. A integridade do sinal depende de capacitâncias,
impedâncias, terminações e condições de ruído. A compatibilidade de níveis
lógicos, o uso de buffers e o isolamento exigem avaliação elétrica específica.
Na integração com sensores, atuadores, conversores e memórias, o projeto deve
considerar não apenas a transferência de bits, mas também latência, capacidade,
proteção e tratamento de falhas.

## Exercícios

1. Diferencie interface física, protocolo e barramento. Explique por que dois
   dispositivos com a mesma tensão de alimentação podem ser incompatíveis.
2. Identifique os grupos de sinais necessários para uma memória paralela com
   leitura e escrita e explique o papel de cada grupo.
3. Descreva como evitar contenção em um barramento de dados bidirecional
   compartilhado.
4. Uma interface paralela de $16$ bits transfere uma palavra a cada ciclo de
   $25\ \mathrm{MHz}$. Calcule sua taxa bruta ideal em bit/s e byte/s.
5. Explique a diferença entre comunicação serial e comunicação assíncrona. Dê
   um exemplo de interface serial síncrona.
6. Defina setup e hold e explique sua importância para uma interface síncrona.
7. Por que dois registradores em série não garantem a transferência coerente de
   um barramento multibit entre domínios de relógio?
8. Em uma UART 8N1 configurada para $9\,600$ baud, calcule a taxa máxima ideal
   de bytes de dados por segundo.
9. Explique o papel de CPOL e CPHA em SPI e por que ambos os lados devem usar
   uma convenção compatível.
10. Descreva a função dos resistores de pull-up em I²C e as consequências de
    resistências excessivamente altas ou baixas.
11. Diferencie `ACK` e `NACK` em uma transação I²C e explique por que o
    reconhecimento não garante a validade semântica do dado recebido.
12. Um transmissor garante $V_{OH,\min}=2{,}7\ \mathrm{V}$ e
    $V_{OL,\max}=0{,}4\ \mathrm{V}$; o receptor exige $V_{IH,\min}=2{,}0\
    \mathrm{V}$ e $V_{IL,\max}=0{,}8\ \mathrm{V}$. Calcule as margens estáticas
    de ruído.
13. Explique a diferença entre um buffer de três estados e um isolador
    galvânico.
14. Proponha uma interface segura entre um controlador de $3{,}3\ \mathrm{V}$ e
    um atuador indutivo que exige corrente superior à permitida por um GPIO.
    Indique quais dados do atuador seriam necessários para selecionar os
    componentes.
15. Um ADC produz amostras de $10$ bits a $50\ \mathrm{kamostras/s}$,
    armazenadas em palavras de $16$ bits. Determine a taxa útil do conversor, a
    taxa de escrita em memória e o armazenamento necessário para $30\
    \mathrm{s}$.
16. Elabore um plano de verificação para um periférico SPI, incluindo seleção,
    modo de relógio, temporização, dados de retorno e recuperação de erro.
17. Explique como uma FIFO pode desacoplar a aquisição de dados de um
    armazenamento com latência variável.
18. Descreva três condições de falha que devem ser consideradas na integração
    de um sensor digital com um controlador.

19. Explique por que uma UART de nível lógico não pode ser conectada
    diretamente a uma porta RS-232 clássica sem verificar os níveis elétricos.
20. Descreva a função de um identificador ROM de 64 bits em uma rede 1-Wire e
    os cuidados com alimentação parasita.
21. Diferencie RS-422 de RS-485 quanto à possibilidade de múltiplos
    transmissores por par.
22. Para $Z_0=120\,\Omega$ e $Z_L=240\,\Omega$, calcule o coeficiente de
    reflexão $\Gamma$ e interprete seu sinal.
23. Explique por que uma terminação ativa PROFIBUS DP não deve ser substituída
    automaticamente por um resistor simples de $120\,\Omega$.
24. Identifique as funções de TCK, TMS, TDI e TDO em uma cadeia JTAG.
25. Estime o tempo de subida de um barramento de dreno aberto com
    $R_P=3{,}3\,\mathrm{k\Omega}$ e $C_B=200\,\mathrm{pF}$.
26. Proponha interfaces para três necessidades: sensor de temperatura local,
    memória flash de alta taxa e dispositivo de automação situado a dezenas de
    metros. Justifique a escolha considerando camada física e protocolo.

## Referências bibliográficas

- WAKERLY, John F. _Digital Design: Principles and Practices_. Pearson.
- HARRIS, David Money; HARRIS, Sarah L. _Digital Design and Computer
  Architecture_. Morgan Kaufmann.
- HOROWITZ, Paul; HILL, Winfield. _The Art of Electronics_. Cambridge
  University Press.
- NXP SEMICONDUCTORS. _I²C-bus specification and user manual_ (UM10204).
  Consultar a revisão aplicável ao projeto.
- MICROCHIP TECHNOLOGY. Documentação de controladores e periféricos UART, SPI e
  I²C. Consultar o manual específico do dispositivo utilizado.
- TEXAS INSTRUMENTS. Documentação de circuitos de adaptação de níveis lógicos,
  buffers e transceptores. Consultar as folhas de dados aplicáveis.
- Documentação técnica dos fabricantes dos sensores, atuadores, conversores,
  memórias e circuitos integrados empregados, incluindo características
  elétricas, diagramas temporais e condições de operação.

- ANALOG DEVICES / MAXIM INTEGRATED. Documentação técnica de dispositivos
  1-Wire e respectivas condições de alimentação.
- TIA. Especificações de interfaces seriais EIA/TIA-232, TIA-422 e TIA-485,
  conforme a revisão aplicável.
- PROFIBUS & PROFINET INTERNATIONAL. Guias e especificações PROFIBUS DP e
  PROFIBUS PA.
- IEEE. _IEEE Std 1149.1_: arquitetura de teste de fronteira e acesso TAP.
