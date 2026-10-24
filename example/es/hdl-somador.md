# HDL: síntesis de un sumador con acarreo

Ejecución en el cliente: la aplicación debe autorizar createBrowserHDLExecutor
y alojar sus assets WebAssembly/Worker. Verilog usa Icarus y YoWASP en el
navegador, sin servicio, token ni sessionStorage. La síntesis VHDL-2008 usa
GHDL y YoWASP en el navegador; simulación e interactividad VHDL-2008 usan el
runtime NVC. Markdown no puede autorizar la ejecución. Consulte
doc/extensions/hdl-troubleshooting.md y doc/hdl-browser-results.md.

El ejecutor devuelve registros VCD y netlists JSON de Yosys. Las herramientas y
optimizaciones pueden producir representaciones diferentes.

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
