# Páginas e desambiguação de citações

**Extensões:** `citations`.

## Ideias principais

Duas obras fictícias do mesmo autor e ano precisam ser distinguidas: [@alpha,
p. 12] e [@beta, pp. 20-22]. O processador acrescenta letras ao ano e preserva
os localizadores de página.

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
{"style":"apa","lang":"pt-BR"}
```

## Prática

Por que as citações usam 2024a e 2024b? As páginas modificam os títulos na
bibliografia?

## Resposta comentada

As letras distinguem obras do mesmo autor e ano. As páginas pertencem à citação
específica, sem alterar o registro da obra.

[Índice da coleção](README.md)

[English](../en/paginas-e-desambiguacao.md) ·
[Español](../es/paginas-e-desambiguacao.md)
