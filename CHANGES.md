# Release notes

## Unreleased — 0.1.0

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
