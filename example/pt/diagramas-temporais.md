# Diagramas temporais digitais

**Extensões:** `wavedrom`, `didactic`, `cross-references`.

## Ideias principais

Cada caractere de `wave` representa uma etapa. O ponto prolonga o estado
anterior; dígitos entre 2 e 9 marcam segmentos de barramento com rótulos em
`data`. O segundo diagrama separa solicitação e confirmação.

Observe a {@ref diagram}.

:::: figure Construção {#diagram}

Os dois diagramas usam a mesma escala nativa. Os atributos opcionais de largura
e altura redimensionam o diagrama inteiro proporcionalmente; não são
necessários por padrão.

```wavedrom
{
  "config": { "hscale": 2 },
  "signal": [
    {
      "name": "clock",
      "wave": "p......"
    },
    {
      "name": "dados",
      "wave": "x.34.5x",
      "data": [
        "endereço",
        "valor",
        "fim"
      ]
    },
    {
      "name": "válido",
      "wave": "0.1..0."
    }
  ],
  "head": {
    "text": "Transferência",
    "tick": 0
  }
}
```

```wavedrom
{
  "config": { "hscale": 2 },
  "signal": [
    [
      "Controle",
      {
        "name": "solicitação",
        "wave": "01...0.",
        "node": ".a....."
      },
      {
        "name": "confirmação",
        "wave": "0..1.0.",
        "node": "...b..."
      }
    ],
    {
      "name": "clock",
      "wave": "p......"
    }
  ],
  "edge": [
    "a~>b resposta"
  ]
}
```

::::

## Prática

Em que etapa o sinal válido sobe? Quantas etapas separam a solicitação e a
confirmação?

::: solution Resposta comentada

Na etapa 2, contando desde zero. Os eventos a e b estão nas posições 1 e 3,
separados por duas etapas.

:::

[Índice da coleção](README.md)

[English](../en/diagramas-temporais.md) ·
[Español](../es/diagramas-temporais.md)
