# Algoritmos: sumar una sucesión en JavaScript

**Objetivo:** seguir una repetición y distinguir el código del resultado.
**Extensiones:** syntax-highlight y MathJax.

## Un acumulador

El programa empieza con una suma de cero. En cada pasada del bucle añade el
valor actual de `k`. Después de diez pasadas, la suma vale 55. El resaltado de
sintaxis facilita la lectura; este bloque no ejecuta JavaScript en el
documento. La variable `soma` significa «suma».

```javascript
const n = 10;
let soma = 0;

for (let k = 1; k <= n; k += 1) {
    soma += k;
}

console.log(soma); // 55
```

## Comprobar por otro camino

La suma de 1 a $n$ es una progresión aritmética de diferencia 1:

$$
1+2+\cdots+n=\frac{n(n+1)}2.
$$

Para $n=10$, la fórmula también da 55. Comparar el algoritmo con la fórmula
ayuda a detectar errores de límite: cambiar `<=` por `<` omitiría el último
término y daría 45.

## Practica

1. ¿Cuál es el valor de `soma` después de `k=3`?
2. ¿Qué ocurre con `n=0`?
3. ¿Por qué la fórmula utiliza menos operaciones que el bucle para valores
   grandes de `n`?

## Respuestas comentadas

1. $1+2+3=6$.
2. El bucle no comienza y la suma permanece en cero.
3. Utiliza un número constante de operaciones; el bucle crece con `n`.
