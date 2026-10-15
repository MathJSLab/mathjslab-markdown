# Metano: a geometria tetraédrica

**Objetivo:** interpretar ligações explícitas e comparar desenho plano com
estrutura espacial. **Extensões:** molecule-3d, SMILES, MathJax.

## Ideias centrais

O metano, $\ce{CH4}$, possui quatro ligações simples C–H. Um desenho plano com
quatro traços não significa que os átomos estejam no mesmo plano. As quatro
regiões de ligação se distribuem de modo aproximadamente tetraédrico, com
ângulos próximos de $109{,}5^\circ$.

```smiles
C
```

```sdf
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

Em SMILES, `C` tem quatro hidrogênios implícitos. No SDF, há cinco átomos e
quatro ligações explícitas. As coordenadas são um modelo aproximado, não o
resultado de uma medição nesta aula. Gire a molécula para comparar vistas
diferentes da mesma estrutura.

A simetria ajuda a explicar por que o metano não tem dipolo molecular
permanente. Girar o modelo muda a vista, mas não cria uma molécula diferente.
Uma mudança de conectividade, por sua vez, pode mudar sua identidade química.

## Pratique

1. Quantas ligações simples aparecem no SDF?
2. Qual é a diferença entre a geometria do metano e a da água?

## Respostas comentadas

1. Quatro, todas partindo do carbono central.
2. Metano é tetraédrico; água é angular, com dois pares não ligantes no
   oxigênio.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/metano-tetraedrico.md) · [Español](../es/metano-tetraedrico.md)
