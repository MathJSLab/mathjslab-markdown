# Simple pendulum: period and approximations

**Objective:** use an approximate model and identify its conditions of
applicability. **Extensions:** MathJax, MathJSLab.

## Key ideas

The period is the time for one complete oscillation. For an ideal pendulum with
small amplitudes, a massless string and no friction, use:

$$
T\approx2\pi\sqrt{\frac{\ell}{g}}.
$$

Length $\ell$ is measured from the suspension point to the center of mass. Use
meters and $g$ in meters per second squared to obtain $T$ in seconds. Mass does
not appear in this approximation. The formula is not exact for large angles or
strongly damped systems.

```mathjslab
ell = [0.25; 1; 4];
g = 9.8;
T = 2*pi*sqrt(ell/g);
[ell, T]
```

The block uses $g=9.8$ and compares three lengths. Quadrupling length doubles
the period because it depends on the square root rather than directly on
$\ell$. Timing several oscillations and dividing by their number helps reduce
the effect of reaction time in a measurement.

## Practice

1. Estimate $T$ for a length of 1 m.
2. Does doubling mass change the period in this model?

## Answers with explanations

1. Approximately 2.01 s.
2. No; this holds within the model assumptions.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/pendulo-simples.md) ·
[Español](../es/pendulo-simples.md)
