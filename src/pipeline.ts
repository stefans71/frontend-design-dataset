// pipeline.ts — Orchestrator: runs all stages in sequence with JST timestamps
// AutoDL: stages 1–2 (generate, render) — requires llama-server
// VPS:    stages 3–4 (critique, improve, package) — requires Codex CLI
import "dotenv/config";
import { generateAll } from "./generate.ts";
import { renderAll } from "./render.ts";
import { critiqueAll } from "./critique.ts";
import { improveAll } from "./improve.ts";
import { packageAll } from "./package-dataset.ts";

const testMode = process.env.TEST_MODE === "true";
const testCount = parseInt(process.env.TEST_COUNT ?? "3", 10);

function jst(): string {
  return new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function header(stage: string): void {
  const line = "─".repeat(60);
  console.log(`\n${line}`);
  console.log(`[${jst()}] ${stage}`);
  console.log(line);
}

// Stage 1 — Generate HTML (AutoDL)
header("Stage 1: Generate HTML components");
await generateAll();

// Stage 2 — Render screenshots (AutoDL)
header("Stage 2: Render screenshots");
await renderAll();

// Stage 3 — Critique via Codex (VPS)
header("Stage 3: Critique designs");
await critiqueAll();

// Stage 3b — Improve via Codex (VPS)
header("Stage 3b: Generate improved HTML");
await improveAll(testMode, testCount);

// Stage 4 — Package JSONL dataset (VPS)
header("Stage 4: Package dataset");
packageAll();

header("Pipeline complete");
