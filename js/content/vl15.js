/**
 * Vorlesung 15: Lösung nichtlinearer algebraischer Gleichungen
 */
import { box, exercise, lead, proof, tx, widget } from './blocks.js';

const motivation = {
  id: 'motivation-nichtlinear',
  title: '15.1 Motivation',
  body: tx`
    ${lead(`Jetzt verlassen wir die lineare Welt: Gesucht ist eine Nullstelle einer beliebigen Funktion. Dafür gibt es keine
      Formel mit fester Operationszahl – nur Iterationsverfahren.`)}
    <p>Gegeben ist $f: D \to \R^n$, $D \subset \R^n$. Gesucht ist ein $x \in D$ mit</p>
    $$f(x) = 0 \quad\Leftrightarrow\quad f_i(x_1, \dots, x_n) = 0, \;i = 1, \dots, n.$$
    <p>Für solche Probleme gibt es keine direkten Verfahren, die nach vorher bekannter Operationszahl fertig sind. Wir knüpfen an die iterativen
      Verfahren der letzten beiden Vorlesungen an.</p>
    ${box('beispiel', '15.1', tx`<ol type="a">
      <li>Eine Variable: $f(x) = x\,e^x - 3 = 0$ hat eine Lösung in $[1;\, 1{,}2]$.</li>
      <li>Zwei Variablen: $f_1 = x_1^2 + x_2^2 - 4 = 0$ (Kreis mit Radius 2) und $f_2 = \frac{x_1^2}{9} + x_2^2 - 1 = 0$ (Ellipse mit Halbachsen 3 und 1).
        Beide Kurven schneiden sich in <strong>vier</strong> Punkten.</li>
      <li>$f(x) = Ax - b$: Lineare Gleichungssysteme sind ein Spezialfall.</li>
    </ol>`)}
    ${box('merke', '', tx`Lineare Systeme haben keine, genau eine oder unendlich viele Lösungen. Nichtlineare Gleichungen können auch genau $m$ Lösungen haben (hier 4).
      Um eine bestimmte Lösung zu finden, schränkt man die Suche auf einen Bereich $D$ ein.`)}
  `,
};

const analysis = {
  id: 'grundlagen-analysis',
  title: '15.2 Grundlagen der Analysis',
  body: tx`
    ${lead('Für Konvergenzbeweise brauchen wir ein paar Begriffe: offene und abgeschlossene Mengen, Cauchy-Folgen und Stetigkeit.')}
    ${box('definition', '15.2–15.5', tx`<ul>
      <li><strong>Offene Kugel:</strong> $B_\epsilon(z) = \{x : \|x - z\| < \epsilon\}$, abgeschlossene Kugel $\bar B_\epsilon(z) = \{x : \|x - z\| \le \epsilon\}$.</li>
      <li>$D$ heißt <strong>offen</strong>, wenn um jeden Punkt $x \in D$ noch eine kleine Kugel $B_\epsilon(x) \subset D$ passt.</li>
      <li>Eine offene Menge $N$ mit $x \in N$ heißt <strong>Umgebung</strong> von $x$.</li>
      <li>$D$ heißt <strong>abgeschlossen</strong>, wenn das Komplement $\R^n \setminus D$ offen ist. ($\R^n$ ist beides.)</li>
    </ul>`)}
    ${box('intuition', '', `Offen: Der Rand gehört nicht dazu, man kann sich von jedem Punkt aus ein Stück bewegen. Abgeschlossen: Der Rand gehört dazu –
      man kann die Menge nicht „durch einen Grenzwert verlassen“.`)}
    <p>Eine Folge $\{x^k\}$ <strong>konvergiert</strong> gegen $x$, falls $\forall\epsilon > 0\;\exists N\;\forall k \ge N: \|x - x^k\| < \epsilon$ (15.6), und ist eine
      <strong>Cauchy-Folge</strong>, falls $\|x^k - x^l\| < \epsilon$ für alle $k, l \ge N$ (15.7). Im $\R^n$ konvergiert jede Cauchy-Folge ($\R^n$ ist vollständig).</p>
    ${box('lemma', '15.8', tx`Ist $D$ abgeschlossen und $\{x^k\} \subset D$ eine Cauchy-Folge, so liegt auch ihr Grenzwert in $D$.
      ${proof(tx`Der Grenzwert $x$ existiert im $\R^n$. Wäre $x \notin D$, so gäbe es (Komplement offen) eine Kugel $B_\epsilon(x)$ ohne Punkte aus $D$, also
        $\|x - x^k\| \ge \epsilon$ für alle $k$ – Widerspruch zur Konvergenz.`)}`)}
    <p>Für offene Mengen kann der Grenzwert „auf dem Rand“ liegen, z.&nbsp;B. $x^k = 1/k \in (0, 1)$ mit Grenzwert $0 \notin (0, 1)$. Nimmt man alle solchen Grenzwerte hinzu,
      erhält man den <strong>Abschluss</strong> $\bar D$ (15.9); so entstehen auch die reellen aus den rationalen Zahlen.</p>
    ${box('definition', '15.10 (Stetigkeit)', tx`$f$ heißt stetig in $x$, falls $\forall\epsilon > 0\;\exists\delta > 0\;\forall y \in B_\delta(x)\cap D: \|f(x) - f(y)\| < \epsilon$.`)}
    ${box('lemma', '15.11', tx`Ist $f$ stetig und $x^k \to x$, so gilt $\lim_{k\to\infty} f(x^k) = f(x)$. Man darf Grenzwert und stetige Funktion vertauschen.`)}
  `,
};

const fixpunkt = {
  id: 'fixpunktiteration',
  title: '15.3 Fixpunktiteration',
  body: tx`
    ${lead(`Trick: Man schreibt f(x) = 0 um in x = g(x). Dann liegt die Iteration auf der Hand – man setzt einfach immer wieder ein.
      Die große Frage ist, wann das konvergiert.`)}
    <p>Statt $f(x) = 0$ betrachten wir die <strong>Fixpunktform</strong> $g(x) = x$ mit $f(x) = 0 \Leftrightarrow g(x) = x$ und $g: D \to D$. Ein allgemeiner Ansatz ist die
      <strong>Relaxation</strong></p>
    $$g(x) = x - \sigma f(x), \qquad \sigma \neq 0.$$
    <p>Je nach $f$ gibt es weitere Umformungen, z.&nbsp;B. $x\,e^x = 3 \Leftrightarrow x = 3/e^x \Leftrightarrow x = \ln 3 - \ln x$.</p>
    ${box('definition', '15.12 / 15.13', tx`$\xi$ heißt <strong>Fixpunkt</strong> von $g$, wenn $g(\xi) = \xi$. Die Iteration
      $$x^{k+1} = g(x^k) \tag{15.1}$$
      heißt <strong>Fixpunktiteration</strong>.`)}
    ${widget('fixed-point-1d', {}, tx`Drei Fixpunktformen derselben Gleichung – mit völlig verschiedenem Verhalten. $3/e^x$ hat am Fixpunkt $|g'(\xi)| = \xi \approx 1{,}05 > 1$ und konvergiert nicht,
      $\ln 3 - \ln x$ hat $|g'(\xi)| = 1/\xi \approx 0{,}95$ und konvergiert quälend langsam.`)}

    ${box('definition', '15.14 (Lipschitz, Kontraktion)', tx`$g: D \to D$ ($D$ abgeschlossen) erfüllt eine Lipschitzbedingung, falls
      $$\|g(x) - g(y)\| \le L\,\|x - y\| \qquad \forall x, y \in D.$$
      Ist $L < 1$, heißt $g$ <strong>Kontraktion</strong> mit Kontraktionsfaktor $L$: Je zwei Punkte rücken unter $g$ näher zusammen.
      Die Konstante hängt von der Norm ab – wie bei linearen Iterationen.`)}
    ${box('beispiel', '15.15', tx`Für $f(x) = Ax - b$ ist das lineare Iterationsverfahren $g(x) = Sx + Bb$ mit $S = I - BA$. Die Lösung ist Fixpunkt, und
      $\|g(x) - g(y)\| = \|S(x - y)\| \le \|S\|\,\|x - y\|$, also $L = \|S\|$ – Vorlesung 14 ist ein Spezialfall.`)}

    ${box('satz', '15.17 (Banach’scher Fixpunktsatz)', tx`Sei $D \subset \R^n$ nicht leer und abgeschlossen und $g: D \to D$ eine Kontraktion mit $q < 1$. Dann
      <ul>
        <li>besitzt $g$ <strong>genau einen</strong> Fixpunkt $\xi$,</li>
        <li>konvergiert die Fixpunktiteration für <strong>jeden</strong> Startwert $x^0 \in D$ gegen $\xi$,</li>
        <li>gelten die Fehlerabschätzungen
          $$\|x^k - \xi\| \le \underbrace{\frac{q}{1 - q}\|x^k - x^{k-1}\|}_{\text{a posteriori}} \le \underbrace{\frac{q^k}{1 - q}\|x^1 - x^0\|}_{\text{a priori}}.$$</li>
      </ul>
      ${proof(tx`<p><strong>Cauchy-Folge:</strong> $\|x^{k+1} - x^k\| \le q\|x^k - x^{k-1}\| \le q^k\|x^1 - x^0\|$. Mit der Teleskopsumme und der geometrischen Reihe
        $$\|x^{k+m} - x^k\| \le (q^{k+m-1} + \dots + q^k)\|x^1 - x^0\| \le \frac{q^k}{1 - q}\|x^1 - x^0\| \to 0.$$</p>
        <p><strong>Grenzwert ist Fixpunkt:</strong> Nach Lemma 15.8 liegt $\xi = \lim x^k$ in $D$, und $\|\xi - g(\xi)\| \le \|\xi - x^k\| + q\|x^{k-1} - \xi\| \to 0$.</p>
        <p><strong>Eindeutigkeit:</strong> Aus $\|\xi_1 - \xi_2\| = \|g(\xi_1) - g(\xi_2)\| \le q\|\xi_1 - \xi_2\|$ folgt $(1 - q)\|\xi_1 - \xi_2\| \le 0$, also $\xi_1 = \xi_2$.</p>
        <p><strong>Abschätzung:</strong> Wie oben mit $\|x^{k+j} - x^{k+j-1}\| \le q^j\|x^k - x^{k-1}\|$ und $m \to \infty$.</p>`)}`)}
    ${box('intuition', 'a priori vs. a posteriori', tx`Die <em>a-priori</em>-Schranke kennt man vor der Rechnung: Sie sagt, wie viele Schritte man höchstens braucht. Die <em>a-posteriori</em>-Schranke benutzt die
      tatsächlich beobachtete letzte Änderung und ist meist viel schärfer – im Skript Radius 2,0 statt 6,55. Praktisch: Ist die Änderung klein und $q$ deutlich kleiner als 1, ist man nah am Ziel.`)}
    ${widget('nonlinear-2d', { method: 'relaxation' }, tx`Relaxation $x^{k+1} = x^k - \sigma f(x^k)$ für Kreis ∩ Ellipse. Der gestrichelte Kreis ist die a-posteriori-Schranke: Nach dem Banach’schen Fixpunktsatz liegt der Fixpunkt garantiert darin.`)}
    ${exercise(tx`Warum ist die Relaxation für $\sigma > 0{,}505$ (Startwert $(2, 1)$) nicht mehr konvergent, für $\sigma \approx 0{,}35$ aber am schnellsten?`,
      tx`Nahe der Lösung verhält sich $g(x) = x - \sigma f(x)$ wie die lineare Iteration mit $S = I - \sigma J_f(\xi)$ (siehe 16.2). Die Eigenwerte von $J_f(\xi)$ sind hier
      $\mu_1 \approx 1{,}31$ und $\mu_2 \approx 3{,}95$; die Eigenwerte von $S$ sind $1 - \sigma\mu_i$. Für $\sigma > 2/\mu_2 \approx 0{,}507$ wird $|1 - \sigma\mu_2| > 1$ – Divergenz (das Skript findet 0,505). Optimal ist
      $\sigma = 2/(\mu_1 + \mu_2) \approx 0{,}38$ (wie bei Richardson) mit asymptotischer Rate $(\mu_2 - \mu_1)/(\mu_2 + \mu_1) \approx 0{,}50$ – passend zur Beobachtung, dass $\sigma$ zwischen 0,3 und 0,4 am besten ist.`)}
  `,
};

export default {
  id: 'vl15',
  number: 15,
  title: 'Nichtlineare Gleichungen',
  summary: 'Nullstellensuche im ℝⁿ, Grundbegriffe der Analysis, Fixpunktiteration, Kontraktionen und der Banach’sche Fixpunktsatz mit a-priori- und a-posteriori-Schranken.',
  sections: [motivation, analysis, fixpunkt],
};
