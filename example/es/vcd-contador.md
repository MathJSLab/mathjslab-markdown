# VCD: reset y contador de cuatro bits

Registro VCD digital local. Seleccione señales, ajuste Inicio/Fin y consulte el
Cursor; cambie la base para comparar valores binarios y hexadecimales. Este
ejemplo es una grabación ilustrativa y no ejecuta HDL.

```vcd {width=100%}
$timescale 1 ns $end
$scope module tb $end
$var wire 1 ! clk $end
$var wire 1 " rst $end
$var reg 4 # q [3:0] $end
$upscope $end
$enddefinitions $end
$dumpvars
0!
1"
bx #
$end
#5
1!
b0 #
#10
0!
0"
#15
1!
b1 #
#20
0!
#25
1!
b10 #
#30
0!
#35
1!
b11 #
#40
```

## Actividad

¿Cuál es q en el tick 25?

Respuesta: 2, mostrado como 0x2 o 0010.
