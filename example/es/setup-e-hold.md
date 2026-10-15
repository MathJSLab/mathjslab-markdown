# Setup y hold: ventana de estabilidad

**Extensiones:** `wavedrom`, `didactic`, `cross-references`.

## Ideas principales

El dato debe estabilizarse antes del flanco de muestreo y permanecer estable
después. Los marcadores muestran el orden; la escala es ilustrativa y no
especifica tiempos de un dispositivo.

Observe la {@ref diagram}.

:::: figure Construcción {#diagram}

```wavedrom
{
  "signal": [
    {
      "name": "DATA",
      "wave": "x.3...x",
      "data": [
        "estable"
      ],
      "node": "..a.b.."
    },
    {
      "name": "CLK",
      "wave": "0..1.0.",
      "node": "...c..."
    }
  ],
  "edge": [
    "a~>c setup",
    "c~>b hold"
  ],
  "head": {
    "tick": 0
  }
}
```

::::

## Práctica

¿Qué marcador representa el muestreo? ¿Qué intervalo corresponde al hold?

::: solution Respuesta comentada

c representa el flanco de muestreo. El hold va de c a b, después del flanco.

:::

[Índice de la colección](README.md)

[Português brasileiro](../pt/setup-e-hold.md) ·
[English](../en/setup-e-hold.md)
