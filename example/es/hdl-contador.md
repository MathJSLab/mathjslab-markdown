# HDL: simulación de un contador síncrono

Ejecución en el cliente: la aplicación debe autorizar createBrowserHDLExecutor
y alojar sus assets WebAssembly/Worker. Verilog usa Icarus y YoWASP en el
navegador, sin servicio, token ni sessionStorage. La síntesis VHDL-2008 usa
GHDL y YoWASP en el navegador; simulación e interactividad VHDL-2008 usan
el runtime NVC. Markdown no puede autorizar la ejecución. Consulte
doc/extensions/hdl-troubleshooting.md y doc/hdl-browser-results.md.

El ejecutor devuelve registros VCD y netlists JSON de Yosys. Las herramientas y
optimizaciones pueden producir representaciones diferentes.

## VHDL

```vhdl-run {width=75%}
{
  "operation": "simulate",
  "top": "tb",
  "standard": "08",
  "files": [
    {
      "name": "counter.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; use ieee.numeric_std.all;\nentity counter is port(clk,rst: in std_logic; q: out std_logic_vector(3 downto 0)); end;\narchitecture rtl of counter is\n signal value: unsigned(3 downto 0) := (others => '0');\nbegin\n q <= std_logic_vector(value);\n process(clk) begin\n  if rising_edge(clk) then\n   if rst = '1' then value <= (others => '0'); else value <= value + 1; end if;\n  end if;\n end process;\nend;\n"
    },
    {
      "name": "tb.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity tb is end;\narchitecture test of tb is\n signal clk: std_logic := '0'; signal rst: std_logic := '1';\n signal q: std_logic_vector(3 downto 0);\nbegin\n clk <= not clk after 5 ns;\n dut: entity work.counter port map(clk,rst,q);\n process begin\n  wait for 12 ns; rst <= '0'; wait for 14 ns;\n  assert q = \"0010\" severity failure; wait;\n end process;\nend;\n"
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
      "name": "counter.v",
      "source": "module counter(input clk, rst, output reg [3:0] q);\nalways @(posedge clk)\n if (rst) q <= 0; else q <= q + 1;\nendmodule\n"
    },
    {
      "name": "tb.sv",
      "source": "module tb;\nreg clk=0, rst=1; wire [3:0] q;\ncounter dut(clk,rst,q);\nalways #5 clk=~clk;\ninitial begin\n #12 rst=0; #14; if (q !== 2) $fatal(1, \"counter\");\n #54; $finish;\nend\nendmodule\n"
    }
  ],
  "stopTimeNs": 100
}
```

## Actividad

¿El reset es síncrono o asíncrono?

Respuesta: Síncrono: el cambio ocurre en el flanco de subida del reloj.
