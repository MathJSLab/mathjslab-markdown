# Puerta AND: esquema de netlist

La netlist describe puertos, celdas y conexiones mediante identificadores de
bits. El esquema se genera localmente; no compila HDL ni ejecuta una
simulación.

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

## Inspección y exportación

Exporte SVG para guardar el esquema o JSON para guardar la netlist original. La
exportación no vuelve a ejecutar la síntesis.
