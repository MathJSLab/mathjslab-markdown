# VCD: reset e contador de quatro bits

Registro VCD digital local. Selecione sinais, ajuste Início/Fim e consulte o
Cursor; mude a base para comparar valores binários e hexadecimais. Este exemplo
é uma gravação ilustrativa, não executa HDL.

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

## Atividade

Qual é o valor de q no tick 25?

Resposta: 2, mostrado como 0x2 ou 0010.
