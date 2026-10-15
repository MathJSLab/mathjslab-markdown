# Dióxido de carbono: enlaces y simetría

**Objetivo:** relacionar una estructura lineal con la cancelación de dipolos.
**Extensiones:** molecule-3d, SMILES, MathJax.

## Ideas clave

El dióxido de carbono tiene fórmula $\ce{CO2}$. El carbono forma dos enlaces
dobles, uno con cada oxígeno. En SMILES, cada `=` indica un enlace doble; la
representación muestra conectividad, no la distribución electrónica.

```smiles
O=C=O
```

```xyz
3
CO2 lineal: modelo aproximado
O -1.160 0.000 0.000
C 0.000 0.000 0.000
O 1.160 0.000 0.000
```

El modelo XYZ utiliza coordenadas aproximadas en ångströms y muestra la
geometría lineal. Hay dos regiones electrónicas de enlace alrededor del
carbono, separadas por aproximadamente $180^\circ$. Cada enlace C–O es polar,
pero sus dipolos tienen sentidos opuestos y se cancelan en la molécula
simétrica.

Una molécula apolar puede tener enlaces polares. Para determinar la polaridad
molecular también necesitamos la geometría. Compárala con el agua, cuya forma
angular impide esa cancelación.

## Practica

1. ¿Cuántos átomos hay en una molécula de CO₂?
2. ¿Un enlace doble cuenta como dos regiones en el análisis geométrico?

## Respuestas comentadas

1. Tres: un carbono y dos oxígenos.
2. No; cuenta como una región de enlace.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/dioxido-de-carbono.md) ·
[English](../en/dioxido-de-carbono.md)
