# Arithmetic and geometric sequences

**Objective:** recognize patterns, calculate terms and sum sequences.
**Extension:** MathJax. **Prior knowledge:** powers and equations.

## Two ways to grow

An arithmetic sequence has a constant difference between consecutive terms. In
$3,7,11,15,\ldots$, the common difference is $r=4$. Starting from $a_1$, we add
the difference $n-1$ times:

$$
a_n=a_1+(n-1)r.
$$

Thus, $a_{10}=3+9\cdot4=39$. The difference can be negative or zero:
$20,17,14,\ldots$ is a decreasing arithmetic sequence.

A geometric sequence has a constant multiplier. In $2,6,18,54,\ldots$, the
common ratio is $q=3$:

$$
a_n=a_1q^{n-1}.
$$

Therefore, $a_6=2\cdot3^5=486$. To find the ratio by division, the previous
term must be nonzero. With a negative ratio, the signs alternate.

## Summing terms

In an arithmetic sequence, the first–last, second–next-to-last and other pairs
have the same sum. This gives:

```math
S_n=\frac{n(a_1+a_n)}{2}.
```

For the first ten terms of the previous arithmetic sequence,
$S_{10}=10(3+39)/2=210$. For a geometric sequence, multiplying the sum by $q$
and subtracting the two expressions cancels the intermediate terms:

$$
S_n=a_1\frac{q^n-1}{q-1}\quad(q\ne1).
$$

If $q=1$, use $S_n=na_1$. For $|q|<1$, the infinite sum converges to
$S_\infty=a_1/(1-q)$; this formula does not apply outside that condition.

## Practice

1. A grandstand has 12 rows. The first seats 18 people, and each following row
   seats two more. What is the total capacity?
2. A sequence starts at 80 and each term is half the previous one. Calculate
   the fifth term and the infinite sum.
3. Is $1,-2,4,-8$ arithmetic or geometric? Explain.

## Answers with explanations

1. $a_{12}=40$ and $S_{12}=12(18+40)/2=348$ people.
2. $a_5=80(1/2)^4=5$ and $S_\infty=160$.
3. It is geometric with ratio $-2$; the differences are not constant.
