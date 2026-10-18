# Interactive simulation: multiplexer

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
  "top": "live_mux",
  "standard": "08",
  "files": [
    {
      "name": "live_mux.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; entity live_mux is port(a,b:in std_logic_vector(3 downto 0);s:in std_logic;y:out std_logic_vector(3 downto 0));end; architecture rtl of live_mux is begin y<=a when s='0' else b;end;"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 4,
      "initial": "0011"
    },
    {
      "name": "b",
      "width": 4,
      "initial": "1010"
    },
    {
      "name": "s",
      "width": 1,
      "initial": "0"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 4
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Verilog / SystemVerilog

```verilog-live {width=100%}
{
  "top": "live_mux",
  "standard": "2012",
  "files": [
    {
      "name": "live_mux.sv",
      "source": "module live_mux(input [3:0]a,b,input s,output [3:0]y);assign y=s?b:a;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 4,
      "initial": "0011"
    },
    {
      "name": "b",
      "width": 4,
      "initial": "1010"
    },
    {
      "name": "s",
      "width": 1,
      "initial": "0"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 4
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Activity

Change an input, step and compare the output. Pause and confirm that time does
not advance on its own. Reset and verify the initial state.

Answer: After the first step, y=0011. With s=1, the next step shows y=1010.
After Reset, outputs return to x until a new execution.
