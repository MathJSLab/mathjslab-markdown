# Cadenas carbonadas y aromaticidad

**Objetivo:** clasificar cadenas abiertas, cerradas, saturadas y aromáticas.
**Extensión:** SMILES.

## La conectividad como criterio

El hexano tiene una cadena abierta, homogénea y saturada: entre los carbonos
solo hay enlaces simples.

```smiles
CCCCCC
```

El ciclohexano tiene una cadena cerrada y saturada. En SMILES, las cifras
marcan el cierre de un anillo; no representan átomos adicionales.

```smiles
C1CCCCC1
```

## Un anillo aromático

El benceno también tiene seis carbonos, pero presenta un sistema de electrones
pi deslocalizados. Su comportamiento no corresponde simplemente al de tres
enlaces dobles aislados. Las letras minúsculas indican átomos aromáticos:

```smiles
c1ccccc1
```

En la representación con enlaces alternados, los dibujos de resonancia no son
moléculas que van cambiando de identidad. Son contribuciones para describir una
única estructura electrónica.

## Cadena heterogénea

```smiles
CCOCC
```

En el etoxietano, un oxígeno está entre dos carbonos. La cadena es heterogénea.
En cambio, el oxígeno de un OH terminal no queda entre carbonos.

## Practica

1. ¿La cifra `1` en `C1CCCCC1` indica un séptimo carbono?
2. ¿Qué diferencia distingue al ciclohexano del benceno?
3. ¿Por qué `CCOCC` tiene una cadena heterogénea?

## Respuestas comentadas

1. No; indica el enlace de cierre.
2. El ciclohexano es saturado; el benceno tiene un sistema aromático.
3. Hay un heteroátomo, el oxígeno, insertado entre carbonos.
