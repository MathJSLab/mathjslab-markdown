# Contributing to mathjslab-markdown

Report defects and propose changes in the
[repository](https://github.com/MathJSLab/mathjslab-markdown). Follow the
[code of conduct](CODE_OF_CONDUCT.md).

Install this project's locked dependencies with `npm ci`; release checks use
the published MathJSLab development dependency. For joint core development,
build mathjslab in a sibling directory and temporarily use a local dependency,
then restore the registry range before release validation. Use the supported
Node/npm versions listed in [README.md](README.md). Run `npm run check` and
`npm run release:prepare` before submitting a change. Run
`npm run release:validate` for browser integration changes; the release
workflow also tests integration with the host application. See the release
preparation instructions in README.md for dependency updates and publication.

Preserve the public entry points and their isolation: core imports must not
register a component or import application state. Keep third-party renderers
lazy, validate untrusted content and release resources when sessions are
replaced or disposed. An incompatible public contract change requires an
intentional API version change and updated contract tests.

Update [CHANGES.md](CHANGES.md) for user-visible changes. Edit canonical shared
helpers in the organization's .github repository and synchronize them using
`npm run copy:repository`. Keep test sources and fixtures; do not commit
generated reports, tarballs, measurements or build output.
