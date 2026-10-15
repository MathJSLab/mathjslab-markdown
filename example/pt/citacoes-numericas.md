# Citações numéricas e ordem das fontes

**Extensões:** `citations`.

## Ideias principais

Estes registros são fictícios para demonstrar Vancouver. A primeira fonte
citada é a eólica [@wind]; a segunda é a solar [@solar]. Repetir a fonte eólica
[@wind] mantém seu número.

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
    "title": "Energia solar",
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
    "title": "Energia eólica",
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
    "title": "Energia hidráulica",
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
{"style":"vancouver","lang":"pt-BR"}
```

## Prática

Qual registro fica de fora da bibliografia? Por que wind recebe 1 mesmo
aparecendo depois de solar nos dados?

## Resposta comentada

hydro não foi citado. A numeração segue a primeira ocorrência no texto, não a
posição no JSON.

[Índice da coleção](README.md)

[English](../en/citacoes-numericas.md) · [Español](../es/citacoes-numericas.md)
