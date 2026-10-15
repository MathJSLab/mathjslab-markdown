# Square-based pyramid: height and volume

**Objective:** identify perpendicular height and calculate volume.
**Extensions:** model-3d/OBJ, MathJax.

## Key ideas

The pyramid below has a square base of side 2 and height 3. Its base lies in
the plane $y=0$ and the apex is $(0,3,0)$. There are five vertices, eight edges
and five geometric faces.

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

The OBJ block uses a quadrilateral base face and four triangular side faces.
Height is perpendicular to the base plane; it is not equal to a sloping edge.
The volume is:

$$
V=\frac{A_bh}{3}=\frac{4\cdot3}{3}=4.
$$

Rotate the model to locate the base and apex. A prism with the same base and
height would have volume 12. This comparison concerns volume; it does not imply
the same factor for lateral surface areas.

## Practice

1. If height doubles with the same base, what is the new volume?
2. Check $V_e-A_e+F=2$ using vertex, edge and face counts.

## Answers with explanations

1. 8 cubic units.
2. $5-8+5=2$. Here $V_e$ counts vertices, not volume.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/piramide-quadrada.md) ·
[Español](../es/piramide-quadrada.md)
