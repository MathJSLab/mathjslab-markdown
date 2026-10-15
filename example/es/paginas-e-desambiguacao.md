# Páginas y desambiguación de citas

**Extensiones:** `citations`.

## Ideas principales

Dos obras ficticias del mismo autor y año deben distinguirse: [@alpha, p. 12] y
[@beta, pp. 20-22]. El procesador añade letras al año y conserva los
localizadores de página.

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
{"style":"apa","lang":"es-ES"}
```

## Práctica

¿Por qué las citas usan 2024a y 2024b? ¿Las páginas modifican los títulos de la
bibliografía?

## Respuesta comentada

Las letras distinguen obras del mismo autor y año. Las páginas pertenecen a la
cita concreta sin alterar el registro de la obra.

[Índice de la colección](README.md)

[Português brasileiro](../pt/paginas-e-desambiguacao.md) ·
[English](../en/paginas-e-desambiguacao.md)
