<!-- prettier-ignore -->
::: figure Implementação e simplificação de circuito integrado em pastilha de silício — Figura 1-7 {#fig-original-1-7}

```tikz
\begin{tikzpicture}[x=0.0125cm,y=-0.0125cm,line width=0.55pt]
\useasboundingbox (0,0) rectangle (1250.00,920.00);
\node[anchor=center,font=\normalsize,font=\bfseries,inner sep=0pt] at (310.00,60.00) {(a) Vista superior -- disposição inicial};
\draw[draw,fill=white] (80.00,85.00) rectangle (580.00,405.00);
\draw[draw,fill=white] (105.00,135.00) rectangle (190.00,190.00);
\draw[draw,fill=white] (127.00,148.00) rectangle (153.00,173.00);
\node[anchor=center,font=\small,inner sep=0pt] at (140.00,220.00) {$D_1$};
\draw[draw,fill=white] (235.00,135.00) rectangle (320.00,190.00);
\draw[draw,fill=white] (257.00,148.00) rectangle (283.00,173.00);
\node[anchor=center,font=\small,inner sep=0pt] at (270.00,220.00) {$D_2$};
\draw[draw,fill=white] (365.00,135.00) rectangle (450.00,190.00);
\draw[draw,fill=white] (387.00,148.00) rectangle (413.00,173.00);
\node[anchor=center,font=\small,inner sep=0pt] at (400.00,220.00) {$D_3$};
\draw[draw,fill=white] (105.00,255.00) rectangle (190.00,310.00);
\draw[draw,fill=white] (127.00,268.00) rectangle (153.00,293.00);
\node[anchor=center,font=\small,inner sep=0pt] at (140.00,340.00) {$D_a$};
\draw[draw,fill=white] (235.00,255.00) rectangle (320.00,310.00);
\draw[draw,fill=white] (257.00,268.00) rectangle (283.00,293.00);
\node[anchor=center,font=\small,inner sep=0pt] at (270.00,340.00) {$D_b$};
\draw[draw,fill=white] (365.00,255.00) rectangle (450.00,310.00);
\draw[draw,fill=white] (387.00,268.00) rectangle (413.00,293.00);
\node[anchor=center,font=\small,inner sep=0pt] at (400.00,340.00) {$T_1$};
\draw[draw] (160.00,190.00) -- (160.00,260.00) -- (300.00,260.00);
\draw[draw] (275.00,190.00) -- (275.00,260.00) -- (300.00,260.00);
\draw[draw] (390.00,190.00) -- (390.00,260.00) -- (300.00,260.00);
\node[anchor=center,font=\small,inner sep=0pt] at (330.00,395.00) {Interconexões metalizadas e resistores integrados};
\node[anchor=center,font=\normalsize,font=\bfseries,inner sep=0pt] at (910.00,60.00) {(b) Corte A -- ilhas e regiões};
\draw[draw,fill=white] (680.00,85.00) rectangle (1180.00,405.00);
\draw[draw,fill=black] (681.00,260.00) rectangle (1179.00,400.00);
\node[anchor=center,font=\normalsize,inner sep=0pt] at (925.00,350.00) {Substrato semicondutor (p)};
\draw[draw,fill=black] (730.00,235.00) rectangle (818.00,270.00);
\node[anchor=center,font=\small,inner sep=0pt] at (774.00,257.00) {n};
\draw[draw,fill=black] (842.00,235.00) rectangle (930.00,270.00);
\node[anchor=center,font=\small,inner sep=0pt] at (886.00,257.00) {$p^+$};
\draw[draw,fill=black] (954.00,235.00) rectangle (1042.00,270.00);
\node[anchor=center,font=\small,inner sep=0pt] at (998.00,257.00) {n};
\draw[draw,fill=black] (1066.00,235.00) rectangle (1154.00,270.00);
\node[anchor=center,font=\small,inner sep=0pt] at (1110.00,257.00) {$p^+$};
\draw[draw] (740.00,210.00) -- (740.00,155.00) -- (1070.00,155.00) -- (1070.00,210.00);
\node[anchor=center,font=\normalsize,font=\bfseries,inner sep=0pt] at (310.00,500.00) {(c) Vista superior -- regiões compartilhadas};
\draw[draw,fill=white] (80.00,525.00) rectangle (580.00,845.00);
\draw[draw,fill=white] (105.00,575.00) rectangle (190.00,630.00);
\draw[draw,fill=white] (127.00,588.00) rectangle (153.00,613.00);
\node[anchor=center,font=\small,inner sep=0pt] at (140.00,660.00) {$D_1$};
\draw[draw,fill=white] (235.00,575.00) rectangle (320.00,630.00);
\draw[draw,fill=white] (257.00,588.00) rectangle (283.00,613.00);
\node[anchor=center,font=\small,inner sep=0pt] at (270.00,660.00) {$D_2$};
\draw[draw,fill=white] (365.00,575.00) rectangle (450.00,630.00);
\draw[draw,fill=white] (387.00,588.00) rectangle (413.00,613.00);
\node[anchor=center,font=\small,inner sep=0pt] at (400.00,660.00) {$D_3$};
\draw[draw,fill=white] (105.00,695.00) rectangle (190.00,750.00);
\draw[draw,fill=white] (127.00,708.00) rectangle (153.00,733.00);
\node[anchor=center,font=\small,inner sep=0pt] at (140.00,780.00) {$D_a$};
\draw[draw,fill=white] (235.00,695.00) rectangle (320.00,750.00);
\draw[draw,fill=white] (257.00,708.00) rectangle (283.00,733.00);
\node[anchor=center,font=\small,inner sep=0pt] at (270.00,780.00) {$D_b$};
\draw[draw,fill=white] (365.00,695.00) rectangle (450.00,750.00);
\draw[draw,fill=white] (387.00,708.00) rectangle (413.00,733.00);
\node[anchor=center,font=\small,inner sep=0pt] at (400.00,780.00) {$T_1$};
\draw[draw] (160.00,630.00) -- (160.00,700.00) -- (300.00,700.00);
\draw[draw] (275.00,630.00) -- (275.00,700.00) -- (300.00,700.00);
\draw[draw] (390.00,630.00) -- (390.00,700.00) -- (300.00,700.00);
\node[anchor=center,font=\small,inner sep=0pt] at (330.00,835.00) {Interconexões metalizadas e resistores integrados};
\node[anchor=center,font=\normalsize,font=\bfseries,inner sep=0pt] at (910.00,500.00) {(d) Corte -- circuito condensado};
\draw[draw,fill=white] (680.00,525.00) rectangle (1180.00,845.00);
\draw[draw,fill=black] (681.00,700.00) rectangle (1179.00,840.00);
\node[anchor=center,font=\normalsize,inner sep=0pt] at (925.00,790.00) {Substrato semicondutor (p)};
\draw[draw,fill=black] (730.00,675.00) rectangle (818.00,710.00);
\node[anchor=center,font=\small,inner sep=0pt] at (774.00,697.00) {n};
\draw[draw,fill=black] (842.00,675.00) rectangle (930.00,710.00);
\node[anchor=center,font=\small,inner sep=0pt] at (886.00,697.00) {$p^+$};
\draw[draw,fill=black] (954.00,675.00) rectangle (1042.00,710.00);
\node[anchor=center,font=\small,inner sep=0pt] at (998.00,697.00) {n};
\draw[draw,fill=black] (1066.00,675.00) rectangle (1154.00,710.00);
\node[anchor=center,font=\small,inner sep=0pt] at (1110.00,697.00) {$p^+$};
\draw[draw] (740.00,650.00) -- (740.00,595.00) -- (1070.00,595.00) -- (1070.00,650.00);
\end{tikzpicture}
```

:::
