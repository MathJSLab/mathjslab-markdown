# HDL: synthesizing an adder with carry

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

## Activity

Why does the output have five bits?

Answer: To represent up to 15+15=30, including the carry.
