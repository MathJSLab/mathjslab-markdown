# Rotas locais: coordenadas e conexões

**Extensões:** `maps`, `mermaid`.

## Ideias principais

Estes pontos e a rota são fictícios, próximos a São Paulo. GeoJSON usa
longitude antes de latitude. O fluxograma mostra a ordem das paradas; a linha
no mapa não representa uma rota calculada por ruas.

```geojson
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Biblioteca"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -46.64,
                    -23.55
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Parque"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -46.63,
                    -23.54
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Rota ilustrativa"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        -46.64,
                        -23.55
                    ],
                    [
                        -46.63,
                        -23.54
                    ]
                ]
            }
        }
    ]
}
```

```mermaid
flowchart LR
 A["Biblioteca"] --> B["Parque"]
```

## Prática

Por que inverter latitude e longitude muda a posição? A linha informa tempo de
viagem?

## Resposta comentada

Cada posição do par tem um significado definido. A linha une coordenadas, mas
não estima trânsito ou tempo.

[Índice da coleção](README.md)

[English](../en/mapa-de-rotas.md) · [Español](../es/mapa-de-rotas.md)
