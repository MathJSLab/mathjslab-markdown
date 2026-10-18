# Four-bit multiplexer: buses

The netlist describes ports, cells and connections using bit identifiers. The
schematic is generated locally; it does not compile HDL or execute a
simulation.

## JSON netlist

```netlist {width=75%}
{
  "modules": {
    "mux4": {
      "attributes": {
        "top": 1
      },
      "ports": {
        "A": {
          "direction": "input",
          "bits": [
            2,
            3,
            4,
            5
          ]
        },
        "B": {
          "direction": "input",
          "bits": [
            6,
            7,
            8,
            9
          ]
        },
        "S": {
          "direction": "input",
          "bits": [
            10
          ]
        },
        "Y": {
          "direction": "output",
          "bits": [
            11,
            12,
            13,
            14
          ]
        }
      },
      "cells": {
        "gate": {
          "type": "$_MUX_",
          "parameters": {},
          "attributes": {},
          "port_directions": {
            "A": "input",
            "B": "input",
            "S": "input",
            "Y": "output"
          },
          "connections": {
            "A": [
              2,
              3,
              4,
              5
            ],
            "B": [
              6,
              7,
              8,
              9
            ],
            "S": [
              10
            ],
            "Y": [
              11,
              12,
              13,
              14
            ]
          }
        }
      },
      "netnames": {}
    }
  }
}
```
