# Declarative geometry fixture

```geometry
{
  elements: [
    {id: 'A', type: 'point', parents: [0, 0]},
    {id: 'B', type: 'point', parents: [4, 2]},
    {id: 'M', type: 'midpoint', parents: ['A', 'B']},
    {id: 'AB', type: 'segment', parents: ['A', 'B']},
  ],
}
```
