# VCD: AND gate and irregular events

Local digital VCD recording. Select signals, adjust Start/End and inspect the
Cursor; change radix to compare binary and hexadecimal values. This example is
an illustrative recording and does not execute HDL.

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

## Activity

Why do the intervals have different widths?

Answer: Positions preserve the times 3, 11 and 25 ns.
