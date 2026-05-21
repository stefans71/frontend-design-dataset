// generate-conversations.ts — Step 20: qualifying conversation traces
// Pass 1 (20 batches of 10): vague request → clarifying questions → build
// Pass 2 (15 batches of 10): specific request → build immediately
// Uses Codex CLI via Bun.spawn, same pattern as critique.ts

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";

const OUTPUT_PATH = "./output/qualifying-conversations.jsonl";

const PERSONAS = [
  "Helpful and enthusiastic, uses casual language.",
  "Professional and concise, gets straight to the point.",
  "Consultative and expert, acts like a senior agency designer.",
  "Friendly indie-hacker, uses emojis occasionally.",
  "Warm and encouraging, like a mentor helping a first-time founder.",
];

const DOMAINS = [
  "restaurant",
  "dog grooming",
  "yoga studio",
  "SaaS startup",
  "personal portfolio",
  "nonprofit charity",
  "wedding photographer",
  "real estate agent",
  "fitness coach",
  "coffee shop",
  "dental practice",
  "music teacher",
  "e-commerce store",
  "law firm",
];

const TRANSITIONS = [
  "No preamble — output the code immediately.",
  "One sentence confirming the tech choice (plain HTML/CSS), then the code.",
  "Brief acknowledgment of what makes this component interesting, then code.",
  "Confirm you understood the request in under 10 words, then code.",
  "State one design decision you're making, then output the code.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function runCodex(prompt: string): Promise<string> {
  let timedOut = false;

  const proc = Bun.spawn(
    [
      "codex",
      "exec",
      "-m",
      "gpt-5.4",
      "--dangerously-bypass-approvals-and-sandbox",
      "--ephemeral",
      prompt,
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
  }, 480_000);

  const text = await new Response(proc.stdout).text();
  await proc.exited;
  clearTimeout(timer);

  if (timedOut) {
    throw new Error("Codex timed out after 300s");
  }

  // Codex wraps output: header + "codex" + response + "tokens used\n{count}\n{response again}"
  // Take the copy after "tokens used\n{count}" — it's the cleanest
  const lines = text.split("\n");
  const tokIdx = lines.findIndex((l) => l.trim() === "tokens used");
  if (tokIdx !== -1 && tokIdx + 2 <= lines.length) {
    return lines.slice(tokIdx + 2).join("\n").trim();
  }
  const codexIdx = lines.findLastIndex((l) => l.trim() === "codex");
  return (codexIdx !== -1 ? lines.slice(codexIdx + 1) : lines).join("\n").trim();
}

let globalRecordCount = 0;

function parseAndAppend(rawText: string, type: string, tag: string): number {
  let appended = 0;
  for (const line of rawText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (!Array.isArray(obj.messages) || obj.messages.length < 2) continue;
      const idSuffix = type === "qualifying_conversation" ? "qualifying" : "immediate";
      const record = {
        id: `conv-${String(globalRecordCount).padStart(4, "0")}_${idSuffix}`,
        type,
        messages: obj.messages,
      };
      appendFileSync(OUTPUT_PATH, JSON.stringify(record) + "\n", "utf-8");
      globalRecordCount++;
      appended++;
    } catch {
      console.warn(`  [${tag}] Invalid JSON line skipped`);
    }
  }
  return appended;
}

async function pass1(): Promise<void> {
  const ITERATIONS = 20;
  let totalAppended = 0;
  console.log(`\n[Pass 1] Vague requests — ${ITERATIONS} batches of 10...`);

  for (let i = 0; i < ITERATIONS; i++) {
    const existing = existsSync(OUTPUT_PATH)
      ? readFileSync(OUTPUT_PATH, "utf-8").trim().split("\n").filter(Boolean).length
      : 0;
    if (existing >= 250) {
      console.log(`[conversations] Target reached: ${existing} records. Done.`);
      process.exit(0);
    }

    const persona = pickRandom(PERSONAS);
    const domain = pickRandom(DOMAINS);

    const prompt = `Generate 5 multi-turn frontend design conversations in JSONL format.

Each conversation MUST follow this exact pattern:
1. User gives a vague website/app/page request (not a specific component) for a ${domain} business
2. Assistant asks exactly 2-3 focused qualifying questions
3. User answers briefly (1-2 sentences)
4. Assistant confirms the approach in one sentence then outputs complete self-contained HTML/CSS/JS

PERSONA: ${persona}
CRITICAL: Do NOT start responses with "Happy to build this."
Vary greetings and transitions completely across all 5 conversations.
Vary the HTML output style — some minimal, some detailed, some dark theme.

Output only valid JSONL — one JSON object per line, no markdown, no preamble.
Each object must have a "messages" array with role/content pairs.`;

    process.stdout.write(`  Batch ${i + 1}/${ITERATIONS} (${domain})... `);
    try {
      const text = await runCodex(prompt);
      const appended = parseAndAppend(text, "qualifying_conversation", `Pass1 batch ${i + 1}`);
      totalAppended += appended;
      console.log(`${appended} records appended (total: ${totalAppended})`);
    } catch (err) {
      console.log(`FAILED: ${err}`);
    }
  }

  console.log(`[Pass 1] Complete — ${totalAppended} records`);
}

async function pass2(): Promise<void> {
  const ITERATIONS = 15;
  let totalAppended = 0;
  console.log(`\n[Pass 2] Specific requests — ${ITERATIONS} batches of 10...`);

  for (let i = 0; i < ITERATIONS; i++) {
    const existing = existsSync(OUTPUT_PATH)
      ? readFileSync(OUTPUT_PATH, "utf-8").trim().split("\n").filter(Boolean).length
      : 0;
    if (existing >= 250) {
      console.log(`[conversations] Target reached: ${existing} records. Done.`);
      process.exit(0);
    }

    const transition = pickRandom(TRANSITIONS);

    const prompt = `Generate 5 single-turn frontend design conversations in JSONL format.

Each conversation:
1. User gives a SPECIFIC, well-described component or page request (enough detail that no clarification is needed)
2. Assistant builds immediately — NO questions asked

Vary component types: buttons, forms, cards, navbars, pricing tables, dashboards, modals, mobile components, landing sections, data tables.

TRANSITION STYLE: ${transition}
Vary phrasing heavily across all 5 examples.
Output only complete, self-contained HTML with inline CSS — no CDN.

Output only valid JSONL — one JSON object per line, no markdown.
Each object must have a "messages" array with role/content pairs.`;

    process.stdout.write(`  Batch ${i + 1}/${ITERATIONS}... `);
    try {
      const text = await runCodex(prompt);
      const appended = parseAndAppend(text, "immediate_conversation", `Pass2 batch ${i + 1}`);
      totalAppended += appended;
      console.log(`${appended} records appended (total: ${totalAppended})`);
    } catch (err) {
      console.log(`FAILED: ${err}`);
    }
  }

  console.log(`[Pass 2] Complete — ${totalAppended} records`);
}

function validate(): void {
  console.log("\n=== Validation ===");
  if (!existsSync(OUTPUT_PATH)) {
    console.log("Output file not found.");
    return;
  }

  const lines = readFileSync(OUTPUT_PATH, "utf-8")
    .split("\n")
    .filter((l) => l.trim());

  let ask = 0;
  let immediate = 0;
  for (const line of lines) {
    try {
      const d = JSON.parse(line);
      const turns = (d.messages ?? []).length;
      if (turns >= 4) ask++;
      else immediate++;
    } catch {}
  }

  const total = ask + immediate;
  console.log(`Ask: ${ask} | Immediate: ${immediate} | Total: ${total}`);
  if (total > 0) {
    console.log(`Ask ratio: ${((ask / total) * 100).toFixed(0)}%`);
  }
  console.log(`Target: 200+ total, 55-65% ask type`);
}

async function main(): Promise<void> {
  console.log("=== Qualifying Conversation Generation ===");

  if (!existsSync(OUTPUT_PATH)) {
    writeFileSync(OUTPUT_PATH, "", "utf-8");
    console.log(`Created ${OUTPUT_PATH}`);
  } else {
    const existing = readFileSync(OUTPUT_PATH, "utf-8")
      .split("\n")
      .filter((l) => l.trim()).length;
    globalRecordCount = existing;
    console.log(`Appending to existing file (${existing} records already present)`);
  }

  await pass1();
  await pass2();

  validate();
  console.log("\n=== Generation Complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
