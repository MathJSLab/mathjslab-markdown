# Markdown authoring and mathematical syntax

The engine offers `core` and `gfm` syntax profiles. The GFM profile supports
tables, task lists, strikethrough and autolinks, with document-scoped heading
IDs, relative URLs and syntax highlighting. Additional educational rendering is
selected through extensions and presets.

GFM syntax is not a claim of complete GitHub platform behavior. Repository
navigation, hosting policy, language grammars and platform-specific features
can differ. Relative resource URLs here resolve against the document's
`sourceUrl`; the engine does not infer a GitHub repository/branch context from
arbitrary Markdown text.

## TeX mathematics

Supported TeX forms include inline dollar delimiters, protected inline math,
display dollar delimiters and the `math` fence. These are rendered by MathJax,
not evaluated by MathJSLab. They are mathematical expressions, not complete
LaTeX documents.

````markdown
The identity $x^2+y^2=z^2$ is inline.

Protected inline form: $`x^2+y^2=z^2`$.

$$
\left(\sum_{k=1}^{n} a_k b_k\right)^2
$$

```math
\frac{1}{2}
```
````

The protected inline form keeps Markdown syntax from competing with the
mathematical source. Code spans and ordinary code fences are not math input.

## MathJSLab mathematical expressions

An injected MathJSLab executor provides synchronous MathML conversion. The
extended syntax has inline `%expression%`, protected inline ``%`expression`%``
and multiline blocks between `%%` lines:

```markdown
An expression: %`sqrt(2)`%.

%% a^2+b^2 %%
```

These expressions use the MathML conversion path, independently of executable
fences. A `mathjslab` fence contains commands for the document's execution
session and is governed by execution policy:

````markdown
```mathjslab
values = [1,2,3];
sum(values)
```
````

## Rich educational fences

Mermaid diagrams use `mermaid`; code highlighting uses language-tagged ordinary
fences. Music, maps, Graphviz, Vega-Lite, molecules and models have distinct
fences listed in the [extension catalogue](extensions/README.md). They do not
redefine the meaning of `math` or `mathjslab`.

For self-contained notes, prefer embedded data. External datasets, model assets
and links need a meaningful source URL and the relevant resource policy.
Optional rendering may fail or be blocked; source text remains available as a
fallback. Authors supply titles and labels; the component's translated controls
do not translate authored content.

The original extension proposal and conversational GitHub-compatibility notes
have been superseded by these implemented contracts. Compare syntax against the
[GFM specification](https://github.github.com/gfm/) when designing new
features, and verify claimed compatibility with tests rather than assuming it
from the parser configuration.
