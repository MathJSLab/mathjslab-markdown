# 3D models in Markdown

Three.js renders ASCII STL, Wavefront OBJ and glTF JSON text fences. glTF is
the preferred representation for scenes and animations.

```obj
o triangle
v -1 0 0
v 1 0 0
v 0 1 0
f 1 2 3
```

External buffers and textures referenced by glTF resolve against the Markdown
source URL and pass URL policy. Three.js performs the binary resource reads;
those reads are not all bounded by the document service. Binary GLB is not a
text-fence format.

Static models do not create an animation loop. Animated models use
`THREE.Timer`, update once per frame and pause outside the viewport or while
the page is hidden. Disposal releases frames, timer/visibility listeners,
controls, geometry, materials, textures and renderer resources. WebGL needs
explicit permission in restricted modes.
