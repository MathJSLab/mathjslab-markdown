# C major scale in MEI

**Extensions:** `verovio`.

## Key ideas

The ascending scale follows C, D, E, F, G, A, B and C. MEI divides the eight
sounds into two 4/4 measures; B–C crosses the octave boundary.

```mei
<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0"><meiHead><fileDesc><titleStmt><title>Ascending scale</title></titleStmt><pubStmt/></fileDesc></meiHead><music><body><mdiv><score><scoreDef meter.count="4" meter.unit="4"><staffGrp><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/></staffGrp></scoreDef><section><measure n="1"><staff n="1"><layer n="1"><note pname="c" oct="4" dur="4"/><note pname="d" oct="4" dur="4"/><note pname="e" oct="4" dur="4"/><note pname="f" oct="4" dur="4"/></layer></staff></measure><measure n="2"><staff n="1"><layer n="1"><note pname="g" oct="4" dur="4"/><note pname="a" oct="4" dur="4"/><note pname="b" oct="4" dur="4"/><note pname="c" oct="5" dur="4"/></layer></staff></measure></section></score></mdiv></body></music></mei>
```

## Practice

What is the interval between first and last notes? How many beats does the
scale last?

## Answer with explanation

A perfect octave. There are eight quarter-note beats in two measures.

[Collection index](README.md)

[Português brasileiro](../pt/escala-em-mei.md) ·
[Español](../es/escala-em-mei.md)
