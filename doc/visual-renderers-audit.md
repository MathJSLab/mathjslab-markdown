# Visual renderer baseline

The local audit started at commit `116d89a` (package 0.10.0). The existing
extension catalog, fence hooks and document sessions provide the entry
points for visual renderers. See [rendering](rendering.md),
[sizing](render-sizing.md) and [resource policy](security-and-resources.md).

At that commit the chart fence was `vega-lite`, backed by a lazy Vega-Embed
import and an internally retained View. There was no full Vega fence or
generic visual export contract. The Markdown sanitizer ran before the
renderer populated its container. Vega-Embed could read document-supplied
embed options, and its own loader was outside the document resource service.
MathJax typeset selected DOM nodes, leaving chart text marks literal.

The starting checkout passed lint, type checking, production build and
24 distribution tests. Its full Jest run passed 690 of 692 tests. One
failure referenced the absent `example/structured-blocks.md`. The
reference audit also failed in the dirty checkout. Its isolated rerun
identified Prettier changes in a modified chapter and three untracked
drafts. The browser reference audit passed in Chromium.

The small browser fixtures in `test/markdown/extensions` exercise
independent curves, opposed axes, literal mathematical labels and
CircuiTikZ figure references. Run `node test/browser/visual-fixtures.mjs`
after building. See the [visual test instructions](../test/browser/visual/README.md)
for PNG comparison.
