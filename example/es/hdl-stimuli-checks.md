# HDL: estímulos y verificaciones

Ejecución en el cliente: la aplicación debe autorizar createBrowserHDLExecutor
y alojar sus assets WebAssembly/Worker. Verilog usa Icarus y YoWASP en el
navegador, sin servicio, token ni sessionStorage. La síntesis VHDL-2008 usa
GHDL y YoWASP en el navegador; simulación e interactividad VHDL-2008 usan
el runtime NVC. Markdown no puede autorizar la ejecución. Consulte
doc/extensions/hdl-troubleshooting.md y doc/hdl-browser-results.md.

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
