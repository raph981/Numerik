/**
 * Vorlesung 1: Einleitung
 */
import { box, code, exercise, lead, list, proof, tx, widget } from './blocks.js';

const aufgaben = {
  id: 'aufgaben',
  title: '1.1 Grundlegende Aufgaben der Numerik',
  body: tx`
    ${lead(tx`Die Numerik berechnet <em>konkrete Zahlenwerte</em> – auch dann, wenn sich eine Lösung nicht als
      geschlossene Formel aufschreiben lässt.`)}
    <p>Typische Aufgaben der numerischen Mathematik sind</p>
    ${list([
      tx`das <strong>Auswerten</strong> mathematischer Ausdrücke, z.&nbsp;B. $x = \sqrt 2$ oder $I = \int_0^1 e^{z^2}\,dz$,`,
      tx`das <strong>Auflösen</strong> von Gleichungen, z.&nbsp;B. $x^2 e^x = 3$,`,
      tx`das <strong>Lösen von Differentialgleichungen</strong>, z.&nbsp;B. $\frac{dy}{dt}(t) = t\,y(t)$ mit $y(1) = 1$.`,
    ])}
    <p>Selbst wenn es eine geschlossene Darstellung gibt, enthält sie oft Funktionen, deren Werte nur
      näherungsweise berechenbar sind. Numerische Berechnungen sind daher immer mit <em>Fehlern</em>
      behaftet – deren Abschätzung und Kontrolle ist das zentrale Thema der <em>numerischen Analysis</em>.</p>

    <h3>Beispiel: Was ist eigentlich $\sqrt 2$?</h3>
    <p>$\sqrt 2$ ist zunächst nur ein Symbol für die positive Lösung von $x^2 = 2$. Mit endlich vielen
      Grundoperationen $+,-,\cdot,/$ und Zahlen mit endlich vielen Ziffern ist dieser Wert <em>nicht</em>
      berechenbar. Man kann aber eine Folge angeben, deren Glieder elementar berechenbar sind und gegen
      $\sqrt 2$ konvergieren:</p>
    $$x_{n+1} = \frac12\left(x_n + \frac{2}{x_n}\right), \qquad x_0 = 1.$$
    ${box('intuition', '', tx`Ist $x_n$ zu groß, dann ist $2/x_n$ zu klein (und umgekehrt). Der Mittelwert der beiden
      liegt näher an $\sqrt 2$. Diese Iteration ist das <strong>Newton-Verfahren</strong> für $f(x) = x^2 - 2$:
      $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)} = x_n - \frac{x_n^2 - 2}{2x_n}$.`)}
    ${widget('heron', { a: 2, x0: 1 }, 'Probieren Sie verschiedene Startwerte: Nach einer Anlaufphase verdoppelt sich die Zahl der korrekten Stellen in jedem Schritt (quadratische Konvergenz) – bis die Rechengenauigkeit von etwa 16 Stellen erreicht ist.')}
    <p>An diesem kleinen Beispiel lassen sich bereits die Leitfragen der gesamten Vorlesung stellen:</p>
    ${list([
      tx`Wie leitet man systematisch Iterationsverfahren zur Lösung von $f(x) = 0$ her?`,
      'Unter welchen Bedingungen konvergiert so ein Verfahren?',
      'Wie schnell konvergiert es?',
      'Wann kann man die Iteration abbrechen?',
      'Welchen Einfluss hat die endliche Zahlendarstellung im Computer?',
    ], true)}
  `,
};

const wissenschaftlichesRechnen = {
  id: 'wissenschaftliches-rechnen',
  title: '1.2 Wissenschaftliches Rechnen',
  body: tx`
    ${lead(`Neben Theorie und Experiment ist die Simulation zur dritten Säule der Wissenschaft geworden.
      Die Numerik ist ein Baustein in einer ganzen Kette von Modellierungsschritten.`)}
    <p>Simulationen ermöglichen undurchführbare Experimente (Galaxien, Klimawandel), sparen teure
      Experimente ein (Windkanal) oder erlauben die Abschätzung von Unsicherheiten (atomares Endlager).
      Klicken Sie sich durch die Stationen:</p>
    ${widget('modeling-cycle')}
    <p>Am Ende stimmen Simulation und Messung fast nie exakt überein. Dann stellen sich die Fragen:
      Welche Unterschiede sind akzeptabel? Woher kommen sie? Wie kann man sie reduzieren?</p>
    ${box('merke', 'Vier Fehlerquellen', list([
      '<strong>Modellfehler</strong> – ein relevanter Prozess wurde nicht oder ungenau modelliert.',
      '<strong>Datenfehler</strong> – Anfangs-, Randbedingungen und Parameter sind gemessen und damit ungenau.',
      '<strong>Abschneidefehler</strong> – Abbruch von Reihen oder Iterationen, diskrete statt kontinuierliche Zeit.',
      '<strong>Rundungsfehler</strong> – reelle Zahlen werden im Rechner nur genähert dargestellt.',
    ], true) + '<p>Mit den beiden letzten beschäftigt sich die Numerik ausführlich.</p>')}
  `,
};

const wachstum = {
  id: 'wachstumsmodell',
  title: '1.3.1 Ein Wachstumsmodell',
  body: tx`
    ${lead(`Als durchgehendes Beispiel betrachten wir die Ausbreitung des Coronavirus im Frühjahr 2020.
      Wir bauen dafür das einfachste denkbare Modell.`)}
    <p>Sei $N(t) \in \N_0$ die Zahl der Infizierten zur Zeit $t \ge t_0$. Als ersten
      Abstraktionsschritt ersetzen wir $N$ durch eine Funktion $u(t) \in \R$. Das wirkt seltsam – eine Person
      ist entweder infiziert oder nicht –, öffnet aber die Tür zu <em>Differentialgleichungen</em>. Bei großen
      Zahlen ist der relative Fehler durch nichtganze Werte klein.</p>

    <h3>Modellannahme</h3>
    <p><em>Die Änderung der Zahl der Infizierten im Zeitintervall $[t, t+\Delta t]$ ist proportional zur Zahl
      der Infizierten zur Zeit $t$ und zur Länge des Intervalls $\Delta t$:</em></p>
    $$u(t + \Delta t) = u(t) + \lambda\,\Delta t\, u(t). \tag{1.1}$$
    <p>Das ist plausibel, solange unbegrenzte Ressourcen für das Wachstum vorhanden sind (jede infizierte Person trifft
      stets neue, nicht infizierte Personen). $\lambda \in \R$ ist die <strong>Wachstumsrate</strong>.
      Umstellen und der Grenzübergang $\Delta t \to 0$ liefern</p>
    $$\frac{u(t+\Delta t) - u(t)}{\Delta t} = \lambda u(t) \quad\xrightarrow{\;\Delta t \to 0\;}\quad \frac{du}{dt}(t) = \lambda u(t). \tag{1.2}$$

    ${box('satz', '1.1', tx`Die Anfangswertaufgabe
      $$\frac{du}{dt}(t) = \lambda u(t), \qquad u(t_0) = u_0 \tag{1.3}$$
      besitzt die Lösung
      $$u(t) = u_0\, e^{\lambda (t - t_0)}. \tag{1.4}$$
      ${proof(tx`Einsetzen: $\frac{d}{dt} u_0 e^{\lambda(t-t_0)} = \lambda\, u_0 e^{\lambda(t-t_0)} = \lambda u(t)$
        und $u(t_0) = u_0 e^{\lambda\cdot 0} = u_0$.`)}`)}

    <p>Das Modell ignoriert vieles (begrenzte Ressourcen, räumliche Effekte), beschreibt aber z.&nbsp;B. das Wachstum der
      Weltbevölkerung 1700–1961 erstaunlich gut. Begrenzte Ressourcen berücksichtigt das <strong>logistische Modell</strong></p>
    $$\frac{du}{dt}(t) = \lambda\left(1 - \frac{u(t)}{K}\right) u(t)$$
    <p>mit der Umweltkapazität $K$ (<em>carrying capacity</em>): Für $u \ll K$ verhält es sich exponentiell,
      in der Nähe von $K$ kommt das Wachstum zum Erliegen.</p>

    ${widget('growth-model', {}, tx`Verkleinern Sie $\Delta t$: Die Punkte des diskreten Modells (1.1) nähern sich der exakten
      Lösung (1.4). Der verbleibende Unterschied ist ein typischer <em>Abschneidefehler</em>.`)}
  `,
};

const daten = {
  id: 'datenlage',
  title: '1.3.2 Die Datenlage',
  body: tx`
    ${lead(`Folgen die echten Fallzahlen tatsächlich einer Exponentialfunktion? Ein Trick mit dem Logarithmus
      macht das sichtbar.`)}
    <p>Gegeben sind die täglichen Fallzahlen $N_i = N(t_i)$, $i = 0, \dots, m-1$, ab dem 24.02.2020 mit
      $t_i = i$ (Zeiteinheit: Tag). <em>Würde</em> der Verlauf dem Gesetz (1.4) folgen, so gälte</p>
    $$\ln u_i = \ln u(t_i) = \ln u_0 + \lambda i,$$
    <p>d.&nbsp;h. die Logarithmen der Fallzahlen lägen auf einer <strong>Geraden</strong> mit Steigung $\lambda$.</p>
    ${widget('corona-data', {}, 'Abbildung 1.1: Infizierte in Deutschland ab dem 24.02.2020, linear und logarithmisch.')}
    ${box('merke', '', `Auf logarithmischer Skala wird exponentielles Wachstum zur Geraden. So erkennt man auf einen Blick,
      ob (und wann) ein Prozess exponentiell verläuft.`)}
    <details class="code-details"><summary>Daten in HDNum (C++) einlesen</summary>
    ${code(`
using Number = double;
using Vec = Vector<Number>;

// Corona Faelle Deutschland ab dem 24.2.2020
Vec N = {16, 18, 21, 26, 53, 66, 117, 150, 188, 240, /* ... */ 99225, 103228};
Vec t(N.size());
fill(t, 0.0, 1.0); // Zeitpunkt in Tagen
gnuplot("N.dat", tstring, N); // Ausgabe der Daten`)}
    </details>
  `,
};

const schaetzung = {
  id: 'parameterschaetzung',
  title: '1.3.3 Vorhersage und Parameterschätzung',
  body: tx`
    ${lead(tx`Für eine Vorhersage brauchen wir die Parameter $u_0$ und $\lambda$ des Modells. Wir lernen drei Wege
      kennen, sie aus Daten zu schätzen – und dabei gleich drei Grundaufgaben der Numerik.`)}
    <p>Die übliche Vorgehensweise besteht aus zwei Schritten:</p>
    ${list([
      '<strong>Parameterschätzung:</strong> Bestimmung der Modellparameter aus Literatur oder Messdaten.',
      '<strong>Auswertung:</strong> Berechnung des Modells mit diesen Parametern.',
    ], true)}
    <p>Da unser Modell in geschlossener Form vorliegt, ist die Auswertung nur das Berechnen von (1.4).
      Spannend ist das Schätzproblem.</p>

    <h3>Weg 1: Interpolation</h3>
    <p>Mit genau zwei Datenpunkten $(t_0, N_0)$, $(t_i, N_i)$ erhält man zwei Gleichungen für zwei Unbekannte:</p>
    $$\left.\begin{aligned} u_0 e^{\lambda\cdot 0} &= N_0 \\ u_0 e^{\lambda (t_i - t_0)} &= N_i \end{aligned}\right\}
      \quad\Rightarrow\quad u_0 = N_0, \qquad \lambda = \frac{\ln N_i - \ln N_0}{t_i - t_0}. \tag{1.5}$$
    <p>Die Kurve geht <em>exakt</em> durch beide Punkte – das nennt man <strong>Interpolation</strong>. Alle anderen Daten werden ignoriert.</p>
    ${exercise(tx`Erweitern Sie die Herleitung auf den Fall $u(t_i) = N_i$, $u(t_j) = N_j$, $j \neq i$.`,
      tx`Teilt man die beiden Gleichungen $u_0 e^{\lambda(t_i - t_0)} = N_i$ und $u_0 e^{\lambda(t_j - t_0)} = N_j$
      durcheinander, fällt $u_0$ heraus: $e^{\lambda(t_j - t_i)} = N_j / N_i$, also
      $$\lambda = \frac{\ln N_j - \ln N_i}{t_j - t_i}, \qquad u_0 = N_i\, e^{-\lambda (t_i - t_0)}.$$`)}

    <h3>Weg 2: Ausgleichsgerade (lineares Ausgleichsproblem)</h3>
    <p>Wir verlangen, dass die <em>Logarithmen</em> aller Datenpunkte auf einer Geraden liegen. Mit $U_0 = \ln u_0$ ergibt das</p>
    $$\underbrace{\begin{bmatrix} 1 & 0 \\ 1 & t_1 - t_0 \\ \vdots & \vdots \\ 1 & t_{m-1} - t_0 \end{bmatrix}}_{A}
      \underbrace{\begin{bmatrix} U_0 \\ \lambda \end{bmatrix}}_{x} =
      \underbrace{\begin{bmatrix} \ln N_0 \\ \ln N_1 \\ \vdots \\ \ln N_{m-1} \end{bmatrix}}_{b}. \tag{1.6}$$
    <p>Für $m > 2$ ist dieses lineare Gleichungssystem <em>überbestimmt</em> und hat in der Regel keine Lösung.
      Stattdessen machen wir den Fehler „so klein wie möglich“ und minimieren</p>
    $$J_\text{lin}(x) = \|Ax - b\|^2 = \sum_{i=0}^{m-1} \bigl(U_0 + (t_i - t_0)\lambda - \ln N_i\bigr)^2. \tag{1.7}$$
    <p>Das ist die <strong>Gauß'sche Ausgleichsrechnung</strong> (Methode der kleinsten Quadrate). Das Minimum erhält man
      (wie später gezeigt wird) als Lösung der <strong>Normalengleichung</strong></p>
    $$A^T A\, x = A^T b. \tag{1.8}$$
    ${box('intuition', '', tx`$A^TA$ ist hier nur eine $2\times 2$-Matrix: Aus vielen Gleichungen werden genau so viele
      Gleichungen, wie es Unbekannte gibt. Geometrisch wird $b$ orthogonal auf den Bildraum von $A$ projiziert.`)}
    <details class="code-details"><summary>Umsetzung in HDNum</summary>
    ${code(`
Vec linear_fit (const Vec& N, const Vec& t)
{
  Mat A(N.size(),2);                       // Erstelle die Matrix A
  for (int i=0; i<N.size(); ++i) {
    A[i][0] = 1.0; A[i][1] = t[i]-t[0];
  }
  Vec logN(N.size());                      // Erstelle die rechte Seite
  for (int i=0; i<N.size(); ++i) logN[i] = log(N[i]);

  Mat AT(A.transpose());                   // berechne Ausgleichsgerade
  Mat ATA(2,2); ATA.mm(AT,A);              // A^T*A
  Vec b(2); AT.mv(b,logN);                 // b = A^T * logN
  Vec p(2);
  linsolve(ATA,p,b);
  return p;
}`)}
    </details>

    <h3>Weg 3: Nichtlineares Ausgleichsproblem</h3>
    <p>Statt der Logarithmen passen wir direkt die Datenpunkte an, d.&nbsp;h. wir minimieren</p>
    $$J_\text{nl}(u_0, \lambda) = \sum_{i=0}^{m-1} \bigl(u_0 e^{\lambda (t_i - t_0)} - N_i\bigr)^2. \tag{1.9}$$
    <p>Notwendig für ein Minimum ist, dass die partiellen Ableitungen verschwinden. Mit $d_i = t_i - t_0$:</p>
    $$F(u_0, \lambda) = \begin{bmatrix}
        \sum_{i} (u_0 e^{\lambda d_i} - N_i)\, e^{\lambda d_i} \\
        \sum_{i} (u_0 e^{\lambda d_i} - N_i)\, d_i\, e^{\lambda d_i}
      \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix}.$$
    <p class="small">(Positive Faktoren wie $2$ bzw. $2u_0$ wurden weggelassen – sie ändern die Nullstellen nicht.)</p>
    <p>Dieses <em>nichtlineare</em> Gleichungssystem $F(x) = 0$, $x = (u_0, \lambda)^T$, lösen wir mit dem
      <strong>Newton-Verfahren</strong>:</p>
    $$x^{k+1} = x^k - \eta_k\, H^{-1}(x^k)\, F(x^k), \qquad
      H = \begin{bmatrix} \frac{\partial F_0}{\partial u_0} & \frac{\partial F_0}{\partial \lambda} \\[2pt]
      \frac{\partial F_1}{\partial u_0} & \frac{\partial F_1}{\partial \lambda} \end{bmatrix}. \tag{1.10}$$
    ${list([
      tx`$H$ ist die <strong>Jacobimatrix</strong> von $F$ (bzw. die Hessematrix von $J_\text{nl}$) – man braucht also zweite Ableitungen.
        Bei komplexen Modellen nutzt man dafür numerisches oder automatisches Differenzieren.`,
      tx`$\eta_k \in (0, 1]$ ist ein <strong>Dämpfungsfaktor</strong>: Bringt der volle Schritt keine Verbesserung, wird er halbiert.`,
      tx`Wichtig ist ein guter <strong>Startwert</strong> $x^0$ – hier verwenden wir das Ergebnis der Ausgleichsgerade.`,
    ])}

    <h3>Vergleich: Wer sagt die Zukunft am besten voraus?</h3>
    <p>Wie im Skript werden die Daten bis zum sechstletzten Tag zum Schätzen benutzt und die letzten fünf Tage vorhergesagt.
      Verschieben Sie den Schieberegler, um andere Zeiträume zu testen.</p>
    ${widget('parameter-fit', {}, 'Abbildung 1.2: Vorhersage mit den drei Schätzmethoden.')}
    ${exercise('Die Ausgleichsgerade überschätzt die Fallzahlen deutlich, der nichtlineare Schätzer liegt am besten – aber auch er überschätzt. Können Sie dieses Ergebnis erklären?',
      tx`<p><strong>Ausgleichsgerade:</strong> Sie minimiert Fehler der Logarithmen, also <em>relative</em> Fehler. Die frühen,
        kleinen Fallzahlen zählen genauso viel wie die späten. Anfangs war das Wachstum aber viel steiler – das treibt $\lambda$
        nach oben.</p>
      <p><strong>Interpolation:</strong> Nutzt nur den ersten und den letzten Punkt – die mittlere Steigung dazwischen.</p>
      <p><strong>Nichtlinearer Schätzer:</strong> Er minimiert <em>absolute</em> Fehler. Die großen, späten Werte dominieren die Summe,
        daher passt sich die Kurve vor allem den letzten Tagen an.</p>
      <p><strong>Alle</strong> überschätzen, weil die Maßnahmen ab dem 22. März das Wachstum gebremst haben. Ein Modell mit
        konstantem $\lambda$ ist dann schlicht falsch (Modellfehler!). Besser wäre eine zeitlich variable Rate $\lambda(t)$.</p>`)}
  `,
};

const verdopplung = {
  id: 'verdopplungszeiten',
  title: '1.3.4 Analyse der Verdopplungszeiten',
  body: tx`
    ${lead(tx`Haben die Maßnahmen gewirkt? Dazu lassen wir $\lambda$ von der Zeit abhängen und messen die Geschwindigkeit
      der Ausbreitung über die Verdopplungszeit.`)}
    <p>Die <strong>Verdopplungszeit</strong> $T_2$ ist die Zeitspanne, in der sich die Zahl der Infizierten verdoppelt:</p>
    $$u_0 e^{\lambda T_2} = 2 u_0 \quad\Rightarrow\quad T_2 = \frac{\ln 2}{\lambda}. \tag{1.11}$$
    <p>Über wenige Tage ist $\lambda$ näherungsweise konstant. Die Idee: Zum Zeitpunkt $t_k$ schätzt man $\lambda(t_k)$ mit dem
      nichtlinearen Verfahren aus den letzten $w$ Datenpunkten $(t_{k-w+1}, N_{k-w+1}), \dots, (t_k, N_k)$.
      $w$ heißt <strong>Fenstergröße</strong>.</p>
    <p>Eine naive Alternative ist $T_2 = k - \max\{\, i : N_i \le N_k / 2 \,\}$ – damit erhält man aber nur ganze Tage.</p>
    ${widget('doubling-time', {}, 'Abbildung 1.3: Verdopplungszeiten für verschiedene Fenstergrößen.')}
    ${box('beobachtung', '', list([
      'Innerhalb einer Woche nach Einleitung der Maßnahmen stieg die Verdopplungszeit von etwa 4 auf 7–8 Tage.',
      'Größere Fenster liefern glattere Verläufe, aber auch niedrigere Werte (sie „erinnern“ sich an die Vergangenheit).',
      'Die naive Methode ist nur bei annähernd exponentiellem Verlauf eine gute Näherung.',
    ]))}
  `,
};

const zusammenfassung = {
  id: 'zusammenfassung',
  title: '1.3.5 Ausblick & 1.4 Zusammenfassung',
  body: tx`
    <p>Das Wachstumsmodell ist sehr einfach und diente vor allem dazu, verschiedene numerische Methoden zu illustrieren.
      Die in den Medien oft genannte <em>Reproduktionszahl</em> ist ein Parameter des <strong>SIR-Modells</strong>
      (Kermack et al., 1927). Es betrachtet drei Funktionen – $S(t)$ (ansteckbar), $I(t)$ (infiziert) und $R(t)$
      (genesen bzw. verstorben) – gekoppelt über ein nichtlineares System von Differentialgleichungen.</p>
    ${box('merke', 'Zusammenfassung', list([
      'Numerik ist ein wesentliches Teilgebiet des Wissenschaftlichen Rechnens. Modelle und Simulationen erlauben, Hypothesen zu testen und Beobachtungen zu erklären.',
      'Parameterschätzung führt auf lineare bzw. nichtlineare Gleichungssysteme – typischerweise überbestimmt.',
      tx`Werkzeuge: <strong>Interpolation</strong>, <strong>Gauß'sche Ausgleichsrechnung</strong> ($A^TAx = A^Tb$) und das <strong>Newton-Verfahren</strong>.`,
      'Fehler entstehen auf allen Ebenen: Modell, Daten, Abschneiden und Runden.',
    ]))}
  `,
};

export default {
  id: 'vl1',
  number: 1,
  title: 'Einleitung',
  summary: 'Was ist Numerik? Vom Modell zur Simulation am Beispiel der Coronaausbreitung: Interpolation, Ausgleichsrechnung und Newton-Verfahren.',
  sections: [aufgaben, wissenschaftlichesRechnen, wachstum, daten, schaetzung, verdopplung, zusammenfassung],
};
