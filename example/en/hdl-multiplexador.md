# HDL: synthesizing a multiplexer

Requires an application-provided, authorized HDL executor. The engine includes
no compiler or simulator. The application converts simulation output to
WaveJSON or synthesis output to Yosys JSON; chosen tools and optimizations may
produce different representations.

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
