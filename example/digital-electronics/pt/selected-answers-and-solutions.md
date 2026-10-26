# Apêndice F. Respostas e soluções selecionadas {#appendix-f}

Este apêndice reúne soluções comentadas de exercícios efetivamente propostos no
**Capítulo 25** e nos **Apêndices A, D e E** de _Eletrônica Digital_. A
numeração conserva a correspondência com os enunciados originais. As respostas
discursivas e os projetos apresentados constituem **soluções possíveis**, não
implementações únicas nem substitutos para a verificação experimental.

## F.1. Convenções para a leitura das soluções

Em expressões booleanas, $+$ indica OR, a justaposição indica AND e a barra
indica negação. Para quantidades de memória, $1\,\mathrm{KiB}=1024$ bytes. Os
resultados aproximados são arredondados apenas na apresentação. Quando uma
resposta depende de condições não especificadas no exercício, essas condições
são explicitadas.

## F.2. Apêndice A — Fundamentos matemáticos complementares

**A.12.1 — Conversão de base.** O número $(110101{,}101)_2$ corresponde a

$$2^5+2^4+2^2+2^0+2^{-1}+2^{-3}=32+16+4+1+0{,}5+0{,}125=53{,}625.$$

Os pesos fracionários são $2^{-1}=1/2$, $2^{-2}=1/4$ e $2^{-3}=1/8$.

**A.12.2 — Número mínimo de bits.** Como $2^6=64<73\leq128=2^7$, são
necessários **7 bits**.

**A.12.3 — Soma em oito bits.** $245+30=275=256+19$. O registrador armazena
$19=00010011_2$, com transporte de saída igual a 1.

**A.12.4 — Transporte e transbordamento.** O transporte indica um resultado
fora da faixa _sem sinal_ da largura escolhida. O transbordamento com sinal
indica que a interpretação em complemento de dois não representa o resultado
matemático. Por exemplo, $127+1$ em oito bits produz $10000000_2$: ocorre
transbordamento com sinal, embora não haja transporte de saída.

**A.12.5 — Quantidade de funções booleanas.** Três variáveis admitem $2^3=8$
combinações. Como cada linha da tabela pode ter saída 0 ou 1, existem
$2^8=\mathbf{256}$ funções.

**A.12.6 — Simplificação booleana.**

$$A+\overline A B=(A+\overline A)(A+B)=1(A+B)=\boxed{A+B}.$$

**A.12.7 — Palavras com quatro bits iguais a 1.** Basta escolher quatro das dez
posições: $\binom{10}{4}=10!/(4!\,6!)=\mathbf{210}$.

**A.12.8 — Capacidade de memória.** Com 14 linhas de endereço, há
$2^{14}=16384$ palavras. Cada palavra contém 8 bits: $131072$ bits, ou $16384$
bytes = **16 KiB**.

**A.12.9 — Período de clock.**
$T=1/f=1/(80\times10^6)=\boxed{12{,}5\,\mathrm{ns}}$.

**A.12.10 — Tempo de subida RC.**
$\tau=RC=2{,}2\times10^3\cdot150\times10^{-12}=330\,\mathrm{ns}$. Para a
transição de 30% a 70%,
$t_{30\text{–}70}=\tau\ln(0{,}7/0{,}3)\approx\boxed{280\,\mathrm{ns}}$.

**A.12.11 — Passo de quantização.**
$\Delta=3{,}3/2^{12}=3{,}3/4096\approx\boxed{0{,}806\,\mathrm{mV}}$.

**A.12.12 — Reflexão.**
$\Gamma=(Z_L-Z_0)/(Z_L+Z_0)=(150-100)/(150+100)=\boxed{0{,}2}$.

**A.12.13 — Período mínimo.** Pelo modelo simplificado,
$T_{\min}=t_{cq,max}+t_{comb,max}+t_{setup}+t_{skew}=2+6+1+1=\boxed{10\,\mathrm{ns}}$,
correspondente a frequência máxima teórica de $100\,\mathrm{MHz}$.

**A.12.14 — Probabilidade de erro.** A probabilidade de nenhum erro é
$(1-10^{-4})^{100}$. Assim,

$$P(\text{ao menos um erro})=1-(0{,}9999)^{100}\approx\boxed{0{,}00995},$$

ou aproximadamente **0,995%**.

**A.12.15 — Amostragem.** A condição ideal $f_s>2f_{\max}$ pressupõe um sinal
limitado em banda e filtragem ideal. Filtros reais apresentam banda de
transição e atenuação finita; por isso, é necessário reservar margem entre a
banda útil e a frequência de Nyquist e considerar a rejeição exigida fora da
banda.

## F.3. Apêndice D — Introdução às ferramentas de simulação

**D.13.1 — Três níveis de simulação.** A funcional verifica relações lógicas e
sequências de estados; a temporal lógica incorpora atrasos e permite examinar
violações de temporização; a elétrica modela tensões, correntes e fenômenos
analógicos, como o carregamento de uma capacitância.

**D.13.2 — RTL e FPGA.** A simulação RTL pode não representar restrições
físicas de pinos, roteamento, atrasos após implementação, comportamento de
reset, sincronização de entradas assíncronas e características elétricas da
placa. É necessário complementar a simulação com síntese, análise temporal e
testes no hardware.

**D.13.3 — Teste exaustivo.** Seis entradas independentes produzem
$2^6=\boxed{64}$ combinações.

**D.13.4 — Testbench de XOR.** Exemplo em Verilog:

```verilog
module tb_xor;
  reg a, b;
  wire y;
  assign y = a ^ b;

  initial begin
    a=0; b=0; #1; if (y !== 0) $fatal;
    a=0; b=1; #1; if (y !== 1) $fatal;
    a=1; b=0; #1; if (y !== 1) $fatal;
    a=1; b=1; #1; if (y !== 0) $fatal;
    $display("XOR: quatro casos aprovados");
    $finish;
  end
endmodule
```

**D.13.5 — Reset assíncrono.** A descrição sequencial deve incluir a borda de
ativação do reset na lista de sensibilidade:
`always @(posedge clk or posedge rst)`. Dentro do bloco,
`if (rst) q <= 0; else ...`. Isso permite zerar o registrador sem esperar a
próxima borda de clock.

**D.13.6 — Teste de habilitação.** Inicialize o contador, mantenha `en=0` por
várias bordas e verifique a cada borda que `q` permanece constante. Em seguida,
ative `en` e confirme o avanço esperado.

**D.13.7 — Estados `X` e `Z`.** `X` representa valor lógico desconhecido ou
conflito não resolvido; `Z` representa alta impedância no modelo digital.
Nenhum dos dois determina, isoladamente, uma tensão elétrica específica.

**D.13.8 — Rede RC.**
$\tau=RC=2200\cdot300\times10^{-12}=\boxed{0{,}66\,\mathrm{\mu s}}$. O tempo de
30% a 70% é $\tau\ln(7/3)\approx\boxed{0{,}559\,\mathrm{\mu s}}$.

**D.13.9 — Carry-out do somador.** Calcule a referência em nove bits:
`{carry, soma} = A + B`. Inclua casos como $255+1$, $255+255$, $0+0$ e
operandos aleatórios, comparando separadamente os oito bits inferiores e o nono
bit.

**D.13.10 — VCD e análise temporal.** O arquivo VCD registra transições de
sinais durante uma execução simulada. A análise temporal estática verifica
caminhos e restrições de tempo sem exigir que um estímulo específico percorra
cada caminho.

**D.13.11 — Oráculo independente.** Se o teste reproduz o mesmo erro
algorítmico do circuito sob teste, ambos podem concordar incorretamente. Uma
referência independente, casos-limite e propriedades invariantes reduzem esse
risco.

**D.13.12 — Saída indefinida.** Verifique se o reset foi aplicado, se existe
clock, se todas as atribuições sequenciais são alcançadas, se o registrador
possui múltiplos drivers e se as entradas estão definidas antes da amostragem.

**D.13.13 — FSM com estados não utilizados.** Verifique a inicialização, as
transições válidas, a recuperação de codificações inválidas, as saídas nesses
estados e a ausência de travamentos. Uma política possível é retornar ao estado
inicial.

**D.13.14 — Condições iniciais SPICE.** A tensão inicial em capacitores e as
correntes iniciais em indutores alteram a resposta transitória. Uma simulação
que parte do ponto de operação pode diferir de outra iniciada com tensões
explicitamente impostas.

**D.13.15 — Cobertura de UART.** Inclua bytes $00$, $FF$, padrões alternados,
transmissões consecutivas, intervalos ociosos e cenários de erro de
enquadramento ou paridade, se implementados. O critério de aprovação deve
comparar bits transmitidos, temporização e sinalização de erro.

## F.4. Apêndice E — Experimentos de laboratório

**E.14.1 — Famílias lógicas.** Alimente cada família dentro de suas
especificações; utilize tradução de níveis quando necessário e meça as tensões
de entrada e saída. Não conecte saídas incompatíveis diretamente. Registre os
limites recomendados nas folhas de dados.

**E.14.2 — Influência da carga.** Monte uma tabela com resistência ou corrente
de carga, estado lógico, $V_{OH}$, $V_{OL}$, alimentação e temperatura. Repita
as medições com cargas diferentes, sem ultrapassar as correntes admissíveis.

**E.14.3 — De Morgan.** Teste as quatro entradas $00$, $01$, $10$, $11$ e
compare $\overline{AB}$ com $\overline A+\overline B$. As duas saídas devem
coincidir em todas as linhas.

**E.14.4 — Multiplexador.** Selecione $S=0$ e aplique $D_0\ne D_1$; depois
selecione $S=1$ com a mesma diferença. A troca indevida de $D_0$ e $D_1$
inverte os resultados esperados.

**E.14.5 — Repique de botão.** Observe o sinal bruto com analisador lógico ou
osciloscópio ao pressionar e soltar a tecla. Conte as bordas durante uma única
ação mecânica e compare com o sinal após um circuito ou algoritmo de
antirrepique.

**E.14.6 — Frequências do contador.** Para clock de $1\,\mathrm{kHz}$, cada
estágio divide por dois: $\boxed{500,\ 250,\ 125,\ 62{,}5\,\mathrm{Hz}}$.

**E.14.7 — Teste de reset.** Aplique o reset antes, durante e depois de
operações representativas. Isso distingue comportamento síncrono de assíncrono
e revela estados intermediários que um teste isolado poderia não detectar.

**E.14.8 — LSB do ADC.** $\Delta=3{,}3/1024\approx\boxed{3{,}223\,\mathrm{mV}}$
para o modelo ideal especificado.

**E.14.9 — Quadro UART.** Em 8N1 são 1 bit de início, 8 de dados e 1 de parada:
$10/9600\approx\boxed{1{,}042\,\mathrm{ms}}$.

**E.14.10 — Rede RC.** $\tau=4700\cdot10^{-8}=\boxed{47\,\mathrm{\mu s}}$. O
tempo de subida de 10% a 90% é $\tau\ln 9\approx\boxed{103{,}3\,\mathrm{\mu
s}}$.

**E.14.11 — Diagnóstico de alimentação.** Primeiro meça a alimentação
diretamente nos terminais do CI, incluindo quedas durante chaveamentos. Depois
aplique vetores lógicos conhecidos. Se a alimentação está fora da faixa, a
análise lógica isolada não é conclusiva.

**E.14.12 — FIFO de oito posições.** Teste leitura com FIFO vazia, escrita
quando cheia e alternância simultânea de leitura e escrita nas condições de
fronteira. Verifique indicadores `empty`/`full` e preservação da ordem dos
dados.

**E.14.13 — Instrumentos.** LED: indicação visual lenta de estado; analisador
lógico: sequências e relações temporais entre níveis digitais; osciloscópio:
forma analógica, ruído, sobre-elevação e tempos de borda.

**E.14.14 — Relatório de falha.** Registre: sintoma observado; hipótese causal;
medições e instrumentos; teste discriminante; resultado; correção realizada;
novo teste e conclusão. Uma hipótese refutada também deve permanecer
documentada.

**E.14.15 — Experimento integrador.** Exemplo: conectar um contador binário a
um transmissor UART e verificar se a sequência recebida corresponde às
contagens geradas. O teste integra circuitos sequenciais e comunicação serial.

## F.5. Capítulo 25 — Projetos integradores

**25.1 — Maioria com cinco entradas.** A saída é 1 quando pelo menos três
entradas são 1. Para $x_i\in\{0,1\}$, a condição é $\sum_{i=1}^{5}x_i\geq3$.
Uma implementação possível usa a soma dos bits e um comparador.

**25.2 — Maioria de três entradas com NAND.** A função é $M=AB+AC+BC$. Gere
$n_1=\overline{AB}$, $n_2=\overline{AC}$, $n_3=\overline{BC}$ e depois
$M=\overline{n_1n_2n_3}$, empregando NAND de três entradas na etapa final (ou
decomposição em NAND de duas entradas).

**25.3 — Confirmação registrada.** Uma solução é armazenar o resultado de
maioria em um flip-flop na borda de confirmação. O reset coloca a saída
registrada em 0; entradas que mudem sem confirmação não alteram o valor
armazenado.

**25.4 — Falha do semáforo.** Defina uma transição para estado seguro diante de
falha detectada. O padrão luminoso deve ser escolhido conforme os requisitos e
as normas aplicáveis; desligar todas as lâmpadas não é universalmente seguro.

**25.5 — Divisor de 100 MHz.** Para contar $100\,000\,000$ ciclos, é preciso
representar valores de 0 a $99\,999\,999$. Como $2^{26}<100\,000\,000<2^{27}$,
o contador requer **27 bits**. A emissão de um pulso a cada contagem completa
produz habilitação de 1 Hz.

**25.6 — Virada de dia.** Verifique a sequência
$23{:}59{:}58\to23{:}59{:}59\to00{:}00{:}00$; confirme que horas, minutos e
segundos mudam de maneira coerente na mesma transição de atualização e que não
surgem valores inválidos.

**25.7 — Antirrepique.** Sincronize o botão com o clock, aguarde estabilidade
por um intervalo definido e gere um único pulso por acionamento. Teste pressões
rápidas, longas e com múltiplas oscilações.

**25.8 — Três senhas incorretas.** Use um contador de tentativas consecutivas,
zerado após autenticação válida conforme a política adotada. Ao atingir três
falhas, entre em estado bloqueado; defina explicitamente o procedimento
autorizado de desbloqueio.

**25.9 — Soma na ULA.** Pela tabela da Seção 25.5, $S=10$ seleciona soma.
$1111_2+0001_2=10000_2$; a saída de quatro bits é $\boxed{0000_2}$, com
transporte $C=1$. Em complemento de dois, $-1+1=0$, portanto **não ocorre
transbordamento com sinal** ($V=0$).

**25.10 — Novas operações.** Amplie o campo de seleção para três bits,
preservando as quatro operações originais e acrescentando, por exemplo, `100`
para XOR e `101` para deslocamento lógico à esquerda. Defina o preenchimento
com zero e o destino do bit deslocado.

**25.11 — Taxa de armazenamento.** $25\,000$ amostras/s $\times16$ bits/amostra
= $\boxed{400\,000\,\mathrm{bit/s}}=\boxed{50\,000\,\mathrm{bytes/s}}$.

**25.12 — Buffer para 20 ms.** $25\,000\times0{,}020=500$ amostras. A 2 bytes
por amostra, a capacidade mínima teórica é $\boxed{1000\ \text{bytes}}$; uma
implementação deve prever margem para controle e variações temporais.

**25.13 — Sinal `DONE`.** Conte as bordas consecutivas em que `DONE=1` após
cada solicitação. A aprovação exige exatamente uma borda ativa por operação
concluída, seguida de retorno a zero antes da próxima conclusão.

**25.14 — Solicitação contínua.** Detecte a borda de subida de `START` ou exija
que o sinal volte a zero antes de aceitar nova operação. Um estado de espera
pela liberação impede repetição involuntária.

**25.15 — Acumulador de média.** O maior valor de 12 bits é 4095. A soma máxima
de 32 amostras é $32\cdot4095=131040$, que cabe em **17 bits**. A média inteira
pode ser obtida dividindo a soma por 32, com a política de arredondamento
escolhida.

**25.16 — Protocolo UART.** Uma proposta: byte de início de mensagem,
comprimento, identificador, dados e checksum de oito bits. O receptor verifica
comprimento e checksum antes de aceitar a mensagem; o mecanismo detecta alguns
erros, mas não todos.

**25.17 — Matriz de rastreabilidade.** Associe cada requisito a pelo menos um
teste: período de amostragem → medição entre pulsos; ordem FIFO → sequência
conhecida; integridade dos registros → comparação de dados; reset →
reinicialização em diferentes estados.

**25.18 — Tecnologias de implementação.** Portas discretas favorecem
demonstrações simples, mas aumentam interconexões. CPLD pode ser apropriado
para controle de complexidade moderada e temporização previsível. FPGA oferece
mais recursos e integração, exigindo ferramentas, configuração e análise
temporal. Custo e consumo dependem dos dispositivos concretos.

## F.6. Limites e critérios de validação

Os resultados numéricos pressupõem os modelos ideais indicados nos exercícios.
Em projetos reais, tolerâncias, atrasos, ruído, limites de alimentação,
condições de inicialização e protocolos devem ser considerados. Os exemplos de
HDL são modelos didáticos e não foram executados neste apêndice.

As soluções selecionadas devem ser confrontadas com os enunciados e as
convenções dos respectivos capítulos. Em particular, exercícios abertos admitem
diferentes arquiteturas corretas, desde que cumpram requisitos verificáveis.
