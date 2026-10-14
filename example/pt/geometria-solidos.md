# Geometria espacial: um tetraedro em OBJ

**Objetivo:** identificar faces, arestas e vértices de um poliedro.
**Extensões:** model-3d e MathJax.

## Um sólido a partir de coordenadas

O tetraedro abaixo tem quatro vértices e quatro faces triangulares. Ele não é
regular: suas arestas não têm todas o mesmo comprimento. As coordenadas são
unidades de comprimento abstratas.

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

Em OBJ, cada linha `v` declara um vértice e cada `f` referencia os vértices
pelos índices, começando em 1. Gire o sólido para identificar as faces ocultas.
O modelo exige suporte a WebGL no ambiente de visualização.

## Contagem e volume

São $V=4$ vértices, $A=6$ arestas e $F=4$ faces. A relação de Euler para
poliedros convexos é satisfeita: $V-A+F=2$. A base no plano $z=0$ é um
triângulo retângulo de área 2. A altura é 2:

$$
\text{Volume}=\frac{\text{área da base}\cdot\text{altura}}{3}=\frac43.
$$

## Pratique

1. Por que quatro faces não significam doze arestas diferentes?
2. Se todas as coordenadas forem multiplicadas por 2, como muda o volume?

## Respostas comentadas

1. Cada aresta pertence a duas faces; a contagem $4\cdot3$ conta cada uma duas
   vezes.
2. O volume é multiplicado por $2^3=8$, passando a $32/3$ unidades cúbicas.
