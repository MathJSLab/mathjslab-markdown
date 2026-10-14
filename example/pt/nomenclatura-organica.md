# Nomenclatura orgânica: da cadeia ao nome

**Objetivo:** nomear exemplos simples de alcanos, alcenos e álcoois.
**Extensões:** SMILES e Mermaid.

## Um roteiro para os exemplos desta aula

Escolha uma cadeia principal adequada, numere-a para localizar os grupos
relevantes e combine o tamanho da cadeia, a insaturação e a função. As regras
de prioridade ficam mais complexas quando há várias funções; esta aula trabalha
com uma função principal por molécula.

```mermaid
flowchart LR
  E[Estrutura] --> C[Escolher cadeia principal]
  C --> N[Numerar a cadeia]
  N --> L[Localizar ramificações e função]
  L --> F[Montar o nome]
```

## Três exemplos resolvidos

`CCCC` representa uma cadeia sem ramificação com quatro carbonos e ligações
simples: **butano**. O prefixo `but-` indica quatro carbonos.

```smiles
CCCC
```

Em `CC=CC`, a ligação dupla está entre os carbonos 2 e 3: **but-2-eno**. Essa
escrita não especifica a configuração espacial da dupla.

```smiles
CC=CC
```

Em `CC(O)C`, a cadeia principal tem três carbonos e o OH está no carbono 2:
**propan-2-ol**. Os parênteses registram uma ramificação na escrita SMILES.

```smiles
CC(O)C
```

## Ramificações

```smiles
CC(C)CC
```

A cadeia principal tem quatro carbonos e há um grupo metil no carbono 2:
**2-metilbutano**. Numerar pelo outro extremo daria 3; escolhemos 2.

## Pratique

1. Nomeie `CCC`.
2. Nomeie `CCCO`, considerando o OH terminal.
3. Por que contar todos os carbonos não basta para escolher o prefixo da cadeia
   principal?

## Respostas comentadas

1. Propano.
2. Propan-1-ol.
3. Carbonos de ramificações não pertencem necessariamente à cadeia principal.
