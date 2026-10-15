# Cubo: superfície, volume e malha triangular

**Objetivo:** distinguir faces geométricas de triângulos da representação
digital. **Extensões:** model-3d/STL, MathJax.

## Ideias centrais

Um cubo de aresta $a$ possui seis faces quadradas, doze arestas e oito
vértices. Sua área total é $6a^2$ e seu volume é $a^3$. O modelo abaixo usa
$a=1$ em unidades abstratas.

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

STL descreve superfícies por triângulos. Cada face quadrada foi dividida em
dois, produzindo doze triângulos. As diagonais introduzidas pela triangulação
não são novas arestas do cubo geométrico. Cada trecho `facet` contém três
vértices e uma normal que indica orientação.

Gire o sólido para verificar que todas as faces estão presentes. Um modelo
apenas de superfície não mostra diretamente o interior, mas uma malha fechada
permite representar o limite de um volume. Ao ampliar linearmente o sólido,
área e volume mudam com potências diferentes.

## Pratique

1. Calcule área e volume para $a=2$.
2. Quantos triângulos há neste STL e quantas faces tem o cubo?

## Respostas comentadas

1. Área 24 unidades quadradas e volume 8 unidades cúbicas.
2. Doze triângulos digitais e seis faces geométricas.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/cubo-em-stl.md) · [Español](../es/cubo-em-stl.md)
