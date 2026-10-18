# VCD: reset and a four-bit counter

Local digital VCD recording. Select signals, adjust Start/End and inspect the
Cursor; change radix to compare binary and hexadecimal values. This example is
an illustrative recording and does not execute HDL.

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

## Activity

What is q at tick 25?

Answer: 2, displayed as 0x2 or 0010.
