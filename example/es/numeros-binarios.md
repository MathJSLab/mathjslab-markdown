# Números binarios y valor posicional

**Objetivo:** convertir un número pequeño entre las bases 2 y 10.
**Extensiones:** syntax-highlight, MathJax.

## Ideas clave

En decimal, las posiciones utilizan potencias de 10; en binario, potencias
de 2. Los únicos dígitos binarios son 0 y 1. La escritura $1011_2$ significa:

$$
1\cdot2^3+0\cdot2^2+1\cdot2^1+1\cdot2^0=11_{10}.
$$

```javascript
const bits = "1011";
let value = 0;
for (const digit of bits) {
    if (digit !== "0" && digit !== "1")
        throw new Error("Dígito binario no válido");
    value = 2 * value + Number(digit);
}
console.log(value);
```

El código recorre los dígitos de izquierda a derecha. En cada paso multiplica
el valor acumulado por 2 y añade el siguiente dígito. Trabaja con enteros
pequeños y no pretende cubrir todos los límites numéricos de JavaScript. El
resaltado de sintaxis no ejecuta el bloque.

Los ceros a la izquierda no cambian el valor: $0011_2=11_2=3_{10}$. Añadir cero
a la derecha multiplica por 2. Esto desplaza posiciones, en lugar de sumar
simplemente cero sin efecto.

## Practica

1. Convierte $1101_2$ a decimal.
2. Escribe 6 en binario.

## Respuestas comentadas

1. $8+4+1=13$.
2. $110_2$, porque $4+2=6$.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/numeros-binarios.md) ·
[English](../en/numeros-binarios.md)
