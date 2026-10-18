# VCD: tri-state bus and unknown values

Local digital VCD recording. Select signals, adjust Start/End and inspect the
Cursor; change radix to compare binary and hexadecimal values. This example is
an illustrative recording and does not execute HDL.

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

## Activity

What is the difference between x and z?

Answer: x represents an unknown value; z represents high impedance.
