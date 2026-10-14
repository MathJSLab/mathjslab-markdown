# Ritmo e leitura de partitura em MusicXML

**Objetivo:** relacionar duração escrita, pulso e organização do compasso.
**Extensão:** Verovio, com MusicXML.

## Uma frase de dois compassos

A frase abaixo é um exercício original em dó maior. O primeiro compasso contém
quatro semínimas; o segundo, duas mínimas. Os dois duram quatro tempos. Conte
“1, 2, 3, 4” continuamente, sem acelerar nas notas curtas.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>Quatro pulsos, duas divisões</work-title></work>
  <part-list><score-part id="P1"><part-name>Melodia</part-name></score-part></part-list>
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

## Duração e altura são informações distintas

`pitch` descreve a altura. `duration` indica duração em unidades definidas por
`divisions`; com uma divisão por semínima, 2 corresponde a uma mínima. `type`
descreve a figura musical exibida. Esses valores devem ser coerentes.

## Pratique

1. Quantas semínimas equivalem a uma mínima neste compasso?
2. Uma nota mais aguda precisa ser mais curta?
3. Substitua mentalmente as duas mínimas por uma semibreve: o compasso continua
   completo?

## Respostas comentadas

1. Duas.
2. Não; altura e duração são dimensões independentes.
3. Sim, pois a semibreve ocupa quatro tempos nessa organização.
