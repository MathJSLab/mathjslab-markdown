# Dinámica musical: piano y forte

**Extensiones:** `verovio`.

## Ideas principales

Las marcas p y f indican intensidades relativas sin cambiar las alturas ni las
duraciones. MusicXML incluye estas indicaciones junto a las cuatro negras del
compás.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
<work><work-title>Contraste de intensidad</work-title></work>
<part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
<part id="P1"><measure number="1">
<attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>
<direction placement="below"><direction-type><dynamics><p/></dynamics></direction-type><sound dynamics="40"/></direction>
<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
<note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
<direction placement="below"><direction-type><dynamics><f/></dynamics></direction-type><sound dynamics="90"/></direction>
<note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
<note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
</measure></part></score-partwise>
```

## Práctica

¿Cuántos tiempos dura el compás? ¿La marca f alarga la nota?

## Respuesta comentada

Son cuatro tiempos. f cambia la intensidad indicada, no el valor rítmico.

[Índice de la colección](README.md)

[Português brasileiro](../pt/dinamica-musical.md) ·
[English](../en/dinamica-musical.md)
