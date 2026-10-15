# Progresiones aritméticas y geométricas

**Objetivo:** reconocer patrones, calcular términos y sumar sucesiones.
**Extensión:** MathJax. **Conocimientos previos:** potencias y ecuaciones.

## Dos formas de crecer

Una progresión aritmética (PA) tiene una diferencia constante entre términos
consecutivos. En $3,7,11,15,\ldots$, la diferencia es $r=4$. Partiendo de
$a_1$, sumamos la diferencia $n-1$ veces:

$$
a_n=a_1+(n-1)r.
$$

Así, $a_{10}=3+9\cdot4=39$. La diferencia puede ser negativa o cero:
$20,17,14,\ldots$ es una PA decreciente.

Una progresión geométrica (PG) tiene un multiplicador constante. En
$2,6,18,54,\ldots$, la razón es $q=3$:

$$
a_n=a_1q^{n-1}.
$$

Por tanto, $a_6=2\cdot3^5=486$. Para obtener la razón mediante división, el
término anterior debe ser distinto de cero. Con una razón negativa, los signos
alternan.

## Sumar términos

En una PA, los pares primero–último, segundo–penúltimo y los demás tienen la
misma suma. Esto conduce a:

```math
S_n=\frac{n(a_1+a_n)}{2}.
```

Para los diez primeros términos de la PA anterior, $S_{10}=10(3+39)/2=210$. En
una PG, multiplicar la suma por $q$ y restar las dos expresiones elimina los
términos intermedios:

$$
S_n=a_1\frac{q^n-1}{q-1}\quad(q\ne1).
$$

Si $q=1$, usamos $S_n=na_1$. Para $|q|<1$, la suma infinita converge a
$S_\infty=a_1/(1-q)$; no podemos aplicar esta fórmula fuera de esa condición.

## Practica

1. Una tribuna tiene 12 filas. La primera tiene capacidad para 18 personas y
   cada fila siguiente admite dos más. ¿Cuál es la capacidad total?
2. Una sucesión empieza en 80 y cada término es la mitad del anterior. Calcula
   el quinto término y la suma infinita.
3. ¿La sucesión $1,-2,4,-8$ es una PA o una PG? Justifica.

## Respuestas comentadas

1. $a_{12}=40$ y $S_{12}=12(18+40)/2=348$ personas.
2. $a_5=80(1/2)^4=5$ y $S_\infty=160$.
3. Es una PG de razón $-2$; las diferencias no son constantes.
