# Solid geometry: a tetrahedron in OBJ

**Objective:** identify a polyhedron's faces, edges and vertices.
**Extensions:** model-3d and MathJax.

## A solid from coordinates

The tetrahedron below has four vertices and four triangular faces. It is not
regular: its edges do not all have the same length. The coordinates use
abstract length units.

```obj
o Tetrahedron
v 0 0 0
v 2 0 0
v 0 2 0
v 0 0 2
f 1 3 2
f 1 2 4
f 1 4 3
f 2 3 4
```

In OBJ, each `v` line declares a vertex and each `f` references vertices by
their indices, starting at 1. Rotate the solid to identify hidden faces. The
model requires WebGL support in the viewing environment.

## Counting and volume

There are $V=4$ vertices, $A=6$ edges and $F=4$ faces. Euler's relation for
convex polyhedra is satisfied: $V-A+F=2$. The base in the $z=0$ plane is a
right triangle of area 2. The height is 2:

$$
\text{Volume}=\frac{\text{base area}\cdot\text{height}}{3}=\frac43.
$$

## Practice

1. Why do four faces not mean twelve distinct edges?
2. If all coordinates are multiplied by 2, how does the volume change?

## Answers with explanations

1. Each edge belongs to two faces; $4\cdot3$ counts each one twice.
2. The volume is multiplied by $2^3=8$, becoming $32/3$ cubic units.
