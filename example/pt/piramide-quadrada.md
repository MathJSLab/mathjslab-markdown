# Pirâmide de base quadrada: altura e volume

**Objetivo:** identificar altura perpendicular e calcular volume.
**Extensões:** model-3d/OBJ, MathJax.

## Ideias centrais

A pirâmide abaixo tem base quadrada de lado 2 e altura 3. A base está no plano
$y=0$ e o vértice superior é $(0,3,0)$. Há cinco vértices, oito arestas e cinco
faces geométricas.

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

O bloco OBJ usa uma face quadrangular para a base e quatro triangulares para as
laterais. A altura é perpendicular ao plano da base; não é igual à aresta
inclinada. O volume é:

$$
V=\frac{A_bh}{3}=\frac{4\cdot3}{3}=4.
$$

Gire o modelo para localizar base e ápice. Um prisma de mesma base e altura
teria volume 12. A comparação vale para volumes; não significa que as áreas
laterais sejam relacionadas pelo mesmo fator.

## Pratique

1. Se a altura dobra e a base permanece, qual é o novo volume?
2. Verifique $V_e-A_e+F=2$, usando contagens de vértices, arestas e faces.

## Respostas comentadas

1. 8 unidades cúbicas.
2. $5-8+5=2$. Aqui $V_e$ é contagem de vértices, não volume.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/piramide-quadrada.md) · [Español](../es/piramide-quadrada.md)
