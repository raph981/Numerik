/**
 * Vorlesung 18: Interpolationsfehler und numerische Differentiation
 */
import { box, code, lead, list, proof, tx, widget } from './blocks.js';

const fehler = {
  id: 'interpolationsfehler',
  title: '18.1 Interpolationsfehler',
  body: tx`
    ${lead('An den Stützstellen ist der Fehler null – aber wie groß wird er dazwischen? Und hilft es immer, mehr Stützstellen zu nehmen?')}
    ${box('satz', '18.1 (Rolle)', tx`Ist $u$ stetig auf $[a, b]$, differenzierbar auf $(a, b)$ und $u(a) = u(b) = 0$, so gibt es ein $x \in (a, b)$ mit $u'(x) = 0$.
      Zwischen zwei Nullstellen liegt immer eine Nullstelle der Ableitung.`)}
    ${box('satz', '18.2 (Interpolationsfehler)', tx`Sei $f$ $(n+1)$-mal stetig differenzierbar und $p$ das Interpolationspolynom zu $x_0 < \dots < x_n$. Dann gibt es zu jedem $x$ ein $\xi_x$ im kleinsten
      Intervall, das alle $x_i$ und $x$ enthält, mit
      $$f(x) - p(x) = \frac{f^{(n+1)}(\xi_x)}{(n+1)!}\prod_{j=0}^n(x - x_j).$$
      ${proof(tx`<p>Für $x = x_i$ ist nichts zu zeigen. Sonst betrachte $F_x(t) = f(t) - p(t) - \frac{f(x) - p(x)}{l(x)}l(t)$ mit $l(t) = \prod_j(t - x_j)$.
        $F_x$ hat die $n + 2$ Nullstellen $x_0, \dots, x_n, x$. Nach Rolle hat $F_x'$ mindestens $n + 1$ Nullstellen, …, $F_x^{(n+1)}$ mindestens eine, $\xi_x$.</p>
        <p>Da $p^{(n+1)} = 0$ und $l^{(n+1)} = (n+1)!$: $0 = F_x^{(n+1)}(\xi_x) = f^{(n+1)}(\xi_x) - \frac{f(x) - p(x)}{l(x)}(n+1)!$. Auflösen liefert die Behauptung.</p>`)}`)}
    <p>Der Fehler hat zwei Faktoren: die $(n+1)$-te Ableitung von $f$ und das <strong>Knotenpolynom</strong> $\prod(x - x_j)$, das nur von der Lage der Stützstellen abhängt.
      Für äquidistante Stützstellen mit Abstand $h$ und $l$ Stützstellen links, $r$ rechts von $x$:</p>
    $$\prod_{j=0}^n|x - x_j| \le l!\,r!\,h^{n+1} \quad\Rightarrow\quad |f(x) - p(x)| \le |f^{(n+1)}(\xi_x)|\underbrace{\frac{l!\,r!}{(n+1)!}}_{\le 1}h^{n+1}.$$
    <p>Bei beschränkten Ableitungen geht der Fehler also <strong>exponentiell</strong> gegen null. Aber Vorsicht – die Ableitungen sind oft nicht beschränkt! Für Runges Beispiel gilt</p>
    $$f(x) = \frac{1}{1 + x^2}: \qquad |f^{(n+1)}(x)| \approx 2^nn!\,O\bigl(|x|^{-n-2}\bigr).$$
    ${widget('interpolation-error', {}, 'Beispiel 18.4: sin(2x) lässt sich auch äquidistant hervorragend interpolieren. Bei Runges Funktion wird der Fehler mit wachsendem Grad immer größer – mit Tschebyscheff-Stützstellen dagegen nicht.')}
    ${box('merke', 'Bemerkung 18.3', list([
      tx`Kein Widerspruch zum <strong>Approximationssatz von Weierstraß</strong> (jede stetige Funktion ist beliebig gut gleichmäßig durch Polynome approximierbar): Dort geht es um Approximation, nicht um Interpolation in fest vorgegebenen Punkten.`,
      'Polynome hohen Grades verlangen hohe Differenzierbarkeit (und beschränkte Ableitungen) von f.',
      'Abhilfe: nichtäquidistante Stützstellen (Tschebyscheff) oder stückweise Polynome niedrigen Grades (Splines, Vorlesung 21).',
    ]))}
    <h3>Horner-Schema</h3>
    <p>Polynome in Monomdarstellung wertet man stabil und mit nur $n$ Multiplikationen aus, indem man ausklammert:
      $a_3x^3 + a_2x^2 + a_1x + a_0 = ((a_3x + a_2)x + a_1)x + a_0$.</p>
    ${code(`
// Horner-Schema: b_n = a_n,  b_k = a_k + x * b_{k+1},  p(x) = b_0
double horner (const std::vector<double>& a, double x)
{
  double b = a.back();
  for (int k=a.size()-2; k>=0; --k) b = a[k] + x*b;
  return b;
}`)}
  `,
};

const differentiation = {
  id: 'numerische-differentiation',
  title: '18.2 Numerische Differentiation',
  body: tx`
    ${lead(`Ableitung einer Funktion, die man nur auswerten kann? Interpoliere und leite das Polynom ab. Das ist einfach –
      aber Rundungsfehler machen kleine Schrittweiten gefährlich.`)}
    <p>Idee: Interpolationspolynom zu einigen Stützstellen aufstellen, ableiten, auswerten. Wählt man Polynomgrad = Ableitungsordnung $n$, so ist mit
      $L_i^{(n)}(x) = \lambda_i(x^n + \dots)$, $\lambda_i = \prod_{j\neq i}(x_i - x_j)^{-1}$:</p>
    $$\frac{d^n}{dx^n}p(x) = n!\sum_{i=0}^ny_i\lambda_i \qquad\text{(konstant)}.$$
    ${box('satz', '18.5', tx`Für $f \in C^n[a, b]$ und $a = x_0 < \dots < x_n = b$ gibt es ein $\xi \in (a, b)$ mit $f^{(n)}(\xi) = n!\sum_iy_i\lambda_i$.
      ${proof(tx`$e = f - p$ hat $n + 1$ Nullstellen, also hat $e^{(n)}$ nach Rolle mindestens eine Nullstelle $\xi$: $0 = f^{(n)}(\xi) - n!\sum_iy_i\lambda_i$.`)}`)}
    <p>Für äquidistante Stützstellen $x_i = x_0 + ih$ ist $\lambda_i = \frac{(-1)^{n-i}}{h^nn!}\binom ni$ und damit $f^{(n)}(x) \approx \frac{1}{h^n}\sum_i(-1)^{n-i}\binom niy_i$, insbesondere</p>
    $$f'(x) \approx \frac{y_1 - y_0}{h}, \qquad f''(x) \approx \frac{y_2 - 2y_1 + y_0}{h^2}, \qquad f'''(x) \approx \frac{y_3 - 3y_2 + 3y_1 - y_0}{h^3}.$$
    <p>Mit höherem Polynomgrad als Ableitungsordnung ($m = 1$, $n = 2$) erhält man den <strong>zentralen Differenzenquotienten</strong> $p'(x_1) = \frac{y_2 - y_0}{2h}$. Per Taylor:</p>
    $$f'(x) = \frac{f(x+h) - f(x-h)}{2h} + O(h^2), \qquad f''(x) = \frac{f(x+h) - 2f(x) + f(x-h)}{h^2} + O(h^2).$$
    ${box('beispiel', '18.6', tx`Zweite Ableitung von $\sinh$ bei $x = 0{,}6$ (exakt $\sinh(0{,}6) = 0{,}6366535821482$): Für $h = 10^{-1}, 10^{-2}, 10^{-3}, 10^{-4}$ werden es 3, 5, 7, 8 korrekte Stellen.
      Dann kippt es: $h = 10^{-5}$ liefert nur noch 4–5 Stellen, $h = 10^{-6}$ drei, und $h = 10^{-10}$ ergibt $1{,}1\cdot10^4$ – <strong>völlig falsch</strong>.`)}
    ${widget('numerical-diff', {}, 'Die typische V-Form: Rechts dominiert der Abschneidefehler O(hᵖ), links die Auslöschung im Zähler, die durch hᵏ geteilt wird.')}
    ${box('merke', 'Fazit', list([
      'Numerische Differentiation ist sehr anfällig für Rundungsfehler: Im Zähler werden zwangsläufig fast gleiche Zahlen subtrahiert (Auslöschung, Vorlesung 3).',
      tx`Gute Schrittweiten liegen bei $h \approx \sqrt{\eps}\,(|x| + 1)$ für den Vorwärtsquotienten (allgemein $h \approx \eps^{1/(p+k)}$ für Ordnung $p$ und $k$-te Ableitung).`,
      'Abhilfe schafft die Extrapolation zum Limes (Vorlesung 19): Man rechnet mit mehreren moderaten h und extrapoliert auf h → 0.',
    ]))}
  `,
};

export default {
  id: 'vl18',
  number: 18,
  title: 'Interpolationsfehler und numerische Differentiation',
  summary: 'Fehlerformel der Polynominterpolation, Runge-Phänomen und Tschebyscheff-Stützstellen, Horner-Schema sowie Differenzenquotienten und ihre optimale Schrittweite.',
  sections: [fehler, differentiation],
};
