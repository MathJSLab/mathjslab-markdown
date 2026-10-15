# Pausas musicales: el silencio tiene duración

**Objetivo:** mantener el pulso durante las pausas y comprobar la duración de
los compases. **Extensiones:** ABC, MathJax.

## Ideas clave

Una pausa indica un intervalo sin nota en esa voz, pero el tiempo musical
continúa. En el ejercicio original siguiente, el compás 4/4 contiene cuatro
tiempos de negra. `L:1/4` asigna una negra a la nota sin modificador.

```abc
X:1
T:Pausas y pulso
M:4/4
L:1/4
Q:1/4=80
K:C
C D z2 | E2 z G | c4 |]
```

En ABC, `z` es una pausa y `z2` dura dos tiempos en esta configuración. El
primer compás tiene do, re y una pausa de dos tiempos: $1+1+2=4$. En el
segundo, mi dura dos tiempos, la pausa uno y sol uno. El do agudo final, `c4`,
dura cuatro tiempos.

Cuenta en voz alta o marca el pulso con la mano sin llenar la pausa con una
nota. Las pausas contribuyen a organizar la frase. Si la aplicación ofrece
audio, úsalo para comprobar la duración sin sustituir la lectura.

## Practica

1. ¿Cuántos tiempos de pausa hay en el ejercicio?
2. ¿La duración de una pausa depende de la altura de la nota anterior?

## Respuestas comentadas

1. Tres: dos en el primer compás y uno en el segundo.
2. No; la determina la figura rítmica.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/pausas-musicais.md) ·
[English](../en/pausas-musicais.md)
