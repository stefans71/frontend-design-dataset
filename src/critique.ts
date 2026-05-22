// critique.ts — Stage 3: Send screenshots to Codex CLI for design critique
import "dotenv/config";
import { existsSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output/assets/components";
const OUTPUT_SUFFIX = process.env.OUTPUT_SUFFIX ?? "";

function componentDirPattern(): RegExp {
  return OUTPUT_SUFFIX
    ? new RegExp(`^component-\\d+-${OUTPUT_SUFFIX}$`)
    : /^component-\d+$/;
}

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

  // Prompt must come before -i: the -i flag accepts FILE... and would otherwise
  // consume the prompt string as a second image path.
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
      screenshotPath,
    ],
    {
      stdout: "pipe",
      stderr: "ignore",
      stdin: "ignore",
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

  // Codex output format:
  //   <header>\ncodex\n{response}\ntokens used\n{count}\n{response again}
  // The response is printed twice; the copy after "tokens used\n{count}\n" is cleanest.
  const lines = text.split("\n");
  const tokIdx = lines.findIndex((l) => l.trim() === "tokens used");
  let critique: string;
  if (tokIdx !== -1 && tokIdx + 2 <= lines.length) {
    critique = lines.slice(tokIdx + 2).join("\n").trim();
  } else {
    // Fallback: strip header lines up to and including "codex" marker
    const codexIdx = lines.findLastIndex((l) => l.trim() === "codex");
    critique = (codexIdx !== -1 ? lines.slice(codexIdx + 1) : lines).join("\n").trim();
  }

  writeFileSync(critiquePath, critique, "utf-8");
}

export async function critiqueAll(): Promise<void> {
  const componentDirs = readdirSync(OUTPUT_DIR)
    .filter((name) => componentDirPattern().test(name))
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
