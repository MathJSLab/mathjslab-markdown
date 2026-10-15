# Carbon chains and aromaticity

**Objective:** classify open, closed, saturated and aromatic carbon chains.
**Extension:** SMILES.

## Connectivity as a criterion

Hexane has an open, homogeneous, saturated chain: only single bonds connect its
carbons.

```smiles
CCCCCC
```

Cyclohexane has a closed, saturated chain. In SMILES, digits mark ring closure;
they do not represent additional atoms.

```smiles
C1CCCCC1
```

## An aromatic ring

Benzene also has six carbons, but it has a system of delocalized pi electrons.
Its behavior is not simply that of three isolated double bonds. Lowercase
letters indicate aromatic atoms:

```smiles
c1ccccc1
```

In the representation with alternating bonds, resonance drawings are not
molecules switching identities. They are contributions to the description of a
single electronic structure.

## A heterogeneous chain

```smiles
CCOCC
```

In ethoxyethane, an oxygen lies between two carbons. The chain is
heterogeneous. In contrast, the oxygen of a terminal OH is not between carbons.

## Practice

1. Does the digit `1` in `C1CCCCC1` indicate a seventh carbon?
2. What distinguishes cyclohexane from benzene?
3. Why does `CCOCC` have a heterogeneous chain?

## Answers with explanations

1. No; it indicates the closure bond.
2. Cyclohexane is saturated; benzene has an aromatic system.
3. A heteroatom, oxygen, is inserted between carbons.
