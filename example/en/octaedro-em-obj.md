# Octahedron: vertices and faces

**Extensions:** `model-3d`, `mathjax`.

## Key ideas

Six vertices on the axes form eight triangular faces. OBJ lists coordinates and
connectivity without assigning a physical unit. Rotate the solid to see two
pyramids joined at their bases.

```obj
v 1 0 0
v 0 1 0
v -1 0 0
v 0 -1 0
v 0 0 1
v 0 0 -1
f 5 1 2
f 5 2 3
f 5 3 4
f 5 4 1
f 6 2 1
f 6 3 2
f 6 4 3
f 6 1 4
```

## Practice

Use $V-E+F=2$ to determine the number of edges.

## Answer with explanation

$6-E+8=2$, so $E=12$. Each edge belongs to two faces.

[Collection index](README.md)

[Português brasileiro](../pt/octaedro-em-obj.md) ·
[Español](../es/octaedro-em-obj.md)
