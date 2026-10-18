# HDL: simulación de un contador síncrono

Requisitos de ejecución: ejecutor HDL autorizado por la aplicación y servicio
con GHDL (VHDL), Icarus/VVP (simulación Verilog) y Yosys (síntesis). En
mathjslab-app 0.6.0, la ejecución en producción está deshabilitada; en
desarrollo hay que configurar el servicio loopback, el token y las opciones de
la aplicación en sessionStorage["mathjslab.hdl.backend"] y recargar la página.
Markdown no puede autorizar la ejecución. Una lista de código no es un
resultado de simulación.

Requiere un executor HDL proporcionado y autorizado por la aplicación. El
engine no incluye compilador ni simulador. La aplicación convierte la
simulación a WaveJSON o la síntesis a JSON de Yosys; las herramientas y
optimizaciones elegidas pueden producir representaciones distintas.

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
