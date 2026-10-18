# VCD: barramento tri-state e valores desconhecidos

Registro VCD digital local. Selecione sinais, ajuste Início/Fim e consulte o
Cursor; mude a base para comparar valores binários e hexadecimais. Este exemplo
é uma gravação ilustrativa, não executa HDL.

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

## Atividade

Qual a diferença entre x e z?

Resposta: x representa valor desconhecido; z representa alta impedância.
