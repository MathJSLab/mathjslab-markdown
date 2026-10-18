# VCD: handshake e aliases hierárquicos

Registro VCD digital local. Selecione sinais, ajuste Início/Fim e consulte o
Cursor; mude a base para comparar valores binários e hexadecimais. Este exemplo
é uma gravação ilustrativa, não executa HDL.

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

## Atividade

req e dut.request podem divergir?

Resposta: Não neste registro: ambos usam o mesmo identificador VCD.

## Inspeção e exportação

Filtre a lista de sinais, selecione um sinal de navegação e percorra as
transições. Posicione Cursor B após Cursor para medir o intervalo. Compare os
valores decimais com e sem sinal. Exporte CSV dos sinais e da janela
selecionados, SVG do desenho visível ou VCD do registro completo.
