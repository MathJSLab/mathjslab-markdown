# HDL: síntese de um multiplexador

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
  "top": "mux4",
  "standard": "08",
  "files": [
    {
      "name": "mux4.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity mux4 is port(a,b: in std_logic_vector(3 downto 0); s: in std_logic; y: out std_logic_vector(3 downto 0)); end;\narchitecture rtl of mux4 is begin y <= a when s = '0' else b; end;\n"
    }
  ]
}
```

## Verilog / SystemVerilog

```verilog-run {width=75%}
{
  "operation": "synthesize",
  "top": "mux4",
  "standard": "2012",
  "files": [
    {
      "name": "mux4.v",
      "source": "module mux4(input [3:0] a,b, input s, output [3:0] y);\nassign y = s ? b : a;\nendmodule\n"
    }
  ]
}
```

## Atividade

Qual barramento é selecionado por s=1?

Resposta: O barramento b. A síntese deve preservar a seleção dos quatro bits.
