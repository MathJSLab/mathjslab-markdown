# Geografia: localização e coordenadas no Brasil

**Objetivo:** interpretar latitude, longitude e posições relativas.
**Extensão:** maps, com GeoJSON.

## Localizar pontos

Latitude mede a posição ao norte ou ao sul do equador; longitude mede a posição
a leste ou oeste do meridiano de referência. Em GeoJSON, a ordem é **longitude,
latitude**, em graus. Os pontos abaixo são aproximações dos centros de três
cidades, sem representar seus limites municipais.

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

## Ler um mapa com critério

As três latitudes são negativas: as cidades estão no hemisfério sul. Manaus
está mais perto do equador. Brasília está mais a leste que Porto Alegre, pois
sua longitude é menos negativa. O pacote pode mostrar somente as geometrias
vetoriais; um mapa de fundo depende da configuração do aplicativo.

Não estime distâncias em quilômetros apenas subtraindo graus de longitude: a
distância correspondente a um grau varia com a latitude.

## Pratique

1. Qual cidade está mais ao sul?
2. Por que `[-15.79,-47.88]` não representa corretamente Brasília?
3. A posição de um ponto define a área de uma cidade?

## Respostas comentadas

1. Porto Alegre.
2. A ordem foi invertida: GeoJSON começa pela longitude.
3. Não; seria necessária uma geometria de limite, como um polígono.
