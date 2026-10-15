# Dinâmica musical: piano e forte

**Extensões:** `verovio`.

## Ideias principais

As marcas p e f indicam intensidades relativas, sem mudar as alturas nem as
durações. O MusicXML inclui essas direções junto às quatro semínimas do
compasso.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
<work><work-title>Contraste de intensidade</work-title></work>
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

## Prática

Quantos tempos dura o compasso? O f torna a nota mais longa?

## Resposta comentada

São quatro tempos. f altera a intensidade indicada, não o valor rítmico.

[Índice da coleção](README.md)

[English](../en/dinamica-musical.md) · [Español](../es/dinamica-musical.md)
