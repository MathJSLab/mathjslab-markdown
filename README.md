# mathjslab-markdown

Reusable Markdown engine, educational extensions and optional
`<markdown-document>` Web Component from the
[MathJSLab project](https://mathjslab.com/). Licensed under the MIT license.

[Repository](https://github.com/MathJSLab/mathjslab-markdown) ·
[Issues](https://github.com/MathJSLab/mathjslab-markdown/issues) ·
[Release notes](CHANGES.md) · [Contributing](CONTRIBUTING.md)

## Installation and use

The initial release is prepared as version **0.1.0**. After it is published:

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

MathJSLab is an optional peer dependency (`^2.8.0`). Its integration receives
executors, Workers and renderers from the host; the core engine has no
dependency on `mathjslab-app` or Plotly. Standalone bundles share a runtime:
deploy the entire `dist/browser` tree, including its chunks and assets.

See the [architecture](doc/architecture.md),
[public API](doc/pt/markdown-api-publica.md),
[lifecycle](doc/pt/markdown-lifecycle.md),
[resource policy](doc/pt/markdown-resources.md) and
[security policy](doc/pt/markdown-security-policy.md).

## Development

Use Node.js `^20.19.0 || ^22.13.0 || >=24` and npm 10 or newer. For joint
development, clone `mathjslab` and `mathjslab-markdown` as sibling directories
and build `mathjslab` first. The development dependency `file:../mathjslab`
intentionally selects that local core; published consumers resolve the optional
peer from npm instead.

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
includes the production distribution, documentation and license.

Publish the compatible `mathjslab` version before consumers enable its
integration. Commit, push and publication scripts are also available as
separate maintainer commands; run them only when deliberately releasing.
