# HDL: simulação de uma porta AND

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e
YoWASP no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
Markdown não pode autorizar execução. Consulte
doc/extensions/hdl-troubleshooting.md e doc/hdl-browser-results.md.

O executor retorna VCD para inspeção e JSON do Yosys para netlists. As
ferramentas e otimizações podem produzir representações diferentes.

## VHDL

```vhdl-run {width=75%}
{
  "operation": "simulate",
  "top": "tb",
  "standard": "08",
  "files": [
    {
      "name": "gate.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity gate is port(a,b: in std_logic; y: out std_logic); end;\narchitecture rtl of gate is begin y <= a and b; end;\n"
    },
    {
      "name": "tb.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity tb is end;\narchitecture test of tb is\n signal a,b,y: std_logic := '0';\nbegin\n dut: entity work.gate port map(a,b,y);\n process begin\n  wait for 10 ns; assert y = '0' severity failure;\n  a <= '1'; b <= '1'; wait for 10 ns;\n  assert y = '1' severity failure; wait;\n end process;\nend;\n"
    }
  ],
  "stopTimeNs": 100
}
```

## Verilog / SystemVerilog

```verilog-run {width=75%}
{
  "operation": "simulate",
  "top": "tb",
  "standard": "2012",
  "files": [
    {
      "name": "gate.v",
      "source": "module gate(input a, b, output y);\nassign y = a & b;\nendmodule\n"
    },
    {
      "name": "tb.sv",
      "source": "module tb;\nreg a=0, b=0; wire y;\ngate dut(a,b,y);\ninitial begin\n #10; if (y !== 0) $fatal(1, \"AND zero\");\n a=1; b=1; #10; if (y !== 1) $fatal(1, \"AND one\");\n $finish;\nend\nendmodule\n"
    }
  ],
  "stopTimeNs": 100
}
```

## Atividade

Quando a saída se torna 1?

Resposta: Quando ambas as entradas são 1, após a propagação da atualização.
