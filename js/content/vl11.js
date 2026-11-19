/**
 * Vorlesung 11: Nichtreguläre Systeme
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const motivation = {
  id: 'ausgleichsrechnung',
  title: '11.1 Motivation: Ausgleichsrechnung',
  body: tx`
    ${lead(`Mehr Messpunkte als Unbekannte – das Gleichungssystem hat keine Lösung. Man sucht stattdessen die „beste“ Näherung.
      Das kennen wir schon aus Vorlesung 1.`)}
    <p>Gegeben sind $m$ Datenpunkte $(x_i, y_i)$ und $n$ Funktionen $u_j$ (z.&nbsp;B. $u_j(x) = x^{j-1}$ oder $\sin(j\pi x)$). Gesucht sind Koeffizienten $z_j$, so dass
      $u(x) = \sum_{j=1}^n z_ju_j(x)$ die Daten möglichst gut wiedergibt. Die <strong>Methode der kleinsten Quadrate</strong> (Gauß, Legendre) minimiert</p>
    $$\sum_{i=1}^m\Bigl(y_i - \sum_{j=1}^n z_j\underbrace{u_j(x_i)}_{a_{ij}}\Bigr)^2 = \|y - Az\|_2^2 = z^TA^TAz - 2z^TA^Ty + y^Ty.$$
    <p>Mit vollem Rang $\operatorname{Rang}(A) = \min(m, n)$ gibt es drei Fälle:</p>
    ${list([
      tx`<strong>$m < n$</strong>: weniger Daten als Koeffizienten – $Az = y$ ist lösbar, aber wegen $\operatorname{Kern}(A) \neq \{0\}$ unendlich oft.`,
      tx`<strong>$m = n$</strong>: genau eine Lösung mit $Az = y$ (Interpolation).`,
      tx`<strong>$m > n$</strong>: mehr Daten als Koeffizienten – im Allgemeinen keine exakte Lösung; die Minimierung ist sinnvoll.`,
    ], true)}
    ${widget('least-squares-fit', {}, 'Ändern Sie m und n: Für n = m geht die Kurve exakt durch alle Punkte (und wackelt wild), für n ≪ m glättet sie das Rauschen.')}
  `,
};

const normalengleichung = {
  id: 'normalengleichung',
  title: '11.2 Lösbarkeit und Normalengleichung',
  body: tx`
    ${lead('Geometrisch ist die beste Näherung die orthogonale Projektion von b auf das Bild von A. Daraus folgt die Normalengleichung.')}
    <p>Erinnerung: $\operatorname{Bild}(A) = \{Ax\} \subseteq \R^m$, $\operatorname{Kern}(A) = \{x : Ax = 0\}$, und für einen Unterraum $V$ ist
      $V^\perp = \{w : (w, v)_2 = 0\;\forall v \in V\}$. Es gilt</p>
    $$y \in \operatorname{Bild}(A)^\perp \Leftrightarrow (y, Ax)_2 = 0\;\forall x \Leftrightarrow (A^Ty, x)_2 = 0\;\forall x \Leftrightarrow A^Ty = 0,$$
    <p>also $\operatorname{Bild}(A)^\perp = \operatorname{Kern}(A^T)$ und $\R^m = \operatorname{Bild}(A) \oplus \operatorname{Kern}(A^T)$.</p>
    ${box('satz', '11.1', tx`Sei $A \in \R^{m\times n}$, $b \in \R^m$ beliebig.
      <ol type="a">
        <li>Es existiert ein $x^*$ mit $\|Ax^* - b\|_2 = \min_x\|Ax - b\|_2$.</li>
        <li>Das ist äquivalent dazu, dass $x^*$ die <strong>Normalengleichung</strong> löst:
          $$A^TAx^* = A^Tb. \tag{11.1}$$</li>
        <li>Für $\operatorname{Rang}(A) = n$ ist $x^*$ eindeutig; sonst haben alle Lösungen die Form $x^* + y$, $y \in \operatorname{Kern}(A)$.</li>
      </ol>
      ${proof(tx`<p>(b ⇒ a): $\|Ax - b\|_2^2 = \|Ax^* - b\|_2^2 + 2(Ax^* - b, A(x - x^*))_2 + \|A(x - x^*)\|_2^2$. Der mittlere Term ist $2(A^T(Ax^* - b), x - x^*)_2 = 0$, also
        $\|Ax - b\|_2^2 \ge \|Ax^* - b\|_2^2$.</p>
        <p>(a ⇒ b): Notwendig ist $\partial F/\partial x_k = 0$ für $F(x) = \|Ax - b\|_2^2$; nachrechnen ergibt $\nabla F = 2A^T(Ax - b)$.</p>
        <p>Lösbarkeit: Zerlege $b = s + r$ mit $s = A\bar x \in \operatorname{Bild}(A)$, $r \in \operatorname{Kern}(A^T)$. Dann ist $A^TA\bar x = A^Ts = A^Tb$.
        Eindeutigkeit für Rang $n$: Aus $A^TAx = 0$ folgt $Ax \in \operatorname{Bild}(A)\cap\operatorname{Kern}(A^T) = \{0\}$, also $x = 0$.</p>`)}`)}
    ${box('intuition', 'Geometrie', tx`$Ax^*$ ist der Punkt im Unterraum $\operatorname{Bild}(A)$, der $b$ am nächsten liegt – der Fußpunkt des Lotes. Der Fehler $b - Ax^*$ steht senkrecht auf
      $\operatorname{Bild}(A)$, also $A^T(b - Ax^*) = 0$. Das <em>ist</em> die Normalengleichung.`)}
    <p>$A^TA$ ist symmetrisch positiv semidefinit ($x^TA^TAx = \|Ax\|_2^2 \ge 0$) und für Rang $n$ positiv definit – man könnte also Cholesky verwenden. Aber:</p>
    ${box('merke', 'Zwei Nachteile der Normalengleichung', list([
      tx`Das Aufstellen von $A^TA$ kostet $O(mn^2)$, und eine dünn besetzte Matrix $A$ kann ein voll besetztes $A^TA$ liefern.`,
      tx`<strong>Die Kondition wird quadriert:</strong> $\operatorname{cond}_2(A^TA) = \operatorname{cond}_2(A)^2$. Man verliert doppelt so viele Stellen wie nötig – im Widget oben gut zu sehen.`,
    ]))}
  `,
};

const qrSchmal = {
  id: 'schmale-qr',
  title: '11.3 Schmale QR-Zerlegung',
  body: tx`
    ${lead(`Die Idee: Ersetze die Spalten von A durch eine Orthonormalbasis desselben Raumes. Das ist Gram-Schmidt – mit Buchführung
      wird daraus eine Matrixzerlegung A = QR.`)}
    <p>Sei $n \le m$, $\operatorname{Rang}(A) = n$ und $A = [a_1, \dots, a_n]$, also $\operatorname{Bild}(A) = \operatorname{span}\{a_1, \dots, a_n\}$.</p>
    ${box('definition', '11.2 (Gram-Schmidt)', tx`$q_1' = a_1$, $q_1 = q_1'/\|q_1'\|$, und für $k = 2, \dots, n$:
      $$q_k' = a_k - \sum_{j=1}^{k-1}(a_k, q_j)_2\,q_j, \qquad q_k = q_k'/\|q_k'\|.$$
      Man zieht von $a_k$ seine Anteile in Richtung der bisherigen $q_j$ ab; was übrig bleibt, steht senkrecht auf ihnen.`)}
    ${widget('gram-schmidt-geometry')}
    ${box('satz', '11.3 (Schmale QR-Zerlegung)', tx`Für $A \in \R^{m\times n}$ mit Rang $n$ existiert die eindeutige Zerlegung
      $$A = QR, \qquad Q \in \R^{m\times n},\; Q^TQ = I,\; R \in \R^{n\times n} \text{ obere Dreiecksmatrix (positive Diagonale)}.$$
      Dabei ist $R^TR = A^TA$ gerade die Cholesky-Zerlegung von $A^TA$.
      ${proof(tx`Aus Gram-Schmidt: $a_k = \sum_{j<k}(a_k, q_j)_2q_j + \|q_k'\|_2q_k$, also $r_{jk} = (a_k, q_j)_2$, $r_{kk} = \|q_k'\|_2 > 0$.
        Eindeutigkeit: $A^TA = R^TQ^TQR = R^TR$, und die Cholesky-Zerlegung ist eindeutig; dann ist auch $Q = AR^{-1}$ eindeutig.`)}`)}
    <p>Damit löst man die Normalengleichung, ohne $A^TA$ aufzustellen: $A^TAx = A^Tb \Leftrightarrow R^TRx = A^Tb$, also erst $R^Ty = A^Tb$ vorwärts, dann $Rx = y$ rückwärts.
      (Noch besser: $Rx = Q^Tb$, siehe Vorlesung 12.)</p>

    <h3>Klassisch vs. modifiziert</h3>
    <p>Das klassische Verfahren ist leider <strong>nicht numerisch stabil</strong>. Die Modifikation orthogonalisiert nacheinander gegen die bereits orthogonalen Vektoren und benutzt dabei
      jeweils den <em>aktuellen</em> Vektor:</p>
    ${box('definition', '11.4 (Modifizierter Gram-Schmidt)', tx`Für $k = 1, \dots, n$: $q_k' = a_k$; für $j = 1, \dots, k-1$: $q_k' = q_k' - (q_k', q_j)_2\,q_j$; dann $q_k = q_k'/\|q_k'\|_2$.
      <br>In exakter Arithmetik identisch zum klassischen Verfahren (denn $(q_k', q_j)_2 = (a_k, q_j)_2$), in Fließkommaarithmetik viel genauer.`)}
    ${widget('gram-schmidt-stability', {}, 'Wie Beispiel 11.5: Bei großer Kondition verliert klassisches Gram-Schmidt jede Orthogonalität (‖QᵀQ − I‖ ≈ 1), das modifizierte Verfahren deutlich weniger.')}
  `,
};

export default {
  id: 'vl11',
  number: 11,
  title: 'Nichtreguläre Systeme',
  summary: 'Methode der kleinsten Quadrate, Normalengleichung und ihre Geometrie, Gram-Schmidt-Orthogonalisierung und die schmale QR-Zerlegung.',
  sections: [motivation, normalengleichung, qrSchmal],
};
