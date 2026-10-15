# Sistemas lineales: resolver y comprobar

**Objetivo:** resolver dos ecuaciones y comprobar la solución por sustitución.
**Extensiones:** MathJSLab y MathJax.

## Un problema de cantidades

Dos tipos de cajas contienen 2 y 3 unidades, respectivamente. Un conjunto tiene
siete cajas y dieciocho unidades. Si $x$ es la cantidad de cajas del primer
tipo e $y$ la del segundo, tenemos:

$$
\begin{cases}
x+y=7,\\
2x+3y=18.
\end{cases}
$$

Multiplica la primera ecuación por 2 y réstala de la segunda: $y=4$. Entonces
$x=3$. La solución cumple también la condición física de cantidades enteras y
no negativas.

## Forma matricial

La matriz de coeficientes es %`[1, 1; 2, 3]`% y el vector de términos
independientes es %`[7; 18]`%. La división matricial por la izquierda resuelve
el sistema en el bloque siguiente. La variable `solucao` significa «solución».

```mathjslab
A = [1, 1; 2, 3];
b = [7; 18];
solucao = A \ b
A * solucao
A * solucao - b
```

El vector solución debe contener 3 y 4. El último resultado es el residuo: cero
indica que la sustitución satisface ambas ecuaciones dentro de la precisión
numérica. No todos los sistemas tienen una solución única: las ecuaciones
dependientes o incompatibles requieren un análisis adicional.

## Practica

1. Comprueba la solución sin utilizar matrices.
2. ¿Qué ocurre al cambiar la segunda ecuación por $2x+2y=14$?
3. ¿Y por $2x+2y=15$?

## Respuestas comentadas

1. $3+4=7$ y $2\cdot3+3\cdot4=18$.
2. La segunda ecuación repite la primera: hay infinitas soluciones reales.
3. Las ecuaciones se contradicen: no hay solución.
