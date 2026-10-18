# HDL: estímulos y verificaciones

Requisitos de ejecución: ejecutor HDL autorizado por la aplicación y servicio
con GHDL (VHDL), Icarus/VVP (simulación Verilog) y Yosys (síntesis). En
mathjslab-app 0.6.0, la ejecución en producción está deshabilitada; en
desarrollo hay que configurar el servicio loopback, el token y las opciones de
la aplicación en sessionStorage["mathjslab.hdl.backend"] y recargar la página.
Markdown no puede autorizar la ejecución. Una lista de código no es un
resultado de simulación.

Ejecute la secuencia e inspeccione las verificaciones. Las entradas cambian en
0 y 7 ns. La salida se verifica en 7 y 12 ns. Reiniciar restaura la secuencia.

## VHDL

```vhdl-live
{
  "top": "live_and",
  "standard": "08",
  "files": [
    {
      "name": "live_and.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; entity live_and is port(a,b:in std_logic;y:out std_logic);end; architecture rtl of live_and is begin y<=a and b;end;"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 1,
      "initial": "0"
    },
    {
      "name": "b",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 1
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 12,
  "stimuli": [
    {
      "timeNs": 0,
      "inputs": {
        "a": "1"
      }
    },
    {
      "timeNs": 7,
      "inputs": {
        "a": "0"
      }
    }
  ],
  "checks": [
    {
      "id": "on",
      "timeNs": 7,
      "signal": "y",
      "expected": "1"
    },
    {
      "id": "off",
      "timeNs": 12,
      "signal": "y",
      "expected": "0"
    }
  ]
}
```

## Verilog

```verilog-live
{
  "top": "live_and",
  "standard": "2012",
  "files": [
    {
      "name": "live_and.sv",
      "source": "module live_and(input a,b,output y);assign y=a&b;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 1,
      "initial": "0"
    },
    {
      "name": "b",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 1
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 12,
  "stimuli": [
    {
      "timeNs": 0,
      "inputs": {
        "a": "1"
      }
    },
    {
      "timeNs": 7,
      "inputs": {
        "a": "0"
      }
    }
  ],
  "checks": [
    {
      "id": "on",
      "timeNs": 7,
      "signal": "y",
      "expected": "1"
    },
    {
      "id": "off",
      "timeNs": 12,
      "signal": "y",
      "expected": "0"
    }
  ]
}
```

## Inspección y exportación

Después de ejecutar la secuencia, exporte JSON e inspeccione los resultados de
las verificaciones y el historial confirmado de las entradas. Exporte TXT del
último registro confirmado. Pause y espere cualquier avance pendiente antes de
exportar. Reiniciar borra los resultados del informe y restaura el plan.
