/**
 * Vorlesung 9: Rundungsfehleranalyse der LU-Zerlegung
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const idee = {
  id: 'rueckwaertsanalyse',
  title: 'Vorwärts- und Rückwärtsanalyse',
  body: tx`
    ${lead(`Statt zu fragen „Wie falsch ist das Ergebnis?“ fragt die Rückwärtsanalyse: „Für welche leicht veränderten Daten ist das
      berechnete Ergebnis exakt richtig?“`)}
    <p>In Kapitel 3 haben wir eine <strong>Vorwärtsanalyse</strong> gemacht: $F'(x) = F(x) + E(x, \epsilon_1, \dots, \epsilon_k)$, in führender Ordnung linear in den
      Rundungsfehlern $\epsilon_i$. Die <strong>Rückwärtsanalyse</strong> sucht dagegen eine Darstellung</p>
    $$F'(x) = F\bigl(x + H(x, \epsilon_1, \dots, \epsilon_k)\bigr):$$
    <p>Das Rechnerergebnis ist das <em>exakte</em> Ergebnis zu gestörten Eingaben. Für lineare Gleichungssysteme bedeutet das:</p>
    $$\text{Vorwärts: } \hat x - x = E(A, b, \epsilon), \qquad \text{Rückwärts: } (A + H)\hat x = b.$$
    ${box('intuition', 'Warum ist das so praktisch?', tx`Sobald man $\|H\|$ abgeschätzt hat, liefert der <strong>Störungssatz 6.5</strong> sofort den Fehler:
      $$\frac{\|\hat x - x\|}{\|x\|} \le \frac{\operatorname{cond}(A)}{1 - \operatorname{cond}(A)\frac{\|H\|}{\|A\|}}\frac{\|H\|}{\|A\|}.$$
      Rundungsfehler werden so wie Datenfehler behandelt – Konditions- und Rundungsfehleranalyse greifen nahtlos ineinander. (Diese Vorlesung folgt Golub &amp; Van Loan, Kap. 3.)`)}
  `,
};

const notation = {
  id: 'notation-betraege',
  title: '9.1 Notation',
  body: tx`
    <p>Für Vektoren und Matrizen verwenden wir den <strong>komponentenweisen Betrag</strong> $|x| = (|x_1|, \dots, |x_n|)^T$, $|A| = (|a_{ij}|)$ – das ist keine Norm!
      Ebenso wirken $\rd$ und Relationen komponentenweise: $A \le B \Leftrightarrow a_{ij} \le b_{ij}$ für alle $i, j$. Damit schreibt sich kurz</p>
    $$\rd(A) = A + A', \qquad |A'| \le \eps\,|A|.$$
    <p>Die <strong>fl-Notation</strong> überführt einen Ausdruck in Fließkommaoperationen: $F'(x) = \operatorname{fl}(F)(x)$, z.&nbsp;B.
      $\operatorname{fl}(x\cdot y) = x_1\odot y_1 \oplus \dots \oplus x_n \odot y_n$.</p>
  `,
};

const dreieck = {
  id: 'dreieckssysteme-rundung',
  title: '9.2 Dreieckssysteme',
  body: tx`
    ${box('lemma', '9.1 (Skalarprodukt)', tx`Für $x, y \in \F^n$ gilt
      $$\operatorname{fl}(x\cdot y) = (x + f)\cdot y, \qquad |f| \le n\,\eps\,|x| + O(\eps^2).$$
      Das berechnete Skalarprodukt ist das exakte Skalarprodukt eines leicht gestörten Vektors.
      ${proof(tx`Induktion. $n = 1$: $\operatorname{fl}(x_1y_1) = x_1y_1(1 + \epsilon_1) = (x_1 + x_1\epsilon_1)y_1$.
        $n - 1 \to n$: $\operatorname{fl}(x\cdot y) = (\operatorname{fl}(\tilde x\cdot\tilde y) + x_ny_n(1 + \delta_n))(1 + \epsilon_n)$; einsetzen der Induktionsannahme und
        Sammeln der Terme liefert $f = (\tilde f + \epsilon_n\tilde x + \epsilon_n\tilde f,\; (\epsilon_n + \delta_n)x_n + \epsilon_n\delta_nx_n)$ mit der behaupteten Schranke.`)}`)}
    <p>Die Schranke nimmt an, dass sich <em>alle</em> Rundungsfehler in dieselbe Richtung addieren – das ist sehr pessimistisch:</p>
    ${widget('dot-product-error')}
    ${box('satz', '9.2 (Dreieckssysteme)', tx`Die in Fließkommaarithmetik berechneten Lösungen $\hat x$ von $Lx = b$ und $\hat y$ von $Uy = c$ erfüllen
      $$(L + F)\hat x = b,\; |F| \le n\,\eps\,|L| + O(\eps^2), \qquad (U + G)\hat y = c,\; |G| \le n\,\eps\,|U| + O(\eps^2).$$
      ${proof(tx`Induktion über $n$ mit der Blockzerlegung $\begin{bmatrix}L_1 & 0\\ v^T & \alpha\end{bmatrix}$. Für die letzte Komponente
        $\hat w = \operatorname{fl}((\beta - v^T\hat x_1)/\alpha)$ benutzt man Lemma 9.1 für $v^T\hat x_1$ und schreibt den Faktor $\frac{1}{1 + \delta + \epsilon}$ per Taylor als
        $1 - (\delta + \epsilon) + O(\eps^2)$. Die Störung der letzten Zeile ist dann durch $n\,\eps\,|(v^T, \alpha)|$ beschränkt.`)}`)}
    <p>Vorwärts- und Rückwärtseinsetzen sind also <strong>rückwärts stabil</strong>: Jede Zeile wird relativ nur um etwa $n\,\eps$ gestört.</p>
  `,
};

const luRundung = {
  id: 'lu-rundung',
  title: '9.3 LU-Zerlegung und Lösen eines LGS',
  body: tx`
    ${box('satz', '9.3', tx`Ist die exakte Zerlegung $A = LU$ ohne Zeilentausch möglich, so gilt für die numerisch berechneten Faktoren
      $$A + H = \hat L\hat U, \qquad |H| \le 3(n - 1)\,\eps\,\bigl(|A| + |\hat L||\hat U|\bigr) + O(\eps^2).$$
      ${proof(tx`Induktion mit $A = \begin{bmatrix}\alpha & w^T\\ v & B\end{bmatrix}$. Ein Schritt berechnet $\hat z = \operatorname{fl}(v/\alpha)$ (Fehler $\le \eps|v|/|\alpha|$) und das
        Rang-1-Update $\hat A_1 = \operatorname{fl}(B - \hat zw^T) = B - \hat zw^T + F$ mit $|F| \le 2\eps(|B| + |\hat z||w^T|)$. Die Restmatrix wird nach Induktionsannahme zerlegt.
        Zusammensetzen der Blöcke $\hat L\hat U = \begin{bmatrix}1 & 0\\ \hat z & \hat L_1\end{bmatrix}\begin{bmatrix}\alpha & w^T\\ 0 & \hat U_1\end{bmatrix} = A + H$ und Abschätzen liefert die Behauptung
        (wegen $3(n-2) + 2 \le 3(n-1)$).`)}`)}
    ${box('satz', '9.4 (Lösen eines LGS)', tx`Für die mit $\hat L$, $\hat U$ und Vorwärts-/Rückwärtseinsetzen berechnete Lösung $\hat x$ gilt
      $$(A + E)\hat x = b, \qquad |E| \le n\,\eps\,\bigl(3|A| + 5|\hat L||\hat U|\bigr) + O(\eps^2).$$
      ${proof(tx`Mit Satz 9.2 ist $(\hat L + F)(\hat U + G)\hat x = b$, also $E = H + F\hat U + \hat LG + FG$. Satz 9.3 und die Schranken für $F$, $G$ liefern
        $|E| \le 3(n-1)\eps(|A| + |\hat L||\hat U|) + 2n\eps|\hat L||\hat U| + O(\eps^2)$.`)}`)}
    ${box('merke', 'Die entscheidende Größe', tx`Der Rückwärtsfehler ist klein, <strong>wenn $|\hat L||\hat U|$ nicht viel größer als $|A|$ ist</strong>. Große Multiplikatoren
      in $L$ oder große Einträge in $U$ sind gefährlich. Genau das steuert die Pivotisierung.`)}
  `,
};

const pivot = {
  id: 'pivotisierung-stabilitaet',
  title: '9.4 Pivotisierung',
  body: tx`
    ${lead('Ist die Gauß-Elimination numerisch stabil? Ohne Pivotisierung sicher nicht – mit Pivotisierung „praktisch ja“.')}
    <p>Wir vergleichen in $\|\cdot\|_\infty$ (hier gilt $\|A\| = \||A|\|$) den Konditionsfehler – Rundung der Eingaben, $|\Delta A| \le \eps|A|$, $|\Delta b| \le \eps|b|$ –</p>
    $$\frac{\|\check x - x\|_\infty}{\|x\|_\infty} \lesssim \operatorname{cond}_\infty(A)\cdot 2\,\eps \tag{9.1}$$
    <p>mit dem Rundungsfehler des Verfahrens aus Rückwärtsanalyse und Störungssatz:</p>
    $$\frac{\|\hat x - x\|_\infty}{\|x\|_\infty} \lesssim \operatorname{cond}_\infty(A)\; n\,\eps\left(3 + 5\frac{\|\hat L\|_\infty\|\hat U\|_\infty}{\|A\|_\infty}\right).$$
    ${box('definition', '9.5 (Pivotstrategien)', tx`<strong>Spaltenpivotisierung:</strong> Pivot ist das betragsgrößte Element der Spalte, $|\tilde a_{kk}^{(k)}| \ge |\tilde a_{ik}^{(k)}|$ für $i \ge k$ (nur Zeilentausch).
      <br><strong>Totalpivotisierung:</strong> Pivot ist das betragsgrößte Element der Restmatrix, $|\tilde a_{kk}^{(k)}| \ge |\tilde a_{ij}^{(k)}|$ für $i, j \ge k$ (Zeilen- und Spaltentausch).`)}
    <p>Beide Strategien garantieren $|l_{ik}| \le 1$ und damit $\|\hat L\|_\infty \le n$. Es bleibt</p>
    $$\frac{\|\hat x - x\|_\infty}{\|x\|_\infty} \lesssim \operatorname{cond}_\infty(A)\cdot 5n^2\,\eps\,\frac{\|\hat U\|_\infty}{\|A\|_\infty}. \tag{9.2}$$
    <p>Die Frage ist also, wie stark die Einträge von $U$ wachsen können (<strong>Wachstumsfaktor</strong> $\|\hat U\|_\infty/\|A\|_\infty$).</p>
    ${list([
      tx`Bei Spaltenpivotisierung gibt es Beispiele mit Wachstum $O(2^n)$.`,
      tx`Bei Totalpivotisierung gilt die viel kleinere Schranke $|a_{ij}^{(k)}| \le \sqrt k\,(2\cdot 3^{1/2}\cdots k^{1/(k-1)})^{1/2}\max|a_{ij}|$.`,
    ])}
    ${widget('growth-factor', {}, 'Worst Case und Normalfall: Bei der Wilkinson-Matrix verdoppelt sich die letzte Spalte in jedem Schritt; bei zufälligen Matrizen passiert praktisch nichts.')}
    ${box('merke', 'Fazit', `Streng genommen ist die Gauß-Elimination mit Spaltenpivotisierung nicht stabil – in der Praxis ist starkes Wachstum aber extrem selten.
      Golub und Van Loan: „The method can be used with confidence.“ Deshalb ist sie das Standardverfahren.`)}
    ${box('definition', '9.6 (Praktische LU-Zerlegung)', list([
      tx`Zeilenäquilibrierung: $A := DA$ mit $d_{ii} = (\sum_j|a_{ij}|)^{-1}$ (alle Zeilen haben Betragssumme 1).`,
      tx`Für $k = 1, \dots, n-1$: Suche $s_k$ mit $|a_{s_k,k}|$ maximal, tausche die Zeilen $k$ und $s_k$.`,
      tx`Überschreibe $a_{ik} := a_{ik}/a_{kk}$ (Multiplikatoren) und $a_{ij} := a_{ij} - a_{ik}a_{kj}$ für $i, j > k$.`,
      tx`Ausgabe: $L$ und $U$ in $A$, dazu $D$ und die Tauschindizes $s_k$.`,
    ], true))}

    <h3>Beispiel: Wenn ein einziger Rundungsfehler alles zerstört</h3>
    ${box('beispiel', '9.8 (Golub &amp; Ortega)', tx`<p>a) $\begin{bmatrix}-10^{-5} & 1\\ 2 & 1\end{bmatrix}x = \begin{bmatrix}1\\0\end{bmatrix}$ hat die Lösung $x_1 = -0{,}4999975$, $x_2 = 0{,}999995$.
      In $\F(10, 4, 1)$ ohne Pivotisierung: $l_{21} = -0{,}2\cdot 10^6$ (exakt), aber $a_{22}^{(1)} = 1 \oplus 0{,}2\cdot10^6 = 0{,}2\cdot 10^6$ – die 1 geht verloren. Ergebnis
      $x_2 = 1$, $x_1 = 0$: <strong>keine Stelle richtig</strong>, obwohl nur ein einziger Rundungsfehler passiert ist. Rückwärts betrachtet wurde exakt das System mit
      $a_{22} = 0$ gelöst. Mit Zeilentausch ist $l_{21} = -0{,}5\cdot 10^{-5}$ klein und man erhält $x = (-0{,}5;\, 1)$ – in $\F(10, 4, 1)$ völlig in Ordnung.</p>
      <p>b) Multipliziert man die erste Zeile mit $-10^6$, verlangt die Spaltenpivotisierung keinen Tausch mehr – und dasselbe Problem tritt wieder auf.
      Pivotisierung kann also helfen, muss aber nicht (Abhilfe: Zeilenäquilibrierung oder Totalpivotisierung).</p>`)}
    ${widget('pivoting-example', {}, 'Rechnen in F(10, r). Probieren Sie beide Systeme mit allen drei Strategien und erhöhen Sie r.')}
    ${box('beobachtung', '9.7', tx`Für die Integralgleichungs-Matrizen aus 8.6 sind Rundungsfehler $\|x - \hat x\|/\|x\|$ und Konditionsfehler $\|x - \check x\|/\|x\|$ nahezu gleich groß,
      der Wachstumsfaktor bleibt $\approx 1$, und es gibt keinerlei Abhängigkeit von $n$. Die $n^2$-Abhängigkeit in (9.2) ist sehr pessimistisch.`)}
  `,
};

export default {
  id: 'vl9',
  number: 9,
  title: 'Rundungsfehleranalyse der LU-Zerlegung',
  summary: 'Rückwärtsanalyse: Das Rechnerergebnis als exakte Lösung gestörter Daten. Skalarprodukt, Dreieckssysteme, LU-Zerlegung und die Rolle der Pivotisierung.',
  sections: [idee, notation, dreieck, luRundung, pivot],
};
