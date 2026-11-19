/**
 * Vorlesung 10: Spezielle Gleichungssysteme
 */
import { box, lead, proof, tx, widget } from './blocks.js';

const spd = {
  id: 'spd-matrizen',
  title: '10.1 Symmetrisch positiv definite Matrizen',
  body: tx`
    ${lead(`Für symmetrisch positiv definite Matrizen (wie beim Knotenpotentialverfahren) braucht man gar keine Pivotisierung –
      und mit der Cholesky-Zerlegung nur den halben Aufwand.`)}
    ${box('satz', '10.1', tx`Eine symmetrisch positiv definite Matrix $A \in \R^{n\times n}$ ist stets <strong>ohne Pivotisierung</strong> stabil LU-zerlegbar. Für die Pivots gilt
      $$u_{kk} \ge \lambda_\text{min}(A), \qquad 1 \le k \le n.$$
      ${proof(tx`<p>Mit $A = \begin{bmatrix}\alpha & v^T\\ v & B\end{bmatrix}$ liefert ein Eliminationsschritt die Restmatrix $B - \frac1\alpha vv^T$. Mit
        $X = \begin{bmatrix}1 & -v^T/\alpha\\ 0 & I\end{bmatrix}$ gilt $X^TAX = \begin{bmatrix}\alpha & 0\\ 0 & B - \frac1\alpha vv^T\end{bmatrix}$. Da $X$ regulär ist, ist diese Matrix und damit
        auch die Restmatrix wieder symmetrisch positiv definit.</p>
        <p>Für SPD-Matrizen gilt $(Ax, x)_2 \ge \lambda_\text{min}(A)(x, x)_2$ (Entwicklung in Eigenvektoren). Mit Einheitsvektoren folgt $a_{ii} \ge \lambda_\text{min}(A)$, und für die
        Diagonale der Restmatrix $(B - \frac1\alpha vv^T)_{ii} = (AXz, Xz)_2 \ge \lambda_\text{min}(A)(1 + v_i^2/\alpha^2) \ge \lambda_\text{min}(A)$.</p>`)}`)}
    <p>Die Pivots können also nie null (oder klein im Verhältnis zur Kondition) werden. Die Einträge von $L$ sind $a_{ik}/a_{kk} \le a_{ik}/\lambda_\text{min}$ – sie wachsen nicht schlimmer
      als $\operatorname{cond}_2(A) = \lambda_\text{max}/\lambda_\text{min}$.</p>
    ${box('satz', '10.2 (Cholesky-Zerlegung)', tx`Für symmetrisch positiv definite $A$ existieren
      $$A = LDL^T \quad\text{und}\quad A = \tilde L\tilde L^T \;\;(\tilde L = LD^{1/2}),$$
      mit $L$ unterer Dreiecksmatrix mit Einsen auf der Diagonale und $D$ diagonal mit positiven Einträgen. Aufwand $\frac13n^3 + O(n^2)$, Speicher $n(n+1)/2$.
      ${proof(tx`Induktion mit dem Block-Schritt aus Satz 10.1: $A = \begin{bmatrix}1 & 0\\ v/\alpha & I\end{bmatrix}\begin{bmatrix}\alpha & 0\\ 0 & B - \frac1\alpha vv^T\end{bmatrix}\begin{bmatrix}1 & v^T/\alpha\\ 0 & I\end{bmatrix}$
        und Zerlegung der SPD-Restmatrix nach Induktionsannahme. Wegen der Symmetrie des Rang-1-Updates muss nur die Hälfte gerechnet und gespeichert werden.`)}`)}
    ${widget('cholesky', {}, tx`Die Pivots $d_k$ sind die Diagonale von $D$. Bei einer indefiniten Matrix taucht irgendwann ein Pivot $\le 0$ auf – so testet man praktisch, ob eine Matrix positiv definit ist.`)}
  `,
};

const diagdom = {
  id: 'diagonaldominant',
  title: '10.2 Diagonaldominante Matrizen',
  body: tx`
    ${box('definition', '10.3', tx`$A \in \R^{n\times n}$ heißt <strong>diagonaldominant</strong>, falls $\sum_{j\neq i}|a_{ij}| \le |a_{ii}|$ für alle $i$.
      (Achtung: Manche Autoren unterscheiden starke und schwache Diagonaldominanz.)`)}
    ${box('satz', '10.4', tx`Ist $A$ regulär und diagonaldominant, so existiert eine LU-Zerlegung ohne Pivotisierung.
      ${proof(tx`Mit $A = \begin{bmatrix}\alpha & w^T\\ v & B\end{bmatrix}$ ist $|\alpha| > 0$ (wegen Diagonaldominanz bzw. Regularität). Für die Restmatrix $B - \frac1\alpha vw^T$ zeigt man mit
        der Diagonaldominanz von $A$ und der inversen Dreiecksungleichung
        $\sum_{j\neq i}|b_{ij} - \frac{v_iw_j}{\alpha}| \le |b_{ii} - \frac{v_iw_i}{\alpha}|$ – die Restmatrix ist wieder diagonaldominant, und man fährt rekursiv fort.`)}`)}
    ${box('intuition', '', 'Das Gewicht der Diagonale überträgt sich auf jede Restmatrix: Die Diagonale bleibt „stark genug“, ein Pivot 0 kann nicht auftreten.')}
  `,
};

const band = {
  id: 'bandmatrizen',
  title: '10.3 Bandmatrizen',
  body: tx`
    ${lead('Viele Matrizen aus Anwendungen haben nur Einträge nahe der Diagonale. Das lässt sich enorm ausnutzen.')}
    ${box('definition', '10.5', tx`$A$ heißt <strong>Bandmatrix mit Bandbreite $m$</strong>, falls $|i - j| \ge m \Rightarrow a_{ij} = 0$. ($m = 1$: Diagonalmatrix, $m = 2$: Tridiagonalmatrix.)`)}
    ${box('satz', '10.6', tx`Ist $A$ eine Bandmatrix mit Bandbreite $m$ und ohne Pivotisierung LU-zerlegbar, so sind auch $L$ und $U$ Bandmatrizen mit Bandbreite $m$. Der Aufwand ist
      $$N_\text{Band}(n, m) \le 2nm^2 + nm$$
      statt $\frac23n^3$, der Speicher $O(2nm)$ statt $O(n^2)$.
      ${proof(tx`In der Blockzerlegung $A = \begin{bmatrix}\alpha & w^T & 0\\ v & B & C\\ 0 & D & E\end{bmatrix}$ (Blockgrößen $1$, $m-1$, $n-m$) verändert ein Eliminationsschritt nur den
        $(m-1)\times(m-1)$-Block $B$; $C$, $D$, $E$ bleiben unverändert. Die Restmatrix ist also wieder eine Bandmatrix. Pro Schritt kostet das $(m-1) + 2(m-1)^2$ Operationen.`)}`)}
    ${widget('sparsity-fill', { preset: 'band' }, 'Bei Bandmatrizen entsteht kein Fill-in außerhalb des Bandes. Für eine Tridiagonalmatrix (m = 2) kostet die Zerlegung nur O(n) statt O(n³) Operationen!')}
  `,
};

export default {
  id: 'vl10',
  number: 10,
  title: 'Spezielle Gleichungssysteme',
  summary: 'Symmetrisch positiv definite Matrizen und die Cholesky-Zerlegung, diagonaldominante Matrizen und Bandmatrizen – wann Pivotisierung überflüssig ist.',
  sections: [spd, diagdom, band],
};
