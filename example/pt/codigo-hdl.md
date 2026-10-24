# VHDL e Verilog: quatro descrições de hardware

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e
YoWASP no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
Markdown não pode autorizar execução. Consulte
doc/extensions/hdl-troubleshooting.md e doc/hdl-browser-results.md.

Estes oito fences apenas exibem código com destaque de sintaxe. Eles não
compilam, sintetizam ou simulam hardware e não criam controles interativos.
Para essas operações, use as aulas específicas de execução com um backend
autorizado.

## 1. Porta AND

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

## 2. Multiplexador

```vhdl
library ieee;
use ieee.std_logic_1164.all;
entity mux2 is
  port (a, b, sel : in std_logic; y : out std_logic);
end entity;
architecture rtl of mux2 is
begin
  y <= a when sel = '0' else b;
end architecture;
```

```verilog
module mux2(input a, b, sel, output y);
  assign y = sel ? b : a;
endmodule
```

## 3. Flip-flop D

```vhdl
library ieee;
use ieee.std_logic_1164.all;
entity dff is
  port (clk, d : in std_logic; q : out std_logic);
end entity;
architecture rtl of dff is
begin
  process(clk)
  begin
    if rising_edge(clk) then q <= d; end if;
  end process;
end architecture;
```

```verilog
module dff(input clk, d, output reg q);
  always @(posedge clk) q <= d;
endmodule
```

## 4. Contador

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
entity counter4 is
  port (clk, reset : in std_logic; q : out unsigned(3 downto 0));
end entity;
architecture rtl of counter4 is
  signal count : unsigned(3 downto 0);
begin
  process(clk)
  begin
    if rising_edge(clk) then
      if reset = '1' then count <= (others => '0');
      else count <= count + 1; end if;
    end if;
  end process;
  q <= count;
end architecture;
```

```verilog
module counter4(input clk, reset, output reg [3:0] q);
  always @(posedge clk) begin
    if (reset) q <= 4'b0000;
    else q <= q + 4'b0001;
  end
endmodule
```
