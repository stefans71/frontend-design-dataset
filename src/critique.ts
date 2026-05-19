// critique.ts — Stage 3: Send screenshots to Codex CLI for design critique
import "dotenv/config";
import { existsSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";

const CRITIQUE_PROMPT = `You are a senior product designer reviewing a UI component screenshot.

Provide a structured design critique covering:
1. Visual hierarchy — is the most important element immediately obvious?
2. Spacing & layout — consistent spacing system? Specific values that need changing?
3. Typography — weight contrast, size scale, readability
4. Color — contrast ratios, palette cohesion, WCAG AA accessibility
5. Component completeness — all states shown? (hover, disabled, loading, error, empty)
6. Production readiness — what would a senior designer change before shipping?

Score 1-10. Be specific — name exact measurements, not general advice.`;

export async function critiqueComponent(screenshotPath: string, outputDir: string): Promise<void> {
  const critiquePath = join(outputDir, "critique.md");
  if (existsSync(critiquePath)) {
    return;
  }

  let timedOut = false;

  const proc = Bun.spawn(
    [
      "codex",
      "exec",
      "-m",
      "gpt-5.4",
      "--dangerously-bypass-approvals-and-sandbox",
      "--ephemeral",
      "-i",
      screenshotPath,
      CRITIQUE_PROMPT,
    ],
    {
      stdout: "pipe",
      stderr: "ignore",
    }
  );

  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, 120_000);

  const stdout = proc.stdout;
  if (!stdout) {
    clearTimeout(timer);
    throw new Error("Process stdout not available");
  }

  const text = await new Response(stdout).text();
  await proc.exited;
  clearTimeout(timer);

  if (timedOut) {
    console.warn(`[critique] Timeout for ${screenshotPath}, skipping`);
    return;
  }

  // Strip trailing token-count metadata lines
  const lines = text.split("\n");
  let endIdx = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = (lines[i] ?? "").trim();
    if (line === "" || line.includes("tokens") || line.startsWith("---")) {
      endIdx = i;
    } else {
      break;
    }
  }
  const critique = lines.slice(0, endIdx).join("\n").trim();

  writeFileSync(critiquePath, critique, "utf-8");
}

export async function critiqueAll(): Promise<void> {
  const componentDirs = readdirSync(OUTPUT_DIR)
    .filter((name) => /^component-\d+$/.test(name))
    .sort();

  const screenshotFiles = componentDirs
    .map((dir) => join(OUTPUT_DIR, dir, "screenshot-desktop.png"))
    .filter((f) => existsSync(f));

  const total = screenshotFiles.length;

  for (let i = 0; i < total; i++) {
    const screenshotPath = screenshotFiles[i]!;
    const outputDir = join(screenshotPath, "..");
    await critiqueComponent(screenshotPath, outputDir);
    console.log(`[critique] Component ${i + 1}/${total} critiqued`);
  }

  console.log(`[critique] ${total} components critiqued`);
}

if (import.meta.main) {
  await critiqueAll();
}
