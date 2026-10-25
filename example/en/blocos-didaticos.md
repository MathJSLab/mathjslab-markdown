# Theorems, exercises and references

**Extensions:** `didactic`, `cross-references`, `mathjax`.

See {@ref sec-foundations} before {@ref sec-practice}.

## 1. Key ideas {#sec-foundations}

Apply {@ref pitagoras} to the values in {@ref resultados}. Hints and solutions
stay collapsed until you open them.

:::: theorem Pythagorean theorem {#pitagoras}

In a right triangle, the legs $a$, $b$ and hypotenuse $c$ satisfy:

::: equation {#eq-pythagoras}

$$a^2+b^2=c^2.$$

:::

::: hint Geometric interpretation

Compare the areas of the squares built on the sides.

:::

::::

The relation in {@ref eq-pythagoras} is illustrated in {@ref fig-areas}.

<!-- prettier-ignore -->
::: figure Relationship between areas {#fig-areas}

**a² + b² → c²**

:::

::: table Right triangles {#resultados}

| a   | b   | c   |
| --- | --- | --- |
| 3   | 4   | 5   |
| 5   | 12  | 13  |

:::

::: exercise An application {#aplicacao}

A ladder has its foot 6 m from a wall and its top 8 m above the ground. Find
its length.

:::

## 2. Practice {#sec-practice}

Solve {@ref aplicacao} using {@ref pitagoras}.

::: solution Answer with explanation

$c=\sqrt{6^2+8^2}=10$ m. The length is the hypotenuse.

:::

::: warning Check assumptions {#warning-assumptions}

Apply a mathematical model only while its **assumptions** remain valid.

:::

Review {@ref warning-assumptions} before using the result.

[Collection index](README.md)

[Português brasileiro](../pt/blocos-didaticos.md) ·
[Español](../es/blocos-didaticos.md)
