# Citas y bibliografía

**Extensiones:** `citations`.

## Ideas principales

Las notas de Ada Lovelace [@lovelace1843] y el trabajo de Turing [@turing1936]
ofrecen dos perspectivas históricas. Podemos citar ambas fuentes juntas
[@lovelace1843; @turing1936]. Los datos permanecen en el documento, sin
consultas externas.

```bibtex
@article{lovelace1843,
  author={Lovelace, Ada},
  title={Notes on the Analytical Engine},
  journal={Scientific Memoirs},
  year={1843},
  volume={3}
}
```

```csl-json
[
  {
    "id": "turing1936",
    "type": "article-journal",
    "author": [
      {
        "family": "Turing",
        "given": "Alan M."
      }
    ],
    "title": "On Computable Numbers, with an Application to the Entscheidungsproblem",
    "container-title": "Proceedings of the London Mathematical Society",
    "issued": {
      "date-parts": [
        [
          1936
        ]
      ]
    },
    "volume": "s2-42",
    "page": "230-265"
  }
]
```

## Referencias

```bibliography
{"style":"apa","lang":"es-ES"}
```

## Práctica

Cambie `apa` por `vancouver` e invierta las primeras citas. ¿Qué cambia?

## Respuesta comentada

El estilo numérico usa números según el orden de la primera cita. Cambiar ese
orden actualiza la bibliografía.

[Índice de la colección](README.md)

[Português brasileiro](../pt/citacoes-e-bibliografia.md) ·
[English](../en/citacoes-e-bibliografia.md)
