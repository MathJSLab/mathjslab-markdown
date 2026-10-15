# Pirámide de base cuadrada: altura y volumen

**Objetivo:** identificar la altura perpendicular y calcular el volumen.
**Extensiones:** model-3d/OBJ, MathJax.

## Ideas clave

La pirámide siguiente tiene base cuadrada de lado 2 y altura 3. La base está en
el plano $y=0$ y el vértice superior es $(0,3,0)$. Hay cinco vértices, ocho
aristas y cinco caras geométricas.

```obj
o pyramid
v -1 0 -1
v 1 0 -1
v 1 0 1
v -1 0 1
v 0 3 0
f 1 2 3 4
f 1 5 2
f 2 5 3
f 3 5 4
f 4 5 1
```

El bloque OBJ utiliza una cara cuadrangular para la base y cuatro triangulares
para los lados. La altura es perpendicular al plano de la base; no coincide con
la arista inclinada. El volumen es:

$$
V=\frac{A_bh}{3}=\frac{4\cdot3}{3}=4.
$$

Gira el modelo para localizar base y ápice. Un prisma con la misma base y
altura tendría volumen 12. La comparación vale para volúmenes; no implica el
mismo factor para las áreas laterales.

## Practica

1. Si la altura se duplica y la base no cambia, ¿cuál es el nuevo volumen?
2. Comprueba $V_e-A_e+F=2$ con los recuentos de vértices, aristas y caras.

## Respuestas comentadas

1. 8 unidades cúbicas.
2. $5-8+5=2$. Aquí $V_e$ cuenta vértices, no volumen.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/piramide-quadrada.md) ·
[English](../en/piramide-quadrada.md)
