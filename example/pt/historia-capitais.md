# História: capitais e organização territorial do Brasil

**Objetivo:** relacionar mudanças de capital a diferentes contextos históricos.
**Extensão:** maps, com TopoJSON.

## Três cidades, três contextos

Salvador foi a sede do governo-geral e a primeira capital do Brasil colonial.
Em 1763, a capital foi transferida para o Rio de Janeiro. Em 1960, Brasília
tornou-se a capital federal. Essas mudanças permitem discutir administração,
circulação econômica e projetos de integração territorial.

O mapa usa pontos aproximados das cidades atuais. Ele não representa fronteiras
antigas, rotas de viagem ou uma reconstituição territorial de época.

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
                        "name": "Salvador — capital até 1763"
                    },
                    "coordinates": [
                        -38.50,
                        -12.97
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Rio de Janeiro — capital de 1763 a 1960"
                    },
                    "coordinates": [
                        -43.20,
                        -22.91
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Brasília — capital desde 1960"
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

## Interpretar sem simplificar demais

A transferência para o Rio acompanhou o deslocamento de importância econômica e
administrativa para o centro-sul durante o período colonial. A construção de
Brasília vinculou-se a um projeto de interiorização da capital. Cada decisão
teve vários agentes e consequências; o mapa oferece localização, enquanto a
explicação histórica exige também documentos e contexto.

TopoJSON permite compartilhar arcos entre geometrias. Neste exemplo de pontos,
nenhum arco é necessário; as coordenadas estão diretamente nas geometrias.

## Pratique

1. Ordene as três capitais cronologicamente.
2. Qual mudança levou a sede federal para o interior do território?
3. Por que seria inadequado ligar esses pontos e chamar a linha de rota
   histórica?

## Respostas comentadas

1. Salvador, Rio de Janeiro, Brasília.
2. A transferência para Brasília, em 1960.
3. A linha seria uma construção gráfica sem evidência sobre o trajeto
   efetivamente usado.
