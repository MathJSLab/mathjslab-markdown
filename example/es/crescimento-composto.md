# Crecimiento compuesto: un modelo multiplicativo

**Objetivo:** distinguir un aumento fijo de uno proporcional. **Extensiones:**
MathJSLab, MathJax.

## Ideas clave

En un modelo didáctico, una cantidad inicial de 1000 crece un 10% por período.
Cada nuevo valor es 1,1 veces el anterior: $1000,1100,1210,1331$. El aumento
absoluto cambia porque el porcentaje se aplica al valor actualizado.

$$
Q_n=Q_0(1+i)^n.
$$

Aquí $i=0{,}10$ y $n$ es el número de períodos completos. La fórmula no incluye
nuevas aportaciones, comisiones ni cambios en la razón; es un modelo
matemático, no una predicción de rentabilidad real.

```mathjslab
n = 0:5;
Q = 1000 * (1.1).^n;
L = 1000 + 100*n;
[n', Q', L']
```

Compáralo con $L_n=1000+100n$, que siempre añade 100. Los modelos coinciden
tras el primer período, pero se separan después. En `.^`, la potencia se aplica
a cada posición del vector. Las columnas muestran período, crecimiento
compuesto y crecimiento lineal.

## Practica

1. Compara los modelos en el tercer período.
2. ¿Qué factor representa una reducción del 10% por período?

## Respuestas comentadas

1. Compuesto: 1331; lineal: 1300.
2. El factor es 0,9; se usa $Q_n=Q_0(0{,}9)^n$.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/crescimento-composto.md) ·
[English](../en/crescimento-composto.md)
