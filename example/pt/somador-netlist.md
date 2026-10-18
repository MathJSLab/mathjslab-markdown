# Somador de quatro bits: estrutura RTL

A netlist descreve portas, células e conexões por identificadores de bits. O
esquema é gerado localmente; não compila HDL nem executa uma simulação.

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
