# HDL: síntesis de un sumador con acarreo

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

## Actividad

¿Por qué la salida tiene cinco bits?

Respuesta: Para representar hasta 15+15=30, incluido el acarreo.
