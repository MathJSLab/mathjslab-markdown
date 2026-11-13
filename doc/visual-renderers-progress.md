# Visual renderer roadmap status

The work is present in the local checkout. Phase names refer to the initial
roadmap. This document records implementation and verification status.

| Phase                | Status                                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Audit             | [Baseline and known checkout failures](visual-renderers-audit.md).                                                                                                                                                                                                            |
| 2. Fixtures          | Independent curve families, opposed axes and CMOS NAND/NOR have functional Chromium coverage.                                                                                                                                                                                 |
| 3. Visual regression | Four [PNG references](../test/browser/visual/README.md) run locally on the reference platform. Release CI runs the DOM checks. Baseline paths are platform-specific. Linux captures require a Linux reference environment.                                                    |
| 4. Vega-Lite         | Shared resource loader, controlled embed options, expression interpreter, lazy runtime, negative cases and translated scientific examples. SVG remains the default. The public host renderer selector was deferred. CSV/TSV still needs the upstream decoder's CSP allowance. |
| 5. Vega              | Full JSON fence, public factory and manifest, shared lifecycle and policy, named dataset fixture, translated examples and distribution checks.                                                                                                                                |
| 6. SVG export        | [Opt-in contract](visual-export.md) implemented for Vega, Vega-Lite, Graphviz, Mermaid with SVG labels, and TikZ/CircuiTikZ with embedded fonts. Browser PNG conversion reuses the standalone SVG.                                                                            |
| 7. Math labels       | [Spike](math-labels-spike.md) followed by [host-provided annotations](extensions/vega-math-labels.md). Browser tests cover geometry, roles, names and the Chromium accessibility tree. Spoken output requires a manual reader session.                                        |
| 8. Observable Plot   | [Decision recorded](observable-plot-decision.md). Implementation deferred because upstream lacks a native JSON authoring format and the current scientific cases are covered.                                                                                                 |
| 9. ECharts           | Deferred pending a concrete interactive case outside the current renderers.                                                                                                                                                                                                   |

The browser suite also exercises a 12-chart visible-mode document, lazy chunk
failure, source fallback and observer discharge after replacement. It now
checks the [scientific axis preset](extensions/vega-scientific.md) in both
renderers and in standalone SVG under the dark document theme.

The [TikZ authoring guide](extensions/tikz.md#cmos-schematics) connects the
CMOS fixture to practical wiring and cross-reference conventions. The generic
[structured-blocks example](../example/structured-blocks.md) is present.
Formatting differences in local chapter drafts remain tracked in the baseline.
