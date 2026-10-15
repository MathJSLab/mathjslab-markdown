# Rutas locales: coordenadas y conexiones

**Extensiones:** `maps`, `mermaid`.

## Ideas principales

Estos puntos y la ruta son ficticios, cerca de São Paulo. GeoJSON usa longitud
antes de latitud. El diagrama muestra el orden de las paradas; la línea del
mapa no es una ruta calculada por calles.

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
                "name": "Ruta ilustrativa"
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

## Práctica

¿Por qué invertir latitud y longitud cambia la posición? ¿La línea indica el
tiempo de viaje?

## Respuesta comentada

Cada posición del par tiene un significado definido. La línea une coordenadas,
pero no estima tráfico ni tiempo.

[Índice de la colección](README.md)

[Português brasileiro](../pt/mapa-de-rotas.md) ·
[English](../en/mapa-de-rotas.md)
