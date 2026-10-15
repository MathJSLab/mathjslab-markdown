# Matrices y transformaciones en el plano

**Objetivo:** interpretar una matriz como regla de transformación de
coordenadas. **Extensiones:** MathJSLab, MathJax.

## Ideas clave

Una matriz puede transformar un vector de coordenadas. Considera
$R=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$. Al multiplicar $R$ por $(x,y)^T$
obtenemos $(-y,x)^T$: una rotación de $90^\circ$ en sentido antihorario
alrededor del origen. La longitud se conserva.

```mathjslab
R = [0, -1; 1, 0];
P = [1, 0, 1; 0, 1, 1];
R * P
R * R
D = [2, 0; 0, 1];
R * D * [1; 1]
D * R * [1; 1]
```

Cada columna de $P$ es un punto: $(1,0)$, $(0,1)$ y $(1,1)$. El operador `*`
realiza la multiplicación matricial; se diferencia de la multiplicación
elemento a elemento `.*`. Aplicar $R$ dos veces produce media vuelta.

La matriz $D=\begin{pmatrix}2&0\\0&1\end{pmatrix}$, en cambio, duplica la
coordenada horizontal. No conserva todas las longitudes. Distintas
transformaciones pueden dar resultados diferentes si se invierte su orden.

## Practica

1. Transforma $(2,3)$ con $R$.
2. Compara $RD(1,1)^T$ y $DR(1,1)^T$.

## Respuestas comentadas

1. El resultado es $(-3,2)$.
2. Son $(-1,2)$ y $(-2,1)$; el orden importa.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/matrizes-transformacoes.md) ·
[English](../en/matrizes-transformacoes.md)
