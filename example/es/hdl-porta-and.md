# HDL: simulación de una puerta AND

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
      "name": "gate.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity gate is port(a,b: in std_logic; y: out std_logic); end;\narchitecture rtl of gate is begin y <= a and b; end;\n"
    },
    {
      "name": "tb.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity tb is end;\narchitecture test of tb is\n signal a,b,y: std_logic := '0';\nbegin\n dut: entity work.gate port map(a,b,y);\n process begin\n  wait for 10 ns; assert y = '0' severity failure;\n  a <= '1'; b <= '1'; wait for 10 ns;\n  assert y = '1' severity failure; wait;\n end process;\nend;\n"
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
      "name": "gate.v",
      "source": "module gate(input a, b, output y);\nassign y = a & b;\nendmodule\n"
    },
    {
      "name": "tb.sv",
      "source": "module tb;\nreg a=0, b=0; wire y;\ngate dut(a,b,y);\ninitial begin\n #10; if (y !== 0) $fatal(1, \"AND zero\");\n a=1; b=1; #10; if (y !== 1) $fatal(1, \"AND one\");\n $finish;\nend\nendmodule\n"
    }
  ],
  "stopTimeNs": 100
}
```

## Actividad

¿Cuándo la salida pasa a 1?

Respuesta: Cuando ambas entradas son 1, tras propagarse la actualización.
