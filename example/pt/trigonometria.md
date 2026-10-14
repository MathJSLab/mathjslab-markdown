# Funções trigonométricas e suas relações

**Objetivo:** relacionar círculo unitário, periodicidade e identidades.
**Extensões:** MathJSLab e MathJax.

## Do triângulo ao círculo

No triângulo retângulo, o seno é a razão entre cateto oposto e hipotenusa; o
cosseno usa o cateto adjacente. No círculo de raio 1, o ponto associado ao
ângulo $\theta$ tem coordenadas $(\cos\theta,\sin\theta)$. Isso estende as
funções a ângulos além dos ângulos agudos.

A relação %`sin(theta)^2 + cos(theta)^2`% corresponde ao raio ao quadrado:

$$
\sin^2\theta+\cos^2\theta=1.
$$

O MathJSLab usa radianos em `sin`, `cos` e `tan`. Uma volta corresponde a
$2\pi$ radianos ou $360^\circ$; portanto, $30^\circ=\pi/6$.

## Experimento numérico

Execute o bloco e compare as três colunas: ângulo, seno e cosseno. A expressão
apresentada no texto é notação matemática; a execução ocorre no bloco de
comandos quando habilitada pelo aplicativo.

```mathjslab
theta = [0; pi/6; pi/4; pi/3; pi/2];
s = sin(theta);
c = cos(theta);
[theta, s, c]
s.^2 + c.^2
```

O último resultado deve ficar próximo de 1 em todas as posições. Pequenas
diferenças podem resultar da representação numérica.

## Tangente e simetrias

$$
\tan\theta=\frac{\sin\theta}{\cos\theta},\qquad \cos\theta\ne0.
$$

A tangente não está definida em $\pi/2+k\pi$, com $k$ inteiro. Uma calculadora
pode apresentar um valor muito grande nesses pontos, pois a aproximação de
$\pi$ não produz necessariamente cosseno exatamente zero. O seno é ímpar, o
cosseno é par e ambos têm período $2\pi$.

```mathjslab
x = linspace(0, 2*pi, 17);
[x', sin(x)', cos(x)']
sin(-pi/6)
cos(-pi/6)
tan(pi/4)
```

## Pratique

1. Calcule seno, cosseno e tangente de $\pi/4$.
2. Explique por que seno e cosseno nunca ultrapassam 1 em módulo.
3. Use o bloco para comparar $\sin(\theta)$ e $\sin(\theta+2\pi)$.

## Respostas comentadas

1. Seno e cosseno valem $\sqrt2/2$; a tangente vale 1.
2. São coordenadas de um ponto do círculo unitário.
3. Os valores coincidem, salvo arredondamentos: uma volta retorna ao mesmo
   ponto.
