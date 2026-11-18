/**
 * Vorlesung 6: Konditionsanalyse für lineare Gleichungssysteme
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const notation = {
  id: 'loesbarkeit',
  title: '6.1 Notation und Lösbarkeit',
  body: tx`
    ${lead('Bevor wir lineare Gleichungssysteme lösen, fragen wir: Wie empfindlich ist die Lösung gegenüber kleinen Fehlern in den Daten?')}
    <p>Gegeben sind $A \in \K^{m\times n}$ und $b \in \K^m$, gesucht ist $x \in \K^n$ mit</p>
    $$Ax = b. \tag{6.2}$$
    <p>Das System heißt <em>unterbestimmt</em> ($m < n$), <em>quadratisch</em> ($m = n$) oder <em>überbestimmt</em> ($m > n$). Es hat mindestens eine Lösung,
      wenn $\operatorname{Rang}(A) = \operatorname{Rang}([A\,|\,b])$, d.h. wenn $b$ im Bild von $A$ liegt.</p>
    ${box('merke', 'Für quadratische A sind äquivalent', list([
      tx`$Ax = b$ ist für jedes $b$ eindeutig lösbar,`,
      tx`$\operatorname{Rang}(A) = n$,`,
      tx`$\det(A) \neq 0$,`,
      tx`$A$ hat keinen Eigenwert 0.`,
    ], true))}
  `,
};

const kondition = {
  id: 'kondition-matrix',
  title: '6.2 Kondition einer Matrix',
  body: tx`
    ${lead(tx`Ändert man die rechte Seite $b$ um ein Prozent, um wie viel Prozent ändert sich dann die Lösung $x$? Der Verstärkungsfaktor heißt Konditionszahl.`)}
    <p>Die Eingaben sind $A$ und $b$, die Ausgabe ist $x = F(A, b) = A^{-1}b$. Zunächst sei $A$ fest und $b$ werde zu $b + \Delta b$ gestört.
      Dann ist $\Delta x = A^{-1}\Delta b$ und mit verträglichen Normen</p>
    $$\frac{\|\Delta x\|}{\|x\|} = \frac{\|A^{-1}\Delta b\|}{\|A^{-1}b\|} \le \frac{\|A^{-1}\|\,\|\Delta b\|}{\|A^{-1}b\|}\cdot\frac{\|AA^{-1}b\|}{\|b\|}
      \le \|A\|\,\|A^{-1}\|\,\frac{\|\Delta b\|}{\|b\|}.$$
    ${box('definition', '6.1 (Konditionszahl)', tx`Für invertierbares $A$ heißt $\operatorname{cond}(A) = \|A\|\,\|A^{-1}\|$ die <strong>Konditionszahl</strong>
      (mit einer beliebigen verträglichen Matrixnorm). Es gilt stets $\operatorname{cond}(A) \ge \|AA^{-1}\| = \|I\| = 1$.`)}
    <p>Die Konditionszahl fasst alles in <em>einer</em> Zahl zusammen – man sieht nicht mehr, welche Eingabekomponente auf welche Ausgabe wirkt.
      Sie ist eine <em>worst-case</em>-Abschätzung und kann pessimistisch sein.</p>
    ${box('lemma', '6.2 (Spektralkondition)', tx`Für $\|\cdot\|_2$ heißt $\operatorname{cond}_2(A) = \|A\|_2\|A^{-1}\|_2$ Spektralkondition. Für symmetrisch positiv definite $A$ gilt
      $$\operatorname{cond}_2(A) = \frac{\lambda_\text{max}(A)}{\lambda_\text{min}(A)},$$
      denn $\|A\|_2 = \lambda_\text{max}$ (Lemma 5.18) und die Eigenwerte von $A^{-1}$ sind $1/\lambda_i$, also $\|A^{-1}\|_2 = 1/\lambda_\text{min}$.`)}

    ${widget('condition-2x2', {}, tx`Geometrisch: Jede Zeile von $Ax = b$ ist eine Gerade, die Lösung ihr Schnittpunkt. Die Punkte sind Lösungen zu
      zufällig gestörten Daten. Bei „schleifendem“ Schnitt (kleines $\varepsilon$) streuen sie enorm – die Matrix ist schlecht konditioniert.`)}

    ${box('beispiel', '6.3 (Kondition ≠ Determinante)', tx`<ol type="a">
      <li>$A = \begin{bmatrix}-1 & 1\\ 1 - \epsilon & -1\end{bmatrix}$, $A^{-1} = \frac1\epsilon\begin{bmatrix}-1 & -1\\ \epsilon - 1 & -1\end{bmatrix}$:
        $\det A = \epsilon$, $\|A\|_\infty = 2$, $\|A^{-1}\|_\infty = 2/\epsilon$, also $\operatorname{cond}_\infty(A) = 4/\epsilon$. Kleine Determinante, große Kondition.</li>
      <li>Aber $B = \begin{bmatrix}10^{-10} & 0\\ 0 & 10^{-10}\end{bmatrix}$ hat $\det B = 10^{-20}$ und trotzdem $\operatorname{cond}_\infty(B) = 10^{-10}\cdot 10^{10} = 1$.</li>
      <li>Allgemein: $\operatorname{cond}(\epsilon A) = \operatorname{cond}(A)$, aber $\det(\epsilon A) = \epsilon^n\det(A)$ – völlig verschiedenes Skalierungsverhalten.</li>
    </ol>`)}
    ${box('merke', '', 'Eine kleine Determinante ist kein Maß für „fast singulär“. Entscheidend ist die Konditionszahl.')}
  `,
};

const stoerungssatz = {
  id: 'stoerungssatz',
  title: '6.3 Störungssatz',
  body: tx`
    ${lead('Was passiert, wenn auch die Matrix selbst gestört ist – etwa weil ihre Einträge gerundet wurden?')}
    <p>Nun werde auch $A$ zu $A + \Delta A$ gestört: $(A + \Delta A)(x + \Delta x) = b + \Delta b$. Zuerst muss man sicherstellen, dass $A + \Delta A$
      überhaupt invertierbar bleibt.</p>
    ${box('lemma', '6.4 (Neumann)', tx`Sei $\|\cdot\|$ eine zugeordnete Matrixnorm und $\|B\| < 1$. Dann ist $I + B$ regulär und
      $$\|(I + B)^{-1}\| \le \frac{1}{1 - \|B\|}. \tag{6.3}$$
      ${proof(tx`<p>a) $\|x\| \le \|(I + B)x\| + \|Bx\|$, also $\|(I + B)x\| \ge (1 - \|B\|)\|x\| > 0$ für $x \neq 0$ – $I + B$ ist injektiv, also regulär.</p>
        <p>b) $1 = \|I\| = \|(I+B)^{-1} + B(I+B)^{-1}\| \ge \|(I+B)^{-1}\| - \|B\|\,\|(I+B)^{-1}\| = (1 - \|B\|)\|(I+B)^{-1}\|$.</p>`)}`)}
    ${box('satz', '6.5 (Störungssatz)', tx`Sei $A$ regulär und $\|\Delta A\| < 1/\|A^{-1}\|$. Dann ist $A + \Delta A$ regulär und für die Lösung des gestörten Systems gilt
      $$\frac{\|\Delta x\|}{\|x\|} \le \frac{\operatorname{cond}(A)}{1 - \operatorname{cond}(A)\frac{\|\Delta A\|}{\|A\|}}\left(\frac{\|\Delta b\|}{\|b\|} + \frac{\|\Delta A\|}{\|A\|}\right). \tag{6.4}$$
      ${proof(tx`<p>a) $A + \Delta A = A(I + A^{-1}\Delta A)$ mit $\|A^{-1}\Delta A\| \le \|A^{-1}\|\,\|\Delta A\| < 1$ – regulär nach Lemma 6.4.</p>
        <p>b) Aus $(A + \Delta A)(x + \Delta x) = b + \Delta b$ und $Ax = b$ folgt $\Delta x = (A + \Delta A)^{-1}(\Delta b - \Delta A\,x)$. Also
        $$\|\Delta x\| \le \|(I + A^{-1}\Delta A)^{-1}\|\,\|A^{-1}\|\,(\|\Delta b\| + \|\Delta A\|\,\|x\|) \le \frac{\|A^{-1}\|}{1 - \|A^{-1}\|\,\|\Delta A\|}(\|\Delta b\| + \|\Delta A\|\,\|x\|).$$
        Ausklammern von $\|A\|\,\|x\|$ und $\|b\| \le \|A\|\,\|x\|$ liefert die Behauptung.</p>`)}`)}
    ${box('beispiel', '6.6 (Stellenverlust)', tx`Sind die relativen Störungen von $A$ und $b$ von der Größe $10^{-k}$ und ist $\operatorname{cond}(A) = 10^s$ mit $10^{s-k} \ll 1$, so gilt
      $$\frac{\|\Delta x\|}{\|x\|} \le \frac{10^s}{1 - 10^{s-k}}\cdot 2\cdot 10^{-k} \approx 10^{s-k}.$$
      <strong>Man verliert etwa $s = \log_{10}\operatorname{cond}(A)$ Dezimalstellen.</strong> Beispiel: Störung $10^{-10}$, Kondition $10^5$ → relative Änderung der Lösung bis $10^{-5}$.`)}
    <p>Testen Sie das im Widget oben mit der Einstellung „A und b“: Die beobachtete Änderung bleibt stets unter der Schranke (6.4) – oft deutlich.</p>
    ${box('beispiel', '6.7 (Große Kondition, trotzdem harmlos)', tx`Für $D = \operatorname{diag}(d_1, d_2)$ ist $\operatorname{cond}_\infty(D) = \frac{\max(|d_1|, |d_2|)}{\min(|d_1|, |d_2|)}$, etwa $10^{10}$ für $d_1 = 10^{10}$, $d_2 = 1$.
      Die Gleichungen $x_i = b_i/d_i$ sind aber voneinander unabhängig und jede Division ist gut konditioniert! Die Konditionszahl unterstellt
      Abhängigkeiten zwischen allen Komponenten, die hier nicht bestehen.`)}
    ${exercise('Wählen Sie im Widget „Beispiel 6.7 (diagonal)“. Warum ist die Fehlerwolke ein achsenparalleles Rechteck, und warum widerspricht das nicht der großen Konditionszahl?',
      tx`Jede Komponente $x_i = b_i/d_i$ wird nur von $b_i$ beeinflusst; der relative Fehler je Komponente ist so groß wie der von $b_i$.
      Die Norm-Abschätzung misst aber Fehler relativ zu $\|b\|_\infty$: Eine Störung, die relativ zu $\|b\|$ klein ist, kann für die kleine Komponente
      $b_2$ relativ groß sein – und sich dann über $1/d_2$ stark auf $x$ auswirken. Im schlimmsten Fall wird die Schranke angenommen, typischerweise nicht.`)}
  `,
};

export default {
  id: 'vl6',
  number: 6,
  title: 'Kondition linearer Gleichungssysteme',
  summary: 'Wie empfindlich ist die Lösung von Ax = b? Konditionszahl, Spektralkondition, das Neumann-Lemma und der Störungssatz.',
  sections: [notation, kondition, stoerungssatz],
};
