# VCD: bus tri-state y valores desconocidos

Registro VCD digital local. Seleccione señales, ajuste Inicio/Fin y consulte el
Cursor; cambie la base para comparar valores binarios y hexadecimales. Este
ejemplo es una grabación ilustrativa y no ejecuta HDL.

```vcd {width=100%}
$timescale 1 ns $end
$scope module tb $end
$var wire 8 ! bus [7:0] $end
$var wire 1 " enable $end
$upscope $end
$enddefinitions $end
$dumpvars
bz !
0"
$end
#8
1"
b10100101 !
#17
b10x1z010 !
#28
0"
bz !
#40
```

## Actividad

¿Qué diferencia hay entre x y z?

Respuesta: x representa un valor desconocido; z representa alta impedancia.
