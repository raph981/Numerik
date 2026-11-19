/**
 * Vorlesung 20: Trigonometrische Interpolation
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const summen = {
  id: 'trigonometrische-summen',
  title: '20.1 Trigonometrische Summen und Polynome',
  body: tx`
    ${lead(`Periodische Funktionen interpoliert man am besten mit periodischen Bausteinen: Sinus und Kosinus. Im Komplexen
      wird daraus ein gewöhnliches Polynom – und die Rechnung erstaunlich einfach.`)}
    <p>Sei $f(x + \omega) = f(x)$. Statt Polynomen (die an den Intervallenden passende Ableitungen bräuchten, Hermite-Interpolation) verwenden wir die
      <strong>trigonometrische Summe</strong></p>
    $$t_n(x) = \frac{a_0}{2} + \sum_{k=1}^m\bigl(a_k\cos(kx) + b_k\sin(kx)\bigr), \qquad n = 2m.$$
    <p>Sie ist $2\pi$-periodisch (eine $\omega$-periodische Funktion transformiert man mit $\hat f(\hat x) = f(\frac{\omega}{2\pi}\hat x)$) und hat $n + 1$ Parameter.
      Wir verwenden äquidistante Stützstellen $x_k = \frac{2\pi k}{n+1}$, $k = 0, \dots, n$ ($x_0 = 0$, $2\pi$ ist keine Stützstelle).</p>
    <p>Die Rechnung gelingt am einfachsten im Komplexen mit $t_n^*(x) = \sum_{k=0}^nc_ke^{ikx} = \sum_kc_k(e^{ix})^k$ und der <strong>Euler’schen Formel</strong> $e^{ikx} = \cos(kx) + i\sin(kx)$.</p>
    ${box('lemma', '20.1 (Einheitswurzeln)', tx`Für $w_k = e^{ix_k} = e^{i\frac{2\pi k}{n+1}}$ gilt
      <ol type="a">
        <li>$w_k^{n+1} = 1$ – die $w_k$ lösen $w^{n+1} = 1$,</li>
        <li>$w_k^j = w_j^k$, &nbsp; c) $w_k^{-j} = w_j^{-k}$, &nbsp; d) $w_k^j = w_k^{j\bmod(n+1)}$,</li>
        <li>$\sum_{j=0}^nw_k^j = n + 1$ für $k \equiv 0 \pmod{n+1}$, sonst $0$.</li>
      </ol>
      ${proof(tx`e) Für $k \not\equiv 0$ ist $w_k \neq 1$ eine Lösung von $0 = w^{n+1} - 1 = (w - 1)(w^n + \dots + w + 1)$, also muss der zweite Faktor verschwinden.`)}`)}
    ${widget('roots-of-unity')}
  `,
};

const dft = {
  id: 'dft',
  title: '20.2 Diskrete Fourier-Transformation (DFT)',
  body: tx`
    ${lead('Dank der Einheitswurzeln lässt sich das Interpolationssystem explizit lösen – ohne Gauß-Elimination.')}
    ${box('satz', '20.2 (Komplexe trigonometrische Interpolation)', tx`Zu $y_0, \dots, y_n \in \C$ gibt es genau ein $t_n^*(x) = \sum_{k=0}^nc_ke^{ikx}$ mit $t_n^*(x_j) = y_j$, und
      $$c_k = \frac{1}{n+1}\sum_{j=0}^ny_je^{-ijx_k}, \qquad k = 0, \dots, n. \tag{20.1}$$
      ${proof(tx`Mit $w = e^{ix}$ ist $t_n^*$ ein komplexes Polynom $p_n(w)$ vom Grad $n$, interpoliert an den paarweise verschiedenen Stellen $w_j$ – eindeutig.
        Multipliziert man die Bedingungen $\sum_lc_lw_j^l = y_j$ mit $w_k^{-j}$ und summiert über $j$, so liefert Lemma 20.1 e): $\sum_jw_k^{-j}y_j = \sum_lc_l\sum_jw_j^{l-k} = (n+1)c_k$.`)}`)}
    ${box('satz', '20.3 (Reelle DFT)', tx`Zu reellen $y_0, \dots, y_n$ gibt es genau eine trigonometrische Summe
      $$t_n(x) = \frac{a_0}{2} + \sum_{k=1}^m\bigl(a_k\cos kx + b_k\sin kx\bigr) + \frac\theta2a_{m+1}\cos((m+1)x)$$
      ($n$ gerade: $\theta = 0$, $m = \frac n2$; $n$ ungerade: $\theta = 1$, $m = \frac{n-1}2$) mit $t_n(x_j) = y_j$ und
      $$a_k = \frac{2}{n+1}\sum_{j=0}^ny_j\cos(jx_k), \qquad b_k = \frac{2}{n+1}\sum_{j=0}^ny_j\sin(jx_k).$$
      ${proof(tx`Setze $a_0 = 2c_0$, $a_k = c_k + c_{n+1-k}$, $b_k = i(c_k - c_{n+1-k})$ und rechne mit $\cos x = \frac{e^{ix} + e^{-ix}}2$, $\sin x = \frac{e^{ix} - e^{-ix}}{2i}$ und Lemma 20.1 nach.`)}`)}
    ${widget('trig-interpolation', {}, 'Beispiel 20.4: Das Dreieck (stetig, aber mit Knicken) wird gut angenähert; beim unstetigen Rechteck bleiben Überschwinger an den Sprüngen.')}
    ${box('beobachtung', 'Gibbs’sches Phänomen', tx`Sind die Sprungstellen des Rechtecks Stützstellen (mit dem Mittelwert als Funktionswert), bleibt die Interpolation ruhig. Liegen sie zwischen den Stützstellen,
      entstehen große Über- und Unterschwinger, die mit wachsendem $n$ <em>nicht</em> verschwinden: Der Fehler in der Maximumnorm direkt am Sprung geht nicht gegen null.`)}
    ${box('merke', 'Bemerkung 20.5 (Fourierreihe und Fourier-Transformation)', tx`Die trigonometrische Interpolation nähert die <strong>Fourierreihe</strong> $\sum_{k=-\infty}^\infty c_ke^{ikx}$ mit $c_k = \frac1{2\pi}\int_{-\pi}^\pi f(x)e^{-ikx}dx$ an:
      Berechnet man diese Integrale mit der summierten Trapezregel, erhält man genau (20.1). Zugleich ist sie eine Diskretisierung der Fourier-Transformation
      $(\mathcal Ff)(\omega) = \int e^{-i\omega x}f(x)\,dx$ vom Orts- (oder Zeit-) in den Frequenzraum – daher <strong>diskrete Fourier-Transformation</strong>, $k$ spielt die Rolle der Frequenz.`)}
  `,
};

const fft = {
  id: 'fft',
  title: '20.3 Schnelle Fourier-Transformation (FFT)',
  body: tx`
    ${lead('Einer der berühmtesten Algorithmen überhaupt (Cooley & Tukey, 1965): Teile und herrsche senkt den Aufwand von N² auf N log N.')}
    <p>Mit $N = n + 1$ lauten Hin- und Rücktransformation</p>
    $$c_k = \frac1N\sum_{j=0}^{N-1}y_je^{-i\frac{2\pi jk}{N}}, \qquad y_j = \sum_{k=0}^{N-1}c_ke^{i\frac{2\pi jk}{N}}. \tag{20.2}$$
    <p>Direkt ausgerechnet kostet das $O(N^2)$. Für gerades $N = 2n$ und $\tilde c_k = Nc_k$ spaltet man die Summe in gerade und ungerade Indizes auf:</p>
    $$\tilde c_k = \underbrace{\sum_{j=0}^{n-1}y_{2j}e^{-\frac{2\pi i}{n}jk}}_{\tilde c_k^g} + e^{-\frac{2\pi i}{2n}k}\underbrace{\sum_{j=0}^{n-1}y_{2j+1}e^{-\frac{2\pi i}{n}jk}}_{\tilde c_k^u}.$$
    <p>Beide Teilsummen sind DFTs der halben Länge, und wegen der $\frac N2$-Periodizität gilt $\tilde c^g_{k+N/2} = \tilde c^g_k$, $\tilde c^u_{k+N/2} = \tilde c^u_k$. Also</p>
    $$\tilde c_k = \tilde c_k^g + e^{-i\frac{2\pi k}{N}}\tilde c_k^u, \qquad \tilde c_{k+N/2} = \tilde c_k^g - e^{-i\frac{2\pi k}{N}}\tilde c_k^u, \qquad 0 \le k < \tfrac N2. \tag{20.3}$$
    ${list([
      tx`Ist $N = 2^d$, setzt man das rekursiv fort, bis Transformationen der Länge 1 übrig sind (die gleich den Eingangswerten sind).`,
      tx`<strong>Abstiegsphase:</strong> Die Eingabedaten werden umsortiert – Index $(b_{d-1}\dots b_0)_2 \mapsto (b_0\dots b_{d-1})_2$, das „Bit-Reversal“.`,
      tx`<strong>Aufstiegsphase:</strong> Rekombination nach (20.3), das Verknüpfungsmuster heißt „perfect shuffle“ bzw. Schmetterling.`,
    ])}
    ${widget('fft-butterfly', {}, 'Oben das Schmetterlingsdiagramm, unten eine echte Laufzeitmessung beider Verfahren in Ihrem Browser.')}
    ${box('satz', 'Aufwand der FFT', tx`Für $N = 2^d$: $A(N) = 2A(N/2) + cN = 4A(N/4) + 2cN = \dots = NA(1) + d\cdot cN = O(N\log_2N)$ statt $O(N^2)$.
      Für $N = 10^6$ ist das ein Faktor von etwa 50&nbsp;000.`)}
  `,
};

const spektral = {
  id: 'spektralanalyse',
  title: '20.4 Spektralanalyse',
  body: tx`
    ${lead('Die Koeffizienten aₖ, bₖ sind das Spektrum eines Signals: Wie viel von jeder Frequenz steckt darin?')}
    <p>Mit der DFT stellt man ein periodisches Signal als Überlagerung von Schwingungen verschiedener Frequenzen dar; man spricht vom <strong>Zeit-</strong> und <strong>Frequenzbereich</strong>.
      Anwendungen sind unzählig: JPEG arbeitet mit einer diskreten Kosinustransformation und Abschneiden im Frequenzbereich, MP3 ähnlich, und jeder Spektrumanalysator am Verstärker zeigt $\sqrt{a_k^2 + b_k^2}$.</p>
    ${box('beispiel', '20.7', list([
      'Eine Konstante hat als Spektrum einen einzigen Puls (nur k = 0).',
      'Umgekehrt hat ein Puls im Ortsbereich ein konstantes Spektrum („weißes Rauschen“).',
      'Dreieck: Koeffizienten fallen wie 1/k², Rechteck nur wie 1/k – Unstetigkeiten erzeugen viele hohe Frequenzen.',
    ]))}
    ${widget('spectral-analysis', {}, 'Rauschen verteilt sich auf alle Frequenzen, das Nutzsignal steckt in wenigen. Ein Tiefpass behält nur die niedrigen Frequenzen – Entrauschen und Kompression in einem.')}
  `,
};

export default {
  id: 'vl20',
  number: 20,
  title: 'Trigonometrische Interpolation',
  summary: 'Trigonometrische Summen, Einheitswurzeln, diskrete Fourier-Transformation, Gibbs-Phänomen, die schnelle Fourier-Transformation und Spektralanalyse.',
  sections: [summen, dft, fft, spektral],
};
