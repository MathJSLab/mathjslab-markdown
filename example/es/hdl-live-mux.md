# Simulación interactiva: multiplexor

Requiere una sesión interactiva proporcionada y autorizada por la aplicación.
Avanzar aplica las entradas y simula 10 ns. Ejecutar repite pasos; Pausar
conserva el estado. Reiniciar termina la sesión y restaura las entradas. Los
ejemplos secuenciales generan internamente un reloj de 10 ns; este código de
prueba no está destinado a síntesis.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_mux",
  "standard": "08",
  "files": [
    {
      "name": "live_mux.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; entity live_mux is port(a,b:in std_logic_vector(3 downto 0);s:in std_logic;y:out std_logic_vector(3 downto 0));end; architecture rtl of live_mux is begin y<=a when s='0' else b;end;"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 4,
      "initial": "0011"
    },
    {
      "name": "b",
      "width": 4,
      "initial": "1010"
    },
    {
      "name": "s",
      "width": 1,
      "initial": "0"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 4
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Verilog / SystemVerilog

```verilog-live {width=100%}
{
  "top": "live_mux",
  "standard": "2012",
  "files": [
    {
      "name": "live_mux.sv",
      "source": "module live_mux(input [3:0]a,b,input s,output [3:0]y);assign y=s?b:a;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 4,
      "initial": "0011"
    },
    {
      "name": "b",
      "width": 4,
      "initial": "1010"
    },
    {
      "name": "s",
      "width": 1,
      "initial": "0"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 4
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Actividad

Cambie una entrada, avance y compare la salida. Pause y confirme que el tiempo
no avanza solo. Reinicie y compruebe el estado inicial.

Respuesta: Tras el primer avance, y=0011. Con s=1, el siguiente avance muestra
y=1010. Tras Reiniciar, las salidas vuelven a x hasta una nueva ejecución.
