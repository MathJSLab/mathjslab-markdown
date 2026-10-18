# Simulación interactiva: registro con enable

Requisitos de ejecución: ejecutor HDL autorizado por la aplicación y servicio
con GHDL (VHDL), Icarus/VVP (simulación Verilog) y Yosys (síntesis). En
mathjslab-app 0.6.0, la ejecución en producción está deshabilitada; en
desarrollo hay que configurar el servicio loopback, el token y las opciones de
la aplicación en sessionStorage["mathjslab.hdl.backend"] y recargar la página.
Markdown no puede autorizar la ejecución. Una lista de código no es un
resultado de simulación.

Requiere una sesión interactiva proporcionada y autorizada por la aplicación.
Avanzar aplica las entradas y simula 10 ns. Ejecutar repite pasos; Pausar
conserva el estado. Reiniciar termina la sesión y restaura las entradas. Los
ejemplos secuenciales generan internamente un reloj de 10 ns; este código de
prueba no está destinado a síntesis.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_register",
  "standard": "08",
  "files": [
    {
      "name": "live_register.vhd",
      "source": "library ieee;use ieee.std_logic_1164.all;entity live_register is port(d:in std_logic_vector(3 downto 0);enable:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture test of live_register is signal clk:std_logic:='0';signal value:std_logic_vector(3 downto 0):=(others=>'0');begin clk<=not clk after 5 ns;q<=value;process(clk)begin if rising_edge(clk)then if enable='1'then value<=d;end if;end if;end process;end;"
    }
  ],
  "inputs": [
    {
      "name": "d",
      "width": 4,
      "initial": "0101"
    },
    {
      "name": "enable",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "q",
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
  "top": "live_register",
  "standard": "2012",
  "files": [
    {
      "name": "live_register.sv",
      "source": "module live_register(input[3:0]d,input enable,output reg[3:0]q=0);reg clk=0;always #5 clk=~clk;always @(posedge clk) if(enable)q<=d;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "d",
      "width": 4,
      "initial": "0101"
    },
    {
      "name": "enable",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "q",
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

Respuesta: Tras el primer avance, q=0101. Con enable=0, cambiar d no modifica
q. Restaurar enable=1 captura d en el siguiente avance. Tras Reiniciar, las
salidas vuelven a x hasta una nueva ejecución.
