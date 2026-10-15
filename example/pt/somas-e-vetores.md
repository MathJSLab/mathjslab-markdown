# Somas e vetores: componentes e produto escalar

**Extensões:** `mathjslab`, `mathjax`.

## Ideias principais

Os vetores usam duas componentes. A soma combina componentes correspondentes; o
produto escalar soma produtos das componentes. O bloco executável exige um
executor MathJSLab e autorização de execução pelo host.

```mathjslab
u = [2, 1];
v = [1, 3];
u + v
sum(u .* v)
```

$$u\cdot v=u_1v_1+u_2v_2.$$

## Prática

Determine u+v e u·v antes de executar. Os dois resultados têm o mesmo tipo?

## Resposta comentada

u+v=[3,4] é um vetor. u·v=2×1+1×3=5 é um escalar.

[Índice da coleção](README.md)

[English](../en/somas-e-vetores.md) · [Español](../es/somas-e-vetores.md)
