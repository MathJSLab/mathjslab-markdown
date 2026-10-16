# Metano: geometría tetraédrica

**Objetivo:** interpretar enlaces explícitos y comparar un dibujo plano con la
estructura espacial. **Extensiones:** molecule-3d, SMILES, MathJax.

## Ideas clave

El metano, $\ce{CH4}$, tiene cuatro enlaces simples C–H. Un dibujo plano con
cuatro trazos no significa que los átomos estén en el mismo plano. Las cuatro
regiones de enlace se distribuyen de forma aproximadamente tetraédrica, con
ángulos próximos a $109{,}5^\circ$.

```smiles
C
```

```sdf {width=24rem height=18rem}
Metano
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

En SMILES, `C` tiene cuatro hidrógenos implícitos. En SDF hay cinco átomos y
cuatro enlaces explícitos. Las coordenadas son un modelo aproximado, no una
medición realizada en esta clase. Gira la molécula para comparar distintas
vistas de la misma estructura.

La simetría ayuda a explicar por qué el metano no tiene dipolo molecular
permanente. Girar el modelo cambia la vista, no la molécula. Un cambio de
conectividad, en cambio, puede modificar su identidad química.

## Practica

1. ¿Cuántos enlaces simples aparecen en el SDF?
2. ¿En qué difiere la geometría del metano de la del agua?

## Respuestas comentadas

1. Cuatro, todos desde el carbono central.
2. El metano es tetraédrico; el agua es angular, con dos pares no enlazantes en
   el oxígeno.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/metano-tetraedrico.md) ·
[English](../en/metano-tetraedrico.md)
