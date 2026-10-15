# Funciones trigonométricas y sus relaciones

**Objetivo:** relacionar la circunferencia unitaria, la periodicidad y las
identidades. **Extensiones:** MathJSLab y MathJax.

## Del triángulo a la circunferencia

En un triángulo rectángulo, el seno es la razón entre el cateto opuesto y la
hipotenusa; el coseno utiliza el cateto adyacente. En una circunferencia de
radio 1, el punto asociado al ángulo $\theta$ tiene coordenadas
$(\cos\theta,\sin\theta)$. Así se extienden las funciones más allá de los
ángulos agudos.

La expresión %`sin(theta)^2 + cos(theta)^2`% corresponde al radio al cuadrado:

$$
\sin^2\theta+\cos^2\theta=1.
$$

MathJSLab utiliza radianes en `sin`, `cos` y `tan`. Una vuelta equivale a
$2\pi$ radianes o $360^\circ$; por tanto, $30^\circ=\pi/6$.

## Experimento numérico

Ejecuta el bloque y compara las tres columnas: ángulo, seno y coseno. La
expresión del texto es notación matemática; la ejecución se realiza en el
bloque de comandos cuando la aplicación la habilita.

```mathjslab
theta = [0; pi/6; pi/4; pi/3; pi/2];
s = sin(theta);
c = cos(theta);
[theta, s, c]
s.^2 + c.^2
```

El último resultado debe estar cerca de 1 en todas las posiciones. Las pequeñas
diferencias pueden deberse a la representación numérica.

## Tangente y simetrías

$$
\tan\theta=\frac{\sin\theta}{\cos\theta},\qquad \cos\theta\ne0.
$$

La tangente no está definida en $\pi/2+k\pi$, con $k$ entero. Una calculadora
puede mostrar un valor muy grande en esos puntos porque la aproximación de
$\pi$ no produce necesariamente un coseno exactamente nulo. El seno es impar,
el coseno es par y ambos tienen período $2\pi$.

```mathjslab
x = linspace(0, 2*pi, 17);
[x', sin(x)', cos(x)']
sin(-pi/6)
cos(-pi/6)
tan(pi/4)
```

## Practica

1. Calcula el seno, el coseno y la tangente de $\pi/4$.
2. Explica por qué el seno y el coseno nunca superan 1 en valor absoluto.
3. Utiliza el bloque para comparar $\sin(\theta)$ y $\sin(\theta+2\pi)$.

## Respuestas comentadas

1. El seno y el coseno valen $\sqrt2/2$; la tangente vale 1.
2. Son las coordenadas de un punto de la circunferencia unitaria.
3. Los valores coinciden, salvo redondeos: una vuelta regresa al mismo punto.
