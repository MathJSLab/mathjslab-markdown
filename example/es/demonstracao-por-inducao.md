# Inducción: suma de los primeros enteros

**Extensiones:** `didactic`, `cross-references`, `mathjax`.

## Ideas principales

La inducción necesita una base y un paso que conserve la afirmación.

El {@ref soma} enuncia el resultado. La {@ref identidade} registra la fórmula
utilizada.

::: theorem Suma de enteros {#soma}

Para todo entero $n\ge1$, la suma de 1 a n es $n(n+1)/2$.

:::

::: equation Identidad {#identidade}

$$\sum_{j=1}^{n}j=\frac{n(n+1)}{2}.$$

:::

::: proof Base y paso

La base n=1 satisface la fórmula. Suponiendo la identidad para n=k, sumamos k+1
y obtenemos:

$$\frac{k(k+1)}{2}+(k+1)=\frac{(k+1)(k+2)}{2}.$$

:::

## Práctica

Use la fórmula para calcular 1+2+...+10. ¿Por qué comprobar solo n=10 no
demuestra el teorema?

## Respuesta comentada

La suma vale 55. Un caso aislado no establece la afirmación para todos los
enteros positivos.

[Índice de la colección](README.md)

[Português brasileiro](../pt/demonstracao-por-inducao.md) ·
[English](../en/demonstracao-por-inducao.md)
