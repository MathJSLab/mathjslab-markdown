# Geometria molecular da água

**Objetivo:** relacionar estrutura tridimensional e polaridade. **Extensões:**
molecule-3d, SMILES e MathJax.

## Representações complementares

A água possui dois hidrogênios ligados a um oxigênio:

```smiles
O
```

Nesse SMILES, os dois hidrogênios do oxigênio são implícitos. O desenho de
conectividade não fornece coordenadas tridimensionais. O bloco XYZ seguinte é
um modelo geométrico aproximado em ångströms:

```xyz
3
Agua: geometria aproximada em angstroms
O 0.000000 0.000000 0.000000
H 0.758602 0.000000 0.504284
H -0.758602 0.000000 0.504284
```

## Por que a molécula é angular?

Na interpretação por repulsão de pares eletrônicos, o oxigênio tem dois pares
ligantes e dois pares não ligantes. A distribuição eletrônica é aproximadamente
tetraédrica, mas a geometria molecular considera as posições dos átomos: ela é
angular, com ângulo H–O–H próximo de $104{,}5^\circ$.

Como o oxigênio atrai mais fortemente os elétrons das ligações e a molécula é
angular, os dipolos das ligações não se cancelam. A água é polar. Girar o
modelo ajuda a perceber a forma, mas não mostra diretamente os pares
eletrônicos.

## Pratique

1. Quantos átomos devem ser declarados na primeira linha do XYZ?
2. Por que duas ligações polares não garantem sempre uma molécula polar?
3. Compare a água com uma molécula linear e simétrica de $\ce{CO2}$.

## Respostas comentadas

1. Três.
2. A soma vetorial dos dipolos pode ser zero, dependendo da geometria.
3. No $\ce{CO2}$, os dipolos opostos se cancelam; na água angular, não.
