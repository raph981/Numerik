/**
 * Vorlesung 3: Rechnen mit Fließkommazahlen
 */
import { box, exercise, lead, list, tx, widget } from './blocks.js';

const arithmetik = {
  id: 'fliesskommaarithmetik',
  title: '3.1 Fließkommaarithmetik',
  body: tx`
    ${lead(`In VL 2 haben wir gesehen, wie Zahlen gespeichert werden. Jetzt wird gerechnet – und dabei
      gelten einige vertraute Rechengesetze plötzlich nicht mehr.`)}
    <p>Wir brauchen zweistellige Operationen</p>
    $$\circledast: \F \times \F \to \F, \qquad \circledast \in \{\oplus, \ominus, \odot, \oslash\}, \tag{3.1}$$
    <p>die den Grundrechenarten $+, -, \cdot, /$ entsprechen. Das Problem: Selbst für $x, y \in \F$ liegt das exakte
      Ergebnis $x * y$ in der Regel <em>nicht</em> in $\F$. Bei der Multiplikation verdoppelt sich die Zahl der
      Mantissenstellen, bei der Addition von Zahlen mit verschiedenen Exponenten braucht man ebenfalls mehr Stellen.
      Die naheliegende Definition ist daher</p>
    $$x \circledast y = \rd(x * y), \qquad * \in \{+, -, \cdot, /\}. \tag{3.2}$$
    <p>Eine Arithmetik mit dieser Eigenschaft heißt <strong>exakt gerundet</strong>: Das Ergebnis ist so, als hätte man exakt
      gerechnet und erst danach einmal gerundet.</p>

    ${box('intuition', 'Wie macht das der Prozessor? Guard digits', tx`Exakt zu rechnen und dann zu runden wäre teuer: Für
      $x = 10^{10}$ und $y = 10^{-10}$ in $\F(10, 4, 2)$ müsste man $y = 10^{-21}\cdot 10^{11}$ schreiben und bräuchte 21
      Nachkommastellen. Stattdessen:
      ${list([
        'Bringe beide Zahlen auf den Exponenten der betragsgrößeren (die kleinere ist dann nicht mehr normiert).',
        tx`Runde die verschobene Zahl auf $r + 2$ Stellen.`,
        tx`Addiere mit $r + 2$ Stellen – die zwei Zusatzstellen heißen <strong>guard digits</strong>.`,
        tx`Runde das Ergebnis auf $r$ Stellen.`,
      ], true)}
      Zwei zusätzliche Stellen genügen für exakte Rundung. Im IEEE-754-Standard sind die Grundoperationen und die Wurzel exakt gerundet.`)}

    ${widget('float-arithmetic', {}, tx`Rechnen in $\F(10, r)$: Jede einzelne Operation hat einen relativen Fehler $\le \eps$. Aber schon drei Zahlen
      zu addieren kann je nach Reihenfolge verschiedene Ergebnisse liefern.`)}

    ${box('merke', 'Was in F anders ist', list([
      tx`Es gibt $y \neq 0$ mit $x \oplus y = x$ (wenn $y$ im Vergleich zu $x$ „zu klein“ ist).`,
      tx`<strong>Assoziativ- und Distributivgesetz gelten nicht</strong> (unbedingt): Mit $y$ von eben ist $(x \oplus y) \ominus x = 0$, aber $y \oplus (x \ominus x) = y$.`,
      tx`Das <strong>Kommutativgesetz gilt</strong> weiterhin: $x \oplus y = y \oplus x$.`,
      tx`Einfache Regeln bleiben: $(-x)\odot y = -(x \odot y)$, $1 \odot x = x$, $x \odot y = 0 \Leftrightarrow x = 0 \lor y = 0$, und aus $x \le y$, $z > 0$ folgt $x \odot z \le y \odot z$.`,
    ]))}

    <p>Eine praktische Folge: Beim Aufsummieren vieler Zahlen kommt es auf die Reihenfolge an.</p>
    ${widget('summation-order', {}, tx`$\sum_{k=1}^n 1/k^2$ in <code>float</code>: Wer mit den kleinen Summanden beginnt, verliert sie nicht.`)}
  `,
};

const fehleranalyse = {
  id: 'fehleranalyse',
  title: '3.2 Fehleranalyse',
  body: tx`
    ${lead(`Ein Algorithmus besteht aus vielen Grundoperationen, und jede steuert einen kleinen Rundungsfehler bei. Wie wirken
      sie zusammen? Der Trick: Man trennt das Problem vom Verfahren.`)}
    <p>Abstrakt berechnen wir eine Funktion $F: \R^m \to \R^n$. Im Rechner wird sie durch $F': \F^m \to \F^n$ realisiert, eine
      Hintereinanderausführung endlich vieler Elementaroperationen $F'(x') = \varphi_l(\dots\varphi_2(\varphi_1(x'))\dots)$.
      Diese Realisierung ist nicht eindeutig – $x(y + z)$ und $xy + xz$ sind mathematisch gleich, liefern in $\F$ aber evtl. Verschiedenes.</p>
    <p>Die zentrale Aufspaltung des Gesamtfehlers lautet</p>
    $$F(x) - F'(\rd(x)) = \underbrace{F(x) - F(\rd(x))}_{\text{Konditionsanalyse}} + \underbrace{F(\rd(x)) - F'(\rd(x))}_{\text{Rundungsfehleranalyse}}. \tag{3.3}$$
    <div class="split-diagram" role="img" aria-label="Aufspaltung des Fehlers in Kondition und Rundung">
      <div class="split-diagram__node">$x$</div>
      <div class="split-diagram__arrow">Eingabe runden →</div>
      <div class="split-diagram__node">$\rd(x)$</div>
      <div class="split-diagram__arrow">exakt $F$ vs. Rechner $F'$ →</div>
      <div class="split-diagram__node">$F(\rd(x))$ vs. $F'(\rd(x))$</div>
    </div>
    ${list([
      tx`<strong>Konditionsanalyse:</strong> Wie empfindlich reagiert das <em>Problem</em> $F$ auf Störungen der Eingabe? Das hat mit dem Rechner nichts zu tun – keine Methode kann das verbessern.`,
      tx`<strong>Rundungsfehleranalyse:</strong> Wie stark weicht das <em>Verfahren</em> $F'$ bei gleicher Eingabe von $F$ ab? Hier kann man durch geschickte Algorithmen gewinnen.`,
    ])}
    <p>Mit der Dreiecksungleichung folgt für Fehlernormen
      $\|F(x) - F'(\rd(x))\| \le \|F(x) - F(\rd(x))\| + \|F(\rd(x)) - F'(\rd(x))\|$.</p>
  `,
};

const kondition = {
  id: 'konditionsanalyse',
  title: '3.3 Differentielle Konditionsanalyse',
  body: tx`
    ${lead(`Wie stark „verstärkt“ eine Funktion kleine relative Fehler der Eingabe? Die Antwort liefert eine Linearisierung mit dem
      Satz von Taylor.`)}
    ${box('satz', '3.1 (Taylor, eine Variable)', tx`Sei $f: (a, b) \to \R$ $(r+1)$-mal stetig differenzierbar und $x, z \in (a, b)$. Dann gibt
      es ein $\xi$ zwischen $x$ und $z$, so dass
      $$f(z) = \sum_{k=0}^{r} \frac{1}{k!}\frac{d^k f(x)}{dx^k}(z - x)^k + \frac{1}{(r+1)!}\frac{d^{r+1} f(\xi)}{dx^{r+1}}(z - x)^{r+1}. \tag{3.4}$$
      Die Summe heißt <strong>Taylorpolynom</strong> $t_r(x, z)$, der letzte Term <strong>Lagrange'sches Restglied</strong> $R_r(x, z)$.
      Mit $z = x + h$ schreibt man oft $f(x + h) = \sum_{k=0}^r \frac{f^{(k)}(x)}{k!}h^k + \frac{f^{(r+1)}(\xi)}{(r+1)!}h^{r+1}$. (3.5)`)}
    ${widget('taylor', {}, tx`Je höher der Grad $r$, desto besser schmiegt sich das Polynom an – aber nur in der Nähe des Entwicklungspunktes.
      Unten sieht man, wie das Restglied für $h \to 0$ wie $h^{r+1}$ verschwindet.`)}

    ${box('definition', '3.3 (Gradient)', tx`Für $f: D \subset \R^m \to \R$ partiell differenzierbar ist
      $\nabla f(x) = \left(\frac{\partial f(x)}{\partial x_1}, \dots, \frac{\partial f(x)}{\partial x_m}\right)^T$.`)}
    ${box('satz', '3.4 (Taylor, mehrere Variablen, r = 1)', tx`Für $f$ zweimal stetig differenzierbar gibt es $\theta \in (0, 1)$ mit
      $$f(x + \eta) = f(x) + \nabla f(x)\cdot\eta + \underbrace{\frac12\sum_{i=1}^m \frac{\partial^2 f(x + \theta\eta)}{\partial x_i^2}\eta_i^2 + \sum_{i=1}^m\sum_{i<j\le m}\frac{\partial^2 f(x+\theta\eta)}{\partial x_i\partial x_j}\eta_i\eta_j}_{R_1(x,\eta)}. \tag{3.6}$$
      Mit $h = \max_i |\eta_i|$ gilt $|R_1(x, \eta)| = O(h^2)$: Das Restglied „geht wie $h^2$“ gegen null.`)}

    ${box('definition', '3.6 (Landau-Symbole)', tx`<ol type="a">
      <li>$g(t) = O(h(t))$ für $t \to 0$, falls $|g(t)| \le c_0 |h(t)|$ für alle $0 < t \le t_0$ – „$g$ geht mindestens wie $h$ gegen null“.</li>
      <li>$g(t) = o(h(t))$, falls $|g(t)| \le c(t)|h(t)|$ mit $c(t) \to 0$ – „$g$ geht schneller als $h$ gegen null“.</li>
      <li>$g(t) \doteq h(t)$ („in erster Näherung gleich“), falls $g(t) - h(t) = o(t)$.</li>
    </ol>
    Aus Taylor folgt damit $f(x + \eta) \doteq f(x) + \sum_i \frac{\partial f(x)}{\partial x_i}\eta_i$: Für kleine Störungen zählt nur der lineare Teil.`)}

    <h3>Verstärkungsfaktoren</h3>
    <p>Wenden wir das auf jede Komponente $F_i$ an und gehen zu relativen Änderungen über:</p>
    $$\frac{F_i(x + \Delta x) - F_i(x)}{F_i(x)} \doteq \sum_{j=1}^m \underbrace{\frac{\partial F_i}{\partial x_j}(x)\,\frac{x_j}{F_i(x)}}_{\text{Verstärkungsfaktor } k_{ij}(x)}\;\frac{\Delta x_j}{x_j}.$$
    <p>$k_{ij}$ sagt, wie stark ein relativer Fehler in der $j$-ten Eingabe auf die $i$-te Ausgabe durchschlägt.</p>
    ${box('definition', '3.7 (Kondition)', tx`Die Auswertung $y = F(x)$ heißt im Punkt $x$ <strong>schlecht konditioniert</strong>, falls $|k_{ij}(x)| \gg 1$, sonst
      <strong>gut konditioniert</strong>. Bei $|k_{ij}| < 1$ spricht man von Fehlerdämpfung, bei $|k_{ij}| > 1$ von Fehlerverstärkung.`)}
    <p>In (3.3) ist $\Delta x = \rd(x) - x$, also $|\Delta x_j / x_j| \le \eps$: Der relative Fehler der Ausgabe ist bis zu $|k_{ij}|\cdot\eps$.</p>

    ${box('beispiel', '3.8 (Kondition der Grundoperationen)', tx`<ol type="a">
      <li><strong>Addition</strong> $F = x_1 + x_2$: $k_1 = \frac{x_1}{x_1 + x_2}$, $k_2 = \frac{x_2}{x_1 + x_2}$. Für $x_1 \to -x_2$ werden beide riesig – schlecht konditioniert! (Ebenso die Subtraktion für $x_1 \to x_2$.)</li>
      <li><strong>Multiplikation</strong> $F = x_1 x_2$: $k_1 = x_2\frac{x_1}{x_1x_2} = 1$, $k_2 = 1$ – immer gut konditioniert!</li>
      <li>$F = x_1^2 - x_2^2$: $k_1 = \frac{2x_1^2}{x_1^2 - x_2^2}$, $k_2 = \frac{2x_2^2}{x_2^2 - x_1^2}$ – schlecht konditioniert für $|x_1| \approx |x_2|$.</li>
    </ol>`)}
    ${widget('condition-map', {}, 'Die Heatmap zeigt max |kⱼ| über der (x₁, x₂)-Ebene. Bei der Addition zieht sich ein roter Streifen entlang x₁ = −x₂, bei der Multiplikation ist alles grün.')}
  `,
};

const rundung = {
  id: 'rundungsfehleranalyse',
  title: '3.4 Rundungsfehleranalyse',
  body: tx`
    ${lead(`Jetzt betrachten wir den zweiten Teil von (3.3): Wie weit weicht das Verfahren F′ von F ab, wenn beide dieselben
      Maschinenzahlen bekommen?`)}
    <p>Entspricht $F$ genau einer Operation, so gilt wegen exakter Rundung</p>
    $$x \circledast y = (x * y)(1 + \epsilon) \qquad \text{für ein } |\epsilon(x, y)| \le \eps = \tfrac12\beta^{1-r}.$$
    <p>Der genaue Fehler $\epsilon$ hängt von den Argumenten ab – wir kennen nur seine Schranke. Damit kann man Rundungsfehler durch
      einen Algorithmus „durchrechnen“.</p>

    ${box('beispiel', '3.9', tx`Zwei Realisierungen von $F(x_1, x_2) = x_1^2 - x_2^2$:
      $$F_a = (x_1 \odot x_1) \ominus (x_2 \odot x_2), \qquad F_b = (x_1 \ominus x_2) \odot (x_1 \oplus x_2).$$
      <p><strong>a)</strong> $u = x_1^2(1 + \epsilon_1)$, $v = x_2^2(1 + \epsilon_2)$ und
      $F_a = (u - v)(1 + \epsilon_3) = x_1^2 - x_2^2 + (\epsilon_1 + \epsilon_3)x_1^2 - (\epsilon_2 + \epsilon_3)x_2^2 + \dots$, also in erster Näherung
      $$\frac{F_a - F}{F} \doteq \frac{x_1^2}{x_1^2 - x_2^2}(\epsilon_1 + \epsilon_3) + \frac{x_2^2}{x_2^2 - x_1^2}(\epsilon_2 + \epsilon_3).$$
      Bis auf Konstanten dieselben Verstärkungsfaktoren wie in Beispiel 3.8 c).</p>
      <p><strong>b)</strong> $u = (x_1 - x_2)(1 + \epsilon_1)$, $v = (x_1 + x_2)(1 + \epsilon_2)$ und
      $F_b = uv(1 + \epsilon_3) = (x_1^2 - x_2^2)(1 + \epsilon_1)(1 + \epsilon_2)(1 + \epsilon_3)$, also
      $$\frac{F_b - F}{F} \doteq \epsilon_1 + \epsilon_2 + \epsilon_3.$$
      Hier ist der Verstärkungsfaktor 1!</p>`)}
    ${widget('squares-difference', {}, tx`Für nahe beieinanderliegende $x_1, x_2$ ist $F_a$ deutlich ungenauer – $F_b$ bleibt immer in der Größenordnung $\eps$.`)}
    ${box('definition', '3.10 (Numerische Stabilität)', tx`Ein Algorithmus heißt <strong>numerisch stabil</strong>, wenn die Verstärkungsfaktoren
      aus der Rundungsfehleranalyse die aus der Konditionsanalyse nicht übersteigen.`)}
    <p>Nach dieser Definition sind <em>beide</em> Realisierungen stabil: $F_a$ verstärkt Fehler zwar stark, aber nicht stärker als
      das Problem selbst. $F_b$ ist sogar besser als nötig – das liegt daran, dass die Subtraktion hier an den <em>exakten</em>
      Eingaben stattfindet.</p>
    ${exercise(tx`Warum schadet die Subtraktion in $F_b$ nicht, obwohl $x_1 - x_2$ schlecht konditioniert ist?`,
      tx`Die Konditionsanalyse betrachtet <em>gestörte</em> Eingaben. In $F_b$ sind $x_1, x_2$ bereits Maschinenzahlen, also exakt, und
      $x_1 \ominus x_2$ hat nur den eigenen Rundungsfehler $\le \eps$ (Beispiel 3.11 a). In $F_a$ dagegen werden die bereits <em>gerundeten</em>
      Quadrate $u, v$ subtrahiert – deren Fehler werden durch die Auslöschung verstärkt.`)}
  `,
};

const quadratisch = {
  id: 'quadratische-gleichung',
  title: '3.5 Die quadratische Gleichung',
  body: tx`
    ${lead(`Die p-q-Formel aus der Schule ist ein schönes Beispiel dafür, dass man Rundungsfehler für jedes Problem einzeln
      betrachten muss.`)}
    <p>Die Gleichung $x^2 - px + q = 0$ hat für $p^2/4 > q \neq 0$ die zwei reellen Lösungen</p>
    $$x_{1/2} = f_\pm(p, q) = \frac p2 \pm \sqrt{\frac{p^2}{4} - q}.$$
    <p>Die Konditionsanalyse beider Abbildungen liefert mit $s = \sqrt{p^2/4 - q}$ (wegen $\partial f_\pm/\partial p = \pm f_\pm/(2s)$ und $\partial f_\pm/\partial q = \mp 1/(2s)$)</p>
    $$\frac{f_\pm(p + \Delta p, q + \Delta q) - f_\pm(p, q)}{f_\pm(p, q)} \doteq
      \pm\frac{p}{2s}\cdot\frac{\Delta p}{p} \;\mp\; \frac{q}{2s\, f_\pm(p, q)}\cdot\frac{\Delta q}{q}.$$
    ${list([
      tx`Für $\frac{p^2}{4} \to q$ (doppelte Nullstelle) geht $s \to 0$: <strong>beide</strong> Lösungen sind schlecht konditioniert – das lässt sich durch keinen Algorithmus vermeiden.`,
      tx`Für $q \to 0$ und $|p|$ nicht klein ist für $p > 0$ die Lösung $f_+ \approx p$ gut konditioniert ($k_p \approx 1$, $k_q \approx 0$), für $p < 0$ entsprechend $f_-$.
        Die jeweils <em>andere</em> Lösung $\approx q/p$ ist klein. Als Problem ist auch sie harmlos ($|k| \approx 1$) – aber die Formel berechnet sie als
        Differenz $\frac p2 - s$ zweier fast gleicher Zahlen. Das Problem ist gut, der Rechenweg schlecht!`,
    ])}
    ${box('merke', 'Stabile Berechnung mit dem Satz von Vieta', tx`Aus $x_1 + x_2 = p$ und $x_1 \cdot x_2 = q$ folgt: Berechne zuerst
      $w = \sqrt{(p \odot p) \oslash 4 \ominus q}$ und dann
      <ul>
        <li>für $p < 0$: $x_2 = p \oslash 2 \ominus w$, $\;x_1 = q \oslash x_2$,</li>
        <li>für $p > 0$: $x_1 = p \oslash 2 \oplus w$, $\;x_2 = q \oslash x_1$.</li>
      </ul>
      So wird nur addiert, wo beide Summanden dasselbe Vorzeichen haben.`)}
    ${widget('quadratic', {}, tx`Berechnung in <code>float</code>. Machen Sie $q$ klein: Die p-q-Formel verliert bei der kleinen Lösung alle Stellen, Vieta bleibt exakt.`)}
  `,
};

const ausloeschung = {
  id: 'ausloeschung',
  title: '3.6 Auslöschung',
  body: tx`
    ${lead(`Das Grundübel hinter allen bisherigen Beispielen hat einen Namen: Auslöschung. Sie tritt auf, wenn fast gleiche,
      bereits fehlerbehaftete Zahlen voneinander abgezogen werden.`)}
    <p>Aus den Beispielen 3.8 a) und 3.9 a) sehen wir: Addition und Subtraktion (die dasselbe sind, $x - y = x + (-y)$) sind die gefährlichen
      Operationen – aber erst dann, wenn die Operanden selbst schon Fehler tragen.</p>
    ${box('beispiel', '3.11 (Zur Auslöschung)', tx`<ol type="a">
      <li>Für Maschinenzahlen $x_1, x_2 \in \F$ gilt wegen exakter Rundung $\left|\frac{(x_1 \ominus x_2) - (x_1 - x_2)}{x_1 - x_2}\right| \le \eps$. Die Subtraktion <em>selbst</em> ist harmlos.</li>
      <li>Sind $x_1 = m_1\beta^e$ und $x_2 = (m_1 - \beta^{-r})\beta^e$ benachbarte Maschinenzahlen, so kann der Verstärkungsfaktor aus 3.9 a) die Größe
        $\frac{x_1^2}{x_1^2 - x_2^2} \approx \frac{m_1^2\beta^{2e}}{\beta^{-r}\beta^e\, 2m_1\beta^e} \approx \beta^{r-1}$ erreichen – es gehen also <em>alle</em> Stellen verloren.</li>
      <li>In $\F(10, 4, 1)$ mit $x_1 = 0{,}11258762\cdot 10^2$, $x_2 = 0{,}11244891\cdot 10^2$: exakt ist $x_1 - x_2 = 0{,}13871\cdot 10^{-1}$.
        Rundung liefert $\rd(x_1) = 0{,}1126\cdot 10^2$, $\rd(x_2) = 0{,}1124\cdot 10^2$ und $\rd(x_1) \ominus \rd(x_2) = 0{,}2\cdot 10^{-1}$ – ohne weiteren Rundungsfehler!
        Trotzdem ist keine Stelle richtig: Der relative Fehler ist $\approx 0{,}44 \approx 883\,\eps$.</li>
    </ol>`)}
    ${widget('cancellation', {}, 'Beispiel 3.11 c) zum Nachrechnen: Ändern Sie die Zahlen oder die Mantissenlänge.')}
    ${box('merke', 'Faustregel', tx`Setze die potentiell gefährlichen Operationen $\oplus, \ominus$ <strong>möglichst früh</strong> ein – solange die Daten noch exakt sind.
      Genau das macht $F_b = (x_1 \ominus x_2)\odot(x_1 \oplus x_2)$ besser als $F_a$.`)}
  `,
};

export default {
  id: 'vl3',
  number: 3,
  title: 'Rechnen mit Fließkommazahlen',
  summary: 'Exakt gerundete Arithmetik, Kondition und Rundungsfehleranalyse, numerische Stabilität, die quadratische Gleichung und Auslöschung.',
  sections: [arithmetik, fehleranalyse, kondition, rundung, quadratisch, ausloeschung],
};
