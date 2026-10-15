# Citations and bibliography

**Extensions:** `citations`.

## Key ideas

Ada Lovelace’s notes [@lovelace1843] and Turing’s paper [@turing1936] offer two
historical perspectives. We can cite both sources together [@lovelace1843;
@turing1936]. Data stay in the document, without external lookups.

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

## References

```bibliography
{"style":"apa","lang":"en-US"}
```

## Practice

Change `apa` to `vancouver` and reverse the first citations. What changes?

## Answer with explanation

The numeric style uses numbers in first-citation order. Changing that order
updates the bibliography.

[Collection index](README.md)

[Português brasileiro](../pt/citacoes-e-bibliografia.md) ·
[Español](../es/citacoes-e-bibliografia.md)
