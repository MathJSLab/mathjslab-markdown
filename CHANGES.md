# Release notes

## 0.2.0

- Require mathjslab ^2.9.0 for the optional integration and pin development
  checks to the published 2.9.0 package instead of a sibling checkout.
- Preserve semicolon suppression when splitting commands on the same line, and
  avoid executing empty or comment-only blocks.
- Retain independent runtime text outputs while displaying MathML instead of
  duplicate text/data representations of evaluated values.
- Preserve runtime diagnostic error codes and keep document resources and
  storage available until remote session cleanup completes.
- Add integration regressions for the canonical 2.9.0 runtime, statement
  parsing, output conversion, resource loading, cancellation and disposal.

## 0.1.1

- Refresh the README with the MathJSLab logo, project links and package badges.
- Point package download, CDN, size and SourceRank badges to
  mathjslab-markdown.
- Update the MIT license attribution to 2016-2026 and include mathjslab.com.

## 0.1.0

- Align common build helpers and their TypeScript compilation with mathjslab,
  reuse organization repository synchronization, and provide the complete timed
  release pipeline.

- Introduce the reusable Markdown engine, document model, navigation,
  controller and optional Web Component extracted from mathjslab-app.
- Provide explicit component registration, presets, educational extensions and
  optional MathJSLab integration through injected executors, Workers and
  renderers.
- Keep security policy, cancellation, resource ownership and cleanup scoped to
  document sessions. Support idempotent disposal of an unused engine without a
  DOM.
- Export ESM modules and TypeScript declarations through npm subpaths, with
  fully specified relative imports for native ESM consumption.
- Provide browser bundles with a shared runtime to preserve engine and
  component identity, and load optional educational renderers on demand.
- Add repository metadata, common organization resources, development and
  release scripts, package-content verification and contributor documentation.

- Validate lazy browser chunks from the current distribution instead of
  retaining a generated historical size baseline in the compatibility corpus.
