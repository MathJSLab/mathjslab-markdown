# Funciones orgánicas: reconocer grupos funcionales

**Objetivo:** identificar alcohol, éter, aldehído, cetona, ácido y éster.
**Extensiones:** SMILES y MathJax.

## La estructura determina la clasificación

Un grupo funcional es un conjunto de átomos y enlaces asociado a propiedades
químicas características. Observa la conectividad: tener los mismos elementos
no significa pertenecer a la misma función.

| Ejemplo            | Función           | Criterio de identificación                        |
| ------------------ | ----------------- | ------------------------------------------------- |
| Etanol             | Alcohol           | OH unido a un carbono saturado                    |
| Metoximetano       | Éter              | Oxígeno entre dos grupos carbonados               |
| Etanal             | Aldehído          | Carbonilo con hidrógeno en el carbono carbonílico |
| Propanona          | Cetona            | Carbonilo entre dos carbonos                      |
| Ácido etanoico     | Ácido carboxílico | Grupo carboxilo, COOH                             |
| Etanoato de metilo | Éster             | Grupo COO entre grupos orgánicos                  |

### Etanol

```smiles
CCO
```

### Metoximetano

```smiles
COC
```

### Etanal y propanona

```smiles
CC=O
```

```smiles
CC(=O)C
```

### Ácido etanoico y etanoato de metilo

```smiles
CC(=O)O
```

```smiles
CC(=O)OC
```

En SMILES, `C` indica carbono alifático, `O` indica oxígeno y `=` indica un
enlace doble. Los hidrógenos unidos al carbono suelen ser implícitos. El etanol
tiene fórmula $\ce{C2H6O}$, pero la fórmula sola no distingue el éter.

## Practica

1. ¿Qué pareja de la tabla tiene la misma fórmula molecular, pero funciones
   distintas?
2. ¿Por qué un grupo OH en un carboxilo no clasifica la molécula como alcohol?

## Respuestas comentadas

1. Etanol y metoximetano: $\ce{C2H6O}$.
2. La clasificación considera el carboxilo completo, que caracteriza al ácido
   carboxílico.
