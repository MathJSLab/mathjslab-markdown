# HDL: scripted stimuli and checks

Client execution: the application must authorize createBrowserHDLExecutor and
host its WebAssembly/Worker assets. Verilog uses Icarus and YoWASP in the
browser, without a service, token or sessionStorage. VHDL-2008 synthesis uses
GHDL and YoWASP in the browser; VHDL-2008 simulation and interactivity use NVC.
Markdown cannot authorize execution. See doc/extensions/hdl-troubleshooting.md
and doc/hdl-browser-results.md.

Run the sequence and inspect the checks. Inputs change at 0 and 7 ns. The
output is checked at 7 and 12 ns. Reset restores the sequence.

## VHDL

```vhdl-live
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
  "stopTimeNs": 12,
  "stimuli": [
    {
      "timeNs": 0,
      "inputs": {
        "a": "1"
      }
    },
    {
      "timeNs": 7,
      "inputs": {
        "a": "0"
      }
    }
  ],
  "checks": [
    {
      "id": "on",
      "timeNs": 7,
      "signal": "y",
      "expected": "1"
    },
    {
      "id": "off",
      "timeNs": 12,
      "signal": "y",
      "expected": "0"
    }
  ]
}
```

## Verilog

```verilog-live
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
  "stopTimeNs": 12,
  "stimuli": [
    {
      "timeNs": 0,
      "inputs": {
        "a": "1"
      }
    },
    {
      "timeNs": 7,
      "inputs": {
        "a": "0"
      }
    }
  ],
  "checks": [
    {
      "id": "on",
      "timeNs": 7,
      "signal": "y",
      "expected": "1"
    },
    {
      "id": "off",
      "timeNs": 12,
      "signal": "y",
      "expected": "0"
    }
  ]
}
```

## Inspection and export

After running the sequence, export JSON and inspect the check results and
committed input history. Export TXT for the latest confirmed log. Pause and
wait for any pending step before exporting. Reset clears the report results and
restores the plan.
