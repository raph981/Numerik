/**
 * Vorlesung 4: Analyse von Netzwerken
 */
import { box, lead, list, proof, tx, widget } from './blocks.js';

const rohrleitungen = {
  id: 'rohrleitungsnetze',
  title: '4.1 Rohrleitungsnetze',
  body: tx`
    ${lead(`Zurück zur Modellbildung: Wie verteilt sich Wasser in einem städtischen Leitungsnetz? Die Antwort führt direkt
      auf ein großes lineares Gleichungssystem – das zentrale Thema der nächsten Vorlesungen.`)}
    <p>Ein Wasserleitungsnetz besteht aus Rohren verschiedener Durchmesser, die an Verbindungsstellen verknüpft sind, sowie aus
      Pumpen, die Wasser von einer Verbindungsstelle zur anderen befördern. Wir nehmen an: Die Rohre sind vollständig gefüllt, und
      in den Verbindungsstellen wird kein Wasser gespeichert. (Gas- und Stromnetze funktionieren genauso.)</p>
    <p>Abstrakt ist das Netz ein <strong>gerichteter Graph</strong> $G = (V, E)$ mit Knoten $V$ (Verbindungsstellen) und Kanten
      $E \subseteq V \times V$. Eine Kante $e = (v, w)$ verbindet $v$ mit $w$. Die Kanten zerfallen in Rohre und Pumpen,
      $E = E_R \cup E_P$. Die Orientierung legt nur fest, welche Flussrichtung als <em>positiv</em> zählt – Wasser darf in beide
      Richtungen fließen. Wir schreiben $n = \#V$, $m = \#E = m_R + m_P$.</p>
    <p>Im Beispiel des Skripts gibt es $n = 5$ Knoten und $m = 8$ Kanten: $e_1, \dots, e_6$ sind Rohre, $e_7, e_8$ Pumpen (gestrichelt).</p>

    <h3>Das Gesetz von Hagen-Poiseuille</h3>
    <p>Der Durchfluss durch ein Rohr $e = (v, w) \in E_R$ ist proportional zur Druckdifferenz:</p>
    $$q_e = \frac{\pi r_e^4}{8\eta l_e}\,\Delta p_e, \qquad L_e = \frac{\pi r_e^4}{8\eta l_e} \;\text{„Leitfähigkeit“}. \tag{4.1}$$
    ${list([
      tx`$q_e$: gerichteter Volumenstrom in $\mathrm{m^3/s}$ ($q_e > 0$: Fluss in Kantenrichtung, $q_e < 0$: dagegen),`,
      tx`$\Delta p_e = p_v - p_w$: Potential- bzw. Druckdifferenz in $\mathrm{Pa}$ – Wasser fließt von hohem zu niedrigem Druck,`,
      tx`$r_e$, $l_e$: Radius und Länge des Rohres, $\eta$: Viskosität von Wasser.`,
    ])}
    ${box('intuition', '', tx`Die vierte Potenz des Radius ist bemerkenswert: Ein doppelt so dickes Rohr leitet <strong>16-mal</strong> so viel Wasser.
      Gesucht sind alle Knotendrücke $p_v$ und alle Flüsse $q_e$ aus den Rohrdaten und den Pumpenstärken.`)}
  `,
};

const kirchhoff = {
  id: 'kirchhoff',
  title: '4.2 Kirchhoff’sche Gesetze',
  body: tx`
    ${lead('Zwei Erhaltungssätze verknüpfen die Flüsse und Drücke im ganzen Netz.')}
    <h3>Knotenregel (1. Kirchhoff’sches Gesetz) – Massenerhaltung</h3>
    <p>Mit den ausgehenden Kanten $E_v^+ = \{(u, w) \in E : u = v\}$ und eingehenden Kanten $E_v^- = \{(u, w) \in E : w = v\}$ gilt</p>
    $$\sum_{e \in E_v^+} q_e - \sum_{e \in E_v^-} q_e = 0. \tag{4.2}$$
    <p>Was hineinfließt, muss sofort wieder hinaus. Von diesen $n$ linearen Gleichungen sind allerdings nur $n - 1$ linear unabhängig.</p>
    ${proof(tx`<p>Gilt die Knotenregel in allen Knoten außer $w$, so summieren wir sie auf. Jede Kante $e = (u, v)$ fällt in genau einen Fall:</p>
      <ol type="i">
        <li>$u \neq w$ und $v \neq w$: $q_e$ kommt einmal mit $+$ (bei $u$) und einmal mit $-$ (bei $v$) vor und hebt sich weg.</li>
        <li>$u = w$: $q_e$ kommt nur bei $v$ als eingehende Kante vor, also mit $-$.</li>
        <li>$v = w$: $q_e$ kommt nur bei $u$ als ausgehende Kante vor, also mit $+$.</li>
      </ol>
      <p>Übrig bleibt $0 = \sum_{e \in E_w^-} q_e - \sum_{e\in E_w^+} q_e$ – die Knotenregel in $w$ (mal $-1$).</p>`, 'Warum nur n − 1 unabhängige Gleichungen?')}

    <h3>Maschenregel (2. Kirchhoff’sches Gesetz) – Energieerhaltung</h3>
    <p>Eine <strong>Masche</strong> $C \subseteq E$ ist ein geschlossener Pfad mit Umlaufsinn. $C^+$ seien die Kanten, die mit dem Umlaufsinn
      orientiert sind, $C^-$ die übrigen. Dann gilt</p>
    $$\sum_{e \in C^+} \Delta p_e - \sum_{e \in C^-} \Delta p_e = 0. \tag{4.3}$$
    ${box('intuition', '', `Wer einmal im Kreis läuft, kommt auf derselben Höhe an. Würde die Maschenregel nicht gelten, könnte man durch
      „Im-Kreis-Pumpen“ Energie gewinnen – ein Perpetuum mobile.`)}
    <p>Auch hier sind nur höchstens $n - 1$ der Maschengleichungen linear unabhängig – die Maschen müsste man also geschickt auswählen.
      Das Knotenpotentialverfahren umgeht dieses Problem elegant.</p>
  `,
};

const verfahren = {
  id: 'knotenpotentialverfahren',
  title: '4.3 Knotenpotentialverfahren',
  body: tx`
    ${lead(`Die Idee: Statt nach Flüssen fragen wir nach den Drücken in den Knoten. Dann ist die Maschenregel automatisch erfüllt,
      und aus der Knotenregel wird ein lineares Gleichungssystem.`)}
    <h3>Schritt 1: Potentiale statt Differenzen</h3>
    <p>Für jede Kante $e = (v, w)$ setzen wir $\Delta p_e = p_v - p_w$ (4.4). Dann ist jede Maschenregel automatisch erfüllt – jedes $p_v$
      kommt in der Summe einmal mit $+$ und einmal mit $-$ vor. Da nur Differenzen eine Rolle spielen, legen wir einen
      <strong>Referenzknoten</strong> fest: $p_{v_n} = 0$. Unbekannt sind $p = (p_{v_1}, \dots, p_{v_{n-1}})^T \in \R^{n-1}$ (4.5).</p>

    <h3>Schritt 2: Drei Matrixgleichungen</h3>
    ${list([
      tx`<strong>Differenzen:</strong> $\Delta p = Bp$ (4.7) mit der Inzidenzmatrix $B \in \R^{m_R \times (n-1)}$: Zeile $i$ (Rohr $e_i = (v, w)$) hat $+1$ in Spalte $v$ und $-1$ in Spalte $w$ (4.8). Jede Zeile hat höchstens zwei Einträge – $B$ ist <em>dünn besetzt</em>.`,
      tx`<strong>Hagen-Poiseuille:</strong> $q = L\,\Delta p$ (4.9) mit der Diagonalmatrix $L = \operatorname{diag}(L_{e_1}, \dots, L_{e_{m_R}})$.`,
      tx`<strong>Knotenregel:</strong> Die Pumpenströme sind bekannt und wandern auf die rechte Seite:
        $\sum_{e\in E_v^+\cap E_R} q_e - \sum_{e\in E_v^-\cap E_R} q_e = \sum_{e\in E_v^-\cap E_P} q_e - \sum_{e\in E_v^+\cap E_P} q_e =: b_v$ (4.11).
        In Matrixform $\tilde B q = b$ (4.12) – und ein Vergleich zeigt $\tilde B = B^T$!`,
    ], true)}

    <h3>Schritt 3: Einsetzen</h3>
    $$b = B^T q = B^T L\,\Delta p = B^T L B\, p \qquad\Longrightarrow\qquad Ap = b, \quad A = B^T L B. \tag{4.15}$$
    ${widget('pipe-network', {}, tx`Das Netz aus dem Skript ($v_5$ ist Referenzknoten). Verändern Sie Leitfähigkeiten und Pumpen: Das System $Ap = b$ wird
      bei jeder Änderung neu gelöst. Die Animation zeigt die Fließrichtung, die Knotenfarbe den Druck.`)}

    ${box('merke', 'Eigenschaften von A = BᵀLB', tx`<ol>
      <li><strong>Symmetrisch:</strong> $A^T = B^T L^T B = B^T L B = A$, da $L$ diagonal ist.</li>
      <li><strong>Positiv definit:</strong> Für $x \neq 0$ ist $y = Bx \neq 0$ (die Spalten von $B$ sind linear unabhängig, wenn das Rohrnetz zusammenhängt) und
        $x^TAx = y^TLy = \sum_i L_{ii} y_i^2 > 0$.</li>
      <li><strong>Dünn besetzt:</strong> Typischerweise sind nur $O(n)$ Einträge ungleich null – jeder Knoten ist nur mit wenigen Nachbarn verbunden.</li>
    </ol>
    Diese Eigenschaften werden sich für effiziente Lösungsverfahren als sehr wertvoll erweisen (Kapitel 10, 13, 14).`)}
    ${box('beobachtung', '', tx`Schauen Sie in die Matrizen des Widgets: $A_{ii}$ ist die Summe der Leitfähigkeiten der am Knoten $v_i$ anliegenden Rohre,
      $A_{ij} = -L_e$, wenn ein Rohr $e$ die Knoten $v_i$ und $v_j$ verbindet, sonst 0.`)}
  `,
};

const zusammenfassung = {
  id: 'zusammenfassung-netzwerke',
  title: '4.4 Zusammenfassung',
  body: tx`
    <p>Die systematische Analyse von Strömungen in Rohrnetzen führt auf lineare Gleichungssysteme mit möglicherweise sehr vielen Unbekannten.
      Das Verfahren überträgt sich direkt auf <strong>elektrische Netzwerke</strong>:</p>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Wasser</th><th>Strom</th></tr></thead>
      <tbody>
        <tr><td>Volumenstrom $q_e$</td><td>elektrischer Strom durch eine Kante</td></tr>
        <tr><td>Druck / Potential $p_v$</td><td>Spannung am Knoten relativ zur Masse</td></tr>
        <tr><td>Hagen-Poiseuille $q = L\Delta p$</td><td>Ohm’sches Gesetz $I = U/R$</td></tr>
        <tr><td>Pumpe</td><td>Stromquelle</td></tr>
      </tbody>
    </table></div>
    <p>Netze aus Widerständen, Spulen und Kondensatoren (RLC-Netzwerke) mit sinusförmiger Anregung führen auf komplexwertige lineare Gleichungssysteme.</p>
  `,
};

export default {
  id: 'vl4',
  number: 4,
  title: 'Analyse von Netzwerken',
  summary: 'Vom Rohrleitungsnetz zum linearen Gleichungssystem: Hagen-Poiseuille, Kirchhoff’sche Gesetze und das Knotenpotentialverfahren.',
  sections: [rohrleitungen, kirchhoff, verfahren, zusammenfassung],
};
