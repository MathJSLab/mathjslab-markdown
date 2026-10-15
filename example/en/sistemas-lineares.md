# Linear systems: solving and checking

**Objective:** solve two equations and check the solution by substitution.
**Extensions:** MathJSLab and MathJax.

## A quantity problem

Two types of boxes contain 2 and 3 units respectively. A set contains seven
boxes and eighteen units. If $x$ is the number of boxes of the first type and
$y$ the number of the second, then:

$$
\begin{cases}
x+y=7,\\
2x+3y=18.
\end{cases}
$$

Multiply the first equation by 2 and subtract it from the second: $y=4$. Then
$x=3$. The solution also meets the physical requirement of nonnegative integer
quantities.

## Matrix form

The coefficient matrix is %`[1, 1; 2, 3]`% and the vector of constants is
%`[7; 18]`%. Matrix left division solves the system in the block below. The
variable `solucao` means “solution”.

```mathjslab
A = [1, 1; 2, 3];
b = [7; 18];
solucao = A \ b
A * solucao
A * solucao - b
```

The solution vector should contain 3 and 4. The last result is the residual:
zero indicates that substitution satisfies both equations within numerical
precision. Not every system has a unique solution: dependent or inconsistent
equations require further analysis.

## Practice

1. Check the solution without matrices.
2. What happens if the second equation is replaced by $2x+2y=14$?
3. What about $2x+2y=15$?

## Answers with explanations

1. $3+4=7$ and $2\cdot3+3\cdot4=18$.
2. The second equation repeats the first: there are infinitely many real
   solutions.
3. The equations contradict each other: there is no solution.
