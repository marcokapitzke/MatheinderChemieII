# Mathe in der (Bio-)Chemie II

Interaktive deutschsprachige Begleitplattform zum zweiten Band des Buchprojekts. Die App ist als kostenlose GitHub-Pages-Website gebaut und läuft vollständig im Browser: React, Vite, TypeScript, KaTeX, Plotly, Three.js und browserbasierte mathematische Routinen.

## Module

- Vektorrechnung & Gram-Schmidt
- Matrizen
- Lineare Gleichungssysteme
- Mehrdimensionale Analysis
- Gewöhnliche Differentialgleichungen
- Fourier-Transformation & Spektren

Die Website übernimmt Layout, Farbwelt, Kartenlogik, Typografie und Interaktionsprinzipien von Band I, ist aber ein eigenständiges Projekt für `MatheinderChemieII`.

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

Die veröffentlichte Version wird aktuell über den Branch `gh-pages` ausgeliefert. GitHub Pages ist auf `gh-pages` mit Pfad `/` konfiguriert.

Ein GitHub-Actions-Workflow ist vorbereitet, konnte aber mit dem vorhandenen Token nicht direkt ins Repository gepusht werden, weil GitHub dafür den Token-Scope `workflow` verlangt. Die lokal vorbereitete Datei liegt unter `.github/workflows/deploy.yml`; eine kopierbare Fassung steht in [GITHUB_ACTIONS_WORKFLOW.md](GITHUB_ACTIONS_WORKFLOW.md).

Ziel-URL:

```text
https://marcokapitzke.github.io/MatheinderChemieII/
```

## Mathematische Grenzen

Die Plattform ist kein universelles CAS. Unterstützt werden bewusst Standardfälle des zweiten Bandes. Nicht erkannte oder mathematisch unsichere Fälle werden abgelehnt statt geraten. Details stehen in [KNOWN_LIMITS.md](KNOWN_LIMITS.md), [FEATURE_SCOPE.md](FEATURE_SCOPE.md) und [FEATURE_COVERAGE_REVIEW.md](FEATURE_COVERAGE_REVIEW.md).
