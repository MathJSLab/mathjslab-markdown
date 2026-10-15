# Organic compound classes: recognizing functional groups

**Objective:** identify alcohols, ethers, aldehydes, ketones, acids and esters.
**Extensions:** SMILES and MathJax.

## Structure determines classification

A functional group is a set of atoms and bonds associated with characteristic
chemical properties. Examine connectivity: containing the same elements does
not mean belonging to the same compound class.

| Example          | Class           | Identification criterion                      |
| ---------------- | --------------- | --------------------------------------------- |
| Ethanol          | Alcohol         | OH bonded to a saturated carbon               |
| Methoxymethane   | Ether           | Oxygen between two carbon groups              |
| Ethanal          | Aldehyde        | Carbonyl with hydrogen on the carbonyl carbon |
| Propanone        | Ketone          | Carbonyl between two carbons                  |
| Ethanoic acid    | Carboxylic acid | Carboxyl group, COOH                          |
| Methyl ethanoate | Ester           | COO group between organic groups              |

### Ethanol

```smiles
CCO
```

### Methoxymethane

```smiles
COC
```

### Ethanal and propanone

```smiles
CC=O
```

```smiles
CC(=O)C
```

### Ethanoic acid and methyl ethanoate

```smiles
CC(=O)O
```

```smiles
CC(=O)OC
```

In SMILES, `C` denotes aliphatic carbon, `O` denotes oxygen and `=` denotes a
double bond. Hydrogens bonded to carbon are usually implicit. Ethanol has
formula $\ce{C2H6O}$, but that formula alone does not distinguish the ether.

## Practice

1. Which pair in the table has the same molecular formula but different
   functional groups?
2. Why does the OH in a carboxyl group not classify the molecule as an alcohol?

## Answers with explanations

1. Ethanol and methoxymethane: $\ce{C2H6O}$.
2. Classification considers the complete carboxyl group, which characterizes a
   carboxylic acid.
