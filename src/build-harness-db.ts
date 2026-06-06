// build-harness-db.ts — Add Pi Harness V4.2C data to existing dataset.sqlite
// Usage: bun run src/build-harness-db.ts
// Reads: V4.2C HTML, v42c-scores.jsonl, v1-raw-scores.jsonl
// Modifies: webapp/data/dataset.sqlite (adds columns + updates rows)

import { Database } from "bun:sqlite";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const DB_PATH = "webapp/data/dataset.sqlite";
const HARNESS_DIR = "../pi-harness-stable/qwen-27b-dense-re-test-W-v2-pi-harness/condition-M-C-harness-v42";
const V42C_SCORES = "output/eval/v42c-scores.jsonl";
const V1_RAW_SCORES = "output/eval/v1-raw-scores.jsonl";

if (!existsSync(DB_PATH)) {
  console.error(`Database not found: ${DB_PATH}`);
  process.exit(1);
}

const db = new Database(DB_PATH);

// Add new columns (safe to re-run — ALTER TABLE IF NOT EXISTS via try/catch)
const newCols = [
  ["components", "pi_harness_html", "TEXT"],
  ["components", "has_pi_harness", "INTEGER DEFAULT 0"],
  ["eval_scores", "v1_raw_visual", "INTEGER"],
  ["eval_scores", "v1_raw_alignment", "INTEGER"],
  ["eval_scores", "v1_raw_interactivity", "INTEGER"],
  ["eval_scores", "v1_raw_total", "INTEGER"],
  ["eval_scores", "harness_visual", "INTEGER"],
  ["eval_scores", "harness_alignment", "INTEGER"],
  ["eval_scores", "harness_interactivity", "INTEGER"],
  ["eval_scores", "harness_total", "INTEGER"],
];

for (const [table, col, type] of newCols) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
    console.log(`Added ${table}.${col}`);
  } catch {
    // Column already exists
  }
}

// Helper: extract component dir name from score path
function extractDirName(path: string): string {
  return path.split("/").pop() ?? "";
}

// Load V4.2C harness HTML
let harnessLoaded = 0;
if (existsSync(HARNESS_DIR)) {
  const dirs = readdirSync(HARNESS_DIR)
    .filter((d) => /^component-\d+-run\d+$/.test(d))
    .sort();

  const stmt = db.prepare(
    "UPDATE components SET pi_harness_html = ?, has_pi_harness = 1 WHERE id = ?"
  );

  for (const dir of dirs) {
    const htmlPath = join(HARNESS_DIR, dir, "harness-output.html");
    if (!existsSync(htmlPath)) continue;

    const html = readFileSync(htmlPath, "utf-8");
    const result = stmt.run(html, dir);
    if (result.changes > 0) harnessLoaded++;
  }
  console.log(`Pi Harness HTML loaded: ${harnessLoaded}`);
} else {
  console.warn(`Harness dir not found: ${HARNESS_DIR}`);
}

// Load V4.2C eval scores
let v42cScores = 0;
if (existsSync(V42C_SCORES)) {
  const stmt = db.prepare(`
    UPDATE eval_scores SET
      harness_visual = ?, harness_alignment = ?, harness_interactivity = ?, harness_total = ?
    WHERE component_id = ?
  `);

  for (const line of readFileSync(V42C_SCORES, "utf-8").trim().split("\n")) {
    try {
      const s = JSON.parse(line);
      const dir = extractDirName(s.component);
      const result = stmt.run(
        s.visualScore ?? null,
        s.alignmentScore ?? null,
        s.interactivityScore ?? null,
        s.total ?? null,
        dir
      );
      if (result.changes > 0) v42cScores++;
    } catch {}
  }
  console.log(`V4.2C scores loaded: ${v42cScores}`);
}

// Load V1 raw eval scores
let v1Scores = 0;
if (existsSync(V1_RAW_SCORES)) {
  const stmt = db.prepare(`
    UPDATE eval_scores SET
      v1_raw_visual = ?, v1_raw_alignment = ?, v1_raw_interactivity = ?, v1_raw_total = ?
    WHERE component_id = ?
  `);

  for (const line of readFileSync(V1_RAW_SCORES, "utf-8").trim().split("\n")) {
    try {
      const s = JSON.parse(line);
      const dir = extractDirName(s.component);
      const result = stmt.run(
        s.visualScore ?? null,
        s.alignmentScore ?? null,
        s.interactivityScore ?? null,
        s.total ?? null,
        dir
      );
      if (result.changes > 0) v1Scores++;
    } catch {}
  }
  console.log(`V1 raw scores loaded: ${v1Scores}`);
}

// Summary
const withHarness = db.prepare("SELECT COUNT(*) as n FROM components WHERE has_pi_harness = 1").get() as any;
const harnessAvg = db.prepare("SELECT AVG(harness_total) as avg FROM eval_scores WHERE harness_total IS NOT NULL").get() as any;
const v1Avg = db.prepare("SELECT AVG(v1_raw_total) as avg FROM eval_scores WHERE v1_raw_total IS NOT NULL").get() as any;
const codexAvg = db.prepare("SELECT AVG(total) as avg FROM eval_scores").get() as any;

console.log(`\nSummary:`);
console.log(`  Components with harness HTML: ${withHarness.n}`);
console.log(`  Avg scores — V1 Raw: ${v1Avg.avg?.toFixed(2)}, Codex/GPT-5.4: ${codexAvg.avg?.toFixed(2)}, V4.2C Harness: ${harnessAvg.avg?.toFixed(2)}`);
console.log(`  Database: ${DB_PATH}`);
