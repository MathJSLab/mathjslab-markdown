# Octaedro: vértices e faces

**Extensões:** `model-3d`, `mathjax`.

## Ideias principais

Seis vértices sobre os eixos formam oito faces triangulares. O OBJ lista
coordenadas e conectividade; não atribui uma unidade física. Gire o sólido para
observar duas pirâmides unidas pela base.

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

## Prática

Use $V-E+F=2$ para determinar o número de arestas.

## Resposta comentada

$6-E+8=2$, então $E=12$. Cada aresta pertence a duas faces.

[Índice da coleção](README.md)

[English](../en/octaedro-em-obj.md) · [Español](../es/octaedro-em-obj.md)
