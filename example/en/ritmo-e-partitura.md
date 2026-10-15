# Rhythm and reading a MusicXML score

**Objective:** connect written duration, beat and measure organization.
**Extension:** Verovio, with MusicXML.

## A two-measure phrase

The phrase below is an original exercise in C major. The first measure contains
four quarter notes; the second contains two half notes. Both last four beats.
Count “1, 2, 3, 4” continuously, without speeding up on short notes.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>Four beats, two divisions</work-title></work>
  <part-list><score-part id="P1"><part-name>Melody</part-name></score-part></part-list>
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

## Duration and pitch are distinct information

`pitch` describes pitch. `duration` gives duration in units defined by
`divisions`; with one division per quarter note, 2 corresponds to a half note.
`type` describes the displayed note value. These values must agree.

## Practice

1. How many quarter notes equal a half note in this meter?
2. Does a higher note need to be shorter?
3. Mentally replace the two half notes with one whole note: is the measure
   still complete?

## Answers with explanations

1. Two.
2. No; pitch and duration are independent dimensions.
3. Yes, because the whole note occupies four beats in this organization.
