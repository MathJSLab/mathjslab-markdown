# Dióxido de carbono: ligações e simetria

**Objetivo:** relacionar uma estrutura linear com o cancelamento de dipolos.
**Extensões:** molecule-3d, SMILES, MathJax.

## Ideias centrais

O dióxido de carbono tem fórmula $\ce{CO2}$. O carbono faz duas ligações
duplas, uma com cada oxigênio. No SMILES, cada `=` indica uma ligação dupla; a
representação mostra conectividade, não a distribuição de elétrons.

```smiles
O=C=O
```

```xyz
3
CO2 linear: modelo aproximado
O -1.160 0.000 0.000
C 0.000 0.000 0.000
O 1.160 0.000 0.000
```

O modelo XYZ usa coordenadas aproximadas em ångströms e deixa visível a
geometria linear. Há duas regiões eletrônicas de ligação ao redor do carbono,
separadas por aproximadamente $180^\circ$. Cada ligação C–O é polar, mas seus
dipolos têm sentidos opostos e se cancelam na molécula simétrica.

Uma molécula apolar pode ter ligações polares. Para determinar polaridade
molecular, precisamos considerar também a geometria. Compare com a água, cuja
forma angular impede esse cancelamento.

## Pratique

1. Quantos átomos há em uma molécula de CO₂?
2. Uma ligação dupla conta como duas regiões na análise geométrica?

## Respostas comentadas

1. Três: um carbono e dois oxigênios.
2. Não; conta como uma região de ligação.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/dioxido-de-carbono.md) · [Español](../es/dioxido-de-carbono.md)
