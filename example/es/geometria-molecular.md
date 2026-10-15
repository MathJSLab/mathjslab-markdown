# Geometría molecular del agua

**Objetivo:** relacionar la estructura tridimensional y la polaridad.
**Extensiones:** molecule-3d, SMILES y MathJax.

## Representaciones complementarias

El agua tiene dos hidrógenos unidos a un oxígeno:

```smiles
O
```

En este SMILES, los dos hidrógenos del oxígeno son implícitos. El dibujo de
conectividad no proporciona coordenadas tridimensionales. El siguiente bloque
XYZ es un modelo geométrico aproximado en ångströms:

```xyz
3
Agua: geometría aproximada en angstroms
O 0.000000 0.000000 0.000000
H 0.758602 0.000000 0.504284
H -0.758602 0.000000 0.504284
```

## ¿Por qué la molécula es angular?

En la interpretación basada en la repulsión de pares electrónicos, el oxígeno
tiene dos pares enlazantes y dos no enlazantes. La distribución electrónica es
aproximadamente tetraédrica, pero la geometría molecular considera las
posiciones de los átomos: es angular, con un ángulo H–O–H próximo a
$104{,}5^\circ$.

Como el oxígeno atrae con mayor fuerza los electrones de los enlaces y la
molécula es angular, los dipolos de los enlaces no se cancelan. El agua es
polar. Girar el modelo ayuda a percibir la forma, pero no muestra directamente
los pares electrónicos.

## Practica

1. ¿Cuántos átomos deben declararse en la primera línea del XYZ?
2. ¿Por qué dos enlaces polares no garantizan siempre una molécula polar?
3. Compara el agua con una molécula lineal y simétrica de $\ce{CO2}$.

## Respuestas comentadas

1. Tres.
2. La suma vectorial de los dipolos puede ser cero, según la geometría.
3. En el $\ce{CO2}$, los dipolos opuestos se cancelan; en el agua angular, no.
