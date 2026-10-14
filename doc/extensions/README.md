# Educational extensions

The engine retains GFM parsing and loads specialized renderers when a document
uses the corresponding fence. Factories and manifests are exported through
`mathjslab-markdown/extensions`; MathJSLab execution has its separate entry.

| Family                             | Fences                                              | Renderer                    |
| ---------------------------------- | --------------------------------------------------- | --------------------------- |
| Diagrams                           | `mermaid`                                           | Mermaid                     |
| Flat molecules                     | `smiles`                                            | SmilesDrawer                |
| [Music](music.md)                  | `abc`, `mei`, `musicxml`                            | abcjs and Verovio           |
| [Maps](maps.md)                    | `geojson`, `topojson`                               | Leaflet and topojson-client |
| [Declarative charts](vega-lite.md) | `vega-lite`                                         | Vega-Lite                   |
| [Graphs](graphviz.md)              | `dot`, `graphviz`                                   | Graphviz/Viz.js             |
| [3D molecules](molecules-3d.md)    | `pdb`, `cif`, `mmcif`, `sdf`, `mol2`, `xyz`, `cube` | 3Dmol.js                    |
| [3D models](models-3d.md)          | `stl`, `obj`, `gltf`                                | Three.js                    |

The document context supplies theme, locale, dimensions, audio authorization,
URL resolution, resource policy, cancellation, limits and diagnostics. A
registered renderer can remain blocked if its capabilities are not granted.
Invalid data preserves source text and a local diagnostic instead of preventing
unrelated blocks from rendering.

Example selection:

```ts
import { createEducationalMarkdownEngine } from "mathjslab-markdown";

const engine = createEducationalMarkdownEngine({
    features: ["smiles", "graphviz", "maps"],
    securityMode: "sanitized",
    allowedCapabilities: ["interactive", "wasm", "network"],
});
```

Capabilities and resource origins remain separate controls. See
[security and resources](../security-and-resources.md) and
[lifecycle](../lifecycle.md) before embedding external or interactive content.
