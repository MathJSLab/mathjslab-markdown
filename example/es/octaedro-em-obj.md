# Octaedro: vértices y caras

**Extensiones:** `model-3d`, `mathjax`.

## Ideas principales

Seis vértices sobre los ejes forman ocho caras triangulares. OBJ enumera
coordenadas y conectividad sin asignar una unidad física. Gire el sólido para
observar dos pirámides unidas por la base.

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

## Práctica

Use $V-E+F=2$ para determinar el número de aristas.

## Respuesta comentada

$6-E+8=2$, por lo que $E=12$. Cada arista pertenece a dos caras.

[Índice de la colección](README.md)

[Português brasileiro](../pt/octaedro-em-obj.md) ·
[English](../en/octaedro-em-obj.md)
