# Funções orgânicas: reconhecer grupos funcionais

**Objetivo:** identificar álcool, éter, aldeído, cetona, ácido e éster.
**Extensões:** SMILES e MathJax.

## A estrutura determina a classificação

Um grupo funcional é um conjunto de átomos e ligações associado a propriedades
químicas características. Observe a conectividade, pois ter os mesmos elementos
não significa pertencer à mesma função.

| Exemplo            | Função            | Critério de identificação                       |
| ------------------ | ----------------- | ----------------------------------------------- |
| Etanol             | Álcool            | OH ligado a carbono saturado                    |
| Metoximetano       | Éter              | Oxigênio entre dois grupos carbônicos           |
| Etanal             | Aldeído           | Carbonila com hidrogênio no carbono carbonílico |
| Propanona          | Cetona            | Carbonila entre dois carbonos                   |
| Ácido etanoico     | Ácido carboxílico | Grupo carboxila, COOH                           |
| Etanoato de metila | Éster             | Grupo COO entre grupos orgânicos                |

### Etanol

Os atributos da linha de abertura controlam a apresentação: largura em
porcentagem, pixels ou rem; altura em pixels, rem ou auto. O corpo da linguagem
não muda.

Uma representação pode participar da frase: o etanol :smiles[CCO]{height=2rem}
contém um grupo OH. O código `:smiles[CCO]` continua sendo texto literal.

```smiles {width=50%}
CCO
```

### Metoximetano

```smiles {width=12rem height=6rem}
COC
```

### Etanal e propanona

```smiles
CC=O
```

```smiles
CC(=O)C
```

### Ácido etanoico e etanoato de metila

```smiles
CC(=O)O
```

```smiles
CC(=O)OC
```

Na escrita SMILES, `C` indica carbono alifático, `O` indica oxigênio e `=`
indica ligação dupla. Hidrogênios ligados ao carbono são geralmente implícitos.
O etanol tem fórmula $\ce{C2H6O}$, mas a fórmula sozinha não distingue o éter.

## Pratique

1. Qual par da tabela tem a mesma fórmula molecular, mas funções distintas?
2. Por que um grupo OH em uma carboxila não classifica a molécula como álcool?

## Respostas comentadas

1. Etanol e metoximetano: $\ce{C2H6O}$.
2. A classificação considera a carboxila completa, que caracteriza o ácido
   carboxílico.
