# Expressões lógicas: portas e combinações

Os exemplos são declarativos. Diagramas mostram a estrutura; não executam uma
simulação.

## 1. Porta AND

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

## 3. Meio somador

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

## 4. Paridade

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
