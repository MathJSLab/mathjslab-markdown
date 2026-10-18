# HDL: synthesizing an adder with carry

Execution requirements: an application-authorized HDL executor and a service
with GHDL (VHDL), Icarus/VVP (Verilog simulation) and Yosys (synthesis). In
mathjslab-app 0.6.0, production execution is disabled; development requires the
loopback service, token and application settings in
sessionStorage["mathjslab.hdl.backend"], followed by a reload. Markdown cannot
authorize execution. A source listing is not a simulation result.

Requires an application-provided, authorized HDL executor. The engine includes
no compiler or simulator. The application converts simulation output to
WaveJSON or synthesis output to Yosys JSON; chosen tools and optimizations may
produce different representations.

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
