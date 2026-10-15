# Cubo: superficie, volumen y malla triangular

**Objetivo:** distinguir caras geométricas de triángulos de la representación
digital. **Extensiones:** model-3d/STL, MathJax.

## Ideas clave

Un cubo de arista $a$ tiene seis caras cuadradas, doce aristas y ocho vértices.
Su área total es $6a^2$ y su volumen es $a^3$. El modelo siguiente utiliza
$a=1$ en unidades abstractas.

```stl
solid cube
facet normal 0 0 -1
 outer loop
  vertex 0 0 0
  vertex 1 1 0
  vertex 1 0 0
 endloop
endfacet
facet normal 0 0 -1
 outer loop
  vertex 0 0 0
  vertex 0 1 0
  vertex 1 1 0
 endloop
endfacet
facet normal 0 0 1
 outer loop
  vertex 0 0 1
  vertex 1 0 1
  vertex 1 1 1
 endloop
endfacet
facet normal 0 0 1
 outer loop
  vertex 0 0 1
  vertex 1 1 1
  vertex 0 1 1
 endloop
endfacet
facet normal 0 -1 0
 outer loop
  vertex 0 0 0
  vertex 1 0 0
  vertex 1 0 1
 endloop
endfacet
facet normal 0 -1 0
 outer loop
  vertex 0 0 0
  vertex 1 0 1
  vertex 0 0 1
 endloop
endfacet
facet normal 1 0 0
 outer loop
  vertex 1 0 0
  vertex 1 1 0
  vertex 1 1 1
 endloop
endfacet
facet normal 1 0 0
 outer loop
  vertex 1 0 0
  vertex 1 1 1
  vertex 1 0 1
 endloop
endfacet
facet normal 0 1 0
 outer loop
  vertex 1 1 0
  vertex 0 1 0
  vertex 0 1 1
 endloop
endfacet
facet normal 0 1 0
 outer loop
  vertex 1 1 0
  vertex 0 1 1
  vertex 1 1 1
 endloop
endfacet
facet normal -1 0 0
 outer loop
  vertex 0 1 0
  vertex 0 0 0
  vertex 0 0 1
 endloop
endfacet
facet normal -1 0 0
 outer loop
  vertex 0 1 0
  vertex 0 0 1
  vertex 0 1 1
 endloop
endfacet
endsolid cube
```

STL describe superficies mediante triángulos. Cada cara cuadrada se dividió en
dos, lo que produce doce triángulos. Las diagonales introducidas por la
triangulación no son nuevas aristas del cubo geométrico. Cada `facet` contiene
tres vértices y una normal que indica orientación.

Gira el sólido para comprobar que todas las caras estén presentes. Un modelo de
superficie no muestra directamente el interior, pero una malla cerrada puede
representar el límite de un volumen. Al ampliar linealmente el sólido, área y
volumen cambian con potencias distintas.

## Practica

1. Calcula área y volumen para $a=2$.
2. ¿Cuántos triángulos tiene este STL y cuántas caras tiene el cubo?

## Respuestas comentadas

1. Área 24 unidades cuadradas y volumen 8 unidades cúbicas.
2. Doce triángulos digitales y seis caras geométricas.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/cubo-em-stl.md) · [English](../en/cubo-em-stl.md)
