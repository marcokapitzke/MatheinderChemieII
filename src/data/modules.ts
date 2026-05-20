export type RouteId = "home" | "vectors" | "matrices" | "multivar" | "odes" | "fourier";

export interface ModuleCard {
  id: Exclude<RouteId, "home">;
  title: string;
  eyebrow: string;
  description: string;
  chapter: string;
  formula: string;
}

export const modules: ModuleCard[] = [
  {
    id: "vectors",
    title: "Vektorrechnung & Gram-Schmidt",
    eyebrow: "Vektorräume",
    description: "Vektoroperationen, Projektionen, Winkel und Orthonormalisierung mit Schrittfolge.",
    chapter: "Band II: Vektoren und Skalarprodukte",
    formula: "\\operatorname{proj}_{\\vec{u}}(\\vec{v})=\\frac{\\vec{v}\\cdot\\vec{u}}{\\vec{u}\\cdot\\vec{u}}\\vec{u}"
  },
  {
    id: "matrices",
    title: "Matrizen & lineare Gleichungssysteme",
    eyebrow: "Lineare Algebra",
    description: "Matrixrechnung, Determinanten, Rang, inverse Matrizen und Gauß-Elimination.",
    chapter: "Band II: Matrizen und lineare Systeme",
    formula: "\\mathbf{A}\\,\\vec{x}=\\vec{b}"
  },
  {
    id: "multivar",
    title: "Mehrdimensionale Analysis",
    eyebrow: "Funktionen mehrerer Variablen",
    description: "Gradient, Hesse-Matrix, Doppelintegrale, Flächen- und Konturvisualisierung.",
    chapter: "Band II: Mehrdimensionale Analysis",
    formula: "\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right)"
  },
  {
    id: "odes",
    title: "Gewöhnliche Differentialgleichungen",
    eyebrow: "Dynamische Systeme",
    description: "Standard-DGLs erster und zweiter Ordnung mit Lösungsansatz und Plot.",
    chapter: "Band II: Differentialgleichungen",
    formula: "y' = k\\,y"
  },
  {
    id: "fourier",
    title: "Fourier-Transformation & Spektren",
    eyebrow: "Spektralanalyse",
    description: "Didaktische Fourier-Paare, Interferogramme und Spektren für Chemie und Physik.",
    chapter: "Band II: Fourier-Transformation",
    formula: "F(k)=\\int f(x)\\,\\operatorname{exp}(-\\mathrm{i}kx)\\,\\mathrm{d}x"
  }
];

export const vectorExamples = [
  { label: "Standardbasis", value: "v1=(1,0), v2=(0,1)", note: "orthonormaler Referenzfall" },
  { label: "Nicht-orthogonale 2D-Basis", value: "v1=(2,1), v2=(1,2)", note: "Projektion und Winkel sichtbar" },
  { label: "Skalarmultiplikation", value: "v1=(3,-1), v2=(1,2)", scalar: -2, note: "λ v1 als gerichtete Streckung" },
  { label: "Drei 3D-Vektoren", value: "v1=(1,1,0), v2=(1,0,1), v3=(0,1,1)", note: "Gram-Schmidt im Raum" },
  { label: "Linear abhängig", value: "v1=(1,2,0), v2=(2,4,0), v3=(0,0,1)", note: "abhängiger Vektor wird erkannt" }
];

export const matrixExamples = [
  { label: "Eindeutig 2x2", matrix: "2,1; 1,3", matrixB: "1,0; 0,1", vector: "1; 2", note: "zwei Geraden mit Schnittpunkt" },
  { label: "Matrixprodukt", matrix: "1,2; 0,1", matrixB: "2,0; 1,3", vector: "1; 1", note: "A B als Verkettung linearer Abbildungen" },
  { label: "Eindeutig 3x3", matrix: "2,1,-1; -3,-1,2; -2,1,2", matrixB: "1,0,0; 0,1,0; 0,0,1", vector: "8; -11; -3", note: "klassisches Gauß-Beispiel" },
  { label: "Unendlich viele", matrix: "1,2; 2,4", matrixB: "0,1; 1,0", vector: "3; 6", note: "abhängige Gleichungen" },
  { label: "Keine Lösung", matrix: "1,2; 2,4", matrixB: "1,0; 0,1", vector: "3; 7", note: "inkonsistentes System" },
  { label: "Singulär", matrix: "1,2; 2,4", matrixB: "1,0; 0,1", vector: "3; 6", note: "keine inverse Matrix" },
  { label: "Diagonal", matrix: "3,0,0; 0,2,0; 0,0,-1", matrixB: "2,0,0; 0,1,0; 0,0,4", vector: "3; 4; -2", note: "Rang, Spur und Determinante klar" },
  { label: "Rotation", matrix: "0,-1; 1,0", matrixB: "0,1; -1,0", vector: "1; 1", note: "orthogonale 2D-Abbildung" }
];

export const multivarExamples = [
  { label: "Paraboloid", value: "x^2 + y^2", note: "Minimum und radiale Höhenlinien" },
  { label: "Sattel", value: "x^2 - y^2", note: "Hesse-Matrix mit gemischter Krümmung" },
  { label: "Richtungsableitung", value: "x^2 + y", note: "Gradient und Ableitung entlang u" },
  { label: "Gauß-Hügel", value: "exp(-(x^2+y^2))", note: "glatte chemienahe Dichtefunktion" },
  { label: "Wellenfläche", value: "sin(x)*cos(y)", note: "periodische Struktur" },
  { label: "3D-Feld", value: "x^2 + y^2 + z^2", note: "Gradient im Raum" }
];

export const odeExamples = [
  { label: "Wachstum", value: "y' = 0.4*y", note: "exponentielle Standardlösung" },
  { label: "Zerfall", value: "y' = -0.5*y", note: "typischer Relaxationsprozess" },
  { label: "Umgestellte Linearform", value: "2*y + y' = 3", note: "wird zu y' + 2y = 3 normiert" },
  { label: "Konstante Steigung", value: "y' = 2", note: "direkt integrierbarer Standardfall" },
  { label: "Logistisch", value: "y' = 0.8*y*(1-y/10)", note: "Sättigungsdynamik" },
  { label: "Linear inhomogen", value: "y' + 2*y = 3", note: "stationärer Grenzwert" },
  { label: "Harmonischer Oszillator", value: "y'' + 4*y = 0", note: "undämpfte Schwingung" },
  { label: "Konstant erzwungen", value: "y'' + 2*y' + 2*y = 4", note: "partikuläre Konstante" },
  { label: "Doppelte Nullstelle", value: "y'' + 2*y' + y = 0", note: "konstante Koeffizienten" },
  { label: "Erzwungener Oszillator", value: "y'' + y = sin(x)", note: "Resonanzfall als Standardform" }
];

export const fourierExamples = [
  { label: "Gaußfunktion", value: "gaussian", note: "Breite und Fourier-Breite koppeln invers" },
  { label: "Rechteckfunktion", value: "rect", note: "Sinc-Struktur im Spektrum" },
  { label: "Dreiecksignal", value: "triangle", note: "glattere Spektralflanken" },
  { label: "Beidseitiger Exponentialabfall", value: "two-sided-exp", note: "Lorentz-artiges Spektrum" },
  { label: "Lorentz-Linie", value: "lorentzian", note: "Spektrallinie mit breiten Flanken" },
  { label: "Cosinus", value: "cosine", note: "zwei symmetrische Frequenzanteile" },
  { label: "Gedämpfte Schwingung", value: "damped", note: "Peak mit Linienbreite" },
  { label: "Zwei nahe Frequenzen", value: "twofreq", note: "Auflösung durch Messbereich" },
  { label: "Breites Signal", value: "wide-gaussian", note: "schmalere Fourier-Verteilung" },
  { label: "Schmales Signal", value: "narrow-gaussian", note: "breiteres Spektrum" }
];
