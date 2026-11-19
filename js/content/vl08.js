/**
 * Vorlesung 8: LU-Zerlegung
 */
import { box, code, exercise, lead, list, proof, tx, widget } from './blocks.js';

const herleitung = {
  id: 'herleitung-lu',
  title: '8.1 Herleitung der Zerlegung',
  body: tx`
    ${lead(`Die Gauß-Elimination ist in Wahrheit eine Faktorisierung der Matrix: A = LU. Der Clou: Hat man L und U einmal
      berechnet, ist jede weitere rechte Seite fast geschenkt.`)}
    <p>Für Produkte verwenden wir die Notation $\prod_{i=a}^b M_i = M_bM_{b-1}\cdots M_a$ – der Faktor mit Index $a$ steht immer rechts,
      z.&nbsp;B. $\prod_{i=1}^3 M_i = M_3M_2M_1$, aber $\prod_{i=3}^1 M_i = M_1M_2M_3$.</p>
    ${box('satz', '8.1 (LU-Zerlegung)', tx`Sei $A \in \K^{n\times n}$ regulär. Dann gibt es eine Zerlegung
      $$PA = LU \tag{8.2}$$
      <ol type="i">
        <li>$P = \prod_{k=1}^{n-1}P_{k,s_k}$ ist das Produkt der Zeilentausche aus der Gauß-Elimination,</li>
        <li>$L$ ist eine untere Dreiecksmatrix mit Einsen auf der Diagonale, deren Einträge unterhalb der Diagonale die (passend vertauschten) Multiplikatoren $l_{ik}$ sind,</li>
        <li>$U$ ist die obere Dreiecksmatrix am Ende der Gauß-Elimination, $u_{ij} = a_{ij}^{(n-1)}$.</li>
      </ol>
      Der Name kommt von <em>lower</em> und <em>upper triangular</em>.
      ${proof(tx`Nach Algorithmus 7.11 wird in jedem Schritt erst mit einer Permutations-, dann mit einer Frobeniusmatrix multipliziert:
        $$G_{n-1}P_{n-1,s_{n-1}}\cdots G_2P_{2,s_2}G_1P_{1,s_1}A = U. \tag{8.3}$$
        Nach Lemma 7.10 iv) dürfen Permutationen „nach rechts wandern“: $P_{2,s_2}G_1(-l^{(1)}) = G_1(-P_{2,s_2}l^{(1)})P_{2,s_2}$. So entsteht
        $\tilde G_{n-1}\cdots\tilde G_1 \,PA = U$ mit vertauschten Multiplikatoren. Mit $G_k^{-1}(g) = G_k(-g)$ bringt man die Frobeniusmatrizen auf die
        andere Seite: $PA = \tilde G_1^{-1}\cdots\tilde G_{n-1}^{-1}U = LU$, und Lemma 7.10 iii) zeigt die Gestalt von $L$.`)}`)}
    <p>Damit zerfällt das Lösen in drei einfache Schritte:</p>
    $$Ax = b \;\Leftrightarrow\; PAx = Pb \;\Leftrightarrow\; LUx = Pb \;\Leftrightarrow\; Ly = Pb \;\wedge\; Ux = y.$$
    ${box('definition', '8.2 (Lösen mit LU)', list([
      tx`Berechne die Zerlegung $PA = LU$ – Aufwand $\frac23n^3 + O(n^2)$.`,
      tx`Berechne $\tilde b = Pb$ (nur Umsortieren).`,
      tx`Löse $Ly = \tilde b$ durch Vorwärtseinsetzen – $n^2$.`,
      tx`Löse $Ux = y$ durch Rückwärtseinsetzen – $n^2$.`,
    ], true))}
    ${widget('lu-decomposition', {}, 'Schieben Sie durch die Schritte: In der kompakten Speicherung landen die Multiplikatoren (grün) genau dort, wo Nullen entstanden sind. Vergleichen Sie die drei Pivotisierungsstrategien.')}
    ${box('merke', 'Warum der Aufwand lohnt (Bemerkung 8.3)', list([
      'Für eine einzige rechte Seite rechnet die LU-Zerlegung exakt dieselben Operationen wie die Gauß-Elimination – nur in anderer Reihenfolge.',
      tx`Für <strong>viele rechte Seiten</strong> mit derselben Matrix kostet jede weitere nur noch $2n^2$ statt $\frac23n^3$.`,
      tx`Die Inverse $A^{-1}$ sind $n$ Systeme mit den Einheitsvektoren als rechten Seiten: Aufwand $\frac83n^3 + O(n^2)$. (Man braucht sie aber fast nie explizit!)`,
    ]))}
  `,
};

const vollpivot = {
  id: 'vollpivotisierung',
  title: '8.2 Vollpivotisierung',
  body: tx`
    ${lead('Statt nur Zeilen kann man auch Spalten tauschen – dann darf jedes Element der Restmatrix Pivot werden.')}
    <p>Ein Spaltentausch $\tilde A^{(k)}P_{k,r_k}$ vertauscht die Spalten $k$ und $r_k$. Wegen $Ax = AP_{1,r_1}P_{1,r_1}x$ entspricht das einem Vertauschen
      der Komponenten $x_k$ und $x_{r_k}$ im Lösungsvektor.</p>
    ${box('satz', '8.4 (LU mit Vollpivotisierung)', tx`Für reguläres $A$ gibt es eine Zerlegung
      $$PAQ = LU \tag{8.6}$$
      mit $P = \prod_{k=1}^{n-1}P_{k,s_k}$ (Zeilentausche), $Q = \prod_{k=n-1}^{1}P_{k,r_k}$ (Spaltentausche), $L$ und $U$ wie in Satz 8.1.`)}
    <p>Gelöst wird dann über $Ax = b \Leftrightarrow LUQ^{-1}x = Pb$:</p>
    ${box('definition', '8.5', list([
      tx`Berechne $PAQ = LU$.`, tx`$\tilde b = Pb$.`, tx`Löse $Lz = \tilde b$ (vorwärts).`, tx`Löse $Uy = z$ (rückwärts).`, tx`$x = Qy$ – nur ein zusätzliches Umsortieren.`,
    ], true))}
  `,
};

const implementierung = {
  id: 'implementierung-lu',
  title: '8.3 Praktische Implementierung',
  body: tx`
    ${lead('In der Praxis speichert man weder Permutationsmatrizen noch L und U getrennt.')}
    ${list([
      tx`<strong>Permutationen</strong> werden nicht als $n\times n$-Matrix gespeichert, sondern als Vektor $p = (s_1, s_2, \dots)$ der Tauschindizes. Anwenden heißt einfach Tauschen.`,
      tx`<strong>L und U</strong> überschreiben die Matrix $A$: Einträge $(i, j)$ mit $j \ge i$ gehören zu $U$, die mit $j < i$ zu $L$. Die Einsen auf der Diagonale von $L$ werden nicht gespeichert.`,
    ])}
    ${code(`
template<class T>
void permute_forward (const Vector<std::size_t>& p, Vector<T>& b)
{
  for (std::size_t k=0; k<b.size()-1; ++k)
    if (p[k]!=k) std::swap(b[k],b[p[k]]);
}

template<class T>
void linsolve (DenseMatrix<T>& A, Vector<T>& x, Vector<T>& b)
{
  Vector<std::size_t> p(x.size());
  Vector<std::size_t> q(x.size());
  lr_fullpivot(A,p,q);   // LU-Zerlegung (in HDNum: LR) mit Vollpivotisierung
  permute_forward(p,b);  // b~ = P b
  solveL(A,b,b);         // L z = b~
  solveR(A,x,b);         // U y = z
  permute_backward(q,x); // x = Q y
}`)}
  `,
};

const integral = {
  id: 'integralgleichungen',
  title: '8.4 Lineare Integralgleichungen',
  body: tx`
    ${lead(`Ein größeres Beispiel: Gesucht ist eine Funktion, die unter einem Integral vorkommt. Die Diskretisierung liefert ein
      lineares Gleichungssystem, dessen Kondition man fast beliebig einstellen kann – ideal, um die Theorie zu testen.`)}
    <p>Gesucht ist $u: (\alpha, \beta) \to \R$ mit</p>
    $$\lambda(x)u(x) + \int_\alpha^\beta K(x, y)u(y)\,dy = f(x) \qquad \forall x \in (\alpha, \beta). \tag{8.7}$$
    <p>Solche <strong>Integralgleichungen</strong> treten z.&nbsp;B. in der Mechanik und der Computergrafik auf (Radiosity-Verfahren: $K(x, y)$ beschreibt,
      wie viel Licht aus Richtung $x$ in Richtung $y$ reflektiert wird). Die Gleichung heißt <em>linear</em> (linear in $u$), <em>1. Art</em> falls
      $\lambda = 0$, und <em>Fredholm'sch</em> bei festen Integrationsgrenzen (sonst Volterra). Wir betrachten</p>
    $$\int_0^1 K(x, y)u(y)\,dy = f(x), \qquad K(x, y) = \frac{1}{|x - y|^\gamma},\; 0 < \gamma < 1. \tag{8.8}$$
    <p>Der Kern ist singulär, aber integrierbar („schwach singulär“). Abstrakt ist $u \mapsto \int K(\cdot, y)u(y)\,dy$ eine lineare Abbildung
      zwischen Funktionenräumen – eine lineare Gleichung $\mathcal A(u) = f$, nur unendlichdimensional.</p>

    <h3>Kollokationsmethode</h3>
    <p>Zerlege $(0, 1)$ in $n$ Teilintervalle der Länge $h = 1/n$ mit Mittelpunkten $c_i = (i + \frac12)h$ und suche $u$ als
      <strong>stückweise konstante</strong> Funktion $u_h(x) = \sum_{j=0}^{n-1}z_j\varphi_j(x)$, wobei $\varphi_j = 1$ auf dem $j$-ten Intervall und sonst 0 ist.
      Die $n$ Unbekannten $z_j$ bestimmt man, indem man die Gleichung in den $n$ Punkten $c_i$ verlangt:</p>
    $$\int_0^1 K(c_i, y)u_h(y)\,dy = \sum_{j=0}^{n-1}z_j\underbrace{\int_{c_j - h/2}^{c_j + h/2}K(c_i, y)\,dy}_{a_{ij}} = \underbrace{f(c_i)}_{b_i}. \tag{8.9–8.11}$$
    ${box('beispiel', '8.6', tx`Für $K = |x - y|^{-\gamma}$ lässt sich das Integral geschlossen angeben:
      $$a_{ij} = \begin{cases}\frac{2}{1-\gamma}\left(\frac h2\right)^{1-\gamma} & c_i = c_j,\\[4pt] \frac{1}{1-\gamma}\left[\left(|c_i - c_j| + \frac h2\right)^{1-\gamma} - \left(|c_i - c_j| - \frac h2\right)^{1-\gamma}\right] & \text{sonst,}\end{cases}$$
      und als rechte Seite wählen wir $f(x) = \frac{1}{1{,}1 + \sin(7\pi x)}$.`)}
    ${widget('integral-equation', {}, tx`Für $\gamma \to 1$ ist die Matrix gut konditioniert ($\operatorname{cond} \approx 1$–3), für $\gamma \to 0$ wächst die Kondition enorm und zusätzlich linear mit $n$.
      Vergleichen Sie den Fehler $\|AA^{-1} - I\|_\infty$ in <code>double</code> und <code>float</code> mit den Tabellen im Skript.`)}
    ${box('beobachtung', '', list([
      tx`Im gut konditionierten Fall erreicht man die volle Genauigkeit des Zahlentyps ($\approx 10^{-16}$ bzw. $10^{-7}$).`,
      tx`Für $\gamma = 10^{-5}$, $n = 512$ ist $\operatorname{cond} \approx 5\cdot 10^7$: In <code>double</code> verliert man etwa die Hälfte der Stellen – genau wie Beispiel 6.6 vorhersagt.`,
      tx`In <code>float</code> sind die schlecht konditionierten Systeme gar nicht mehr sinnvoll lösbar (Fehler $> 1$).`,
    ]))}
    ${exercise('Warum wird die Matrix für γ → 0 fast singulär?',
      tx`Für $\gamma = 0$ ist $K \equiv 1$, also $a_{ij} = h$ für alle $i, j$: Alle Zeilen sind gleich, die Matrix hat Rang 1. Für kleines $\gamma$ unterscheiden
      sich die Zeilen nur noch wenig – die Kondition explodiert.`)}
  `,
};

export default {
  id: 'vl8',
  number: 8,
  title: 'LU-Zerlegung',
  summary: 'Gauß-Elimination als Faktorisierung PAQ = LU, Voll- und Spaltenpivotisierung, kompakte Speicherung und ein Anwendungsbeispiel mit Integralgleichungen.',
  sections: [herleitung, vollpivot, implementierung, integral],
};
