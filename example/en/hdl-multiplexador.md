# HDL: synthesizing a multiplexer

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

## Activity

Which bus does s=1 select?

Answer: Bus b. Synthesis should preserve selection of all four bits.
