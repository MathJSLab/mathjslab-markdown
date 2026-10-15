# Markdown teaching examples

The examples are organized by language:

- [Brazilian Portuguese](pt/README.md): 82 teaching notes covering all package
  extensions.
- [English](en/README.md): 82 teaching notes covering all package extensions.
- [Spanish](es/README.md): 82 teaching notes covering all package extensions.

There are **246 lesson notes** on mathematics, statistics, physics, chemistry,
biology, geography, history, music, geometry and computing. Each collection
covers all 20 engine extensions, with at least four distinct notes per
extension in each language, including explanations, activities and answers. The
examples include local data and formats such as MEI, SDF and STL. Corresponding
filenames are the same in all three languages.

Recent additions cover teaching blocks, captions and references, digital timing
diagrams, dynamic geometry, TikZ/CircuiTikZ and citations. Earlier renderer
families also have additional examples: compound meter, canons, music dynamics,
project dependencies, ammonia, octahedra, routes, measurement comparisons,
isomers, vectors and binary search.

Each language index includes a coverage table and links to every note.
Automated checks in `test/markdown/ExampleCollections.spec.ts` verify language
parity, extension coverage, local links, construction data and rendering.
Documentation and integration guides are maintained in English in
[doc/](../doc/README.md).

Collections in additional languages can be added in subdirectories of
`example/`.
