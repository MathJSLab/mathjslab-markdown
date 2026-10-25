# Teoremas, exercícios e referências

**Extensões:** `didactic`, `cross-references`, `mathjax`.

Consulte a {@ref sec-foundations} antes da {@ref sec-practice}.

## 1. Ideias principais {#sec-foundations}

Vamos aplicar {@ref pitagoras} aos valores da {@ref resultados}. As dicas e
soluções ficam recolhidas até você abri-las.

:::: theorem Teorema de Pitágoras {#pitagoras}

Em um triângulo retângulo, os catetos $a$, $b$ e a hipotenusa $c$ satisfazem:

::: equation {#eq-pythagoras}

$$a^2+b^2=c^2.$$

:::

::: hint Interpretação geométrica

Compare as áreas dos quadrados construídos sobre os lados.

:::

::::

A relação da {@ref eq-pythagoras} é ilustrada na {@ref fig-areas}.

<!-- prettier-ignore -->
::: figure Relação entre as áreas {#fig-areas}

**a² + b² → c²**

:::

::: table Triângulos retângulos {#resultados}

| a   | b   | c   |
| --- | --- | --- |
| 3   | 4   | 5   |
| 5   | 12  | 13  |

:::

::: exercise Uma aplicação {#aplicacao}

Uma escada tem a base a 6 m da parede e o topo a 8 m do chão. Determine seu
comprimento.

:::

## 2. Prática {#sec-practice}

Resolva {@ref aplicacao} usando {@ref pitagoras}.

::: solution Resposta comentada

$c=\sqrt{6^2+8^2}=10$ m. O comprimento é a hipotenusa.

:::

::: warning Verifique as hipóteses {#warning-assumptions}

Aplique um modelo matemático apenas enquanto suas **hipóteses** forem válidas.

:::

Revise {@ref warning-assumptions} antes de usar o resultado.

[Índice da coleção](README.md)

[English](../en/blocos-didaticos.md) · [Español](../es/blocos-didaticos.md)
