# Markdown engine documentation

The package provides a Markdown engine, educational extensions and an optional
document Web Component. Start with the [authoring guide](authoring.md) and the
[extension catalog](extensions/README.md). The
[teaching collections](../example/README.md) provide companion examples in
Brazilian Portuguese, English and Spanish.

## Authoring and visual output

- [Renderer size and layout](render-sizing.md)
- [Structured blocks and references](extensions/didactic-and-references.md)
- [Scientific chart presets](extensions/vega-scientific.md)
- [Vega and Vega-Lite mathematical annotations](extensions/vega-math-labels.md)
- [Standalone SVG and browser PNG export](visual-export.md)

## Integration

- [Architecture and package boundaries](architecture.md)
- [Public API and presets](public-api.md)
- [Integration and deployment](integration.md)
- [Rendering, navigation and diagnostics](rendering.md)
- [Lifecycle and resource ownership](lifecycle.md)
- [Security and resource policy](security-and-resources.md)
- [Execution sessions and scheduling](execution-scheduling.md)
- [Configurable map providers](map-providers.md)

## HDL

- [Setup and troubleshooting](extensions/hdl-troubleshooting.md)
- [Scripted stimuli and checks](extensions/hdl-interactive.md#scripted-stimuli-and-checks)
- [Incremental results](incremental-results.md)
- [Inspection and local export](inspection-and-export.md)

## Decisions and verification records

- [Observable Plot evaluation](observable-plot-decision.md)
- [Visual regression and accessibility verification](../test/browser/visual/README.md)
- [Visual renderer roadmap status](visual-renderers-progress.md)
- [Historical dependency audit for 0.10.0](dependency-audit.md)
- [Historical MathJSLab integration validation for 0.10.0](mathjslab-integration-validation.md)
- [HDL example audit results](hdl-audit-results.md)

The browser application owns its shell, browser commands, output targets and
application-specific Worker and Plotly setup. The MathJSLab kernel owns
numerical evaluation and the resumable runtime. Examples use the host's
configuration and resource policy.
