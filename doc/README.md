# Markdown engine documentation

See [renderer size and layout](render-sizing.md) for responsive dimensions,
host defaults, chemical presentation and inline SMILES directives.

`mathjslab-markdown` provides a reusable Markdown engine, educational
extensions and an optional document Web Component. All documentation in this
directory is maintained in English.

The [teaching collections](../example/README.md) contain 82 corresponding notes
in each of Brazilian Portuguese, English and Spanish, with at least four
distinct notes per extension in every language. Language indexes include
coverage counts and links to all examples.

- [Architecture and package boundaries](architecture.md)
- [Integration and deployment](integration.md)
- [Public API and presets](public-api.md)
- [Rendering, navigation and diagnostics](rendering.md)
- [Lifecycle and resource ownership](lifecycle.md)
- [Security and resource policy](security-and-resources.md)
- [Markdown authoring and mathematical syntax](authoring.md)
- [Educational extension catalogue](extensions/README.md)
- [Configurable map providers](map-providers.md)

The package owns these contracts. The browser application owns its shell,
browser commands, output targets and application-specific Worker/Plotly setup.
See the
[application guides](https://github.com/MathJSLab/mathjslab-app/blob/main/doc/README.md)
for those concerns. The `mathjslab` kernel owns numerical evaluation and the
canonical resumable runtime.

Examples in this directory illustrate authoring and integration. They do not
grant execution capabilities, permit network resources or install optional
libraries by themselves. Use the host's explicit configuration and the
[resource policy](security-and-resources.md).
