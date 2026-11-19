/**
 * Vorlesung 17: Polynominterpolation
 */
import { box, exercise, lead, list, tx, widget } from './blocks.js';

const einfuehrung = {
  id: 'einfuehrung-interpolation',
  title: '17.1 Einführung',
  body: tx`
    ${lead(`Eine Funktion ist nur an einzelnen Punkten bekannt – wie sieht sie dazwischen aus? Polynome sind die einfachste Antwort,
      aber die naheliegende Rechnung ist ausgerechnet die schlechteste.`)}
    <p>Anwendungen der Darstellung von Funktionen durch Daten:</p>
    ${list([
      'Rekonstruktion eines Zusammenhangs aus Messwerten (und Werte zwischen den Messpunkten),',
      'teure Funktionen billiger auswerten (früher: Logarithmentafeln mit Interpolation),',
      'Schriftarten (Fonts) und CAD-Modelle dreidimensionaler Körper,',
      'Lösung von Differential- und Integralgleichungen (die Lösung ist eine Funktion),',
      'Datenkompression.',
    ], true)}
    <p>Eine Funktion $f \in C^m([a, b])$ lässt sich nicht exakt speichern ($C^m$ ist unendlichdimensional). Man nähert sie durch Funktionen mit endlich vielen Parametern:
      Polynome $\sum a_ix^i$, rationale Funktionen, trigonometrische Polynome $\frac12a_0 + \sum(a_k\cos kx + b_k\sin kx)$, Exponentialsummen $\sum a_ke^{b_kx}$, …</p>
    <p>Die Grundaufgabe der <strong>Approximation</strong>: Finde $g$ aus einer Funktionenmenge $P$, so dass $f - g$ minimal wird, z.&nbsp;B. im $L^2$-Sinn $\int(f - g)^2 \to \min$
      oder in der Maximumnorm. <strong>Interpolation</strong> ist der Spezialfall, dass $g$ durch $g(x_i) = y_i = f(x_i)$ festgelegt wird.</p>
    ${box('definition', '17.1 (Interpolationsaufgabe)', tx`Zu $n + 1$ paarweise verschiedenen Stützstellen $x_0, \dots, x_n$ und Werten $y_0, \dots, y_n$ finde
      $$p \in P_n = \Bigl\{\sum_{i=0}^na_ix^i\Bigr\}: \qquad p(x_i) = y_i, \quad i = 0, \dots, n.$$`)}
    <h3>Der naive Weg: Vandermonde</h3>
    <p>Mit dem Ansatz $p(x) = \sum_ja_jx^j$ (Monombasis) ergibt sich das lineare Gleichungssystem</p>
    $$\begin{bmatrix}1 & x_0 & x_0^2 & \dots & x_0^n\\ \vdots & & & & \vdots\\ 1 & x_n & x_n^2 & \dots & x_n^n\end{bmatrix}\begin{bmatrix}a_0\\ \vdots\\ a_n\end{bmatrix} = \begin{bmatrix}y_0\\ \vdots\\ y_n\end{bmatrix}
      \;\Leftrightarrow\; V[x_0, \dots, x_n]\,a = y \tag{17.1}$$
    <p>mit der <strong>Vandermonde-Matrix</strong>. Zwei Nachteile: Aufwand $O(n^3)$ und eine Kondition, die <strong>exponentiell</strong> mit $n$ wächst.</p>
  `,
};

const lagrange = {
  id: 'lagrange-interpolation',
  title: '17.2 Lagrange-Interpolation',
  body: tx`
    ${lead('Der Schlüssel ist eine bessere Basis: Polynome, die an genau einer Stützstelle 1 und an allen anderen 0 sind.')}
    ${box('definition', '17.2 (Lagrange-Polynome)', tx`$$L_i^{(n)}(x) = \prod_{j=0,\,j\neq i}^n\frac{x - x_j}{x_i - x_j}, \qquad i = 0, \dots, n.$$`)}
    ${box('lemma', '17.3', tx`<ol type="a">
      <li>$L_i^{(n)}$ hat Grad $n$ (Produkt aus $n$ Linearfaktoren).</li>
      <li>$L_i^{(n)}(x_k) = \delta_{ik}$ – im Zähler steht für $k \neq i$ der Faktor $x_k - x_k = 0$, für $k = i$ ist jeder Faktor 1.</li>
      <li>Die $L_i^{(n)}$ bilden eine Basis von $P_n$ (linear unabhängig wegen b), und es sind $n + 1 = \dim P_n$ Stück).</li>
    </ol>`)}
    ${box('satz', '17.4 / 17.5', tx`$$p(x) = \sum_{i=0}^n y_i\,L_i^{(n)}(x)$$
      interpoliert die Daten, denn $p(x_k) = \sum_iy_i\delta_{ik} = y_k$. Das Interpolationspolynom ist <strong>eindeutig</strong>, da die Darstellung in einer Basis eindeutig ist.
      (Damit ist auch die Vandermonde-Matrix regulär.)`)}
    ${widget('lagrange-basis', {}, 'Beispiel 17.6: Die vier Datenpunkte stammen übrigens von sin(x)/x. In der Lagrange-Basis ist das „Gleichungssystem“ einfach I·a = y.')}
  `,
};

const newton = {
  id: 'newton-interpolation',
  title: '17.3 Newton-Interpolation',
  body: tx`
    ${lead('Nachteil der Lagrange-Basis: Kommt eine Stützstelle hinzu, ändern sich alle Basispolynome. Die Newton-Basis wächst dagegen einfach mit.')}
    ${box('definition', '17.7 (Newton-Polynome)', tx`$$N_0(x) = 1, \qquad N_i(x) = \prod_{j=0}^{i-1}(x - x_j), \quad i = 1, \dots, n.$$`)}
    ${box('lemma', '17.8', tx`a) $N_i$ hat Grad $i$. b) $N_i(x_k) = 0$ für alle $k < i$. c) Die $N_i$ bilden eine Basis von $P_n$.`)}
    <p>Wegen b) ist $p(x_k) = \sum_{i=0}^ka_iN_i(x_k) = y_k$ ein <strong>unteres Dreieckssystem</strong>:</p>
    $$a_0 = y_0, \qquad a_k = \Bigl(y_k - \sum_{i=0}^{k-1}a_iN_i(x_k)\Bigr)\Big/N_k(x_k).$$
    <p>Kommt $x_{n+1}$ hinzu, bleiben $a_0, \dots, a_n$ unverändert – man berechnet nur $a_{n+1}$.</p>
    ${box('satz', '17.9 (Dividierte Differenzen)', tx`$p(x) = \sum_{i=0}^ny[x_0, \dots, x_i]\,N_i(x)$ mit den rekursiv definierten <strong>dividierten Differenzen</strong>
      $$y[x_i] = y_i, \qquad y[x_i, \dots, x_{i+k}] = \frac{y[x_{i+1}, \dots, x_{i+k}] - y[x_i, \dots, x_{i+k-1}]}{x_{i+k} - x_i}.$$
      Numerisch stabiler als die naive Variante, bei gleichem Aufwand. Jeder Eintrag des Tableaus entsteht aus seinen beiden linken Nachbarn.`)}
    ${box('satz', '17.10 (Neville-Schema)', tx`Für einen festen Punkt $x$ gilt $p(x) = p_{0,n}(x)$ mit
      $$p_{i,i}(x) = y_i, \qquad p_{i,i+k}(x) = p_{i,i+k-1}(x) + (x - x_i)\frac{p_{i+1,i+k}(x) - p_{i,i+k-1}(x)}{x_{i+k} - x_i}.$$
      $p_{i,i+k}$ ist das Interpolationspolynom zu $x_i, \dots, x_{i+k}$, ausgewertet in $x$ – Aufstellen und Auswerten in einem Schema.`)}
    ${widget('newton-interpolation', {}, 'Fügen Sie Stützstellen hinzu: Im Tableau der dividierten Differenzen kommt nur eine neue Diagonale dazu, die oberste Zeile (die Koeffizienten) wird nur verlängert.')}
    ${exercise(tx`Was ist $y[x_0, x_1]$ anschaulich? Und $y[x_0, \dots, x_n]$?`,
      tx`$y[x_0, x_1] = \frac{y_1 - y_0}{x_1 - x_0}$ ist die Sekantensteigung – ein Differenzenquotient. Allgemein ist $y[x_0, \dots, x_n]$ der führende Koeffizient
      (vor $x^n$) des Interpolationspolynoms; für $y_i = f(x_i)$ gilt $y[x_0, \dots, x_n] = f^{(n)}(\xi)/n!$ für ein $\xi$ – eine Näherung der $n$-ten Ableitung (vgl. Abschnitt 18.2).`)}
  `,
};

export default {
  id: 'vl17',
  number: 17,
  title: 'Polynominterpolation',
  summary: 'Interpolationsaufgabe und Vandermonde-Matrix, Lagrange-Basis, Newton-Basis mit dividierten Differenzen und das Neville-Schema.',
  sections: [einfuehrung, lagrange, newton],
};
