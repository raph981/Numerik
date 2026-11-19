/**
 * Vorlesung 21: Interpolation mit Splines
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const raeume = {
  id: 'spline-raeume',
  title: '21.1 Spline-Räume',
  body: tx`
    ${lead(`Statt eines Polynoms hohen Grades nimmt man viele Polynome niedrigen Grades und klebt sie glatt aneinander. So entkoppelt man
      die Zahl der Stützstellen vom Polynomgrad – und das Runge-Phänomen verschwindet.`)}
    ${box('definition', '21.1 (Spline-Raum)', tx`Zu einer Zerlegung $X: a = x_0 < x_1 < \dots < x_n = b$ und $m \in \N$ heißt
      $$S^m(X) = \bigl\{s \in C^{m-1}[a, b] : s|_{[x_i, x_{i+1}]} \in P_m,\; 0 \le i < n\bigr\}$$
      Spline-Raum vom Grad $m$: stückweise Polynome vom Grad $m$, die $(m-1)$-mal stetig differenzierbar zusammengesetzt sind. $S^m(X)$ ist ein endlichdimensionaler Vektorraum.`)}
    ${box('beispiel', '21.2', tx`$S^1(X)$: stetige, stückweise lineare Funktionen – ein Polygonzug. Ein Element ist durch seine Werte in den Stützstellen eindeutig bestimmt, $\dim S^1(X) = \#X$.`)}
    <p>Besonders beliebt sind <strong>kubische Splines</strong> $S^3(X)$. Historisch bog man im Schiffs- und Flugzeugbau dünne Holzlatten („Straklatten“, englisch <em>spline</em>) durch
      Nägel. Die Latte nimmt die Form minimaler Biegeenergie an:</p>
    $$\int_a^b\frac{|y''(t)|^2}{1 + |y'(t)|^2}\,dt \;\approx\; \int_a^b|y''(t)|^2\,dt \to \min \qquad (|y'| \ll 1).$$
  `,
};

const konstruktion = {
  id: 'kubische-splines',
  title: '21.2 Konstruktion kubischer Splines',
  body: tx`
    ${lead('Vier Koeffizienten pro Teilintervall, die Glattheitsbedingungen verknüpfen sie – am Ende bleibt ein tridiagonales Gleichungssystem.')}
    <p>$s$ besteht aus $n$ kubischen Polynomen $p_i$ auf $[x_{i-1}, x_i]$ mit insgesamt $4n$ Parametern. Bedingungen:</p>
    ${list([
      tx`<strong>Interpolation:</strong> $p_i(x_{i-1}) = y_{i-1}$, $p_i(x_i) = y_i$ – $2n$ Bedingungen.`,
      tx`<strong>Glattheit:</strong> $p_i'(x_i) = p_{i+1}'(x_i)$ und $p_i''(x_i) = p_{i+1}''(x_i)$ an den inneren Punkten – $2n - 2$ Bedingungen.`,
      tx`<strong>Randbedingungen</strong> für die fehlenden zwei: natürlich $p_1''(x_0) = p_n''(x_n) = 0$, Hermite $p_1'(x_0) = f'(x_0)$, $p_n'(x_n) = f'(x_n)$, oder periodisch.`,
    ], true)}
    ${box('satz', '21.3 (Berechnung kubischer Splines)', tx`Schreibt man $p_i(x) = a_0^{(i)} + a_1^{(i)}(x - x_i) + a_2^{(i)}(x - x_i)^2 + a_3^{(i)}(x - x_i)^3$, so lösen die $a_2^{(i)}$ das
      $(n-1)$-dimensionale System
      $$h_ia_2^{(i-1)} + 2(h_i + h_{i+1})a_2^{(i)} + h_{i+1}a_2^{(i+1)} = 3\Bigl(\frac{y_{i+1} - y_i}{h_{i+1}} - \frac{y_i - y_{i-1}}{h_i}\Bigr) \tag{21.1}$$
      mit $h_i = x_i - x_{i-1}$ und $a_2^{(0)} = a_2^{(n)} = 0$ (natürliche Randbedingung). Die übrigen Koeffizienten sind
      $$a_0^{(i)} = y_i, \qquad a_1^{(i)} = \frac{y_i - y_{i-1}}{h_i} + \frac{h_i}3\bigl(2a_2^{(i)} + a_2^{(i-1)}\bigr), \qquad a_3^{(i)} = \frac{a_2^{(i)} - a_2^{(i-1)}}{3h_i}. \tag{21.2–21.4}$$
      ${proof(tx`<p>Ableitungen: $p_i' = a_1 + 2a_2(x - x_i) + 3a_3(x - x_i)^2$, $p_i'' = 2a_2 + 6a_3(x - x_i)$.</p>
        <p>Interpolation in $x_i$: $a_0^{(i)} = y_i$. In $x_{i-1}$: $y_{i-1} - y_i = -h_ia_1^{(i)} + h_i^2a_2^{(i)} - h_i^3a_3^{(i)}$ (21.8).</p>
        <p>Stetigkeit von $p''$: $2a_2^{(i)} = 2a_2^{(i+1)} - 6a_3^{(i+1)}h_{i+1}$, also $a_3^{(i)} = (a_2^{(i)} - a_2^{(i-1)})/(3h_i)$; für $i = 1$ folgt dasselbe aus der Randbedingung mit $a_2^{(0)} = 0$.
        Einsetzen in (21.8) liefert $a_1^{(i)}$, und Einsetzen von $a_1$, $a_3$ in die Stetigkeit von $p'$ ergibt (21.1).</p>`)}`)}
    ${box('merke', 'Bemerkung 21.4', tx`Das System ist symmetrisch, strikt diagonaldominant und <strong>tridiagonal</strong>: stabile LU-Zerlegung ohne Pivotisierung (Vorlesung 10), kein Fill-in, Aufwand $O(n)$.`)}
    ${widget('splines', {}, 'Beispiel 21.5: Das Polynom vom Grad 6 schießt zwischen den Punkten weit über; lineare und kubische Splines bleiben in der Nähe der Daten. Verändern Sie die Werte und beobachten Sie, wie lokal der Spline reagiert.')}
    ${box('satz', '21.6 (Fehlerabschätzung)', tx`Für $f \in C^4[a, b]$ und einen kubischen Spline mit Hermite-Randbedingungen gilt
      $$\max_{a\le x\le b}|f(x) - s(x)| \le h^4\max_{a\le x\le b}|f^{(4)}(x)|, \qquad h = \max_i|x_i - x_{i-1}|.$$
      Auch unter wesentlich schwächeren Voraussetzungen konvergiert die Spline-Interpolation gleichmäßig.`)}
  `,
};

const beispiel = {
  id: 'spline-beispiel',
  title: '21.3 Praktisches Beispiel zur Spline-Interpolation',
  body: tx`
    ${lead('Wie schnell konvergieren Splines wirklich? Das hängt davon ab, wie glatt die Funktion ist.')}
    ${box('beispiel', '21.7', tx`Interpoliert werden $f_1 = e^{-x^2}$ auf $[-10, 10]$, $f_2 = \cos^2x$ für $|x| < \frac\pi2$ und $0$ sonst (auf $[-\pi, \pi]$), sowie eine Sprungfunktion $f_3$ auf $[0, 1]$.
      ${list([
        'Polynome steigenden Grades auf äquidistanten Stützstellen scheitern in allen Fällen: Der Fehler wächst.',
        'Kubische Splines konvergieren und sind glatt, zeigen aber um Sprünge lokale Über- und Unterschwinger (ähnlich Gibbs).',
        'Stückweise lineare Funktionen haben diesen Defekt nicht.',
      ], true)}
      Für $f_1$ fällt der Fehler beim linearen Spline wie $h^2$ ($e_{2n}/e_n \to \frac14$), beim kubischen wie $h^4$ ($\to \frac1{16}$) – asymptotisch, für genügend großes $n$.
      Bei $f_2$ springt $f''$ in $\frac\pi2$ von 2 auf 0: Dann konvergiert auch der kubische Spline nur noch wie $h^2$.`)}
    ${widget('spline-convergence', {}, 'Doppelt logarithmisch werden die Konvergenzordnungen zu Steigungen. Vergleichen Sie die beobachteten Ordnungen mit den Tabellen im Skript.')}
    ${box('merke', 'Bemerkung 21.8', list([
      tx`Je höher der Spline-Grad $k$, desto schneller die Konvergenz – im besten Fall $O(h^{k+1})$.`,
      'Das gilt aber nur, wenn die Funktion genügend oft differenzierbar ist. Sonst lohnt hoher Grad nicht.',
    ]))}
  `,
};

export default {
  id: 'vl21',
  number: 21,
  title: 'Interpolation mit Splines',
  summary: 'Spline-Räume, Konstruktion kubischer Splines über ein tridiagonales System, Fehlerabschätzung und Konvergenzordnungen in der Praxis.',
  sections: [raeume, konstruktion, beispiel],
};
