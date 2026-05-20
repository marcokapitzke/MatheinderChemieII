# GitHub Actions Workflow

Der folgende Workflow ist für automatisches GitHub-Pages-Deployment vorbereitet. GitHub akzeptiert Workflow-Dateien nur, wenn der pushende Token den Scope `workflow` besitzt. Sobald ein solcher Token verwendet wird, diese Datei als `.github/workflows/deploy.yml` speichern und pushen.

```yaml
name: Deploy MathChem II to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Test
        run: npm run test
      - name: Build
        run: npm run build
        env:
          VITE_BASE_PATH: /MatheinderChemieII/
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
