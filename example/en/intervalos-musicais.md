# Intervals: successive and simultaneous notes

**Objective:** distinguish melodic and harmonic intervals in two staves.
**Extensions:** Verovio/MEI.

## Key ideas

An interval compares two pitches. When notes occur one after another, the
interval is melodic; when they sound together, it is harmonic. Diatonic
numbering counts note names including both endpoints: C–E is a third.

```mei
<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
  <meiHead><fileDesc><titleStmt><title>Intervals in two voices</title></titleStmt><pubStmt/></fileDesc></meiHead>
  <music><body><mdiv><score>
    <scoreDef meter.count="4" meter.unit="4"><staffGrp>
      <staffDef n="1" lines="5" clef.shape="G" clef.line="2"/>
      <staffDef n="2" lines="5" clef.shape="F" clef.line="4"/>
    </staffGrp></scoreDef>
    <section><measure n="1">
      <staff n="1"><layer n="1"><note pname="c" oct="4" dur="2"/><note pname="e" oct="4" dur="2"/></layer></staff>
      <staff n="2"><layer n="1"><note pname="c" oct="3" dur="2"/><note pname="c" oct="3" dur="2"/></layer></staff>
    </measure></section>
  </score></mdiv></body></music>
</mei>
```

The original MEI example has two staves and one 4/4 measure. The upper voice
plays C and E as two half notes. The lower voice holds two Cs an octave below
the first upper C. Thus, the upper voice has a melodic major third and the
first moment has a harmonic octave.

Each staff completes four beats even though the voices occur simultaneously.
Adding durations across different staves does not give the piece’s duration.
Clefs and octaves identify actual pitch; vertical position on the page alone is
insufficient.

## Practice

1. What is the ascending melodic interval from C to G?
2. How many beats does the complete example last?

## Answers with explanations

1. A perfect fifth: C, D, E, F, G.
2. Four, because the staves occur simultaneously.

## Continue learning

[Collection index](README.md) · [Back to practice](#practice)

[Português brasileiro](../pt/intervalos-musicais.md) ·
[Español](../es/intervalos-musicais.md)
