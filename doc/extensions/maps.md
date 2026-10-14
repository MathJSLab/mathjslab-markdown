# Maps in Markdown

GeoJSON and TopoJSON provide vector features. The package defaults to a
neutral, vector-only map without requesting external tiles. A host can opt into
a baselayer; see [map providers](../map-providers.md). The MathJSLab app
explicitly selects OpenStreetMap, which does not change the package default.

```geojson
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Teaching triangle"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -47,
                            -23
                        ],
                        [
                            -46,
                            -23
                        ],
                        [
                            -46.5,
                            -22
                        ],
                        [
                            -47,
                            -23
                        ]
                    ]
                ]
            }
        }
    ]
}
```

Provider selection, attribution, resize and resource failures are scoped to
each map. A failed tile leaves vector features visible and produces a local
warning. Inline Leaflet styles must be installed in the map's Shadow DOM scope.
