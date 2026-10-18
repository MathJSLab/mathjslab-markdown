# Educational extensions

The [example collections](../../example/README.md) provide at least four
distinct notes for every extension in each of three languages. Browse the
[English](../../example/en/README.md),
[Brazilian Portuguese](../../example/pt/README.md) and
[Spanish](../../example/es/README.md) indexes for topics and coverage counts.

[Citations and bibliography](citations.md) format citation keys and embedded
BibTeX/CSL JSON with configurable CSL styles.

[TikZ and CircuiTikZ](tikz.md) compile technical drawings and electrical
circuit diagrams locally in a TeX/WebAssembly Worker.

[Dynamic geometry](geometry.md) renders declarative `geometry` constructions
with draggable points and dependent geometric objects.

[WaveDrom timing, register and logic diagrams](wavedrom.md) render `wavedrom`
fences locally as SVG.

[VHDL and Verilog source presentation](hdl.md) adds HDL syntax highlighting
without compiling or executing source code.

[Digital schematics from netlists](netlist.md) renders local Yosys JSON
connectivity as SVG, including buses and generic cells.

[HDL execution](hdl-execution.md) integrates application-provided executors for
VHDL/Verilog simulation and synthesis, with explicit execution policy.

[VCD simulation results](vcd.md) provides a proportional time axis, signal
selection and cursor inspection for local recordings and HDL results.

[Interactive HDL simulation](hdl-interactive.md) adds input controls and
Run/Pause/Step/Reset through an explicitly authorized stateful host session.

[Real HDL backends](hdl-backends.md) provides optional GHDL, Icarus and Yosys
adapters, a browser/service bridge and deterministic interactive replay.

The engine retains GFM parsing and loads specialized renderers when a document
uses the corresponding fence. Factories and manifests are exported through
`mathjslab-markdown/extensions`; MathJSLab execution has its separate entry.

| Family                                                       | Fences                                              | Renderer                    |
| ------------------------------------------------------------ | --------------------------------------------------- | --------------------------- |
| Diagrams                                                     | `mermaid`                                           | Mermaid                     |
| [Teaching blocks and references](didactic-and-references.md) | Colon containers and inline `{@ref label}`          | Built-in, no dependencies   |
| Flat molecules                                               | `smiles`                                            | SmilesDrawer                |
| [Music](music.md)                                            | `abc`, `mei`, `musicxml`                            | abcjs and Verovio           |
| [Maps](maps.md)                                              | `geojson`, `topojson`                               | Leaflet and topojson-client |
| [Declarative charts](vega-lite.md)                           | `vega-lite`                                         | Vega-Lite                   |
| [Graphs](graphviz.md)                                        | `dot`, `graphviz`                                   | Graphviz/Viz.js             |
| [3D molecules](molecules-3d.md)                              | `pdb`, `cif`, `mmcif`, `sdf`, `mol2`, `xyz`, `cube` | 3Dmol.js                    |
| [3D models](models-3d.md)                                    | `stl`, `obj`, `gltf`                                | Three.js                    |

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
