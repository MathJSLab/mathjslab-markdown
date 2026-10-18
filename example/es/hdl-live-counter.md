# Simulación interactiva: contador y reset

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
  "top": "live_counter",
  "standard": "08",
  "files": [
    {
      "name": "live_counter.vhd",
      "source": "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity live_counter is port(rst:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture test of live_counter is signal clk:std_logic:='0';signal value:unsigned(3 downto 0):=(others=>'0');begin clk<=not clk after 5 ns;q<=std_logic_vector(value);process(clk)begin if rising_edge(clk)then if rst='1'then value<=(others=>'0');else value<=value+1;end if;end if;end process;end;"
    }
  ],
  "inputs": [
    {
      "name": "rst",
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
  "top": "live_counter",
  "standard": "2012",
  "files": [
    {
      "name": "live_counter.sv",
      "source": "module live_counter(input rst,output reg[3:0]q);reg clk=0;always #5 clk=~clk;always @(posedge clk) if(rst)q<=0;else q<=q+1;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "rst",
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

Respuesta: Tras el primer avance con rst=1, q=0000. Con rst=0, el siguiente
avance de 10 ns muestra q=0001. Tras Reiniciar, las salidas vuelven a x hasta
una nueva ejecución.
