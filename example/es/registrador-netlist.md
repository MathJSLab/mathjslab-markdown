# Flip-flop D: conexiones y reloj

La netlist describe puertos, celdas y conexiones mediante identificadores de
bits. El esquema se genera localmente; no compila HDL ni ejecuta una
simulación.

## Netlist JSON

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
