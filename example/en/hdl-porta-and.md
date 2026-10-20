# HDL: simulating an AND gate

Client execution: the application must authorize createBrowserHDLExecutor and
host its WebAssembly/Worker assets. Verilog uses Icarus and YoWASP in the
browser, without a service, token or sessionStorage. VHDL-2008 synthesis uses
GHDL and YoWASP in the browser; VHDL-2008 simulation and interactivity use NVC.
Markdown cannot authorize execution. See doc/extensions/hdl-troubleshooting.md
and doc/hdl-browser-results.md.

The executor returns VCD recordings and Yosys JSON netlists. Tools and
optimizations can produce different representations.

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

## Activity

When does the output become 1?

Answer: When both inputs are 1, after the update propagates.
