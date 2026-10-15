# Busca binária: reduzir o intervalo

**Extensões:** `syntax-highlight`, `heading-ids`, `relative-urls`.

## Ideias principais

Uma lista ordenada permite descartar metade do intervalo após cada comparação.
O código JavaScript é apenas destacado, sem execução automática. Use o link do
índice ao final para navegar entre as notas.

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

## Prática

Em [2,4,6,8,10], quais elementos são comparados ao procurar 8? O método serve
para uma lista não ordenada?

## Resposta comentada

Primeiro 6, depois 8; o índice retornado é 3, contando desde zero. A ordenação
é uma pré-condição.

[Índice da coleção](README.md)

[English](../en/busca-binaria.md) · [Español](../es/busca-binaria.md)
