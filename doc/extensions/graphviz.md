# Graphviz in Markdown

Use `dot` or `graphviz` to author graphs in DOT. Graphviz/WebAssembly generates
SVG locally; resource and capability policy still apply to external references.

```dot
digraph lesson {
    rankdir=LR
    question -> hypothesis -> experiment -> conclusion
    experiment -> hypothesis [label="revise", style=dashed]
}
```

The extension retains source and a local diagnostic on failure. Its SVG must be
handled through the managed rendering pipeline rather than inserted as
arbitrary trusted markup by a host.

Both fences support [standalone SVG export](../visual-export.md). The export
preserves intrinsic dimensions, the viewBox and the accessible name. Markdown
sizing attributes control the live layout. URL-bearing links and images are
removed from exported files.
