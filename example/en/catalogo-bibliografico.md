# Bibliographic catalogue without citations

**Extensions:** `citations`.

## Key ideas

A catalogue can list every record even without citations in the body. These
books are fictional. `includeUncited` includes all three records; Harvard
orders entries by author.

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
{"style":"harvard1","lang":"en-US","includeUncited":true}
```

## Practice

What happens if includeUncited becomes false? Must JSON already be
alphabetized?

## Answer with explanation

The list becomes empty because no record was cited. The processor applies the
style’s sorting rules.

[Collection index](README.md)

[Português brasileiro](../pt/catalogo-bibliografico.md) ·
[Español](../es/catalogo-bibliografico.md)
