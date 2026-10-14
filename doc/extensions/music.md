# Music in Markdown

The `abc` fence is suitable for concise notation. Playback is presented only
when the host authorizes audio and starts through a user action.

```abc
X:1
T:C major scale
M:4/4
L:1/4
K:C
C D E F | G A B c |
```

Use MEI or MusicXML for fuller score representations. Verovio renders their
notation through the corresponding fences.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1"><measure number="1"><attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure></part>
</score-partwise>
```

Score rendering and browser audio availability are distinct. On disposal,
playback resources/listeners and per-score toolkits must be released.
