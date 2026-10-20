# VHDL y Verilog: cuatro descripciones de hardware

Ejecución en el cliente: la aplicación debe autorizar createBrowserHDLExecutor
y alojar sus assets WebAssembly/Worker. Verilog usa Icarus y YoWASP en el
navegador, sin servicio, token ni sessionStorage. La síntesis VHDL-2008 usa
GHDL y YoWASP en el navegador; simulación e interactividad VHDL-2008 usan
el runtime NVC. Markdown no puede autorizar la ejecución. Consulte
doc/extensions/hdl-troubleshooting.md y doc/hdl-browser-results.md.

Estos ocho fences solo muestran código con resaltado de sintaxis. No compilan,
sintetizan ni simulan hardware y no crean controles interactivos. Para esas
operaciones, utilice las lecciones específicas de ejecución con un backend
autorizado.

## 1. Puerta AND

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

## 2. Multiplexor

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
