# Binary search: shrinking the interval

**Extensions:** `syntax-highlight`, `heading-ids`, `relative-urls`.

## Key ideas

A sorted list lets us discard half the interval after each comparison.
JavaScript is highlighted only, without automatic execution. Use the index link
below to navigate among the notes.

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

## Practice

In [2,4,6,8,10], which elements are compared when searching for 8? Does the
method work on an unsorted list?

## Answer with explanation

First 6, then 8; the returned index is 3, counting from zero. Sorting is a
precondition.

[Collection index](README.md)

[Português brasileiro](../pt/busca-binaria.md) ·
[Español](../es/busca-binaria.md)
