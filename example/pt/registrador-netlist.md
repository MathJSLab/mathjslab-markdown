# Flip-flop D: conexões e clock

A netlist descreve portas, células e conexões por identificadores de bits. O
esquema é gerado localmente; não compila HDL nem executa uma simulação.

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
