# Catálogo bibliográfico sem citações

**Extensões:** `citations`.

## Ideias principais

Um catálogo pode listar todos os registros, mesmo sem citações no corpo. Estes
livros são fictícios. `includeUncited` inclui os três registros; Harvard ordena
as entradas por autor.

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
{"style":"harvard1","lang":"pt-BR","includeUncited":true}
```

## Prática

O que acontece ao mudar includeUncited para false? O JSON precisa estar em
ordem alfabética?

## Resposta comentada

A lista fica vazia, porque nenhum registro foi citado. O processador aplica a
ordenação do estilo.

[Índice da coleção](README.md)

[English](../en/catalogo-bibliografico.md) ·
[Español](../es/catalogo-bibliografico.md)
