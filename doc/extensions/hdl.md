# HDL source presentation

The built-in syntax highlighting extension recognizes `vhdl` and `verilog`
fences. Aliases `vhd`, `sv` and `systemverilog` are also accepted. The
SystemVerilog aliases use the installed Verilog highlighter; highlighting is
lexical presentation, not a promise of full language parsing or validation.

```vhdl
library ieee;
use ieee.std_logic_1164.all;
entity and_gate is
  port (a, b : in std_logic; y : out std_logic);
end entity;
architecture rtl of and_gate is
begin
  y <= a and b;
end architecture;
```

```verilog
module and_gate(input a, b, output y);
  assign y = a & b;
endmodule
```

These are ordinary code blocks. No execution, synthesis, simulation or circuit
conversion takes place. Highlighting needs no additional optional dependency or
host capability. HTML-looking strings remain code text.

Use [WaveDrom](wavedrom.md) for declarative timing, register and logic
diagrams, Mermaid or Graphviz for manually described block/state diagrams, and
TikZ for technical drawings.
[Application-owned HDL execution](hdl-execution.md) uses separate `vhdl-run`
and `verilog-run` fences to obtain simulation results and netlists from an
explicitly authorized host executor.

The [three-language examples](../../example/README.md) include matching AND,
multiplexer, D flip-flop and counter descriptions in both languages, four
register maps and four logic-expression examples.
