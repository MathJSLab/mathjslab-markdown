# Four-bit adder: RTL structure

The netlist describes ports, cells and connections using bit identifiers. The
schematic is generated locally; it does not compile HDL or execute a
simulation.

## JSON netlist

```netlist
{
  "modules": {
    "adder4": {
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
        "Y": {
          "direction": "output",
          "bits": [
            10,
            11,
            12,
            13
          ]
        }
      },
      "cells": {
        "gate": {
          "type": "$add",
          "parameters": {},
          "attributes": {},
          "port_directions": {
            "A": "input",
            "B": "input",
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
            "Y": [
              10,
              11,
              12,
              13
            ]
          }
        }
      },
      "netnames": {}
    }
  }
}
```
