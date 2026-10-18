# Digital schematics from netlists

Enable `features: ["netlist"]` in `createEducationalMarkdownEngine`, or
register `netlistExtension()` from `mathjslab-markdown/extensions`. The
optional `netlistsvg` dependency loads on demand. No host capability or network
access is required during rendering.

Use a `netlist` fence containing strict JSON in the Yosys `write_json`
structure:

```netlist
{
  "modules": {
    "and_gate": {
      "ports": {
        "A": {"direction": "input", "bits": [2]},
        "B": {"direction": "input", "bits": [3]},
        "Y": {"direction": "output", "bits": [4]}
      },
      "cells": {
        "gate": {
          "type": "$_AND_",
          "port_directions": {"A": "input", "B": "input", "Y": "output"},
          "connections": {"A": [2], "B": [3], "Y": [4]}
        }
      }
    }
  }
}
```

For multiple modules, wrap the data as
`{"top": "module_name", "netlist": ...}`. Otherwise the renderer selects the
unique module marked by `attributes.top` equal to 1, or the only module.
Ambiguous selection produces a diagnostic. Each cell must include explicit
`port_directions` for its connections.

The extension presents existing connectivity. It does not compile VHDL or
Verilog, synthesize logic, simulate signals or flatten hierarchy. Known digital
cells use the bundled netlistsvg digital skin; other cells appear as generic
boxes. Buses retain their widths. Cell parameters and unused metadata do not
change presentation. Generate the netlist separately with your HDL toolchain.

Use the existing sizing attributes, for example `netlist {width=75%}` or
`netlist {width=32rem height=20rem}` on the opening fence. SVGs preserve their
proportions. Without attributes, native dimensions are limited by the available
content width. A white drawing surface keeps the fixed skin readable in both
light and dark documents.

Only input/output directions and bit constants `"0"`, `"1"` are accepted.
Bidirectional ports and constants `"x"`/`"z"` are rejected because this
renderer cannot represent them faithfully. Connected numeric identifiers must
be integers from 2 to 1,000,000. Names are plain text without XML markup.

Limits are 512 KiB of source, 16 modules, 128 external ports and 128 cells in
the selected module, 32 connections per cell, 256 bits per connection, 8,192
total connected bits, depth 24 and 30,000 JSON nodes. Smaller host source
limits still apply. Arbitrary skins, CSS, SVG and layout options are not
accepted. Invalid input preserves its source and reports a local extension
diagnostic.

Layout calls are serialized because netlistsvg shares internal skin state.
Cancellation skips queued work and prevents stale output; it cannot interrupt
an already running layout. The extension supports document updates, deferred
rendering, Shadow DOM, sanitized SVGs and disposal. SVG identifiers and styles
are scoped per diagram.

Public types include `MarkdownNetlistInput`, `YosysNetlist`, `NetlistModule`,
`NetlistCell`, `NetlistPort` and `NetlistBit`.

The [AND gate](../../example/en/porta-and-netlist.md),
[multiplexer](../../example/en/multiplexador-netlist.md),
[adder](../../example/en/somador-netlist.md) and
[flip-flop](../../example/en/registrador-netlist.md) lessons have matching
Portuguese and Spanish versions.

See [inspection and local exports](../inspection-and-export.md) for available
files, host callbacks and format limits.
