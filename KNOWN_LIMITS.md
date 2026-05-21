# Known Limits

Mathe in der (Bio-)Chemie II ist eine stabile Version für Standardfälle. Die Website soll fachlich verlässlich, didaktisch klar und visuell hochwertig sein, aber kein universelles CAS ersetzen.

## Allgemein

- Numerische Ergebnisse sind Näherungen.
- Eingaben werden bewusst begrenzt; nicht unterstützte Fälle werden nicht geraten.
- Plotly- und Three.js-Visualisierungen laufen vollständig im Browser.
- WebGL kann auf sehr alten Geräten fehlen; die Hero-Animation besitzt einen Fallback.

## Vektoren

- Unterstützt werden 2D- und 3D-Vektoren.
- Gemischte Dimensionen werden abgelehnt.
- Skalarmultiplikation wird für `v1` mit einem einstellbaren Skalar gezeigt.
- Gram-Schmidt überspringt numerisch abhängige Vektoren.
- Basiswechsel und Spatprodukt sind noch nicht als eigene Workflows enthalten.
- 3D-Vektoren werden als Linien im Raum visualisiert; Pfeilspitzen sind bewusst reduziert.

## Matrizen und LGS

- Matrizen bis 4x4 werden unterstützt.
- Matrixaddition, Matrixsubtraktion und Matrixprodukt werden nur bei passenden Dimensionen angezeigt.
- Skalarmultiplikation wird numerisch dargestellt.
- Gauß-Jordan-Elimination arbeitet numerisch, nicht als exakter Bruchrechner.
- Eindeutige, keine und unendlich viele Lösungen werden über Rangbedingungen klassifiziert.
- Eigenwerte und Eigenvektoren sind bewusst nicht aktiviert.

## Mehrdimensionale Analysis

- f(x,y) wird mit Fläche, Kontur, partiellen Ableitungen, Gradient und Hesse-Matrix behandelt.
- f(x,y,z) wird als z=0-Schnitt visualisiert, nicht als echte 4D-Darstellung.
- Die Richtungsableitung wird aktuell als Standardfall am Ursprung in Richtung `u=(1,1)/sqrt(2)` gezeigt.
- Frei wählbare Punkte und Richtungen sind noch nicht aktiviert.
- Kritische Punkte werden nur in sicheren Standardfällen am Ursprung klassifiziert.
- Doppelintegrale werden über Rechteckbereiche numerisch approximiert.
- Allgemeine Integrationsgebiete und Koordinatentransformationen sind nicht unterstützt.

## Differentialgleichungen

- Unterstützt werden ausgewählte Standardformen: umgestellte lineare DGLs erster Ordnung mit konstanten Koeffizienten, y'=ky, y'=c, y'+ay=b, logistisches Wachstum, lineare homogene DGLs zweiter Ordnung mit konstanten Koeffizienten, der undämpfte harmonische Oszillator, konstante rechte Terme zweiter Ordnung und einzelne Resonanzfälle.
- Kein allgemeiner DGL-Solver.
- Allgemeine Variation der Konstanten für beliebige rechte Seiten ist nicht aktiviert.
- Anfangswerte werden für exemplarische Standardwerte gezeigt.

## Fourier

- Fourier-Standardfunktionen, Rechteck- und Dreiecksignale, beidseitiger Exponentialabfall, Cosinus-Schwingungen, Lorentz-artige Linien und Interferogramm-Simulationen werden numerisch visualisiert.
- Die Konvention ist `F(k)=∫ f(x) exp(-ikx) dx`.
- Freie symbolische Fourier-Transformationen sind nicht Teil dieses Rechners.
- Numerische Spektren hängen von Samplingfenster und Schrittweite ab.
