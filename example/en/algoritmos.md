# Algorithms: summing a sequence in JavaScript

**Objective:** trace a loop and distinguish code from its result.
**Extensions:** syntax-highlight and MathJax.

## An accumulator

The program starts with a sum of zero. Each pass through the loop adds the
current value of `k`. After ten passes, the sum is 55. Syntax highlighting
makes reading easier; this block does not execute JavaScript in the document.
The variable `soma` means “sum”.

```javascript
const n = 10;
let soma = 0;

for (let k = 1; k <= n; k += 1) {
    soma += k;
}

console.log(soma); // 55
```

## Checking by another method

The sum from 1 to $n$ is an arithmetic sequence with common difference 1:

$$
1+2+\cdots+n=\frac{n(n+1)}2.
$$

For $n=10$, the formula also gives 55. Comparing the algorithm with the formula
helps detect boundary errors: replacing `<=` with `<` would omit the last term
and give 45.

## Practice

1. What is the value of `soma` after `k=3`?
2. What happens with `n=0`?
3. Why does the formula use fewer operations than the loop for large values of
   `n`?

## Answers with explanations

1. $1+2+3=6$.
2. The loop does not start and the sum stays zero.
3. It uses a constant number of operations; the loop grows with `n`.
