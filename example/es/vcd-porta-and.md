# VCD: puerta AND y eventos irregulares

Registro VCD digital local. Seleccione señales, ajuste Inicio/Fin y consulte el
Cursor; cambie la base para comparar valores binarios y hexadecimales. Este
ejemplo es una grabación ilustrativa y no ejecuta HDL.

```vcd {width=100%}
$timescale 1 ns $end
$scope module tb $end
$var wire 1 ! a $end
$var wire 1 " b $end
$var wire 1 # y $end
$upscope $end
$enddefinitions $end
$dumpvars
0!
0"
0#
$end
#3
1!
#11
1"
1#
#25
0!
0#
#40
```

## Actividad

¿Por qué los intervalos tienen anchos distintos?

Respuesta: Las posiciones conservan los tiempos 3, 11 y 25 ns.
