/**
 * Vorlesung 24: Adaptive Approximation mit Haar-Wavelets
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const motivation = {
  id: 'motivation-wavelets',
  title: '24.1 Motivation',
  body: tx`
    ${lead(`Wir wollen garantierte Fehlerkontrolle ‖f − g‖ ≤ TOL·‖f‖ mit möglichst wenigen Basisfunktionen. Das gelingt nur, wenn die Basis
      dort fein auflösen kann, wo f sich stark ändert – und anderswo grob bleiben darf.`)}
    <p>Viele Funktionen variieren nur <strong>lokal</strong> stark. So ist $f(x) = \frac1{10x^2 + \epsilon}$ für kleines $\epsilon$ nahe $0$ sehr steil, weiter weg dagegen glatt und mit wenig Aufwand darstellbar.</p>
    ${box('definition', '24.1 (Träger)', tx`Der <strong>Träger</strong> (Support) von $f: D \to \R$ ist die kleinste abgeschlossene Menge, außerhalb der $f$ verschwindet:
      $$\operatorname{supp}(f) = \overline{\{x \in D : f(x) \ne 0\}}.$$`)}
    <p>Fourier-Funktionen und Legendre-Polynome haben einen <strong>globalen</strong> Träger: $\operatorname{supp}\psi = D$. Jede Basisfunktion „sieht“ das ganze Intervall, eine lokale Spitze von $f$ beeinflusst
      daher <em>alle</em> Koeffizienten. Wünschenswert ist eine Basis mit folgenden Eigenschaften:</p>
    ${list([
      tx`<strong>Orthonormalbasis:</strong> $\langle\psi_i, \psi_j\rangle = \delta_{ij}$ – Koeffizienten und Fehler sind dann einfach (Vorlesung 23).`,
      tx`<strong>Hierarchisch:</strong> $\Psi_N \subset \Psi_{N+1}$ – das erlaubt adaptive Verfeinerung.`,
      tx`<strong>Schrumpfende Träger:</strong> Der Träger von $\psi_i$ wird für $i \to \infty$ immer kleiner – feine Basisfunktionen wirken nur lokal.`,
    ], true)}
    <p>Funktionen mit diesen Eigenschaften heißen <strong>Wavelets</strong>. Das einfachste ist das Haar-Wavelet (Alfréd Haar, 1909).</p>
  `,
};

const haar = {
  id: 'haar-wavelets',
  title: '24.2 Haar-Wavelets',
  body: tx`
    ${lead('Aus einer einzigen Treppenfunktion entsteht durch Stauchen und Verschieben eine ganze Orthonormalbasis mit Baumstruktur.')}
    <p>Sei $\chi$ die Indikatorfunktion von $(0, 1]$: $\chi(x) = 1$ für $0 < x \le 1$, sonst $0$.</p>
    ${box('definition', '24.2 (Haar-Waveletbasis)', tx`Das <strong>„mother wavelet“</strong> ist
      $$\psi(x) = \chi(2x) - \chi\bigl(2(x - \tfrac12)\bigr) = \begin{cases}1 & 0 < x \le \frac12\\ -1 & \frac12 < x \le 1\\ 0 & \text{sonst.}\end{cases} \tag{24.1}$$
      Die Basisfunktionen $\psi_i^k$ tragen einen Doppelindex: die <strong>Stufe</strong> $k \in \N_0$ und die Nummer $0 \le i < 2^{\max(0, k-1)}$ innerhalb der Stufe:
      $$\psi_0^0 = \chi, \qquad \psi_0^1 = \psi, \qquad \psi_i^k(x) = 2^{\frac{k-1}2}\,\psi\Bigl(2^{k-1}\Bigl(x - \frac i{2^{k-1}}\Bigr)\Bigr) \quad (k > 1). \tag{24.2–24.4}$$
      Die Haar-Waveletbasis der Stufe $k$ ist $\Psi^k = \{\psi_0^0\} \cup \bigcup_{l=1}^k\{\psi_i^l : 0 \le i < 2^{l-1}\}$ (24.5).`)}
    <p>Lesart: $2^{k-1}$ im Argument staucht den Träger auf die Länge $2^{-(k-1)}$, der Summand $-\frac i{2^{k-1}}$ verschiebt ihn nach rechts, und der Vorfaktor $2^{\frac{k-1}2}$ gleicht die Stauchung aus, sodass $\|\psi_i^k\| = 1$.</p>
    ${widget('haar-basis', {}, 'Abbildung 24.2 zum Anklicken: Jede Stufe halbiert die Trägerlänge und verdoppelt die Anzahl der Wavelets.')}
    ${box('lemma', '24.3 (Eigenschaften der Haar-Wavelets)', tx`Die Funktionen in $\Psi^k$ bilden eine Orthonormalbasis, und es gilt:
      ${list([
        tx`Auf Stufe $k$ gibt es $2^{\max(0, k-1)}$ Wavelets, also $|\Psi^k| = 2^k$.`,
        tx`$\operatorname{supp}\psi_0^0 = \operatorname{supp}\psi_0^1 = [0, 1]$ und $\operatorname{supp}\psi_i^k = \bigl[\frac i{2^{k-1}}, \frac{i+1}{2^{k-1}}\bigr]$.`,
        tx`Baumstruktur: $\operatorname{supp}\psi_i^k = \operatorname{supp}\psi_{2i}^{k+1} \cup \operatorname{supp}\psi_{2i+1}^{k+1}$ für $k > 0$.`,
        tx`$\psi_i^k$ ist nur in $\frac{2i}{2^k}, \frac{2i+1}{2^k}, \frac{2i+2}{2^k}$ unstetig; alle Unstetigkeiten der Stufe $k$ liegen bei Vielfachen von $2^{-k}$.`,
        tx`Orthonormalität: $\langle\psi_i^k, \psi_j^l\rangle = \delta_{ij}\delta_{kl}$.`,
        tx`Die Basis ist hierarchisch: $\Psi^k \subset \Psi^{k+1}$.`,
      ], true)}
      ${proof(tx`<p>i) Auf den Stufen 0 und 1 je eine Funktion, also $\dim\Psi^1 = 2$; danach $\dim\Psi^k = \dim\Psi^{k-1} + 2^{k-1} = 2^k$.</p>
        <p>ii)/iii) Verschiebung um $\frac i{2^{k-1}}$ und Stauchung um $2^{k-1}$ liefern den Träger; die Träger der Kinder sind $\bigl[\frac{2i}{2^k}, \frac{2i+1}{2^k}\bigr]$ und $\bigl[\frac{2i+1}{2^k}, \frac{2i+2}{2^k}\bigr]$, zusammen $\bigl[\frac i{2^{k-1}}, \frac{i+1}{2^{k-1}}\bigr]$.</p>
        <p>v) Auf gleicher Stufe mit $i \ne j$ sind die Träger disjunkt. Für $k > l$ liegen die Unstetigkeiten von $\psi_j^l$ bei Vielfachen von $2^{-l}$, also nie im Inneren des Trägers von $\psi_i^k$. Dort ist $\psi_j^l \equiv c$ konstant und
          $\langle\psi_i^k, \psi_j^l\rangle = c\int\psi_i^k\,dx = 0$. Normierung: $\int(2^{\frac{k-1}2}\cdot(\pm1))^2dx = 2^{k-1}\cdot2^{-(k-1)} = 1$.</p>`)}`)}

    <h3>Welche Funktionen lassen sich darstellen?</h3>
    ${box('lemma', '24.4', tx`Seien $\chi_i^k$ die Indikatorfunktionen der Intervalle $\bigl(\frac i{2^k}, \frac{i+1}{2^k}\bigr]$, $0 \le i < 2^k$. Dann gilt
      $$S^k := \operatorname{span}\{\chi_i^k\} = \operatorname{span}\Psi^k = \Bigl\{v : (0, 1] \to \R \;\Big|\; v \text{ ist konstant auf jedem } \bigl(\tfrac i{2^k}, \tfrac{i+1}{2^k}\bigr]\Bigr\}.$$
      Beide Basen spannen also die <strong>Treppenfunktionen</strong> zur Schrittweite $2^{-k}$ auf. Für $k = 1$ etwa ist $\chi_0^1 = \frac12\psi_0^0 + \frac12\psi_0^1$ und $\chi_1^1 = \frac12\psi_0^0 - \frac12\psi_0^1$ (24.7).`)}
    <p>Die Bestapproximation von $f$ in $S^k$ ist besonders anschaulich: Auf jedem Teilintervall nimmt sie den <strong>Mittelwert</strong> von $f$ an (die Basis $\chi_i^k$ ist orthogonal, und $\langle f, \chi_i^k\rangle/\langle\chi_i^k, \chi_i^k\rangle$ ist genau der Mittelwert).</p>

    <h3>Basiswechsel in linearer Zeit</h3>
    ${box('lemma', '24.5 (Basistransformationen)', tx`Sei $v \in S^k$ dargestellt als $v = \sum_{i=0}^{2^k-1}\alpha_i^k\chi_i^k = \beta_0^0\psi_0^0 + \sum_{l=1}^k\sum_{i=0}^{2^{l-1}-1}\beta_i^l\psi_i^l$.
      <p><strong>Wavelet → Standard</strong> (Stufen $l = 1, \dots, k$ von grob nach fein), mit $\alpha^0_0 = \beta^0_0$:</p>
      $$\alpha_i^l = \alpha_{\lfloor i/2\rfloor}^{l-1} + (-1)^i\,2^{\frac{l-1}2}\,\beta_{\lfloor i/2\rfloor}^l, \qquad 0 \le i < 2^l.$$
      <p><strong>Standard → Wavelet</strong> (Stufen $l = k, \dots, 1$ von fein nach grob):</p>
      $$\beta_i^l = 2^{-\frac{l-1}2}\,\frac{\alpha_{2i}^l - \alpha_{2i+1}^l}2, \qquad \alpha_i^{l-1} = \frac{\alpha_{2i}^l + \alpha_{2i+1}^l}2, \qquad \beta_0^0 = \alpha_0^0.$$
      Beide Richtungen kosten $O(2^k)$ Operationen – linear in der Zahl der Basisfunktionen.`)}
    ${box('intuition', 'Mittelwert und Differenz', tx`Der Schritt von fein nach grob ersetzt je zwei Nachbarwerte durch ihren <strong>Mittelwert</strong> (geht eine Stufe nach oben) und ihre halbe <strong>Differenz</strong> (wird zum Wavelet-Koeffizienten).
      Ist $f$ lokal fast konstant, sind die Differenzen – und damit die feinen $\beta$ – winzig. Der Faktor $2^{-\frac{l-1}2}$ stammt von der Normierung der $\psi_i^l$; für $l = 1$ entfällt er, was mit (24.7) übereinstimmt.`)}
    ${exercise(tx`Rechnen Sie $v = 3\chi_0^1 + 1\chi_1^1$ (also $\alpha^1 = (3, 1)$) in die Wavelet-Basis um. Wie groß ist $\|v\|^2$ in beiden Darstellungen?`,
      tx`$\beta_0^1 = \frac{3 - 1}2 = 1$, $\alpha_0^0 = \frac{3 + 1}2 = 2 = \beta_0^0$, also $v = 2\psi_0^0 + 1\psi_0^1$. Parseval: $\|v\|^2 = 2^2 + 1^2 = 5$. Direkt: $\int_0^{1/2}9\,dx + \int_{1/2}^11\,dx = 4{,}5 + 0{,}5 = 5$. ✓`)}
  `,
};

const kompression = {
  id: 'datenkompression',
  title: '24.3 Datenkompression mit Wavelets',
  body: tx`
    ${lead(`Jetzt kommt alles zusammen: Orthonormalität liefert den Fehler gratis (23.4), die Baumstruktur sagt, wo man verfeinern kann, und die
      lokalen Träger sorgen dafür, dass man nur dort verfeinert, wo es nötig ist.`)}
    <p>Eine Indexmenge $I \subseteq \{(i, k)\}$ wählt Basisfunktionen aus; $\tilde f = \sum_{(i,k)\in I}\langle f, \psi_i^k\rangle\psi_i^k$ ist die Bestapproximation im zugehörigen Teilraum.</p>
    ${box('algorithmus', '24.6 (adaptive Kompression)', tx`<strong>Gegeben:</strong> $f \in S^k$. <strong>Gesucht:</strong> $\tilde S \subset S^k$ möglichst klein mit $\|f - \tilde f\| \le \mathrm{TOL}\,\|f\|$.
      <ol>
        <li>Wähle die Startmenge $I = \{(0, 0)\}$ und berechne $s = \sum_{(i,k)\in I}\langle f, \psi_i^k\rangle^2$.</li>
        <li><strong>Solange</strong> $s < (1 - \mathrm{TOL}^2)\langle f, f\rangle$: wähle unter allen Kindern $(j, l + 1)$ von Knoten $(i, l) \in I$ dasjenige mit maximalem $\langle f, \psi_j^{l+1}\rangle^2$,
          setze $I = I \cup \{(j, l + 1)\}$ und $s = s + \langle f, \psi_j^{l+1}\rangle^2$.</li>
      </ol>
      Das Abbruchkriterium ist genau (23.4): Wegen der Orthonormalität ist $\|f - \tilde f\|^2 = \langle f, f\rangle - s$.`)}
    ${widget('haar-compression', {}, 'Adaptive Kompression: Der Wavelet-Baum wächst nur dort in die Tiefe, wo f sich stark ändert. Vergleichen Sie mit der Zahl der Koeffizienten bei uniformer Verfeinerung.')}
    ${box('merke', 'Warum das funktioniert', list([
      tx`Wo $f$ glatt ist, unterscheiden sich benachbarte Mittelwerte kaum: Die feinen Koeffizienten $\beta_i^l$ fallen etwa wie $2^{-l}\cdot2^{-\frac l2}$ und werden nie ausgewählt.`,
      tx`An Sprüngen und Spitzen bleiben die Koeffizienten auf allen Stufen groß – dort wächst der Baum bis zur feinsten Stufe.`,
      'Dasselbe Prinzip – Transformation in eine Wavelet-Basis, kleine Koeffizienten weglassen – steckt (mit glatteren Wavelets) in der Bildkompression JPEG 2000.',
    ]))}
  `,
};

export default {
  id: 'vl24',
  number: 24,
  title: 'Adaptive Approximation mit Haar-Wavelets',
  summary: 'Basisfunktionen mit lokalem Träger: Haar-Wavelets, ihre Baumstruktur, Basiswechsel in linearer Zeit und adaptive Datenkompression mit garantierter Toleranz.',
  sections: [motivation, haar, kompression],
};
