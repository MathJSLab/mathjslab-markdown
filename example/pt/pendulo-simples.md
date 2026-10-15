# Pêndulo simples: período e aproximações

**Objetivo:** usar um modelo aproximado e identificar suas condições de
aplicação. **Extensões:** MathJax, MathJSLab.

## Ideias centrais

O período é o tempo de uma oscilação completa. Para um pêndulo ideal com
pequenas amplitudes, fio de massa desprezível e sem atrito, usamos:

$$
T\approx2\pi\sqrt{\frac{\ell}{g}}.
$$

O comprimento $\ell$ é medido do ponto de suspensão ao centro de massa. Use
metros e $g$ em metros por segundo ao quadrado para obter $T$ em segundos. A
massa não aparece nessa aproximação. A fórmula não é exata para grandes ângulos
ou sistemas com forte amortecimento.

```mathjslab
ell = [0.25; 1; 4];
g = 9.8;
T = 2*pi*sqrt(ell/g);
[ell, T]
```

O bloco adota $g=9{,}8$ e compara três comprimentos. Quadruplicar o comprimento
dobra o período, pois ele depende da raiz quadrada, não diretamente de $\ell$.
Ao medir um pêndulo, cronometrar várias oscilações e dividir pelo número delas
ajuda a reduzir o efeito do tempo de reação.

## Pratique

1. Estime $T$ para comprimento de 1 m.
2. Dobrar a massa altera o período nesse modelo?

## Respostas comentadas

1. Aproximadamente 2,01 s.
2. Não; isso vale dentro das hipóteses do modelo.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/pendulo-simples.md) · [Español](../es/pendulo-simples.md)
