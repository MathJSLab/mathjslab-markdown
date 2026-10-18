# Digital simulation results: VCD viewer

Enable `features: ["vcd"]` or register `vcdExtension()` from
`mathjslab-markdown/extensions`. A `vcd` fence contains local digital Value
Change Dump data. No compiler, optional dependency, network or execution
permission is needed to inspect a recording. HDL execution still requires its
own policy.

```vcd
$timescale 1 ns $end
$scope module tb $end
$var wire 1 ! clock $end
$upscope $end
$enddefinitions $end
$dumpvars
0!
$end
#3
1!
#11
0!
#20
```

The SVG uses a proportional time axis, preserving irregular event spacing.
Times and cursor positions are integer ticks; the legend gives their duration
from `$timescale`. No resampling or invented clock period is applied. Values
are held until their next change; before initialization they are unknown.
Zero-duration recordings show a snapshot table without inventing an interval.

Select signals with checkboxes. Start and End define the visible time window;
Cursor inspects exact held values. Radix switches known buses between binary
and hex; mixed `x`/`z` states stay binary. Reset restores the full window and
cursor zero. Controls support keyboards and English, Portuguese and Spanish.
Use normal sizing, such as `vcd {width=75% height=20rem}`. Only graphics scale;
controls and tables keep their text size. The SVG supports themes, responsive
layout and Shadow DOM. Labels are text nodes, never markup. Updates/disposal
remove listeners; visible-mode rendering uses IntersectionObserver when
available.

## Supported subset

Digital scalars/vectors (`0`, `1`, `x`, `z`, `b...`), hierarchy, same-width
aliases, reference ranges, metadata, dump directives and one timescale of
1/10/100 s/ms/us/ns/ps/fs are supported. Short vectors pad with zeros or their
leading `x`/`z` state. Only explicit dump values are shown; unrecorded activity
is not inferred. Reals, strings, EVCD, FST, compressed files and unsupported
directives produce a diagnostic and preserve the source.

Timestamps must be nonnegative, monotonic safe integers. Distinct changes at
the same tick retain the last value and report `vcd-same-time-changes`;
zero-duration glitches are not drawn as intervals.

Limits are 512 KiB source (smaller host limits apply), 100,000 tokens, 128
signals including aliases, 256 bits per signal, scope depth 32 and 32,768
events. Initially 16 signals are selected; at most 32 can be displayed. A
window has at most 4,096 segments. Dense or invalid windows show a message;
narrow the window or select fewer signals. Data are not silently sampled or
truncated to satisfy the display limit.

Public `parseVCD(source)` returns `VCDDocument`; `vcdValueAt(signal, tick)`
retrieves held values by binary search. Types include `VCDSignal` and
`VCDChange`. This bounded viewer is not a replacement for GTKWave.

## HDL results

An authorized [HDL executor](hdl-execution.md) can return
`{status: "success", vcd: recording}`, alongside logs and a netlist. Return
either VCD or the existing WaveJSON `waveform`, not both. Both use the same
sizing and lifecycle. The overall HDL result limit of 512 KiB still applies,
including JSON encoding overhead. No compiler or simulator is bundled.

The translated [AND](../../example/en/vcd-porta-and.md),
[counter](../../example/en/vcd-contador.md),
[tri-state bus](../../example/en/vcd-barramento.md) and
[handshake](../../example/en/vcd-handshake.md) lessons provide four examples.

Primary references:
[Icarus Verilog VCD writer](https://github.com/steveicarus/iverilog/blob/master/vpi/sys_vcd.c)
and
[GTKWave VCD documentation](https://gtkwave.github.io/gtkwave/internals/vcd-recoding.html).

See [incremental HDL results](../incremental-results.md) for optional progress,
log/VCD streaming, provisional previews and final-result compatibility.

See [inspection and local exports](../inspection-and-export.md) for available
files, host callbacks and format limits.
