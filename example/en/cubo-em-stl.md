# Cube: surface area, volume and triangle mesh

**Objective:** distinguish geometric faces from triangles in a digital
representation. **Extensions:** model-3d/STL, MathJax.

## Key ideas

A cube of edge length $a$ has six square faces, twelve edges and eight
vertices. Its total surface area is $6a^2$ and its volume is $a^3$. The model
below uses $a=1$ in abstract units.

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

STL describes surfaces using triangles. Each square face was divided into two,
giving twelve triangles. The diagonals introduced by triangulation are not new
edges of the geometric cube. Each `facet` contains three vertices and a normal
indicating orientation.

Rotate the solid to check that all faces are present. A surface model does not
directly show the interior, but a closed mesh can represent the boundary of a
volume. When a solid is scaled linearly, area and volume change by different
powers.

## Practice

1. Calculate area and volume for $a=2$.
2. How many triangles are in this STL and how many faces does the cube have?

## Answers with explanations

1. Area 24 square units and volume 8 cubic units.
2. Twelve digital triangles and six geometric faces.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/cubo-em-stl.md) · [Español](../es/cubo-em-stl.md)
