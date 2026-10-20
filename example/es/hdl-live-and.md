# Simulación interactiva: puerta AND

Ejecución en el cliente: la aplicación debe autorizar createBrowserHDLExecutor
y alojar sus assets WebAssembly/Worker. Verilog usa Icarus y YoWASP en el
navegador, sin servicio, token ni sessionStorage. La síntesis VHDL-2008 usa
GHDL y YoWASP en el navegador; simulación e interactividad VHDL-2008 usan
el runtime NVC. Markdown no puede autorizar la ejecución. Consulte
doc/extensions/hdl-troubleshooting.md y doc/hdl-browser-results.md.

Requiere una sesión interactiva proporcionada y autorizada por la aplicación.
Avanzar aplica las entradas y simula 10 ns. Ejecutar repite pasos; Pausar
conserva el estado. Reiniciar termina la sesión y restaura las entradas. Los
ejemplos secuenciales generan internamente un reloj de 10 ns; este código de
prueba no está destinado a síntesis.

## VHDL

```vhdl-live {width=100%}
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
  "stopTimeNs": 1000
}
```

## Verilog / SystemVerilog

```verilog-live {width=100%}
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
  "stopTimeNs": 1000
}
```

## Actividad

Cambie una entrada, avance y compare la salida. Pause y confirme que el tiempo
no avanza solo. Reinicie y compruebe el estado inicial.

Respuesta: Tras el primer avance, y=0. Con a=b=1, el siguiente avance muestra
y=1. Tras Reiniciar, las salidas vuelven a x hasta una nueva ejecución.
