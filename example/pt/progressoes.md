# Progressões aritméticas e geométricas

**Objetivo:** reconhecer padrões, calcular termos e somar sequências.
**Extensão:** MathJax. **Conhecimentos prévios:** potências e equações.

## Dois modos de crescer

Uma progressão aritmética (PA) tem diferença constante entre termos
consecutivos. Em $3,7,11,15,\ldots$, essa diferença é $r=4$. Partindo de $a_1$,
acrescentamos a razão $n-1$ vezes:

$$
a_n=a_1+(n-1)r.
$$

Assim, $a_{10}=3+9\cdot4=39$. A razão pode ser negativa ou zero: a sequência
$20,17,14,\ldots$ é uma PA decrescente.

Uma progressão geométrica (PG) tem multiplicador constante. Em
$2,6,18,54,\ldots$, a razão é $q=3$:

$$
a_n=a_1q^{n-1}.
$$

Logo, $a_6=2\cdot3^5=486$. Para obter a razão por divisão, o termo anterior
precisa ser diferente de zero. Com razão negativa, os sinais alternam.

## Somando termos

Na PA, os pares primeiro–último, segundo–penúltimo e assim por diante têm a
mesma soma. Isso leva a:

```math
S_n=\frac{n(a_1+a_n)}{2}.
```

Nos dez primeiros termos da PA anterior, $S_{10}=10(3+39)/2=210$. Na PG,
multiplicar a soma por $q$ e subtrair as duas expressões elimina os termos
intermediários:

$$
S_n=a_1\frac{q^n-1}{q-1}\quad(q\ne1).
$$

Se $q=1$, usamos $S_n=na_1$. Para $|q|<1$, a soma infinita converge para
$S_\infty=a_1/(1-q)$; não podemos usar essa fórmula fora dessa condição.

## Pratique

1. Uma arquibancada tem 12 fileiras. A primeira comporta 18 pessoas e cada
   fileira seguinte comporta duas a mais. Qual é a capacidade total?
2. Uma sequência começa em 80 e cada termo é metade do anterior. Calcule o
   quinto termo e a soma infinita.
3. A sequência $1,-2,4,-8$ é uma PA ou uma PG? Justifique.

## Respostas comentadas

1. $a_{12}=40$ e $S_{12}=12(18+40)/2=348$ pessoas.
2. $a_5=80(1/2)^4=5$ e $S_\infty=160$.
3. É PG de razão $-2$; as diferenças não são constantes.
