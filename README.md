# MathChem II

Interaktive deutschsprachige Begleitplattform zum zweiten Band des Buchprojekts. Die App ist als kostenlose GitHub-Pages-Website gebaut und läuft vollständig im Browser: React, Vite, TypeScript, KaTeX, Plotly, Three.js und browserbasierte mathematische Routinen.

## Module

- Vektorrechnung & Gram-Schmidt
- Matrizen & lineare Gleichungssysteme
- Mehrdimensionale Analysis
- Gewöhnliche Differentialgleichungen
- Fourier-Transformation & Spektren

Die Website übernimmt Layout, Farbwelt, Kartenlogik, Typografie und Interaktionsprinzipien von MathChem I, ist aber ein eigenständiges Projekt für `MatheinderChemieII`.

## Lokal starten

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Build

```bash
npm run build
```

Für GitHub Pages ist der Basepath:

```bash
VITE_BASE_PATH=/MatheinderChemieII/ npm run build
```

## Deployment

Der Workflow `.github/workflows/deploy.yml` baut bei Push auf `main`, führt die Tests aus und veröffentlicht `dist/` über GitHub Pages. In den Repository-Einstellungen muss GitHub Pages auf GitHub Actions als Source gestellt sein.

Ziel-URL:

```text
https://marcokapitzke.github.io/MatheinderChemieII/
```

## Mathematische Grenzen

Die Plattform ist kein universelles CAS. Unterstützt werden bewusst Standardfälle des zweiten Bandes. Nicht erkannte oder mathematisch unsichere Fälle werden abgelehnt statt geraten. Details stehen in [KNOWN_LIMITS.md](KNOWN_LIMITS.md) und [FEATURE_SCOPE.md](FEATURE_SCOPE.md).
