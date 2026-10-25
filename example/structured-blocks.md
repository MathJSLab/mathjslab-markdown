# Inline titles and full-width tables

Enable `didactic` and `cross-references` with the `gfm` profile. MathJax is
included by that profile. MathJSLab expressions additionally require the
consumer's executor-backed `mathjslab` extension.

<!-- prettier-ignore -->
::: definition A **function** $f(x)$ {#function}

A function associates inputs with outputs.

:::

<!-- prettier-ignore -->
::: example Evaluation of $f(x)=x^2$, using {@ref function} {#evaluation}

For $x=2$, the value is $4$.

:::

<!-- prettier-ignore -->
::: figure The `input` and $f(x)$, illustrated by {@ref evaluation} {#model}

Input -> function -> output.

:::

<!-- prettier-ignore -->
::: table **Sample values** of $f(x)$ {#values .full-width}

| $x$ | $f(x)$ |
| :-: | -----: |
|  0  |      0 |
|  1  |      1 |
|  2  |      4 |

:::

See {@ref model} and {@ref values}. Column alignment uses ordinary GFM syntax;
full width is optional and keeps automatic column sizing.

With MathJSLab registered, a title can instead contain its own expression
language, for example:

```markdown
::: example Expression %`sqrt(2)`% {#root}

Example content.

:::
```
