# VCD: handshake y alias jerárquicos

Registro VCD digital local. Seleccione señales, ajuste Inicio/Fin y consulte el
Cursor; cambie la base para comparar valores binarios y hexadecimales. Este
ejemplo es una grabación ilustrativa y no ejecuta HDL.

```vcd {width=100%}
$timescale 1 ns $end
$scope module tb $end
$var wire 1 ! req $end
$var wire 1 " ack $end
$scope module dut $end
$var wire 1 ! request $end
$upscope $end
$upscope $end
$enddefinitions $end
$dumpvars
0!
0"
$end
#4
1!
#13
1"
#19
0!
#27
0"
#40
```

## Actividad

¿Pueden diferir req y dut.request?

Respuesta: No en este registro: ambos usan el mismo identificador VCD.

## Inspección y exportación

Filtre la lista de señales, seleccione una señal de navegación y recorra las
transiciones. Coloque Cursor B después de Cursor para medir el intervalo.
Compare los valores decimales con y sin signo. Exporte CSV de las señales y la
ventana seleccionadas, SVG del dibujo visible o VCD del registro completo.
