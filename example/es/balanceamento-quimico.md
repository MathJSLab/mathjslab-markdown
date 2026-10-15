# Balanceo de ecuaciones: conservar átomos

**Objetivo:** ajustar coeficientes sin modificar fórmulas químicas.
**Extensiones:** MathJax, MathJSLab.

## Ideas clave

Balancear una ecuación significa igualar el número de átomos de cada elemento
en reactivos y productos. Los coeficientes multiplican moléculas o cantidades
de sustancia; los subíndices de la fórmula definen la sustancia y no deben
modificarse.

$$
\ce{2 H2 + O2 -> 2 H2O}.
$$

Hay cuatro hidrógenos y dos oxígenos a cada lado. Cambiar $\ce{H2O}$ por
$\ce{H2O2}$ modifica la sustancia en lugar de balancear la misma reacción. Los
menores coeficientes enteros son 2, 1 y 2.

```mathjslab
A = [2, 0, -2; 0, 2, -1];
c = [2; 1; 2];
A * c
```

En el bloque, las filas de $A$ corresponden a H y O; las columnas, a H₂, O₂ y
H₂O. Los átomos del producto tienen signo negativo. El vector de coeficientes
produce un residuo nulo. La proporción puede interpretarse también en moles,
pero no como la misma proporción de masas.

## Practica

1. Balancea $\ce{N2 + H2 -> NH3}$.
2. ¿Duplicar todos los coeficientes cambia la proporción?

## Respuestas comentadas

1. $\ce{N2 + 3 H2 -> 2 NH3}$.
2. No; conserva la proporción, pero no usa los menores enteros.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/balanceamento-quimico.md) ·
[English](../en/balanceamento-quimico.md)
