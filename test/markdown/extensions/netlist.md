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
