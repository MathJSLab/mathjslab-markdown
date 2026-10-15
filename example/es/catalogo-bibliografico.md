# Catálogo bibliográfico sin citas

**Extensiones:** `citations`.

## Ideas principales

Un catálogo puede listar todos los registros aunque no haya citas en el texto.
Estos libros son ficticios. `includeUncited` incluye los tres registros;
Harvard ordena las entradas por autor.

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
{"style":"harvard1","lang":"es-ES","includeUncited":true}
```

## Práctica

¿Qué ocurre al cambiar includeUncited a false? ¿El JSON debe estar en orden
alfabético?

## Respuesta comentada

La lista queda vacía porque no se citó ningún registro. El procesador aplica la
ordenación del estilo.

[Índice de la colección](README.md)

[Português brasileiro](../pt/catalogo-bibliografico.md) ·
[English](../en/catalogo-bibliografico.md)
