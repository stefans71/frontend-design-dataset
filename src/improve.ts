// improve.ts — Stage 3b: Generate improved HTML via Codex CLI
// Input: screenshot-desktop.png + component.html + critique.md
// Output: improved.html
// Runs on VPS sequentially after critique.ts
import "dotenv/config";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";
const OUTPUT_SUFFIX = process.env.OUTPUT_SUFFIX ?? "";

function componentDirPattern(): RegExp {
  return OUTPUT_SUFFIX
    ? new RegExp(`^component-\\d+-${OUTPUT_SUFFIX}$`)
    : /^component-\d+$/;
}

function buildPrompt(currentHtml: string, critique: string, originalPrompt?: string): string {
  const scopeInstruction = originalPrompt
    ? `Original user intent: "${originalPrompt}"\n\nIMPORTANT: The improved output must fulfill this same intent — same component type and scope. Do not add sections, pages, or features beyond what the original prompt requested. A navbar prompt should produce a better navbar, not a landing page.`
    : `IMPORTANT: Improve only the specific component shown. Do not expand scope beyond what is visible in the screenshot.`;

  return `You are an expert UI/UX designer and frontend engineer.

${scopeInstruction}

You are given:
1. A screenshot of the current implementation (attached)
2. The current HTML
3. A design critique

Current HTML:
\`\`\`html
${currentHtml}
\`\`\`

Design critique:
${critique}

Rewrite the HTML fixing every issue in the critique while staying within the original scope.
Use only inline CSS in a <style> tag — no CDN, no external resources.
Output ONLY the complete HTML file, nothing else.`;
}

export async function improveComponent(id: string, originalPrompt?: string): Promise<void> {
  const outputDir = join(OUTPUT_DIR, id);
  const improvedPath = join(outputDir, "improved.html");
  if (existsSync(improvedPath)) return;

  const htmlPath = join(outputDir, "component.html");
  const critiquePath = join(outputDir, "critique.md");
  const screenshotPath = join(outputDir, "screenshot-desktop.png");

  if (!existsSync(htmlPath) || !existsSync(critiquePath) || !existsSync(screenshotPath)) {
    console.warn(`[improve] Skipping ${id} — missing required files`);
    return;
  }

  const currentHtml = readFileSync(htmlPath, "utf-8");
  const critique = readFileSync(critiquePath, "utf-8");
  const prompt = buildPrompt(currentHtml, critique, originalPrompt);

  let timedOut = false;

  // Prompt must come before -i: the -i flag is variadic and would consume
  // the prompt string as a second image path if placed after.
  const proc = Bun.spawn(
    [
      "codex",
      "exec",
      "-m",
      "gpt-5.4",
      "--dangerously-bypass-approvals-and-sandbox",
      "--ephemeral",
      prompt,
      "-i",
      screenshotPath,
    ],
    {
      stdout: "pipe",
      stderr: "ignore",
      stdin: "ignore",
    }
  );

  // 5 min — improved HTML can be much larger than the original
  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, 300_000);

  const stdout = proc.stdout;
  if (!stdout) {
    clearTimeout(timer);
    throw new Error("Process stdout not available");
  }

  const text = await new Response(stdout).text();
  await proc.exited;
  clearTimeout(timer);

  if (timedOut) {
    console.warn(`[improve] Timeout for ${id}, skipping`);
    return;
  }

  // Same output format as critique: header → codex → response → tokens used → count → response
  const lines = text.split("\n");
  const tokIdx = lines.findIndex((l) => l.trim() === "tokens used");
  let improved: string;
  if (tokIdx !== -1 && tokIdx + 2 <= lines.length) {
    improved = lines.slice(tokIdx + 2).join("\n").trim();
  } else {
    const codexIdx = lines.findLastIndex((l) => l.trim() === "codex");
    improved = (codexIdx !== -1 ? lines.slice(codexIdx + 1) : lines).join("\n").trim();
  }

  // Strip markdown fences if model disobeyed the no-fences rule
  if (improved.startsWith("```html\n")) improved = improved.slice("```html\n".length);
  if (improved.startsWith("```html")) improved = improved.slice("```html".length);
  if (improved.startsWith("```\n")) improved = improved.slice("```\n".length);
  if (improved.endsWith("\n```")) improved = improved.slice(0, -"\n```".length);
  if (improved.endsWith("```")) improved = improved.slice(0, -"```".length);

  if (!improved.includes("<html") && !improved.includes("<!DOCTYPE")) {
    console.warn(`[improve] ${id} — output does not look like HTML, skipping`);
    return;
  }

  writeFileSync(improvedPath, improved.trim(), "utf-8");
}

export async function improveAll(testMode: boolean, testCount: number): Promise<void> {
  const componentDirs = readdirSync(OUTPUT_DIR)
    .filter((name) => componentDirPattern().test(name))
    .sort();

  const ids = testMode ? componentDirs.slice(0, testCount) : componentDirs;
  const total = ids.length;

  for (let i = 0; i < total; i++) {
    const id = ids[i]!;

    // Read original prompt from metadata so Codex knows the intended scope
    let originalPrompt: string | undefined;
    const metaPath = join(OUTPUT_DIR, id, "metadata.json");
    if (existsSync(metaPath)) {
      try {
        const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
        originalPrompt = meta.prompt;
      } catch {
        // metadata unreadable — proceed without scope constraint
      }
    }

    await improveComponent(id, originalPrompt);
    console.log(`[improve] Component ${i + 1}/${total} done`);
  }

  console.log(`[improve] ${total} components improved`);
}

if (import.meta.main) {
  const testMode = process.env.TEST_MODE === "true";
  const testCount = parseInt(process.env.TEST_COUNT ?? "3", 10);
  await improveAll(testMode, testCount);
}
