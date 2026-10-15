# TikZ and CircuiTikZ

The `tikz` feature recognizes `tikz` and `circuitikz` fences. Both compile
locally with TeX/WebAssembly in a dedicated Worker. CircuiTikZ supplies
electrical components; this extension draws circuits and does not simulate
their behavior.

```ts
const engine = createEducationalMarkdownEngine({
    features: ["tikz"],
    securityMode: "sanitized",
    allowedCapabilities: ["wasm", "network"],
    tikzOptions: { timeoutMs: 30000 },
});
await engine.renderDocument(source, container);
```

`tikzExtension(options)` and `tikzManifest` are exported from
`mathjslab-markdown/extensions`, together with the types `TikZOptions` and
`TikZWorker`. TikZJax is an optional dependency. Install
`@rod2ik/tikzjax@1.6.0` when optional dependencies were omitted.

## Authoring

Supply a complete picture environment, without a document class or document
environment. TikZJax supplies the surrounding document. The `circuitikz` fence
loads the CircuiTikZ package automatically; a `tikz` fence using a `circuitikz`
environment does so as well.

````markdown
```tikz
\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,0) -- (0,2) node[above] {$y$};
  \draw[blue,thick] (0,0) -- (2,1);
\end{tikzpicture}
```

```circuitikz
\begin{circuitikz}[american]
  \draw (0,0) to[battery1,l=$V$] (0,2)
    to[R,l=$R$] (3,2) -- (3,0) -- (0,0);
\end{circuitikz}
```
````

Host configuration can provide additional `texPackages` and `tikzLibraries`
arrays. Default libraries are `arrows.meta`, `calc` and `positioning`.
Available packages and library files depend on the pinned runtime distribution.
The extension accepts picture fragments, not arbitrary complete LaTeX
documents. Use `cross-references` figure containers to add numbered captions.

## Runtime deployment

Standalone browser builds include `dist/browser/tikzjax/`: the Worker,
compressed TeX engine, core snapshot, package files, fonts and third-party
license files. Deploy the complete browser tree. The first diagram fetches
runtime files; additional package and font files are requested as needed. This
runtime tree adds several megabytes to the distribution, without loading them
on core import.

For source ESM integrations, use a bundler supporting `?url` asset imports and
emit `@rod2ik/tikzjax/dist/run-tex.js` as `tikzjax/run-tex.js`, with the
remaining runtime files alongside it. Alternatively, set
`tikzOptions.assetBaseUrl` to a trusted, deployed runtime directory, avoiding
the default asset-loader import. The repository's `collectTikZAssets` build
helper enumerates companion assets.

The runtime origin must be allowed by the document's resource policy. No remote
rendering service is used. Runtime reads go through
`resources`/`fetchResource`, including the compressed WASM, package data and
WOFF2 fonts. Fonts are embedded through owned Blob URLs so labels render with
the runtime's glyph mappings. Cancellation, errors and document disposal revoke
these URLs.

Workers are created from fetched, approved runtime JavaScript using a Blob URL.
The host's CSP therefore needs Blob Workers and WebAssembly; font policy must
permit the owned Blob URLs. A host may supply `createWorker(script)` for its
own transport. That callback receives the complete guarded Worker script and
must support Worker message/error events, posting messages and termination.

Third-party runtime licensing and notices are preserved in the deployed tree;
see the [TikZJax project](https://github.com/rod2ik/tikzjax).

## Limits and lifecycle

Compilation is sequential within an extension instance, bounding concurrent TeX
memory use. Each diagram gets a fresh Worker; its virtual filesystem and
process state do not carry over to another diagram. A Worker is terminated
after compilation, cancellation, timeout or failure. Rendering can be deferred
by the engine's visible rendering mode.

`timeoutMs` defaults to 30 seconds and accepts values from 1 to 120000. The
limit includes active runtime loading, compilation and font loading, but
excludes time waiting in the instance's queue. The engine's `maxSourceBytes`
and `maxResourceBytes` apply. `maxOutputBytes` defaults to 4 MiB; at most 64
font families can be embedded in one diagram.

TeX can read only the approved runtime's compressed package assets. Arbitrary
files and URLs requested by a document are blocked before fetching. Generated
SVG is sanitized, external references and source-provided CSS are removed, and
IDs and fonts are namespaced per diagram. Source colors are preserved on a
white diagram background in both document themes.

Compilation errors, missing assets and timeouts preserve the original source
and emit `extension-render-error`. TeX errors are detected even if the runtime
produces partial DVI output. Other diagram blocks continue rendering. The
extension integrates with session update, cancellation, Shadow DOM and
disposal.
