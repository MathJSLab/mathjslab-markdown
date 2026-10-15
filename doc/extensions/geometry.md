# Declarative dynamic geometry

Enable the `geometry` educational feature or register `geometryExtension()`
from `mathjslab-markdown/extensions`. The same entry point exports
`geometryManifest` and the types `GeometrySpec`, `GeometryElementSpec`,
`GeometryElementType` and `GeometryAttributes`. JSXGraph and JSON5 are optional
dependencies, loaded on demand. Install `jsxgraph@1.14.0` and `json5@2.2.3` if
optional dependencies were omitted during installation.

```ts
const engine = createEducationalMarkdownEngine({
    features: ["geometry"],
    securityMode: "sanitized",
    allowedCapabilities: ["interactive"],
});
await engine.renderDocument(source, container);
```

The extension requires the `interactive` capability. Restricted documents
without that capability retain source text and emit the engine's capability
diagnostic. It needs no network, WASM, WebGL or execution capability. The
library assets must still be deployed normally.

## Format

Use a `geometry` fence containing JSON or JSON5:

````markdown
```geometry
{
  title: 'Midpoint of a segment',
  boundingBox: [-1, 4, 6, -2],
  axis: true,
  grid: true,
  elements: [
    {id: 'A', type: 'point', parents: [0, 0]},
    {id: 'B', type: 'point', parents: [4, 2]},
    {id: 'AB', type: 'segment', parents: ['A', 'B']},
    {id: 'M', type: 'midpoint', parents: ['A', 'B'],
     attributes: {strokeColor: '#16a34a', fillColor: '#16a34a'}},
  ],
}
```
````

`boundingBox` is `[left, top, right, bottom]` and defaults to `[-5, 5, 5, -5]`.
`axis` and `grid` default to false. `keepAspectRatio` defaults to true,
preserving the geometry's proportions. `title` supplies the board's accessible
label. The viewport defaults to 24rem high; a positive document `height` can
override it. The document theme supplies light or dark default colors.

Each element has an `id`, a `type`, a `parents` array, and optional
`attributes`. String parents reference local element IDs; numeric parents
supply coordinates, radii or an intersection index. Forward references are
resolved before creation. IDs start with a letter and contain up to 64 letters,
digits, underscores or hyphens. IDs must be unique within the diagram; cycles
and unknown references produce local errors. Separate diagrams can reuse IDs.

| Type                                                                 | Parents                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `point`                                                              | Two numeric coordinates: `[x, y]`                                        |
| `line`, `segment`, `arrow`, `midpoint`                               | Two point IDs                                                            |
| `circle`                                                             | Center point ID and a point ID or positive numeric radius                |
| `circumcenter`, `circumcircle`, `angle`, `bisector`, `arc`, `sector` | Three point IDs                                                          |
| `polygon`                                                            | Between 3 and 32 point IDs                                               |
| `parallel`, `perpendicular`                                          | Line ID, then point ID                                                   |
| `intersection`                                                       | Two line/curve IDs, then numeric index `0` or `1`                        |
| `glider`                                                             | Numeric `x`, `y`, then a line/curve ID                                   |
| `ellipse`, `hyperbola`                                               | Two focus point IDs, then a point ID or positive numeric defining length |
| `parabola`                                                           | Focus point ID, then directrix line ID                                   |
| `conic`                                                              | Five point IDs                                                           |

For angles and bisectors, the middle point is the vertex. Arcs and sectors use
center, start and end points. The ellipse's numeric length is the constant sum
of distances to its foci; the hyperbola's is the constant absolute difference.
Geometrically degenerate or nonintersecting configurations may have invisible
elements. Moving free points recalculates dependent constructions
automatically. Gliders remain constrained to their referenced object.

## Attributes and interaction

Allowed attributes are `name`, `fixed`, `visible`, `withLabel`, `strokeColor`,
`fillColor`, `strokeWidth`, `fillOpacity`, `size` and `dash`. Point-like
elements show their ID as a label by default; `name` changes the label. Free
points are draggable unless `fixed` is true. JSXGraph supplies pointer, touch
and keyboard interaction; the board container is focusable.

Labels are plain SVG text. Attributes do not accept HTML, callbacks,
expressions, external resources or arbitrary JSXGraph options. Colors are
alphabetic CSS names or hexadecimal values. Opacity is between 0 and 1; size
and stroke width are between 0 and 20; dash is an integer between 0 and 6. IDs
and names cannot be `__proto__`, `constructor` or `prototype`.

## Lifecycle and limits

Malformed input preserves source and emits `extension-render-error`, while
other blocks continue rendering. Validation checks parent counts, reference
types and dependencies before creating elements. Input follows
`maxSourceBytes`, contains at most 256 elements, and uses finite numbers
between -1,000,000 and 1,000,000. Unknown properties and element types are
rejected. This version supports 2D constructions; it does not evaluate function
expressions or JessieCode.

Boards are created only after the viewport is mounted and measurable. Visible
rendering mode can defer them through the engine's existing observer. Resize
updates the board; session updates, cancellation and disposal release
observers, event listeners and JSXGraph boards. The extension uses the viewport
element directly, supporting Shadow DOM. A document's completed render
operation follows the engine's usual signal lifecycle.

Use `cross-references` to wrap a construction in a numbered `figure` container.
See [JSXGraph documentation](https://jsxgraph.org/docs/) for the underlying
geometrical definitions; the extension's supported data format is defined here.
