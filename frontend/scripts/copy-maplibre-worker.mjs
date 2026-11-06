import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// MapLibre expects its worker as a standalone asset. Keep the copy in
// `public/maplibre` in sync with the installed maplibre-gl version.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "node_modules", "maplibre-gl", "dist");
const target = join(root, "public", "maplibre");

mkdirSync(target, { recursive: true });

for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  const source = join(dist, file);
  if (!existsSync(source) || statSync(source).size === 0) continue;
  copyFileSync(source, join(target, file));
}
