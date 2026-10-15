# Historia: capitales y organización territorial de Brasil

**Objetivo:** relacionar los cambios de capital con diferentes contextos
históricos. **Extensión:** maps, con TopoJSON.

## Tres ciudades, tres contextos

Salvador fue la sede del gobierno general y la primera capital del Brasil
colonial. En 1763, la capital se trasladó a Río de Janeiro. En 1960, Brasilia
se convirtió en la capital federal. Estos cambios permiten discutir la
administración, la circulación económica y los proyectos de integración
territorial.

El mapa utiliza puntos aproximados de las ciudades actuales. No representa
fronteras antiguas, rutas de viaje ni una reconstrucción territorial de la
época.

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
                        "name": "Salvador — capital hasta 1763"
                    },
                    "coordinates": [
                        -38.50,
                        -12.97
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Río de Janeiro — capital de 1763 a 1960"
                    },
                    "coordinates": [
                        -43.20,
                        -22.91
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Brasilia — capital desde 1960"
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

## Interpretar sin simplificar demasiado

El traslado a Río acompañó el desplazamiento de la importancia económica y
administrativa hacia el centro-sur durante el período colonial. La construcción
de Brasilia se vinculó a un proyecto de traslado de la capital al interior.
Cada decisión tuvo varios actores y consecuencias; el mapa proporciona la
ubicación, mientras que la explicación histórica requiere también documentos y
contexto.

TopoJSON permite compartir arcos entre geometrías. En este ejemplo de puntos no
se necesita ningún arco; las coordenadas están directamente en las geometrías.

## Practica

1. Ordena las tres capitales cronológicamente.
2. ¿Qué cambio llevó la sede federal al interior del territorio?
3. ¿Por qué sería inadecuado unir los puntos y llamar a la línea una ruta
   histórica?

## Respuestas comentadas

1. Salvador, Río de Janeiro, Brasilia.
2. El traslado a Brasilia en 1960.
3. La línea sería una construcción gráfica sin evidencia sobre el trayecto
   realmente utilizado.
