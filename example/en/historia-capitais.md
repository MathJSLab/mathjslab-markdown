# History: capitals and Brazil's territorial organization

**Objective:** connect changes of capital to different historical contexts.
**Extension:** maps, with TopoJSON.

## Three cities, three contexts

Salvador was the seat of the governor-general and the first capital of colonial
Brazil. In 1763, the capital moved to Rio de Janeiro. In 1960, Brasília became
the federal capital. These changes offer opportunities to discuss
administration, economic circulation and territorial integration projects.

The map uses approximate points for the present-day cities. It does not
represent old borders, travel routes or a reconstruction of historical
territory.

```topojson
{
    "type": "Topology",
    "objects": {
        "capitais": {
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "Point",
                    "properties": {
                        "name": "Salvador — capital until 1763"
                    },
                    "coordinates": [
                        -38.50,
                        -12.97
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Rio de Janeiro — capital from 1763 to 1960"
                    },
                    "coordinates": [
                        -43.20,
                        -22.91
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Brasília — capital since 1960"
                    },
                    "coordinates": [
                        -47.88,
                        -15.79
                    ]
                }
            ]
        }
    },
    "arcs": []
}
```

## Interpreting without oversimplifying

The move to Rio accompanied the shift of economic and administrative importance
toward the center-south during the colonial period. The construction of
Brasília was linked to a project to move the capital inland. Each decision
involved several actors and consequences; the map provides location, while
historical explanation also requires documents and context.

TopoJSON allows geometries to share arcs. In this point example, no arcs are
needed; the coordinates are stored directly in the geometries.

## Practice

1. Put the three capitals in chronological order.
2. Which change moved the federal seat inland?
3. Why would it be inappropriate to connect these points and call the line a
   historical route?

## Answers with explanations

1. Salvador, Rio de Janeiro, Brasília.
2. The transfer to Brasília in 1960.
3. The line would be a graphic construction with no evidence of the actual
   route taken.
