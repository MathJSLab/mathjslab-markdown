# Interactive simulation: enabled register

Requires an application-provided, authorized interactive session. Step applies
inputs and simulates 10 ns. Run repeats steps; Pause preserves state. Reset
ends the session and restores inputs. Sequential examples generate an internal
10 ns clock; this test code is not intended for synthesis.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_register",
  "standard": "08",
  "files": [
    {
      "name": "live_register.vhd",
      "source": "library ieee;use ieee.std_logic_1164.all;entity live_register is port(d:in std_logic_vector(3 downto 0);enable:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture test of live_register is signal clk:std_logic:='0';signal value:std_logic_vector(3 downto 0):=(others=>'0');begin clk<=not clk after 5 ns;q<=value;process(clk)begin if rising_edge(clk)then if enable='1'then value<=d;end if;end if;end process;end;"
    }
  ],
  "inputs": [
    {
      "name": "d",
      "width": 4,
      "initial": "0101"
    },
    {
      "name": "enable",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "q",
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
  "top": "live_register",
  "standard": "2012",
  "files": [
    {
      "name": "live_register.sv",
      "source": "module live_register(input[3:0]d,input enable,output reg[3:0]q=0);reg clk=0;always #5 clk=~clk;always @(posedge clk) if(enable)q<=d;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "d",
      "width": 4,
      "initial": "0101"
    },
    {
      "name": "enable",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "q",
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

Answer: After the first step, q=0101. With enable=0, changing d does not change
q. Restoring enable=1 captures d on the next step. After Reset, outputs return
to x until a new execution.
