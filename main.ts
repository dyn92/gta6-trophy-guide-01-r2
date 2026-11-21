// Leonida Platinum Atlas — hand-in program for make.fun (gta6-trophy-guide-01).
//
// What this file does, in plain terms:
//   1. It works out where it lives and where the output folder is
//      (MAKEFUN_OUTPUT_DIR when set, otherwise /output).
//   2. It copies the finished static site from app/ and the captures from
//      screenshots/ into that output folder, untouched.
//   3. It asks the vendored make.fun library to summarise the output folder
//      into dossier.json, using the same caps the scorer applies, so the
//      hand-in fails here first if it would fail there.
//
// The site itself needs no building: app/ is plain HTML, CSS and JavaScript
// that a browser opens directly. Node 22 standard library only.
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const target = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(target, { recursive: true });

// The atlas pages and their data travel exactly as authored.
cpSync(join(repoRoot, 'app'), join(target, 'app'), { recursive: true });

// Captures are part of the hand-in; copy them when the folder is present.
const shotsSource = join(repoRoot, 'screenshots');
if (existsSync(shotsSource)) {
  cpSync(shotsSource, join(target, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate: dossier text budget, at most four captures
// of at most 256 KiB each, and the app-size limits.
const dossierText = buildDossier(target, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(target, 'dossier.json'), dossierText);

console.log(`Leonida Platinum Atlas handed in to ${target} (dossier.json written).`);
