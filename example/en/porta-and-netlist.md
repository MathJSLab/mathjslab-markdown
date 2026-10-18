# AND gate: netlist schematic

The netlist describes ports, cells and connections using bit identifiers. The
schematic is generated locally; it does not compile HDL or execute a
simulation.

## JSON netlist

```netlist
{
  "modules": {
    "and_gate": {
      "attributes": {
        "top": 1
      },
      "ports": {
        "A": {
          "direction": "input",
          "bits": [
            2
          ]
        },
        "B": {
          "direction": "input",
          "bits": [
            3
          ]
        },
        "Y": {
          "direction": "output",
          "bits": [
            4
          ]
        }
      },
      "cells": {
        "gate": {
          "type": "$_AND_",
          "parameters": {},
          "attributes": {},
          "port_directions": {
            "A": "input",
            "B": "input",
            "Y": "output"
          },
          "connections": {
            "A": [
              2
            ],
            "B": [
              3
            ],
            "Y": [
              4
            ]
          }
        }
      },
      "netnames": {}
    }
  }
}
```

## Inspection and export

Export SVG to save the schematic, or JSON to save the original netlist.
Exporting does not run synthesis again.
