/**
 * Vorlesung 5: Einige Grundlagen aus der linearen Algebra
 */
import { box, exercise, lead, proof, tx, widget } from './blocks.js';

const vektornormen = {
  id: 'vektornormen',
  title: '5.1 Normen für Vektoren',
  body: tx`
    ${lead(`Fehlerabschätzungen brauchen ein Maß für „Größe“. Für Zahlen ist das der Betrag, für Vektoren die Norm – und davon gibt
      es viele.`)}
    <p>Vorausgesetzt werden die Grundbegriffe der linearen Algebra (Vektorraum, Basis, lineare Abbildung, Rang, Determinante, Inverse).
      Wir betrachten nur $V = \K^n$ mit $\K = \R$ oder $\C$.</p>
    ${box('definition', '5.1 (Norm)', tx`Eine Abbildung $\|\cdot\|: V \to \R_0^+$ heißt <strong>Norm</strong>, falls
      $$\begin{aligned}
        \|x\| &> 0 \quad (x \neq 0) && \text{(Definitheit)},\\
        \|\alpha x\| &= |\alpha|\,\|x\| && \text{(positive Homogenität)},\\
        \|x + y\| &\le \|x\| + \|y\| && \text{(Dreiecksungleichung)}.
      \end{aligned}$$`)}
    ${box('beispiel', '5.2', tx`$$\|x\|_2 = \Bigl(\sum_{i=1}^n |x_i|^2\Bigr)^{1/2} \text{ (euklidisch)}, \qquad
      \|x\|_1 = \sum_{i=1}^n |x_i|, \qquad \|x\|_\infty = \max_{i} |x_i| \text{ (Maximumnorm)}.$$`)}
    ${widget('unit-balls', {}, tx`Die „Einheitskugel“ $\{x : \|x\| = 1\}$ sieht für jede Norm anders aus. Für allgemeines $p$ ist $\|x\|_p = (\sum |x_i|^p)^{1/p}$.`)}

    <h3>Konvergenz</h3>
    <p>Mit einer Norm überträgt sich der Konvergenzbegriff auf Vektorfolgen: $x^{(k)} \to x$, falls $\|x - x^{(k)}\| \to 0$.
      Eine <strong>Cauchy-Folge</strong> erfüllt $\forall \epsilon > 0\; \exists N\; \forall k, l \ge N: \|x^{(k)} - x^{(l)}\| < \epsilon$ –
      dafür muss man den Grenzwert nicht kennen. $V$ heißt <strong>vollständig</strong>, wenn jede Cauchy-Folge konvergiert; $\K^n$ ist vollständig.</p>
    ${box('lemma', '5.3 (Inverse Dreiecksungleichung)', tx`Für alle $x, y \in V$ gilt $\|x - y\| \ge \bigl|\|x\| - \|y\|\bigr|$.
      ${proof(tx`$\|x\| = \|x - y + y\| \le \|x - y\| + \|y\|$, also $\|x - y\| \ge \|x\| - \|y\|$. Vertauschen von $x$ und $y$ liefert
        $\|x - y\| \ge -(\|x\| - \|y\|)$.`)}`)}
    <p>Daraus folgt die Stetigkeit der Norm: $x^{(k)} \to x \Rightarrow \|x^{(k)}\| \to \|x\|$.</p>
    ${box('satz', '5.4 (Äquivalenz aller Normen)', tx`Auf $\K^n$ sind alle Normen äquivalent: Zu je zwei Normen $\|\cdot\|, \|\cdot\|'$ gibt es $m, M > 0$ mit
      $$m\|x\|' \le \|x\| \le M\|x\|' \qquad \forall x \in \K^n.$$
      ${proof(tx`Es genügt der Vergleich mit $\|\cdot\|_\infty$. Die Menge $S = \{x : \|x\|_\infty = 1\}$ ist beschränkt und abgeschlossen, also nimmt die
        stetige Funktion $\|\cdot\|$ auf $S$ Minimum und Maximum an: $0 < \|x_\text{min}\| \le \|x\| \le \|x_\text{max}\|$ für $x \in S$.
        Für beliebiges $x \neq 0$ liegt $x/\|x\|_\infty$ in $S$, also $\|x_\text{min}\|\,\|x\|_\infty \le \|x\| \le \|x_\text{max}\|\,\|x\|_\infty$.`)}`)}
    ${box('merke', '', 'In endlichen Dimensionen ist es für Konvergenz egal, welche Norm man nimmt. Die Konstanten m, M können aber von n abhängen – etwa ‖x‖∞ ≤ ‖x‖₂ ≤ √n·‖x‖∞.')}
  `,
};

const matrixnormen = {
  id: 'matrixnormen',
  title: '5.2 Normen für Matrizen',
  body: tx`
    ${lead(`Eine Matrix ist sowohl ein Zahlenschema als auch eine lineare Abbildung. Die nützlichste Matrixnorm misst, wie stark
      die Abbildung Vektoren höchstens streckt.`)}
    <p>Matrizen $A \in \K^{m\times n}$ bilden selbst einen Vektorraum ($\cong \K^{mn}$), jede Vektornorm liefert also eine Matrixnorm.
      Wünschenswert ist aber das Zusammenspiel mit Vektoren und Matrixprodukten:</p>
    ${box('definition', '5.5', tx`Eine Matrixnorm heißt <strong>verträglich</strong> zur Vektornorm, falls $\|Ax\| \le \|A\|\,\|x\|$ (5.3), und
      <strong>submultiplikativ</strong>, falls $\|AB\| \le \|A\|\,\|B\|$ (5.4).`)}
    ${box('beispiel', '5.6 (Frobeniusnorm)', tx`$\|A\|_{Fr} = \bigl(\sum_{i,j}|a_{ij}|^2\bigr)^{1/2}$ ist verträglich mit der euklidischen Norm.`)}
    ${box('definition', '5.7 (Zugeordnete Matrixnorm)', tx`$$\|A\| = \sup_{x \neq 0}\frac{\|Ax\|}{\|x\|} = \sup_{\|x\| = 1}\|Ax\|$$
      heißt zugeordnete oder natürliche Matrixnorm. Sie ist stets verträglich und submultiplikativ.`)}
    ${box('lemma', '5.8', tx`Die zugeordneten Normen zu $\|\cdot\|_\infty$ und $\|\cdot\|_1$ sind
      $$\|A\|_\infty = \max_{i}\sum_{j=1}^n |a_{ij}| \;\text{(Zeilensummennorm)}, \qquad \|A\|_1 = \max_{j}\sum_{i=1}^m |a_{ij}| \;\text{(Spaltensummennorm)}.$$
      ${proof(tx`<p>a) Verträglichkeit: $\|Ax\|_\infty = \max_i |\sum_j a_{ij}x_j| \le \max_i \sum_j |a_{ij}|\,\max_k|x_k| = \|A\|_\infty\|x\|_\infty$.
        Also ist das Supremum $\le \|A\|_\infty$.</p>
        <p>b) Gleichheit: Sei $k$ die Zeile mit der größten Betragssumme. Wähle $z_j = |a_{kj}|/a_{kj}$ (bzw. 0), also $\|z\|_\infty = 1$. Dann ist
        $(Az)_k = \sum_j |a_{kj}| = \|A\|_\infty$ – das Supremum wird angenommen.</p>`)}`)}
    ${widget('matrix-norm', {}, tx`Die Matrix als Abbildung: Der Einheitskreis wird zu einer Ellipse. $\|A\|_2$ ist ihre größte Halbachse,
      $\|A\|_\infty$ der größte Betrag einer Koordinate eines Bildpunktes des Einheitsquadrats.`)}
  `,
};

const eigenwerte = {
  id: 'eigenwerte',
  title: '5.3 Eigenwerte und Eigenvektoren',
  body: tx`
    ${lead('Eigenvektoren sind die Richtungen, die eine Matrix nur streckt, aber nicht dreht.')}
    ${box('definition', '5.9', tx`$\lambda \in \C$ heißt <strong>Eigenwert</strong> von $A \in \K^{n\times n}$, wenn es $e \neq 0$ gibt mit $Ae = \lambda e$.
      $e$ heißt Eigenvektor, $(\lambda, e)$ Eigenpaar. Mit $e$ ist auch jedes $ce$ Eigenvektor.`)}
    ${box('definition', '5.10 / 5.11', tx`$A^{-1}$ mit $AA^{-1} = I$ heißt <strong>Inverse</strong>. Gibt es eine Basis aus Eigenvektoren, heißt $A$
      <strong>diagonalisierbar</strong>: Mit $S = [e_1, \dots, e_n]$ gilt $S^{-1}AS = \operatorname{diag}(\lambda_1, \dots, \lambda_n)$ (Ähnlichkeitstransformation).`)}
    <p>Eigenwerte sind Nullstellen des charakteristischen Polynoms $p(\lambda) = \det(A - \lambda I)$. Bei reellen Matrizen treten komplexe Eigenwerte
      in konjugierten Paaren $a \pm ib$ auf. <em>Praktisch</em> berechnet man sie aber nie so – für Polynomnullstellen gibt es keine stabilen Verfahren.</p>
    ${box('lemma', '5.12', tx`Für jede verträgliche Matrixnorm gilt $\|A\| \ge \varrho(A) = \max_i |\lambda_i|$ (<strong>Spektralradius</strong>).
      ${proof(tx`Für einen Eigenvektor $e$ mit $\|e\| = 1$: $|\lambda| = \|\lambda e\| = \|Ae\| \le \|A\|\,\|e\| = \|A\|$.`)}`)}
    ${box('definition', '5.13 (Spezielle Matrizen)', tx`$(A^T)_{ij} = a_{ji}$, $(\bar A)_{ij} = \bar a_{ij}$.
      <ul>
        <li><strong>hermitesch:</strong> $A = \bar A^T$ (reell: <strong>symmetrisch</strong>),</li>
        <li><strong>normal:</strong> $A\bar A^T = \bar A^T A$, <strong>unitär:</strong> $A^{-1} = \bar A^T$, reell <strong>orthogonal:</strong> $A^{-1} = A^T$.</li>
      </ul>`)}
    ${box('satz', '5.14', tx`$A \in \C^{n\times n}$ ist genau dann reell diagonalisierbar mit unitärer Transformation, $\bar Q^T A Q = \operatorname{diag}(\lambda_i)$, $\lambda_i \in \R$,
      wenn $A$ hermitesch ist. Insbesondere sind reelle symmetrische Matrizen mit einer orthogonalen Matrix diagonalisierbar.`)}
    ${box('intuition', '', 'Im Widget oben: Wählen Sie „symmetrisch“ – die Eigenvektoren stehen senkrecht aufeinander und zeigen genau entlang der Halbachsen der Ellipse. Bei der „Drehung“ gibt es keine reellen Eigenvektoren: Jede Richtung wird gedreht.')}
  `,
};

const skalarprodukt = {
  id: 'skalarprodukt',
  title: '5.4 Skalarprodukt',
  body: tx`
    ${box('definition', '5.15', tx`$(\cdot, \cdot): \K^n\times\K^n \to \K$ heißt <strong>Skalarprodukt</strong>, falls
      $(x, y) = \overline{(y, x)}$ (Symmetrie), $(\alpha x + \beta y, z) = \alpha(x, z) + \beta(y, z)$ (Linearität) und $(x, x) > 0$ für $x \neq 0$ (Definitheit).`)}
    <p>Wegen der Symmetrie ist $(x, x)$ stets reell. Im zweiten Argument ist das Skalarprodukt nur „konjugiert linear“:
      $(z, \alpha x + \beta y) = \bar\alpha(z, x) + \bar\beta(z, y)$. Jedes Skalarprodukt induziert eine Norm $\|x\| = \sqrt{(x, x)}$ (5.10), und es gilt die</p>
    ${box('merke', 'Ungleichung von Cauchy-Schwarz', tx`$$|(x, y)| \le \|x\|\,\|y\|. \tag{5.11}$$
      Neben der Dreiecksungleichung die wohl meistbenutzte Ungleichung der numerischen Analysis.`)}
    <p>Das <strong>euklidische Skalarprodukt</strong> ist $(x, y)_2 = \sum_i x_i\bar y_i$ (5.12). Es gilt $(Ax, y)_2 = (x, \bar A^Ty)_2$ (5.13),
      und damit: $A$ ist hermitesch $\Leftrightarrow$ $(Ax, y)_2 = (x, Ay)_2$ für alle $x, y$ (5.14). Allgemein heißt $A^*$ mit $(Ax, y) = (x, A^*y)$
      <em>adjungiert</em>; hermitesche Matrizen sind <em>selbstadjungiert</em>.</p>
  `,
};

const spektralnorm = {
  id: 'spektralnorm',
  title: '5.5 Spektralnorm',
  body: tx`
    ${lead('Die zur euklidischen Norm gehörende Matrixnorm hängt eng mit den Eigenwerten zusammen.')}
    ${box('lemma', '5.18', tx`Für hermitesche $A$ gilt $\|A\|_2 = \varrho(A) = \max_i|\lambda_i|$. Für jede Matrix gilt
      $$\|A\|_2 = \sqrt{\varrho(\bar A^TA)}.$$
      ${proof(tx`<p>a) $A$ hermitesch: Es gibt eine Orthonormalbasis aus Eigenvektoren. Mit $x = \sum_i\alpha_ie_i$ ist $\|x\|_2^2 = \sum_i|\alpha_i|^2$ und
        $\|Ax\|_2^2 = \sum_i\lambda_i^2|\alpha_i|^2 \le \varrho(A)^2\|x\|_2^2$. Also $\|A\|_2 \le \varrho(A)$, und mit Lemma 5.12 folgt Gleichheit.</p>
        <p>b) Allgemein: $\|Ax\|_2^2 = (Ax, Ax)_2 = (\bar A^TAx, x)_2$. $\bar A^TA$ ist hermitesch mit größtem Eigenwert $\varrho(\bar A^TA)$, also
        $\|A\|_2^2 = \sup_x (\bar A^TAx, x)_2/\|x\|_2^2 = \varrho(\bar A^TA)$.</p>`)}`)}
    ${box('intuition', '', tx`Eine Matrix bildet den Einheitskreis auf eine Ellipse ab. Ihre Halbachsen sind die Wurzeln der Eigenwerte von $A^TA$
      (die <em>Singulärwerte</em>). Bei symmetrischen Matrizen sind das einfach die Beträge der Eigenwerte. Probieren Sie im Widget in 5.2 die Scherung:
      Beide Eigenwerte sind 1, trotzdem ist $\|A\|_2 \approx 1{,}62 > \varrho(A) = 1$.`)}
  `,
};

const positivDefinit = {
  id: 'positiv-definit',
  title: '5.6 Positiv definite Matrizen',
  body: tx`
    ${lead('Positiv definite Matrizen tauchten schon beim Knotenpotentialverfahren auf. Sie haben besonders angenehme Eigenschaften.')}
    ${box('definition', '5.19', tx`$A \in \K^{n\times n}$ heißt <strong>positiv definit</strong>, wenn $(Ax, x)_2 \in \R$ für alle $x$ (5.15a) und
      $(Ax, x)_2 > 0$ für alle $x \neq 0$ (5.15b).`)}
    ${box('lemma', '5.20', tx`Für $A \in \C^{n\times n}$ gilt: $A$ hermitesch $\Leftrightarrow$ $(Ax, x)_2 \in \R$ für alle $x$.
      Im Komplexen ist positive Definitheit also nur für hermitesche Matrizen sinnvoll; im Reellen ist Symmetrie eine zusätzliche, unabhängige Bedingung.`)}
    ${box('lemma', '5.21', tx`Eine hermitesche (reell: symmetrische) Matrix ist genau dann positiv definit, wenn alle Eigenwerte positiv sind.
      Dann sind alle Diagonalelemente reell und positiv.
      ${proof(tx`a) Alle $\lambda_i > 0$: $(Ax, x)_2 = \sum_i\lambda_i|\alpha_i|^2 > 0$.
        b) Positiv definit: $0 < (Ae_i, e_i)_2 = \lambda_i(e_i, e_i)_2$, also $\lambda_i > 0$.
        c) Mit dem Einheitsvektor $z_i$: $0 < (Az_i, z_i)_2 = a_{ii}$.`)}`)}
    ${box('lemma', '5.22', tx`Ist $A \in \R^{n\times n}$ symmetrisch positiv definit, so liegt das betragsgrößte Element auf der Hauptdiagonale.
      ${proof(tx`Angenommen $a_{ij}$, $i \neq j$, wäre betragsgrößtes Element. Dann
        $0 < (A(z_i - \operatorname{sgn}(a_{ij})z_j), z_i - \operatorname{sgn}(a_{ij})z_j)_2 = a_{ii} - 2|a_{ij}| + a_{jj}$, also
        $|a_{ij}| < \frac12(a_{ii} + a_{jj})$ – Widerspruch.`)}`)}
    ${widget('quadratic-form', {}, tx`Die quadratische Form $x^TAx$ einer symmetrischen $2\times 2$-Matrix. Positiv definit heißt anschaulich: Die Funktion ist eine
      nach oben offene Schale, ihre Höhenlinien sind Ellipsen.`)}
    ${exercise('Ist die Matrix A = BᵀLB aus dem Knotenpotentialverfahren positiv definit? Prüfen Sie Lemma 5.21 und 5.22 an den Zahlen im Widget von Vorlesung 4.',
      tx`Ja – siehe Abschnitt 4.3: $x^TAx = (Bx)^TL(Bx) = \sum_i L_{ii}(Bx)_i^2 > 0$. Im Widget sieht man: Die Diagonalelemente (Summe der anliegenden
      Leitfähigkeiten) sind positiv und jeweils größer als jeder Nichtdiagonaleintrag $-L_e$ dieser Zeile, wie Lemma 5.22 verlangt.`)}
  `,
};

export default {
  id: 'vl5',
  number: 5,
  title: 'Grundlagen aus der linearen Algebra',
  summary: 'Vektor- und Matrixnormen, Eigenwerte und Spektralradius, Skalarprodukte, Spektralnorm und positiv definite Matrizen – anschaulich in 2D.',
  sections: [vektornormen, matrixnormen, eigenwerte, skalarprodukt, spektralnorm, positivDefinit],
};
