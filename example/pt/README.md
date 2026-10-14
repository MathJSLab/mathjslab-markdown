# Notas de aula em Markdown

Esta coleção reúne **22 textos didáticos em português brasileiro** para
explorar todas as 14 extensões do catálogo de `mathjslab-markdown`. Cada nota
apresenta objetivos, explicação, exemplos e atividades com respostas. Os dados
didáticos e as geometrias estão incorporados nos textos, exceto o CSV local
fornecido em [resources/temperaturas.csv](resources/temperaturas.csv).

## Índice

| Nota                                                    | Área             | Extensões principais                         |
| ------------------------------------------------------- | ---------------- | -------------------------------------------- |
| [Progressões aritméticas e geométricas](progressoes.md) | Matemática       | MathJax                                      |
| [Funções trigonométricas](trigonometria.md)             | Matemática       | MathJSLab, MathJax                           |
| [Ciclo da água](ciclo-da-agua.md)                       | Ciências         | Mermaid                                      |
| [Investigação da germinação](metodo-cientifico.md)      | Ciências         | Mermaid                                      |
| [Funções orgânicas](funcoes-organicas.md)               | Química          | SMILES, MathJax                              |
| [Nomenclatura orgânica](nomenclatura-organica.md)       | Química          | SMILES, Mermaid                              |
| [Isomeria](isomeria.md)                                 | Química          | SMILES, MathJax                              |
| [Esterificação](esterificacao.md)                       | Química          | SMILES, MathJax/mhchem                       |
| [Geometria molecular da água](geometria-molecular.md)   | Química          | molecule-3d, SMILES, MathJax                 |
| [Cadeias carbônicas](cadeias-carbonicas.md)             | Química          | SMILES                                       |
| [Ode à alegria](ode-a-alegria.md)                       | Música           | ABC                                          |
| [Ritmo e partitura](ritmo-e-partitura.md)               | Música           | Verovio/MusicXML                             |
| [Coordenadas no Brasil](geografia-coordenadas.md)       | Geografia        | maps/GeoJSON                                 |
| [Capitais do Brasil](historia-capitais.md)              | História         | maps/TopoJSON                                |
| [Distribuição de notas](estatistica.md)                 | Estatística      | Vega-Lite, MathJax                           |
| [Movimento uniforme](movimento-uniforme.md)             | Física           | Vega-Lite, MathJax                           |
| [Redes alimentares](redes-alimentares.md)               | Biologia         | Graphviz                                     |
| [Tetraedro](geometria-solidos.md)                       | Geometria        | model-3d/OBJ, MathJax                        |
| [Soma com um algoritmo](algoritmos.md)                  | Computação       | syntax-highlight, MathJax                    |
| [Leitura de dados](leitura-de-dados.md)                 | Ciências e dados | relative-urls, heading-ids, syntax-highlight |
| [Comunicação digital](comunicacao-digital.md)           | Computação       | Mermaid                                      |
| [Sistemas lineares](sistemas-lineares.md)               | Matemática       | MathJSLab, MathJax                           |

## Como visualizar

Abra as notas em um integrador do pacote com as extensões indicadas
habilitadas. Um visualizador Markdown comum pode apresentar os blocos como
código de origem. Use o perfil GFM para tabelas e listas de tarefas. Os
detalhes de configuração estão no
[catálogo de extensões](../../doc/extensions/README.md) e no
[guia de autoria](../../doc/authoring.md).

MathJSLab precisa de um executor fornecido pelo integrador; os blocos
executáveis dependem da política de execução. Expressões em `%` apresentam
notação matemática. Moléculas e modelos 3D precisam de WebGL autorizado. Áudio,
quando disponível, depende de autorização e de uma ação do usuário. Mapas podem
funcionar somente com os vetores, sem solicitar mapas de fundo externos.

Para resolver os links entre notas e o CSV, configure `sourceUrl` com o
endereço real de cada documento. A nota de leitura de dados demonstra links
relativos e navegação por identificadores de títulos; essas extensões também
são úteis em toda a coleção.

## Cobertura do catálogo

| Identificador      | Exemplo de uso                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abc`              | [Ode à alegria](ode-a-alegria.md)                                                                                                                                                        |
| `graphviz`         | [Redes alimentares](redes-alimentares.md)                                                                                                                                                |
| `heading-ids`      | [Leitura de dados](leitura-de-dados.md)                                                                                                                                                  |
| `maps`             | [Coordenadas no Brasil](geografia-coordenadas.md) e [Capitais do Brasil](historia-capitais.md)                                                                                           |
| `mathjax`          | [Progressões](progressoes.md) e [Esterificação](esterificacao.md)                                                                                                                        |
| `mathjslab`        | [Trigonometria](trigonometria.md) e [Sistemas lineares](sistemas-lineares.md)                                                                                                            |
| `mermaid`          | [Ciclo da água](ciclo-da-agua.md), [Investigação da germinação](metodo-cientifico.md), [Nomenclatura orgânica](nomenclatura-organica.md) e [Comunicação digital](comunicacao-digital.md) |
| `model-3d`         | [Tetraedro](geometria-solidos.md)                                                                                                                                                        |
| `molecule-3d`      | [Geometria molecular da água](geometria-molecular.md)                                                                                                                                    |
| `relative-urls`    | [Leitura de dados](leitura-de-dados.md)                                                                                                                                                  |
| `smiles`           | As seis notas de química, de [Funções orgânicas](funcoes-organicas.md) a [Cadeias carbônicas](cadeias-carbonicas.md)                                                                     |
| `syntax-highlight` | [Soma com um algoritmo](algoritmos.md)                                                                                                                                                   |
| `vega-lite`        | [Distribuição de notas](estatistica.md) e [Movimento uniforme](movimento-uniforme.md)                                                                                                    |
| `verovio`          | [Ritmo e partitura](ritmo-e-partitura.md)                                                                                                                                                |

Todos os 14 identificadores do catálogo estão contemplados. Formatos
alternativos de uma mesma extensão (por exemplo, MEI e MusicXML) não exigem uma
nota separada nesta coleção.
