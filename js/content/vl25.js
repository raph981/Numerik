/**
 * Vorlesung 25: Numerische Integration niedriger Ordnung
 */
import { box, code, exercise, lead, list, proof, tx, widget } from './blocks.js';

const einleitung = {
  id: 'quadratur-einleitung',
  title: 'Quadraturformeln',
  body: tx`
    ${lead(`Bestimmte Integrale sind eine Grundaufgabe der Numerik – schon die Koeffizienten ⟨f, ψᵢ⟩ = ∫ f ψᵢ dx der Gauß-Approximation sind Integrale.
      Fast nie kennt man eine Stammfunktion; man muss mit endlich vielen Funktionswerten auskommen.`)}
    <p>Gesucht ist $I_{[a,b]}(f) = \int_a^bf(x)\,dx$. Alle Verfahren dieser und der nächsten Vorlesung haben die Form einer <strong>Quadraturformel</strong></p>
    $$I_{[a,b]}(f) = (b - a)\sum_{i=0}^nw_if(x_i) + \text{Fehler}, \qquad w_i \in \R \text{ Gewichte}, \quad x_i \in \R \text{ Stützstellen}.$$
    <p>Setzt man $f \equiv 1$ ein, folgt $b - a = (b - a)\sum_iw_i$, also</p>
    $$\sum_{i=0}^nw_i = 1.$$
    ${box('intuition', '', 'Eine Quadraturformel ist ein gewichteter Mittelwert der Funktionswerte, multipliziert mit der Intervalllänge. Die ganze Kunst besteht darin, Stützstellen und Gewichte geschickt zu wählen.')}
  `,
};

const newtonCotes = {
  id: 'newton-cotes',
  title: '25.1 Newton-Cotes-Formeln',
  body: tx`
    ${lead('Idee: Ersetze f durch ein Interpolationspolynom und integriere dieses exakt. Bei äquidistanten Stützstellen heißen die Ergebnisse Newton-Cotes-Formeln.')}
    <p>Mit dem Interpolationspolynom in Lagrange-Form (Vorlesung 17), $p_n(x) = \sum_if(x_i)L_i^{(n)}(x)$, erhält man</p>
    $$I_{[a,b]}(f) \approx I^{(n)}_{[a,b]}(f) = \int_a^bp_n(x)\,dx = \sum_{i=0}^nf(x_i)\int_a^bL_i^{(n)}(x)\,dx. \tag{25.1}$$
    <p>Für äquidistante Stützstellen gibt es zwei Varianten:</p>
    ${list([
      tx`<strong>abgeschlossen</strong>: $a$ und $b$ sind Stützstellen, $x_i = a + ih$, $h = \frac{b-a}n$;`,
      tx`<strong>offen</strong>: $a$ und $b$ sind keine Stützstellen, $x_i = a + (i + 1)h$, $h = \frac{b-a}{n+2}$. Hier wird das Polynom an den Rändern außerhalb der Stützstellen benutzt (Extrapolation).`,
    ])}
    <p>Mit der Substitution $x = a + sh$ werden die Gewichte unabhängig von $a$ und $b$:</p>
    $$w_i = \frac1{b - a}\int_a^bL_i^{(n)}(x)\,dx = \frac1n\int_0^n\prod_{j\ne i}\frac{s - j}{i - j}\,ds.$$
    ${box('merke', 'Die wichtigsten Newton-Cotes-Formeln', tx`<p><strong>Abgeschlossen</strong> ($h = \frac{b-a}n$):</p>
      $$\begin{aligned}
        I^{(1)} &= \tfrac{b-a}2\bigl[f(a) + f(b)\bigr] && \text{Trapezregel}\\
        I^{(2)} &= \tfrac{b-a}6\bigl[f(a) + 4f\bigl(\tfrac{a+b}2\bigr) + f(b)\bigr] && \text{Simpsonregel (Keplersche Fassregel)}\\
        I^{(3)} &= \tfrac{b-a}8\bigl[f(a) + 3f(a + h) + 3f(b - h) + f(b)\bigr] && \tfrac38\text{-Regel}
      \end{aligned}$$
      <p><strong>Offen</strong> ($h = \frac{b-a}{n+2}$):</p>
      $$\begin{aligned}
        I^{(0)} &= (b - a)\,f\bigl(\tfrac{a+b}2\bigr) && \text{Mittelpunktsregel (Rechteckregel)}\\
        I^{(1)} &= \tfrac{b-a}2\bigl[f(a + h) + f(b - h)\bigr]\\
        I^{(2)} &= \tfrac{b-a}3\bigl[2f(a + h) - f\bigl(\tfrac{a+b}2\bigr) + 2f(b - h)\bigr]
      \end{aligned}$$`)}
    ${widget('newton-cotes', {}, 'Newton-Cotes-Formel = Integral des Interpolationspolynoms. Erhöhen Sie n und beobachten Sie die Gewichte.')}
    ${box('merke', 'Bemerkung 25.1 (Negative Gewichte)', tx`Für große $n$ treten negative Gewichte auf – bei den offenen Formeln schon ab $n = 2$, bei den abgeschlossenen ab $n = 8$ (siehe Widget; die Gewichte bis $n = 7$ sind noch alle positiv). Das ist ungünstig:
      ${list([
        tx`Aus $f \ge 0$ folgt nicht mehr $I^{(n)}(f) \ge 0$.`,
        'Die Gefahr von Auslöschung steigt.',
        tx`Die Kondition verschlechtert sich: Sind die Funktionswerte um $|\Delta y_i| \le \varepsilon$ gestört, so ist
          $$\bigl|I^{(n)}(\tilde f) - I^{(n)}(f)\bigr| = \Bigl|(b - a)\sum_iw_i\Delta y_i\Bigr| \le \varepsilon\,(b - a)\sum_i|w_i|.$$
          Bei positiven Gewichten ist $\sum_i|w_i| = \sum_iw_i = 1$ – kleiner geht es nicht. Mit gemischten Vorzeichen wird $\sum|w_i|$ größer, für $n \to \infty$ sogar unbeschränkt.`,
      ])}`)}

    <h3>Fehler und Ordnung</h3>
    ${box('satz', '25.2 (Restglieder)', tx`Es gibt jeweils ein $\xi \in [a, b]$ mit
      $$\begin{aligned}
        &\text{Trapezregel:} && I(f) - \tfrac{b-a}2[f(a) + f(b)] = -\tfrac{(b-a)^3}{12}f''(\xi), && f \in C^2,\\
        &\text{Simpsonregel:} && I(f) - \tfrac{b-a}6\bigl[f(a) + 4f\bigl(\tfrac{a+b}2\bigr) + f(b)\bigr] = -\tfrac{(b-a)^5}{2880}f^{(4)}(\xi), && f \in C^4,\\
        &\text{Mittelpunktsregel:} && I(f) - (b - a)f\bigl(\tfrac{a+b}2\bigr) = \tfrac{(b-a)^3}{24}f''(\xi), && f \in C^2.
      \end{aligned}$$
      ${proof(tx`<p>Nach Satz 18.2 ist $\int_a^bf - p_n\,dx = \int_a^b\frac{f^{(n+1)}(\eta(x))}{(n+1)!}\prod_j(x - x_j)\,dx$.</p>
        <p><strong>Trapezregel</strong> ($n = 1$): $g(x) = (x - a)(x - b) \le 0$ wechselt das Vorzeichen nicht, daher liefert der Mittelwertsatz der Integralrechnung
          $$I(f) - I^{(1)}(f) = \frac12f''(\xi)\int_a^b(x - a)(x - b)\,dx = -\frac{(b-a)^3}{12}f''(\xi).$$</p>
        <p><strong>Mittelpunktsregel</strong>: Taylorentwicklung um $m = \frac{a+b}2$ ergibt $f(x) = f(m) + f'(m)(x - m) + \frac{f''(\eta(x))}2(x - m)^2$. Der lineare Term integriert sich zu null, und
          $$I(f) - (b - a)f(m) = \frac{f''(\xi)}2\int_a^b(x - m)^2dx = \frac{f''(\xi)}2\int_{-\frac{b-a}2}^{\frac{b-a}2}z^2dz = f''(\xi)\frac{(b-a)^3}{24}.$$</p>
        <p>Für die Simpsonregel braucht man einen zusätzlichen Trick, siehe [Rannacher 2017, Abschnitt 3.1].</p>`)}`)}
    ${box('beobachtung', '', list([
      tx`Die Mittelpunktsregel hat nur den <strong>halben</strong> Fehler der Trapezregel – mit einer einzigen Auswertung (und entgegengesetztem Vorzeichen!).`,
      tx`Alle Restglieder haben die Form $c\,(b - a)^{m+1}f^{(m)}(\xi)$. Der Exponent $m$ charakterisiert die Formel.`,
    ]))}
    ${box('definition', '25.3 (Ordnung einer Quadratur)', tx`Eine Quadraturformel hat <strong>mindestens die Ordnung $m$</strong>, wenn sie alle Polynome vom Grad $m - 1$ exakt integriert. Die Ordnung ist <strong>genau</strong> $m$, wenn zusätzlich ein Polynom vom Grad $m$ nicht exakt integriert wird.`)}
    ${box('merke', 'Bemerkung 25.4', list([
      tx`Mit $n + 1$ äquidistanten Stützstellen wird jedes Polynom vom Grad $n$ exakt integriert – die Ordnung ist mindestens $n + 1$.`,
      tx`Hat das Restglied die Form $Cf^{(m)}(\xi)$, ist die Ordnung mindestens $m$: Für Polynome vom Grad $m - 1$ ist $f^{(m)} \equiv 0$. Die Simpsonregel integriert daher sogar <strong>kubische</strong> Polynome exakt und hat Ordnung 4 statt 3 – ein Geschenk der Symmetrie.`,
      tx`Bei geschickter Wahl von Stützstellen <em>und</em> Gewichten ist mit $n + 1$ Stützstellen sogar Ordnung $2n + 2$ erreichbar (Vorlesung 26).`,
    ]))}
  `,
};

const summiert = {
  id: 'summierte-quadratur',
  title: '25.2 Summierte Quadraturformeln',
  body: tx`
    ${lead('Statt den Polynomgrad zu erhöhen, zerlegt man das Intervall in kleine Stücke und verwendet auf jedem eine einfache Formel – wie bei den Splines.')}
    <p>Höhere Polynomgrade bei äquidistanten Stützstellen sind wenig sinnvoll: negative Gewichte, keine gleichmäßige Konvergenz der Interpolation (Runge, Vorlesung 18) und hohe Differenzierbarkeitsanforderungen an $f$.
      Stattdessen zerlegt man $[a, b]$ in $N$ Teilintervalle $[x_i, x_{i+1}]$, $x_i = a + ih$, $h = \frac{b-a}N$, und wendet auf jedem eine Formel $I^{(n)}$ an.</p>
    ${box('satz', '25.5 (Restglied summierter Quadraturen)', tx`Gilt für die Formel auf einem Teilintervall $I_{[x_i,x_{i+1}]}(f) - I^{(n)}_{[x_i,x_{i+1}]}(f) = \alpha_nh^{m+2}f^{(m+1)}(\xi_i)$, so gilt für die summierte Formel
      $$I(f) - I^{(n)}_h(f) = \alpha_n(b - a)\,h^{m+1}f^{(m+1)}(\xi), \qquad \xi \in [a, b].$$
      ${proof(tx`Nach dem Zwischenwertsatz nimmt die stetige Funktion $f^{(m+1)}$ jeden Wert zwischen $\min_if^{(m+1)}(\xi_i)$ und $\max_if^{(m+1)}(\xi_i)$ an, insbesondere den Mittelwert: $\sum_{i=0}^{N-1}f^{(m+1)}(\xi_i) = Nf^{(m+1)}(\xi)$. Also
        $$I(f) - I_h^{(n)}(f) = \alpha_nh^{m+2}\sum_{i=0}^{N-1}f^{(m+1)}(\xi_i) = \alpha_nh^{m+2}\frac{b - a}hf^{(m+1)}(\xi) = \alpha_nh^{m+1}(b - a)f^{(m+1)}(\xi).$$`)}`)}
    ${box('intuition', 'Eine Potenz geht verloren', tx`Lokal ist der Fehler $O(h^{m+2})$, aber man addiert $N = \frac{b-a}h$ solcher Fehler: global bleibt $O(h^{m+1})$.
      Beispiel 25.6: Die Trapezregel ($m = 1$) hat lokal $O(h^3)$ und global $O(h^2)$; die Simpsonregel ($m = 3$) global $O(h^4)$.`)}
    ${box('merke', 'Summierte Formeln', tx`$$\begin{aligned}
        I_h^{(1)}(f) &= h\Bigl[\frac{f(a)}2 + \sum_{i=1}^{N-1}f(a + ih) + \frac{f(b)}2\Bigr], & I - I_h^{(1)} &= -\frac{b-a}{12}h^2f''(\xi),\\
        I_h^{(2)}(f) &= h\Bigl[\frac{f(a)}6 + \sum_{i=1}^{N-1}\frac{f(a + ih)}3 + \frac23\sum_{i=0}^{N-1}f\bigl(a + (i + \tfrac12)h\bigr) + \frac{f(b)}6\Bigr], & I - I_h^{(2)} &= -\frac{b-a}{2880}h^4f^{(4)}(\xi),\\
        I_h^{(0)}(f) &= h\sum_{i=0}^{N-1}f\bigl(a + (i + \tfrac12)h\bigr), & I - I_h^{(0)} &= \frac{b-a}{24}h^2f''(\xi).
      \end{aligned}$$`)}
    ${box('merke', 'Bemerkung 25.7 (Wiederverwendung von Funktionswerten)', tx`Die summierte Simpsonregel ist eine Kombination aus Trapez- und Mittelpunktsregel, und die Trapezregel zum halben $h$ ebenfalls:
      $$I_h^{(2)} = \tfrac13I_h^{(1)} + \tfrac23I_h^{(0)}, \qquad I_{h/2}^{(1)} = \tfrac12I_h^{(1)} + \tfrac12I_h^{(0)}.$$
      Beim fortgesetzten Halbieren muss man also nur die neuen Mittelpunkte auswerten.`)}
    ${box('beispiel', '25.8', tx`Drei Testintegrale mit unterschiedlicher Glattheit:
      $$\text{(i)}\;\int_0^{\pi/2}\sin x\,dx = 1, \qquad \text{(ii)}\;\int_{-1}^1\frac{dx}{10^{-5} + x^2} = 9{,}914588332462438\cdot10^2, \qquad \text{(iii)}\;\int_{-1}^1\sqrt{1 - x^2}\,dx = \frac\pi2.$$
      (i) ist beliebig glatt, (ii) glatt, aber mit riesigen höheren Ableitungen (Spitze der Höhe $10^5$ bei $0$), (iii) hat am Rand eine unendliche Steigung und ist dort nicht differenzierbar.`)}
    ${widget('composite-quadrature', {}, 'Beispiel 25.8 interaktiv. Unter „Tabelle wie im Skript“ finden Sie dieselben Zahlen wie in den Tabellen der Vorlesung.')}
    ${box('beobachtung', 'Was die Tabellen zeigen', list([
      tx`(i): Der Trapezfehler viertelt sich bei jeder Halbierung von $h$, und zwar von Anfang an; der Simpsonfehler fällt um den Faktor $16 = 2^4$. Unter $\approx 10^{-13}$ bzw. $10^{-15}$ verhindern Rundungsfehler weiteren Fortschritt.`,
      tx`(ii): Das Fehlerverhalten ist lange unklar, $h^2$ stellt sich erst spät ein. Bis etwa 4096 Auswertungen ist Simpson sogar <em>schlechter</em> als Trapez – die „asymptotische Konvergenzrate“ gilt erst für genügend kleines $h$.`,
      tx`(iii): Die Ordnung $h^2$ wird nicht erreicht, und Simpson zeigt <em>dieselbe</em> Ordnung wie Trapez.`,
    ]))}
    ${box('merke', 'Bemerkung 25.9 (Experimentelle Konvergenzordnung)', tx`Satz 25.5 liefert $|I(f) - I^{(n)}_h(f)| \le Ch^{m+1}$ – aber nur, wenn $f$ oft genug differenzierbar ist. Experimentell bestimmt man die Ordnung mit dem Ansatz $e_h = Ch^\alpha$:
      $$\frac{e_{h/2}}{e_h} = \frac{C(h/2)^\alpha}{Ch^\alpha} = \Bigl(\frac12\Bigr)^\alpha \qquad\Longrightarrow\qquad \alpha = \log\Bigl(\frac{e_{h/2}}{e_h}\Bigr)\Big/\log\Bigl(\frac12\Bigr).$$
      Dieses $\alpha$ heißt <strong>experimental order of convergence (EOC)</strong>. Für (iii) ergibt sich $\alpha = \frac32$ – bei beiden Regeln.`)}
    ${exercise(tx`Woher kommt die Ordnung $\frac32$ bei (iii)?`,
      tx`Nahe dem Rand $x = 1$ verhält sich $\sqrt{1 - x^2} \approx \sqrt2\sqrt{1 - x}$. Auf dem letzten Teilintervall der Länge $h$ ist $f$ von der Größe $\sqrt h$, und kein Polynom kann die Wurzel dort gut annähern: Der Fehler dieses einen Intervalls ist $\sim h\cdot\sqrt h = h^{3/2}$.
      Die übrigen Intervalle tragen weniger bei. Höhere Ordnung der Regel hilft nicht, weil die Voraussetzung $f \in C^{m+1}$ verletzt ist.`)}
  `,
};

const fehlerkontrolle = {
  id: 'fehlerkontrolle-quadratur',
  title: '25.3 Fehlerkontrolle',
  body: tx`
    ${lead('Wie wählt man h, wenn man das exakte Integral nicht kennt? Man vergleicht zwei Verfahren unterschiedlicher Genauigkeit.')}
    <p>Idee: Für glattes $f$ und kleines $h$ ist die Simpsonsumme genauer als die Trapezsumme. Wir schätzen den Fehler der Trapezsumme zur Schrittweite $\frac h2$, indem wir die Simpsonsumme „dazwischenschieben“:</p>
    $$|I(f) - I_{h/2}^{(1)}(f)| \le |I(f) - I_h^{(2)}(f)| + |I_h^{(2)}(f) - I_{h/2}^{(1)}(f)|.$$
    <p>Nehmen wir an, Simpson ist wirklich genauer, $|I(f) - I_h^{(2)}(f)| \le \omega\,|I(f) - I_{h/2}^{(1)}(f)|$ mit $0 < \omega < 1$, so folgt nach Umstellen</p>
    $$|I(f) - I_{h/2}^{(1)}(f)| \le \frac1{1 - \omega}\,\bigl|I_h^{(2)}(f) - I_{h/2}^{(1)}(f)\bigr|.$$
    <p>Die rechte Seite ist <strong>berechenbar</strong>. Mit Bemerkung 25.7 kostet sie keine einzige zusätzliche Funktionsauswertung – deshalb die Paarung „Trapez zu $\frac h2$, Simpson zu $h$“.</p>
    ${box('algorithmus', '25.10 (Integration mit Fehlerschätzung)', tx`Gegeben $f$, Grenzen $a, b$, Toleranz $\mathrm{TOL}$ und $\omega \in [0, 1)$:
      ${code(`
h = b - a;  N = 1
I1 = 0.5 * h * (f(a) + f(b))
while (h > eps):
    I0 = 0
    for i = 0, ..., N-1:  I0 = I0 + h * f(a + (i + 0.5) * h)   # Mittelpunktsumme
    I2 = I1 / 3 + 2 * I0 / 3                                  # Simpson-Summe zu h
    I1 = 0.5 * (I1 + I0)                                      # Trapez-Summe zu h/2
    h = 0.5 * h;  N = 2 * N
    if |I2 - I1| / (1 - omega) <= TOL:  return I1
`, 'text')}`)}
    ${widget('quadrature-error-control', {}, 'Algorithmus 25.10: Schätzung und wahrer Fehler im Vergleich. Wo die Annahme „Simpson ist genauer“ verletzt ist, kann die Schätzung zu optimistisch sein.')}
  `,
};

export default {
  id: 'vl25',
  number: 25,
  title: 'Numerische Integration niedriger Ordnung',
  summary: 'Quadraturformeln, Newton-Cotes-Formeln mit Restgliedern und Ordnung, summierte Formeln, experimentelle Konvergenzordnung und Fehlerkontrolle.',
  sections: [einleitung, newtonCotes, summiert, fehlerkontrolle],
};
