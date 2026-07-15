#!/usr/bin/env node
/**
 * Regenerates packages/shared/src/database.types.ts from Supabase.
 * Requires: supabase CLI, PROJECT_ID env var (or --project-id).
 *
 * Usage: pnpm gen:types
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectId = process.env.PROJECT_ID ?? process.argv[2];
const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "src", "database.types.ts");

if (!projectId) {
  console.error(
    "Missing PROJECT_ID. Set PROJECT_ID env or pass project ref as an argument.",
  );
  console.error("Example: PROJECT_ID=abcdefgh pnpm gen:types");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["supabase", "gen", "types", "typescript", "--project-id", projectId],
  { encoding: "utf-8", shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "Failed to generate types");
  process.exit(result.status ?? 1);
}

writeFileSync(outPath, result.stdout, "utf-8");
console.log(`Wrote ${outPath}`);
