# D flip-flop: connections and clock

The netlist describes ports, cells and connections using bit identifiers. The
schematic is generated locally; it does not compile HDL or execute a
simulation.

## JSON netlist

```netlist
{
  "modules": {
    "dff": {
      "attributes": {
        "top": 1
      },
      "ports": {
        "D": {
          "direction": "input",
          "bits": [
            2
          ]
        },
        "C": {
          "direction": "input",
          "bits": [
            3
          ]
        },
        "Q": {
          "direction": "output",
          "bits": [
            4
          ]
        }
      },
      "cells": {
        "gate": {
          "type": "$_DFF_P_",
          "parameters": {},
          "attributes": {},
          "port_directions": {
            "D": "input",
            "C": "input",
            "Q": "output"
          },
          "connections": {
            "D": [
              2
            ],
            "C": [
              3
            ],
            "Q": [
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
