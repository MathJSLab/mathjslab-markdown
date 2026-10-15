# Intervalos: notas sucesivas y simultáneas

**Objetivo:** distinguir intervalos melódicos y armónicos en dos pentagramas.
**Extensiones:** Verovio/MEI.

## Ideas clave

Un intervalo compara dos alturas. Cuando las notas aparecen una después de
otra, es melódico; cuando suenan juntas, es armónico. La numeración diatónica
cuenta los nombres incluyendo ambos extremos: do–mi es una tercera.

```mei
<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
  <meiHead><fileDesc><titleStmt><title>Intervalos en dos voces</title></titleStmt><pubStmt/></fileDesc></meiHead>
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

El ejemplo original en MEI tiene dos pentagramas y un compás 4/4. La voz
superior toca do y mi, dos blancas. La inferior toca dos notas do una octava
por debajo del primer do superior. Así, la voz superior tiene una tercera mayor
melódica y el primer momento, una octava armónica.

Cada pentagrama completa cuatro tiempos, aunque las voces sean simultáneas.
Sumar duraciones de distintos pentagramas no da la duración de la pieza. Las
claves y octavas permiten identificar la altura real; la posición vertical
aislada en el papel no basta.

## Practica

1. ¿Cuál es el intervalo melódico ascendente de do a sol?
2. ¿Cuántos tiempos dura el ejemplo completo?

## Respuestas comentadas

1. Una quinta justa: do, re, mi, fa, sol.
2. Cuatro, porque los pentagramas son simultáneos.

## Sigue aprendiendo

[Índice de la colección](README.md) · [Volver a los ejercicios](#practica)

[Português brasileiro](../pt/intervalos-musicais.md) ·
[English](../en/intervalos-musicais.md)
