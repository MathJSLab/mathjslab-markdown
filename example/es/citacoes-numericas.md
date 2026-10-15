# Citas numéricas y orden de las fuentes

**Extensiones:** `citations`.

## Ideas principales

Estos registros son ficticios para demostrar Vancouver. La primera fuente
citada es la eólica [@wind]; la segunda es la solar [@solar]. Repetir la fuente
eólica [@wind] conserva su número.

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
    "title": "Energía solar",
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
    "title": "Energía eólica",
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
    "title": "Energía hidráulica",
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
{"style":"vancouver","lang":"es-ES"}
```

## Práctica

¿Qué registro queda fuera de la bibliografía? ¿Por qué wind recibe 1 aunque
aparece después de solar en los datos?

## Respuesta comentada

hydro no se citó. La numeración sigue la primera aparición en el texto, no la
posición en el JSON.

[Índice de la colección](README.md)

[Português brasileiro](../pt/citacoes-numericas.md) ·
[English](../en/citacoes-numericas.md)
