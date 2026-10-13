# Configurable map baselayers

GeoJSON and TopoJSON always provide the vector overlay. The canonical engine
keeps its vector-only default for existing consumers. An integrator can opt
into online raster XYZ tiles and choose a default provider:

```typescript
import { createEducationalMarkdownEngine } from "mathjslab-markdown";

const engine = createEducationalMarkdownEngine({
    features: ["maps"],
    mapOptions: { defaultProvider: "openstreetmap" },
});
```

The available presets are `openstreetmap`, `carto-light` (CARTO Positron), and
`carto-dark` (CARTO Dark Matter). Each map has its own provider selector,
including an offline option. Selecting a provider in one block does not change
other blocks. Only the selected layer requests tiles; layers are not
prefetched.

Direct extension users can pass the same options to `mapsExtension(options)`.
`MarkdownDocumentContext.mapOptions` overrides an instance's options for a
particular document. The existing `createMapBaseLayer` hook takes precedence
and remains available for integrator-defined Leaflet layers.

## Custom services

```typescript
import {
    mapsExtension,
    markdownMapProviders,
} from "mathjslab-markdown/extensions";

const extension = mapsExtension({
    defaultProvider: "my-service",
    providers: [
        ...markdownMapProviders,
        {
            id: "my-service",
            name: "My map service",
            url: "https://tiles.example.com/{z}/{x}/{y}.png",
            attribution: "© My map service",
            maxZoom: 18,
        },
    ],
    showSelector: true,
});
```

Each provider requires a unique `id`, unique display `name`, absolute HTTP(S)
`url`, and attribution. Optional fields are `minZoom`, `maxZoom`, and Leaflet
`subdomains` for a URL containing `{s}`. Attribution HTML is restricted to safe
links. Configurations are supplied by the host application, not by the Markdown
fence. `defaultProvider: false` starts without tiles; `showSelector: false`
hides the selector.

Network and origin policy still apply. For a sanitized document, explicitly
allow the selected tile origins and the maps extension's capabilities:

```typescript
import { createEducationalMarkdownEngine } from "mathjslab-markdown";
import { markdownMapProviders } from "mathjslab-markdown/extensions";

createEducationalMarkdownEngine({
    features: ["maps"],
    securityMode: "sanitized",
    allowedCapabilities: ["interactive", "network"],
    resourcePolicy: {
        allowedOrigins: [
            "https://course.example.com",
            "https://tile.openstreetmap.org",
        ],
    },
    mapOptions: {
        defaultProvider: "openstreetmap",
        providers: markdownMapProviders.filter(
            (provider) => provider.id === "openstreetmap",
        ),
    },
});
```

Blocked providers are omitted from the selector. A blocked default or failed
tile leaves the vector features visible and reports a local warning instead of
destroying the map. Tile errors identify the provider and resource without its
query string. Browser image errors do not expose the HTTP status; network
inspection can provide that detail. Abort/disposal removes the map and its
listeners. Each map retains responsive sizing and local Leaflet CSS.

The standard OSM endpoint and visible attribution follow the
[OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/).
Tiles are requested normally through browser images, preserving normal HTTP
caching and Referer behavior. There is no bulk download or automatic failover.
CARTO credits follow its
[attribution guidance](https://carto.com/attribution/index.html); its service
remains subject to
[CARTO's basemap terms](https://www.carto.com/legal/basemap-terms/).

## MathJSLab app

The app opts into OpenStreetMap by default. Edit
`mathjslab-app/src/MarkdownMapConfiguration.ts` to change its default, provider
list, or selector. Rendering remains implemented only in this package.

Browser regressions use deterministic tile responses. The app's optional live
test requests actual OSM tiles:

```powershell
$env:MARKDOWN_LIVE_MAPS='1'
npx playwright test test/browser/markdown-map-providers.spec.ts
```
