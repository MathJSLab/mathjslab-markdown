# Notas de aula em Markdown

Esta coleção reúne **82 notas em português brasileiro**. Todas têm versões
correspondentes em [inglês](../en/README.md) e [espanhol](../es/README.md), com
os mesmos nomes de arquivo. Cada uma das 20 extensões tem pelo menos quatro
notas distintas por idioma.

As notas incluem explicações, exemplos, atividades e respostas. Os dados são
locais ou incorporados, incluindo [temperaturas](resources/temperaturas.csv) e
[observações](resources/observacoes.csv). Identificadores de comandos e
formatos técnicos são mantidos entre traduções.

## Configuração

Use o perfil GFM para títulos, links relativos e código destacado. Selecione as
extensões citadas em cada nota; as bibliotecas opcionais são carregadas sob
demanda. Geometria exige `interactive`; TikZ exige `wasm` e `network` para os
arquivos locais do runtime. Mapas e renderizadores 3D também dependem das
capacidades configuradas pelo host. MathJSLab exige um executor e autorização
de execução. Configure `locale: "pt-BR"` para os rótulos gerados. Consulte os
[guias de integração](../../doc/extensions/README.md).

## Cobertura por extensão

| Extensão           | Notas |
| ------------------ | ----: |
| `abc`              |     4 |
| `citations`        |     4 |
| `cross-references` |    15 |
| `didactic`         |    14 |
| `geometry`         |     4 |
| `graphviz`         |     4 |
| `heading-ids`      |    82 |
| `maps`             |     5 |
| `mathjax`          |    47 |
| `mathjslab`        |     7 |
| `mermaid`          |    15 |
| `model-3d`         |     4 |
| `molecule-3d`      |     4 |
| `relative-urls`    |    61 |
| `smiles`           |    12 |
| `syntax-highlight` |     6 |
| `tikz`             |     4 |
| `vega-lite`        |     7 |
| `verovio`          |     4 |
| `wavedrom`         |     4 |

## Índice

| Nota                                                                           | Extensões usadas                                                           |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [Ácidos e bases: transferência de prótons](acidos-bases.md)                    | `heading-ids`, `mathjax`, `relative-urls`, `smiles`                        |
| [Álcool e éter: mesma fórmula, ligações diferentes](alcool-e-eter.md)          | `heading-ids`, `mathjax`, `relative-urls`, `smiles`                        |
| [Algoritmos: somar uma sequência em JavaScript](algoritmos.md)                 | `heading-ids`, `mathjax`, `syntax-highlight`                               |
| [Amônia: geometria piramidal](amonia-piramidal.md)                             | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`         |
| [Árvore de probabilidade com TikZ](arvore-de-probabilidade.md)                 | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`     |
| [Átomos e íons: carga e identidade](atomos-e-ions.md)                          | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                       |
| [Bacias hidrográficas: área e rede de drenagem](bacia-hidrografica.md)         | `heading-ids`, `maps`, `mermaid`, `relative-urls`                          |
| [Balanceamento: conservar átomos](balanceamento-quimico.md)                    | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                     |
| [Teoremas, exercícios e referências](blocos-didaticos.md)                      | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`  |
| [Busca binária: reduzir o intervalo](busca-binaria.md)                         | `heading-ids`, `relative-urls`, `syntax-highlight`                         |
| [Cadeias carbônicas e aromaticidade](cadeias-carbonicas.md)                    | `heading-ids`, `smiles`                                                    |
| [Catálogo bibliográfico sem citações](catalogo-bibliografico.md)               | `citations`, `heading-ids`, `relative-urls`                                |
| [O ciclo da água e a conservação da matéria](ciclo-da-agua.md)                 | `heading-ids`, `mermaid`                                                   |
| [Desenhos técnicos e circuitos elétricos](circuitos-eletricos.md)              | `cross-references`, `heading-ids`, `relative-urls`, `tikz`                 |
| [Circuncentro de um triângulo](circuncentro-do-triangulo.md)                   | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls` |
| [Citações e bibliografia](citacoes-e-bibliografia.md)                          | `citations`, `heading-ids`, `relative-urls`                                |
| [Citações numéricas e ordem das fontes](citacoes-numericas.md)                 | `citations`, `heading-ids`, `relative-urls`                                |
| [Comparação de medições: dois grupos](comparacao-de-medicoes.md)               | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                     |
| [Compasso composto em 6/8](compasso-composto.md)                               | `abc`, `heading-ids`, `mathjax`, `relative-urls`                           |
| [Comunicação digital: pedido e resposta](comunicacao-digital.md)               | `heading-ids`, `mermaid`                                                   |
| [SPI: clock e seleção](comunicacao-spi.md)                                     | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom` |
| [Crescimento composto: um modelo multiplicativo](crescimento-composto.md)      | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                     |
| [Cubo: superfície, volume e malha triangular](cubo-em-stl.md)                  | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                      |
| [Definições e exemplos: norma de um vetor](definicoes-e-exemplos.md)           | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`  |
| [Indução: soma dos primeiros inteiros](demonstracao-por-inducao.md)            | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`  |
| [Dependências de um projeto](dependencias-de-projeto.md)                       | `graphviz`, `heading-ids`, `relative-urls`                                 |
| [Diagramas temporais digitais](diagramas-temporais.md)                         | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom` |
| [Dinâmica musical: piano e forte](dinamica-musical.md)                         | `heading-ids`, `relative-urls`, `verovio`                                  |
| [Dióxido de carbono: ligações e simetria](dioxido-de-carbono.md)               | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`         |
| [Elipse: soma das distâncias aos focos](elipse-e-focos.md)                     | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls` |
| [Energia mecânica e transformações](energia-mecanica.md)                       | `graphviz`, `heading-ids`, `mathjax`, `relative-urls`                      |
| [Escala de dó maior em MEI](escala-em-mei.md)                                  | `heading-ids`, `relative-urls`, `verovio`                                  |
| [Estatística: distribuição de notas e média](estatistica.md)                   | `heading-ids`, `mathjax`, `vega-lite`                                      |
| [Esterificação: reagentes, produtos e equilíbrio](esterificacao.md)            | `heading-ids`, `mathjax`, `smiles`                                         |
| [Exercícios com dicas: porcentagens sucessivas](exercicios-com-dicas.md)       | `didactic`, `heading-ids`, `mathjax`, `relative-urls`                      |
| [Filtro RC: tensão no capacitor](filtro-rc.md)                                 | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`     |
| [Fotossíntese: matéria e energia](fotossintese.md)                             | `graphviz`, `heading-ids`, `mathjax`, `relative-urls`                      |
| [Frações equivalentes e adição](fracoes-equivalentes.md)                       | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                       |
| [Função quadrática: raízes e vértice](funcao-quadratica.md)                    | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                     |
| [Funções orgânicas: reconhecer grupos funcionais](funcoes-organicas.md)        | `heading-ids`, `mathjax`, `smiles`                                         |
| [Gases ideais: pressão e volume](gases-ideais.md)                              | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                     |
| [Genética: um cruzamento monohíbrido](genetica-mendeliana.md)                  | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                       |
| [Geografia: localização e coordenadas no Brasil](geografia-coordenadas.md)     | `heading-ids`, `maps`                                                      |
| [Geometria dinâmica: pontos médios e circunferências](geometria-dinamica.md)   | `cross-references`, `geometry`, `heading-ids`, `relative-urls`             |
| [Geometria molecular da água](geometria-molecular.md)                          | `heading-ids`, `mathjax`, `molecule-3d`, `smiles`                          |
| [Geometria espacial: um tetraedro em OBJ](geometria-solidos.md)                | `heading-ids`, `mathjax`, `model-3d`                                       |
| [História: capitais e organização territorial do Brasil](historia-capitais.md) | `heading-ids`, `maps`                                                      |
| [Intervalos: notas sucessivas e simultâneas](intervalos-musicais.md)           | `heading-ids`, `relative-urls`, `verovio`                                  |
| [Isomeria: mesma fórmula, estruturas diferentes](isomeria.md)                  | `heading-ids`, `mathjax`, `smiles`                                         |
| [Forças e a segunda lei de Newton](leis-de-newton.md)                          | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                       |
| [Leitura de dados: tabela, unidade e procedência](leitura-de-dados.md)         | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`              |
| [Rotas locais: coordenadas e conexões](mapa-de-rotas.md)                       | `heading-ids`, `maps`, `mermaid`, `relative-urls`                          |
| [Matrizes e transformações no plano](matrizes-transformacoes.md)               | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                     |
| [Média, mediana e valores extremos](media-e-valores-extremos.md)               | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`, `vega-lite` |
| [Mediterrâneo antigo: cidades e conexões](mediterraneo-antigo.md)              | `heading-ids`, `maps`, `mermaid`, `relative-urls`                          |
| [Cânone: entrada atrasada de uma voz](melodia-em-canon.md)                     | `abc`, `heading-ids`, `relative-urls`                                      |
| [Metano: a geometria tetraédrica](metano-tetraedrico.md)                       | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`         |
| [Investigar a germinação de sementes](metodo-cientifico.md)                    | `heading-ids`, `mermaid`                                                   |
| [Mitose e organização do ciclo celular](mitose.md)                             | `heading-ids`, `mermaid`, `relative-urls`                                  |
| [Física: movimento uniforme e inclinação do gráfico](movimento-uniforme.md)    | `heading-ids`, `mathjax`, `vega-lite`                                      |
| [Nomenclatura orgânica: da cadeia ao nome](nomenclatura-organica.md)           | `heading-ids`, `mermaid`, `smiles`                                         |
| [Números binários e valor posicional](numeros-binarios.md)                     | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`              |
| [Octaedro: vértices e faces](octaedro-em-obj.md)                               | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                      |
| [Ode à alegria: melodia, pulso e frases](ode-a-alegria.md)                     | `abc`, `heading-ids`, `mathjax`                                            |
| [Ordenação por inserção: construir uma parte ordenada](ordenacao-insercao.md)  | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`, `syntax-highlight`   |
| [Páginas e desambiguação de citações](paginas-e-desambiguacao.md)              | `citations`, `heading-ids`, `relative-urls`                                |
| [Paralelas e perpendiculares](paralelas-e-perpendiculares.md)                  | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls` |
| [Pausas musicais: o silêncio tem duração](pausas-musicais.md)                  | `abc`, `heading-ids`, `mathjax`, `relative-urls`                           |
| [Pêndulo simples: período e aproximações](pendulo-simples.md)                  | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                     |
| [Pirâmide de base quadrada: altura e volume](piramide-quadrada.md)             | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                      |
| [Polímeros: da unidade à cadeia](polimeros.md)                                 | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`, `smiles`             |
| [Probabilidade: somas de dois dados](probabilidade-dados.md)                   | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                     |
| [Progressões aritméticas e geométricas](progressoes.md)                        | `heading-ids`, `mathjax`                                                   |
| [UART: início, dados e parada](quadro-uart.md)                                 | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom` |
| [Biologia: uma rede alimentar simplificada](redes-alimentares.md)              | `graphviz`, `heading-ids`                                                  |
| [Resistores em paralelo com CircuiTikZ](resistores-em-paralelo.md)             | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`     |
| [Resistores em série: corrente e tensão](resistores-em-serie.md)               | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                       |
| [Ritmo e leitura de partitura em MusicXML](ritmo-e-partitura.md)               | `heading-ids`, `verovio`                                                   |
| [Setup e hold: janela de estabilidade](setup-e-hold.md)                        | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom` |
| [Sistemas lineares: resolver e verificar](sistemas-lineares.md)                | `heading-ids`, `mathjax`, `mathjslab`                                      |
| [Somas e vetores: componentes e produto escalar](somas-e-vetores.md)           | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                     |
| [Funções trigonométricas e suas relações](trigonometria.md)                    | `heading-ids`, `mathjax`, `mathjslab`                                      |
