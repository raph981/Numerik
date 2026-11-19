/**
 * Vorlesung 13: Iterative Lösung linearer Gleichungssysteme
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const motivation = {
  id: 'motivation-iterativ',
  title: '13.1 Motivation',
  body: tx`
    ${lead(`Direkte Verfahren zerstören die Nullen dünn besetzter Matrizen. Iterative Verfahren brauchen nur Matrix-Vektor-Produkte –
      und dabei muss mit Nullen gar nicht gerechnet werden.`)}
    <p>Iterative Verfahren konstruieren ausgehend von einem Startwert $x^0$ eine Folge $x^0, x^1, x^2, \dots$ mit $\lim_{k\to\infty}x^k = x$
      ($k$ ist hier ein Index, keine Potenz). Warum, wenn wir doch LU haben?</p>
    ${box('beispiel', 'Fill-in', tx`Eine Pfeilmatrix mit voller erster Zeile und Spalte hat $3n - 2$ Nichtnullen. Schon nach dem ersten Eliminationsschritt sind es $n^2 - n + 1$ –
      alle Nullen sind „aufgefüllt“. Vertauscht man erste und letzte Zeile und Spalte (Pfeil zeigt nach unten rechts), entsteht dagegen <strong>gar kein</strong> Fill-in.
      In realen Anwendungen entsteht meist so viel Fill-in, dass iterative Verfahren ab einer gewissen Größe günstiger sind.`)}
    ${widget('sparsity-fill', { preset: 'arrowBad' }, 'Schalten Sie zwischen den beiden Pfeilmatrizen um: gleiche Information, völlig unterschiedlicher Aufwand.')}
    ${box('definition', '13.1 / 13.2 (Graph, dünn besetzt)', tx`Der Graph von $A$ ist $G(A) = (I, E)$ mit $I = \{1, \dots, n\}$ und $E(A) = \{(i, j) : a_{ij} \neq 0\}$; $E_i(A)$ sind die Nichtnullen der Zeile $i$.
      $A$ heißt <strong>dünn besetzt</strong>, falls $|E(A)| = O(n)$ statt $n^2$ – oft ist sogar $|E_i(A)| \le C$.`)}
    <p>Im Matrix-Vektor-Produkt $y_i = \sum_{(i,j)\in E_i(A)}a_{ij}x_j$ kostet das nur $2|E(A)|$ statt $2n^2$ Operationen. Gespeichert werden nur die Nichtnullen samt Indizes.</p>
  `,
};

const linear = {
  id: 'lineare-iterationsverfahren',
  title: '13.2 Lineare Iterationsverfahren',
  body: tx`
    ${lead('Die Idee: Löse die Fehlergleichung nicht exakt, sondern nur näherungsweise mit einer einfacheren Matrix – und wiederhole das.')}
    <p>Für den Fehler $e^k = x - x^k$ gilt die <strong>Defektgleichung</strong></p>
    $$Ae^k = Ax - Ax^k = b - Ax^k =: d^k. \tag{13.1, 13.2}$$
    <p>Sie ist so schwer wie das Original. Ersetzt man $A$ durch eine leicht invertierbare Matrix $W$, erhält man eine Näherung $v^k = W^{-1}d^k$ des Fehlers und damit</p>
    $$x^{k+1} = x^k + W^{-1}(b - Ax^k). \tag{13.3}$$
    <p>Mit der Zerlegung $A = L + D + U$ (strikt unteres Dreieck, Diagonale, strikt oberes Dreieck):</p>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Verfahren</th><th>$W$</th><th>Idee</th></tr></thead>
      <tbody>
        <tr><td>Richardson</td><td>$\frac1\omega I$</td><td>Defekt mit Faktor $\omega$ addieren</td></tr>
        <tr><td>Jacobi</td><td>$D$</td><td>jede Gleichung $i$ nach $x_i$ auflösen, alle gleichzeitig</td></tr>
        <tr><td>Gauß-Seidel</td><td>$L + D$</td><td>wie Jacobi, aber neue Werte sofort verwenden</td></tr>
      </tbody>
    </table></div>
    <p>Allgemeiner schreibt man $x^{k+1} = x^k + B(b - Ax^k)$ (13.4) mit einem <strong>Vorkonditionierer</strong> $B \approx A^{-1}$. Die Lösung $x$ ist ein Fixpunkt.
      Für den Fehler gilt</p>
    $$e^{k+1} = e^k - BAe^k = (I - BA)e^k, \qquad e^k = S^ke^0, \qquad S = I - BA \;\text{(Iterationsmatrix)}.$$
    ${box('merke', '', tx`$A$ und $B$ müssen regulär sein: Ist $Az = 0$ für ein $z \neq 0$, so ist $Sz = z$ – dieser Fehleranteil wird nie korrigiert. Alternative Form:
      $x^{k+1} = Sx^k + Bb$ (13.5).`)}
    ${widget('iteration-2d', {}, 'Beobachten Sie die Pfade: Jacobi verbessert beide Koordinaten gleichzeitig, Gauß-Seidel nacheinander. Bei der nicht diagonaldominanten Matrix divergieren beide.')}
  `,
};

const konvergenz = {
  id: 'konvergenz-iterativ',
  title: '13.3 Konvergenz linearer Iterationsverfahren',
  body: tx`
    ${lead('Ob und wie schnell eine lineare Iteration konvergiert, entscheiden allein die Eigenwerte der Iterationsmatrix.')}
    <p>Ist $S = T^{-1}\operatorname{diag}(\lambda_i)T$ diagonalisierbar, so ist $S^k = T^{-1}\operatorname{diag}(\lambda_i^k)T \to 0$ genau dann, wenn alle $|\lambda_i| < 1$, also
      $\varrho(S) < 1$. Für allgemeine Matrizen (komplexe Eigenwerte, fehlende Eigenvektorbasis) braucht man die</p>
    ${box('satz', '13.3 (Schur-Normalform)', tx`Zu jedem $S \in \C^{n\times n}$ gibt es eine unitäre Matrix $Q$ und eine obere Dreiecksmatrix $R$ mit $S = QR\bar Q^T$. Die Diagonale von $R$ enthält die Eigenwerte.
      ${proof(tx`Ähnlichkeitstransformation, also gleiche Eigenwerte; $\det(R - \lambda I) = \prod(r_{ii} - \lambda)$. Existenz per Induktion: Zu einem Eigenpaar $(\lambda, e)$ ergänze $e$
        zu einer Orthonormalbasis $X$ (Austauschlemma + Gram-Schmidt). Dann $\bar X^TSX = \begin{bmatrix}\lambda & a^T\\ 0 & S_{n-1}\end{bmatrix}$; wende die Induktionsannahme auf $S_{n-1}$ an.`)}`)}
    ${box('lemma', '13.4', tx`Ist $R$ obere Dreiecksmatrix mit $\max_i|r_{ii}| \le \rho < 1$, so gilt $\lim_{m\to\infty}R^m = 0$.
      ${proof(tx`Mit $M = \max_{i<j}|r_{ij}|$ und der strikt oberen Einsermatrix $V$ ($V^n = 0$) gilt $|R| \le \rho I + MV$, also
        $|R^m| \le \sum_{k=0}^{n-1}\binom mk\rho^{m-k}M^kV^k$. Der Binomialkoeffizient wächst nur polynomial in $m$, $\rho^m$ fällt exponentiell; genauer zeigt man
        $|R^m| \le C(\rho + \epsilon)^m \to 0$ für jedes $\epsilon$ mit $\rho + \epsilon < 1$.`)}`)}
    ${box('satz', '13.5 (Konvergenzsatz)', tx`Für reguläre $A, B$ konvergiert $x^{k+1} = x^k + B(b - Ax^k)$ <strong>für jeden Startwert</strong> gegen die Lösung genau dann, wenn
      $$\varrho(S) = \varrho(I - BA) < 1.$$
      $\varrho(S)$ heißt <strong>Konvergenzrate</strong>: Pro Schritt wird der Fehler asymptotisch etwa um den Faktor $\varrho(S)$ kleiner.
      ${proof(tx`(⇒) Wäre $\varrho(S) \ge 1$, so bliebe für einen Eigenvektor $z$ zu $|\lambda| \ge 1$ der Fehler $S^kz = \lambda^kz \not\to 0$.
        (⇐) $S^k = QR^k\bar Q^T \to 0$ nach Lemma 13.4.`)}`)}
    ${box('intuition', '', 'Im Widget oben sehen Sie den Fehler über den Iterationen in logarithmischer Darstellung: Er fällt auf einer Geraden mit Steigung log ϱ(S). Der Satz ist vollständig, aber praktisch schwer einsetzbar – die Eigenwerte von S kennt man meist nicht. Das ist Thema von Vorlesung 14.')}
    ${list([
      tx`$\varrho(S) = 0{,}5$: pro Schritt ein Bit Genauigkeit, nach 10 Schritten Faktor $10^{-3}$.`,
      tx`$\varrho(S) = 0{,}99$: für einen Faktor $10^{-3}$ braucht man schon $\approx 690$ Schritte.`,
    ])}
  `,
};

export default {
  id: 'vl13',
  number: 13,
  title: 'Iterative Lösung linearer Gleichungssysteme',
  summary: 'Fill-in und dünn besetzte Matrizen, lineare Iterationsverfahren (Richardson, Jacobi, Gauß-Seidel), Iterationsmatrix und der Konvergenzsatz ϱ(S) < 1.',
  sections: [motivation, linear, konvergenz],
};
