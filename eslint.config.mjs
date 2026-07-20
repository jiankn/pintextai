import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", ".open-next/**", ".wrangler/**", ".browser-audit/**", "node_modules/**", "cloudflare-env.d.ts"]),
]);
