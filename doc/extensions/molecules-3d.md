# 3D molecules in Markdown

3Dmol.js accepts PDB, CIF/mmCIF, SDF, MOL2, XYZ and cube data through the named
text fences. Initial camera and representation are selected automatically.

```xyz
3
water molecule
O  0.000000  0.000000  0.000000
H  0.758602  0.000000  0.504284
H -0.758602  0.000000  0.504284
```

WebGL must be available and authorized. The extension sizes its viewer within
the document, responds to resize and releases spin, models and viewer resources
on disposal. Browser checks should verify drawn geometry, not merely the
presence of a canvas.
