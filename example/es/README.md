# Notas de clase en Markdown

Esta colección contiene **105 notas en español**. Todas tienen versiones
correspondientes en [portugués brasileño](../pt/README.md) e
[inglés](../en/README.md), con los mismos nombres de archivo. Cada una de las
24 extensiones tiene al menos cuatro notas distintas por idioma.

Las notas incluyen explicaciones, ejemplos, actividades y respuestas. Los datos
son locales o están incorporados, incluidas las
[temperaturas](resources/temperaturas.csv) y las
[observaciones](resources/observacoes.csv). Los identificadores de comandos y
los formatos técnicos se conservan entre traducciones.

## Configuración

Use el perfil GFM para títulos, enlaces relativos y código resaltado.
Seleccione las extensiones indicadas en cada nota; las bibliotecas opcionales
se cargan bajo demanda. La geometría requiere `interactive`; TikZ requiere
`wasm` y `network` para los archivos locales del runtime. Los mapas y los
renderizadores 3D también dependen de las capacidades configuradas por el host.
MathJSLab requiere un ejecutor y autorización de ejecución. Configure
`locale: "es-ES"` para las etiquetas generadas. Consulte las
[guías de integración](../../doc/extensions/README.md).

## Cobertura por extensión

| Extensión          | Notas |
| ------------------ | ----: |
| `abc`              |     5 |
| `citations`        |     4 |
| `cross-references` |    18 |
| `didactic`         |    17 |
| `geometry`         |     4 |
| `graphviz`         |     4 |
| `heading-ids`      |   105 |
| `hdl`              |     4 |
| `hdl-interactive`  |     5 |
| `maps`             |     6 |
| `mathjax`          |    50 |
| `mathjslab`        |     7 |
| `mermaid`          |    18 |
| `model-3d`         |     4 |
| `netlist`          |     4 |
| `molecule-3d`      |     4 |
| `relative-urls`    |    61 |
| `smiles`           |    12 |
| `syntax-highlight` |     7 |
| `tikz`             |     6 |
| `vega-lite`        |    10 |
| `verovio`          |     5 |
| `vcd`              |     4 |
| `wavedrom`         |     7 |

## Índice

| Nota                                                                                                     | Extensiones usadas                                                                                         |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Ácidos y bases: transferencia de protones](acidos-bases.md)                                             | `heading-ids`, `mathjax`, `relative-urls`, `smiles`                                                        |
| [Alcohol y éter: misma fórmula, enlaces diferentes](alcool-e-eter.md)                                    | `heading-ids`, `mathjax`, `relative-urls`, `smiles`                                                        |
| [Algoritmos: sumar una sucesión en JavaScript](algoritmos.md)                                            | `heading-ids`, `mathjax`, `syntax-highlight`                                                               |
| [Amoníaco: geometría piramidal](amonia-piramidal.md)                                                     | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`                                         |
| [Árbol de probabilidad con TikZ](arvore-de-probabilidade.md)                                             | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`                                     |
| [Átomos e iones: carga e identidad](atomos-e-ions.md)                                                    | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Cuencas hidrográficas: área y red de drenaje](bacia-hidrografica.md)                                    | `heading-ids`, `maps`, `mermaid`, `relative-urls`                                                          |
| [Balanceo de ecuaciones: conservar átomos](balanceamento-quimico.md)                                     | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Teoremas, ejercicios y referencias](blocos-didaticos.md)                                                | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                  |
| [Búsqueda binaria: reducir el intervalo](busca-binaria.md)                                               | `heading-ids`, `relative-urls`, `syntax-highlight`                                                         |
| [Cadenas carbonadas y aromaticidad](cadeias-carbonicas.md)                                               | `heading-ids`, `smiles`                                                                                    |
| [Catálogo bibliográfico sin citas](catalogo-bibliografico.md)                                            | `citations`, `heading-ids`, `relative-urls`                                                                |
| [El ciclo del agua y la conservación de la materia](ciclo-da-agua.md)                                    | `heading-ids`, `mermaid`                                                                                   |
| [Dibujos técnicos y circuitos eléctricos](circuitos-eletricos.md)                                        | `cross-references`, `heading-ids`, `relative-urls`, `tikz`                                                 |
| [Circuncentro de un triángulo](circuncentro-do-triangulo.md)                                             | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls`                                 |
| [Citas y bibliografía](citacoes-e-bibliografia.md)                                                       | `citations`, `heading-ids`, `relative-urls`                                                                |
| [Citas numéricas y orden de las fuentes](citacoes-numericas.md)                                          | `citations`, `heading-ids`, `relative-urls`                                                                |
| [VHDL y Verilog: cuatro descripciones de hardware](codigo-hdl.md)                                        | `heading-ids`, `syntax-highlight`                                                                          |
| [Comparación de mediciones: dos grupos](comparacao-de-medicoes.md)                                       | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Compás compuesto en 6/8](compasso-composto.md)                                                          | `abc`, `heading-ids`, `mathjax`, `relative-urls`                                                           |
| [Comunicación digital: solicitud y respuesta](comunicacao-digital.md)                                    | `heading-ids`, `mermaid`                                                                                   |
| [SPI: reloj y selección](comunicacao-spi.md)                                                             | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Crecimiento compuesto: un modelo multiplicativo](crescimento-composto.md)                               | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Cubo: superficie, volumen y malla triangular](cubo-em-stl.md)                                           | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                                                      |
| [Definiciones y ejemplos: norma de un vector](definicoes-e-exemplos.md)                                  | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                  |
| [Inducción: suma de los primeros enteros](demonstracao-por-inducao.md)                                   | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                  |
| [Dependencias de un proyecto](dependencias-de-projeto.md)                                                | `graphviz`, `heading-ids`, `relative-urls`                                                                 |
| [Diagramas temporales digitales](diagramas-temporais.md)                                                 | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Buses de comunicación digital: de los bits a los sistemas distribuidos](digital-communication-buses.md) | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `mermaid`, `tikz`, `vega-lite`, `wavedrom`       |
| [Dinámica musical: piano y forte](dinamica-musical.md)                                                   | `heading-ids`, `relative-urls`, `verovio`                                                                  |
| [Dióxido de carbono: enlaces y simetría](dioxido-de-carbono.md)                                          | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`                                         |
| [Circuitos eléctricos](electrical-circuits.md)                                                           | `cross-references`, `didactic`, `heading-ids`, `mathjax`, `mermaid`, `tikz`, `vega-lite`                   |
| [Elipse: suma de distancias a los focos](elipse-e-focos.md)                                              | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls`                                 |
| [Energía mecánica y transformaciones](energia-mecanica.md)                                               | `graphviz`, `heading-ids`, `mathjax`, `relative-urls`                                                      |
| [Escala de do mayor en MEI](escala-em-mei.md)                                                            | `heading-ids`, `relative-urls`, `verovio`                                                                  |
| [Estadística: distribución de calificaciones y media](estatistica.md)                                    | `heading-ids`, `mathjax`, `vega-lite`                                                                      |
| [Esterificación: reactivos, productos y equilibrio](esterificacao.md)                                    | `heading-ids`, `mathjax`, `smiles`                                                                         |
| [Ejercicios con pistas: porcentajes sucesivos](exercicios-com-dicas.md)                                  | `didactic`, `heading-ids`, `mathjax`, `relative-urls`                                                      |
| [Expresiones lógicas: puertas y combinaciones](expressoes-logicas.md)                                    | `heading-ids`, `wavedrom`                                                                                  |
| [Filtro RC: tensión en el condensador](filtro-rc.md)                                                     | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`                                     |
| [Fotosíntesis: materia y energía](fotossintese.md)                                                       | `graphviz`, `heading-ids`, `mathjax`, `relative-urls`                                                      |
| [Fracciones equivalentes y suma](fracoes-equivalentes.md)                                                | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Función cuadrática: raíces y vértice](funcao-quadratica.md)                                             | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Funciones orgánicas: reconocer grupos funcionales](funcoes-organicas.md)                                | `heading-ids`, `mathjax`, `smiles`                                                                         |
| [Gases ideales: presión y volumen](gases-ideais.md)                                                      | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Genética: un cruce monohíbrido](genetica-mendeliana.md)                                                 | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Geografía: ubicación y coordenadas en Brasil](geografia-coordenadas.md)                                 | `heading-ids`, `maps`                                                                                      |
| [Geometría dinámica: puntos medios y circunferencias](geometria-dinamica.md)                             | `cross-references`, `geometry`, `heading-ids`, `relative-urls`                                             |
| [Geometría molecular del agua](geometria-molecular.md)                                                   | `heading-ids`, `mathjax`, `molecule-3d`, `smiles`                                                          |
| [Geometría espacial: un tetraedro en OBJ](geometria-solidos.md)                                          | `heading-ids`, `mathjax`, `model-3d`                                                                       |
| [Historia: capitales y organización territorial de Brasil](historia-capitais.md)                         | `heading-ids`, `maps`                                                                                      |
| [Intervalos: notas sucesivas y simultáneas](intervalos-musicais.md)                                      | `heading-ids`, `relative-urls`, `verovio`                                                                  |
| [Isomería: misma fórmula, estructuras diferentes](isomeria.md)                                           | `heading-ids`, `mathjax`, `smiles`                                                                         |
| [Fuerzas y segunda ley de Newton](leis-de-newton.md)                                                     | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Lectura de datos: tabla, unidad y procedencia](leitura-de-dados.md)                                     | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`                                              |
| [Rutas locales: coordenadas y conexiones](mapa-de-rotas.md)                                              | `heading-ids`, `maps`, `mermaid`, `relative-urls`                                                          |
| [Matrices y transformaciones en el plano](matrizes-transformacoes.md)                                    | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Media, mediana y valores extremos](media-e-valores-extremos.md)                                         | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`, `vega-lite`                                 |
| [Mediterráneo antiguo: ciudades y conexiones](mediterraneo-antigo.md)                                    | `heading-ids`, `maps`, `mermaid`, `relative-urls`                                                          |
| [Canon: entrada retrasada de una voz](melodia-em-canon.md)                                               | `abc`, `heading-ids`, `relative-urls`                                                                      |
| [Metano: geometría tetraédrica](metano-tetraedrico.md)                                                   | `heading-ids`, `mathjax`, `molecule-3d`, `relative-urls`, `smiles`                                         |
| [Investigar la germinación de semillas](metodo-cientifico.md)                                            | `heading-ids`, `mermaid`                                                                                   |
| [Mitosis y organización del ciclo celular](mitose.md)                                                    | `heading-ids`, `mermaid`, `relative-urls`                                                                  |
| [Física: movimiento uniforme y pendiente del gráfico](movimento-uniforme.md)                             | `heading-ids`, `mathjax`, `vega-lite`                                                                      |
| [Las matemáticas y la física de la música: de Pitágoras al temperamento igual](music-pitagoras.md)       | `abc`, `cross-references`, `didactic`, `heading-ids`, `maps`, `mathjax`, `mermaid`, `vega-lite`, `verovio` |
| [Nomenclatura orgánica: de la cadena al nombre](nomenclatura-organica.md)                                | `heading-ids`, `mermaid`, `smiles`                                                                         |
| [Números binarios y valor posicional](numeros-binarios.md)                                               | `heading-ids`, `mathjax`, `relative-urls`, `syntax-highlight`                                              |
| [Octaedro: vértices y caras](octaedro-em-obj.md)                                                         | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                                                      |
| [Oda a la alegría: melodía, pulso y frases](ode-a-alegria.md)                                            | `abc`, `heading-ids`, `mathjax`                                                                            |
| [Ordenación por inserción: construir una parte ordenada](ordenacao-insercao.md)                          | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`, `syntax-highlight`                                   |
| [Páginas y desambiguación de citas](paginas-e-desambiguacao.md)                                          | `citations`, `heading-ids`, `relative-urls`                                                                |
| [Paralelas y perpendiculares](paralelas-e-perpendiculares.md)                                            | `cross-references`, `didactic`, `geometry`, `heading-ids`, `relative-urls`                                 |
| [Pausas musicales: el silencio tiene duración](pausas-musicais.md)                                       | `abc`, `heading-ids`, `mathjax`, `relative-urls`                                                           |
| [Péndulo simple: período y aproximaciones](pendulo-simples.md)                                           | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Pirámide de base cuadrada: altura y volumen](piramide-quadrada.md)                                      | `heading-ids`, `mathjax`, `model-3d`, `relative-urls`                                                      |
| [Polímeros: de la unidad a la cadena](polimeros.md)                                                      | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`, `smiles`                                             |
| [Probabilidad: sumas de dos dados](probabilidade-dados.md)                                               | `heading-ids`, `mathjax`, `relative-urls`, `vega-lite`                                                     |
| [Progresiones aritméticas y geométricas](progressoes.md)                                                 | `heading-ids`, `mathjax`                                                                                   |
| [UART: inicio, datos y parada](quadro-uart.md)                                                           | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Biología: una red alimentaria simplificada](redes-alimentares.md)                                       | `graphviz`, `heading-ids`                                                                                  |
| [Registros digitales: campos y formatos](registradores-digitais.md)                                      | `heading-ids`, `wavedrom`                                                                                  |
| [Resistencias en paralelo con CircuiTikZ](resistores-em-paralelo.md)                                     | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `tikz`                                     |
| [Resistencias en serie: corriente y tensión](resistores-em-serie.md)                                     | `heading-ids`, `mathjax`, `mermaid`, `relative-urls`                                                       |
| [Ritmo y lectura de una partitura en MusicXML](ritmo-e-partitura.md)                                     | `heading-ids`, `verovio`                                                                                   |
| [Setup y hold: ventana de estabilidad](setup-e-hold.md)                                                  | `cross-references`, `didactic`, `heading-ids`, `relative-urls`, `wavedrom`                                 |
| [Sistemas lineales: resolver y comprobar](sistemas-lineares.md)                                          | `heading-ids`, `mathjax`, `mathjslab`                                                                      |
| [Sumas y vectores: componentes y producto escalar](somas-e-vetores.md)                                   | `heading-ids`, `mathjax`, `mathjslab`, `relative-urls`                                                     |
| [Funciones trigonométricas y sus relaciones](trigonometria.md)                                           | `heading-ids`, `mathjax`, `mathjslab`                                                                      |
| [Puerta AND: esquema de netlist](porta-and-netlist.md)                                                   | `heading-ids`, `netlist`                                                                                   |
| [Multiplexor de cuatro bits: buses](multiplexador-netlist.md)                                            | `heading-ids`, `netlist`                                                                                   |
| [Sumador de cuatro bits: estructura RTL](somador-netlist.md)                                             | `heading-ids`, `netlist`                                                                                   |
| [Flip-flop D: conexiones y reloj](registrador-netlist.md)                                                | `heading-ids`, `netlist`                                                                                   |
| [HDL: simulación de una puerta AND](hdl-porta-and.md)                                                    | `heading-ids`, `hdl`                                                                                       |
| [HDL: síntesis de un multiplexor](hdl-multiplexador.md)                                                  | `heading-ids`, `hdl`                                                                                       |
| [HDL: síntesis de un sumador con acarreo](hdl-somador.md)                                                | `heading-ids`, `hdl`                                                                                       |
| [HDL: simulación de un contador síncrono](hdl-contador.md)                                               | `heading-ids`, `hdl`                                                                                       |
| [VCD: puerta AND y eventos irregulares](vcd-porta-and.md)                                                | `heading-ids`, `vcd`                                                                                       |
| [VCD: reset y contador de cuatro bits](vcd-contador.md)                                                  | `heading-ids`, `vcd`                                                                                       |
| [VCD: bus tri-state y valores desconocidos](vcd-barramento.md)                                           | `heading-ids`, `vcd`                                                                                       |
| [VCD: handshake y alias jerárquicos](vcd-handshake.md)                                                   | `heading-ids`, `vcd`                                                                                       |
| [Simulación interactiva: puerta AND](hdl-live-and.md)                                                    | `heading-ids`, `hdl-interactive`                                                                           |
| [Simulación interactiva: multiplexor](hdl-live-mux.md)                                                   | `heading-ids`, `hdl-interactive`                                                                           |
| [Simulación interactiva: contador y reset](hdl-live-counter.md)                                          | `heading-ids`, `hdl-interactive`                                                                           |
| [Simulación interactiva: registro con enable](hdl-live-register.md)                                      | `heading-ids`, `hdl-interactive`                                                                           |
| [HDL: estímulos y verificaciones](hdl-stimuli-checks.md)                                                 | `heading-ids`, `hdl-interactive`                                                                           |
