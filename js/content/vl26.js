/**
 * Vorlesung 26: Numerische Integration hoher Ordnung
 */
import { box, code, exercise, lead, list, proof, tx, widget } from './blocks.js';

const romberg = {
  id: 'romberg',
  title: '26.1 Romberg-Integration',
  body: tx`
    ${lead(`Newton-Cotes-Formeln hoher Ordnung sind wegen negativer Gewichte unbrauchbar. Ein erster Ausweg: Man rechnet nur mit der
      robusten Trapezregel und gewinnt die hohe Ordnung durch Extrapolation zum Limes h → 0 (Vorlesung 19).`)}
    <p>Gesucht ist $\lim_{h\to0}I_h^{(1)}(f)$. Ob Extrapolation hilft, hängt von der Struktur des Fehlers ab – und die ist bei der Trapezregel außergewöhnlich schön:</p>
    ${box('satz', '26.1 (Euler-MacLaurin’sche Summenformel)', tx`Für $f \in C^{2m+2}[a, b]$ gilt
      $$\underbrace{I_h^{(1)}(f)}_{\text{Trapezsumme}} = \int_a^bf(x)\,dx + \sum_{k=1}^mh^{2k}\frac{B_{2k}}{(2k)!}\Bigl(f^{(2k-1)}(b) - f^{(2k-1)}(a)\Bigr) + \underbrace{h^{2m+2}\frac{B_{2m+2}}{(2m+2)!}(b - a)f^{(2m+2)}(\zeta)}_{\text{Restglied}} \tag{26.1}$$
      mit $\zeta \in [a, b]$ und den Bernoulli-Zahlen $B_0 = 1$, $B_2 = \frac16$, $B_4 = -\frac1{30}$, …, rekursiv $B_n = -\frac1{n+1}\sum_{k=0}^{n-1}\binom{n+1}kB_k$. (Ohne Beweis.)`)}
    <p>Für die Trapezsumme gilt also die <strong>asymptotische Entwicklung</strong></p>
    $$I_h^{(1)}(f) = \underbrace{\tau_0}_{=\int_a^bf\,dx} + \underbrace{\tau_1h^2 + \tau_2h^4 + \dots + \tau_mh^{2m}}_{\tau_i \text{ unabhängig von } h} + \alpha_{m+1}(h)h^{2m+2}. \tag{26.2}$$
    <p>Das ist ein Polynom in $y = h^2$ – genau die Situation der geraden Entwicklungen aus Abschnitt 19.3. Man interpoliert die Trapezsummen zu verschiedenen $h$ in den Stellen $h_i^2$ und wertet bei $0$ aus.
      Für Integrale heißt das <strong>Romberg-Integration</strong>, für allgemeine Diskretisierungsverfahren <strong>Richardson-Extrapolation</strong>.</p>
    ${box('merke', 'Neville-Schema für Romberg', tx`Mit $p_{i,0} = I_{h_i}^{(1)}(f)$ und dem Neville-Schema an der Stelle $0$:
      $$p_{i,k} = p_{i+1,k-1} - \frac{p_{i+1,k-1} - p_{i,k-1}}{1 - \bigl(h_i/h_{i+k}\bigr)^2}.$$
      Für die Halbierungsfolge $h_i = h_0\cdot2^{-i}$ wird daraus
      $$p_{i,k} = p_{i+1,k-1} + \frac{p_{i+1,k-1} - p_{i,k-1}}{2^{2k} - 1}, \qquad k = 1, \dots, n, \quad i = 0, \dots, n - k.$$
      Mit $n + 1$ Trapezsummen gilt $p_{0,n} = I(f) + O(h^{2n+2})$ – <em>aber</em> nur für $f \in C^{2n+2}[a, b]$.`)}
    ${widget('romberg', {}, 'Romberg-Integration: Die Trapezsummen liegen über h² fast auf einem Polynom. Dessen Wert bei h = 0 ist um Größenordnungen genauer als die beste Trapezsumme.')}
    ${exercise(tx`Zeigen Sie: Die erste Spalte $p_{i,1}$ des Romberg-Schemas ist genau die summierte Simpsonregel zur Schrittweite $h_i$.`,
      tx`$p_{i,1} = p_{i+1,0} + \frac{p_{i+1,0} - p_{i,0}}3 = \frac43I_{h/2}^{(1)} - \frac13I_h^{(1)}$. Mit $I_{h/2}^{(1)} = \frac12(I_h^{(1)} + I_h^{(0)})$ (Bemerkung 25.7) folgt
      $p_{i,1} = \frac23I_h^{(1)} + \frac23I_h^{(0)} - \frac13I_h^{(1)} = \frac13I_h^{(1)} + \frac23I_h^{(0)} = I_h^{(2)}$. Die Simpsonregel eliminiert also gerade den $h^2$-Term der Euler-MacLaurin-Entwicklung.`)}
  `,
};

const gauss = {
  id: 'gauss-integration',
  title: '26.2 Gauß-Integration',
  body: tx`
    ${lead(`Bisher waren die Stützstellen vorgegeben (äquidistant), nur die Gewichte frei. Gibt man auch die Stützstellen frei, verdoppelt sich
      die Zahl der Freiheitsgrade – und damit die erreichbare Ordnung.`)}
    ${box('beispiel', '26.2', tx`Gesucht sind $x_0, x_1, w_0, w_1$, sodass $p_3(x) = a_0 + a_1x + a_2x^2 + a_3x^3$ auf $[-1, 1]$ exakt integriert wird:
      $$\int_{-1}^1p_3\,dx = 2a_0 + \tfrac23a_2 \overset!= 2\bigl[w_0p_3(x_0) + w_1p_3(x_1)\bigr].$$
      Koeffizientenvergleich für $a_0, \dots, a_3$ liefert vier nichtlineare Gleichungen
      $$1 = w_0 + w_1, \quad 0 = w_0x_0 + w_1x_1, \quad \tfrac13 = w_0x_0^2 + w_1x_1^2, \quad 0 = w_0x_0^3 + w_1x_1^3$$
      mit der Lösung $w_0 = w_1 = \frac12$, $x_{0,1} = \mp\frac1{\sqrt3}$. Mit nur zwei Stützstellen erhält man Ordnung 4 – die Trapezregel schafft mit zwei Stützstellen nur Ordnung 2.`)}
    <p>Im Folgenden betrachten wir Formeln auf $[-1, 1]$; Integrale über $[a, b]$ erhält man durch die Transformation $x = \frac{a+b}2 + \frac{b-a}2t$.</p>
    ${box('satz', '26.3 (Grenze der Ordnung)', tx`Es gibt keine Quadraturformel mit $n + 1$ Stützstellen, die alle Polynome vom Grad $2n + 2$ exakt integriert.
      ${proof(tx`Angenommen doch. Betrachte $q(x) = \prod_{i=0}^n(x - x_i)^2$ vom Grad $2n + 2$. Es ist $q \ge 0$ und $q \not\equiv 0$, also $\int_{-1}^1q\,dx > 0$. Die Quadraturformel liefert aber $\sum_iw_i\underbrace{q(x_i)}_{=0} = 0$ – Widerspruch.`)}`)}
    ${box('satz', '26.4 (Gauß-Quadratur)', tx`Es gibt genau eine interpolatorische Quadraturformel mit $n + 1$ paarweise verschiedenen Stützstellen in $[-1, 1]$ mit der Ordnung $2n + 2$. Ihre Stützstellen sind die Nullstellen $\lambda_0, \dots, \lambda_n \in (-1, 1)$ des
      Legendre-Polynoms $P_{n+1}$ (Beispiel 23.7), ihre Gewichte
      $$w_i = \frac12\int_{-1}^1\prod_{j\ne i}\Bigl(\frac{x - \lambda_j}{\lambda_i - \lambda_j}\Bigr)^2dx > 0.$$
      (Beweis: [Rannacher 2017, Satz 3.4].)`)}
    ${box('intuition', 'Warum gerade die Legendre-Nullstellen?', tx`Teile ein Polynom $p$ vom Grad $\le 2n + 1$ durch $P_{n+1}$: $p = qP_{n+1} + r$ mit $\deg q, \deg r \le n$. Wegen der Orthogonalität ist $\int qP_{n+1}\,dx = 0$ (denn $q$ liegt im Raum der Polynome vom Grad $\le n$, auf dem $P_{n+1}$ senkrecht steht).
      An den Nullstellen von $P_{n+1}$ ist $p(\lambda_i) = r(\lambda_i)$, und $r$ wird von der interpolatorischen Formel mit $n + 1$ Punkten exakt integriert. Also integriert die Formel $p$ exakt. Die Gewichte sind positiv, weil sie Integrale von Quadraten sind – die Formeln sind für jedes $n$ gut konditioniert.`)}
    ${box('beispiel', '26.5', tx`Für $n = 1, 2$ ergibt sich mit $h = \frac{b-a}2$, $c = \frac{a+b}2$:
      $$\begin{aligned}
        I^{(1)}(f) &= \tfrac{b-a}2\Bigl[f\bigl(c - \sqrt{1/3}\,h\bigr) + f\bigl(c + \sqrt{1/3}\,h\bigr)\Bigr] && \text{Ordnung 4 (Gauss4)},\\
        I^{(2)}(f) &= \tfrac{b-a}{18}\Bigl[5f\bigl(c - \sqrt{3/5}\,h\bigr) + 8f(c) + 5f\bigl(c + \sqrt{3/5}\,h\bigr)\Bigr] && \text{Ordnung 6 (Gauss6)}.
      \end{aligned}$$
      Entsprechend lassen sich auch summierte Gauß-Formeln aufstellen.`)}
    ${widget('gauss-quadrature', {}, 'Abbildung 26.1 interaktiv: Legendre-Polynome, ihre Nullstellen als Stützstellen und der Exaktheitsgrad im Vergleich mit Newton-Cotes.')}
  `,
};

const ausblick = {
  id: 'ausblick-quadratur',
  title: '26.3 Ausblick',
  body: tx`
    ${lead('Drei Richtungen, in die es weitergeht: Schrittweiten, die sich dem Integranden anpassen, mehrere Raumdimensionen – und was passiert, wenn es sehr viele werden.')}

    <h3>Adaptive Quadratur</h3>
    <p>Eine konstante Schrittweite ist bei Integranden wie $f(x) = \frac1{10^{-5} + x^2}$ verschwenderisch: Nur in einer winzigen Umgebung von $0$ passiert etwas, überall sonst ist $f$ harmlos.
      Man möchte die Schrittweite <strong>adaptiv</strong> wählen und braucht dazu einen lokalen <strong>Fehlerindikator</strong>, der anzeigt, wo verfeinert werden muss.</p>
    <p>Prinzip von Archimedes: Zerlege das Integral hierarchisch, $I = I_0 + I_1 + I_2 + \dots$, wobei $I_0$ das Trapez über $[a, b]$ ist und jeder weitere Anteil ein Dreieck, das auf eine Sehne gesetzt wird.
      Für die Punkte $(x_l, f_l)$, $(x_r, f_r)$ und $x_m = \frac{x_l + x_r}2$ hat das Dreieck die Fläche „Grundseite × Höhe / 2“:</p>
    $$I_\Delta = \Bigl(f(x_m) - \frac{f(x_l) + f(x_r)}2\Bigr)\frac{x_r - x_l}2.$$
    <p>Der Zuwachs $I_\Delta$ ist zugleich der <strong>Fehlerindikator</strong>: Ist er klein, wird $f$ auf $[x_l, x_r]$ schon gut durch die Sehne angenähert, und das Teilintervall muss <em>nicht</em> weiter verfeinert werden.</p>
    ${box('algorithmus', '26.6 (Adaptive Quadratur nach Archimedes)', tx`Rekursive Formulierung:
      ${code(`
Archimedes(xl, xr, fl, fr, l):
    xm = (xl + xr) / 2
    fm = f(xm)
    s  = (fm - (fl + fr) / 2) * (xr - xl) / 2
    if |s| >= TOL or l < lmin:
        s += Archimedes(xl, xm, fl, fm, l + 1) + Archimedes(xm, xr, fm, fr, l + 1)
    return s
`, 'text')}
      Das Integral ist dann $I = (b - a)\frac{f(a) + f(b)}2 + \text{Archimedes}(a, b, f(a), f(b), 0)$.`)}
    ${widget('archimedes', {}, 'Abbildung 26.2 interaktiv: Dreiecke als hierarchische Zuwächse. Die Auswertungsstellen sammeln sich dort, wo f stark gekrümmt ist.')}

    <h3>Vergleich der Verfahren</h3>
    ${box('beispiel', '26.7', tx`Wir vergleichen alle Verfahren an den drei Integranden aus Beispiel 25.8. Die Ergebnisse der Tabellen im Skript:
      ${list([
        tx`(i) glatt: <strong>Das Verfahren hoher Ordnung zahlt sich aus.</strong> Gauss6 erreicht mit 48 Auswertungen einen Fehler von $4\cdot10^{-13}$, Archimedes mit 31 Auswertungen nur $2\cdot10^{-4}$.`,
        tx`(ii) große Ableitungen: Die Fehlerreduktion mit Archimedes ist von Anfang an gut, allerdings „überholt“ die Trapezsumme später kräftig.`,
        tx`(iii) nicht differenzierbar: <strong>Hohe Ordnung lohnt sich nicht</strong> – alle Verfahren konvergieren gleich langsam.`,
      ], true)}`)}
    ${widget('quadrature-comparison', {}, 'Fehler gegen Aufwand für alle Verfahren der Vorlesungen 25 und 26. Je weiter links unten eine Kurve verläuft, desto effizienter das Verfahren.')}

    <h3>Mehrdimensionale Quadratur</h3>
    <p>Für Rechtecke ($d = 2$) wendet man eine eindimensionale Formel in jeder Richtung an (<strong>Tensorprodukt</strong>):</p>
    $$\int_c^d\int_a^bf(x, y)\,dx\,dy \approx (b - a)\sum_{i=0}^nw_i\int_c^df(x_i, y)\,dy \approx (b - a)(d - c)\sum_{i=0}^n\sum_{j=0}^n\underbrace{w_iw_j}_{=w_{ij}}f(x_i, y_j).$$
    <p>Das lässt sich auf $d$-dimensionale Würfel verallgemeinern. Kompliziertere Gebiete $\Omega \subset \R^d$ zerlegt man (ggf. näherungsweise) in Teilgebiete $\Omega_i$, die sich auf Würfel oder Simplizes abbilden lassen –
      <strong>Triangulierung</strong> bzw. <strong>Gittergenerierung</strong>, in drei Dimensionen eine schwierige Aufgabe; durch die nicht exakte Zerlegung entsteht zusätzlich ein Geometriefehler.
      Auf jedem Teilgebiet nutzt man den Transformationssatz:</p>
    $$\int_\Omega f(x, y)\,dx\,dy = \int_{-1}^1\int_{-1}^1f\bigl(\varphi(\xi, \eta), \psi(\xi, \eta)\bigr)\left|\frac{\partial(\varphi, \psi)}{\partial(\xi, \eta)}\right|d\xi\,d\eta, \qquad \left|\frac{\partial(\varphi, \psi)}{\partial(\xi, \eta)}\right| = \left|\det\begin{pmatrix}\partial_\xi\varphi & \partial_\xi\psi\\ \partial_\eta\varphi & \partial_\eta\psi\end{pmatrix}\right| \ne 0.$$
    <p>Die Abbildung $(\varphi, \psi): [-1, 1]^2 \to \Omega_i$ bildet das Einheitsquadrat auf das Teilgebiet ab; auch krummlinig berandete Teilgebiete sind so möglich. Die Ordnung hängt dann von $f$ <em>und</em> der Transformation ab.
      Auch in mehreren Dimensionen kann man das Gitter adaptiv verfeinern.</p>

    <h3>Fluch der Dimension</h3>
    <p>Die bisherigen Methoden eignen sich bis etwa Dimension 5. Teilt man $[0, 1]^d$ in jeder Richtung nur in zwei Teilintervalle, hat man bereits $2^d$ Teilwürfel – der Aufwand steigt <strong>exponentiell</strong> mit $d$.
      Eine Tensorprodukt-Regel der Ordnung $p$ mit $N$ Punkten hat die Schrittweite $h = N^{-1/d}$ und damit den Fehler $O(N^{-p/d})$. Ein Ausweg ist die <strong>Monte-Carlo-Integration</strong></p>
    $$I(f) \approx \frac{|\Omega|}N\sum_{i=1}^Nf(\xi_i) \qquad\text{mit Zufallszahlen } \xi_i \in \Omega.$$
    <p>Die Zahl der Auswertungen ist unabhängig von $d$, allerdings konvergiert das Verfahren nur wie $O(N^{-1/2})$ (Gesetz der großen Zahlen bzw. zentraler Grenzwertsatz).</p>
    ${widget('monte-carlo', {}, 'Tensor-Mittelpunktsregel (Ordnung 2) gegen Monte Carlo. Erhöhen Sie die Dimension: Die Steigung der Tensorregel wird immer flacher, die von Monte Carlo bleibt.')}
    ${box('merke', 'Zusammenfassung der Quadratur', list([
      'Niedrige Ordnung, robust: summierte Trapez- und Mittelpunktsregel – funktionieren immer, konvergieren aber langsam.',
      'Hohe Ordnung für glatte Integranden: Romberg (Extrapolation der Trapezregel) oder Gauß (optimale Stützstellen, positive Gewichte).',
      'Lokale Schwierigkeiten: adaptive Verfahren mit Fehlerindikator.',
      tx`Viele Dimensionen: Monte Carlo, dessen Rate $N^{-1/2}$ nicht von $d$ abhängt.`,
      tx`Immer gilt: Die Ordnung eines Verfahrens zeigt sich nur, wenn $f$ glatt genug ist.`,
    ]))}
  `,
};

export default {
  id: 'vl26',
  number: 26,
  title: 'Numerische Integration hoher Ordnung',
  summary: 'Romberg-Integration über die Euler-MacLaurin-Formel, Gauß-Quadratur mit Legendre-Nullstellen, adaptive Quadratur nach Archimedes, mehrdimensionale Integration und Monte Carlo.',
  sections: [romberg, gauss, ausblick],
};
