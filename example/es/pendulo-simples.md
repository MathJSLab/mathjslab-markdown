# Péndulo simple: período y aproximaciones

**Objetivo:** utilizar un modelo aproximado e identificar sus condiciones de
aplicación. **Extensiones:** MathJax, MathJSLab.

## Ideas clave

El período es el tiempo de una oscilación completa. Para un péndulo ideal de
pequeña amplitud, hilo de masa despreciable y sin rozamiento, usamos:

$$
T\approx2\pi\sqrt{\frac{\ell}{g}}.
$$

La longitud $\ell$ se mide desde el punto de suspensión hasta el centro de
masa. Usa metros y $g$ en metros por segundo al cuadrado para obtener $T$ en
segundos. La masa no aparece en esta aproximación. La fórmula no es exacta para
ángulos grandes o sistemas muy amortiguados.

```mathjslab
ell = [0.25; 1; 4];
g = 9.8;
T = 2*pi*sqrt(ell/g);
[ell, T]
```

El bloque adopta $g=9{,}8$ y compara tres longitudes. Cuadruplicar la longitud
duplica el período porque depende de la raíz cuadrada, no directamente de
$\ell$. Cronometrar varias oscilaciones y dividir por su número ayuda a reducir
el efecto del tiempo de reacción en una medición.

## Practica

1. Estima $T$ para una longitud de 1 m.
2. ¿Duplicar la masa modifica el período en este modelo?

## Respuestas comentadas

1. Aproximadamente 2,01 s.
2. No; esto se cumple dentro de las hipótesis del modelo.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/pendulo-simples.md) ·
[English](../en/pendulo-simples.md)
