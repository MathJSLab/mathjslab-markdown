# Porta AND: esquema por netlist

A netlist descreve portas, células e conexões por identificadores de bits. O
esquema é gerado localmente; não compila HDL nem executa uma simulação.

## Netlist JSON

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

## Inspeção e exportação

Exporte SVG para salvar o esquema ou JSON para salvar a netlist original. A
exportação não executa novamente a síntese.
