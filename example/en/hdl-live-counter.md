# Interactive simulation: counter and reset

Requires an application-provided, authorized interactive session. Step applies
inputs and simulates 10 ns. Run repeats steps; Pause preserves state. Reset
ends the session and restores inputs. Sequential examples generate an internal
10 ns clock; this test code is not intended for synthesis.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_counter",
  "standard": "08",
  "files": [
    {
      "name": "live_counter.vhd",
      "source": "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity live_counter is port(rst:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture test of live_counter is signal clk:std_logic:='0';signal value:unsigned(3 downto 0):=(others=>'0');begin clk<=not clk after 5 ns;q<=std_logic_vector(value);process(clk)begin if rising_edge(clk)then if rst='1'then value<=(others=>'0');else value<=value+1;end if;end if;end process;end;"
    }
  ],
  "inputs": [
    {
      "name": "rst",
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
  "top": "live_counter",
  "standard": "2012",
  "files": [
    {
      "name": "live_counter.sv",
      "source": "module live_counter(input rst,output reg[3:0]q);reg clk=0;always #5 clk=~clk;always @(posedge clk) if(rst)q<=0;else q<=q+1;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "rst",
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

Answer: After the first step with rst=1, q=0000. With rst=0, the next 10 ns
step shows q=0001. After Reset, outputs return to x until a new execution.
