# Decision on an Observable Plot fence

**Status:** Deferred. Continue using Vega-Lite and Vega for declarative chart
authoring. Reconsider when a concrete authoring case shows that Plot provides
enough benefit to justify maintaining another public chart schema.

## Findings

Observable Plot 0.6.19 ships under ISC. Its ESM package declares
`sideEffects: false`, which supports tree shaking. A lazy adapter with
statically referenced mark constructors would give the bundler a chance to drop
unused code. A dynamic dispatch over all Plot exports would weaken that
opportunity. The actual incremental bundle size and dependency sharing with
Vega and Mermaid have yet to be measured. The public release and package
metadata provide the version and licensing evidence.
[Release](https://github.com/observablehq/plot/releases/tag/v0.6.19) ·
[Package metadata](https://raw.githubusercontent.com/observablehq/plot/main/package.json)

Plot's documented authoring API constructs marks in JavaScript. Channels can
use field names, arrays or functions, and marks can themselves be functions
returning DOM. No native declarative JSON chart format was found in the
documented API. A Markdown fence would need a package-owned grammar and an
adapter that validates and constructs each supported mark. Passing JSON
directly to Plot would cover only parts of its options API.
[Marks](https://observablehq.com/plot/features/marks)

Plot returns detached SVG or an HTML figure. Its `document` option supports a
supplied DOM for server-side rendering. This does not add SSR to our existing
browser fence lifecycle. Plot exposes root ARIA options and mark labels. Its
default styling uses a generated class and stylesheet. Our standalone exporter
strips styles, so a future adapter would need to verify fidelity with the
styles needed for its supported marks before advertising SVG export.
[Plots](https://observablehq.com/plot/features/plots) ·
[Accessibility](https://observablehq.com/plot/features/accessibility) ·
[Local SVG export contract](visual-export.md)

## Conditions for revisiting

Bring one representative scientific or statistical example whose authoring
benefit can be demonstrated against the existing Vega-Lite or Vega version.
Prototype a small validated JSON subset with inline rows, explicit field
channels and named mark constructors. Reject unknown options, arbitrary
callbacks, custom transforms, author CSS and URL-bearing marks. Add external
datasets only through the document resource service, using its limits and
diagnostics.

Measure raw and compressed production chunks and verify lazy imports from both
ESM and browser entry points. Test detached rendering, Shadow DOM, resize,
cancellation and disposal with the existing session and sizing contracts.
Verify browser and standalone SVG appearance, accessible names and resource
isolation. Keep the subset small enough to maintain across upstream updates. If
the example remains equally practical in Vega, keep it there and avoid
introducing a second schema.

ECharts remains conditional on an interactive use case outside the capabilities
of the existing renderers. Plotly remains a host-injected renderer, and
arbitrary D3 JavaScript remains outside the fence model.
