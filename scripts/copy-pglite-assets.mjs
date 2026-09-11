#!/usr/bin/env node
/**
 * Nitro/Vercel sometimes bundles @electric-sql/pglite into `_libs/` without
 * copying pglite.data / wasm beside it → ENOENT /var/task/_libs/pglite.data.
 * Copy those assets next to the server function after `vite build`.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

function copyInto(destDir) {
  if (!existsSync(destDir)) return false;
  mkdirSync(destDir, { recursive: true });
  let n = 0;
  for (const f of files) {
    const from = join(srcDir, f);
    if (!existsSync(from)) continue;
    copyFileSync(from, join(destDir, f));
    n += 1;
  }
  return n > 0;
}

const candidates = [
  join(root, ".vercel/output/functions/__server.func/_libs"),
  join(root, ".vercel/output/functions/__server.func"),
];

// Also scan for any __server.func folder under .vercel/output
try {
  const fnRoot = join(root, ".vercel/output/functions");
  if (existsSync(fnRoot)) {
    for (const name of readdirSync(fnRoot)) {
      candidates.push(join(fnRoot, name));
      candidates.push(join(fnRoot, name, "_libs"));
    }
  }
} catch {
  /* ignore */
}

if (!existsSync(srcDir)) {
  console.warn("[copy-pglite-assets] pglite dist missing — skip");
  process.exit(0);
}

let ok = false;
for (const dest of [...new Set(candidates)]) {
  if (copyInto(dest)) {
    console.log("[copy-pglite-assets] copied into", dest);
    ok = true;
  }
}
if (!ok) {
  console.warn("[copy-pglite-assets] no Vercel function dir found yet — ok if not vercel build");
}
