// score-validation.ts — Score fine-tuned vs base model outputs using Codex GPT-5.4
import { existsSync, readFileSync, writeFileSync } from "fs";

const PROMPTS_PATH = "output/validation/test-prompts.json";
const FINE_TUNED_DIR = "output/validation/fine-tuned";
const BASE_DIR = "output/validation/base";
const RESULTS_PATH = "output/validation/fine-tuned-scores.jsonl";

const CRITIQUE_PROMPT = `You are a senior product designer reviewing a UI component screenshot.

Provide a structured design critique covering:
1. Visual hierarchy — is the most important element immediately obvious?
2. Spacing & layout — consistent spacing system? Specific values that need changing?
3. Typography — weight contrast, size scale, readability
4. Color — contrast ratios, palette cohesion, WCAG AA accessibility
5. Component completeness — all states shown? (hover, disabled, loading, error, empty)
6. Production readiness — what would a senior designer change before shipping?

Score 1-10. Be specific — name exact measurements, not general advice.`;

interface TestPrompt {
  id: string;
  prompt: string;
  baseline_score: number;
  category: string;
  theme: string;
}

interface ScoreResult {
  id: string;
  category: string;
  theme: string;
  baseline_score: number;
  fine_tuned_score: number | null;
  base_score: number | null;
  delta: number | null;
  fine_tuned_critique: string;
  base_critique: string;
}

function extractCodexText(raw: string): string {
  const lines = raw.split("\n");
  const tokIdx = lines.findIndex((l) => l.trim() === "tokens used");
  if (tokIdx !== -1 && tokIdx + 2 <= lines.length) {
    return lines.slice(tokIdx + 2).join("\n").trim();
  }
  const codexIdx = lines.findLastIndex((l) => l.trim() === "codex");
  return (codexIdx !== -1 ? lines.slice(codexIdx + 1) : lines).join("\n").trim();
}

function extractScore(text: string): number | null {
  const patterns = [
    /Score[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i,
    /(\d+(?:\.\d+)?)\s*\/\s*10/,
    /Score[:\s]+(\d+(?:\.\d+)?)/i,
    /rating[:\s]+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*out of\s*10/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseFloat(match[1]!);
      if (score >= 1 && score <= 10) return score;
    }
  }
  return null;
}

async function scoreWithCodex(imagePath: string): Promise<{ text: string; score: number | null }> {
  const proc = Bun.spawn(
    [
      "codex",
      "exec",
      "-m",
      "gpt-5.4",
      "--dangerously-bypass-approvals-and-sandbox",
      "--ephemeral",
      CRITIQUE_PROMPT,
      "-i",
      imagePath,
    ],
    { stdout: "pipe", stderr: "ignore", stdin: "ignore" }
  );

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, 120_000);

  const raw = await new Response(proc.stdout).text();
  await proc.exited;
  clearTimeout(timer);

  if (timedOut) {
    console.warn(`  [timeout] ${imagePath}`);
    return { text: "", score: null };
  }

  const text = extractCodexText(raw);
  const score = extractScore(text);
  return { text, score };
}

async function main() {
  const prompts: TestPrompt[] = JSON.parse(readFileSync(PROMPTS_PATH, "utf-8"));
  const results: ScoreResult[] = [];

  // Load existing results to support resume
  const existing = new Map<string, ScoreResult>();
  if (existsSync(RESULTS_PATH)) {
    for (const line of readFileSync(RESULTS_PATH, "utf-8").trim().split("\n")) {
      try {
        const r = JSON.parse(line) as ScoreResult;
        existing.set(r.id, r);
      } catch {}
    }
    console.log(`[score-validation] Resuming — ${existing.size} already scored`);
  }

  const total = prompts.length;

  for (let i = 0; i < total; i++) {
    const p = prompts[i]!;

    if (existing.has(p.id)) {
      console.log(`[${i + 1}/${total}] ${p.id} — already scored, skipping`);
      results.push(existing.get(p.id)!);
      continue;
    }

    console.log(`[${i + 1}/${total}] Scoring ${p.id} (${p.category}, ${p.theme})...`);

    const fineTunedPng = `${FINE_TUNED_DIR}/${p.id}-desktop.png`;
    const basePng = `${BASE_DIR}/${p.id}-desktop.png`;

    if (!existsSync(fineTunedPng)) {
      console.warn(`  [missing] ${fineTunedPng}`);
    }
    if (!existsSync(basePng)) {
      console.warn(`  [missing] ${basePng}`);
    }

    console.log(`  Scoring fine-tuned...`);
    const ft = existsSync(fineTunedPng) ? await scoreWithCodex(fineTunedPng) : { text: "", score: null };
    console.log(`  Fine-tuned score: ${ft.score ?? "null"}`);

    console.log(`  Scoring base...`);
    const base = existsSync(basePng) ? await scoreWithCodex(basePng) : { text: "", score: null };
    console.log(`  Base score: ${base.score ?? "null"}`);

    const delta =
      ft.score !== null && base.score !== null ? ft.score - base.score : null;

    const result: ScoreResult = {
      id: p.id,
      category: p.category,
      theme: p.theme,
      baseline_score: p.baseline_score,
      fine_tuned_score: ft.score,
      base_score: base.score,
      delta,
      fine_tuned_critique: ft.text,
      base_critique: base.text,
    };

    results.push(result);

    // Write incrementally for resume support
    writeFileSync(
      RESULTS_PATH,
      results.map((r) => JSON.stringify(r)).join("\n") + "\n",
      "utf-8"
    );
    console.log(`  Delta: ${delta !== null ? (delta >= 0 ? "+" : "") + delta : "N/A"}`);
  }

  // Print comparison table
  console.log("\n" + "═".repeat(80));
  console.log("VALIDATION SCORING RESULTS — Fine-Tuned vs Base Model");
  console.log("═".repeat(80));
  console.log(
    `${"Component".padEnd(26)} ${"Category".padEnd(14)} ${"Theme".padEnd(7)} ${"Base".padStart(5)} ${"FT".padStart(5)} ${"Delta".padStart(6)}`
  );
  console.log("─".repeat(80));

  let ftTotal = 0;
  let baseTotal = 0;
  let ftCount = 0;
  let baseCount = 0;

  for (const r of results) {
    const ftStr = r.fine_tuned_score !== null ? String(r.fine_tuned_score) : "N/A";
    const baseStr = r.base_score !== null ? String(r.base_score) : "N/A";
    const deltaStr =
      r.delta !== null ? (r.delta >= 0 ? "+" : "") + r.delta : "N/A";
    console.log(
      `${r.id.padEnd(26)} ${r.category.padEnd(14)} ${r.theme.padEnd(7)} ${baseStr.padStart(5)} ${ftStr.padStart(5)} ${deltaStr.padStart(6)}`
    );
    if (r.fine_tuned_score !== null) { ftTotal += r.fine_tuned_score; ftCount++; }
    if (r.base_score !== null) { baseTotal += r.base_score; baseCount++; }
  }

  console.log("─".repeat(80));
  const ftAvg = ftCount > 0 ? (ftTotal / ftCount).toFixed(2) : "N/A";
  const baseAvg = baseCount > 0 ? (baseTotal / baseCount).toFixed(2) : "N/A";
  const avgDelta =
    ftCount > 0 && baseCount > 0
      ? ((ftTotal / ftCount - baseTotal / baseCount) >= 0 ? "+" : "") +
        (ftTotal / ftCount - baseTotal / baseCount).toFixed(2)
      : "N/A";

  console.log(
    `${"AVERAGE".padEnd(26)} ${"".padEnd(14)} ${"".padEnd(7)} ${String(baseAvg).padStart(5)} ${String(ftAvg).padStart(5)} ${String(avgDelta).padStart(6)}`
  );
  console.log("═".repeat(80));

  const ftBetter = results.filter((r) => r.delta !== null && r.delta > 0).length;
  const tied = results.filter((r) => r.delta !== null && r.delta === 0).length;
  const baseBetter = results.filter((r) => r.delta !== null && r.delta < 0).length;

  console.log(`\nFine-tuned beats base: ${ftBetter}/${total}`);
  console.log(`Tied: ${tied}/${total}`);
  console.log(`Base beats fine-tuned: ${baseBetter}/${total}`);
  console.log(
    `\nVerdict: ${
      Number(ftAvg) > Number(baseAvg)
        ? `Fine-tuned BETTER by ${avgDelta} points avg`
        : Number(ftAvg) < Number(baseAvg)
        ? `Base BETTER by ${Math.abs(Number(ftAvg) - Number(baseAvg)).toFixed(2)} points avg`
        : "TIED"
    }`
  );
  console.log(`\nResults written to: ${RESULTS_PATH}`);
}

if (import.meta.main) {
  await main();
}
