# Ritmo y lectura de una partitura en MusicXML

**Objetivo:** relacionar la duración escrita, el pulso y la organización del
compás. **Extensión:** Verovio, con MusicXML.

## Una frase de dos compases

La frase siguiente es un ejercicio original en do mayor. El primer compás
contiene cuatro negras; el segundo, dos blancas. Ambos duran cuatro tiempos.
Cuenta «1, 2, 3, 4» de forma continua, sin acelerar en las notas cortas.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>Cuatro pulsos, dos divisiones</work-title></work>
  <part-list><score-part id="P1"><part-name>Melodía</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>
```

## La duración y la altura son informaciones distintas

`pitch` describe la altura. `duration` indica la duración en unidades definidas
por `divisions`; con una división por negra, 2 corresponde a una blanca. `type`
describe la figura musical mostrada. Estos valores deben ser coherentes.

## Practica

1. ¿Cuántas negras equivalen a una blanca en este compás?
2. ¿Una nota más aguda tiene que ser más corta?
3. Sustituye mentalmente las dos blancas por una redonda: ¿el compás sigue
   completo?

## Respuestas comentadas

1. Dos.
2. No; la altura y la duración son dimensiones independientes.
3. Sí, porque la redonda ocupa cuatro tiempos en esta organización.
