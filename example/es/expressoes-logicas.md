# Expresiones lógicas: puertas y combinaciones

Los ejemplos son declarativos. Los diagramas muestran la estructura; no
ejecutan una simulación.

## 1. Puerta AND

```wavedrom
{
  "assign": [
    [
      "Y",
      [
        "&",
        "A",
        "B"
      ]
    ]
  ]
}
```

## 2. Lógica combinada

```wavedrom
{
  "assign": [
    [
      "Y",
      [
        "|",
        [
          "&",
          "A",
          "B"
        ],
        [
          "~",
          "C"
        ]
      ]
    ]
  ]
}
```

## 3. Semisumador

```wavedrom
{
  "assign": [
    [
      "SUM",
      [
        "^",
        "A",
        "B"
      ]
    ],
    [
      "CARRY",
      [
        "&",
        "A",
        "B"
      ]
    ]
  ]
}
```

## 4. Paridad

```wavedrom
{
  "assign": [
    [
      "PARITY",
      [
        "^",
        "D0",
        "D1",
        "D2",
        "D3"
      ]
    ]
  ]
}
```
