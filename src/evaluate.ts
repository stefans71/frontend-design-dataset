// evaluate.ts — Two-stage component quality evaluation
// Stage A: deterministic regex (CDN gate + visual score) — free, instant
// Stage B: claude -p subprocess scoring (alignment + context-aware interactivity, 5/batch)
// Stage C: filter dataset.jsonl → dataset-clean.jsonl
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";

const OUTPUT_DIR = "./output/assets/components";
const PRE_SCORES_PATH = "./output/eval/pre-scores.jsonl";
const SCORES_PATH = "./output/eval/scores.jsonl";
const SUMMARY_PATH = "./output/eval/eval-summary.json";
const DATASET_PATH = "./output/exports/dataset.jsonl";
const CLEAN_DATASET_PATH = "./output/exports/dataset-clean.jsonl";

const EXCLUDE_THRESHOLD = 6;
const STAGE_B_BATCH_SIZE = 5;


interface StageAResult {
  component: string;
  stage_a: "pass" | "fail" | "missing_files";
  skip: boolean;
  reason?: string;
  prompt?: string;
  hasScript?: boolean;
  hasHover?: boolean;
  colorCount?: number;
  hasMeasurement?: boolean;
  visualScore?: number;
  alignmentScore: number | null;
  interactivityScore: number | null;
  total: number | null;
  exclude: boolean | null;
  notes: string | null;
}

interface StageBScore {
  component: string;
  alignment: number;
  interactivity: number;
}

// ─── Stage A ────────────────────────────────────────────────────────────────

async function runStageA(): Promise<StageAResult[]> {
  const dirs = readdirSync(OUTPUT_DIR)
    .filter((name) => /^component-\d+-run\d+$/.test(name))
    .sort()
    .map((name) => `${OUTPUT_DIR}/${name}`);
  const results: StageAResult[] = [];

  let passed = 0;
  let failedCdn = 0;
  let failedShort = 0;
  let missingFiles = 0;

  for (const dir of dirs) {
    const htmlPath = `${dir}/improved.html`;
    const metaPath = `${dir}/metadata.json`;
    const componentName = dir;

    if (!existsSync(htmlPath) || !existsSync(metaPath)) {
      results.push({
        component: componentName,
        stage_a: "missing_files",
        skip: true,
        reason: "no_improved_html_or_metadata",
        alignmentScore: null,
        interactivityScore: null,
        total: null,
        exclude: null,
        notes: null,
      });
      missingFiles++;
      continue;
    }

    const html = readFileSync(htmlPath, "utf-8");
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));

    // Hard gate — check for actual external resource loading only
    // (not anchor hrefs, not UI placeholder URLs in content)
    const hasExternalDeps =
      /<script\b[^>]*\bsrc=["']https?:\/\/(?!via\.placeholder\.com)[^"']+["']/i.test(html) ||
      /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']https?:\/\/[^"']+["']/i.test(html) ||
      /<link\b[^>]*\bhref=["']https?:\/\/[^"']+["'][^>]*\brel=["']stylesheet["']/i.test(html) ||
      /@import\s+(?:url\(["']?|["'])https?:\/\/[^"')]+/i.test(html);

    if (hasExternalDeps) {
      results.push({
        component: componentName,
        stage_a: "fail",
        skip: true,
        reason: "cdn",
        alignmentScore: null,
        interactivityScore: null,
        total: null,
        exclude: true,
        notes: null,
      });
      failedCdn++;
      continue;
    }

    if (html.length < 500) {
      results.push({
        component: componentName,
        stage_a: "fail",
        skip: true,
        reason: "too_short",
        alignmentScore: null,
        interactivityScore: null,
        total: null,
        exclude: true,
        notes: null,
      });
      failedShort++;
      continue;
    }

    // Signals
    const hasScript = /<script\b[^>]*>[\s\S]*?document\./i.test(html);
    const hasHover = /:hover|:focus|transition/i.test(html);
    const colorMatches =
      html.match(/(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|var\(--)/gi) || [];
    const hasMeasurement = /\d+(px|rem|em|vh|vw|%)/i.test(html);

    // Visual score
    let visualScore = 1;
    if (colorMatches.length >= 3 && hasMeasurement) visualScore = 3;
    else if (colorMatches.length >= 1 || hasMeasurement) visualScore = 2;

    results.push({
      component: componentName,
      prompt: meta.prompt,
      stage_a: "pass",
      skip: false,
      hasScript,
      hasHover,
      colorCount: colorMatches.length,
      hasMeasurement,
      visualScore,
      alignmentScore: null,
      interactivityScore: null,
      total: null,
      exclude: null,
      notes: null,
    });
    passed++;
  }

  writeFileSync(PRE_SCORES_PATH, results.map((r) => JSON.stringify(r)).join("\n"));

  console.log(`\nStage A complete:`);
  console.log(`  Passed hard gate:    ${passed}`);
  console.log(`  Failed (CDN):        ${failedCdn}`);
  console.log(`  Failed (too short):  ${failedShort}`);
  console.log(`  Missing files:       ${missingFiles}`);

  const passing = results.filter((r) => !r.skip);
  const v1 = passing.filter((r) => r.visualScore === 1).length;
  const v2 = passing.filter((r) => r.visualScore === 2).length;
  const v3 = passing.filter((r) => r.visualScore === 3).length;
  console.log(`\nVisual score distribution (of ${passed} passing):`);
  console.log(`  Score 1: ${v1}`);
  console.log(`  Score 2: ${v2}`);
  console.log(`  Score 3: ${v3}`);

  return results;
}

// ─── Stage B ────────────────────────────────────────────────────────────────

function buildStageBPrompt(batch: StageAResult[]): string {
  const components = batch
    .map((c) => {
      const html = readFileSync(`${c.component}/improved.html`, "utf-8");
      return `Component: ${c.component}
Original prompt: ${c.prompt}
HTML source:
${html}
---`;
    })
    .join("\n\n");

  return `You are scoring HTML components for training data quality. For each component below, score two dimensions. Output one JSON line per component — nothing else, no explanation, no markdown, no code fences.

SCORING:

PROMPT ALIGNMENT (0-3):
  3 = HTML matches the requested component type exactly
  2 = Mostly correct, missing minor requested details
  1 = Wrong component type or major scope mismatch
  0 = Hallucinated garbage unrelated to the prompt

INTERACTIVITY QUALITY (0-3):
First determine if this component type inherently requires JavaScript interaction.

Interactive types (modal, dropdown, mobile navbar, tabs, accordion, carousel, command palette, date picker):
  3 = JS event listeners + CSS transitions working correctly
  2 = CSS hover/focus states only — partially implemented
  1 = Minimal or broken implementation
  0 = Static when interaction is clearly required

Display types (card, pricing table, hero section, footer, stat block, badge, testimonial, avatar, toast notification, form, button, navigation bar):
  3 = Correctly static AND has CSS hover/focus polish
  2 = Correctly static, missing CSS hover/focus polish
  1 = Broken JS attempted unnecessarily
  0 = Completely broken HTML structure

OUTPUT FORMAT — one JSON line per component, nothing else:
{"component": "<dir-name>", "alignment": <0-3>, "interactivity": <0-3>}

COMPONENTS TO SCORE:

${components}`;
}

// Normalize to bare "component-NNN-runX" — the LLM may strip path prefix
function normalizeComponent(name: string): string {
  const match = name.match(/component-\d+-run\d+/);
  return match ? match[0] : name;
}

function parseStageBOutput(text: string): StageBScore[] {
  const scores: StageBScore[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (
        typeof parsed.component === "string" &&
        typeof parsed.alignment === "number" &&
        typeof parsed.interactivity === "number"
      ) {
        scores.push({ ...parsed, component: normalizeComponent(parsed.component) } as StageBScore);
      }
    } catch {
      // skip malformed lines
    }
  }
  return scores;
}

async function runStageBBatch(batch: StageAResult[]): Promise<StageBScore[]> {
  const prompt = buildStageBPrompt(batch);

  let timedOut = false;
  const proc = Bun.spawn(["claude", "-p", prompt], {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });

  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, 300_000);

  const text = await new Response(proc.stdout).text();
  await proc.exited;
  clearTimeout(timer);

  if (timedOut) {
    throw new Error("Batch timed out after 300s");
  }

  return parseStageBOutput(text);
}

async function runStageB(stageAResults: StageAResult[]): Promise<StageAResult[]> {
  const toScore = stageAResults.filter((r) => !r.skip);
  console.log(`\nStage B: scoring ${toScore.length} components in batches of ${STAGE_B_BATCH_SIZE}...`);

  const scored = new Map<string, StageBScore>();
  const totalBatches = Math.ceil(toScore.length / STAGE_B_BATCH_SIZE);

  for (let i = 0; i < toScore.length; i += STAGE_B_BATCH_SIZE) {
    const batch = toScore.slice(i, i + STAGE_B_BATCH_SIZE);
    const batchNum = Math.floor(i / STAGE_B_BATCH_SIZE) + 1;
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}... `);

    let attempts = 0;
    while (attempts < 3) {
      try {
        const scores = await runStageBBatch(batch);
        for (const s of scores) scored.set(s.component, s);
        console.log(`done (${scores.length}/${batch.length} scored)`);
        break;
      } catch (err) {
        attempts++;
        if (attempts < 3) {
          process.stdout.write(`retry ${attempts}/3... `);
        } else {
          console.log(`failed after 3 attempts (${err})`);
        }
      }
    }
  }

  // Merge Stage B scores back (normalize key — LLM may strip path prefix)
  const merged = stageAResults.map((r) => {
    if (r.skip) return r;
    const b = scored.get(normalizeComponent(r.component));
    if (!b) {
      return { ...r, alignmentScore: null, interactivityScore: null, total: null, exclude: null, notes: "stage_b_failed" };
    }
    const total = (r.visualScore ?? 1) + b.alignment + b.interactivity;
    return {
      ...r,
      alignmentScore: b.alignment,
      interactivityScore: b.interactivity,
      total,
      exclude: total < EXCLUDE_THRESHOLD,
      notes: null,
    };
  });

  return merged;
}

// ─── Stage C — filter dataset ────────────────────────────────────────────────

function runStageC(finalResults: StageAResult[]): void {
  // Build set of excluded component dir names
  const excluded = new Set<string>();
  for (const r of finalResults) {
    if (r.exclude === true) excluded.add(r.component);
  }

  if (!existsSync(DATASET_PATH)) {
    console.log(`\nWarning: ${DATASET_PATH} not found — skipping Stage C`);
    return;
  }

  const lines = readFileSync(DATASET_PATH, "utf-8")
    .split("\n")
    .filter((l) => l.trim());

  const cleanLines: string[] = [];
  let dropped = 0;

  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      // Records use id like "component-003-run2_prompt_to_html" — extract dir
      const id: string = record.id ?? "";
      // Strip the record type suffix (last _word part after last underscore grouping)
      // Dir names are like "output/component-003-run2" or just "component-003-run2"
      const match = id.match(/^(component-\d+-run\d+)/);
      const dir = match ? `output/${match[1]}` : null;
      if (dir && excluded.has(dir)) {
        dropped++;
        continue;
      }
      cleanLines.push(line);
    } catch {
      cleanLines.push(line);
    }
  }

  writeFileSync(CLEAN_DATASET_PATH, cleanLines.join("\n"));
  console.log(`\nStage C complete:`);
  console.log(`  Original records:    ${lines.length}`);
  console.log(`  Dropped records:     ${dropped}`);
  console.log(`  Clean records:       ${cleanLines.length}`);
  console.log(`  Written to:          ${CLEAN_DATASET_PATH}`);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function writeSummary(finalResults: StageAResult[]): void {
  const totalComponents = finalResults.length;
  const missingFiles = finalResults.filter((r) => r.stage_a === "missing_files").length;
  const failedCdn = finalResults.filter((r) => r.reason === "cdn").length;
  const failedShort = finalResults.filter((r) => r.reason === "too_short").length;
  const stageBScored = finalResults.filter((r) => r.alignmentScore !== null).length;
  const excludedLowScore = finalResults.filter(
    (r) => r.exclude === true && r.stage_a === "pass"
  ).length;
  const excludedTotal = finalResults.filter((r) => r.exclude === true).length;

  const scoreDist: Record<string, number> = {};
  for (const r of finalResults) {
    if (r.total === null) continue;
    const key = String(r.total);
    scoreDist[key] = (scoreDist[key] ?? 0) + 1;
  }

  const cleanComponents = finalResults.filter((r) => r.exclude === false).length;

  const summary = {
    total_components: totalComponents,
    missing_files: missingFiles,
    stage_a_fail: failedCdn + failedShort,
    stage_b_scored: stageBScored,
    excluded_total: excludedTotal,
    excluded_breakdown: {
      cdn: failedCdn,
      too_short: failedShort,
      low_score: excludedLowScore,
    },
    score_distribution: scoreDist,
    clean_components: cleanComponents,
    estimated_clean_records: cleanComponents * 6,
  };

  writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
  console.log(`\nEval summary written to ${SUMMARY_PATH}`);
  console.log(`Clean components: ${cleanComponents} / ${totalComponents}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const stageAOnly = process.argv.includes("--stage-a-only");

  console.log("=== Evaluation Pass ===");
  console.log("Stage A — deterministic scoring...");
  const stageAResults = await runStageA();

  if (stageAOnly) {
    console.log("\n[--stage-a-only] Stopping after Stage A.");
    return;
  }

  console.log("\nStage B — LLM scoring (claude -p)...");
  const finalResults = await runStageB(stageAResults);

  writeFileSync(SCORES_PATH, finalResults.map((r) => JSON.stringify(r)).join("\n"));
  console.log(`\nScores written to ${SCORES_PATH}`);

  runStageC(finalResults);
  writeSummary(finalResults);

  console.log("\n=== Evaluation Pass Complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
