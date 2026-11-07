# 3. Álgebra booleana e funções lógicas {#chapter-03}

A eletrônica digital pode ser descrita por linguagens matemáticas e técnicas
distintas, mas estruturalmente relacionadas. A **teoria dos conjuntos** permite
caracterizar regiões de um universo e condições de pertencimento; a **lógica
proposicional** formaliza sentenças e conectivos segundo suas condições de
verdade; a **álgebra de Boole** abstrai as operações comuns a essas estruturas;
e as **funções booleanas** fornecem a descrição matemática das relações entre
entradas e saídas de sistemas digitais. Nos circuitos com contatos, essas
relações são interpretadas como condições de continuidade elétrica; nas portas
lógicas, são realizadas por dispositivos eletrônicos.

O desenvolvimento parte de conjuntos e diagramas de Venn, avança pelas
proposições e suas tabelas-verdade e chega à definição axiomática da álgebra
booleana, às identidades, às formas canônicas e à síntese de funções. Em
seguida, examina a realização dessas funções por contatos e portas, para
estabelecer, de maneira sistemática, a correspondência entre representações
gráficas, simbólicas, tabulares e físicas. A comparação não depende apenas de
semelhanças visuais: requer explicitar o universo de estados, as valorações e a
interpretação das variáveis binárias.

Uma distinção acompanhará todo o capítulo: **equivalência lógica não é
equivalência física**. Identidades booleanas são exatas em seus modelos
matemáticos; contatos e portas reais apresentam atrasos, limites elétricos e
condições específicas de funcionamento. Assim, a mesma função pode admitir
diferentes realizações sem que elas tenham necessariamente o mesmo
comportamento temporal, consumo ou confiabilidade.

## 3.1. Conjuntos, universo e operações {#sec-sets-and-operations}

Um **conjunto** é uma coleção de elementos bem definidos. Escrevemos $x\in A$
quando $x$ pertence ao conjunto $A$, e $x\notin A$ caso contrário. Fixado um
**universo de discurso** $U$, os conjuntos considerados são subconjuntos de
$U$. O conjunto vazio $\varnothing$ não contém elementos; o próprio $U$ contém
todos os elementos do universo escolhido.

<!-- prettier-ignore -->
::: definition Operações de conjuntos {#def-set-operations}

Para $A,B\subseteq U$ definimos:

- **Interseção:** $A\cap B=\{x\in U:x\in A\ \text{e}\ x\in B\}$.
- **União:** $A\cup B=\{x\in U:x\in A\ \text{ou}\ x\in B\}$; o OU é
  **inclusivo**.
- **Complemento:** $A^{c}=U\setminus A=\{x\in U:x\notin A\}$.
- **Diferença:** $A\setminus B=A\cap B^{c}$.
- **Diferença simétrica:** $A\triangle B=(A\setminus B)\cup(B\setminus A)$.

:::

O complemento depende de $U$: mudar o universo pode mudar $A^c$, mesmo que $A$
permaneça igual. A união inclui elementos pertencentes simultaneamente a $A$ e
$B$, enquanto a diferença simétrica exclui precisamente essa interseção.

### 3.1.1. Diagramas de Venn {#sec-venn-diagrams}

<!-- prettier-ignore -->
Diagramas de Venn representam subconjuntos por regiões de um universo
retangular. O preenchimento identifica o conjunto resultante.
Na {@ref fig-venn-and-or}, a interseção corresponde à região comum; a
união, à região coberta por ao menos um conjunto.

<!-- prettier-ignore -->
::: figure Interseção e união de conjuntos em diagramas de Venn {#fig-venn-and-or}

```tikz
\begin{tikzpicture}[scale=1.65,transform shape]
\foreach \x/\t in {0/{$A\cap B$},4/{$A\cup B$}}{
  \draw (\x,0) rectangle ++(3,2.1);
  \node at (\x+1.5,2.45) {\t};
}
\begin{scope}
  \clip (1.1,1.05) circle (.72);
  \fill[gray!55] (1.9,1.05) circle (.72);
\end{scope}
\draw (1.1,1.05) circle (.72); \draw (1.9,1.05) circle (.72);
\fill[gray!55] (5.1,1.05) circle (.72);
\fill[gray!55] (5.9,1.05) circle (.72);
\draw (5.1,1.05) circle (.72); \draw (5.9,1.05) circle (.72);
\node at (.75,1.05) {$A$}; \node at (2.25,1.05) {$B$};
\node at (4.75,1.05) {$A$}; \node at (6.25,1.05) {$B$};
\end{tikzpicture}
```

:::

O diagrama é uma representação espacial de relações de pertencimento; não se
deve inferir que a área desenhada seja proporcional à quantidade de elementos.
Diagramas de Venn são úteis para visualizar identidades como as leis de De
Morgan:

$$
(A\cup B)^c=A^c\cap B^c,\qquad (A\cap B)^c=A^c\cup B^c. \tag{3.1}
$$

### 3.1.2. Relações, operações e identidades de conjuntos {#sec-set-identities}

A inclusão $A\subseteq B$ significa que $\forall x\in U$, $x\in A$ implica
$x\in B$. A igualdade entre conjuntos é extensional: $A=B$ se, e somente se,
$A\subseteq B$ e $B\subseteq A$. Essas definições permitem demonstrar
identidades sem recorrer à aparência de diagramas. Por exemplo, para qualquer
$x\in U$,

$$
\begin{aligned}
x\in A\cap(B\cup C)
&\iff (x\in A)\land((x\in B)\lor(x\in C))\\
&\iff ((x\in A)\land(x\in B))\lor((x\in A)\land(x\in C))\\
&\iff x\in(A\cap B)\cup(A\cap C).
\end{aligned}\tag{3.2}
$$

Portanto, $A\cap(B\cup C)=(A\cap B)\cup(A\cap C)$. A demonstração depende da
equivalência lógica da distributividade e evidencia por que a teoria dos
conjuntos e a lógica proposicional compartilham a mesma estrutura operacional.
Valem ainda

$$
A\cap U=A, \tag{3.3}
$$

$$
A\cup\varnothing=A, \tag{3.4}
$$

$$
A\cap A^c=\varnothing \tag{3.5}
$$

e

$$
A\cup A^c=U. \tag{3.6}
$$

<!-- prettier-ignore -->
Uma _partição_ de $U$ é uma família de subconjuntos não vazios, dois a dois
disjuntos, cuja união é $U$. As quatro regiões $A\cap B$,
$A\cap B^c$, $A^c\cap B$ e $A^c\cap B^c$
constituem uma partição quando nenhuma delas é vazia. Essas
regiões correspondem às quatro linhas de uma tabela-verdade com duas variáveis,
quando todas as combinações são possíveis.

### 3.1.3. Funções características: conjuntos como valores binários {#sec-characteristic-functions}

Para cada $A\subseteq U$, definimos a **função característica**
$\chi_A:U\to\{0,1\}$ por

$$
\chi_A(x)=\begin{cases}1,&x\in A,\\0,&x\notin A.\end{cases} \tag{3.7}
$$

Essa construção estabelece uma ponte matemática precisa entre conjuntos e
lógica binária. Para todo $x\in U$:

$$
\begin{aligned}
\chi_{A\cap B}(x)&=\chi_A(x)\cdot\chi_B(x),\\
\chi_{A\cup B}(x)&=\chi_A(x)\lor\chi_B(x),\\
\chi_{A^c}(x)&=1-\chi_A(x),\\
\chi_{A\triangle B}(x)&=\chi_A(x)\oplus\chi_B(x).
\end{aligned} \tag{3.8}
$$

Na segunda igualdade, $\lor$ denota OU lógico, e não soma aritmética. Assim, a
operação de conjuntos passa a ser uma operação ponto a ponto sobre funções com
valores em $\{0,1\}$.

## 3.2. Lógica proposicional {#sec-propositional-logic}

A **lógica proposicional clássica** estuda proposições, fórmulas e relações de
consequência. Uma proposição é uma sentença declarativa à qual, sob uma
interpretação, se atribui exatamente um dos valores **verdadeiro** ($V$) ou
**falso** ($F$). Perguntas e ordens não são proposições no sentido usual.
Representamos proposições por $P,Q,R,\ldots$.

### 3.2.1. Sintaxe, interpretação e valoração {#sec-propositional-syntax-semantics}

<!-- prettier-ignore -->
As fórmulas são construídas a partir de variáveis proposicionais e conectivos.
Se $P$ e $Q$ são fórmulas, então $\neg P$, $(P\land Q)$, $(P\lor Q)$,
$(P\to Q)$ e $(P\leftrightarrow Q)$ também são fórmulas. A **sintaxe**
especifica quais cadeias são fórmulas bem formadas; a **semântica** especifica
seus valores de verdade.

Uma **valoração** $v$ atribui a cada variável um valor em $\{F,V\}$ e estende
essa atribuição recursivamente aos conectivos. Convencionamos
$F\leftrightarrow0$ e $V\leftrightarrow1$. Para evitar ambiguidades,
empregaremos parênteses quando houver conectivos diferentes na mesma expressão.

<!-- prettier-ignore -->
::: table Tabelas-verdade dos conectivos proposicionais {#tbl-propositional-connectives .full-width}

| $P$ | $Q$ | $\neg P$ | $P\land Q$ | $P\lor Q$ | $P\oplus Q$ | $P\to Q$ | $P\leftrightarrow Q$ |
| :-: | :-: | :------: | :--------: | :-------: | :---------: | :------: | :------------------: |
|  F  |  F  |    V     |     F      |     F     |      F      |    V     |          V           |
|  F  |  V  |    V     |     F      |     V     |      V      |    V     |          F           |
|  V  |  F  |    F     |     F      |     V     |      V      |    F     |          F           |
|  V  |  V  |    F     |     V      |     V     |      F      |    V     |          V           |

:::

A disjunção $P\lor Q$ é inclusiva. A implicação material $P\to Q$ é falsa
somente quando $P$ é verdadeira e $Q$ é falsa. Não afirma, por si só,
causalidade. A bicondicional $P\leftrightarrow Q$ é verdadeira quando os
valores coincidem; a disjunção exclusiva $P\oplus Q$ é verdadeira quando
diferem.

### 3.2.2. Formação recursiva de fórmulas e semântica composicional {#sec-propositional-grammar}

Seja $\mathsf{Prop}=\{P,Q,R,\ldots\}$ um conjunto de variáveis proposicionais.
O conjunto $\mathsf{Form}$ das fórmulas bem formadas é o menor conjunto que
contém as variáveis e as constantes $\top$ e $\bot$, e é fechado pelas regras:
se $\varphi,\psi\in\mathsf{Form}$, então $\neg\varphi$, $(\varphi\land\psi)$,
$(\varphi\lor\psi)$, $(\varphi\to\psi)$ e $(\varphi\leftrightarrow\psi)$ também
pertencem a $\mathsf{Form}$. Não são fórmulas quaisquer sequências de símbolos:
sua construção deve obedecer a essas regras.

Uma valoração $v:\mathsf{Prop}\to\{0,1\}$ estende-se de maneira única às
fórmulas por indução estrutural. Em particular,

$$
\begin{aligned}
v(\neg\varphi)&=1-v(\varphi),\\
v(\varphi\land\psi)&=\min\{v(\varphi),v(\psi)\},\\
v(\varphi\lor\psi)&=\max\{v(\varphi),v(\psi)\},\\
v(\varphi\to\psi)&=\max\{1-v(\varphi),v(\psi)\}.
\end{aligned} \tag{3.9}
$$

Essa definição é _composicional_: o valor de uma fórmula depende dos valores de
suas subfórmulas, e não do conteúdo linguístico das sentenças que as variáveis
representam. A tabela-verdade é a enumeração finita dessas avaliações.

A distinção entre conectivo e metalinguagem é essencial: $\varphi\to\psi$ é uma
fórmula da linguagem objeto; $\Gamma\models\psi$ é uma afirmação sobre todas as
valorações que satisfazem $\Gamma$. Similarmente, $\varphi\leftrightarrow\psi$
é uma fórmula, enquanto $\varphi\equiv\psi$ afirma equivalência semântica entre
fórmulas.

### 3.2.3. Equivalência, tautologia e consequência {#sec-logical-equivalence}

Duas fórmulas $\varphi$ e $\psi$ são **logicamente equivalentes**,
$\varphi\equiv\psi$, se recebem o mesmo valor em todas as valorações. Uma
**tautologia** é verdadeira em todas as valorações; uma **contradição**, falsa
em todas; uma **contingência**, verdadeira em algumas e falsa em outras.
Escrevemos $\Gamma\models\varphi$ quando toda valoração que satisfaz as
premissas de $\Gamma$ satisfaz também $\varphi$.

<!-- prettier-ignore -->
Por exemplo, $P\to Q\equiv\neg P\lor Q$ e
$P\leftrightarrow Q\equiv(P\land Q)\lor(\neg P\land\neg Q)$. A equivalência é
verificável pela coincidência das colunas da tabela-verdade, independentemente
da redação das proposições.

### 3.2.4. Argumentos, validade e regras de inferência {#sec-propositional-inference}

Um _argumento_ é formado por premissas $\Gamma=\{\varphi_1,\ldots,\varphi_k\}$
e uma conclusão $\psi$. É semanticamente válido quando não existe valoração que
torne todas as premissas verdadeiras e a conclusão falsa. A validade não afirma
que as premissas sejam efetivamente verdadeiras: examina a preservação da
verdade sob todas as interpretações possíveis.

Uma regra fundamental é o _modus ponens_:

$$
\frac{\varphi\qquad\varphi\to\psi}{\psi}. \tag{3.10}
$$

Se $v(\varphi)=1$ e $v(\varphi\to\psi)=1$, necessariamente $v(\psi)=1$. Já a
passagem de $\varphi\to\psi$ e $\psi$ para $\varphi$ é inválida (_afirmação do
consequente_): $\psi$ pode ser verdadeira mesmo quando $\varphi$ é falsa.

Denotamos por $\Gamma\vdash\psi$ a existência de uma derivação formal de $\psi$
a partir de $\Gamma$ em um sistema de prova especificado. O símbolo $\vdash$
expressa _derivabilidade sintática_; $\models$, _consequência semântica_. Para
sistemas clássicos usuais de lógica proposicional, os teoremas de correção e
completude estabelecem, respectivamente, que $\Gamma\vdash\psi$ implica
$\Gamma\models\psi$ e que $\Gamma\models\psi$ implica $\Gamma\vdash\psi$.

A validade de uma inferência pode ser testada por uma única fórmula:
$\varphi_1,\ldots,\varphi_k\models\psi$ se, e somente se,
$(\varphi_1\land\cdots\land\varphi_k)\to\psi$ é tautológica. Esse procedimento
liga demonstração lógica, tabela-verdade e verificação formal de circuitos.

### 3.2.5. Conjuntos de valorações {#sec-truth-sets}

Se $\Omega$ é o conjunto de todas as valorações de um conjunto fixo de
variáveis, a cada fórmula $\varphi$ associamos seu **conjunto-verdade**:

$$
[\![\varphi]\!]=\{v\in\Omega:v(\varphi)=V\}. \tag{3.11}
$$

Então $[\![\varphi\land\psi]\!]=[\![\varphi]\!]\cap[\![\psi]\!]$,
$[\![\varphi\lor\psi]\!]=[\![\varphi]\!]\cup[\![\psi]\!]$ e
$[\![\neg\varphi]\!]=\Omega\setminus[\![\varphi]\!]$. Assim, um diagrama de
Venn pode representar conjuntos de valorações que satisfazem proposições, não
apenas conjuntos arbitrários de objetos.

### 3.2.6. Forma normal conjuntiva e forma normal disjuntiva {#sec-propositional-normal-forms}

Um _literal_ é uma variável proposicional ou sua negação. Uma _cláusula_ é uma
disjunção de literais; um _termo conjuntivo_ é uma conjunção de literais. Uma
fórmula está em **forma normal conjuntiva** (FNC) quando é uma conjunção de
cláusulas, e em **forma normal disjuntiva** (FND) quando é uma disjunção de
termos conjuntivos.

<!-- prettier-ignore -->
As equivalências $P\to Q\equiv\neg P\lor Q$ e
$P\leftrightarrow Q\equiv(P\land Q)\lor(\neg P\land\neg Q)$ permitem eliminar
conectivos derivados. Aplicando De Morgan e distributividade, obtêm-se FNC e
FND equivalentes. Para funções de um número finito de variáveis, essas formas
correspondem diretamente às representações algébricas por produtos de somas e
somas de produtos, desenvolvidas na Seção 3.5.

A **satisfatibilidade** pergunta se existe ao menos uma valoração que torna uma
fórmula verdadeira; a **validade** pergunta se todas as valorações a tornam
verdadeira. Uma fórmula $\varphi$ é válida exatamente quando $\neg\varphi$ é
insatisfatível. Essa relação fundamenta métodos computacionais de verificação
lógica e de equivalência entre implementações digitais.

### 3.2.7. Das tabelas-verdade às operações binárias {#sec-truth-tables-to-boolean-operations}

As tabelas-verdade definem o comportamento dos conectivos por seus valores de
entrada e de saída. Para relacioná-las às expressões usadas em eletrônica
digital, identificamos o valor falso com $0$ e o verdadeiro com $1$, e
empregamos letras minúsculas para representar variáveis binárias. A tabela a
seguir reúne as três operações elementares, indicando tanto sua condição de
ativação quanto sua escrita algébrica.

<!-- prettier-ignore -->
::: table Resumo das operações lógicas {#tbl-logical-operations .full-width}

| Operação OR                                                                                                                  | Operação AND                                                                                       | Operação NOT                                                                         |
| :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| A operação OR (OU inclusivo) produz 1 quando ao menos uma entrada vale 1; produz 0 somente quando todas as entradas valem 0. | A operação AND (E) produz 1 se, e somente se, todas as entradas valem 1; caso contrário, produz 0. | A operação NOT (NÃO) é unária e produz o complemento do valor lógico de sua entrada. |
| A expressão $y=a+b$ é lida como “y é igual a a OU b”.                                                                        | A expressão $y=a\cdot b$ é lida como “y é igual a a E b”.                                          | A expressão $y=\bar a$ é lida como “y é igual ao complemento de a”.                  |

:::

A operação E exige a satisfação simultânea das condições; OU, ao contrário,
exige a satisfação de pelo menos uma delas; e NÃO inverte uma condição. Na
notação algébrica, $+$ designa a disjunção inclusiva, $\cdot$ a conjunção e a
barra a complementação. Esses símbolos **não** devem ser interpretados
automaticamente como operações aritméticas ordinárias: por exemplo, $1+1=1$ na
álgebra booleana binária. As definições apresentadas até aqui justificam a
introdução de uma estrutura algébrica que preserve formalmente essas relações.

## 3.3. Definição formal da álgebra de Boole {#sec-formal-boolean-algebra}

A álgebra booleana abstrai as relações identificadas nas duas seções
anteriores. Ela não se restringe necessariamente a dois elementos: a álgebra
dos subconjuntos de um universo é um exemplo de álgebra booleana que pode ter
muitos elementos.

<!-- prettier-ignore -->
::: definition Álgebra booleana {#def-boolean-algebra}

<!-- prettier-ignore -->
Uma **álgebra de Boole** é uma estrutura $(A,+,\cdot,\overline{\phantom a},0,1)$,
com $0\ne1$ na convenção não trivial, na qual $+$ e $\cdot$ são
operações binárias fechadas, a barra denota complemento e, para todos
$a,b,c\in A$, valem os seguintes postulados:

1. **Comutatividade:** $a+b=b+a$ e $a\cdot b=b\cdot a$.
2. **Elementos neutros:** $a+0=a$ e $a\cdot1=a$.
3. **Distributividade dupla:** $a+(b\cdot c)=(a+b)\cdot(a+c)$ e
   $a\cdot(b+c)=(a\cdot b)+(a\cdot c)$.
4. **Complementação:** $a+\bar a=1$ e $a\cdot\bar a=0$.

:::

Nessa definição formal usamos o **ponto** $\cdot$ para a operação E. Em
expressões posteriores, a justaposição $ab$ poderá substituir $a\cdot b$ sem
mudança de significado. Assim, $a\cdot b=ab$; a omissão do ponto é uma
convenção notacional, não uma nova operação. Usaremos $+$ para OU, $\cdot$ ou
justaposição para E e $\bar a$ para NÃO. Em contextos proposicionais,
empregaremos respectivamente $\lor$, $\land$ e $\neg$.

### 3.3.1. Fechamento e modelos {#sec-boolean-models}

<!-- prettier-ignore -->
Fechamento significa que o resultado de cada operação pertence ao mesmo
conjunto $A$. Três modelos importantes são: (i) a álgebra binária
$\mathbb B=\{0,1\}$;
(ii) o conjunto das partes $\mathcal P(U)$, com união, interseção,
complemento relativo a $U$, vazio e universo; (iii) funções $U\to\mathbb B$ com
operações ponto a ponto. A correspondência $A\mapsto\chi_A$ é um isomorfismo
entre os modelos (ii) e (iii).

Na álgebra binária, $1+1=1$, ao contrário da aritmética binária, em que
$1+1=10_2$. Também $1\cdot1=1$ e $\bar1=0$. O significado dos símbolos é
determinado pela estrutura, não por sua aparência aritmética.

### 3.3.2. Reticulados distributivos complementados {#sec-boolean-lattices}

A estrutura de Boole admite uma caracterização equivalente como **reticulado
distributivo limitado e complementado**. As operações $a\cdot b$ e $a+b$
representam, respectivamente, ínfimo (_meet_) e supremo (_join_) na ordem
definida por $a\leq b\iff a\cdot b=a$. Os elementos $0$ e $1$ são,
respectivamente, mínimo e máximo. Para cada $a$, seu complemento $\bar a$
satisfaz $a\cdot\bar a=0$ e $a+\bar a=1$.

A exigência de distributividade é decisiva: nem todo reticulado complementado é
uma álgebra booleana. Também não é necessário que o conjunto subjacente seja
$\{0,1\}$. Por exemplo, se $U=\{u_1,u_2,u_3\}$, a álgebra $\mathcal P(U)$
possui $2^3=8$ elementos e obedece às mesmas identidades, interpretando $+$
como união, $\cdot$ como interseção e complemento relativamente a $U$.

O princípio da **dualidade** pode ser compreendido nessa estrutura: a inversão
da ordem troca ínfimos e supremos, e simultaneamente troca os limites $0$ e
$1$. Assim, as duas leis de absorção e as duas leis distributivas formam pares
duais. A dualidade não é uma licença para trocar símbolos isoladamente: toda a
expressão e suas constantes devem ser transformadas de maneira consistente.

### 3.3.3. Leis derivadas {#sec-derived-boolean-laws}

<!-- prettier-ignore -->
::: table Identidades fundamentais da álgebra booleana {#tbl-boolean-identities .full-width}

| Lei              | Operação OU                   | Operação E                           |
| :--------------- | :---------------------------- | :----------------------------------- |
| Identidade       | $a+0=a$                       | $a\cdot1=a$                          |
| Dominação        | $a+1=1$                       | $a\cdot0=0$                          |
| Idempotência     | $a+a=a$                       | $a\cdot a=a$                         |
| Complemento      | $a+\bar a=1$                  | $a\cdot\bar a=0$                     |
| Comutatividade   | $a+b=b+a$                     | $a\cdot b=b\cdot a$                  |
| Associatividade  | $(a+b)+c=a+(b+c)$             | $(a\cdot b)\cdot c=a\cdot(b\cdot c)$ |
| Absorção         | $a+ab=a$                      | $a(a+b)=a$                           |
| Distributividade | $a+bc=(a+b)(a+c)$             | $a(b+c)=ab+ac$                       |
| De Morgan        | $\overline{a+b}=\bar a\bar b$ | $\overline{ab}=\bar a+\bar b$        |

:::

Valem também $\overline{\bar a}=a$, $\bar0=1$, $\bar1=0$ e a absorção
generalizada $a+\bar a b=a+b$. O **princípio da dualidade** afirma que, em uma
identidade booleana válida, trocar simultaneamente $+$ por $\cdot$ e $0$ por
$1$ produz outra identidade válida, conservando variáveis e complementos.

<!-- prettier-ignore -->
::: example Demonstração algébrica da absorção {#ex-absorption-proof}

Pela identidade, distributividade e dominação:

$$
a+ab=a\cdot1+ab=a(1+b)=a\cdot1=a.
$$

Sua forma dual é $a(a+b)=a$. Essas identidades justificam a remoção de ramos ou
portas redundantes em implementações lógicas.

:::

### 3.3.4. Unicidade do complemento e demonstrações {#sec-boolean-proofs}

O complemento é único. Suponha que $b$ e $c$ sejam complementos de $a$. Então,
pela identidade, distributividade e pelas condições de complementação,

$$
\begin{aligned}
b&=b\cdot1=b(a+c)=ba+bc=0+bc=bc,\\
c&=c\cdot1=c(a+b)=ca+cb=0+cb=bc.
\end{aligned} \tag{3.12}
$$

Logo, $b=c$. Essa demonstração mostra que a barra de complementação é uma
operação bem definida, e não uma escolha arbitrária de um elemento.

Também se demonstra a idempotência a partir dos postulados. Como $a+\bar a=1$ e
$a\bar a=0$,

$$
a=a\cdot1=a(a+\bar a)=aa+a\bar a=aa+0=aa. \tag{3.13}
$$

Por dualidade, $a+a=a$. Uma vez estabelecidas as identidades fundamentais,
expressões podem ser transformadas por substituição de iguais por iguais,
constituindo um cálculo equacional rigoroso para otimização de funções lógicas.

### 3.3.5. Ordem booleana e leis de De Morgan {#sec-boolean-order-demorgan}

<!-- prettier-ignore -->
Definimos $a\le b$ quando $ab=a$, equivalentemente quando $a+b=b$. Na álgebra
de conjuntos, essa ordem é a inclusão $A\subseteq B$; na álgebra binária,
$0\le1$. A operação E é o maior limite inferior (ínfimo), e OU é o menor limite
superior (supremo). O complemento inverte a ordem: $a\le b$ implica $\bar b\le\bar a$.

Os teoremas de De Morgan expressam a troca entre as operações sob
complementação:

$$
\overline{a+b}=\bar a\bar b,\qquad
\overline{ab}=\bar a+\bar b. \tag{3.14}
$$

Essas identidades explicam, por exemplo, por que uma condição de **não ativação
simultânea** pode ser implementada como a conjunção das negações, e fundamentam
a transformação entre portas NAND e NOR.

### 3.3.6. Homomorfismos, isomorfismos e preservação das operações {#sec-boolean-homomorphisms}

Se $\mathcal A$ e $\mathcal B$ são álgebras booleanas, uma aplicação
$h:\mathcal A\to\mathcal B$ é um **homomorfismo booleano** quando preserva as
constantes, as duas operações binárias e o complemento:

$$
\begin{aligned}
h(0)&=0,\quad h(1)=1,\\
h(a+b)&=h(a)+h(b),\\
h(a\cdot b)&=h(a)\cdot h(b),\\
h(\bar a)&=\overline{h(a)}.
\end{aligned} \tag{3.15}
$$

Um homomorfismo bijetivo é um _isomorfismo_. A aplicação $A\mapsto\chi_A$ entre
$\mathcal P(U)$ e o conjunto das funções $U\to\{0,1\}$ é um isomorfismo: as
operações sobre conjuntos correspondem exatamente às operações ponto a ponto
sobre bits. Esta é a fundamentação formal da equivalência entre diagramas de
Venn e tabelas-verdade.

É importante distinguir essa correspondência estrutural de uma identidade entre
objetos físicos. Uma rede de contatos e uma rede de portas podem implementar a
mesma função booleana sem serem isomorfas como circuitos elétricos, pois sua
topologia, seus componentes e sua dinâmica podem diferir.

## 3.4. Funções booleanas e tabelas-verdade {#sec-boolean-functions}

<!-- prettier-ignore -->
Uma função booleana de $n$ entradas é uma aplicação $f:\mathbb B^n\to\mathbb B$.
Seu domínio tem $2^n$ combinações; portanto, existem $2^{2^n}$ funções
distintas de $n$ variáveis. Uma **expressão** é uma maneira de representar uma
função, mas diferentes expressões podem definir a mesma aplicação.

<!-- prettier-ignore -->
::: table Funções fundamentais de duas entradas {#tbl-boolean-functions .full-width}

| $A$ | $B$ | $\bar A$ | $AB$ | $A+B$ | $A\oplus B$ | $\overline{AB}$ | $\overline{A+B}$ | $\overline{A\oplus B}$ |
| :-: | :-: | :------: | :--: | :---: | :---------: | :-------------: | :--------------: | :--------------------: |
|  0  |  0  |    1     |  0   |   0   |      0      |        1        |        1         |           1            |
|  0  |  1  |    1     |  0   |   1   |      1      |        1        |        0         |           0            |
|  1  |  0  |    0     |  0   |   1   |      1      |        1        |        0         |           0            |
|  1  |  1  |    0     |  1   |   1   |      0      |        0        |        0         |           1            |

:::

As funções AND (E), OR (OU) e NOT (NÃO) formam uma base funcionalmente
completa. NAND isoladamente e NOR isoladamente também são bases completas: por
exemplo, $\bar A=\overline{AA}$ com NAND, e $AB=\overline{\bar A+\bar B}$ por
De Morgan. XOR representa a desigualdade entre dois bits; XNOR, sua igualdade.

### 3.4.1. Funções de comutação e completude funcional {#sec-switching-functions-completeness}

Para $n$ variáveis, cada uma das $2^n$ combinações de entrada pode receber
independentemente uma saída em $\{0,1\}$; daí a existência de $2^{2^n}$ funções
booleanas. A tabela-verdade define uma função de maneira extensional, ao passo
que uma expressão a define por composição de operações.

<!-- prettier-ignore -->
Um conjunto de conectivos é **funcionalmente completo** quando toda função
booleana finita pode ser expressa usando apenas esses conectivos e variáveis. O
conjunto $\{\neg,\land\}$ é completo porque $A\lor B\equiv\neg(\neg A\land\neg B)$.
O conjunto $\{\neg,\lor\}$ também é completo. A operação NAND, escrita
$A\uparrow B=\overline{AB}$, basta sozinha:

$$
\bar A=A\uparrow A,\qquad
AB=(A\uparrow B)\uparrow(A\uparrow B). \tag{3.16}
$$

Analogamente, a operação NOR $A\downarrow B=\overline{A+B}$ permite construir
$\bar A=A\downarrow A$ e $A+B=(A\downarrow B)\downarrow(A\downarrow B)$. Essas
identidades justificam arquiteturas construídas exclusivamente com uma família
de portas, sem afirmar que tal implementação seja sempre a mais econômica ou
rápida.

### 3.4.2. Precedência e notação {#sec-boolean-notation}

Na ausência de parênteses, adotamos a ordem **complemento, E, OU**. Assim,
$A+BC=A+(B\cdot C)$; já $(A+B)C$ é outra função. A barra deve cobrir exatamente
a expressão negada: $\overline{A+B}$ não é $\bar A+B$. Para implicação e
bicondicional, recomendamos parênteses explícitos; diferentes textos podem
adotar convenções de precedência distintas.

## 3.5. Formas canônicas e síntese a partir de tabelas {#sec-canonical-forms}

Uma função totalmente especificada pode ser descrita por uma **soma de
mintermos** (forma disjuntiva canônica) ou um **produto de maxtermos** (forma
conjuntiva canônica). Cada mintermo contém todas as variáveis uma única vez e
vale 1 em exatamente uma linha da tabela. Cada maxtermo vale 0 em exatamente
uma linha.

### 3.5.1. Mintermos {#sec-minterms}

<!-- prettier-ignore -->
Para três variáveis $a,b,c$, a combinação $010$ corresponde ao mintermo
$\bar a b\bar c$. Sua construção é sistemática: variável negada quando o bit é 0;
variável direta quando é 1. A soma dos mintermos associados às linhas em que a
função vale 1 reproduz exatamente a função.

### 3.5.2. Maxtermos {#sec-maxterms}

<!-- prettier-ignore -->
A mesma combinação $010$ corresponde ao maxtermo $(a+\bar b+c)$: a variável
aparece direta quando o bit é 0 e complementada quando é 1. O produto dos
maxtermos das linhas com saída 0 reproduz a função.

<!-- prettier-ignore -->
::: table Função $T$ e sua complementar para três variáveis {#tbl-canonical-example .full-width}

| $a$ | $b$ | $c$ | $T$ | $\bar T$ |
| :-: | :-: | :-: | :-: | :------: |
|  0  |  0  |  0  |  1  |    0     |
|  0  |  0  |  1  |  0  |    1     |
|  0  |  1  |  0  |  1  |    0     |
|  0  |  1  |  1  |  1  |    0     |
|  1  |  0  |  0  |  0  |    1     |
|  1  |  0  |  1  |  0  |    1     |
|  1  |  1  |  0  |  1  |    0     |
|  1  |  1  |  1  |  1  |    0     |

:::

A função da tabela é

$$
\begin{aligned}
T&=\bar a\bar b\bar c+\bar ab\bar c+\bar abc+ab\bar c+abc\\
 &=\Sigma m(0,2,3,6,7).
\end{aligned} \tag{3.17}
$$

<!-- prettier-ignore -->
Sua complementar é $\bar T=\bar a\bar bc+a\bar b\bar c+a\bar bc=\Sigma m(1,4,5)$.
Pela complementação e por De Morgan:

$$
T=(a+b+\bar c)(\bar a+b+c)(\bar a+b+\bar c)=\Pi M(1,4,5). \tag{3.18}
$$

O índice de cada linha é o valor decimal do vetor binário $abc$. As duas
expressões são diferentes sintaticamente, mas têm a mesma tabela-verdade.

### 3.5.3. Derivação das formas canônicas e unicidade da tabela {#sec-canonical-derivation}

<!-- prettier-ignore -->
Se $\mathbf{x}=(x_1,\ldots,x_n)\in\mathbb B^n$ e
$\boldsymbol\alpha=(\alpha_1,\ldots,\alpha_n)$ é uma combinação fixa, definimos
o mintermo correspondente por

$$
m_{\boldsymbol\alpha}(\mathbf{x})=\prod_{i=1}^{n}
\begin{cases}x_i,&\alpha_i=1,\\\bar x_i,&\alpha_i=0.\end{cases} \tag{3.19}
$$

Esse produto vale 1 exatamente quando $\mathbf{x}=\boldsymbol\alpha$. Assim,
toda função $f:\mathbb B^n\to\mathbb B$ admite a expansão

$$
f(\mathbf{x})=\sum_{\boldsymbol\alpha:\,f(\boldsymbol\alpha)=1}m_{\boldsymbol\alpha}(\mathbf{x}), \tag{3.20}
$$

na qual $\sum$ indica OU booleano e $\prod$ indica E booleano. A construção é
uma demonstração direta da completude de E, OU e NÃO. A forma dual utiliza
maxtermos associados às linhas em que $f=0$.

A tabela-verdade é única para uma função dada e uma ordem fixa das variáveis,
mas suas expressões algébricas não o são. A forma canônica enumera
explicitamente todas as combinações relevantes; uma forma simplificada pode
empregar menos literais ou portas, preservando os mesmos valores para todas as
entradas especificadas.

### 3.5.4. Condições indiferentes {#sec-dont-care}

Em algumas aplicações, determinadas combinações de entrada são impossíveis por
restrições do sistema, ou seu resultado não importa para a especificação. Essas
linhas podem ser indicadas por $X$ (_don't care_). Durante a minimização, podem
ser tratadas como 0 ou 1 para simplificar o circuito. **Não se trata de um
terceiro valor booleano:** o circuito físico ainda produzirá um nível elétrico.
O uso de $X$ exige justificar que a combinação não será relevante no contexto
de operação.

## 3.6. Circuitos lógicos com interruptores {#sec-switching-circuits}

Um interruptor ideal pode estar **aberto** (não conduz) ou **fechado**
(conduz). Para contatos normalmente abertos, convencionamos $a=1$ quando o
contato $a$ está fechado e $a=0$ quando está aberto. Sob alimentação e carga
adequadas, a saída $y=1$ significa existência de caminho condutor entre a fonte
e a carga. Essa é uma abstração de conectividade: resistências, transientes,
arcos e quedas de tensão são desconsiderados.

### 3.6.1. Série representa E {#sec-switch-and}

Dois contatos normalmente abertos em **série** permitem corrente apenas se
ambos estiverem fechados. Logo, $y=a\cdot b=ab$.

<!-- prettier-ignore -->
::: figure Dois contatos em série realizam a operação E {#fig-switch-and}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape,>=stealth]
\draw (0,1)--(1,1); \draw (1,1) circle (.045); \draw (1.7,1) circle (.045);
\draw (1,1)--(1.55,1.28); \draw (1.7,1)--(2.7,1);
\draw (2.7,1) circle (.045); \draw (3.4,1) circle (.045);
\draw (2.7,1)--(3.25,1.28); \draw (3.4,1)--(4.6,1);
\node at (1.35,1.65) {$a$}; \node at (3.05,1.65) {$b$};
\node[left] at (0,1) {$V_{+}$};
\node[right] at (4.6,1) {$a\cdot b$};
\end{tikzpicture}
```

:::

### 3.6.2. Paralelo representa OU {#sec-switch-or}

Dois contatos normalmente abertos em **paralelo** fornecem caminhos
alternativos. Basta que um deles esteja fechado para existir continuidade:
$y=a+b$.

<!-- prettier-ignore -->
::: figure Dois contatos em paralelo realizam a operação OU {#fig-switch-or}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape]
\draw (0,1)--(.8,1)--(.8,1.7)--(1.4,1.7);
\draw (1.4,1.7) circle (.045); \draw (2.1,1.7) circle (.045);
\draw (1.4,1.7)--(1.95,1.98); \draw (2.1,1.7)--(2.8,1.7)--(2.8,1);
\draw (.8,1)--(.8,.3)--(1.4,.3);
\draw (1.4,.3) circle (.045); \draw (2.1,.3) circle (.045);
\draw (1.4,.3)--(1.95,.58); \draw (2.1,.3)--(2.8,.3)--(2.8,1);
\draw (2.8,1)--(3.8,1);
\node at (1.75,2.25) {$a$}; \node at (1.75,.8) {$b$};
\node[left] at (0,1) {$V_{+}$};
\node[right] at (3.8,1) {$a+b$};
\end{tikzpicture}
```

:::

### 3.6.3. Contato normalmente fechado representa complemento {#sec-switch-not}

Um contato **normalmente fechado** comandado pela variável $a$ conduz quando
$a=0$ e interrompe quando $a=1$. Com essa convenção, sua condição de
continuidade é $\bar a$. A palavra _normalmente_ descreve o estado do contato
na ausência de atuação, não um valor lógico universal: é necessário declarar
como a variável representa a atuação.

<!-- prettier-ignore -->
::: figure Contato normalmente fechado como realização de NÃO {#fig-switch-not}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape]
\draw (0,1)--(1.2,1); \draw (1.2,.7)--(1.2,1.3);
\draw (1.8,.7)--(1.8,1.3); \draw (1.2,1.3)--(1.8,.7);
\draw (1.8,1)--(3.1,1);
\node at (1.5,1.65) {$a$};
\node[left] at (0,1) {$V_{+}$};
\node[right] at (3.1,1) {$\bar a$};
\end{tikzpicture}
```

:::

### 3.6.4. Composição de contatos {#sec-switch-composition}

A composição de contatos segue as mesmas regras de formação das expressões
booleanas: um caminho em série corresponde a um produto lógico, enquanto ramos
alternativos em paralelo correspondem a uma soma lógica. A ordem e o
agrupamento dessas associações determinam a função realizada.

As associações em série e em paralelo podem ser compostas recursivamente,
permitindo construir funções mais complexas a partir das operações E e OU. Por
exemplo, $y=ab+c$ corresponde a dois contatos em série em um ramo, ligados em
paralelo com um terceiro contato. A expressão $y=(a+b)c$ corresponde ao
paralelo de $a$ e $b$ seguido de um contato $c$ em série. As expressões são
diferentes: para $(a,b,c)=(0,0,1)$, a primeira fornece $ab+c=1$, enquanto a
segunda fornece $(a+b)c=0$.

<!-- prettier-ignore -->
::: table Correspondência entre operações e contatos {#tbl-switch-correspondence .full-width}

| Operação |     Expressão     | Arranjo de contatos                                                | Condição de condução           |
| :------- | :---------------: | :----------------------------------------------------------------- | :----------------------------- |
| E        |       $ab$        | Normalmente abertos em série                                       | Ambos fechados                 |
| OU       |       $a+b$       | Normalmente abertos em paralelo                                    | Ao menos um fechado            |
| NÃO      |     $\bar a$      | Contato normalmente fechado comandado por $a$                      | $a$ não atuado                 |
| NAND     |  $\overline{ab}$  | Contatos normalmente fechados comandados por $a$ e $b$ em paralelo | Ao menos um comando não atuado |
| NOR      | $\overline{a+b}$  | Contatos normalmente fechados comandados por $a$ e $b$ em série    | Nenhum comando atuado          |
| XOR      | $\bar ab+a\bar b$ | Dois ramos em paralelo, cada um com um contato NA e um NF em série | Exatamente um comando atuado   |
| XNOR     | $ab+\bar a\bar b$ | Dois ramos em paralelo: dois NA em série; dois NF em série         | Comandos iguais                |

:::

A realização por contatos deve considerar a disponibilidade de contatos
complementares do mesmo atuador. Em sistemas reais, contatos mecânicos podem
sofrer _bounce_, desgaste e atrasos; a equivalência descrita é **estática**,
não temporal.

### 3.6.5. Contatos em série e paralelo representam OU exclusivo (XOR) {#sec-switch-xor}

A operação **OU exclusivo (XOR)** pode ser realizada por dois ramos em
paralelo, cada um contendo dois contatos em série: um normalmente aberto (NA) e
outro normalmente fechado (NF). Sua expressão booleana é:

$$
a\oplus b=a\bar b+\bar a b. \tag{3.21}
$$

No primeiro ramo, a condução ocorre quando $a=1$ e $b=0$, enquanto, no segundo,
ocorre quando $a=0$ e $b=1$. Portanto, o circuito apresenta continuidade
elétrica exclusivamente quando as variáveis $a$ e $b$ possuem valores lógicos
diferentes. Os contatos identificados pela mesma variável são comandados pelo
mesmo sinal, mas apresentam estados complementares quando um é normalmente
aberto e o outro normalmente fechado.

<!-- prettier-ignore -->
::: figure Circuito de contatos que realiza a operação OU exclusivo (XOR) {#fig-switch-xor}

```tikz
\begin{tikzpicture}[scale=2.0,transform shape]
% Alimentação e bifurcação
\draw (0,1)--(.8,1);
\draw (.8,.2)--(.8,1.8);

% Ramo superior: a AND NOT b
\draw (.8,1.8)--(1.4,1.8);
\draw (1.4,1.8) circle (.045);
\draw (2.1,1.8) circle (.045);
\draw (1.4,1.8)--(1.95,2.08);
\draw (2.1,1.8)--(2.7,1.8);
\node at (1.75,2.35) {$a$};

% Contato NF comandado por b
\draw (2.7,1.5)--(2.7,2.1);
\draw (3.3,1.5)--(3.3,2.1);
\draw (2.7,2.1)--(3.3,1.5);
\draw (3.3,1.8)--(4.1,1.8);
\node at (3,2.35) {$b$};

% Ramo inferior: NOT a AND b
\draw (.8,.2)--(1.4,.2);
\draw (1.4,-.1)--(1.4,.5);
\draw (2,-.1)--(2,.5);
\draw (1.4,.5)--(2,-.1);
\draw (2,.2)--(2.7,.2);
\node at (1.7,.85) {$a$};

% Contato NA comandado por b
\draw (2.7,.2) circle (.045);
\draw (3.4,.2) circle (.045);
\draw (2.7,.2)--(3.25,.48);
\draw (3.4,.2)--(4.1,.2);
\node at (3.05,.85) {$b$};

% Reunião dos ramos e saída
\draw (4.1,.2)--(4.1,1.8);
\draw (4.1,1)--(5.1,1);

\node[left] at (0,1) {$V_{+}$};
\node[right] at (5.1,1) {$a\oplus b$};
\end{tikzpicture}
```

:::

## 3.7. Portas lógicas e representação de circuitos {#sec-logic-gates}

Uma **porta lógica** é um bloco físico que implementa uma função booleana,
recebendo sinais elétricos interpretados como 0 ou 1. Em lógica positiva, o
nível alto corresponde a 1 e o baixo a 0, respeitadas as faixas de tensão
especificadas pela tecnologia. Portas AND, OR, NOT, NAND, NOR, XOR e XNOR
possuem símbolos convencionais; uma pequena bolha em uma entrada ou saída
indica inversão lógica.


<!-- prettier-ignore -->
::: figure Portas AND, OR e NOT e suas funções {#fig-basic-logic-gates}

```tikz
\usetikzlibrary{circuits.logic.US}

\begin{tikzpicture}[
    gate/.style={
        draw,
        minimum width=1.8cm,
        minimum height=1.6cm,
        inner sep=5pt
    },
    signal/.style={
        font=\Large,
        inner sep=3pt
    },
    gate title/.style={
        font=\Large\bfseries,
        anchor=west
    }
]

% Primeira coluna: portas lógicas
\node[and gate US,gate,logic gate inputs=nn] (gand) at (3,5) {};
\node[or gate US,gate,logic gate inputs=nn] (gor) at (3,2.5) {};
\node[not gate US,gate] (gnot) at (3,0) {};

% Porta AND
\draw (gand.input 1) -- ++(-1.2,0)
    node[left,signal] {$a$};
\draw (gand.input 2) -- ++(-1.2,0)
    node[left,signal] {$b$};
\draw (gand.output) -- ++(1.2,0)
    node[right,signal] {$ab$};

% Porta OR
\draw (gor.input 1) -- ++(-1.2,0)
    node[left,signal] {$a$};
\draw (gor.input 2) -- ++(-1.2,0)
    node[left,signal] {$b$};
\draw (gor.output) -- ++(1.2,0)
    node[right,signal] {$a+b$};

% Porta NOT
\draw (gnot.input) -- ++(-1.2,0)
    node[left,signal] {$a$};
\draw (gnot.output) -- ++(1.2,0)
    node[right,signal] {$\bar a$};

% Segunda coluna: identificação das portas
\node[gate title] at (8.0,5) {AND};
\node[gate title] at (8.0,2.5) {OR};
\node[gate title] at (8.0,0) {NOT};

\end{tikzpicture}
```

:::

### 3.7.1. Correspondência entre contatos e portas {#sec-gates-and-switches}

Um conjunto de contatos em série e uma porta AND têm a mesma **tabela
funcional** quando as entradas representam as mesmas condições. Contudo, a
porta eletrônica não é necessariamente composta por interruptores mecânicos
ligados em série; sua implementação interna pode utilizar redes de
transistores, inversões intermediárias e outras topologias. Analogamente, o
arranjo paralelo de contatos e a porta OR são equivalentes em lógica, mas não
em constituição física.

A implementação de $y=ab+c$ por portas é uma AND alimentando uma OR juntamente
com $c$. A mesma função pode ser implementada com NAND e inversões adequadas.
Essa transformação preserva a tabela-verdade, mas pode alterar número de
componentes, fan-out, consumo, atraso e riscos de transição.


<!-- prettier-ignore -->
::: figure Realização por portas da função $y=ab+c$ {#fig-gates-sop-example}

```tikz
\usetikzlibrary{circuits.logic.US}

\begin{tikzpicture}[
    gate/.style={
        draw,
        minimum width=1.8cm,
        minimum height=1.6cm,
        inner sep=5pt
    },
    signal/.style={
        font=\Large,
        inner sep=3pt
    }
]

% Portas lógicas
\node[and gate US,gate,logic gate inputs=nn] (g1) at (2,3) {};
\node[or gate US,gate,logic gate inputs=nn] (g2) at (6,1.5) {};

% Entradas da porta AND
\draw (g1.input 1) -- ++(-1.2,0)
    node[left,signal] {$a$};

\draw (g1.input 2) -- ++(-1.2,0)
    node[left,signal] {$b$};

% Ligação ortogonal entre AND e OR
\draw (g1.output) -- ++(1.0,0)
    |- (g2.input 1);

% Segunda entrada da porta OR
\draw (g2.input 2) -- ++(-1.2,0)
    node[left,signal] {$c$};

% Saída da porta OR
\draw (g2.output) -- ++(1.2,0)
    node[right,signal] {$y$};

\end{tikzpicture}
```

:::

### 3.7.2. Universalidade e limitações físicas {#sec-gate-universality}

As identidades de De Morgan permitem realizar qualquer função booleana apenas
com NAND ou apenas com NOR, pois cada uma dessas famílias permite obter
negação, conjunção e disjunção. A possibilidade matemática não elimina limites
físicos: tensões de entrada, margens de ruído, atrasos de propagação, potência
dissipada, correntes de saída e temporização precisam ser avaliados no projeto
eletrônico.

### 3.7.3. Implementação física e limites da equivalência {#sec-physical-logic-limits}

Na eletrônica digital, uma entrada não recebe literalmente o número abstrato
$0$ ou $1$, mas uma grandeza elétrica interpretada por faixas de tensão. Para
uma tecnologia dada, os intervalos garantidos de entrada baixa e alta devem ser
compatíveis com os níveis de saída dos estágios precedentes. Tensões
intermediárias não autorizam, por si sós, a atribuição de um terceiro valor da
álgebra booleana clássica.

A **equivalência combinacional** compara as saídas de duas redes para todas as
combinações de entradas estáveis. Ela não implica equivalência temporal:
diferentes trajetórias internas podem gerar pulsos transitórios (_hazards_)
durante mudanças de entrada, mesmo quando a tabela-verdade final é idêntica.
Atrasos de propagação, carga capacitiva, fan-out e margens de ruído pertencem
ao domínio da implementação física e precisam ser tratados separadamente.

A representação por contatos é especialmente útil para interpretar condições de
habilitação e intertravamento, mas um contato normalmente fechado não
constitui, por si só, um inversor eletrônico de sinais arbitrários. Sua
interpretação booleana depende de uma variável de comando e da hipótese de
funcionamento ideal dos contatos.

## 3.8. Equivalência das representações {#sec-equivalence-of-representations}

A relação entre as seis representações pode ser formalizada escolhendo um
universo de estados $\Omega$ e duas condições $A$ e $B$. Os conjuntos
$S_A,S_B\subseteq\Omega$ contêm os estados em que cada condição é verdadeira.
Suas funções características produzem os bits $a=\chi_{S_A}(\omega)$ e
$b=\chi_{S_B}(\omega)$. A lógica proposicional combina as condições por
conectivos; a álgebra booleana combina seus bits; os contatos e portas realizam
a mesma tabela sob as convenções físicas declaradas.

<!-- prettier-ignore -->
::: table Equivalência entre conjuntos, proposições, álgebra e circuitos {#tbl-representation-equivalence .full-width}

| Relação      | Conjuntos                    | Lógica proposicional | Álgebra booleana  | Contatos             | Portas |
| :----------- | :--------------------------- | :------------------- | :---------------- | :------------------- | :----- |
| E            | $A\cap B$                    | $P\land Q$           | $AB$              | NA em série          | AND    |
| OU inclusivo | $A\cup B$                    | $P\lor Q$            | $A+B$             | NA em paralelo       | OR     |
| NÃO          | $A^c$                        | $\neg P$             | $\bar A$          | NF                   | NOT    |
| OU exclusivo | $A\triangle B$               | $P\oplus Q$          | $\bar AB+A\bar B$ | Ramos NA/NF cruzados | XOR    |
| Equivalência | $(A\cap B)\cup(A^c\cap B^c)$ | $P\leftrightarrow Q$ | $AB+\bar A\bar B$ | Ramos NA/NA e NF/NF  | XNOR   |
| NÃO E        | $(A\cap B)^c$                | $\neg(P\land Q)$     | $\overline{AB}$   | NF em paralelo       | NAND   |
| NÃO OU       | $(A\cup B)^c$                | $\neg(P\lor Q)$      | $\overline{A+B}$  | NF em série          | NOR    |

:::

A {@ref fig-logic-representations} apresenta uma comparação integrada de seis
formas de representação das operações E, OU, OU exclusivo e NÃO: diagramas de
Venn, tabelas-verdade proposicionais, tabelas booleanas, redes de contatos,
portas lógicas e expressões de programação. Em cada linha, a função de verdade
é a mesma, embora os objetos representados, os símbolos e as hipóteses de
realização sejam diferentes. Na coluna de contatos, a continuidade depende dos
estados dos contatos normalmente abertos e normalmente fechados; na de portas,
a função corresponde à relação lógica entre níveis de entrada e saída, em
regime estável.

<!-- prettier-ignore -->
::: figure Correspondência entre operações de conjuntos, lógica proposicional, álgebra booleana, circuitos com contatos, circuitos digitais e programação {#fig-logic-representations}

```tikz
\usetikzlibrary{circuits.logic.US,calc}
\begin{tikzpicture}[
    scale=1.5,
    transform shape,
    >=stealth,
    font=\small,
    line cap=round
]

% ==================================================
% GEOMETRIA GERAL
% ==================================================

\def\colA{0}
\def\colB{4.35}
\def\colC{8.70}
\def\colD{13.95}
\def\colE{18.60}
\def\colF{22.95}

\def\rowA{-2.4}
\def\rowB{-6.0}
\def\rowC{-10.05}
\def\rowCRep{-10.50} % Representacoes XOR 0.45 abaixo dos titulos
\def\rowD{-14.15}

% Limites compactos: pequena margem esquerda e altura adicional para as linhas XOR e NOT.
\useasboundingbox (-1.40,-16.00) rectangle (25.1,0.65);

% ==================================================
% CABEÇALHOS
% ==================================================

\node[align=center,font=\bfseries\small]
    at (\colA,0)
    {Diagrama de Venn\\(Conjuntos)};

\node[align=center,font=\bfseries\small]
    at (\colB,0)
    {Tabela-verdade\\(Lógica proposicional)};

\node[align=center,font=\bfseries\small]
    at (\colC,0)
    {Operação binária\\(Álgebra booleana)};

\node[align=center,font=\bfseries\small]
    at (\colD,0)
    {Bloco lógico\\(Circuitos com contatos)};

\node[align=center,font=\bfseries\small]
    at (\colE,0)
    {Bloco lógico\\(Circuitos digitais)};

\node[align=center,font=\bfseries\small]
    at (\colF,0)
    {Operação lógica\\(Programação)};

% ==================================================
% TÍTULOS DAS OPERAÇÕES
% ==================================================

% AND
\node[font=\bfseries] at (\colA,\rowA+1.15) {Interseção};
\node[font=\bfseries] at (\colB,\rowA+1.15) {Conjunção};
\node[font=\bfseries] at (\colC,\rowA+1.15) {E};
\node[font=\bfseries] at (\colD,\rowA+1.15) {AND};
\node[font=\bfseries] at (\colE,\rowA+1.15) {AND};
\node[font=\bfseries] at (\colF,\rowA+1.15) {AND};

% OR
\node[font=\bfseries] at (\colA,\rowB+1.15) {União};
\node[font=\bfseries] at (\colB,\rowB+1.15) {Disjunção};
\node[font=\bfseries] at (\colC,\rowB+1.15) {OU};
\node[font=\bfseries] at (\colD,\rowB+1.15) {OR};
\node[font=\bfseries] at (\colE,\rowB+1.15) {OR};
\node[font=\bfseries] at (\colF,\rowB+1.15) {OR};

% XOR
\node[align=center,font=\bfseries]
    at (\colA,\rowC+1.15)
    {Diferença\\simétrica};

\node[align=center,font=\bfseries]
    at (\colB,\rowC+1.15)
    {Disjunção\\exclusiva};

\node[align=center,font=\bfseries]
    at (\colC,\rowC+1.15)
    {OU\\exclusivo};

\node[font=\bfseries] at (\colD,\rowC+1.15) {XOR};
\node[font=\bfseries] at (\colE,\rowC+1.15) {XOR};
\node[font=\bfseries] at (\colF,\rowC+1.15) {XOR};

% NOT
\node[font=\bfseries] at (\colA,\rowD+1.15) {Complemento};
\node[font=\bfseries] at (\colB,\rowD+1.15) {Negação};
\node[font=\bfseries] at (\colC,\rowD+1.15) {NÃO};
\node[font=\bfseries] at (\colD,\rowD+1.15) {NOT};
\node[font=\bfseries] at (\colE,\rowD+1.15) {NOT};
\node[font=\bfseries] at (\colF,\rowD+1.15) {NOT};

% ==================================================
% COLUNA 1 — DIAGRAMAS DE VENN
% ==================================================

% Interseção
\begin{scope}[shift={(\colA,\rowA)}]
    \node at (0,0.55) {$A\cap B$};

    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \begin{scope}
        \clip (-0.42,-0.55) circle (0.65);
        \fill[gray!60] (0.42,-0.55) circle (0.65);
    \end{scope}

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% União
\begin{scope}[shift={(\colA,\rowB)}]
    \node at (0,0.55) {$A\cup B$};

    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \fill[gray!60] (-0.42,-0.55) circle (0.65);
    \fill[gray!60] (0.42,-0.55) circle (0.65);

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% Diferença simétrica
\begin{scope}[shift={(\colA,\rowCRep)}]
    \node at (0,0.55) {$(A\cup B)-(A\cap B)$};

    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \fill[gray!60] (-0.42,-0.55) circle (0.65);
    \fill[gray!60] (0.42,-0.55) circle (0.65);

    \begin{scope}
        \clip (-0.42,-0.55) circle (0.65);
        \fill[white] (0.42,-0.55) circle (0.65);
    \end{scope}

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% Complemento
\begin{scope}[shift={(\colA,\rowD)}]
    \node at (0,0.55) {$\overline A$};

    \fill[gray!60] (-1.25,-1.45) rectangle (1.25,0.30);
    \draw (-1.25,-1.45) rectangle (1.25,0.30);

    \fill[white] (-0.42,-0.55) circle (0.65);

    \draw (-0.42,-0.55) circle (0.65);
    \draw (0.42,-0.55) circle (0.65);

    \node at (-0.75,-0.55) {$A$};
    \node at (0.75,-0.55) {$B$};
\end{scope}

% ==================================================
% COLUNA 2 — LÓGICA PROPOSICIONAL
% ==================================================

% Tabelas ampliadas horizontalmente
\foreach \y in {\rowA,\rowB,\rowCRep}{
    \begin{scope}[shift={(\colB,\y-0.55)}]
        \draw (-1.35,-0.9) rectangle (1.35,0.9);
        \draw (-0.45,-0.9) -- (-0.45,0.9);
        \draw (0.45,-0.9) -- (0.45,0.9);

        \foreach \yy in {-0.54,-0.18,0.18,0.54}
            \draw (-1.35,\yy) -- (1.35,\yy);

        \fill[gray!25] (-1.35,0.54) rectangle (1.35,0.9);

        \node at (-0.90,0.72) {$a$};
        \node at (0,0.72) {$b$};

        \node at (-0.90,0.36) {F};
        \node at (0,0.36) {F};

        \node at (-0.90,0) {F};
        \node at (0,0) {V};

        \node at (-0.90,-0.36) {V};
        \node at (0,-0.36) {F};

        \node at (-0.90,-0.72) {V};
        \node at (0,-0.72) {V};
    \end{scope}
}

% AND
\begin{scope}[shift={(\colB,\rowA-0.55)}]
    \node at (0.90,0.72) {$a\land b$};
    \node at (0.90,0.36) {F};
    \node at (0.90,0) {F};
    \node at (0.90,-0.36) {F};
    \node at (0.90,-0.72) {V};
\end{scope}

% OR
\begin{scope}[shift={(\colB,\rowB-0.55)}]
    \node at (0.90,0.72) {$a\lor b$};
    \node at (0.90,0.36) {F};
    \node at (0.90,0) {V};
    \node at (0.90,-0.36) {V};
    \node at (0.90,-0.72) {V};
\end{scope}

% XOR — disjunção sublinhada
\begin{scope}[shift={(\colB,\rowCRep-0.55)}]
    \node at (0.90,0.72) {$a\underline{\lor}b$};
    \node at (0.90,0.36) {F};
    \node at (0.90,0) {V};
    \node at (0.90,-0.36) {V};
    \node at (0.90,-0.72) {F};
\end{scope}

% NOT
\begin{scope}[shift={(\colB,\rowD-0.55)}]
    \draw (-0.85,-0.50) rectangle (0.85,0.50);
    \draw (0,-0.50) -- (0,0.50);
    \draw (-0.85,0.16) -- (0.85,0.16);

    \fill[gray!25] (-0.85,0.16) rectangle (0.85,0.50);

    \node at (-0.425,0.33) {$a$};
    \node at (0.425,0.33) {$\neg a$};

    \node at (-0.425,-0.02) {F};
    \node at (0.425,-0.02) {V};

    \node at (-0.425,-0.33) {V};
    \node at (0.425,-0.33) {F};
\end{scope}

% ==================================================
% COLUNA 3 — ÁLGEBRA BOOLEANA
% ==================================================

\foreach \y in {\rowA,\rowB,\rowCRep}{
    \begin{scope}[shift={(\colC,\y-0.55)}]
        \draw (-1.35,-0.9) rectangle (1.35,0.9);
        \draw (-0.45,-0.9) -- (-0.45,0.9);
        \draw (0.45,-0.9) -- (0.45,0.9);

        \foreach \yy in {-0.54,-0.18,0.18,0.54}
            \draw (-1.35,\yy) -- (1.35,\yy);

        \fill[gray!25] (-1.35,0.54) rectangle (1.35,0.9);

        \node at (-0.90,0.72) {$a$};
        \node at (0,0.72) {$b$};

        \node at (-0.90,0.36) {0};
        \node at (0,0.36) {0};

        \node at (-0.90,0) {0};
        \node at (0,0) {1};

        \node at (-0.90,-0.36) {1};
        \node at (0,-0.36) {0};

        \node at (-0.90,-0.72) {1};
        \node at (0,-0.72) {1};
    \end{scope}
}

% AND
\begin{scope}[shift={(\colC,\rowA-0.55)}]
    \node at (0.90,0.72) {$a\cdot b$};
    \node at (0.90,0.36) {0};
    \node at (0.90,0) {0};
    \node at (0.90,-0.36) {0};
    \node at (0.90,-0.72) {1};
\end{scope}

% OR
\begin{scope}[shift={(\colC,\rowB-0.55)}]
    \node at (0.90,0.72) {$a+b$};
    \node at (0.90,0.36) {0};
    \node at (0.90,0) {1};
    \node at (0.90,-0.36) {1};
    \node at (0.90,-0.72) {1};
\end{scope}

% XOR
\begin{scope}[shift={(\colC,\rowCRep-0.55)}]
    \node at (0.90,0.72) {$a\oplus b$};
    \node at (0.90,0.36) {0};
    \node at (0.90,0) {1};
    \node at (0.90,-0.36) {1};
    \node at (0.90,-0.72) {0};
\end{scope}

% NOT
\begin{scope}[shift={(\colC,\rowD-0.55)}]
    \draw (-0.85,-0.50) rectangle (0.85,0.50);
    \draw (0,-0.50) -- (0,0.50);
    \draw (-0.85,0.16) -- (0.85,0.16);

    \fill[gray!25] (-0.85,0.16) rectangle (0.85,0.50);

    \node at (-0.425,0.33) {$a$};
    \node at (0.425,0.33) {$\overline a$};

    \node at (-0.425,-0.02) {0};
    \node at (0.425,-0.02) {1};

    \node at (-0.425,-0.33) {1};
    \node at (0.425,-0.33) {0};
\end{scope}

% ==================================================
% COLUNA 4 — CIRCUITOS COM CONTATOS
% Contatos NA e NF conforme logic-circuits-with-contacts.md.
% Circuitos ampliados, com rotulos em tamanho equivalente aos das portas.
% Espaco adicional entre algebra e contatos; demais intervalos mantidos.
% ==================================================

% AND: contatos normalmente abertos em série
\begin{scope}[shift={(\colD,\rowA-0.55)},scale=0.91]
    \draw (-2.25,0)--(-1.55,0);
    \draw (-1.55,0) circle (.045); \draw (-.85,0) circle (.045);
    \draw (-1.55,0)--(-1.0,.28); \draw (-.85,0)--(.05,0);
    \draw (.05,0) circle (.045); \draw (.75,0) circle (.045);
    \draw (.05,0)--(.60,.28); \draw (.75,0)--(1.45,0);
    \node at (-1.2,.55) {$a$}; \node at (.4,.55) {$b$};
    \node[left] at (-2.25,0) {$V_{+}$};
    \node[right] at (1.45,0) {$a\cdot b$};
\end{scope}

% OR: contatos normalmente abertos em paralelo
\begin{scope}[shift={(\colD,\rowB-0.55)},scale=0.91]
    \draw (-2.1,0)--(-1.55,0);
    \draw (-1.55,-.75)--(-1.55,.75);
    \draw (-1.55,.75)--(-.95,.75);
    \draw (-.95,.75) circle (.045); \draw (-.25,.75) circle (.045);
    \draw (-.95,.75)--(-.4,1.03); \draw (-.25,.75)--(.55,.75);
    \draw (-1.55,-.75)--(-.95,-.75);
    \draw (-.95,-.75) circle (.045); \draw (-.25,-.75) circle (.045);
    \draw (-.95,-.75)--(-.4,-.47); \draw (-.25,-.75)--(.55,-.75);
    \draw (.55,-.75)--(.55,.75); \draw (.55,0)--(1.25,0);
    \node at (-.60,1.35) {$a$}; \node at (-.60,-.15) {$b$};
    \node[left] at (-2.1,0) {$V_{+}$};
    \node[right] at (1.25,0) {$a+b$};
\end{scope}

% XOR: dois ramos paralelos, NA/NF e NF/NA
\begin{scope}[shift={(\colD,\rowCRep-0.55)},scale=1.05]
    \draw (-2.7,0)--(-2.2,0); \draw (-2.2,-.8)--(-2.2,.8);
    % Ramo superior: a NA, b NF
    \draw (-2.2,.8)--(-1.7,.8);
    \draw (-1.7,.8) circle (.045); \draw (-1.0,.8) circle (.045);
    \draw (-1.7,.8)--(-1.15,1.08); \draw (-1.0,.8)--(-.5,.8);
    \draw (-.5,.5)--(-.5,1.1); \draw (.1,.5)--(.1,1.1);
    \draw (-.5,1.1)--(.1,.5); \draw (.1,.8)--(.8,.8);
    \node at (-1.35,1.35) {$a$}; \node at (-.2,1.35) {$b$};
    % Ramo inferior: a NF, b NA
    \draw (-2.2,-.8)--(-1.7,-.8);
    \draw (-1.7,-1.1)--(-1.7,-.5);
    \draw (-1.1,-1.1)--(-1.1,-.5);
    \draw (-1.7,-.5)--(-1.1,-1.1); \draw (-1.1,-.8)--(-.5,-.8);
    \draw (-.5,-.8) circle (.045); \draw (.2,-.8) circle (.045);
    \draw (-.5,-.8)--(.05,-.52); \draw (.2,-.8)--(.8,-.8);
    \node at (-1.4,-.25) {$a$}; \node at (-.15,-.25) {$b$};
    \draw (.8,-.8)--(.8,.8); \draw (.8,0)--(1.5,0);
    \node[left] at (-2.7,0) {$V_{+}$};
    \node[right] at (1.5,0) {$a\oplus b$};
\end{scope}

% NOT: contato normalmente fechado
\begin{scope}[shift={(\colD,\rowD-0.55)},scale=1.05]
    \draw (-1.65,0)--(-.55,0);
    \draw (-.55,-.3)--(-.55,.3);
    \draw (.05,-.3)--(.05,.3);
    \draw (-.55,.3)--(.05,-.3);
    \draw (.05,0)--(1.2,0);
    \node at (-.25,.65) {$a$};
    \node[left] at (-1.65,0) {$V_{+}$};
    \node[right] at (1.2,0) {$\overline a$};
\end{scope}

% ==================================================
% COLUNA 5 — PORTAS LÓGICAS (REDUZIDAS)
% ==================================================

% AND
\begin{scope}[shift={(\colE,\rowA-0.55)}]
    \node[and gate US,draw,logic gate inputs=nn,
          scale=1.65,transform shape] (g) at (0,0) {};

    \draw (g.input 1) -- ++(-0.65,0)
        node[left] {$a$};
    \draw (g.input 2) -- ++(-0.65,0)
        node[left] {$b$};

    \draw (g.output) -- ++(0.22,0)
        node[right] {$a\cdot b$};
\end{scope}

% OR
\begin{scope}[shift={(\colE,\rowB-0.55)}]
    \node[or gate US,draw,logic gate inputs=nn,
          scale=1.65,transform shape] (g) at (0,0) {};

    \draw (g.input 1) -- ++(-0.65,0)
        node[left] {$a$};
    \draw (g.input 2) -- ++(-0.65,0)
        node[left] {$b$};

    \draw (g.output) -- ++(0.22,0)
        node[right] {$a+b$};
\end{scope}

% XOR
\begin{scope}[shift={(\colE,\rowCRep-0.55)}]
    \node[xor gate US,draw,logic gate inputs=nn,
          scale=1.65,transform shape] (g) at (0,0) {};

    \draw (g.input 1) -- ++(-0.65,0)
        node[left] {$a$};
    \draw (g.input 2) -- ++(-0.65,0)
        node[left] {$b$};

    \draw (g.output) -- ++(0.22,0)
        node[right] {$a\oplus b$};
\end{scope}

% NOT
\begin{scope}[shift={(\colE,\rowD-0.55)}]
    \node[not gate US,draw,
          scale=1.65,transform shape] (g) at (0,0) {};

    \draw (g.input) -- ++(-0.65,0)
        node[left] {$a$};

    \draw (g.output) -- ++(0.22,0)
        node[right] {$\overline a$};
\end{scope}

% ==================================================
% COLUNA 6 — LINGUAGEM DE PROGRAMAÇÃO
% ==================================================

\node[font=\ttfamily\large]
    at (\colF,\rowA-0.55)
    {a \& b};

\node[font=\ttfamily\large]
    at (\colF,\rowB-0.55)
    {a | b};

\node[font=\ttfamily\small]
    at (\colF,\rowCRep-0.55)
    {(a \& !b) | (!a \& b)};

\node[font=\ttfamily\large]
    at (\colF,\rowD-0.55)
    {!a};

\end{tikzpicture}
```

:::

A figura deve ser lida horizontalmente: cada linha fixa uma operação e cada
coluna oferece uma interpretação particular. A comparação permite verificar,
por exemplo, que a diferença simétrica entre conjuntos, a disjunção exclusiva
de proposições, a expressão $a\oplus b$, os dois ramos de contatos NA/NF e a
porta XOR descrevem a mesma condição de desigualdade entre dois valores
binários. Os símbolos empregados na coluna de programação representam uma
convenção de operadores que precisa ser interpretada no contexto da linguagem e
dos tipos de dados; não se deve confundir automaticamente operações bit a bit e
operações lógicas de curto-circuito.

A correspondência não é identidade literal de objetos: um conjunto não é uma
proposição, e uma porta não é uma fórmula. O que se preserva é a **estrutura
das operações** e, no modelo binário, a **função de verdade**. Também é
necessário distinguir $A\subseteq B$ (inclusão de conjuntos), $P\models Q$
(consequência lógica) e $a\le b$ (ordem booleana): são relações correspondentes
quando interpretadas no modelo apropriado.

### 3.8.1. Uma equivalência formal entre as representações {#sec-five-representations-proof}

Seja $\Omega$ um universo de estados e sejam $S_A,S_B\subseteq\Omega$ os
conjuntos de estados em que duas condições são satisfeitas. Para cada
$\omega\in\Omega$, escrevemos $a=\chi_{S_A}(\omega)$ e $b=\chi_{S_B}(\omega)$.
Considere a condição "A ocorre e B não ocorre". Suas representações são:

- **Conjuntos:** $S_A\cap S_B^c$.
- **Proposições:** $P\land\neg Q$.
- **Álgebra binária:** $a\bar b$.
- **Contatos:** contato normalmente aberto comandado por $a$ em série com
  contato normalmente fechado comandado por $b$.
- **Portas:** saída de uma porta NOT aplicada a $b$, combinada com $a$ em uma
  porta AND.

Para todo $\omega$, vale

$$
\chi_{S_A\cap S_B^c}(\omega)
=\chi_{S_A}(\omega)\bigl(1-\chi_{S_B}(\omega)\bigr)
=a\bar b. \tag{3.22}
$$

A identidade demonstra que as representações têm a mesma condição de ativação
no modelo estático. A equivalência é verificada ponto a ponto, e não apenas por
semelhança visual entre os desenhos. Se $A$ e $B$ forem sinais físicos, a
correspondência ainda pressupõe a codificação consistente dos estados e o
comportamento ideal dos dispositivos.

### 3.8.2. Exemplo integrador: habilitação de uma carga {#sec-integrated-example}

Considere uma carga que deve ser acionada se houver solicitação $s$ e
autorização $h$, ou se o teste manual $t$ estiver ativo. A especificação verbal
é “($s$ e $h$) ou $t$”. Sua fórmula proposicional é $(s\land h)\lor t$, e sua
expressão booleana é $y=sh+t$. Na representação por conjuntos de estados,
$S_y=(S_s\cap S_h)\cup S_t$. Em contatos, dois contatos NA $s,h$ em série
formam um ramo paralelo a um contato NA $t$. Em portas, uma AND recebe $s,h$ e
alimenta uma OR com $t$.

<!-- prettier-ignore -->
::: table Tabela-verdade da habilitação $y=sh+t$ {#tbl-integrated-example .full-width}

| $s$ | $h$ | $t$ | $sh$ | $y$ |
| :-: | :-: | :-: | :--: | :-: |
|  0  |  0  |  0  |  0   |  0  |
|  0  |  0  |  1  |  0   |  1  |
|  0  |  1  |  0  |  0   |  0  |
|  0  |  1  |  1  |  0   |  1  |
|  1  |  0  |  0  |  0   |  0  |
|  1  |  0  |  1  |  0   |  1  |
|  1  |  1  |  0  |  1   |  1  |
|  1  |  1  |  1  |  1   |  1  |

:::

A tabela é a especificação funcional comum a todas as representações. Se a
implementação tiver um botão de teste que **não** deve contornar a autorização
$h$, a função correta será $y=(s+t)h$, que é diferente: a escolha de uma
expressão lógica tem consequências diretas para o comportamento e a segurança
do sistema.

## 3.9. Síntese conceitual e fronteiras do modelo {#sec-model-limits}

O encadeamento estudado pode ser resumido como **conjuntos de estados →
condições proposicionais → funções booleanas → redes de contatos ou portas**.
Cada seta exige uma interpretação: universo e pertencimento, valoração das
proposições, codificação de verdadeiro/falso como 1/0, convenção de atuação dos
contatos e definição dos níveis elétricos. Com essas hipóteses, as
tabelas-verdade permitem verificar equivalências de maneira independente da
implementação.

Em aplicações reais, a lógica combinacional estática não descreve memória,
temporização, transições simultâneas, estados metastáveis ou falhas. Uma função
booleana estabelece qual deve ser o resultado para entradas estáveis; não
determina automaticamente quando a saída muda. Esses temas serão retomados nos
capítulos sobre portas, circuitos sequenciais e temporização.

### 3.9.1. Limites de expressividade e extensões da lógica {#sec-logic-expressivity}

A lógica proposicional descreve combinações de proposições tomadas como
unidades indivisíveis. Ela não expressa internamente quantificações como "para
todo componente" ou "existe um caminho", que requerem linguagens mais
expressivas, como a lógica de predicados. A teoria dos conjuntos, por sua vez,
pode representar conjuntos de estados ou objetos, mas sua relação com circuitos
depende da escolha explícita de predicados e funções características.

A álgebra booleana clássica também não modela diretamente o tempo. Para
descrever armazenamento, transições de estado e protocolos digitais,
acrescentam-se variáveis de estado, relações de transição e modelos temporais.
A separação entre lógica combinacional, dinâmica elétrica e comportamento
sequencial evita atribuir às identidades algébricas propriedades que elas não
garantem.

## Síntese do capítulo {#sec-boolean-chapter-summary}

A união, a interseção e o complemento de conjuntos correspondem à disjunção, à
conjunção e à negação de proposições quando se consideram os conjuntos de
estados que satisfazem as condições. A álgebra de Boole axiomatiza essas
operações; sua versão binária fundamenta tabelas-verdade e funções digitais.
Contatos em série, em paralelo e normalmente fechados realizam, sob convenções
explícitas, E, OU e NÃO; portas lógicas implementam eletronicamente as mesmas
funções. As formas canônicas permitem passar da tabela à expressão, e as
identidades permitem transformar expressões sem modificar seu significado
funcional.

## Referências bibliográficas {#sec-boolean-chapter-references}

1. MANO, M. Morris; CILETTI, Michael D. **Digital Design**. 6. ed.
   Pearson, 2018.
2. FLOYD, Thomas L. **Digital Fundamentals**. 11. ed. Pearson, 2015.
3. TOCCI, Ronald J.; WIDMER, Neal S.; MOSS, Gregory L. **Digital Systems:
   Principles and Applications**. 12. ed. Pearson, 2017.
4. HARRIS, David Money; HARRIS, Sarah L. **Digital Design and Computer
   Architecture**. 2. ed. Morgan Kaufmann, 2012.
5. HUTH, Michael; RYAN, Mark. **Logic in Computer Science: Modelling and
   Reasoning about Systems**. 2. ed. Cambridge University Press, 2004.
6. EPP, Susanna S. **Discrete Mathematics with Applications**. 5. ed. Cengage
   Learning, 2020.
7. ROSEN, Kenneth H. **Discrete Mathematics and Its Applications**. 8. ed.
   McGraw-Hill Education, 2019.
8. WAKERLY, John F. **Digital Design: Principles and Practices**. 5. ed.
   Pearson, 2018.
