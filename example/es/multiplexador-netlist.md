# Multiplexor de cuatro bits: buses

La netlist describe puertos, celdas y conexiones mediante identificadores de
bits. El esquema se genera localmente; no compila HDL ni ejecuta una
simulación.

## Netlist JSON

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
