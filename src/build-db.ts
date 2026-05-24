// build-db.ts — Build SQLite database from component dirs
// Usage: bun run build-db
// Creates: output/db/dataset.sqlite

import { Database } from "bun:sqlite";
import { readFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";

const DB_PATH = "output/db/dataset.sqlite";
const COMPONENTS_DIR = "output/assets/components";
const CONVERSATIONS_PATH = "output/exports/qualifying-conversations.jsonl";

mkdirSync("output/db", { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    prompt TEXT,
    temperature REAL,
    run TEXT,
    suffix TEXT,
    model TEXT,
    created_at TEXT,
    has_html INTEGER DEFAULT 0,
    has_improved INTEGER DEFAULT 0,
    has_desktop_png INTEGER DEFAULT 0,
    has_mobile_png INTEGER DEFAULT 0,
    has_critique INTEGER DEFAULT 0,
    component_html TEXT,
    critique_text TEXT,
    improved_html TEXT
  );

  CREATE TABLE IF NOT EXISTS eval_scores (
    component_id TEXT PRIMARY KEY,
    visual_score INTEGER,
    alignment_score INTEGER,
    interactivity_score INTEGER,
    total INTEGER,
    stage_a_pass INTEGER,
    FOREIGN KEY (component_id) REFERENCES components(id)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    type TEXT,
    domain TEXT,
    persona TEXT,
    turn_count INTEGER,
    messages_json TEXT,
    created_at TEXT
  );
`);

// Load eval scores indexed by component dir name
const scoresMap = new Map<string, any>();
const scoresPath = "output/eval/scores.jsonl";
if (existsSync(scoresPath)) {
  for (const line of readFileSync(scoresPath, "utf-8").trim().split("\n")) {
    try {
      const s = JSON.parse(line);
      // component field is like "./output/component-000-run0"
      const raw = s.component ?? "";
      const id = raw.replace(/^\.\/output\//, "").replace(/^output\//, "").replace(/^assets\/components\//, "").replace(/^component-/, "component-");
      // just extract the dir name
      const dirName = raw.split("/").pop() ?? "";
      scoresMap.set(dirName, s);
    } catch {}
  }
}

// Process component dirs
const dirs = readdirSync(COMPONENTS_DIR)
  .filter((d) => /^component-\d+-run\d+$/.test(d))
  .sort();

let inserted = 0;
for (const dir of dirs) {
  const dirPath = join(COMPONENTS_DIR, dir);
  const metaPath = join(dirPath, "metadata.json");
  if (!existsSync(metaPath)) continue;

  try {
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    const match = dir.match(/component-(\d+)-(run\d+)/);
    const run = match?.[2] ?? "unknown";

    const htmlPath = join(dirPath, "component.html");
    const critPath = join(dirPath, "critique.md");
    const impPath = join(dirPath, "improved.html");

    db.run(`INSERT OR REPLACE INTO components VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      dir,
      meta.prompt ?? "",
      meta.temperature ?? 0.7,
      run,
      meta.outputSuffix ?? run,
      meta.model ?? "qwen3.6-27b-mtp",
      meta.timestamp ?? "",
      existsSync(htmlPath) ? 1 : 0,
      existsSync(impPath) ? 1 : 0,
      existsSync(join(dirPath, "screenshot-desktop.png")) ? 1 : 0,
      existsSync(join(dirPath, "screenshot-mobile.png")) ? 1 : 0,
      existsSync(critPath) ? 1 : 0,
      existsSync(htmlPath) ? readFileSync(htmlPath, "utf-8") : null,
      existsSync(critPath) ? readFileSync(critPath, "utf-8") : null,
      existsSync(impPath) ? readFileSync(impPath, "utf-8") : null,
    ]);

    const score = scoresMap.get(dir);
    if (score) {
      db.run(`INSERT OR REPLACE INTO eval_scores VALUES (?,?,?,?,?,?)`, [
        dir,
        score.visualScore ?? score.visual_score ?? null,
        score.alignmentScore ?? score.alignment ?? null,
        score.interactivityScore ?? score.interactivity ?? null,
        score.total ?? null,
        score.skip ? 0 : 1,
      ]);
    }

    inserted++;
  } catch (e) {
    console.warn(`Skipping ${dir}:`, e);
  }
}

console.log(`Components inserted: ${inserted}`);

// Load conversation traces
if (existsSync(CONVERSATIONS_PATH)) {
  let convInserted = 0;
  for (const line of readFileSync(CONVERSATIONS_PATH, "utf-8").trim().split("\n")) {
    try {
      const c = JSON.parse(line);
      db.run(`INSERT OR REPLACE INTO conversations VALUES (?,?,?,?,?,?,?)`, [
        c.id ?? `conv-${Math.random()}`,
        c.type ?? "unknown",
        c.domain ?? null,
        c.persona ?? null,
        (c.messages ?? []).length,
        JSON.stringify(c.messages ?? []),
        new Date().toISOString(),
      ]);
      convInserted++;
    } catch {}
  }
  console.log(`Conversations inserted: ${convInserted}`);
}

// Summary
const stats = db.prepare("SELECT COUNT(*) as n FROM components").get() as any;
const withImproved = db.prepare("SELECT COUNT(*) as n FROM components WHERE has_improved=1").get() as any;
const withDesktop = db.prepare("SELECT COUNT(*) as n FROM components WHERE has_desktop_png=1").get() as any;
const avgScore = db
  .prepare("SELECT AVG(total) as avg, MIN(total) as min, MAX(total) as max FROM eval_scores")
  .get() as any;
const convCount = db.prepare("SELECT COUNT(*) as n FROM conversations").get() as any;

console.log(`\nDatabase summary:`);
console.log(`  Components:          ${stats.n}`);
console.log(`  With improved.html:  ${withImproved.n}`);
console.log(`  With desktop PNG:    ${withDesktop.n}`);
console.log(`  Eval scores — avg: ${avgScore.avg?.toFixed(2)}, min: ${avgScore.min}, max: ${avgScore.max}`);
console.log(`  Conversations:       ${convCount.n}`);
console.log(`  Saved to: ${DB_PATH}`);
