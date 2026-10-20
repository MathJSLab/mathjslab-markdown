# HDL: síntese de um multiplexador

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
