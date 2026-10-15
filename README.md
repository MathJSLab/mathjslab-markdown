<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="https://mathjslab.com/images/mathjslab-logo.svg" alt="logo" width="210" height="210" /></a>
</p>

# [mathjslab-markdown - MathJSLab Markdown Engine](https://mathjslab.com/)

[![NPM Version](https://img.shields.io/npm/v/mathjslab-markdown)](https://www.npmjs.com/package/mathjslab-markdown)
[![NPM Last Update](https://img.shields.io/npm/last-update/mathjslab-markdown)](https://www.npmjs.com/package/mathjslab-markdown)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![GitHub Created At](https://img.shields.io/github/created-at/MathJSLab/mathjslab-markdown)](https://github.com/MathJSLab/mathjslab-markdown)
[![MIT License](https://img.shields.io/npm/l/mathjslab-markdown)](https://github.com/MathJSLab/mathjslab-markdown/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/d18m/mathjslab-markdown)](https://www.npmjs.com/package/mathjslab-markdown)
[![NPM Downloads per week](https://img.shields.io/npm/dw/mathjslab-markdown)](https://www.npmjs.com/package/mathjslab-markdown)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hy/mathjslab-markdown)](https://www.jsdelivr.com/package/npm/mathjslab-markdown)
[![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/mathjslab-markdown)](https://libraries.io/npm/mathjslab-markdown/sourcerank)
[![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/mathjslab-markdown)](https://www.npmjs.com/package/mathjslab-markdown)
[![NPM package minimized gzipped size](https://img.shields.io/bundlejs/size/mathjslab-markdown)](https://www.npmjs.com/package/mathjslab-markdown)

> A reusable Markdown engine, educational extensions and optional
> `<markdown-document>` Web Component from the
> [MathJSLab project](https://mathjslab.com/).

[Repository](https://github.com/MathJSLab/mathjslab-markdown) ·
[Issues](https://github.com/MathJSLab/mathjslab-markdown/issues) ·
[Release notes](CHANGES.md) · [Contributing](CONTRIBUTING.md)

## Turn your ideas into digital teaching resources

Creating high-quality digital teaching resources should not require advanced
programming skills or mastery of complex tools.

With our **Markdown engine**, teachers can transform simple text into rich,
interactive, and visually engaging educational content. Mathematical equations,
chemical formulas, molecular structures, charts, diagrams, flowcharts, maps,
and images can all be incorporated using a simple and accessible language.

**Less time learning tools, more time teaching!**

Technology evolves, but knowledge should not be tied to it. Great teaching
resources deserve to outlast generations of tools and platforms, preserving
their essence and the freedom to be edited, updated, and reused for years to
come.

Our goal is to lower technological barriers and empower educators, allowing
teachers to focus their efforts on what truly matters: **the knowledge they
want to share and the learning experiences they wish to provide.**

**Because technology should serve education, not limit the future of
knowledge.**

## Installation and use

To install use

```shell
npm install mathjslab-markdown
```

Rendering requires a browser DOM. Importing the core neither registers a
component nor loads optional educational renderers.

```ts
import { createMarkdownEnginePreset } from "mathjslab-markdown";
import { MarkdownDocumentElement } from "mathjslab-markdown/component";
import "mathjslab-markdown/component/register";

const viewer =
    document.querySelector<MarkdownDocumentElement>("markdown-document");
if (!viewer) throw new Error("Missing markdown-document element");
const engine = createMarkdownEnginePreset("safe-remote");
viewer.engine = engine;
await viewer.load("/docs/intro.md");
// Disconnecting the component releases its session; the host owns this engine.
// await engine.dispose() when the host finishes using it.
```

For containers managed directly by the host:

```ts
const session = await engine.renderDocument("# Lesson", container, {
    sourceUrl: new URL("/docs/lesson.md", location.href),
});
try {
    await session.update("# Updated lesson");
} finally {
    await session.dispose();
}
```

The presets separate syntax, security and capabilities. Use `safe-remote` for
untrusted documents; enable `trusted-local` only for content controlled by the
host. Educational renderers are optional dependencies loaded on demand.
Consumers that install with `--omit=optional` must install the renderers they
choose to enable. Source ESM uses a bundler CSS inline query for maps.

## Public entry points

| Import                                  | Purpose                                        |
| --------------------------------------- | ---------------------------------------------- |
| `mathjslab-markdown`                    | Engine, documents, navigation and presets      |
| `mathjslab-markdown/component`          | Component class and mounting helpers           |
| `mathjslab-markdown/component/register` | Explicit custom element registration           |
| `mathjslab-markdown/extensions`         | Educational extensions and manifests           |
| `mathjslab-markdown/mathjslab`          | Optional MathJSLab execution integration       |
| `mathjslab-markdown/mathjslab/worker`   | Worker transport and protocol                  |
| `mathjslab-markdown/browser`            | Aggregate browser entry point                  |
| `mathjslab-markdown/bundles/*`          | Standalone browser bundles and assets          |
| `mathjslab-markdown/compat/*`           | Compatibility modules for application adapters |

MathJSLab is an optional peer dependency (`^2.9.0`). Its integration receives
executors, Workers and renderers from the host; the core engine has no
dependency on `mathjslab-app` or Plotly. Standalone bundles share a runtime:
deploy the entire `dist/browser` tree, including its chunks and assets.

See the
[documentation index](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/README.md),
[public API](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/public-api.md),
[integration guide](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/integration.md),
[lifecycle](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/lifecycle.md),
and
[security and resource policy](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/security-and-resources.md).

## Teaching examples

The
[example directory](https://github.com/MathJSLab/mathjslab-markdown/tree/main/example)
contains teaching notes organized by language. The
[Brazilian Portuguese](https://github.com/MathJSLab/mathjslab-markdown/blob/main/example/pt/README.md),
[English](https://github.com/MathJSLab/mathjslab-markdown/blob/main/example/en/README.md)
and
[Spanish](https://github.com/MathJSLab/mathjslab-markdown/blob/main/example/es/README.md)
collections each provide 50 lessons covering all 14 extensions, with
explanations, exercises and commented answers. Topics include mathematics,
chemistry, music, geography, history, biology, physics, statistics, geometry
and computing. The 150 notes include ABC, MusicXML and MEI scores, SMILES and
XYZ/SDF molecules, OBJ/STL solids, Mermaid and Graphviz diagrams,
GeoJSON/TopoJSON maps, Vega-Lite charts and MathJSLab calculations.

Each note identifies the extensions it uses. View the examples with those
extensions enabled in a host application; ordinary Markdown viewers may display
rich fences as source code. The collections include local resources and are
available in the repository; `doc/` and `example/` are excluded from the npm
distribution. Additional languages can be added under `example/`.

## Development

Use Node.js `^20.19.0 || ^22.13.0 || >=24` and npm 10 or newer. Development and
release checks use the published `mathjslab` 2.9.0 package. For joint
development, clone and build `mathjslab` in a sibling directory, then run
`npm install --no-save --package-lock=false ../mathjslab` to test local
changes. Restore the published dependency with `npm ci` before release checks.

```shell
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

The project uses `script/` and `script/helper/`, following the `mathjslab`
convention. Common helpers handle lockfile cleanup, repository synchronization,
commit messages and build timing. `build:script` compiles these helpers using
`script/tsconfig.json` before the production build. `build:types` emits ESM and
declarations; `build:browser` builds all browser entries together to preserve
shared runtime identity. `build:dev` builds for development; `build` performs a
clean production build.

| Command                               | Purpose                                           |
| ------------------------------------- | ------------------------------------------------- |
| `npm run typecheck`                   | Check source types without emitting files         |
| `npm test`                            | Run reusable Markdown regressions                 |
| `npm run test:distribution`           | Check emitted package exports                     |
| `npm run verify:package`              | Inspect the npm file list, exports and imports    |
| `npm run pack:dry-run`                | Inspect existing build contents without packaging |
| `npm run clean:results`               | Remove temporary results and measurements         |
| `npm run clone:copy:clean:repository` | Fetch shared files from the organization          |

Until the organization changes are pushed, synchronize from the local checkout:

```shell
npm run copy:repository -- ../mathjslab-github
```

Shared files are configured by `copy.repo.config.json`; their canonical
resources live in the organization repository. Generated reports, measurements,
clone directories and test results are ignored and are not part of the npm
package.

## Release preparation

`npm run do:all` checks lint, types, tests, production build and package
contents, then commits, pushes and publishes the package to npm. Run it only
when deliberately releasing. `prepack` rebuilds and validates the emitted
distribution; `prepublishOnly` checks lint, types and unit tests. The package
includes the production distribution, package metadata, README, release notes,
contributor resources and license. Documentation and teaching examples remain
available in the repository.

Publish the compatible `mathjslab` version before consumers enable its
integration. Commit, push and publication scripts are also available as
separate maintainer commands; run them only when deliberately releasing.

## License

> [MIT License](https://opensource.org/license/mit)
>
> Copyright &copy; 2016-2026 [Sergio Lindau](mailto:sergiolindau@gmail.com),
> [mathjslab.com](https://mathjslab.com/).
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
