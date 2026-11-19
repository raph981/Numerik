/**
 * Vorlesung 14: Iterative Lösung linearer Gleichungssysteme II
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const spd = {
  id: 'spd-iterativ',
  title: '14.1 Symmetrisch positiv definite Matrizen',
  body: tx`
    ${lead('Für SPD-Matrizen lässt sich die Konvergenzrate direkt aus der Kondition ablesen – und man versteht, was ein guter Vorkonditionierer leisten muss.')}
    ${box('satz', '14.1', tx`Seien $A, B$ symmetrisch positiv definit. Dann konvergiert
      $$x^{k+1} = x^k + \frac{1}{\lambda_\text{max}(BA)}B(b - Ax^k) \quad\text{mit der Rate}\quad \varrho = 1 - \frac{\lambda_\text{min}(BA)}{\lambda_\text{max}(BA)} = 1 - \frac{1}{\kappa_2(BA)}.$$
      ${proof(tx`Mit $A^{1/2} = QD^{1/2}Q^T$ ist $BA$ ähnlich zur SPD-Matrix $T = A^{1/2}BA^{1/2}$ mit Eigenwerten $0 < \mu_1 \le \dots \le \mu_n$. Die Eigenwerte von
        $S = I - \omega BA$ sind $1 - \omega\mu_i \in [1 - \omega\mu_n, 1 - \omega\mu_1]$, alle $< 1$. Mit $\omega = 1/\mu_n$ liegen sie in $[0, 1 - \mu_1/\mu_n]$.
        (Mit $\omega = 2/(\mu_1 + \mu_n)$ erhält man sogar $\varrho = 1 - \frac{2\mu_1}{\mu_1 + \mu_n}$.)`)}`)}
    ${box('merke', 'Vorkonditionierer', tx`Je größer $\kappa_2(BA)$, desto langsamer. Aufgabe von $B$: $\kappa_2(BA)$ möglichst klein machen – daher der Name. $B = A^{-1}$ wäre ideal ($\kappa = 1$), aber zu teuer.
      Ein guter Vorkonditionierer ist ein Kompromiss aus Wirkung und Kosten.`)}
    <p>Man braucht noch eine Abschätzung des größten Eigenwerts – ohne ihn auszurechnen:</p>
    ${box('satz', '14.2 (Gerschgorin-Kreise)', tx`Für $A \in \R^{n\times n}$ liegt jeder Eigenwert in der Vereinigung der Kreisscheiben
      $$\lambda \in \bigcup_{k=1}^n\bar B(a_{kk}, r_k), \qquad r_k = \sum_{j\neq k}|a_{kj}|.$$
      ${proof(tx`Sei $Ae = \lambda e$ mit $\|e\|_\infty = 1$ und $|e_k| = 1$. Zeile $k$: $(\lambda - a_{kk})e_k = \sum_{j\neq k}a_{kj}e_j$, also $|\lambda - a_{kk}| \le \sum_{j\neq k}|a_{kj}| = r_k$.`)}`)}
    ${widget('gerschgorin')}
    <p>Daraus folgt $\varrho(A) \le \max_k(|a_{kk}| + r_k)$ – für dünn besetzte Matrizen recht gut. Man darf $\lambda_\text{max}$ auch überschätzen:
      Die Iteration konvergiert für alle $\omega \le 1/\lambda_\text{max}(BA)$, nur langsamer. Damit sind <strong>Richardson</strong> und <strong>Jacobi</strong> ($B = D^{-1}$ ist SPD) im SPD-Fall praktikabel.
      Für Gauß-Seidel ist $B$ unsymmetrisch – man braucht einen anderen Weg.</p>

    <h3>Konvergenz in der Energienorm</h3>
    <p>Statt $\varrho(S)$ kann man eine Norm abschätzen: $\|e^k\| \le \|S\|^k\|e^0\|$. Wegen $\varrho(S) \le \|S\|$ ist $\|S\| < 1$ hinreichend (nicht notwendig) – und es kommt auf die Norm an.
      Für SPD-Matrizen bietet sich die <strong>Energienorm</strong> an:</p>
    $$(x, y)_A = (x, Ay)_2, \qquad \|x\|_A = \sqrt{(x, Ax)_2}, \qquad \|S\|_A = \sup_{x\neq 0}\frac{\|Sx\|_A}{\|x\|_A}. \tag{14.1–14.3}$$
    ${box('satz', '14.3', tx`Ist $A$ symmetrisch positiv definit, so konvergiert das Gauß-Seidel-Verfahren.
      ${proof(tx`Mit $W = L + D$ und $U = L^T$ gilt $(x, (W + W^T)x)_2 = (x, Ax)_2 + (x, Dx)_2 > (x, Ax)_2 > 0$. Man zeigt $\|S\|_A = \|\hat S\|_2$ für
        $\hat S = I - A^{1/2}W^{-1}A^{1/2}$ und rechnet
        $\|\hat Sx\|_2^2 = \|x\|_2^2 - (y, (W + W^T)y)_2 + (y, Ay)_2 < \|x\|_2^2$ mit $y = W^{-1}A^{1/2}x$. Also $\|S\|_A < 1$.`)}`)}
  `,
};

const diagdom = {
  id: 'diagonaldominant-iterativ',
  title: '14.2 Diagonaldominante Matrizen',
  body: tx`
    ${lead('Für diagonaldominante Matrizen ist die Maximumnorm das richtige Werkzeug.')}
    <p>Definition 10.3 erlaubt auch singuläre Matrizen (z.&nbsp;B. alle Zeilensummen null). Für Konvergenzaussagen braucht man mehr:</p>
    ${box('definition', '14.4 (Reduzibel)', tx`$A$ heißt <strong>reduzibel</strong>, wenn sich $\{1, \dots, n\} = I_1 \cup I_2$ disjunkt zerlegen lässt mit $a_{ij} = 0$ für alle $i \in I_1$, $j \in I_2$.
      Dann lässt sich $A$ durch Umnummerieren auf die Form $\begin{bmatrix}A_{11} & 0\\ A_{21} & A_{22}\end{bmatrix}$ bringen – das System zerfällt. Sonst heißt $A$ <strong>irreduzibel</strong>
      (anschaulich: Im Graphen von $A$ ist jeder Knoten von jedem aus erreichbar).`)}
    ${box('definition', '14.5', tx`$A$ heißt <strong>irreduzibel diagonaldominant</strong>, falls $A$ irreduzibel ist, $\sum_{j\neq i}|a_{ij}| \le |a_{ii}|$ für alle $i$ gilt und für <em>mindestens ein</em> $i$ sogar „$<$“.`)}
    ${box('satz', '14.6', tx`Ist $A$ irreduzibel diagonaldominant, so konvergieren das Jacobi- und das Gauß-Seidel-Verfahren.
      ${proof(tx`<p>Jacobi: $S = -D^{-1}(L + U)$, also $|(Sx)_i| \le \frac{1}{|a_{ii}|}\sum_{j\neq i}|a_{ij}||x_j| \le \|x\|_\infty$, d.h. $\|S\|_\infty \le 1$.
        Gauß-Seidel: $S = -D^{-1}(U + LS)$; per Induktion über $i$ folgt ebenso $|(Sx)_i| \le \|x\|_\infty$.</p>
        <p>Wäre $\|S\|_\infty = 1$, müsste in einer Zeile mit $|(Sx)_i| = 1$ überall Gleichheit gelten: $|x_j| = 1$ für alle Nachbarn $j$ und $\sum_{j\neq i}|a_{ij}| = |a_{ii}|$. Wegen der
        Irreduzibilität pflanzt sich das auf <em>alle</em> Indizes fort – Widerspruch zur strikten Ungleichung in mindestens einer Zeile. Also $\|S\|_\infty < 1$.</p>`)}`)}
  `,
};

const praxis = {
  id: 'praktische-aspekte',
  title: '14.3 Praktische Aspekte',
  body: tx`
    ${lead('Wann hört man auf? Und wie viele Schritte braucht man insgesamt?')}
    <h3>Abbruchkriterium</h3>
    <p>Man möchte $\|e^k\| \le \epsilon\|e^0\|$, kennt den Fehler aber nicht. Berechenbar ist der Defekt, und es gilt
      $\|e^k\|_{A^TA}^2 = (Ae^k, Ae^k)_2 = \|d^k\|_2^2 = \|b - Ax^k\|_2^2$. Daher:</p>
    ${box('definition', '14.7 (Praktische Iteration)', list([
      tx`$x = x^0$, $d = b - Ax$, $n_0 = \|d\|_2$.`,
      tx`Solange $\|d\|_2 > \epsilon\,n_0$:`,
      tx`löse $Wv = d$,`,
      tx`$x = x + v$,`,
      tx`$d = d - Av$ (denn $d^{k+1} = b - A(x^k + v) = d^k - Av$).`,
    ], true))}
    <p>Hauptaufwand: Lösen mit $W$ und ein Matrix-Vektor-Produkt pro Schritt. Achtung: Für SPD-Matrizen gilt
      $\lambda_\text{min}\|e\|_2 \le \|e\|_{A^TA} \le \lambda_\text{max}\|e\|_2$, also nur</p>
    $$\|e^k\|_2 \le \epsilon\,\kappa_2(A)\,\|e^0\|_2.$$
    <p>Bei schlecht konditionierten Matrizen kann ein kleiner Defekt einen deutlich größeren Fehler bedeuten.</p>

    <h3>Gesamtaufwand</h3>
    <p>Aus $\varrho^k = \epsilon$ folgt $k(\epsilon) = \frac{|\ln\epsilon|}{|\ln\varrho|}$. Mit $\varrho = 1 - 1/\kappa_2(BA)$ und $\ln(1 - x) \approx -x$:</p>
    $$k(\epsilon) \approx \kappa_2(BA)\,|\ln\epsilon|, \qquad A_\text{IT}(n) = C\,\kappa_2(BA)\,|\ln\epsilon|\,n,$$
    <p>wenn ein Schritt bei dünn besetzter Matrix $Cn$ Operationen kostet.</p>
    ${widget('convergence-rate', {}, tx`Das 1D-Poissonproblem tridiag$(-1, 2, -1)$ hat $\kappa_2 \approx 0{,}4\,n^2$. Verdoppelt man $n$, braucht man etwa viermal so viele Schritte. Gauß-Seidel ist genau doppelt so schnell wie Jacobi ($\varrho_{GS} = \varrho_J^2$).`)}
    ${box('merke', 'Der Heilige Gral', tx`Für die besten Verfahren (z.&nbsp;B. Mehrgitterverfahren als Vorkonditionierer) ist in praktisch relevanten Fällen $\kappa(BA) = \text{const}$ unabhängig von $n$.
      Dann löst man ein Gleichungssystem mit $n$ Unbekannten in $O(n)$ Operationen – verglichen mit $\frac23n^3$ für Gauß ein gewaltiger Unterschied.`)}
  `,
};

export default {
  id: 'vl14',
  number: 14,
  title: 'Iterative Lösung linearer Gleichungssysteme II',
  summary: 'Konvergenzraten für SPD-Matrizen und Vorkonditionierung, Gerschgorin-Kreise, Energienorm, diagonaldominante Matrizen, Abbruchkriterien und Gesamtaufwand.',
  sections: [spd, diagdom, praxis],
};
