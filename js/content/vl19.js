/**
 * Vorlesung 19: Extrapolation zum Limes
 */
import { box, exercise, lead, list, tx, widget } from './blocks.js';

const motivation = {
  id: 'motivation-extrapolation',
  title: '19.1 Motivation',
  body: tx`
    ${lead(`Manche Größen lassen sich nur für h > 0 berechnen, gesucht ist aber der Grenzwert für h → 0. Einfach h sehr klein machen
      scheitert an Rundungsfehlern oder am Aufwand.`)}
    <p>Eine Größe $a(h)$ sei für $h > 0$ berechenbar, gesucht ist $a(0) = \lim_{h\to 0}a(h)$.</p>
    ${box('beispiel', '19.1', list([
      tx`$\lim_{x\to 0}\frac{\cos x - 1}{\sin x} = 0$ – bei $x = 0$ wird der Nenner null.`,
      tx`Numerische Differentiation $f'(x) = \lim_{h\to 0}\frac{f(x+h) - f(x)}{h}$ – für kleine $h$ tritt Auslöschung auf (Vorlesung 18).`,
      tx`Numerische Integration $\int_a^bf\,dx = \lim_{N\to\infty}\sum_{i=1}^Nhf\bigl(a + \frac{2i-1}{2}h\bigr)$, $h = \frac{b-a}{N}$ – der Aufwand wächst mit $1/h$.`,
      tx`Lösung von Anfangswertproblemen $y' = f(t, y)$ mit Schrittweite $h = T/N$ – ebenso.`,
    ], true))}
  `,
};

const methode = {
  id: 'extrapolationsmethode',
  title: '19.2 Extrapolationsmethode',
  body: tx`
    ${lead(`Idee: Berechne a(h) für einige moderate h, lege ein Interpolationspolynom hindurch und werte es bei h = 0 aus –
      außerhalb der Daten, daher „Extrapolation“.`)}
    <p>Zu $h_0 > h_1 > \dots > h_n > 0$ bestimme das Interpolationspolynom $p$ vom Grad $n$ mit $p(h_i) = a(h_i)$ und setze $a(0) \approx p(0)$.</p>
    ${box('beispiel', '19.2', tx`Für $a(h) = \frac{\cos h - 1}{\sin h}$ und $h = \frac18, \frac1{16}, \frac1{32}$ erhält man
      $a(h_i) = -6{,}258\cdot 10^{-2},\; -3{,}126\cdot 10^{-2},\; -1{,}563\cdot 10^{-2}$ – der Fehler halbiert sich nur mit $h$. Die Extrapolation mit dem Polynom vom Grad 2 liefert dagegen
      $$a(0) \approx p_2(0) = -1{,}02\cdot 10^{-5} \qquad(\text{exakt } 0)$$ – drei Größenordnungen besser, ohne eine einzige zusätzliche Auswertung.`)}
    ${widget('extrapolation', {}, tx`Die Punkte $(h_i, a(h_i))$ liegen fast auf einer Kurve, die man nach links bis $h = 0$ verlängert. Das Neville-Tableau (Vorlesung 17) mit $x = 0$ liefert die Extrapolationswerte direkt.`)}

    <h3>Warum funktioniert das so gut?</h3>
    <p>Ist $a$ $(n+1)$-mal stetig differenzierbar, so gilt nach Taylor</p>
    $$a(h) = \underbrace{a(0) + a'(0)h + \frac{a''(0)}{2}h^2 + \dots + \frac{a^{(n)}(0)}{n!}h^n}_{\text{Polynom in } h, \text{ Koeffizienten unabhängig von } h} + \frac{a^{(n+1)}(\xi_h)}{(n+1)!}h^{n+1}.$$
    <p>Bildet man eine Linearkombination $\sum_ic_ia(h_i)$ mit</p>
    $$\sum_{i=0}^nc_ih_i^j = \begin{cases}1 & j = 0\\ 0 & \text{sonst}\end{cases} \qquad\Leftrightarrow\qquad V^Tc = e_0, \tag{19.1}$$
    <p>so fallen alle Taylorterme bis $h^n$ weg und es bleibt $\sum_ic_ia(h_i) = a(0) + O(h^{n+1})$.</p>
    ${box('merke', 'Elimination der Fehlerterme = Extrapolation', tx`Mit der Vandermonde-Matrix $V$ ist $\sum_ic_ia(h_i) = (V^{-T}e_0)^Ty = e_0^TV^{-1}y$. Das Interpolationspolynom hat die Koeffizienten
      $b = V^{-1}y$, also $p(0) = b_0 = e_0^TV^{-1}y$ – <strong>dasselbe</strong>. Die Extrapolation eliminiert genau die Terme der Taylorentwicklung.
      Für $h_i = hr^i$ (z.&nbsp;B. $r = \frac12$) folgt
      $$|p(0) - a(0)| \le \|V^{-T}\|_\infty\max_i|a^{(n+1)}(\xi_i)|\frac{h^{n+1}}{(n+1)!\,(1 - r^{n+1})}.$$
      Diese hohe Ordnung setzt entsprechende Differenzierbarkeit von $a$ voraus.`)}
  `,
};

const gerade = {
  id: 'gerade-entwicklungen',
  title: '19.3 Extrapolation für gerade Entwicklungen',
  body: tx`
    ${lead('Es geht noch besser: Hat der Fehler nur gerade Potenzen von h, eliminiert jede Auswertung gleich zwei Terme.')}
    <p>Für den zentralen Differenzenquotienten $a(h) = \frac{f(x+h) - f(x-h)}{2h}$ liefert die Taylorentwicklung von $f(x \pm h)$ nach Subtraktion</p>
    $$a(h) - f'(x) = \frac{h^2}{3!}f^{(3)}(x) + \frac{h^4}{5!}f^{(5)}(x) + \dots + \frac{h^{2n}}{(2n+1)!}f^{(2n+1)}(x) + O(h^{2n+1}).$$
    <p>Alle ungeraden Terme fallen „von selbst“ weg. Interpoliert man daher in den Stellen $h_i^2$ (also ein Polynom in $h^2$), so eliminiert man mit derselben Zahl an Auswertungen
      <strong>doppelt so viele</strong> Fehlerterme.</p>
    ${box('intuition', '', 'Wählen Sie im Widget oben die zentrale Differenz und schalten Sie zwischen „h“ und „h²“ um: Mit h² gewinnt man bei gleich vielen Auswertungen viele Stellen dazu. Genau dieses Prinzip steckt hinter der Romberg-Integration (Vorlesung 26).')}
    ${exercise('Warum bringt die Umstellung auf h² bei der Vorwärtsdifferenz nichts?',
      tx`Die Vorwärtsdifferenz hat die Entwicklung $\frac{f(x+h) - f(x)}{h} = f'(x) + \frac h2f''(x) + \frac{h^2}{6}f'''(x) + \dots$ mit <em>allen</em> Potenzen. Ein Polynom in $h^2$
      kann den Term $\frac h2f''(x)$ nicht darstellen – er bleibt stehen, der Fehler bleibt $O(h)$.`)}
  `,
};

export default {
  id: 'vl19',
  number: 19,
  title: 'Extrapolation zum Limes',
  summary: 'Grenzwerte a(0) aus Werten a(h) mit h > 0: Extrapolation mit Interpolationspolynomen, Elimination von Taylortermen und der Vorteil gerader Entwicklungen.',
  sections: [motivation, methode, gerade],
};
