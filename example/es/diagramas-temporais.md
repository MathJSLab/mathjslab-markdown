# Diagramas temporales digitales

**Extensiones:** `wavedrom`, `didactic`, `cross-references`.

## Ideas principales

Cada carácter de `wave` representa una etapa. El punto prolonga el estado
anterior; los dígitos de 2 a 9 marcan segmentos del bus con etiquetas en
`data`. El segundo diagrama separa la solicitud y su confirmación.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

Los dos diagramas usan la misma escala nativa. Los atributos opcionales de
anchura y altura redimensionan el diagrama completo proporcionalmente; no se
necesitan por defecto.

```wavedrom
{
  "config": { "hscale": 2 },
  "signal": [
    {
      "name": "reloj",
      "wave": "p......"
    },
    {
      "name": "datos",
      "wave": "x.34.5x",
      "data": [
        "dirección",
        "valor",
        "fin"
      ]
    },
    {
      "name": "válido",
      "wave": "0.1..0."
    }
  ],
  "head": {
    "text": "Transferencia",
    "tick": 0
  }
}
```

```wavedrom
{
  "config": { "hscale": 2 },
  "signal": [
    [
      "Control",
      {
        "name": "solicitud",
        "wave": "01...0.",
        "node": ".a....."
      },
      {
        "name": "confirmación",
        "wave": "0..1.0.",
        "node": "...b..."
      }
    ],
    {
      "name": "reloj",
      "wave": "p......"
    }
  ],
  "edge": [
    "a~>b respuesta"
  ]
}
```

::::

## Práctica

¿En qué etapa sube la señal válida? ¿Cuántas etapas separan la solicitud y la
confirmación?

::: solution Respuesta comentada

En la etapa 2, contando desde cero. Los eventos a y b están en las posiciones 1
y 3, separados por dos etapas.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/diagramas-temporais.md) ·
[English](../en/diagramas-temporais.md)
