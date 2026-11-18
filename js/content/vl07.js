/**
 * Vorlesung 7: Eliminationsverfahren
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const dreieck = {
  id: 'dreieckssysteme',
  title: '7.1 Dreieckssysteme',
  body: tx`
    ${lead('Manche Gleichungssysteme sind fast geschenkt: Hat die Matrix Dreiecksgestalt, löst man von unten nach oben auf.')}
    $$\begin{aligned}
      a_{11}x_1 + a_{12}x_2 + \dots + a_{1n}x_n &= b_1,\\
      a_{22}x_2 + \dots + a_{2n}x_n &= b_2,\\
      &\;\;\vdots\\
      a_{nn}x_n &= b_n.
    \end{aligned} \tag{7.1}$$
    <p>Das System ist genau dann regulär, wenn alle $a_{ii} \neq 0$. Dann liefert <strong>Rückwärtseinsetzen</strong></p>
    $$x_n = \frac{b_n}{a_{nn}}, \qquad x_i = \Bigl(b_i - \sum_{j=i+1}^n a_{ij}x_j\Bigr)\Big/a_{ii}, \quad i = n-1, \dots, 1. \tag{7.2, 7.3}$$
    <p>Für $x_i$ braucht man $n - i$ Multiplikationen, $n - i$ Subtraktionen und eine Division – insgesamt</p>
    $$N_\text{Dreieck}(n) = \sum_{i=0}^{n-1}(2i + 1) = n^2$$
    <p>Operationen. Untere Dreieckssysteme löst man analog durch <strong>Vorwärtseinsetzen</strong>.</p>
  `,
};

const elimination = {
  id: 'gauss-elimination',
  title: '7.2 Transformation auf Dreiecksgestalt',
  body: tx`
    ${lead('Jedes reguläre System lässt sich durch elementare Umformungen auf Dreiecksgestalt bringen – das ist die Gauß-Elimination.')}
    <p>Elementare Umformungen ändern die Lösung nicht:</p>
    ${list(['Vertauschen zweier Gleichungen,', 'Addition des Vielfachen einer Gleichung zu einer anderen.'], true)}
    ${box('definition', '7.1 (Gauß-Elimination)', tx`Setze $A^{(0)} = A$, $b^{(0)} = b$. Für $k = 1, \dots, n - 1$:
      <ol type="a">
        <li><strong>Pivotisierung:</strong> Ist $\tilde a_{kk}^{(k)} = 0$, suche $s > k$ mit $\tilde a_{sk}^{(k)} \neq 0$ und vertausche die Zeilen $k$ und $s$.
          Das Element $\tilde a_{kk}^{(k)}$ heißt <strong>Pivotelement</strong>.</li>
        <li><strong>Elimination:</strong> Mit den Multiplikatoren $l_i^{(k)} = \tilde a_{ik}^{(k)}/\tilde a_{kk}^{(k)}$ ($i > k$) setze
          $$a_{ij}^{(k)} = \tilde a_{ij}^{(k)} - l_i^{(k)}\tilde a_{kj}^{(k)}, \qquad b_i^{(k)} = \tilde b_i^{(k)} - l_i^{(k)}\tilde b_k^{(k)}, \tag{7.5, 7.6}$$
          d.h. ziehe das $l_i$-fache der Pivotzeile von Zeile $i$ ab. Danach ist Spalte $k$ unterhalb der Diagonale null.</li>
      </ol>`)}
    ${box('satz', '7.2', tx`Das Verfahren bringt jedes reguläre $n\times n$-System in $n - 1$ Schritten auf obere Dreiecksgestalt.
      ${proof(tx`Fände sich in Schritt a) kein Pivot, wären die Zeilen $k, \dots, n$ (in den Spalten $k, \dots, n$) linear abhängig – Widerspruch zur Regularität.
        In (7.5) ist $a_{ik}^{(k)} = \tilde a_{ik}^{(k)} - \frac{\tilde a_{ik}^{(k)}}{\tilde a_{kk}^{(k)}}\tilde a_{kk}^{(k)} = 0$, die Spalte wird also eliminiert.`)}`)}
    ${box('merke', 'Pivotisierung', 'In exakter Arithmetik muss man nur tauschen, wenn das Pivot 0 ist. In Fließkommaarithmetik wird die Wahl des Pivots entscheidend für die Genauigkeit (Kapitel 9). In der Praxis überschreibt man die Matrix Schritt für Schritt, statt jedes A⁽ᵏ⁾ zu speichern.')}

    ${widget('gauss-stepper', {}, 'Beispiel 7.4 aus dem Skript Schritt für Schritt: Das umrandete Element ist das Pivot, grün hinterlegt sind die Einträge, die sich ändern. Wählen Sie „mit Zeilentausch“, um eine Pivotisierung zu sehen.')}

    ${box('beispiel', '7.4', tx`$$[A^{(0)}|b^{(0)}] = \left[\begin{array}{cccc|c}2&4&6&8&40\\16&33&50&67&330\\4&15&31&44&167\\10&29&63&97&350\end{array}\right]
      \to \dots \to [A^{(3)}|b^{(3)}] = \left[\begin{array}{cccc|c}2&4&6&8&40\\0&1&2&3&10\\0&0&5&7&17\\0&0&0&9&9\end{array}\right]$$
      Rückwärtseinsetzen: $x_4 = 1$, $x_3 = (17 - 7)/5 = 2$, $x_2 = (10 - 4 - 3)/1 = 3$, $x_1 = (40 - 12 - 12 - 8)/2 = 4$.`)}

    <h3>Aufwand</h3>
    ${box('lemma', '7.5', tx`Die Gauß-Elimination benötigt $N_\text{Gauß}(n) = \frac23 n^3 + O(n^2)$ Operationen.
      ${proof(tx`In Schritt $k$: $n - k$ Divisionen für die $l_i$, und für jede der $n - k$ Zeilen $(n - k)\cdot 2 + 2$ Operationen in (7.5), (7.6):
        $$N_\text{Gauß} = \sum_{k=1}^{n-1}\bigl[(n - k) + (n - k)(2(n - k) + 2)\bigr] = 2\sum_{k=1}^{n-1}(n-k)^2 + 3\sum_{k=1}^{n-1}(n - k) = \tfrac23n^3 + O(n^2).$$`)}`)}
    ${widget('complexity', {}, tx`Die Elimination ($\frac23 n^3$) dominiert das Rückwärtseinsetzen ($n^2$) bei weitem. Ein Gleichungssystem kostet insgesamt $\frac23n^3 + O(n^2)$ Operationen.`)}
  `,
};

const matrixform = {
  id: 'matrixformulierung',
  title: '7.3 Matrixformulierung der Gauß-Elimination',
  body: tx`
    ${lead('Jeder Schritt der Elimination ist eine Multiplikation mit einer sehr einfachen Matrix. Das ebnet den Weg zur LU-Zerlegung.')}
    <h3>Zeilentausch = Permutationsmatrix</h3>
    ${box('definition', '7.6 (Permutationsmatrix)', tx`$P_{r,s}$ ist die Einheitsmatrix mit vertauschten Zeilen $r$ und $s$:
      $(P_{r,s})_{rs} = (P_{r,s})_{sr} = 1$, $(P_{r,s})_{rr} = (P_{r,s})_{ss} = 0$, sonst wie $I$.`)}
    ${box('lemma', '7.7', list([
      tx`$P_{r,s}A$ ist $A$ mit vertauschten <em>Zeilen</em> $r$, $s$;`,
      tx`$AP_{r,s}$ ist $A$ mit vertauschten <em>Spalten</em> $r$, $s$;`,
      tx`$P_{r,s} = P_{r,s}^T$ und $P_{r,s}^{-1} = P_{r,s}$ – zweimal tauschen ändert nichts; $P_{r,s}$ ist orthogonal.`,
    ], true))}

    <h3>Elimination = Rang-1-Update = Frobeniusmatrix</h3>
    <p>Für Vektoren $l, u$ ist $lu^T$ die Matrix mit Einträgen $l_iu_j$ – alle Zeilen sind Vielfache voneinander, sie hat Rang 1.
      Der Eliminationsschritt lautet damit kompakt $A^{(k)} = \tilde A^{(k)} - l^{(k)}u^{(k)T}$ mit $u^{(k)}$ = Pivotzeile (Algorithmus 7.8, „Rang-1-Update“).</p>
    ${box('definition', '7.9 (Frobeniusmatrix)', tx`Für einen Vektor $g$ mit $g_i = 0$ für $i \le k$ heißt
      $$G_k(g) = I_n + g\,e^{(k)T} = \begin{bmatrix}1\\&\ddots\\&&1\\&&g_{k+1}&1\\&&\vdots&&\ddots\\&&g_n&&&1\end{bmatrix}$$
      Frobeniusmatrix: die Einheitsmatrix mit Einträgen unterhalb der Diagonale in Spalte $k$.`)}
    ${box('lemma', '7.10', tx`<ol type="i">
      <li>$G_k(g)\tilde A$ addiert das $g_i$-fache der Zeile $k$ zur Zeile $i$ ($i > k$).</li>
      <li>$G_k(g)^{-1} = I_n - g\,e^{(k)T} = G_k(-g)$ – man invertiert durch Vorzeichenwechsel!</li>
      <li>$G_1(g^{(1)})^{-1}\cdots G_k(g^{(k)})^{-1} = I_n - \sum_{j=1}^k g^{(j)}e^{(j)T}$: eine untere Dreiecksmatrix mit Einsen auf der Diagonale, deren Spalten einfach die $-g^{(j)}$ enthalten.</li>
      <li>$P_{\alpha,\beta}G_k(g) = G_k(P_{\alpha,\beta}g)P_{\alpha,\beta}$ für $k < \alpha \le \beta$ – Tauschen und Eliminieren lassen sich umsortieren.</li>
    </ol>
    ${proof(tx`ii) $(I - ge^{(k)T})(I + ge^{(k)T}) = I - ge^{(k)T}ge^{(k)T} = I$, da $e^{(k)T}g = g_k = 0$.
      iii) Induktion; die gemischten Terme $g^{(j)}e^{(j)T}g^{(k)}e^{(k)T}$ verschwinden, weil $e^{(j)T}g^{(k)} = g^{(k)}_j = 0$ für $j < k$.`)}`)}
    ${box('satz', '7.11 (Gauß-Elimination mit Frobeniusmatrizen)', tx`Für $k = 1, \dots, n - 1$:
      $$\tilde A^{(k)} = P_{k,s}A^{(k-1)}, \qquad A^{(k)} = G_k\bigl(-l^{(k)}\bigr)\tilde A^{(k)}, \qquad b^{(k)} = G_k\bigl(-l^{(k)}\bigr)P_{k,s}b^{(k-1)}.$$`)}
    ${box('intuition', 'Ausblick: LU-Zerlegung', tx`Ohne Zeilentausch gilt $U = A^{(n-1)} = G_{n-1}\cdots G_1A$, also
      $A = G_1^{-1}\cdots G_{n-1}^{-1}U = LU$. Nach Lemma 7.10 iii) ist $L$ eine untere Dreiecksmatrix, die einfach die Multiplikatoren $l_i^{(k)}$ enthält –
      sie fallen bei der Elimination ohnehin an. Im Widget oben können Sie unter „Matrixform“ die $G_k$ jedes Schritts sehen. Mehr dazu in Vorlesung 8.`)}
  `,
};

export default {
  id: 'vl7',
  number: 7,
  title: 'Eliminationsverfahren',
  summary: 'Rückwärtseinsetzen, Gauß-Elimination Schritt für Schritt, Rechenaufwand und die Formulierung mit Permutations- und Frobeniusmatrizen.',
  sections: [dreieck, elimination, matrixform],
};
