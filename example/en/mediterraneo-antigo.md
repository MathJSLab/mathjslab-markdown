# Ancient Mediterranean: cities and connections

**Objective:** use location to support historical comparison without confusing
maps with evidence. **Extensions:** maps/TopoJSON, Mermaid.

## Key ideas

Athens, Rome and Alexandria allow comparison of different contexts in the
ancient Mediterranean world. Cities linked spaces of trade, administration,
intellectual production and movement of people. They did not have the same
function or importance in every period.

```topojson
{
    "type": "Topology",
    "objects": {
        "cities": {
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "Point",
                    "properties": {
                        "name": "Athens"
                    },
                    "coordinates": [
                        23.73,
                        37.98
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Rome"
                    },
                    "coordinates": [
                        12.5,
                        41.9
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Alexandria"
                    },
                    "coordinates": [
                        29.92,
                        31.2
                    ]
                }
            ]
        }
    },
    "arcs": []
}
```

```mermaid
flowchart LR
 P[Choose a period] --> F[Compare sources]
 F --> C[Contextualize the cities]
```

The map uses approximate present-day positions. It does not represent ancient
borders or assert direct routes between all points. The diagram organizes
research questions, not a single chronology.

To compare cities, define the period and consult appropriate sources, such as
texts, inscriptions and material remains. Location helps formulate hypotheses
about access to the sea and circulation, but does not by itself prove how
inhabitants lived. Avoid treating antiquity as a homogeneous, unchanging
society.

## Practice

1. Which city is farthest north on the map?
2. Does a map point prove the existence of a trade route?

## Answers with explanations

1. Rome, with the highest latitude.
2. No; that conclusion requires other sources.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/mediterraneo-antigo.md) ·
[Español](../es/mediterraneo-antigo.md)
