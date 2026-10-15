# Mediterrâneo antigo: cidades e conexões

**Objetivo:** usar localização como apoio à comparação histórica sem confundir
mapa e evidência. **Extensões:** maps/TopoJSON, Mermaid.

## Ideias centrais

Atenas, Roma e Alexandria permitem discutir diferentes contextos do mundo
mediterrâneo antigo. Cidades conectavam espaços de comércio, administração,
produção intelectual e circulação de pessoas. Elas não tiveram a mesma função
ou importância em todos os períodos.

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
                        "name": "Atenas"
                    },
                    "coordinates": [
                        23.73,
                        37.98
                    ]
                },
                {
                    "type": "Point",
                    "properties": {
                        "name": "Roma"
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
 P[Escolher período] --> F[Comparar fontes]
 F --> C[Contextualizar as cidades]
```

O mapa usa posições atuais aproximadas. Não representa fronteiras antigas nem
afirma que existia uma rota direta entre todos os pontos. O diagrama organiza
perguntas de investigação, não uma cronologia única.

Para comparar as cidades, delimite o período e consulte fontes adequadas, como
textos, inscrições e vestígios materiais. A posição ajuda a formular hipóteses
sobre acesso ao mar e circulação, mas não prova sozinha como viviam seus
habitantes. Evite tratar a Antiguidade como uma sociedade homogênea e sem
mudanças.

## Pratique

1. Qual das três cidades está mais ao norte no mapa?
2. Um ponto no mapa prova a existência de uma rota comercial?

## Respostas comentadas

1. Roma, pela maior latitude.
2. Não; essa conclusão exige outras fontes.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/mediterraneo-antigo.md) ·
[Español](../es/mediterraneo-antigo.md)
