# Sumador de cuatro bits: estructura RTL

La netlist describe puertos, celdas y conexiones mediante identificadores de
bits. El esquema se genera localmente; no compila HDL ni ejecuta una
simulación.

## Netlist JSON

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
