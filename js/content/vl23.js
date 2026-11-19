/**
 * Vorlesung 23: Approximation in Skalarprodukträumen
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const gauss = {
  id: 'gauss-approximation',
  title: '23.1 Gauß-Approximation',
  body: tx`
    ${lead(`Wir suchen in einem Raum „einfacher“ Funktionen S diejenige, die einer gegebenen Funktion f am nächsten ist. Misst man den Abstand
      mit einer Norm, die aus einem Skalarprodukt kommt, wird die Aufgabe zu einem Stück Geometrie: Die beste Näherung ist die senkrechte
      Projektion von f auf S – genau wie im ℝ².`)}
    ${box('definition', '23.1 (Prähilbertraum)', tx`Ein Vektorraum von Funktionen über $\R$ oder $\C$ mit einem Skalarprodukt $\langle\cdot,\cdot\rangle$ heißt
      <strong>Skalarproduktraum</strong> oder <strong>Prähilbertraum</strong>.`)}
    <p>Jeder Prähilbertraum ist normiert durch $\|f\| = \sqrt{\langle f, f\rangle}$. Ist er zusätzlich vollständig, heißt er <strong>Hilbertraum</strong>.</p>
    ${box('beispiel', '23.2', tx`Für reelle Funktionen auf $[a, b]$ sei $\displaystyle\langle f, g\rangle = \int_a^bf(x)g(x)\,dx$.
      ${list([
        tx`$C([a, b])$, die stetigen Funktionen, ist damit ein Prähilbertraum – aber nicht vollständig.`,
        tx`$L^2((a, b))$, die quadratintegrierbaren Funktionen ($\|f\|^2 = \int_a^b|f|^2dx < \infty$, Lebesgue-Integral), ist vollständig, also ein Hilbertraum – das Analogon des $\R^n$ für Funktionen.`,
        tx`Für endlich viele Funktionen $\Psi = \{\psi_1, \dots, \psi_N\}$ ist $S = \operatorname{span}\Psi = \bigl\{\sum_{i=1}^Nc_i\psi_i\bigr\}$ ein endlichdimensionaler Raum. Er ist isomorph zum $\R^N$ und damit ebenfalls ein Hilbertraum.`,
      ], true)}`)}

    <h3>Die Approximationsaufgabe</h3>
    <p>Sei $H$ ein Prähilbertraum und $S \subset H$ ein endlichdimensionaler Teilraum. Zu $f \in H$ suchen wir $g \in S$ mit</p>
    $$\|f - g\| \to \min. \tag{23.1}$$
    ${box('satz', '23.3 (Allgemeine Gauß-Approximation)', tx`Es gibt genau ein $g \in S$, das $\|f - g\|$ minimiert. Es ist charakterisiert durch
      $$\langle g, \varphi\rangle = \langle f, \varphi\rangle \quad\forall\varphi \in S \qquad\Longleftrightarrow\qquad \langle f - g, \varphi\rangle = 0 \quad\forall\varphi \in S. \tag{23.2}$$
      In einer Basis $\psi_1, \dots, \psi_N$ von $S$ ist $g = \sum_jc_j\psi_j$ die Lösung des linearen Gleichungssystems
      $$Ac = b, \qquad A_{ij} = \langle\psi_j, \psi_i\rangle \;(\text{Gramsche Matrix, Massenmatrix}), \qquad b_i = \langle f, \psi_i\rangle.$$
      ${proof(tx`
        <p><strong>1. Minimum ⇒ Orthogonalität.</strong> Für eine Testfunktion $\varphi \in S$ betrachte $F_\varphi(t) = \|f - (g + t\varphi)\|^2$. Da $g$ minimal ist, hat $F_\varphi$ bei $t = 0$ ein Minimum:
          $$0 = \frac{d}{dt}\Bigl[\langle f - g, f - g\rangle - 2t\langle f - g, \varphi\rangle + t^2\langle\varphi, \varphi\rangle\Bigr]_{t=0} = -2\langle f - g, \varphi\rangle.$$</p>
        <p><strong>2. Orthogonalität ⇒ Minimum.</strong> Für beliebiges $g' \in S$ setze $\varphi = g - g' \in S$. Dann
          $$\|f - g'\|^2 = \|f - g + \varphi\|^2 = \|f - g\|^2 + 2\underbrace{\langle f - g, \varphi\rangle}_{=0} + \|\varphi\|^2 \ge \|f - g\|^2.$$</p>
        <p><strong>3. Eindeutigkeit.</strong> Wären $g_1 \ne g_2$ beide minimal, so folgt aus 2. mit $\varphi = g_2 - g_1$: $\|f - g_1\|^2 = \|f - g_2\|^2 + \|g_2 - g_1\|^2 > \|f - g_2\|^2$ – Widerspruch.</p>
        <p><strong>4. Existenz (konstruktiv).</strong> Einsetzen von $g = \sum_jc_j\psi_j$ und $\varphi = \psi_i$ in (23.2) liefert $\sum_jc_j\langle\psi_j, \psi_i\rangle = \langle f, \psi_i\rangle$, also $Ac = b$.
          $A$ ist symmetrisch, und für $x \ne 0$ ist mit $u = \sum_jx_j\psi_j \ne 0$
          $$x^TAx = \sum_{i,j}x_i\langle\psi_j, \psi_i\rangle x_j = \Bigl\langle\sum_jx_j\psi_j, \sum_ix_i\psi_i\Bigr\rangle = \langle u, u\rangle > 0.$$
          Also ist $A$ positiv definit und das System eindeutig lösbar.</p>`)}`)}
    ${box('intuition', '', tx`Der Fehler $f - g$ steht <strong>senkrecht</strong> auf dem ganzen Raum $S$. Im $\R^2$ mit einer Geraden $S$ ist $g$ der Fußpunkt des Lots – jeder andere Punkt auf $S$ ist nach Pythagoras weiter weg. Satz 23.3 sagt: Genau dieses Bild gilt in jedem Skalarproduktraum, auch wenn die „Vektoren“ Funktionen sind.`)}
    ${widget('projection', {}, 'Die Bestapproximation als Lot: Ziehen Sie f, drehen Sie S und verschieben Sie einen Konkurrenten g′.')}
    ${box('satz', '23.4 (Orthogonale Projektion)', tx`Die durch (23.2) definierte Abbildung $\Pi: H \to S$, $\langle\Pi f, \varphi\rangle = \langle f, \varphi\rangle$ für alle $\varphi \in S$, ist eine orthogonale Projektion:
      ${list([
        tx`$\Pi^2 = \Pi$,`,
        tx`$\langle\Pi f, (I - \Pi)f\rangle = 0$ für jedes $f \in H$,`,
        tx`$\|f\|^2 = \|\Pi f\|^2 + \|(I - \Pi)f\|^2$ (Pythagoras), also $\|\Pi f\| \le \|f\|$ und $\|(I - \Pi)f\| \le \|f\|$ – die Projektion ist <strong>stabil</strong>.`,
      ], true)}
      ${proof(tx`<p>i) $\Pi f \in S$ approximiert sich selbst mit Fehler $0$; wegen der Eindeutigkeit ist $\Pi(\Pi f) = \Pi f$.</p>
        <p>ii) Wegen $\Pi f \in S$ gilt $\langle\Pi f, \Pi f\rangle = \langle f, \Pi f\rangle$, also $\langle\Pi f, (I - \Pi)f\rangle = \langle\Pi f, f\rangle - \langle\Pi f, \Pi f\rangle = 0$.</p>
        <p>iii) $\|f\|^2 = \|\Pi f + (I - \Pi)f\|^2 = \|\Pi f\|^2 + 2\langle\Pi f, (I - \Pi)f\rangle + \|(I - \Pi)f\|^2$, der mittlere Term ist nach ii) null.</p>`)}`)}
  `,
};

const orthonormal = {
  id: 'orthonormalbasen',
  title: '23.2 Gauß-Approximation mit Orthonormalbasen',
  body: tx`
    ${lead('Mit der richtigen Basis entfällt das Gleichungssystem ganz: Jeder Koeffizient ist einfach ein Skalarprodukt.')}
    <p>Ist $\Psi$ eine Orthonormalbasis, $\langle\psi_i, \psi_j\rangle = \delta_{ij}$, so ist die Gramsche Matrix $A = I$ und es folgt $c_i = \langle f, \psi_i\rangle$, also</p>
    $$g = \sum_{j=1}^N\langle f, \psi_j\rangle\,\psi_j. \tag{23.3}$$
    ${box('merke', 'Vorteile einer Orthonormalbasis', list([
      'Kein Gleichungssystem: Jeder Koeffizient wird einzeln berechnet.',
      tx`Perfekte Kondition: $\operatorname{cond}(A) = 1$. Bei Monomen $1, x, x^2, \dots$ ist die Gramsche Matrix dagegen eng mit der berüchtigten Hilbert-Matrix verwandt (Vorlesung 6) – ihre Kondition explodiert mit $N$.`,
      tx`Vergrößert man $S$ um eine Basisfunktion, bleiben alle bisherigen Koeffizienten <strong>unverändert</strong>.`,
    ]))}
    ${box('satz', '23.5 (Parseval-Identität)', tx`Ist $\{\psi_1, \dots, \psi_N\}$ Orthonormalbasis von $S$, so gilt für jedes $v \in S$
      $$\|v\|^2 = \sum_{i=1}^N\langle v, \psi_i\rangle^2.$$
      ${proof(tx`Mit $v = \sum_i\langle v, \psi_i\rangle\psi_i$ ist $\|v\|^2 = \sum_i\sum_j\langle v, \psi_i\rangle\langle v, \psi_j\rangle\underbrace{\langle\psi_i, \psi_j\rangle}_{\delta_{ij}} = \sum_i\langle v, \psi_i\rangle^2.$`)}`)}
    ${box('beispiel', '23.6 (Fourier-Reihe)', tx`Für $N = 2m + 1$ ist
      $$\Psi_F = \Bigl\{\tfrac1{\sqrt{2\pi}}, \tfrac1{\sqrt\pi}\cos x, \dots, \tfrac1{\sqrt\pi}\cos(mx), \tfrac1{\sqrt\pi}\sin x, \dots, \tfrac1{\sqrt\pi}\sin(mx)\Bigr\}$$
      eine Orthonormalbasis auf $[-\pi, \pi]$ (Nachrechnen mit den Additionstheoremen, z.&nbsp;B. $\cos x\cos y = \frac12[\cos(x + y) + \cos(x - y)]$). Formel (23.3) liefert die endliche Fourier-Reihe
      $$g(x) = \frac{a_0}2 + \sum_{k=1}^m\bigl(a_k\cos(kx) + b_k\sin(kx)\bigr), \quad a_k = \frac1\pi\int_{-\pi}^\pi f(x)\cos(kx)\,dx, \quad b_k = \frac1\pi\int_{-\pi}^\pi f(x)\sin(kx)\,dx.$$
      Für $m \to \infty$ konvergiert sie in $L^2([-\pi, \pi])$. Anders als bei der trigonometrischen <em>Interpolation</em> (Vorlesung 20) werden hier Integrale statt Punktwerte verwendet.`)}
    ${box('beispiel', '23.7 (Legendre-Polynome)', tx`Die Polynome
      $$P_n(x) = \frac1{2^n\,n!}\frac{d^n}{dx^n}(x^2 - 1)^n, \qquad n \in \N_0,$$
      haben Grad $n$ und sind orthogonal: $\displaystyle\int_{-1}^1P_m(x)P_n(x)\,dx = \begin{cases}0 & m \ne n\\ \frac2{2n+1} & m = n.\end{cases}$
      Normiert, $P_n' = \sqrt{\frac{2n+1}2}P_n$, bilden sie eine Orthonormalbasis der Polynome auf $[-1, 1]$.
      Die ersten lauten $P_0 = 1$, $P_1 = x$, $P_2 = \frac12(3x^2 - 1)$, $P_3 = \frac12(5x^3 - 3x)$. Sie kehren in Vorlesung 26 als Schlüssel zur Gauß-Quadratur zurück.`)}
    ${widget('gauss-approximation', {}, tx`Bestapproximation auf $[-1, 1]$ in drei Basen. Die Fourier-Basis ist hier auf $[-1, 1]$ skaliert: $\frac1{\sqrt2}, \cos(\pi x), \sin(\pi x), \dots$`)}
    ${exercise(tx`Warum sind bei der Legendre-Approximation von $f(x) = |x|$ alle Koeffizienten mit ungeradem Index null – und warum bei der Fourier-Approximation alle Sinus-Koeffizienten?`,
      tx`$|x|$ ist eine gerade Funktion. $P_n$ mit ungeradem $n$ und $\sin(k\pi x)$ sind ungerade, das Produkt mit $|x|$ ist also ungerade und sein Integral über das symmetrische Intervall $[-1, 1]$ verschwindet: $c_i = \langle f, \psi_i\rangle = 0$. Prüfen Sie es im Widget am Koeffizientenplot.`)}
  `,
};

const fehler = {
  id: 'fehlerkontrolle-approximation',
  title: '23.3 Fehlerkontrolle',
  body: tx`
    ${lead('Bisher war S fest. Praktischer ist die umgekehrte Frage: Wie klein darf S sein, damit der Fehler eine vorgegebene Toleranz einhält?')}
    <p>Gesucht ist $S \subset H$ mit möglichst kleinem $\dim S$, sodass $\|f - g\| \le \mathrm{TOL}\cdot\|f\|$. Sei dazu $S_1, S_2, \dots$ eine Folge von Räumen mit $\dim S_N = N$ (oft $S_N \subset S_{N+1}$),
      $g_N$ die Bestapproximation in $S_N$ und $\Psi_N$ eine Orthonormalbasis von $S_N$. Einsetzen von (23.3) ergibt</p>
    $$\begin{aligned}\|f - g_N\|^2 &= \langle f, f\rangle - 2\langle f, g_N\rangle + \langle g_N, g_N\rangle\\
      &= \langle f, f\rangle - 2\sum_{i=1}^N\langle f, \psi_i\rangle^2 + \sum_{i=1}^N\sum_{j=1}^N\langle f, \psi_i\rangle\langle f, \psi_j\rangle\underbrace{\langle\psi_i, \psi_j\rangle}_{\delta_{ij}} = \langle f, f\rangle - \sum_{i=1}^N\langle f, \psi_i\rangle^2.\end{aligned}$$
    <p>Der Fehler lässt sich also <strong>ohne $g_N$ auszuwerten</strong> berechnen. Die Toleranz ist erreicht, sobald</p>
    $$\|f - g_N\|^2 \le \mathrm{TOL}^2\langle f, f\rangle \qquad\Longleftrightarrow\qquad \sum_{i=1}^N\langle f, \psi_i\rangle^2 \ge (1 - \mathrm{TOL}^2)\,\langle f, f\rangle. \tag{23.4}$$
    ${box('intuition', '', tx`Die „Energie“ $\|f\|^2$ verteilt sich auf die Basisfunktionen. Man sammelt Koeffizienten, bis nur noch der Anteil $\mathrm{TOL}^2$ der Energie fehlt. Im Widget oben zeigt die rote Linie TOL, die Kennzahl daneben das kleinste ausreichende $N$.`)}
    ${box('merke', 'Bemerkung 23.8', list([
      tx`Vorausgesetzt ist, dass $\langle f, f\rangle$ (genau genug) berechenbar ist.`,
      tx`Bei einer <strong>hierarchischen Basis</strong> $\Psi_N \subset \Psi_{N+1}$ fügt man einfach Basisfunktionen hinzu, bis (23.4) gilt. Die Fourier-Basis ist hierarchisch.`,
      tx`Dann gilt $\|f - g_{N+1}\|^2 = \|f - g_N\|^2 - \langle f, \psi_{N+1}\rangle^2 \le \|f - g_N\|^2$: Durch Hinzufügen von Basisfunktionen kann der Fehler <strong>nicht zunehmen</strong>.`,
    ], true))}
    <p>Offen bleibt, <em>welche</em> Basisfunktionen man hinzunimmt. Fourier- und Legendre-Funktionen leben auf dem ganzen Intervall. Variiert $f$ nur lokal stark, verschwendet man damit viele Freiheitsgrade –
      die Motivation für die Wavelets der nächsten Vorlesung.</p>
  `,
};

export default {
  id: 'vl23',
  number: 23,
  title: 'Approximation in Skalarprodukträumen',
  summary: 'Bestapproximation als orthogonale Projektion: Normalengleichung mit Gramscher Matrix, Orthonormalbasen (Fourier, Legendre), Parseval und Fehlerkontrolle.',
  sections: [gauss, orthonormal, fehler],
};
