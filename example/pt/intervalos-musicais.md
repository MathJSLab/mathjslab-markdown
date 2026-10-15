# Intervalos: notas sucessivas e simultâneas

**Objetivo:** distinguir intervalos melódicos e harmônicos em duas pautas.
**Extensões:** Verovio/MEI.

## Ideias centrais

Um intervalo compara duas alturas. Quando as notas ocorrem uma após a outra, o
intervalo é melódico; quando soam juntas, é harmônico. A numeração diatônica
conta nomes de notas incluindo o início e o fim: dó–mi é uma terça.

```mei
<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
  <meiHead><fileDesc><titleStmt><title>Intervalos em duas vozes</title></titleStmt><pubStmt/></fileDesc></meiHead>
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

O exemplo original em MEI tem duas pautas e um compasso 4/4. A voz superior
toca dó e mi, duas mínimas. A inferior sustenta dois dós uma oitava abaixo do
primeiro dó superior. Assim, há uma terça maior melódica na voz superior e uma
oitava harmônica no primeiro momento.

Cada pauta completa quatro tempos, embora as notas das duas vozes sejam
simultâneas. Somar durações de pautas diferentes não fornece a duração da peça.
Claves e oitavas são necessárias para identificar a altura real; a posição
vertical isolada no papel não basta.

## Pratique

1. Qual é o intervalo melódico entre dó e sol ascendentes?
2. Quantos tempos dura o exemplo completo?

## Respostas comentadas

1. Uma quinta justa: dó, ré, mi, fá, sol.
2. Quatro, pois as pautas ocorrem simultaneamente.

## Continue estudando

[Índice da coleção](README.md) · [Voltar aos exercícios](#pratique)

[English](../en/intervalos-musicais.md) ·
[Español](../es/intervalos-musicais.md)
