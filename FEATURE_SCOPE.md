# Feature Scope

## Priorität 1

- Landing Page im visuellen System von MathChem I
- Interaktives 3D-Wasserstoffatom mit WebGL-Fallback
- Vektorrechner mit Skalarmultiplikation, Norm, Skalarprodukt, Kreuzprodukt, Winkel, Projektion und Gram-Schmidt
- Matrix- und LGS-Rechner mit Matrixoperationen, Gauß-Elimination, Rang, Determinante, Inverser und 2D-Visualisierung
- Fourier-Visualizer für Standardfunktionen, Dreiecksignal, Exponentialabfall, Lorentz-Linie, Cosinus und Interferogramm-zu-Spektrum
- Tests, Build und GitHub-Pages-Workflow

## Priorität 2

- Mehrdimensionale f(x,y)-Visualisierung mit Fläche, Kontur, Gradient, Richtungsableitung, Hesse-Matrix und Doppelintegral
- DGL-Rechner für umstellbare Standardfälle erster Ordnung und ausgewählte Typen zweiter Ordnung
- Ausklappbare Rechenwege und Methodenerklärungen

## Priorität 3

- f(x,y,z) nur als z=0-Schnitt
- Eigenwerte/Eigenvektoren noch nicht aktiviert
- freie Fourier-Eingabe noch nicht aktiviert
- allgemeine DGL-, Integrations- und Optimierungsprobleme nicht enthalten

## Unterstützt Pro Modul

- Vektoren: 2D/3D-Eingabe, Addition/Subtraktion, Skalarmultiplikation, Projektionen, Gram-Schmidt, Abhängigkeitsfall.
- Matrizen: bis 4x4, Operationen mit zweiter Matrix, Matrixkennzahlen, LGS-Klassifikation, RREF und 2x2-Geradenplot.
- Mehrdimensionale Analysis: symbolische partielle Ableitungen, Gradient, feste Richtungsableitung am Ursprung, Hesse, numerische Fläche/Kontur, Rechteckintegral.
- DGL: klare Standardformen mit Lösungsansatz und Plot, inklusive umgestellter linearer DGLs erster Ordnung, konstanter Ableitungen, harmonischer Oszillator-Kurzform und konstant erzwungener DGLs zweiter Ordnung.
- Fourier: numerische Visualisierung bekannter Fourier-Paare, Dreiecksignale, beidseitigem Exponentialabfall, Lorentz-artigen Linien, Cosinus-Schwingungen und Spektralsimulation.

## Nicht Unterstützt

- universelle CAS-Vereinfachung
- beliebige Eigenwertprobleme
- freie Basiswechsel- und Spatprodukt-Workflows
- frei wählbare Richtungsableitungen an beliebigen Punkten
- allgemeine symbolische Mehrfachintegrale
- beliebige Differentialgleichungen
- allgemeine Variation der Konstanten für beliebige rechte Seiten
- allgemeine symbolische Fourier-Transformation
- hochdimensionale interaktive Volumenvisualisierung
