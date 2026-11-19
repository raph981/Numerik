/**
 * Vorlesung 12: QR-Zerlegung
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const householder = {
  id: 'householder-transformation',
  title: '12.1 Householder-Transformation',
  body: tx`
    ${lead(`Statt Vektoren nacheinander zu orthogonalisieren, kann man die Matrix auch durch Spiegelungen auf Dreiecksgestalt bringen.
      Spiegelungen sind orthogonal – Rundungsfehler werden nicht verstärkt.`)}
    <p>Die schmale QR-Zerlegung ($Q$: $m\times n$) ist eindeutig. Die <strong>volle</strong> QR-Zerlegung ($Q$: $m\times m$, $R$: $m\times n$) ist es nicht –
      sie lässt sich aber noch kompakter speichern.</p>
    <h3>Projektion</h3>
    <p>Jeder Vektor $x$ lässt sich zerlegen in einen Anteil in Richtung $v$ und einen dazu senkrechten: $x = \alpha v + w$ mit $(w, v)_2 = 0$. Aus
      $0 = (x - \alpha v, v)_2$ folgt $\alpha = \frac{(x, v)_2}{(v, v)_2}$ und</p>
    $$\alpha v = \frac{vv^T}{v^Tv}x, \qquad w = \Bigl(I - \frac{vv^T}{v^Tv}\Bigr)x.$$
    ${box('definition', '12.1 (Householder-Matrix)', tx`Für $v \neq 0$ heißt
      $$Q_v = I - 2\frac{vv^T}{v^Tv}$$
      Householder-Matrix (-Transformation, -Spiegelung), $v$ Householder-Vektor. Es gilt $Q_vx = -\alpha v + w$: Der Anteil in Richtung $v$ wechselt das Vorzeichen, $x$ wird
      an der Ebene senkrecht zu $v$ <strong>gespiegelt</strong>.`)}
    ${box('lemma', '12.2', tx`$Q_v$ ist symmetrisch und orthogonal: $Q_v^T = Q_v$, $Q_v^TQ_v = I$.
      ${proof(tx`Symmetrie ist klar. $Q_v^2 = I - 4\frac{vv^T}{v^Tv} + 4\frac{v(v^Tv)v^T}{(v^Tv)^2} = I$. Geometrisch: Zweimal spiegeln ergibt die Identität.`)}`)}
  `,
};

const herleitung = {
  id: 'herleitung-qr',
  title: '12.2 Herleitung der Zerlegung',
  body: tx`
    ${lead('Gesucht ist die Spiegelung, die einen gegebenen Vektor x auf die Richtung eines Vektors z abbildet – meist auf die erste Koordinatenachse.')}
    <p>Wir wollen $Q_vx = \beta z$. Da $Q_vx \in \operatorname{span}\{x, v\}$, muss $v \in \operatorname{span}\{x, z\}$ liegen. Der Ansatz $v = x + c_2z$ in
      $Q_vx = (1 - 2\frac{v^Tx}{v^Tv})x - 2\frac{v^Tx}{v^Tv}c_2z$ verlangt, dass der Faktor vor $x$ verschwindet. Nachrechnen ergibt $c_2^2\|z\|_2^2 = \|x\|_2^2$.
      Das Vorzeichen wählt man so, dass $\|v\|_2$ möglichst groß wird (keine Auslöschung):</p>
    $$v = x + \operatorname{sgn}\bigl((x, z)_2\bigr)\frac{\|x\|_2}{\|z\|_2}z, \qquad \beta = -\operatorname{sgn}\bigl((x, z)_2\bigr)\frac{\|x\|_2}{\|z\|_2}. \tag{12.1, 12.2}$$
    ${widget('householder', {}, tx`Für $z = e_1$: $v = x + \operatorname{sgn}(x_1)\|x\|e_1$ und $Q_vx = \beta e_1$ mit $|\beta| = \|x\|_2$ – Spiegelungen ändern die Länge nicht.`)}

    ${box('satz', '12.3 (Volle QR-Zerlegung)', tx`Sei $A \in \R^{m\times n}$, $m \ge n$, $\operatorname{Rang}(A) = n$. Dann gilt:
      <ol type="a">
        <li>Es gibt ein orthogonales $Q \in \R^{m\times m}$ und eine obere Dreiecksmatrix $R \in \R^{m\times n}$ mit $A = QR$.</li>
        <li>Die ersten $n$ Spalten von $Q$ bilden eine Orthonormalbasis von $\operatorname{Bild}(A)$, die übrigen eine von $\operatorname{Bild}(A)^\perp$.</li>
        <li>Die ersten $n$ Spalten von $Q$ und das obere $n\times n$-Dreieck von $R$ stimmen mit der schmalen QR-Zerlegung überein.</li>
      </ol>
      ${proof(tx`<p>Konstruktiv. Schritt 1: Wähle $v_1 = a_1 + \operatorname{sgn}(a_{11})\|a_1\|e_1$, dann hat $Q_{v_1}A$ in der ersten Spalte nur noch $\beta_1$ oben.</p>
        <p>Schritt $k$: Ist $Q_{v_{k-1}}\cdots Q_{v_1}A = \begin{bmatrix}R^{(k-1)} & B^{(k-1)}\\ 0 & C^{(k-1)}\end{bmatrix}$, so spiegelt man die erste Spalte $c_1$ von $C^{(k-1)}$ auf $\beta_ke_1$.
        Mit dem durch $k-1$ Nullen ergänzten Vektor $v_k$ ist $Q_{v_k} = \begin{bmatrix}I & 0\\ 0 & Q_{\tilde v_k}\end{bmatrix}$ – die fertigen Teile bleiben unberührt. Das Update ist wieder ein
        Rang-1-Update: $\tilde C = C - \frac{2}{\|\tilde v_k\|^2}\tilde v_k(\tilde v_k^TC)$ (12.3).</p>
        <p>Nach $n$ Schritten: $Q_{v_n}\cdots Q_{v_1}A = R$, also $A = QR$ mit $Q = Q_{v_1}\cdots Q_{v_n}$. b) und c) folgen aus der Blockzerlegung $Q = [\tilde Q\;\hat Q]$, $R = \begin{bmatrix}\tilde R\\0\end{bmatrix}$,
        $A = \tilde Q\tilde R$, und der Eindeutigkeit der schmalen Zerlegung.</p>`)}`)}
    ${widget('householder-qr', {}, 'Jede Spiegelung erzeugt die Nullen einer Spalte – wie bei der Gauß-Elimination, aber mit orthogonalen statt Frobeniusmatrizen.')}
  `,
};

const implementierung = {
  id: 'implementierung-qr',
  title: '12.3 Bemerkungen zur Implementierung',
  body: tx`
    ${list([
      tx`$Q$ wird <strong>nie explizit</strong> aufgestellt. Man speichert nur die Householder-Vektoren $v_1, \dots, v_n$ (in den Nullstellen von $A$, wie bei LU) und die Diagonale $\beta_k$ von $R$ in einem Extra-Vektor.`,
      tx`$Q_vx = x - 2\frac{v^Tx}{v^Tv}v$ braucht nur ein Skalarprodukt und ein Vektorupdate – keine Matrix-Vektor-Multiplikation.`,
      tx`$Q^T = Q_{v_n}\cdots Q_{v_1}$: Für $Q^T$ wendet man die Spiegelungen in umgekehrter Reihenfolge an.`,
    ])}
    ${box('merke', 'Bemerkung 12.4 (Aufwand)', tx`$N_{QR}(n) = \frac43n^3 + O(n^2)$ – doppelt so viel wie LU. Dafür ist die QR-Zerlegung stabil, ganz ohne Pivotisierung, weil orthogonale
      Matrizen die 2-Norm (und damit Fehler) nicht verstärken.`)}
    <h3>Anwendungen</h3>
    ${list([
      tx`<strong>Ausgleichsprobleme:</strong> $\|Ax - b\|_2 = \|Q^T(Ax - b)\|_2 = \|Rx - Q^Tb\|_2$. Löse $\tilde Rx = (Q^Tb)_{1..n}$ durch Rückwärtseinsetzen – die Kondition wird <em>nicht</em> quadriert.`,
      tx`<strong>Reguläre Gleichungssysteme:</strong> $Ax = b \Leftrightarrow Rx = Q^Tb$.`,
      tx`<strong>Eigenwerte:</strong> Grundbaustein der QR-Iteration.`,
    ], true)}
  `,
};

export default {
  id: 'vl12',
  number: 12,
  title: 'QR-Zerlegung',
  summary: 'Householder-Spiegelungen, die volle QR-Zerlegung Schritt für Schritt, Implementierung und Anwendungen auf Ausgleichsprobleme.',
  sections: [householder, herleitung, implementierung],
};
