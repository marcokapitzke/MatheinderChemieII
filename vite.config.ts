import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "MatheinderChemieII";
const inferredBase = repositoryName.endsWith(".github.io") ? "/" : `/${repositoryName}/`;
const assetVersion = process.env.VITE_ASSET_VERSION ?? "mc2-20260521";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? inferredBase,
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${assetVersion}-[hash].js`,
        chunkFileNames: `assets/[name]-${assetVersion}-[hash].js`,
        assetFileNames: `assets/[name]-${assetVersion}-[hash][extname]`
      }
    }
  },
  test: {
    globals: true,
    environment: "node"
  }
});
