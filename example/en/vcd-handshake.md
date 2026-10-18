# VCD: handshake and hierarchical aliases

Local digital VCD recording. Select signals, adjust Start/End and inspect the
Cursor; change radix to compare binary and hexadecimal values. This example is
an illustrative recording and does not execute HDL.

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

## Activity

Can req and dut.request differ?

Answer: Not in this recording: both use the same VCD identifier.

## Inspection and export

Filter the signal list, select a navigation signal and move between
transitions. Place Cursor B after Cursor to measure the interval. Compare
signed and unsigned decimal values. Export CSV for the selected signals and
window, SVG for the visible drawing, or VCD for the full recording.
