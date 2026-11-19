/**
 * Vorlesung 16: Newton-Verfahren
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const beispiel = {
  id: 'beispiel-relaxation',
  title: 'Beispiel: Relaxation für Kreis ∩ Ellipse',
  body: tx`
    ${lead('Die Relaxation funktioniert – aber langsam und nicht für alle Lösungen. Das motiviert ein besseres Verfahren.')}
    ${box('beispiel', '16.1', tx`<p>Für $f_1 = x_1^2 + x_2^2 - 4$, $f_2 = x_1^2/9 + x_2^2 - 1$ und $x^{k+1} = x^k - \sigma f(x^k)$ mit Startwert $(2, 1)^T$:</p>
      <div class="table-scroll"><table class="data-table">
        <thead><tr><th>$\sigma$</th><td>0,6</td><td>0,51</td><td>0,505</td><td>0,5</td><td>0,4</td><td>0,3</td><td>0,2</td><td>0,1</td><td>0,05</td><td>0,01</td></tr></thead>
        <tbody>
          <tr><th>Reduktion</th><td>1,0</td><td>1,0</td><td>0,993</td><td>0,974</td><td>0,579</td><td>0,608</td><td>0,738</td><td>0,869</td><td>0,935</td><td>0,987</td></tr>
          <tr><th>Schritte</th><td>∞</td><td>∞</td><td>3307</td><td>849</td><td>43</td><td>43</td><td>71</td><td>154</td><td>318</td><td>1631</td></tr>
        </tbody>
      </table></div>
      <p>Für $\sigma = 0{,}1$ braucht man 154 Schritte. Für den dritten Quadranten muss $\sigma$ negativ sein – und gegen die Nullstellen im zweiten und vierten Quadranten
      konvergiert die Relaxation <strong>nie</strong>, egal wie man $\sigma$ wählt und wie nah man startet.</p>`)}
    <p>Zwei Fragen: Wie weist man nach, dass $g$ eine Kontraktion ist? Und wie verbessert man die Konvergenz? Die Antwort auf beide: Ableitungen.</p>
  `,
};

const kontraktion = {
  id: 'kontraktionseigenschaft',
  title: '16.1 Nachweis der Kontraktionseigenschaft',
  body: tx`
    ${lead('Die Steigung entscheidet: Ist |g′| < 1 in der Nähe des Fixpunktes, so ist g dort eine Kontraktion.')}
    <p>In einer Variablen liefert der Hauptsatz $g(x) - g(y) = \bigl(\int_0^1 g'(y + s(x - y))\,ds\bigr)(x - y)$, also ist $L = \sup|\int_0^1 g'\,ds| \le \sup|g'|$.</p>
    ${box('definition', '16.2 (Jacobimatrix)', tx`$(J_g(\xi))_{ij} = \frac{\partial g_i}{\partial x_j}(\xi)$. Nach Taylor (Satz 3.4) gilt $g(\xi + \eta) = g(\xi) + J_g(\xi)\eta + O(\|\eta\|^2)$.`)}
    ${box('lemma', '16.3 (Mittelwertsatz im ℝⁿ)', tx`$$g(x) - g(y) = \int_0^1 J_g\bigl(sx + (1 - s)y\bigr)\,ds\;(x - y).$$
      ${proof(tx`Für $\varphi(s) = g(sx + (1-s)y)$ ist $g(x) - g(y) = \varphi(1) - \varphi(0) = \int_0^1\varphi'(s)\,ds$, und nach der Kettenregel $\varphi'(s) = J_g(sx + (1-s)y)(x - y)$.`)}`)}
    <p>Mit $\|\int_a^b f(s)\,ds\| \le \int_a^b\|f(s)\|\,ds$ (Lemma 16.4) folgt:</p>
    ${box('satz', '16.5', tx`Hat $g$ den Fixpunkt $\xi$, ist $J_g$ in einer Umgebung stetig und gilt $\|J_g(\xi)\| < 1$, so gibt es ein $\epsilon > 0$ mit $g(\bar B_\epsilon(\xi)) \subset \bar B_\epsilon(\xi)$,
      und die Fixpunktiteration konvergiert für alle Startwerte in $\bar B_\epsilon(\xi)$.
      ${proof(tx`Mit $K = \|J_g(\xi)\|$ ist $K < \frac12(K + 1) < 1$. Wegen der Stetigkeit gilt $\|J_g(z)\| \le \frac12(K + 1)$ auf einer Kugel $\bar B_\epsilon(\xi)$. Der Mittelwertsatz liefert dort
        $\|g(x) - g(y)\| \le \frac12(K + 1)\|x - y\|$ – eine Kontraktion; der Banach’sche Fixpunktsatz erledigt den Rest.`)}`)}
    ${box('merke', '', tx`Lokale Konvergenz der Fixpunktiteration: <strong>$\|J_g(\xi)\| < 1$</strong> (in einer Variablen $|g'(\xi)| < 1$). Genau das sieht man im Spinnweb-Diagramm aus Vorlesung 15:
      Die Kurve muss am Schnittpunkt flacher als die Diagonale sein.`)}
  `,
};

const relaxation = {
  id: 'relaxation',
  title: '16.2 Relaxation',
  body: tx`
    ${lead('Die Relaxation ist im Kern eine Richardson-Iteration – und der ideale Vorkonditionierer wäre die inverse Jacobimatrix.')}
    <p>Mit Taylor um den Fixpunkt $\xi$:</p>
    $$g(x) - g(y) = \bigl(I - \sigma J_f(\xi)\bigr)(x - y) + O\bigl(\|x - \xi\|^2 + \|y - \xi\|^2\bigr).$$
    ${list([
      tx`Nahe am Fixpunkt bestimmt der lineare Term die Konvergenz: Die Relaxation verhält sich wie die <strong>Richardson-Iteration</strong> mit $S = I - \sigma J_f(\xi)$.`,
      tx`Wäre $J_f(\xi)$ symmetrisch positiv definit, konvergierte sie für kleines $\sigma > 0$. Bei nichtlinearen Problemen ist das eher unwahrscheinlich – im Beispiel hat $J_f$ im 2. und 4. Quadranten Eigenwerte verschiedenen Vorzeichens, da hilft kein $\sigma$.`,
      tx`Besser als $B = \sigma I$ wäre ein Vorkonditionierer. Ideal: $B = J_f(\xi)^{-1}$ – dann verschwindet der lineare Term ganz! Nur kennen wir $\xi$ nicht. Berechenbar ist aber $J_f(x^k)$.`,
    ], true)}
  `,
};

const newton = {
  id: 'newton-verfahren',
  title: '16.3 Newton-Verfahren',
  body: tx`
    ${lead('Ersetze f in jedem Schritt durch seine Linearisierung und löse diese exakt. Das Ergebnis: quadratische Konvergenz.')}
    $$x^{k+1} = x^k - J_f(x^k)^{-1}f(x^k). \tag{16.1}$$
    ${box('intuition', 'Geometrisch', tx`In einer Variablen: $x^{k+1}$ ist die Nullstelle der <strong>Tangente</strong> an $f$ im Punkt $x^k$. Im $\R^n$ ersetzt man $f$ durch $f(x^k) + J_f(x^k)(x - x^k)$
      und löst dieses lineare System.`)}
    ${widget('newton-1d', {}, 'Tangente für Tangente: Bei x eˣ − 3 sind nach 4–5 Schritten alle 16 Stellen korrekt, die geschätzte Ordnung nähert sich 2. Die beiden anderen Funktionen zeigen, was schiefgehen kann.')}
    ${box('definition', '16.6 (Konvergenzordnung)', tx`<ol type="i">
      <li><strong>Linear</strong> mit Faktor $\varrho < 1$: $\|x^{k+1} - \xi\| \le \varrho\|x^k - \xi\|$ für $k \ge N$.</li>
      <li><strong>Ordnung $p > 1$</strong>: $\|x^{k+1} - \xi\| \le C\|x^k - \xi\|^p$. Für $p = 2$: <strong>quadratisch</strong> – die Zahl der korrekten Stellen verdoppelt sich etwa pro Schritt.</li>
    </ol>`)}
    ${box('lemma', '16.7', tx`Ist $J_f$ Lipschitz-stetig ($\|J_f(x) - J_f(y)\| \le L\|x - y\|$ auf $\bar B_R(\xi)$) und $J_f(\xi)$ regulär, so ist für $0 < q < 1$ und
      $r = \min\bigl(\frac{q}{L\|J_f^{-1}(\xi)\|}, R\bigr)$ auch $J_f(z)$ regulär für $z \in \bar B_r(\xi)$ mit $\|J_f(z)^{-1}\| \le \frac{1}{1 - q}\|J_f^{-1}(\xi)\|$.
      ${proof(tx`$J_f(z) = J_f(\xi)(I + B)$ mit $B = J_f^{-1}(\xi)(J_f(z) - J_f(\xi))$, $\|B\| \le \|J_f^{-1}(\xi)\|L\|z - \xi\| \le q$. Lemma 6.4 (Neumann) liefert die Behauptung.`)}`)}
    ${box('satz', '16.8 (Konvergenz des Newton-Verfahrens)', tx`Hat $f$ eine Nullstelle $\xi$, ist $J_f$ Lipschitz-stetig mit Konstante $L$ und $J_f(\xi)$ regulär, so konvergiert das Newton-Verfahren für alle Startwerte
      $x^0 \in \bar B_r(\xi)$, $r = \min\bigl(\frac{1}{2L\|J_f^{-1}(\xi)\|}, R\bigr)$, <strong>quadratisch</strong>:
      $$\|x^{k+1} - \xi\| \le L\,\|J_f^{-1}(\xi)\|\,\|x^k - \xi\|^2. \tag{16.2}$$
      ${proof(tx`<p>Subtraktion von $J_f(x^k)x^{k+1} = J_f(x^k)x^k - f(x^k)$ und $J_f(x^k)\xi = J_f(x^k)\xi - f(\xi)$ und der Mittelwertsatz ergeben
        $$J_f(x^k)(x^{k+1} - \xi) = \int_0^1\bigl(J_f(x^k) - J_f(sx^k + (1-s)\xi)\bigr)ds\,(x^k - \xi).$$
        Mit Lemma 16.7 ($q = \frac12$) und der Lipschitzbedingung $\|J_f(x^k) - J_f(sx^k + (1-s)\xi)\| \le L(1 - s)\|x^k - \xi\|$ folgt (16.2).</p>
        <p>Per Induktion bleibt $x^k$ in $\bar B_r(\xi)$ und $\|x^{k+1} - \xi\| \le \frac12\|x^k - \xi\|$ – also Konvergenz, und wegen (16.2) quadratisch.</p>`)}`)}
    ${box('merke', 'Bemerkung 16.9', list([
      'Der Satz setzt die Existenz der Nullstelle voraus.',
      tx`Newton konvergiert nur <strong>lokal</strong>: Der Startwert muss nahe genug liegen. Globalisierungsstrategien wie die Liniensuche (Dämpfung, vgl. Vorlesung 1) vergrößern den Konvergenzbereich; anfangs ist die Konvergenz dann höchstens linear.`,
      tx`Praktisch: berechne $d = f(x^k)$ und $J = J_f(x^k)$, löse $Jv = d$, setze $x^{k+1} = x^k - v$. Teuer sind das Aufstellen von $J$ und das Lösen – bei großen, dünn besetzten Problemen iterativ und nur ungefähr (inexaktes Newton-Verfahren).`,
    ]))}

    ${box('beispiel', '16.10', tx`Für Kreis ∩ Ellipse mit Startwert $(2, 1)^T$ braucht Newton <strong>4 statt 154</strong> Schritte – die Reduktionsfaktoren $6{,}5\cdot10^{-2}$, $9{,}9\cdot10^{-3}$, $1{,}8\cdot10^{-4}$, $3{,}8\cdot10^{-8}$
      quadrieren sich jeweils. Vom weit entfernten Start $(200, 1)^T$ halbiert sich der Fehler zunächst nur (Faktor 0,25 im Residuum, linear), erst nahe der Lösung setzt die quadratische Konvergenz ein.
      Und: Newton findet auch die Nullstellen im 2. und 4. Quadranten.`)}
    ${widget('nonlinear-2d', { method: 'newton' }, 'Dasselbe Problem wie in Vorlesung 15, jetzt mit Newton. Ziehen Sie den Startwert überall hin.')}
    ${widget('newton-basins', {}, 'Einzugsgebiete: Von welchem Startwert aus wird welche Nullstelle gefunden? Newton teilt die Ebene grob in die vier Quadranten auf; die Relaxation erreicht immer nur eine Nullstelle.')}
  `,
};

export default {
  id: 'vl16',
  number: 16,
  title: 'Newton-Verfahren',
  summary: 'Kontraktion über die Jacobimatrix, Relaxation als Richardson-Iteration und das Newton-Verfahren mit quadratischer, aber lokaler Konvergenz.',
  sections: [beispiel, kontraktion, relaxation, newton],
};
