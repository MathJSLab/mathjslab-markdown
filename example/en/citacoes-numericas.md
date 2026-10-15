# Numeric citations and source order

**Extensions:** `citations`.

## Key ideas

These records are fictional demonstrations of Vancouver. The first source cited
is wind [@wind]; the second is solar [@solar]. Repeating the wind source
[@wind] keeps its number.

```csl-json
[
  {
    "id": "solar",
    "type": "book",
    "author": [
      {
        "family": "Silva",
        "given": "Ana"
      }
    ],
    "title": "Solar energy",
    "issued": {
      "date-parts": [
        [
          2020
        ]
      ]
    }
  },
  {
    "id": "wind",
    "type": "book",
    "author": [
      {
        "family": "Costa",
        "given": "Bruno"
      }
    ],
    "title": "Wind energy",
    "issued": {
      "date-parts": [
        [
          2021
        ]
      ]
    }
  },
  {
    "id": "hydro",
    "type": "book",
    "author": [
      {
        "family": "Lima",
        "given": "Carla"
      }
    ],
    "title": "Hydropower",
    "issued": {
      "date-parts": [
        [
          2022
        ]
      ]
    }
  }
]
```

```bibliography
{"style":"vancouver","lang":"en-US"}
```

## Practice

Which record is left out of the bibliography? Why does wind receive 1 even
though it follows solar in the data?

## Answer with explanation

hydro was not cited. Numbering follows first occurrence in the text, not
position in JSON.

[Collection index](README.md)

[Português brasileiro](../pt/citacoes-numericas.md) ·
[Español](../es/citacoes-numericas.md)
