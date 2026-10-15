# Molecular geometry of water

**Objective:** connect three-dimensional structure and polarity.
**Extensions:** molecule-3d, SMILES and MathJax.

## Complementary representations

Water has two hydrogens bonded to one oxygen:

```smiles
O
```

In this SMILES, the oxygen's two hydrogens are implicit. A connectivity drawing
does not provide three-dimensional coordinates. The following XYZ block is an
approximate geometric model in ångströms:

```xyz
3
Water: approximate geometry in angstroms
O 0.000000 0.000000 0.000000
H 0.758602 0.000000 0.504284
H -0.758602 0.000000 0.504284
```

## Why is the molecule bent?

In the electron-pair repulsion interpretation, oxygen has two bonding pairs and
two lone pairs. The electron-pair arrangement is approximately tetrahedral, but
molecular geometry considers atom positions: it is bent, with an H–O–H angle
close to $104.5^\circ$.

Because oxygen attracts the bonding electrons more strongly and the molecule is
bent, the bond dipoles do not cancel. Water is polar. Rotating the model helps
reveal the shape but does not directly show the electron pairs.

## Practice

1. How many atoms should be declared in the first XYZ line?
2. Why do two polar bonds not always guarantee a polar molecule?
3. Compare water with a linear, symmetrical $\ce{CO2}$ molecule.

## Answers with explanations

1. Three.
2. The vector sum of the dipoles may be zero, depending on geometry.
3. In $\ce{CO2}$, opposing dipoles cancel; in bent water, they do not.
