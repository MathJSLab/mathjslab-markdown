# Logic expressions: gates and combinations

The examples are declarative. Diagrams show structure; they do not execute a
simulation.

## 1. AND gate

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

## 2. Combined logic

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

## 3. Half adder

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

## 4. Parity

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
