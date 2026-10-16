# Methane: tetrahedral geometry

**Objective:** interpret explicit bonds and compare a flat drawing with spatial
structure. **Extensions:** molecule-3d, SMILES, MathJax.

## Key ideas

Methane, $\ce{CH4}$, has four single C–H bonds. A flat drawing with four lines
does not mean that the atoms lie in one plane. The four bonding regions have an
approximately tetrahedral arrangement, with angles close to $109.5^\circ$.

```smiles
C
```

```sdf {width=24rem height=18rem}
Methane
  MathJSLab

  5  4  0  0  0  0            999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6291    0.6291    0.6291 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.6291   -0.6291   -0.6291 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6291    0.6291   -0.6291 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6291   -0.6291    0.6291 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
  1  4  1  0  0  0  0
  1  5  1  0  0  0  0
M  END
$$
```

In SMILES, `C` has four implicit hydrogens. In SDF, five atoms and four bonds
are explicit. The coordinates are an approximate model, not a measurement made
in this lesson. Rotate the molecule to compare different views of the same
structure.

Symmetry helps explain why methane has no permanent molecular dipole. Rotating
the model changes the view, not the molecule. A change in connectivity,
however, can change chemical identity.

## Practice

1. How many single bonds appear in the SDF?
2. How does methane’s geometry differ from water’s?

## Answers with explanations

1. Four, all from the central carbon.
2. Methane is tetrahedral; water is bent, with two lone pairs on oxygen.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/metano-tetraedrico.md) ·
[Español](../es/metano-tetraedrico.md)
