# Geografía: ubicación y coordenadas en Brasil

**Objetivo:** interpretar la latitud, la longitud y las posiciones relativas.
**Extensión:** maps, con GeoJSON.

## Localizar puntos

La latitud mide la posición al norte o al sur del ecuador; la longitud mide la
posición al este o al oeste del meridiano de referencia. En GeoJSON, el orden
es **longitud, latitud**, en grados. Los puntos siguientes aproximan los
centros de tres ciudades, sin representar sus límites municipales.

```geojson
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Manaos"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -60.02,
                    -3.10
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Brasilia"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -47.88,
                    -15.79
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Porto Alegre"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -51.23,
                    -30.03
                ]
            }
        }
    ]
}
```

## Leer un mapa con criterio

Las tres latitudes son negativas: las ciudades están en el hemisferio sur.
Manaos está más cerca del ecuador. Brasilia está más al este que Porto Alegre,
pues su longitud es menos negativa. El paquete puede mostrar únicamente las
geometrías vectoriales; un mapa de fondo depende de la configuración de la
aplicación.

No estimes distancias en kilómetros restando simplemente grados de longitud: la
distancia correspondiente a un grado varía con la latitud.

## Practica

1. ¿Qué ciudad está más al sur?
2. ¿Por qué `[-15.79,-47.88]` no representa correctamente Brasilia?
3. ¿La posición de un punto define el área de una ciudad?

## Respuestas comentadas

1. Porto Alegre.
2. El orden está invertido: GeoJSON empieza por la longitud.
3. No; se necesita una geometría de límite, como un polígono.
