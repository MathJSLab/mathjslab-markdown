# Markdown lesson notes

This collection contains **85 notes in English**. Every note has corresponding
[Brazilian Portuguese](../pt/README.md) and [Spanish](../es/README.md) versions
with the same filename. Each of the 20 extensions has at least four distinct
notes per language.

Notes include explanations, examples, activities and answers. Data are local or
embedded, including [temperatures](resources/temperaturas.csv) and
[observations](resources/observacoes.csv). Command identifiers and technical
formats are preserved across translations.

## Configuration

Use the GFM profile for headings, relative links and highlighted code. Select
the extensions listed in each note; optional libraries load on demand. Geometry
requires `interactive`; TikZ requires `wasm` and `network` for local runtime
assets. Maps and 3D renderers also depend on host-configured capabilities.
MathJSLab requires an executor and execution authorization. Set
`locale: "en-US"` for generated labels. Consult the
[integration guides](../../doc/extensions/README.md).

## Extension coverage

| Extension          | Notes |
| ------------------ | ----: |
| `abc`              |     5 |
| `citations`        |     4 |
| `cross-references` |    18 |
| `didactic`         |    17 |
| `geometry`         |     4 |
| `graphviz`         |     4 |
| `heading-ids`      |    85 |
| `maps`             |     6 |
| `mathjax`          |    50 |
| `mathjslab`        |     7 |
| `mermaid`          |    18 |
| `model-3d`         |     4 |
| `molecule-3d`      |     4 |
| `relative-urls`    |    61 |
| `smiles`           |    12 |
| `syntax-highlight` |     6 |
| `tikz`             |     6 |
| `vega-lite`        |    10 |
| `verovio`          |     5 |
| `wavedrom`         |     5 |

## Index

| Note                                                                                             | Extensions used                                                                                            |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| [Acids and bases: proton transfer](acidos-bases.md)                                              | `heading-ids`, `mathjax`, `relative-urls`, `smiles`                                                        |
| [Alcohol and ether: same formula, different bonds](alcool-e-eter.md)                             | `heading-ids`, `mathjax`, `relative-urls`, `smiles`                                                        |
| [Algorithms: summing a sequence in JavaScript](algoritmos.md)                                    | `heading-ids`, `mathjax`, `syntax-highlight`                                                               |
| [Ammonia: pyramidal geometry](amonia-piramidal.md)                                               | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`                                         |
| [Probability tree with TikZ](arvore-de-probabilidade.md)                                         | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`                                     |
| [Atoms and ions: charge and identity](atomos-e-ions.md)                                          | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Drainage basins: area and drainage network](bacia-hidrografica.md)                              | `heading-ids`, `maps`, `mermaid`, `relative-urls`                                                          |
| [Balancing equations: conserving atoms](balanceamento-quimico.md)                                | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Theorems, exercises and references](blocos-didaticos.md)                                        | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                  |
| [Binary search: shrinking the interval](busca-binaria.md)                                        | `heading-ids`, `relative-urls`, `syntax-highlight`                                                         |
| [Carbon chains and aromaticity](cadeias-carbonicas.md)                                           | `heading-ids`, `smiles`                                                                                    |
| [Bibliographic catalogue without citations](catalogo-bibliografico.md)                           | `citations`, `heading-ids`, `relative-urls`                                                                |
| [The water cycle and conservation of matter](ciclo-da-agua.md)                                   | `heading-ids`, `mermaid`                                                                                   |
| [Technical drawings and electrical circuits](circuitos-eletricos.md)                             | `cross-references`, `heading-ids`, `relative-urls`, `tikz`                                                 |
| [Circumcenter of a triangle](circuncentro-do-triangulo.md)                                       | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls`                                 |
| [Citations and bibliography](citacoes-e-bibliografia.md)                                         | `citations`, `heading-ids`, `relative-urls`                                                                |
| [Numeric citations and source order](citacoes-numericas.md)                                      | `citations`, `heading-ids`, `relative-urls`                                                                |
| [Comparing measurements: two groups](comparacao-de-medicoes.md)                                  | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Compound meter in 6/8](compasso-composto.md)                                                    | `abc`, `heading-ids`, `mathjax`, `relative-urls`                                                           |
| [Digital communication: request and response](comunicacao-digital.md)                            | `heading-ids`, `mermaid`                                                                                   |
| [SPI: clock and selection](comunicacao-spi.md)                                                   | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Compound growth: a multiplicative model](crescimento-composto.md)                               | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Cube: surface area, volume and triangle mesh](cubo-em-stl.md)                                   | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                                                      |
| [Definitions and examples: vector norm](definicoes-e-exemplos.md)                                | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                  |
| [Induction: sum of the first integers](demonstracao-por-inducao.md)                              | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                  |
| [Project dependencies](dependencias-de-projeto.md)                                               | `graphviz`, `heading-ids`, `relative-urls`                                                                 |
| [Digital timing diagrams](diagramas-temporais.md)                                                | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Digital communication buses: from bits to distributed systems](digital-communication-buses.md)  | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `mermaid`, `tikz`, `vega-lite`, `wavedrom`       |
| [Musical dynamics: piano and forte](dinamica-musical.md)                                         | `heading-ids`, `relative-urls`, `verovio`                                                                  |
| [Carbon dioxide: bonds and symmetry](dioxido-de-carbono.md)                                      | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`                                         |
| [Electrical Circuits](electrical-circuits.md)                                                    | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `mermaid`, `tikz`, `vega-lite`                   |
| [Ellipse: sum of distances to the foci](elipse-e-focos.md)                                       | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls`                                 |
| [Mechanical energy and transformations](energia-mecanica.md)                                     | `graphviz`, `heading-ids`, `mathjax`, `relative-urls`                                                      |
| [C major scale in MEI](escala-em-mei.md)                                                         | `heading-ids`, `relative-urls`, `verovio`                                                                  |
| [Statistics: grade distribution and mean](estatistica.md)                                        | `heading-ids`, `mathjax`, `vega-lite`                                                                      |
| [Esterification: reactants, products and equilibrium](esterificacao.md)                          | `heading-ids`, `mathjax`, `smiles`                                                                         |
| [Exercises with hints: successive percentages](exercicios-com-dicas.md)                          | `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                                      |
| [RC filter: capacitor voltage](filtro-rc.md)                                                     | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`                                     |
| [Photosynthesis: matter and energy](fotossintese.md)                                             | `graphviz`, `heading-ids`, `mathjax`, `relative-urls`                                                      |
| [Equivalent fractions and addition](fracoes-equivalentes.md)                                     | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Quadratic functions: roots and vertex](funcao-quadratica.md)                                    | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Organic compound classes: recognizing functional groups](funcoes-organicas.md)                  | `heading-ids`, `mathjax`, `smiles`                                                                         |
| [Ideal gases: pressure and volume](gases-ideais.md)                                              | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Genetics: a monohybrid cross](genetica-mendeliana.md)                                           | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Geography: location and coordinates in Brazil](geografia-coordenadas.md)                        | `heading-ids`, `maps`                                                                                      |
| [Dynamic geometry: midpoints and circles](geometria-dinamica.md)                                 | `cross-references`, `geometry`, `heading-ids`, `relative-urls`                                             |
| [Molecular geometry of water](geometria-molecular.md)                                            | `heading-ids`, `mathjax`, `molecule-3d`, `smiles`                                                          |
| [Solid geometry: a tetrahedron in OBJ](geometria-solidos.md)                                     | `heading-ids`, `mathjax`, `model-3d`                                                                       |
| [History: capitals and Brazil's territorial organization](historia-capitais.md)                  | `heading-ids`, `maps`                                                                                      |
| [Intervals: successive and simultaneous notes](intervalos-musicais.md)                           | `heading-ids`, `relative-urls`, `verovio`                                                                  |
| [Isomerism: same formula, different structures](isomeria.md)                                     | `heading-ids`, `mathjax`, `smiles`                                                                         |
| [Forces and Newton’s second law](leis-de-newton.md)                                              | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Reading data: tables, units and provenance](leitura-de-dados.md)                                | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`                                              |
| [Local routes: coordinates and connections](mapa-de-rotas.md)                                    | `heading-ids`, `maps`, `mermaid`, `relative-urls`                                                          |
| [Matrices and transformations in the plane](matrizes-transformacoes.md)                          | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Mean, median and extreme values](media-e-valores-extremos.md)                                   | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`, `vega-lite`                                 |
| [Ancient Mediterranean: cities and connections](mediterraneo-antigo.md)                          | `heading-ids`, `maps`, `mermaid`, `relative-urls`                                                          |
| [Canon: delayed voice entry](melodia-em-canon.md)                                                | `abc`, `heading-ids`, `relative-urls`                                                                      |
| [Methane: tetrahedral geometry](metano-tetraedrico.md)                                           | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`                                         |
| [Investigating seed germination](metodo-cientifico.md)                                           | `heading-ids`, `mermaid`                                                                                   |
| [Mitosis and the cell cycle](mitose.md)                                                          | `heading-ids`, `mermaid`, `relative-urls`                                                                  |
| [Physics: uniform motion and graph slope](movimento-uniforme.md)                                 | `heading-ids`, `mathjax`, `vega-lite`                                                                      |
| [The Mathematics and Physics of Music: From Pythagoras to Equal Temperament](music-pitagoras.md) | `abc`, `cross-references`, `didactic`, `heading-ids`, `maps`, `mathjax`, `mermaid`, `vega-lite`, `verovio` |
| [Organic nomenclature: from chain to name](nomenclatura-organica.md)                             | `heading-ids`, `mermaid`, `smiles`                                                                         |
| [Binary numbers and place value](numeros-binarios.md)                                            | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`                                              |
| [Octahedron: vertices and faces](octaedro-em-obj.md)                                             | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                                                      |
| [Ode to Joy: melody, beat and phrases](ode-a-alegria.md)                                         | `abc`, `heading-ids`, `mathjax`                                                                            |
| [Insertion sort: building a sorted section](ordenacao-insercao.md)                               | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`, `syntax-highlight`                                   |
| [Pages and citation disambiguation](paginas-e-desambiguacao.md)                                  | `citations`, `heading-ids`, `relative-urls`                                                                |
| [Parallel and perpendicular lines](paralelas-e-perpendiculares.md)                               | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls`                                 |
| [Musical rests: silence has duration](pausas-musicais.md)                                        | `abc`, `heading-ids`, `mathjax`, `relative-urls`                                                           |
| [Simple pendulum: period and approximations](pendulo-simples.md)                                 | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Square-based pyramid: height and volume](piramide-quadrada.md)                                  | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                                                      |
| [Polymers: from unit to chain](polimeros.md)                                                     | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`, `smiles`                                             |
| [Probability: sums of two dice](probabilidade-dados.md)                                          | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Arithmetic and geometric sequences](progressoes.md)                                             | `heading-ids`, `mathjax`                                                                                   |
| [UART: start, data and stop](quadro-uart.md)                                                     | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Biology: a simplified food web](redes-alimentares.md)                                           | `graphviz`, `heading-ids`                                                                                  |
| [Parallel resistors with CircuiTikZ](resistores-em-paralelo.md)                                  | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`                                     |
| [Series resistors: current and voltage](resistores-em-serie.md)                                  | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Rhythm and reading a MusicXML score](ritmo-e-partitura.md)                                      | `heading-ids`, `verovio`                                                                                   |
| [Setup and hold: stability window](setup-e-hold.md)                                              | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Linear systems: solving and checking](sistemas-lineares.md)                                     | `heading-ids`, `mathjax`, `mathjslab`                                                                      |
| [Sums and vectors: components and dot product](somas-e-vetores.md)                               | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Trigonometric functions and their relationships](trigonometria.md)                              | `heading-ids`, `mathjax`, `mathjslab`                                                                      |
