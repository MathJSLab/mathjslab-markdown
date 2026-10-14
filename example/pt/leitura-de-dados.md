# Leitura de dados: tabela, unidade e procedência

**Objetivo:** organizar medidas e avaliar o que os dados permitem concluir.
**Extensões:** relative-urls, heading-ids, syntax-highlight e MathJax; tabelas
GFM.

## Roteiro de leitura

Navegue para [Dados da atividade](#dados-da-atividade) e depois para
[Interpretação](#interpretação). Os títulos fornecem os identificadores de
navegação. O [arquivo CSV](resources/temperaturas.csv) é um recurso local,
resolvido em relação ao endereço desta nota.

## Dados da atividade

As medidas abaixo são **simuladas**, em graus Celsius, para três horários de um
único dia. Não representam o clima de uma cidade.

| Horário | Temperatura (°C) |
| ------- | ---------------: |
| 08:00   |               20 |
| 12:00   |               26 |
| 16:00   |               24 |

```csv
horario,temperatura_c
08:00,20
12:00,26
16:00,24
```

O cabeçalho identifica a variável e sua unidade. O CSV guarda valores; a tabela
organiza a mesma informação para leitura humana.

## Interpretação

A maior medida foi 26 °C ao meio-dia. A diferença entre a maior e a menor é 6
°C. Três observações não determinam a máxima real do dia: ela pode ter ocorrido
entre os horários medidos. Tampouco permitem caracterizar o clima, que exige
séries de observações em períodos mais longos.

## Pratique

- [ ] Identifique a unidade antes de comparar os valores.
- [ ] Calcule a média aritmética das três observações.
- [ ] Explique uma conclusão que esses dados não sustentam.

## Respostas comentadas

A unidade é °C; a média das observações é $70/3\approx23{,}33$ °C. Não se pode
afirmar que 26 °C foi a máxima diária nem inferir uma tendência climática. Veja
também [a aula de estatística](estatistica.md).
