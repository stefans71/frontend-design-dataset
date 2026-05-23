// self-improve-validation.ts — Score self-improved outputs vs first-pass using Codex GPT-5.4
// Reads improved PNGs from output/validation/{base,fine-tuned}-improved/
// Compares against first-pass scores in output/validation/fine-tuned-scores.jsonl
import { existsSync, readFileSync, writeFileSync } from "fs";

const PROMPTS_PATH = "output/validation/test-prompts.json";
const FIRST_PASS_SCORES_PATH = "output/validation/fine-tuned-scores.jsonl";
const FINE_TUNED_IMPROVED_DIR = "output/validation/fine-tuned-improved";
const BASE_IMPROVED_DIR = "output/validation/base-improved";
const RESULTS_PATH = "output/validation/self-improve-scores.jsonl";

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

interface FirstPassScore {
  id: string;
  fine_tuned_score: number | null;
  base_score: number | null;
}

interface SelfImproveResult {
  id: string;
  category: string;
  theme: string;
  // first-pass scores (from previous run)
  base_first: number | null;
  fine_tuned_first: number | null;
  // self-improved scores
  base_improved: number | null;
  fine_tuned_improved: number | null;
  // deltas
  base_delta: number | null;
  fine_tuned_delta: number | null;
  // critiques
  base_improved_critique: string;
  fine_tuned_improved_critique: string;
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

  // Load first-pass scores
  const firstPass = new Map<string, FirstPassScore>();
  if (existsSync(FIRST_PASS_SCORES_PATH)) {
    for (const line of readFileSync(FIRST_PASS_SCORES_PATH, "utf-8").trim().split("\n")) {
      try {
        const r = JSON.parse(line) as FirstPassScore;
        firstPass.set(r.id, r);
      } catch {}
    }
  }

  // Resume support
  const existing = new Map<string, SelfImproveResult>();
  if (existsSync(RESULTS_PATH)) {
    for (const line of readFileSync(RESULTS_PATH, "utf-8").trim().split("\n")) {
      try {
        const r = JSON.parse(line) as SelfImproveResult;
        existing.set(r.id, r);
      } catch {}
    }
    console.log(`[self-improve] Resuming — ${existing.size} already scored`);
  }

  const results: SelfImproveResult[] = [];
  const total = prompts.length;

  for (let i = 0; i < total; i++) {
    const p = prompts[i]!;
    const fp = firstPass.get(p.id);

    if (existing.has(p.id)) {
      console.log(`[${i + 1}/${total}] ${p.id} — already scored, skipping`);
      results.push(existing.get(p.id)!);
      continue;
    }

    console.log(`[${i + 1}/${total}] Scoring improved ${p.id} (${p.category}, ${p.theme})...`);

    const basePng = `${BASE_IMPROVED_DIR}/${p.id}-desktop.png`;
    const ftPng = `${FINE_TUNED_IMPROVED_DIR}/${p.id}-desktop.png`;

    console.log(`  Scoring base-improved...`);
    const base = existsSync(basePng) ? await scoreWithCodex(basePng) : { text: "", score: null };
    console.log(`  Base improved score: ${base.score ?? "null"}`);

    console.log(`  Scoring fine-tuned-improved...`);
    const ft = existsSync(ftPng) ? await scoreWithCodex(ftPng) : { text: "", score: null };
    console.log(`  Fine-tuned improved score: ${ft.score ?? "null"}`);

    const baseFirst = fp?.base_score ?? null;
    const ftFirst = fp?.fine_tuned_score ?? null;

    const result: SelfImproveResult = {
      id: p.id,
      category: p.category,
      theme: p.theme,
      base_first: baseFirst,
      fine_tuned_first: ftFirst,
      base_improved: base.score,
      fine_tuned_improved: ft.score,
      base_delta: base.score !== null && baseFirst !== null ? base.score - baseFirst : null,
      fine_tuned_delta: ft.score !== null && ftFirst !== null ? ft.score - ftFirst : null,
      base_improved_critique: base.text,
      fine_tuned_improved_critique: ft.text,
    };

    results.push(result);
    writeFileSync(
      RESULTS_PATH,
      results.map((r) => JSON.stringify(r)).join("\n") + "\n",
      "utf-8"
    );

    const bd = result.base_delta !== null ? (result.base_delta >= 0 ? "+" : "") + result.base_delta : "N/A";
    const ftd = result.fine_tuned_delta !== null ? (result.fine_tuned_delta >= 0 ? "+" : "") + result.fine_tuned_delta : "N/A";
    console.log(`  Base delta: ${bd} | FT delta: ${ftd}`);
  }

  // Print comparison table
  console.log("\n" + "═".repeat(100));
  console.log("SELF-IMPROVEMENT RESULTS — First-Pass vs Self-Improved");
  console.log("═".repeat(100));
  console.log(
    `${"Component".padEnd(26)} ${"Cat".padEnd(12)} ${"B1st".padStart(5)} ${"BImp".padStart(5)} ${"BΔ".padStart(4)} ${"FT1st".padStart(6)} ${"FTImp".padStart(6)} ${"FTΔ".padStart(5)}`
  );
  console.log("─".repeat(100));

  let bFirstTotal = 0, bImpTotal = 0, ftFirstTotal = 0, ftImpTotal = 0;
  let bCount = 0, ftCount = 0;

  for (const r of results) {
    const fmt = (v: number | null) => v !== null ? String(v) : "N/A";
    const fmtD = (v: number | null) => v !== null ? (v >= 0 ? "+" : "") + v : "N/A";
    console.log(
      `${r.id.padEnd(26)} ${r.category.padEnd(12)} ${fmt(r.base_first).padStart(5)} ${fmt(r.base_improved).padStart(5)} ${fmtD(r.base_delta).padStart(4)} ${fmt(r.fine_tuned_first).padStart(6)} ${fmt(r.fine_tuned_improved).padStart(6)} ${fmtD(r.fine_tuned_delta).padStart(5)}`
    );
    if (r.base_first !== null && r.base_improved !== null) {
      bFirstTotal += r.base_first; bImpTotal += r.base_improved; bCount++;
    }
    if (r.fine_tuned_first !== null && r.fine_tuned_improved !== null) {
      ftFirstTotal += r.fine_tuned_first; ftImpTotal += r.fine_tuned_improved; ftCount++;
    }
  }

  console.log("─".repeat(100));
  const bF = bCount > 0 ? (bFirstTotal / bCount).toFixed(2) : "N/A";
  const bI = bCount > 0 ? (bImpTotal / bCount).toFixed(2) : "N/A";
  const bD = bCount > 0 ? ((bImpTotal - bFirstTotal) / bCount >= 0 ? "+" : "") + ((bImpTotal - bFirstTotal) / bCount).toFixed(2) : "N/A";
  const ftF = ftCount > 0 ? (ftFirstTotal / ftCount).toFixed(2) : "N/A";
  const ftI = ftCount > 0 ? (ftImpTotal / ftCount).toFixed(2) : "N/A";
  const ftD = ftCount > 0 ? ((ftImpTotal - ftFirstTotal) / ftCount >= 0 ? "+" : "") + ((ftImpTotal - ftFirstTotal) / ftCount).toFixed(2) : "N/A";

  console.log(
    `${"AVERAGE".padEnd(26)} ${"".padEnd(12)} ${String(bF).padStart(5)} ${String(bI).padStart(5)} ${String(bD).padStart(4)} ${String(ftF).padStart(6)} ${String(ftI).padStart(6)} ${String(ftD).padStart(5)}`
  );
  console.log("═".repeat(100));
  console.log(`\nResults written to: ${RESULTS_PATH}`);
}

if (import.meta.main) {
  await main();
}
