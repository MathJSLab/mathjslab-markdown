# Geography: location and coordinates in Brazil

**Objective:** interpret latitude, longitude and relative positions.
**Extension:** maps, with GeoJSON.

## Locating points

Latitude measures position north or south of the equator; longitude measures
position east or west of the reference meridian. In GeoJSON, the order is
**longitude, latitude**, in degrees. The points below approximate the centers
of three cities; they do not represent municipal boundaries.

```geojson
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Manaus"
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
                "name": "Brasília"
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

## Reading a map carefully

All three latitudes are negative: the cities are in the Southern Hemisphere.
Manaus is closest to the equator. Brasília is farther east than Porto Alegre
because its longitude is less negative. The package may show only vector
geometries; a basemap depends on the application's configuration.

Do not estimate distances in kilometers simply by subtracting degrees of
longitude: the distance corresponding to one degree varies with latitude.

## Practice

1. Which city is farthest south?
2. Why does `[-15.79,-47.88]` not represent Brasília correctly?
3. Does the position of a point define a city's area?

## Answers with explanations

1. Porto Alegre.
2. The order is reversed: GeoJSON starts with longitude.
3. No; a boundary geometry, such as a polygon, would be needed.
