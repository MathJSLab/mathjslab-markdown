# Búsqueda binaria: reducir el intervalo

**Extensiones:** `syntax-highlight`, `heading-ids`, `relative-urls`.

## Ideas principales

Una lista ordenada permite descartar la mitad del intervalo tras cada
comparación. El JavaScript solo se resalta, sin ejecución automática. Use el
enlace del índice al final para navegar entre las notas.

```javascript
function binarySearch(values, target) {
    let left = 0;
    let right = values.length - 1;
    while (left <= right) {
        const middle = Math.floor((left + right) / 2);
        if (values[middle] === target) return middle;
        if (values[middle] < target) left = middle + 1;
        else right = middle - 1;
    }
    return -1;
}
```

## Práctica

En [2,4,6,8,10], ¿qué elementos se comparan al buscar 8? ¿El método sirve para
una lista no ordenada?

## Respuesta comentada

Primero 6 y después 8; el índice devuelto es 3, contando desde cero. La
ordenación es una condición previa.

[Índice de la colección](README.md)

[Português brasileiro](../pt/busca-binaria.md) ·
[English](../en/busca-binaria.md)
