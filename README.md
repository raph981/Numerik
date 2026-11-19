# Numerik interaktiv

Interaktive Website zum Skript **„Einführung in die Numerik“** (P. Bastian, Universität Heidelberg).
Die Inhalte werden Schritt für Schritt erklärt und durch Visualisierungen und Experimente ergänzt,
die direkt im Browser nachrechnen.

Aktuell aufbereitet:

| Vorlesung | Inhalte | Interaktive Elemente |
|---|---|---|
| 1 – Einleitung | Aufgaben der Numerik, Wissenschaftliches Rechnen, Wachstumsmodell, Parameterschätzung (Interpolation, Ausgleichsgerade, Newton), Verdopplungszeiten | Heron-Iteration, Modellierungskreislauf, Wachstumsmodelle, Coronadaten, Vorhersage mit drei Schätzern, Verdopplungszeiten |
| 2 – Fließkommadarstellung | Exponentialreihe in float/double, Stellenwertsystem, F(β,r,s), Zahlenbereich und Abstände, IEEE 754, Rundung, Maschinengenauigkeit | Reihen-Experiment, Basis-Umrechner, Zahlenstrahl F(β,r,s), Abstände, IEEE-Bit-Editor, Rundungsarten, Rundungsfehler vs. eps |
| 3 – Rechnen mit Fließkommazahlen | Exakt gerundete Arithmetik, guard digits, Fehleraufspaltung, Taylor, Landau-Symbole, Verstärkungsfaktoren, Stabilität, quadratische Gleichung, Auslöschung | F(10,r)-Rechner mit Assoziativitätstest, Summationsreihenfolge, Taylor-Explorer, Konditions-Heatmap, x₁²−x₂² in zwei Varianten, p-q-Formel vs. Vieta, Auslöschung Stelle für Stelle |
| 4 – Analyse von Netzwerken | Hagen-Poiseuille, Kirchhoff’sche Gesetze, Knotenpotentialverfahren A = BᵀLB | Interaktives Rohrleitungsnetz mit animiertem Fluss und Matrizen B, L, A |
| 5 – Grundlagen der linearen Algebra | Vektor- und Matrixnormen, Normäquivalenz, Eigenwerte, Spektralradius, Skalarprodukt, Spektralnorm, positiv definite Matrizen | Einheitskugeln der p-Normen, Matrix als Abbildung des Einheitskreises, quadratische Formen |
| 6 – Kondition linearer Gleichungssysteme | Konditionszahl, Spektralkondition, Kondition vs. Determinante, Neumann-Lemma, Störungssatz | Geometrische Kondition: Geradenschnitt mit gestörten Lösungen, Schranke (6.4) vs. Beobachtung |
| 7 – Eliminationsverfahren | Rückwärtseinsetzen, Gauß-Elimination, Aufwand ⅔n³, Permutations- und Frobeniusmatrizen | Gauß-Elimination Schritt für Schritt (inkl. Pivotisierung und Matrixform), Aufwandsrechner |
| 8 – LU-Zerlegung | PAQ = LU, Voll-/Spaltenpivotisierung, kompakte Speicherung, Integralgleichungen (Kollokation) | LU-Zerlegung mit drei Pivotstrategien und Lösen per Vorwärts-/Rückwärtseinsetzen, Integralgleichung mit Kondition und Fehler in double/float |
| 9 – Rundungsfehleranalyse der LU-Zerlegung | Rückwärtsanalyse, Skalarprodukt, Dreieckssysteme, Sätze 9.3/9.4, Pivotisierung und Wachstumsfaktor | Skalarproduktfehler vs. n·eps, Wachstumsfaktor (Wilkinson-Matrix), Beispiel 9.8 in F(10, r) |
| 10 – Spezielle Gleichungssysteme | SPD-Matrizen, Cholesky, Diagonaldominanz, Bandmatrizen | Cholesky Schritt für Schritt, Besetzungsmuster und Fill-in |
| 11 – Nichtreguläre Systeme | Kleinste Quadrate, Normalengleichung, Gram-Schmidt, schmale QR-Zerlegung | Ausgleichsrechnung (Normalengleichung vs. QR), Gram-Schmidt geometrisch, klassisch vs. modifiziert |
| 12 – QR-Zerlegung | Householder-Spiegelungen, volle QR-Zerlegung, Implementierung, Anwendungen | Householder-Spiegelung in 2D, Householder-QR Schritt für Schritt |
| 13 – Iterative Verfahren | Fill-in, dünn besetzte Matrizen, Richardson/Jacobi/Gauß-Seidel, Schur-Form, Konvergenzsatz | Iterationspfade in der Ebene mit Spektralradius, Fill-in bei Pfeilmatrizen |
| 14 – Iterative Verfahren II | Konvergenzrate bei SPD, Vorkonditionierung, Gerschgorin, Energienorm, Abbruch, Aufwand | Gerschgorin-Kreise, Konvergenzraten am Poissonproblem (Prognose vs. Beobachtung) |
| 15 – Nichtlineare Gleichungen | Fixpunktform, Kontraktion, Banach’scher Fixpunktsatz, a-priori-/a-posteriori-Schranken | Spinnweb-Diagramm für drei Fixpunktformen, Relaxation für Kreis ∩ Ellipse mit Fehlerkreis |
| 16 – Newton-Verfahren | Jacobimatrix, Kontraktion über Ableitungen, Relaxation als Richardson, quadratische Konvergenz | Newton-Tangenten mit Stellenverdopplung, Newton in 2D, Einzugsgebiete |
| 17 – Polynominterpolation | Vandermonde, Lagrange-Basis, Newton-Basis, dividierte Differenzen, Neville | Lagrange-Basis interaktiv, Tableaus der dividierten Differenzen und des Neville-Schemas |
| 18 – Interpolationsfehler und numerische Differentiation | Fehlerformel, Runge-Phänomen, Horner, Differenzenquotienten | Runge vs. Tschebyscheff, Fehler der Differenzenquotienten (Beispiel 18.6) |
| 19 – Extrapolation zum Limes | Extrapolationsmethode, Elimination von Taylortermen, gerade Entwicklungen | Extrapolation mit Neville-Tableau bei h = 0 (in h oder h²) |
| 20 – Trigonometrische Interpolation | Einheitswurzeln, DFT, reelle Koeffizienten, Gibbs-Phänomen, FFT, Spektralanalyse | Einheitswurzeln, trigonometrische Interpolation mit Spektrum, FFT-Schmetterling mit Laufzeitmessung, Tiefpassfilter |
| 21 – Splines | Spline-Räume, kubische Splines (tridiagonales System), Fehler und Konvergenzordnung | Polynom vs. lineare/kubische Splines (Beispiel 21.5), Konvergenzordnungen (Beispiel 21.7) |
| 22 – Bernstein-Polynome und Bézier-Kurven | Bernstein-Basis, Approximationssatz, Bézier-Kurven, konvexe Hülle, de Casteljau | Bernstein-Basis und -Approximation, Bézier-Editor mit de-Casteljau-Konstruktion |

## Starten

Die Seite ist rein statisch (keine Build-Schritte, keine Abhängigkeiten). Wegen der ES-Module muss sie
über einen Webserver ausgeliefert werden:

```bash
npm start            # = python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Sie lässt sich unverändert z. B. über GitHub Pages veröffentlichen.

## Tests

Die numerischen Kernfunktionen sind ohne Browser testbar (Node ≥ 18):

```bash
npm test
```

Die Tests prüfen u. a., dass die Tabellen aus Beispiel 2.1, die Mengen aus Beispiel 2.3, die Rundungen
aus Beispiel 2.5, die Schranken aus Lemma 2.7, die Konditionszahl aus Beispiel 6.3 und die Elimination aus
Beispiel 7.4, die Konditionszahlen aus Beispiel 8.6 und das Rechnen in F(10, 4) aus Beispiel 9.8 sowie die Iterationszahlen aus
den Beispielen 16.1/16.10 exakt reproduziert werden.

## Aufbau

```
index.html               Seitengerüst
css/main.css             Gestaltung (Design-Tokens, Hell-/Dunkelmodus)
js/app.js                Navigation und Hash-Routing (#/vl1/abschnitt)
js/core/                 Infrastruktur ohne Fachlogik
  dom.js                 DOM-Helfer und Bedienelemente (Slider, Umschalter, Tabellen …)
  plot.js                schlanke SVG-Plotbibliothek (linear/logarithmisch)
  plane.js               Koordinatenebene mit gleichem Maßstab (Vektoren, Geraden, Kurven)
  math.js                Formelsatz mit KaTeX
  widgets.js             bindet Widget-Platzhalter in Seiten ein
js/lib/numerics/         reine, getestete Numerik-Funktionen (kein DOM)
js/data/                 Datensätze (Coronafälle)
js/widgets/              interaktive Visualisierungen, je eine Datei
js/content/              Vorlesungsinhalte, je eine Datei pro Vorlesung
  blocks.js              Bausteine: box(), proof(), exercise(), widget(), code() …
tests/                   Unit-Tests (node:test)
vendor/katex/            mitgelieferte KaTeX-Version (MIT-Lizenz)
```

Die Schichten hängen nur „nach unten“ voneinander ab:
`content → widgets → core + lib/numerics`. Die Numerik kennt kein DOM und ist dadurch einfach testbar.

## Erweitern

**Neue Vorlesung**

1. `js/content/vl03.js` nach dem Muster von `vl01.js` anlegen: ein Objekt mit `id`, `number`, `title`,
   `summary` und `sections` (jeweils `id`, `title`, `body`).
2. In `js/content/index.js` importieren, in `LECTURES` eintragen und aus `PLANNED_CHAPTERS` entfernen.

Navigation, Inhaltsverzeichnis und Vor/Zurück-Links entstehen automatisch.

**Neues Widget**

1. Rechenlogik als reine Funktion in `js/lib/numerics/` ablegen und in `tests/` testen.
2. `js/widgets/mein-widget.js` mit `export default function mount(element, props) { … }` anlegen.
3. In `js/widgets/index.js` registrieren.
4. Im Inhalt mit `widget('mein-widget', { …props }, 'Bildunterschrift')` einbinden.

Formeln werden in Inhalten als `$…$` bzw. `$$…$$` geschrieben; mit dem Template-Tag `tx` (= `String.raw`)
müssen Backslashes nicht verdoppelt werden.
