/**
 * Vorlesung 2: Fließkommadarstellung
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const beispiel = {
  id: 'einfuehrendes-beispiel',
  title: '2.1 Einführendes Beispiel',
  body: tx`
    ${lead(`Computer rechnen nicht mit reellen Zahlen, sondern mit endlich vielen Näherungen. Ein harmloses Beispiel zeigt,
      wie dramatisch die Folgen sein können.`)}
    <p>Programmiersprachen stellen elementare Datentypen bereit, die Idealisierungen der Zahlenmengen sind:</p>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Datentyp</th><th>Mathematik</th><th>Idealisierung</th></tr></thead>
      <tbody>
        <tr><td><code>unsigned int</code>, <code>unsigned short</code>, <code>unsigned long</code></td><td>$\N_0$</td><td rowspan="2">größte/kleinste Zahl – innerhalb des Bereichs exakt</td></tr>
        <tr><td><code>int</code>, <code>short</code>, <code>long</code></td><td>$\Z$</td></tr>
        <tr><td><code>float</code>, <code>double</code></td><td>$\R$</td><td rowspan="2">zusätzlich: die meisten Zahlen nur <em>näherungsweise</em></td></tr>
        <tr><td><code>complex&lt;float&gt;</code>, <code>complex&lt;double&gt;</code></td><td>$\C$</td></tr>
      </tbody>
    </table></div>

    ${box('beispiel', '2.1', tx`Die Exponentialfunktion lässt sich als Potenzreihe berechnen:
      $$e^x = 1 + \sum_{i=1}^{\infty} \frac{x^i}{i!}.$$
      Die Partialsumme $S_n = 1 + \sum_{i=1}^n \frac{x^i}{i!}$ ist eine Näherung. Praktisch rechnet man rekursiv
      $$y_1 = x,\quad S_1 = 1 + y_1, \qquad y_n = \frac{x}{n}\, y_{n-1}, \quad S_n = S_{n-1} + y_n.$$`)}

    <p>Wie gut funktioniert das? Testen Sie selbst – insbesondere $x = 1$, $x = -1$, $x = -5$ und $x = -20$:</p>
    ${widget('exp-series', { x: -20 }, tx`Für $x = -20$ in <code>float</code> ist <em>keine einzige</em> Stelle richtig – das Ergebnis ist um
      8 Größenordnungen falsch. Selbst <code>double</code> trifft nur die Größenordnung.`)}

    ${box('intuition', 'Was geht hier schief?', tx`Für $x = -20$ werden die Summanden zunächst riesig ($|y_{20}| = 20^{20}/20! \approx 4{,}3\cdot 10^{7}$)
      und wechseln das Vorzeichen. Das Ergebnis $e^{-20} \approx 2\cdot 10^{-9}$ ist dagegen winzig. Jede Rundung auf
      dem Weg erzeugt einen Fehler in der Größenordnung $10^7 \cdot \eps$ – das ist bei <code>float</code>
      ($\eps \approx 6\cdot 10^{-8}$) weit mehr als das Ergebnis selbst. Große Zahlen löschen sich gegenseitig aus und
      zurück bleibt nur der Rundungsmüll (<em>Auslöschung</em>, siehe Kapitel 3).`)}

    <p>Das motiviert die Fragen dieser Vorlesung:</p>
    ${list(['Was bedeutet „Rechengenauigkeit“?', 'Wann und wie entstehen Fehler in einer Berechnung?', 'Können diese Fehler vermieden oder minimiert werden?'])}
    ${box('merke', '', tx`In diesem Beispiel ist die Abhilfe einfach: $e^{x} = 1/e^{-x}$. Für $x < 0$ berechnet man die Reihe mit dem
      positiven Argument $-x$ – dort haben alle Summanden dasselbe Vorzeichen. Probieren Sie es im Widget oben aus!`)}
  `,
};

const stellenwert = {
  id: 'stellenwertsystem',
  title: '2.2 Stellenwertsystem und Festkommazahlen',
  body: tx`
    ${lead('Bevor wir Fließkommazahlen definieren, frischen wir das Stellenwertsystem auf – die Grundlage jeder Zahlendarstellung.')}
    <p>Eine natürliche Zahl $x \in \N$ wird im <strong>Stellenwertsystem</strong> dargestellt als</p>
    $$x = m_n \beta^n + \dots + m_1 \beta + m_0 = \sum_{i=0}^{n} m_i \beta^i$$
    <p>mit den <em>Ziffern</em> $m_i \in \{0, 1, \dots, \beta - 1\}$ und der <em>Basis</em> $\beta \in \N$, $\beta \ge 2$.
      Babylon nutzte $\beta = 60$, in Europa setzte sich ab dem 16. Jahrhundert $\beta = 10$ durch, Computer verwenden $\beta = 2$.
      (Gegenbeispiel ohne Stellenwert: römische Zahlen – für Arithmetik denkbar ungeeignet.)</p>
    <p>Für negative und nichtganze Zahlen ergänzt man ein Vorzeichen und negative Potenzen – die <strong>Festkommadarstellung</strong>:</p>
    $$x = \pm \bigl(m_n\beta^n + \dots + m_0 + m_{-1}\beta^{-1} + \dots + m_{-k}\beta^{-k}\bigr) = \pm\sum_{i=-k}^{n} m_i \beta^i.$$
    ${widget('positional', { value: '13.375' }, tx`Versuchen Sie $0{,}1$ zur Basis 2: Die Darstellung bricht nicht ab! Eine Zahl mit endlicher
      Dezimaldarstellung kann im Binärsystem unendlich viele Stellen haben.`)}
    <p>Das Problem der Festkommadarstellung: In Naturwissenschaften kommen sehr unterschiedlich große Zahlen vor – etwa das
      Planck'sche Wirkungsquantum $6{,}626\cdot 10^{-34}\,\mathrm{Js}$ und die Avogadrokonstante $6{,}022\cdot 10^{23}\,\mathrm{mol}^{-1}$.
      Mit $\beta = 2$ bräuchte man für beide ungefähr 190 Binärstellen. Da solche Zahlen aber selten <em>gleichzeitig</em>
      verarbeitet werden, ist die Fließkommadarstellung effizienter.</p>
  `,
};

const fliesskomma = {
  id: 'fliesskommazahlen',
  title: '2.2 Normierte Fließkommazahlen',
  body: tx`
    ${lead('Idee: Man speichert nur eine feste Anzahl signifikanter Ziffern (Mantisse) und dazu, wo das Komma steht (Exponent) – wie bei der wissenschaftlichen Notation 6,022 · 10²³.')}
    ${box('definition', '2.2 (Normierte Fließkommadarstellung)', tx`Sei $\beta, r, s \in \N$ und $\beta \ge 2$.
      $\F(\beta, r, s) \subset \R$ heißt <em>Menge der normierten Fließkommazahlen</em>. Ihre Elemente erfüllen:
      <ol type="a">
        <li>Für alle $x \in \F(\beta, r, s)$ gilt
          $$x = m(x)\,\beta^{e(x)}, \qquad m(x) = \pm\sum_{i=1}^{r} m_i \beta^{-i}, \qquad e(x) = \pm\sum_{j=0}^{s-1} e_j \beta^j.$$
          $m(x)$ heißt <strong>Mantisse</strong>, $e(x)$ <strong>Exponent</strong> von $x$.</li>
        <li>Für alle $x \in \F(\beta, r, s)$ gilt $x = 0 \lor m_1 \neq 0$. Diese <strong>Normierungsbedingung</strong> macht die
          Darstellung von $x \neq 0$ eindeutig.</li>
      </ol>`)}
    ${box('intuition', '', tx`$r$ = Anzahl der Mantissenstellen (bestimmt die <em>Genauigkeit</em>),
      $s$ = Anzahl der Exponentenstellen (bestimmt den <em>Zahlenbereich</em>). Ohne Normierung wäre z.&nbsp;B.
      $0{,}10 \cdot 10^1 = 0{,}01 \cdot 10^2$ – zwei Darstellungen derselben Zahl.`)}
    <p>Aus der Definition folgen für $x \neq 0$ die Abschätzungen</p>
    $$\frac{1}{\beta} \le |m(x)| < 1, \qquad \beta^{e(x)-1} \le |x| < \beta^{e(x)}. \tag{2.1}$$
    ${exercise('Leiten Sie diese Abschätzungen her.', tx`Wegen der Normierung ist $m_1 \ge 1$, also
      $|m(x)| \ge m_1 \beta^{-1} \ge \beta^{-1}$. Nach oben: $|m(x)| \le \sum_{i=1}^r (\beta - 1)\beta^{-i} = 1 - \beta^{-r} < 1$
      (Teleskopsumme). Multiplikation mit $\beta^{e(x)} > 0$ liefert $\beta^{e(x)-1} \le |x| < \beta^{e(x)}$.`)}

    ${box('beispiel', '2.3', tx`<ol type="a">
      <li>$\F(10, 3, 1)$ besteht aus Zahlen der Form $x = \pm(m_1\cdot 0{,}1 + m_2 \cdot 0{,}01 + m_3 \cdot 0{,}001)\cdot 10^{\pm e_0}$
        mit $0 \le m_i, e_0 < 10$, $m_1 \neq 0$, sowie der Null – insgesamt $9\cdot 10\cdot 10\cdot 19\cdot 2 + 1 = 34201$ Zahlen.</li>
      <li>$\F(2, 2, 1)$ besteht aus $x = \pm(m_1 \cdot \frac12 + m_2\cdot\frac14)\cdot 2^{\pm e_0}$ mit $m_1 = 1$,
        $0 \le m_2, e_0 \le 1$ und der Null:
        $$\F(2,2,1) = \left\{-\tfrac32, -1, -\tfrac34, -\tfrac12, -\tfrac38, -\tfrac14, 0, \tfrac14, \tfrac38, \tfrac12, \tfrac34, 1, \tfrac32\right\}.$$</li>
    </ol>`)}
    ${exercise(tx`Wie lautet die Darstellung von $\F(2,2,1)$ zur Basis 2?`, tx`Mantisse $(0.1m_2)_2$, Exponent $\pm e_0 \in \{-1, 0, 1\}$:
      $$\begin{aligned}
        \tfrac14 &= (0.10)_2\cdot 2^{-1}, & \tfrac38 &= (0.11)_2\cdot 2^{-1}, & \tfrac12 &= (0.10)_2\cdot 2^{0},\\
        \tfrac34 &= (0.11)_2\cdot 2^{0}, & 1 &= (0.10)_2\cdot 2^{1}, & \tfrac32 &= (0.11)_2\cdot 2^{1}.
      \end{aligned}$$
      Im Widget unten können Sie mit β = 2, r = 2, s = 1 alle Elemente auflisten lassen.`)}
    ${box('merke', 'Hidden bit', tx`Für $\beta = 2$ erzwingt die Normierung $m_1 = 1$. Diese Stelle muss man also gar nicht speichern und hat
      effektiv $r + 1$ Mantissenstellen ohne zusätzlichen Speicher.`)}
    ${widget('float-system', { beta: 2, r: 2, s: 1 }, tx`Der minimale Abstand zweier Zahlen in $\F(2,2,1)$ ist $\frac18$ – er wird aber nicht bei der Null erreicht.
      Dort klafft eine Lücke der Breite $\frac14$. Praktische Implementierungen geben die Normierung nahe der Null daher auf
      (denormalisierte Zahlen, siehe IEEE 754).`)}
  `,
};

const bereich = {
  id: 'zahlenbereich-abstaende',
  title: '2.2 Zahlenbereich und Abstände',
  body: tx`
    ${lead('Wie groß und wie klein dürfen Zahlen werden – und wie dicht liegen sie?')}
    <h3>Zahlenbereich</h3>
    <p>Die größte bzw. kleinste darstellbare Zahl in $\F(\beta, r, s)$ ist</p>
    $$X_\pm = \pm(\beta - 1)\Bigl(\sum_{i=1}^r \beta^{-i}\Bigr)\cdot \beta^{(\beta - 1)\sum_{j=0}^{s-1}\beta^j},$$
    <p>die kleinste positive bzw. größte negative Zahl</p>
    $$x_\pm = \pm\beta^{-1-(\beta-1)\sum_{j=0}^{s-1}\beta^j}.$$
    <p>Damit gilt $\F(\beta, r, s) \subset D(\beta, r, s) = [X_-, x_-] \cup \{0\} \cup [x_+, X_+]$.</p>
    ${box('intuition', '', tx`Alle Ziffern auf $\beta - 1$ gesetzt: Der größte Exponent ist $(\beta - 1)\sum_j \beta^j = \beta^s - 1$, die
      größte Mantisse $0{,}(\beta{-}1)(\beta{-}1)\ldots = 1 - \beta^{-r}$. Die kleinste positive Zahl hat die kleinste
      normierte Mantisse $\beta^{-1}$ und den kleinsten Exponenten $-(\beta^s - 1)$.`)}

    <h3>Abstände zwischen Fließkommazahlen</h3>
    ${box('beobachtung', '2.4', tx`Betrachte $\F(\beta, r, s)$.
      <ol type="a">
        <li>Für zwei Fließkommazahlen $x \neq x'$ im Bereich $\beta^{e-1} \le x, x' \le \beta^e$ gilt $|x - x'| \ge \beta^{e-r}$.
          Gilt Gleichheit, heißen $x$ und $x'$ <strong>benachbart</strong>.</li>
        <li>Für benachbarte $x \neq x'$ in diesem Bereich gilt
          $$\beta^{-r} \le \frac{|x - x'|}{|x|} \le \beta^{1-r}.$$
          Der <em>relative</em> Abstand schwankt also maximal um den Faktor $\beta$. Kleine Basen sind in dieser Hinsicht von Vorteil.</li>
      </ol>
      ${proof(tx`<p>a) Beide Zahlen haben denselben Exponenten $e$: $x = m(x)\beta^e$, $x' = m(x')\beta^e$ (am rechten Rand erlauben wir
        ausnahmsweise $m(x') = 1$). Zwei verschiedene Mantissen unterscheiden sich mindestens um die Wertigkeit der letzten Stelle
        $\beta^{-r}$, also
        $$|x - x'| = |m(x) - m(x')|\,\beta^e \ge \beta^{e-r}.$$</p>
        <p>b) Für benachbarte Zahlen ist
        $$\frac{|x - x'|}{|x|} = \frac{\beta^{e-r}}{m(x)\beta^e} = \frac{\beta^{-r}}{m(x)}.$$
        Wegen $\beta^{-1} \le m(x) \le 1$ ist $1 \le m(x)^{-1} \le \beta$, und die Behauptung folgt.</p>`)}`)}
    ${widget('relative-spacing', {}, 'Absolute Abstände wachsen mit |x|, relative Abstände bleiben in einem festen Band – genau das macht Fließkommazahlen so nützlich.')}
  `,
};

const ieee = {
  id: 'ieee-754',
  title: '2.3 IEEE 754 Standard',
  body: tx`
    ${lead('Seit 1985 legt IEEE 754 fest, wie Fließkommazahlen gespeichert und verrechnet werden – damit Programme auf verschiedenen Rechnern dasselbe Ergebnis liefern.')}
    <p>Der Standard fordert $\beta = 2$ und definiert vier Genauigkeitsstufen:</p>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Größe</th><th>single</th><th>single-ext</th><th>double</th><th>double-ext</th></tr></thead>
      <tbody>
        <tr><td>$e_\text{max}$</td><td>127</td><td>≥ 1024</td><td>1023</td><td>≥ 16384</td></tr>
        <tr><td>$e_\text{min}$</td><td>−126</td><td>≤ −1021</td><td>−1022</td><td>≤ −16381</td></tr>
        <tr><td>Bits Exponent</td><td>8</td><td>≤ 11</td><td>11</td><td>15</td></tr>
        <tr><td>Bits insgesamt</td><td>32</td><td>≥ 43</td><td>64</td><td>≥ 79</td></tr>
      </tbody>
    </table></div>
    <p>Bei <code>double</code> stehen 64 Bit zur Verfügung, davon 11 für den Exponenten. Er wird als vorzeichenlose Zahl
      $c \in [1, 2046]$ gespeichert, es gilt $e = c - 1023$, also $-1022 \le e \le 1023$. Die Werte $c \in \{0, 2047\}$
      sind für Sonderfälle reserviert:</p>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>$c$</th><th>$m$</th><th>Situation</th></tr></thead>
      <tbody>
        <tr><td>0</td><td>0</td><td>kodiert die Null</td></tr>
        <tr><td>0</td><td>≠ 0</td><td>denormalisierte Darstellung (füllt die Lücke um die Null)</td></tr>
        <tr><td>2047</td><td>≠ 0</td><td>kodiert NaN (<em>not a number</em>, z.&nbsp;B. 0/0)</td></tr>
        <tr><td>2047</td><td>0</td><td>kodiert $\infty$ (Überlauf)</td></tr>
      </tbody>
    </table></div>
    <p>Für die Mantisse bleiben $64 - 11 = 53$ Bit, abzüglich eines Vorzeichenbits also 52 gespeicherte Bit. Dank
      <em>hidden bit</em> ist die Wertigkeit der kleinsten Mantissenstelle dennoch $2^{-53}$.</p>
    ${widget('ieee754', {}, 'Klicken Sie auf einzelne Bits, um sie umzuschalten. Beachten Sie: 0,1 wird nicht exakt gespeichert!')}
    <p>Außerdem stellt der Standard vier Rundungsarten bereit (Aufrunden, Abrunden, zur Null hin, natürliche Rundung) und
      schreibt vor, dass die Grundoperationen <em>exakt gerundet</em> werden: Das Ergebnis ist so, als hätte man exakt gerechnet
      und erst dann einmal gerundet.</p>
  `,
};

const runden = {
  id: 'runden',
  title: '2.4 Runden',
  body: tx`
    ${lead(tx`Eine reelle Zahl muss auf eine benachbarte Fließkommazahl abgebildet werden. Wie genau, entscheidet die Rundungsfunktion $\rd$.`)}
    <p>Gesucht ist eine Abbildung $\rd: D(\beta, r, s) \to \F(\beta, r, s)$. Sinnvoll ist die <strong>Bestapproximation</strong></p>
    $$|x - \rd(x)| = \min_{y \in \F(\beta, r, s)} |x - y|.$$
    <p>Mit dem linken und rechten Nachbarn</p>
    $$l(x) = \max\{y \in \F : y \le x\}, \qquad r(x) = \min\{y \in \F : y \ge x\}$$
    <p>setzt man</p>
    $$\rd(x) = \begin{cases} x & l(x) = r(x), \text{ d.h. } x \in \F \\ l(x) & |x - l(x)| < |x - r(x)| \\ r(x) & |x - r(x)| < |x - l(x)| \\ \;? & |x - r(x)| = |x - l(x)| \end{cases} \tag{2.2}$$
    <p>Interessant ist nur der letzte Fall: $x$ liegt genau in der Mitte.</p>

    ${box('intuition', 'Das Tabellenmacherdilemma', tx`Wie kommt $x \in \R$ überhaupt in den Computer? Transzendente Zahlen wie $e$ oder $\pi$
      haben unendlich viele Stellen und werden über Reihen berechnet. Liefert die Rechnung nacheinander
      $5{,}0835$, $5{,}0835000$, $5{,}083500000$, …, so kann man a priori nicht sagen, nach wie vielen Schritten feststeht,
      ob $x < 5{,}0835$ oder $x > 5{,}0835$ ist. Deshalb betrachten wir nur $\rd: \F(\beta, r', s) \to \F(\beta, r, s)$ mit $r' > r$.`)}

    <h3>Natürliche (kaufmännische) Rundung</h3>
    $$\rd(x) = \begin{cases} \operatorname{sign}(x)\bigl(\sum_{i=1}^r m_i\beta^{-i}\bigr)\beta^e & m_{r+1} < \beta/2 \\
      \operatorname{sign}(x)\bigl[\sum_{i=1}^r m_i\beta^{-i} + \beta^{-r}\bigr]\beta^e & m_{r+1} \ge \beta/2 \end{cases}$$
    <p>Entscheidend ist nur die Stelle $m_{r+1}$. Im Gleichstand wird immer betragsmäßig aufgerundet.</p>

    <h3>Gerade Rundung</h3>
    <p>Für gerades $\beta$: wie oben, aber im Gleichstand $|x - r(x)| = |x - l(x)|$ wird so gerundet, dass $m_r$ <em>gerade</em> wird
      (abrunden, falls $m_r$ gerade, sonst aufrunden). Sind die Ziffern statistisch gleich verteilt, rundet man so gleich oft auf wie ab
      und vermeidet systematische Verzerrungen. Dafür muss man alle $r'$ Stellen kennen, um den Gleichstand zu erkennen.</p>

    ${box('beispiel', '2.5', list([
      tx`$x_1 = 0{,}32642876$: beide Rundungen liefern $0{,}33$ (zwei Stellen) bzw. $0{,}326$ (drei Stellen).`,
      tx`$x_2 = 0{,}74500$, zwei Stellen: kaufmännisch $0{,}75$, gerade $0{,}74$.`,
      tx`$x_3 = 0{,}75500$, zwei Stellen: kaufmännisch $0{,}76$, gerade ebenfalls $0{,}76$.`,
    ]))}
    ${widget('rounding')}
  `,
};

const fehler = {
  id: 'rundungsfehler',
  title: '2.4 Rundungsfehler und Maschinengenauigkeit',
  body: tx`
    ${lead('Wie groß kann der Fehler einer einzelnen Rundung höchstens sein? Die Antwort liefert die wichtigste Zahl der Vorlesung: eps.')}
    ${box('definition', '2.6 (Relativer und absoluter Fehler)', tx`Wird eine Größe $x \neq 0$ durch $x'$ angenähert, so heißt
      $$e_\text{abs} = x - x' \tag{2.3}$$
      der <strong>absolute Fehler</strong> und
      $$e_\text{rel} = \frac{x - x'}{x} \qquad (x \neq 0) \tag{2.4}$$
      der <strong>relative Fehler</strong>.`)}
    <p>Relative Fehler sind oft aussagekräftiger: „Der Unterschied beträgt einen Meter“ ist beim Hochsprung viel,
      bei der Entfernung Heidelberg–Hamburg wenig.</p>

    ${box('lemma', '2.7 (Rundungsfehler)', tx`Sei $x \in D(\beta, r, s)$ und $\rd$ eine der beschriebenen Rundungsarten. Dann gilt
      $$|x - \rd(x)| \le \frac12 \beta^{e(x) - r} \tag{2.5}$$
      und für $x \neq 0$
      $$\frac{|x - \rd(x)|}{|x|} \le \frac12 \beta^{1-r}. \tag{2.6}$$
      ${proof(tx`<p>Sei $x = m(x)\beta^{e(x)}$ die normierte Darstellung mit möglicherweise unendlich vielen Stellen.
        $l(x)$ und $r(x)$ sind benachbart, nach Beobachtung 2.4 also $|r(x) - l(x)| = \beta^{e(x) - r}$.
        Der maximale Fehler tritt für $x = (l(x) + r(x))/2$ auf:
        $$|x - \rd(x)| \le \left|\frac{l(x) + r(x)}{2} - l(x)\right| = \frac12 |r(x) - l(x)| = \frac12\beta^{e(x)-r}.$$
        Für den relativen Fehler nutzen wir die Normierung $|m(x)| \ge \beta^{-1}$:
        $$\frac{|x - \rd(x)|}{|x|} \le \frac{\frac12\beta^{e(x)-r}}{|m(x)|\,\beta^{e(x)}} = \frac12\frac{1}{|m(x)|}\beta^{-r} \le \frac12\beta^{1-r}.$$</p>`)}`)}

    ${box('merke', 'Maschinengenauigkeit', tx`Die Zahl
      $$\eps = \frac12 \beta^{1-r}$$
      heißt <strong>Maschinengenauigkeit</strong> (<em>machine precision</em>, <em>machine epsilon</em>). Für $\beta = 2$ gilt $\eps = 2^{-r}$.
      Mit dem hidden bit ist $r = 24$ bei <code>float</code> und $r = 53$ bei <code>double</code>:
      <div class="table-scroll"><table class="data-table">
        <thead><tr><th>Typ</th><th>$r$</th><th>$\eps$</th><th>≈ gültige Dezimalstellen</th></tr></thead>
        <tbody>
          <tr><td><code>float</code></td><td>24</td><td>$2^{-24} \approx 5{,}96\cdot 10^{-8}$</td><td>7</td></tr>
          <tr><td><code>double</code></td><td>53</td><td>$2^{-53} \approx 1{,}11\cdot 10^{-16}$</td><td>16</td></tr>
        </tbody>
      </table></div>
      Jede einzelne Rundung verfälscht eine Zahl also <em>relativ</em> um höchstens $\eps$ – unabhängig von ihrer Größe.`)}
    ${widget('rounding-error', {}, 'Runden Sie verschiedene Zahlen in kleine Fließkommasysteme. Das Diagramm zeigt den relativen Fehler für alle x im Bereich – er stößt nie über eps hinaus.')}
  `,
};

export default {
  id: 'vl2',
  number: 2,
  title: 'Fließkommadarstellung',
  summary: 'Wie Computer reelle Zahlen speichern: Stellenwertsystem, normierte Fließkommazahlen, IEEE 754, Rundung und Maschinengenauigkeit.',
  sections: [beispiel, stellenwert, fliesskomma, bereich, ieee, runden, fehler],
};
