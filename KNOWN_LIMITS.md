# Known Limits

MathChem II ist eine stabile Beta für Standardfälle. Die Website soll fachlich verlässlich, didaktisch klar und visuell hochwertig sein, aber kein universelles CAS ersetzen.

## Allgemein

- Numerische Ergebnisse sind Näherungen.
- Eingaben werden bewusst begrenzt; nicht unterstützte Fälle werden nicht geraten.
- Plotly- und Three.js-Visualisierungen laufen vollständig im Browser.
- WebGL kann auf sehr alten Geräten fehlen; die Hero-Animation besitzt einen Fallback.

## Vektoren

- Unterstützt werden 2D- und 3D-Vektoren.
- Gemischte Dimensionen werden abgelehnt.
- Gram-Schmidt überspringt numerisch abhängige Vektoren.
- 3D-Vektoren werden als Linien im Raum visualisiert; Pfeilspitzen sind in der Beta reduziert.

## Matrizen und LGS

- Matrizen bis 4x4 werden unterstützt.
- Gauß-Jordan-Elimination arbeitet numerisch, nicht als exakter Bruchrechner.
- Eindeutige, keine und unendlich viele Lösungen werden über Rangbedingungen klassifiziert.
- Eigenwerte und Eigenvektoren sind für diese Beta bewusst nicht aktiviert.

## Mehrdimensionale Analysis

- f(x,y) wird mit Fläche, Kontur, partiellen Ableitungen, Gradient und Hesse-Matrix behandelt.
- f(x,y,z) wird als z=0-Schnitt visualisiert, nicht als echte 4D-Darstellung.
- Kritische Punkte werden nur in sicheren Standardfällen am Ursprung klassifiziert.
- Doppelintegrale werden über Rechteckbereiche numerisch approximiert.
- Allgemeine Integrationsgebiete und Koordinatentransformationen sind nicht unterstützt.

## Differentialgleichungen

- Unterstützt werden ausgewählte Standardformen: y'=ky, y'+ay=b, logistisches Wachstum, lineare homogene DGLs zweiter Ordnung mit konstanten Koeffizienten und einzelne inhomogene Muster.
- Kein allgemeiner DGL-Solver.
- Anfangswerte werden in der Beta für exemplarische Standardwerte gezeigt.

## Fourier

- Fourier-Standardfunktionen und Interferogramm-Simulationen werden numerisch visualisiert.
- Die Konvention ist `F(k)=∫ f(x) exp(-ikx) dx`.
- Freie symbolische Fourier-Transformationen sind nicht Teil der Beta.
- Numerische Spektren hängen von Samplingfenster und Schrittweite ab.
