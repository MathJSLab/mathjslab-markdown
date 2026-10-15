# Geometría espacial: un tetraedro en OBJ

**Objetivo:** identificar las caras, aristas y vértices de un poliedro.
**Extensiones:** model-3d y MathJax.

## Un sólido a partir de coordenadas

El tetraedro siguiente tiene cuatro vértices y cuatro caras triangulares. No es
regular: sus aristas no tienen todas la misma longitud. Las coordenadas
utilizan unidades de longitud abstractas.

```obj
o Tetraedro
v 0 0 0
v 2 0 0
v 0 2 0
v 0 0 2
f 1 3 2
f 1 2 4
f 1 4 3
f 2 3 4
```

En OBJ, cada línea `v` declara un vértice y cada `f` referencia los vértices
mediante índices que empiezan en 1. Gira el sólido para identificar las caras
ocultas. El modelo requiere soporte de WebGL en el entorno de visualización.

## Recuento y volumen

Hay $V=4$ vértices, $A=6$ aristas y $F=4$ caras. Se cumple la relación de Euler
para poliedros convexos: $V-A+F=2$. La base en el plano $z=0$ es un triángulo
rectángulo de área 2. La altura es 2:

$$
\text{Volumen}=\frac{\text{área de la base}\cdot\text{altura}}{3}=\frac43.
$$

## Practica

1. ¿Por qué cuatro caras no significan doce aristas diferentes?
2. Si todas las coordenadas se multiplican por 2, ¿cómo cambia el volumen?

## Respuestas comentadas

1. Cada arista pertenece a dos caras; el recuento $4\cdot3$ cuenta cada una dos
   veces.
2. El volumen se multiplica por $2^3=8$ y pasa a $32/3$ unidades cúbicas.
