# Interactive simulation: AND gate

Execution requirements: an application-authorized HDL executor and a service
with GHDL (VHDL), Icarus/VVP (Verilog simulation) and Yosys (synthesis). In
mathjslab-app 0.6.0, production execution is disabled; development requires the
loopback service, token and application settings in
sessionStorage["mathjslab.hdl.backend"], followed by a reload. Markdown cannot
authorize execution. A source listing is not a simulation result.

Requires an application-provided, authorized interactive session. Step applies
inputs and simulates 10 ns. Run repeats steps; Pause preserves state. Reset
ends the session and restores inputs. Sequential examples generate an internal
10 ns clock; this test code is not intended for synthesis.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_and",
  "standard": "08",
  "files": [
    {
      "name": "live_and.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; entity live_and is port(a,b:in std_logic;y:out std_logic);end; architecture rtl of live_and is begin y<=a and b;end;"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 1,
      "initial": "0"
    },
    {
      "name": "b",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 1
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Verilog / SystemVerilog

```verilog-live {width=100%}
{
  "top": "live_and",
  "standard": "2012",
  "files": [
    {
      "name": "live_and.sv",
      "source": "module live_and(input a,b,output y);assign y=a&b;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 1,
      "initial": "0"
    },
    {
      "name": "b",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 1
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Activity

Change an input, step and compare the output. Pause and confirm that time does
not advance on its own. Reset and verify the initial state.

Answer: After the first step, y=0. With a=b=1, the next step shows y=1. After
Reset, outputs return to x until a new execution.
