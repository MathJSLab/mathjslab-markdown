# Contributing to mathjslab-markdown

Report defects and propose changes in the
[repository](https://github.com/MathJSLab/mathjslab-markdown). Follow the
[code of conduct](CODE_OF_CONDUCT.md).

Clone mathjslab and this project into sibling directories, build the local
core, and install this project's dependencies. Use the supported Node/npm
versions listed in [README.md](README.md). Run `npm run do:all` before
submitting a change. Browser integration tests belong to the host application's
test suite.

Preserve the public entry points and their isolation: core imports must not
register a component or import application state. Keep third-party renderers
lazy, validate untrusted content and release resources when sessions are
replaced or disposed. An incompatible public contract change requires an
intentional API version change and updated contract tests.

Update [CHANGES.md](CHANGES.md) for user-visible changes. Edit canonical shared
helpers in the organization's .github repository and synchronize them using
`npm run copy:repository`. Keep test sources and fixtures; do not commit
generated reports, tarballs, measurements or build output.
