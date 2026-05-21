# Feature Coverage Review

Diese Review prüft den Scope von Mathe in der (Bio-)Chemie II nach dem MECE-Prinzip: klar getrennte Fallgruppen, innerhalb des gewählten Grundstudiums-Scopes möglichst keine offensichtlichen Lücken. Ziel ist nicht ein universelles CAS, sondern ein robuster, didaktischer Standardumfang für Chemie, Biochemie, Physik und Mathematik für Naturwissenschaftler.

## Entscheidungsregel

Ein Fall wird nur ergänzt, wenn er fachlich relevant, mathematisch geschlossen, zuverlässig implementierbar, mit verständlichem Rechenweg darstellbar, gut testbar und ohne große neue Architektur integrierbar ist. Fälle mit hohem Risiko für falsche Allgemeinheit werden dokumentiert, aber nicht implementiert.

## 1. Vektorrechnung & Gram-Schmidt

### 1. Aktuell unterstützte Fallgruppen

- 2D- und 3D-Vektoren mit konsistenter Dimension.
- Addition und Subtraktion von `v1` und `v2`.
- Skalarmultiplikation `lambda v1` mit einstellbarem Skalar.
- Skalarprodukt, Norm, Einheitsvektoren, Winkel und Projektion.
- Kreuzprodukt für 3D-Vektoren.
- Gram-Schmidt-Orthonormalisierung mit Erkennung linear abhängiger Vektoren.
- 2D- und 3D-Visualisierung.

### 2. Erwartbare Standardfallgruppen für das Grundstudium

- Grundoperationen in R2 und R3.
- Projektionen, Winkel und Orthogonalität.
- Orthonormalisierung und lineare Unabhängigkeit.
- Geometrische Interpretation durch Pfeile und Projektionen.
- Basiswechsel und Koordinatendarstellungen als spätere Vertiefung.

### 3. Offensichtliche Lücken

- Skalarmultiplikation war fachlich naheliegend, aber nicht explizit im UI sichtbar.
- Konfigurierbarer Basiswechsel fehlt.
- Flächeninhalt/Volumen über Kreuz- und Spatprodukt fehlen.

### 4. Einschätzung

- Skalarmultiplikation: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Basiswechsel: didaktische Relevanz mittel, Implementierungsrisiko mittel, Scope-Explosion mittel.
- Spatprodukt: didaktische Relevanz mittel, Implementierungsrisiko niedrig, Scope-Explosion niedrig.

### 5. Entscheidung

- Skalarmultiplikation: jetzt implementieren.
- Basiswechsel: späteres Feature.
- Spatprodukt: dokumentieren, aber nicht implementieren.

### 6. Begründung

Skalarmultiplikation gehört zu den Grundoperationen eines Vektorraums und ist geschlossen, testbar und ohne Architekturänderung integrierbar. Basiswechsel benötigt mehr didaktische UI-Führung, damit die Ausgabe nicht wie eine bloße Rechenbox wirkt.

### 7. Hinzugefügte Tests

- `scale([3, -1], -2) = [-6, 2]`.

### 8. Hinzugefügte Beispielbuttons

- `Skalarmultiplikation`: `v1=(3,-1), v2=(1,2)` mit `lambda=-2`.

## 2. Matrizen und lineare Gleichungssysteme

### 1. Aktuell unterstützte Fallgruppen

- Matrizen bis 4x4.
- Matrixaddition, Matrixsubtraktion, Matrixmultiplikation und Skalarmultiplikation mit zweiter Matrix `B`.
- Determinante, Rang, Spur, Transposition und inverse Matrix.
- Eigenständiges LGS-Modul mit erweiterter Matrix `(A|b)` bis 6x6.
- REF und RREF mit deutscher Zeilenumformung `Z_i`.
- Exakte Bruchrechnung für rationale Eingaben.
- Klassifikation: eindeutige Lösung, keine Lösung, unendlich viele Lösungen inklusive Parameterdarstellung.
- 2x2-Geradenvisualisierung im LGS-Modul.

### 2. Erwartbare Standardfallgruppen für das Grundstudium

- Grundoperationen mit Matrizen.
- Lineare Abbildungen und Matrixprodukt als Verkettung.
- Lösbarkeit linearer Gleichungssysteme.
- Invertierbarkeit, Rang und Determinante.
- Einfache Eigenwertprobleme als spätere Vertiefung.

### 3. Offensichtliche Lücken

- Grundoperationen mit zweiter Matrix `B` waren in der Kernbibliothek vorhanden, aber nicht im UI nutzbar.
- Der frühere Matrixrechner war für LGS didaktisch zu knapp; diese Lücke wurde durch das eigene LGS-Modul geschlossen.
- Eigenwerte/Eigenvektoren fehlen bewusst.

### 4. Einschätzung

- Matrixoperationen mit `B`: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Eigenständiges LGS-Modul: didaktische Relevanz hoch, Implementierungsrisiko mittel, Scope-Explosion niedrig bis mittel.
- Eigenwerte/Eigenvektoren: didaktische Relevanz mittel bis hoch, Implementierungsrisiko hoch, Scope-Explosion hoch.

### 5. Entscheidung

- Matrixoperationen mit `B`: jetzt implementieren.
- LGS-Modul mit exakter Bruchrechnung und REF/RREF: jetzt implementieren.
- Eigenwerte/Eigenvektoren: dokumentieren, aber nicht implementieren.

### 6. Begründung

Addition, Subtraktion, Skalarmultiplikation und Matrixprodukt sind geschlossene Standardoperationen. Für lineare Gleichungssysteme ist ein eigener Rechner didaktisch sauberer: Die erweiterte Matrix, die deutschen Zeilenoperationen und die Lösungsklassifikation bleiben dadurch sichtbar, ohne den Matrixrechner zu überladen.

### 7. Hinzugefügte Tests

- Matrixsubtraktion.
- Skalarmultiplikation einer Matrix.
- LGS: eindeutige Lösung mit Brüchen, inkonsistentes System, unendlich viele Lösungen, augmentierte Matrix mit Trennstrich.
- Bestehende Tests für Addition, Multiplikation, Determinante, Inverse und Rang bleiben aktiv.

### 8. Hinzugefügte Beispielbuttons

- `Matrixprodukt`: `A = (1 2; 0 1)`, `B = (2 0; 1 3)`.
- Bestehende Matrixbeispiele setzen nun passende `B`-Matrizen.
- LGS-Beispiele: eindeutiges 2x2, klassisches 3x3, Bruchrechnung, unendlich viele Lösungen, keine Lösung, unterbestimmtes System und 4x4-Standardfall.

## 3. Mehrdimensionale Analysis

### 1. Aktuell unterstützte Fallgruppen

- Funktionen `f(x,y)` mit Fläche und Konturplot.
- Einfache `f(x,y,z)` als `z=0`-Schnitt.
- Partielle Ableitungen nach den erkannten Variablen.
- Gradient, Hesse-Matrix für `f(x,y)`.
- Richtungsableitung am Ursprung in Richtung `u = (1,1)/sqrt(2)`.
- Numerisches Doppelintegral über rechteckige Bereiche.
- Kritische Punktklassifikation am Ursprung für sichere Standardfälle.

### 2. Erwartbare Standardfallgruppen für das Grundstudium

- Partielle Ableitungen, Gradient und Richtungsableitung.
- Hesse-Matrix und lokale Klassifikation einfacher quadratischer Formen.
- Konturlinien und Flächenplot.
- Rechteckige Doppelintegrale.
- Allgemeinere Integrationsgebiete und Koordinatentransformationen als spätere Vertiefung.

### 3. Offensichtliche Lücken

- Richtungsableitung war fachlich naheliegend, aber nicht explizit vorhanden.
- Frei wählbarer Auswertungspunkt und frei wählbare Richtung fehlen.
- Allgemeine kritische Punktbestimmung außerhalb des Ursprungs fehlt.
- Polarkoordinaten und nichtrechteckige Integrationsgebiete fehlen.

### 4. Einschätzung

- Richtungsableitung am Ursprung: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Frei wählbarer Punkt/Richtung: didaktische Relevanz hoch, Implementierungsrisiko mittel, Scope-Explosion mittel.
- Allgemeine kritische Punkte: didaktische Relevanz hoch, Implementierungsrisiko hoch, Scope-Explosion hoch.
- Polarkoordinaten: didaktische Relevanz mittel, Implementierungsrisiko mittel, Scope-Explosion mittel.

### 5. Entscheidung

- Richtungsableitung am Ursprung: jetzt implementieren.
- Frei wählbarer Punkt/Richtung: späteres Feature.
- Allgemeine kritische Punktbestimmung: bewusst ablehnen für den aktuellen Scope.
- Polarkoordinaten: dokumentieren, aber nicht implementieren.

### 6. Begründung

Die feste Richtungsableitung ergänzt Gradient und partielle Ableitungen didaktisch klar. Eine vollständig konfigurierbare Optimierungs- und Richtungsanalyse würde neue UI- und Validierungslogik erfordern und gehört nicht in diese robuste erste Version.

### 7. Hinzugefügte Tests

- Für `f(x,y)=x^2+y` gilt `D_u f(0,0)=1/sqrt(2)` mit `u=(1,1)/sqrt(2)`.

### 8. Hinzugefügte Beispielbuttons

- `Richtungsableitung`: `f(x,y)=x^2+y`.

## 4. Gewöhnliche Differentialgleichungen

### 1. Aktuell unterstützte Fallgruppen

- Exponentielles Wachstum/Zerfall `y'=k y`.
- Umgestellte lineare DGLs erster Ordnung mit konstanten Koeffizienten, z. B. `2y + y' = 3`.
- Direkt integrierbare konstante Ableitungen `y'=c`.
- Lineare DGL erster Ordnung mit konstanten Koeffizienten `y' + a y = b`.
- Logistisches Wachstum `y'=r y (1-y/K)`.
- Lineare homogene DGL zweiter Ordnung mit konstanten Koeffizienten `y'' + a y' + b y = 0`.
- Undämpfter harmonischer Oszillator in Kurzform `y'' + omega^2 y = 0`.
- Konstant erzwungene lineare DGLs zweiter Ordnung mit konstanten Koeffizienten, wenn `b != 0`.
- Einzelne inhomogene Resonanzfälle `y'' + y = sin(x)` und `y'' + y = cos(x)`.

### 2. Erwartbare Standardfallgruppen für das Grundstudium

- Wachstum, Zerfall, Relaxation und Sättigung.
- Lineare DGLs erster Ordnung mit konstanten Koeffizienten.
- Homogene lineare DGLs zweiter Ordnung.
- Harmonische Schwingung und gedämpfte Schwingung.
- Einfache erzwungene Schwingungen.

### 3. Offensichtliche Lücken

- Kurzform des harmonischen Oszillators ohne `0*y'` war nicht erkannt.
- Umgestellte lineare Gleichungen erster Ordnung wurden nicht zuverlässig in Standardform gebracht.
- Konstant erzwungene zweite Ordnung war nicht enthalten.
- Allgemeine trennbare DGLs fehlen.
- Lineare DGLs erster Ordnung mit variablem `p(x)` und `q(x)` fehlen.
- Allgemeine inhomogene DGLs zweiter Ordnung fehlen.

### 4. Einschätzung

- `y'' + omega^2 y = 0`: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Umgestellte lineare DGLs erster Ordnung: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- `y'=c`: didaktische Relevanz mittel, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Konstante rechte Terme zweiter Ordnung: didaktische Relevanz mittel, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Allgemeine trennbare DGLs: didaktische Relevanz hoch, Implementierungsrisiko mittel bis hoch, Scope-Explosion hoch.
- Variable Koeffizienten: didaktische Relevanz mittel, Implementierungsrisiko hoch, Scope-Explosion hoch.
- Allgemeine inhomogene 2. Ordnung: didaktische Relevanz mittel, Implementierungsrisiko hoch, Scope-Explosion hoch.

### 5. Entscheidung

- Harmonischer Oszillator in Kurzform: jetzt implementieren.
- Umstellung linearer erster Ordnung mit konstanten Koeffizienten: jetzt implementieren.
- Direkt integrierbare konstante Ableitungen: jetzt implementieren.
- Konstant erzwungene zweite Ordnung: jetzt implementieren.
- Allgemeine trennbare DGLs: späteres Feature, nur mit engen Mustern.
- Variable Koeffizienten: bewusst ablehnen für den aktuellen Scope.
- Allgemeine inhomogene 2. Ordnung: bewusst ablehnen.

### 6. Begründung

Die Kurzform `y'' + omega^2 y = 0` ist ein zentraler Standardfall in Physik und Chemie. Umgestellte lineare Gleichungen erster Ordnung sind ebenfalls Standard und werden durch Koeffizientenvergleich zuverlässig auf `y' + ay = b` gebracht. Konstante rechte Terme zweiter Ordnung erlauben eine geschlossene konstante Partikulärlösung.

### 7. Hinzugefügte Tests

- `y'' + 4*y = 0` liefert die harmonische Lösung mit `cos(2x)` und `sin(2x)`.
- `2*y + y' = 3` wird zu `y' + 2y = 3` normiert.
- `y' = 2` wird direkt integriert.
- `4*y + y'' = 0` wird als harmonischer Oszillator erkannt.
- `y'' + 2*y' + 2*y = 4` erhält eine konstante Partikulärlösung.

### 8. Hinzugefügte Beispielbuttons

- `Harmonischer Oszillator`: `y'' + 4*y = 0`.
- `Umgestellte Linearform`: `2*y + y' = 3`.
- `Konstante Steigung`: `y' = 2`.
- `Konstant erzwungen`: `y'' + 2*y' + 2*y = 4`.

## 5. Fourier-Transformation & Spektren

### 1. Aktuell unterstützte Fallgruppen

- Numerische Fourier-Darstellung für Gaußfunktionen.
- Breites und schmales Gaußsignal als Breite-Frequenz-Demonstration.
- Rechteckfunktion mit Sinc-artigem Spektrum.
- Dreiecksignal mit stärker gedämpften Nebenmaxima.
- Beidseitiger Exponentialabfall.
- Lorentz-artige Linie.
- Cosinus-Schwingung.
- Gedämpfte Schwingung.
- Zwei nahe Frequenzen.
- Interferogramm-zu-Spektrum-Simulation über diskrete Fourier-Transformation.

### 2. Erwartbare Standardfallgruppen für das Grundstudium

- Gauß, Rechteck, Dreieck, Exponentialabfall, Cosinus und gedämpfte Schwingung.
- Breite-Zeit- beziehungsweise Breite-Frequenz-Beziehung.
- Nahe Frequenzen und Auflösung.
- Linienformen mit Bezug zu Spektroskopie, insbesondere Lorentz-artige Linien.
- Rauschen, Apodisierung und Fensterung als spätere Vertiefung.

### 3. Offensichtliche Lücken

- Lorentz-artige Linie war für Spektroskopie naheliegend und noch nicht enthalten.
- Dreiecksignal, beidseitiger Exponentialabfall und Cosinus waren naheliegende Standardsignale.
- Rauschanteil und Apodisierung sind nur intern beziehungsweise noch nicht als UI-Regler verfügbar.
- Freie Funktions-Fouriertransformation fehlt bewusst.
- Symbolische Fourier-Transformation fehlt bewusst.

### 4. Einschätzung

- Lorentz-artige Linie: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Dreiecksignal: didaktische Relevanz mittel, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Beidseitiger Exponentialabfall: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Cosinus: didaktische Relevanz hoch, Implementierungsrisiko niedrig, Scope-Explosion niedrig.
- Rauschen/Apodisierung im UI: didaktische Relevanz mittel, Implementierungsrisiko mittel, Scope-Explosion mittel.
- Freie numerische Eingabe: didaktische Relevanz mittel, Implementierungsrisiko hoch, Scope-Explosion hoch.
- Symbolische Fourier-Transformation: didaktische Relevanz mittel, Implementierungsrisiko hoch, Scope-Explosion hoch.

### 5. Entscheidung

- Lorentz-artige Linie: jetzt implementieren.
- Dreiecksignal: jetzt implementieren.
- Beidseitiger Exponentialabfall: jetzt implementieren.
- Cosinus: jetzt implementieren.
- Rauschen/Apodisierung: späteres Feature.
- Freie numerische Eingabe: dokumentieren, aber nicht implementieren.
- Symbolische Fourier-Transformation: bewusst ablehnen.

### 6. Begründung

Lorentz-artige Linien, Dreiecksignale, beidseitiger Exponentialabfall und Cosinus-Schwingungen sind chemisch, physikalisch und signaltheoretisch relevant, geschlossen parametrisierbar und passen direkt in den bestehenden Standardfunktionen-Modus. Eine freie Fourier-Eingabe würde deutlich mehr Fehlermeldungen, Sampling-Checks und didaktische Warnungen benötigen.

### 7. Hinzugefügte Tests

- Lorentz-artige Linie besitzt im numerischen Spektrum ein zentrales Maximum.
- Dreiecksignal und beidseitiger Exponentialabfall besitzen ein zentrales Maximum im numerischen Spektrum.

### 8. Hinzugefügte Beispielbuttons

- `Lorentz-Linie`.
- `Dreiecksignal`.
- `Beidseitiger Exponentialabfall`.
- `Cosinus`.

## Zusammenfassung der Implementierten Review-Erweiterungen

- Vektoren: Skalarmultiplikation im UI und als Beispiel.
- Matrizen: zweite Matrix `B` mit Addition, Subtraktion, Produkt und Skalarmultiplikation.
- Mehrdimensionale Analysis: Richtungsableitung am Ursprung in Richtung `u=(1,1)/sqrt(2)`.
- DGL: harmonischer Oszillator in Kurzform `y'' + omega^2 y = 0`, umgestellte lineare DGLs erster Ordnung, konstante Ableitungen und konstant erzwungene DGLs zweiter Ordnung.
- Fourier: Lorentz-artige Linie, Dreiecksignal, beidseitiger Exponentialabfall und Cosinus als Standardfälle.

Diese Ergänzungen bleiben klein, robust und testbar. Größere Themen wie Eigenwerte, freie Fourier-Eingabe, allgemeine DGLs, beliebige kritische Punkte und Koordinatentransformationen werden bewusst nicht in den aktuellen Scope aufgenommen.
