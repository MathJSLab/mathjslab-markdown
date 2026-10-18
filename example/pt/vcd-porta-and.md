# VCD: porta AND e eventos irregulares

Registro VCD digital local. Selecione sinais, ajuste Início/Fim e consulte o
Cursor; mude a base para comparar valores binários e hexadecimais. Este exemplo
é uma gravação ilustrativa, não executa HDL.

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

## Atividade

Por que os intervalos têm larguras diferentes?

Resposta: As posições preservam os tempos 3, 11 e 25 ns.
