# HDL: síntese de um somador com carry

Requisitos de execução: executor HDL autorizado pelo aplicativo e serviço com
GHDL (VHDL), Icarus/VVP (simulação Verilog) e Yosys (síntese). No mathjslab-app
0.6.0, a execução em produção está desabilitada; em desenvolvimento é preciso
configurar o serviço loopback, o token e as opções do aplicativo em
sessionStorage["mathjslab.hdl.backend"] e recarregar a página. O Markdown não
pode autorizar a execução. Uma listagem do código não é um resultado de
simulação.

Requer um executor HDL fornecido e autorizado pelo aplicativo. O engine não
inclui compilador ou simulador. O aplicativo converte a saída da simulação para
WaveJSON ou a síntese para JSON do Yosys; as ferramentas e otimizações
escolhidas podem produzir representações diferentes.

## VHDL

```vhdl-run {width=75%}
{
  "operation": "synthesize",
  "top": "adder4",
  "standard": "08",
  "files": [
    {
      "name": "adder4.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; use ieee.numeric_std.all;\nentity adder4 is port(a,b: in unsigned(3 downto 0); y: out unsigned(4 downto 0)); end;\narchitecture rtl of adder4 is begin y <= resize(a,5) + resize(b,5); end;\n"
    }
  ]
}
```

## Verilog / SystemVerilog

```verilog-run {width=75%}
{
  "operation": "synthesize",
  "top": "adder4",
  "standard": "2012",
  "files": [
    {
      "name": "adder4.v",
      "source": "module adder4(input [3:0] a,b, output [4:0] y);\nassign y = {1'b0,a} + {1'b0,b};\nendmodule\n"
    }
  ]
}
```

## Atividade

Por que a saída tem cinco bits?

Resposta: Para representar até 15+15=30, incluindo o carry.
