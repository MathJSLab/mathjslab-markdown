# Binary numbers and place value

**Objective:** convert a small number between bases 2 and 10. **Extensions:**
syntax-highlight, MathJax.

## Key ideas

Decimal positions use powers of 10; binary positions use powers of 2. The only
binary digits are 0 and 1. The notation $1011_2$ means:

$$
1\cdot2^3+0\cdot2^2+1\cdot2^1+1\cdot2^0=11_{10}.
$$

```javascript
const bits = "1011";
let value = 0;
for (const digit of bits) {
    if (digit !== "0" && digit !== "1") throw new Error("Invalid bit");
    value = 2 * value + Number(digit);
}
console.log(value);
```

The code reads digits from left to right. Each step multiplies the accumulated
value by 2 and adds the next digit. It works with small integers and is not
intended to handle every JavaScript numerical limit. Syntax highlighting does
not execute the block.

Leading zeros do not change the value: $0011_2=11_2=3_{10}$. Appending zero on
the right multiplies by 2. This shifts positions rather than merely adding zero
with no effect.

## Practice

1. Convert $1101_2$ to decimal.
2. Write 6 in binary.

## Answers with explanations

1. $8+4+1=13$.
2. $110_2$, because $4+2=6$.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/numeros-binarios.md) ·
[Español](../es/numeros-binarios.md)
