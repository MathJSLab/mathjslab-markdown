# HDL: síntese de um somador com carry

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e YoWASP
no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
Markdown não pode autorizar execução. Consulte
doc/extensions/hdl-troubleshooting.md e doc/hdl-browser-results.md.

O executor retorna VCD para inspeção e JSON do Yosys para netlists. As
ferramentas e otimizações podem produzir representações diferentes.

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
