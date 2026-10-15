# Trigonometric functions and their relationships

**Objective:** connect the unit circle, periodicity and identities.
**Extensions:** MathJSLab and MathJax.

## From the triangle to the circle

In a right triangle, sine is the ratio of the opposite side to the hypotenuse;
cosine uses the adjacent side. On a circle of radius 1, the point associated
with angle $\theta$ has coordinates $(\cos\theta,\sin\theta)$. This extends the
functions beyond acute angles.

The expression %`sin(theta)^2 + cos(theta)^2`% corresponds to the squared
radius:

$$
\sin^2\theta+\cos^2\theta=1.
$$

MathJSLab uses radians in `sin`, `cos` and `tan`. A full turn equals $2\pi$
radians or $360^\circ$; therefore, $30^\circ=\pi/6$.

## Numerical experiment

Run the block and compare its three columns: angle, sine and cosine. The
expression in the text is mathematical notation; execution takes place in the
command block when enabled by the application.

```mathjslab
theta = [0; pi/6; pi/4; pi/3; pi/2];
s = sin(theta);
c = cos(theta);
[theta, s, c]
s.^2 + c.^2
```

The last result should be close to 1 in every position. Small differences may
arise from numerical representation.

## Tangent and symmetries

$$
\tan\theta=\frac{\sin\theta}{\cos\theta},\qquad \cos\theta\ne0.
$$

Tangent is undefined at $\pi/2+k\pi$, where $k$ is an integer. A calculator may
return a very large value at these points because an approximation to $\pi$
does not necessarily yield an exactly zero cosine. Sine is odd, cosine is even,
and both have period $2\pi$.

```mathjslab
x = linspace(0, 2*pi, 17);
[x', sin(x)', cos(x)']
sin(-pi/6)
cos(-pi/6)
tan(pi/4)
```

## Practice

1. Calculate sine, cosine and tangent of $\pi/4$.
2. Explain why the absolute values of sine and cosine never exceed 1.
3. Use the block to compare $\sin(\theta)$ and $\sin(\theta+2\pi)$.

## Answers with explanations

1. Sine and cosine equal $\sqrt2/2$; tangent equals 1.
2. They are coordinates of a point on the unit circle.
3. The values agree, apart from rounding: a full turn returns to the same
   point.
