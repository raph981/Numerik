/**
 * Vorlesung 22: Kurvendarstellung mit Bernstein-Polynomen
 */
import { box, lead, proof, tx, widget } from './blocks.js';

const bernstein = {
  id: 'bernstein-polynome',
  title: '22.1 Bernstein-Polynome',
  body: tx`
    ${lead(`Für Kurven in Zeichenprogrammen und Schriftarten will man nicht interpolieren, sondern eine Form intuitiv steuern.
      Dafür haben sich Bernstein-Polynome bewährt – sie approximieren statt zu interpolieren.`)}
    <p>Kurven sind Abbildungen $u: [a, b] \to \R^d$ ($d = 2, 3$). Man könnte jede Komponente mit den bisherigen Techniken darstellen, in der Grafik haben sich aber Bernstein-Polynome durchgesetzt.</p>
    ${box('definition', '22.1 (Bernstein-Polynome)', tx`$$B_i^{(n)}(t) = \binom ni(1 - t)^{n-i}t^i, \qquad i = 0, \dots, n, \quad t \in [0, 1].$$
      Auf $[a, b]$ verwendet man $B_i^{(n)}\bigl(\frac{u - a}{b - a}\bigr)$.`)}
    ${box('satz', '22.2 (Eigenschaften)', tx`<ol>
      <li><strong>Zerlegung der Eins:</strong> $\sum_iB_i^{(n)}(t) = 1$ (binomischer Lehrsatz für $((1 - t) + t)^n$).</li>
      <li>$t = 0$ ist $i$-fache, $t = 1$ ist $(n-i)$-fache Nullstelle – die einzigen Nullstellen.</li>
      <li>Symmetrie: $B_i^{(n)}(t) = B_{n-i}^{(n)}(1 - t)$.</li>
      <li>Positivität: $0 \le B_i^{(n)}(t) \le 1$ auf $[0, 1]$, $> 0$ im Inneren.</li>
      <li>$B_i^{(n)}$ hat genau ein Maximum, bei $t = \frac in$.</li>
      <li>Die $B_i^{(n)}$ bilden eine Basis von $P_n$.</li>
      <li>Rekursion: $B_i^{(n)}(t) = tB_{i-1}^{(n-1)}(t) + (1 - t)B_i^{(n-1)}(t)$.</li>
      <li>Ableitung: $\frac{d}{dt}B_i^{(n)}(t) = n\bigl(B_{i-1}^{(n-1)}(t) - B_i^{(n-1)}(t)\bigr)$.</li>
    </ol>
    ${proof(tx`5) $\frac{d}{dt}B_i^{(n)} = \binom ni(1-t)^{n-i-1}t^{i-1}(i - nt)$: Die einzige Nullstelle im Inneren ist $t = i/n$, und dazwischen ist $B_i^{(n)} > 0$.
      6) Aus $\sum\alpha_iB_i^{(n)} = 0$ folgt durch Auswerten der $j$-ten Ableitung bei $t = 0$ nacheinander $\alpha_0 = \alpha_1 = \dots = 0$.
      7) Einsetzen und $\binom{n-1}{i-1} + \binom{n-1}{i} = \binom ni$.`)}`)}
    ${box('satz', '22.3 (Approximation)', tx`Für stetiges $f: [0, 1] \to \R$ konvergiert
      $$f_n(t) = \sum_{i=0}^nf\Bigl(\frac in\Bigr)B_i^{(n)}(t)$$
      <strong>gleichmäßig</strong> gegen $f$ (so beweist man den Approximationssatz von Weierstraß). Die $f_n$ schwingen nicht über wie Lagrange-Polynome – sind aber auch keine Interpolanten.`)}
    ${widget('bernstein', {}, 'Oben die Basis mit ihren Maxima bei i/n, unten der Vergleich mit der Lagrange-Interpolation an denselben Punkten: langsam, aber immer konvergent.')}
  `,
};

const bezier = {
  id: 'bezier-kurven',
  title: '22.2 Bézier-Kurven',
  body: tx`
    ${lead('Ersetzt man die Koeffizienten durch Punkte in der Ebene, erhält man Bézier-Kurven – das Werkzeug jedes Zeichenprogramms.')}
    ${box('definition', '22.4 / 22.5', tx`$p(t) = \sum_{i=0}^n\beta_iB_i^{(n)}(t)$ heißt <strong>Bézier-Darstellung</strong> von $p$. Für Punkte $b_0, \dots, b_n \in \R^d$ heißt
      $$x(t) = \sum_{i=0}^nb_iB_i^{(n)}(t)$$
      <strong>Bézier-Kurve</strong>; die $b_i$ heißen Kontrollpunkte.`)}
    ${box('definition', '22.6 (Konvexe Hülle)', tx`Für $0 \le q_i \le 1$, $\sum q_i = 1$ heißt $\sum q_ib_i$ <strong>Konvexkombination</strong>. Die Menge aller Konvexkombinationen ist die konvexe Hülle;
      ihr Rand ist in 2D das Bézier-Polygon (Polytop).`)}
    ${box('beispiel', '22.7', tx`Für $b_0 = (0, 0)$, $b_1 = (\frac13, -1)$, $b_2 = (\frac23, -1)$, $b_3 = (1, 1)$ ist $x(t) = \bigl(t,\; t^3 + 3t^2 - 3t\bigr)$. Die zweite Komponente ist das Bézier-Polynom
      zu $\beta = (0, -1, -1, 1)$.`)}
    ${box('satz', '22.8', tx`<ol type="i">
      <li>$x(t)$ liegt in der konvexen Hülle der Kontrollpunkte (wegen $0 \le B_i^{(n)} \le 1$ und $\sum B_i^{(n)} = 1$ ist $x(t)$ eine Konvexkombination).</li>
      <li>$x(0) = b_0$, $x(1) = b_n$.</li>
      <li>Tangenten in den Endpunkten: $x'(0) = n(b_1 - b_0)$, $x'(1) = n(b_n - b_{n-1})$.</li>
    </ol>`)}
    <p>Diese präzise Kontrolle über Endpunkte und Endtangenten nutzen Grafikprogramme zum interaktiven Zeichnen glatter Kurven: Man setzt Endpunkte und „Anfasser“.</p>
  `,
};

const casteljau = {
  id: 'de-casteljau',
  title: '22.3 Algorithmus von de Casteljau',
  body: tx`
    ${lead('Ausgewertet wird eine Bézier-Kurve nicht über die Basis, sondern durch wiederholtes Teilen von Strecken – stabil und anschaulich.')}
    <p>Mit der Rekursion der Bernstein-Polynome wird $x(t) = \sum_{i=0}^{n-1}\bigl[(1 - t)b_i + tb_{i+1}\bigr]B_i^{(n-1)}(t)$ – eine Bézier-Kurve vom Grad $n - 1$ mit neuen Kontrollpunkten. Wiederholt:</p>
    $$b_i^{(0)} = b_i, \qquad b_i^{(k)} = (1 - t)\,b_i^{(k-1)} + t\,b_{i+1}^{(k-1)}, \qquad x(t) = b_0^{(n)}.$$
    <p>Das Schema gleicht dem Neville-Schema (Vorlesung 17). Da nur Konvexkombinationen vorkommen, ist es numerisch stabil.</p>
    ${widget('bezier', {}, 'Ziehen Sie die Kontrollpunkte und bewegen Sie t: Die farbigen Zwischenpolygone sind die Stufen von de Casteljau, der rote Punkt ist x(t).')}
  `,
};

export default {
  id: 'vl22',
  number: 22,
  title: 'Kurvendarstellung mit Bernstein-Polynomen',
  summary: 'Bernstein-Polynome und ihre Eigenschaften, Bernstein-Approximation, Bézier-Kurven mit konvexer Hülle und der Algorithmus von de Casteljau.',
  sections: [bernstein, bezier, casteljau],
};
