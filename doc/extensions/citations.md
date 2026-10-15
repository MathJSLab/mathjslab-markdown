# Citations and bibliography

Enable `features: ['citations']` or register `citationsExtension()` from
`mathjslab-markdown/extensions`. Optional Citation.js and citeproc-js libraries
load on the first document containing citation markers or bibliography data.
Embedded references require no network, WebAssembly or interactive capability.

The Citation.js 0.9 integration uses the upstream `styles` registry and native
package types. Node.js installations require 22.13 or newer in the supported
release lines listed in the package manifest; Node.js 20 is no longer
supported.

Use `[@key]`, `[@first; @second]`, `[@key, p. 12]` or `[@key, pp. 12-15]`. Keys
are case-sensitive and may contain letters, digits, underscores, colons, dots,
slashes and hyphens. Code spans and fences retain literal citation syntax.
Other Pandoc citation forms are not supported.

````markdown
The source explains the construction [@notes, pp. 12-15].

```bibtex
@book{notes,
  author = {Lovelace, Ada},
  title = {Notes on the Engine},
  year = {1843}
}
```

## References

```bibliography
{"style":"apa","lang":"pt-BR"}
```
````

Alternatively, `csl-json` accepts an array of CSL references, each with a
string `id` and `type`. Data blocks can appear before or after citations and
are hidden after successful processing. Multiple data blocks share one document
registry. The optional `bibliography` block places the rendered list; at most
one is allowed. Without it, citations still format without links to a reference
list. Grouped citations link to their first cited reference.

The bibliography block accepts an empty body or a JSON object with `style`,
`lang` and `includeUncited`. Built-in styles are `apa` (default), `vancouver`
and `harvard1`. Only cited records appear by default; `includeUncited: true`
includes all valid records. Numerical ordering and author/year disambiguation
are computed for the whole document and recomputed after updates.

Host defaults are supplied through `citationsOptions` in
`createEducationalMarkdownEngine`, or directly to `citationsExtension`:

```typescript
createEducationalMarkdownEngine({
    features: ["citations"],
    citationsOptions: { style: "vancouver", lang: "pt-BR" },
});
```

Hosts may supply a standalone CSL XML style as `styleXml` and extra locale XML
through `locales: { 'language-tag': xml }`. These trusted host values are never
read from Markdown or fetched remotely. A host `styleXml` takes precedence over
the built-in style selection. Styles requiring dependent-style retrieval or
automatic footnote placement are outside this version's scope.

Language defaults to the document locale and then `en-US`; `pt` maps to
`pt-BR`. Included translations are Brazilian Portuguese, English, Spanish,
French, German and Dutch. Missing translations fall back to English. Locale
selection translates CSL terms, but does not change the selected bibliographic
style into ABNT.

Malformed records preserve their entire source block and emit
`extension-render-error`. Missing keys and duplicate keys remain literal and
emit `citation-missing` and `citation-duplicate`; a cluster containing an
unresolved key is kept wholly unresolved. Invalid bibliography configuration
also preserves the configuration and citation markers. Valid independent data
blocks can continue to render. A document supports at most 1000 references,
1000 citation clusters and 5000 citation items, in addition to the engine's
source byte limit. Formatted HTML is restricted to typography even in trusted
mode; URLs and DOI values are text, with no automatic metadata lookups.

The formatting runtime follows the
[citeproc-js processor API](https://citeproc-js.readthedocs.io/en/latest/running.html).
The bundled Portuguese locale is an unmodified copy from the
[CSL locales project](https://github.com/citation-style-language/locales/blob/master/locales-pt-BR.xml),
licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
Its original translator credits and license remain in the XML distributed with
the package. Citation.js uses MIT licensing; citeproc-js offers CPAL or AGPL
licensing in its upstream notice. Their notices are included under
`dist/browser/citations/licenses/` in the published package.
