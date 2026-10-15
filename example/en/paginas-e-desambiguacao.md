# Pages and citation disambiguation

**Extensions:** `citations`.

## Key ideas

Two fictional works by the same author in the same year need distinguishing:
[@alpha, p. 12] and [@beta, pp. 20-22]. The processor adds year suffixes and
preserves page locators.

```csl-json
[
  {
    "id": "alpha",
    "type": "book",
    "title": "Alpha",
    "author": [
      {
        "family": "Silva",
        "given": "Ana"
      }
    ],
    "issued": {
      "date-parts": [
        [
          2024
        ]
      ]
    }
  },
  {
    "id": "beta",
    "type": "book",
    "title": "Beta",
    "author": [
      {
        "family": "Silva",
        "given": "Ana"
      }
    ],
    "issued": {
      "date-parts": [
        [
          2024
        ]
      ]
    }
  }
]
```

```bibliography
{"style":"apa","lang":"en-US"}
```

## Practice

Why do citations use 2024a and 2024b? Do page locators change bibliography
titles?

## Answer with explanation

The suffixes distinguish works by the same author and year. Pages belong to the
particular citation without changing the work’s record.

[Collection index](README.md)

[Português brasileiro](../pt/paginas-e-desambiguacao.md) ·
[Español](../es/paginas-e-desambiguacao.md)
