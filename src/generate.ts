// generate.ts — Stage 1: Generate HTML components via llama-server
import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { COMPONENT_PROMPTS, COMPONENT_PROMPTS_V2 } from "../prompts/components.ts";

const LLAMA_SERVER_URL = process.env.LLAMA_SERVER_URL ?? "http://localhost:11434";
const LLAMA_MODEL = process.env.LLAMA_MODEL ?? "qwen3.6-27b-mtp";
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output/assets/components";
const OUTPUT_SUFFIX = process.env.OUTPUT_SUFFIX ?? "";
const TEMPERATURE = parseFloat(process.env.TEMPERATURE ?? "0.7");

const SYSTEM_PROMPT =
  "You are a frontend developer. Output a complete, self-contained HTML document. Do NOT use any CDN links or external resources of any kind. Use only inline CSS with a <style> tag — no Tailwind, no external stylesheets, no Google Fonts, no CDN scripts. All styles must be embedded directly in the HTML file. The file must render perfectly with zero internet connectivity. Use realistic content — no lorem ipsum, no placeholder text. Center the component on the page with padding. Do not use external images. Output only the HTML, no explanation.";

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateComponent(prompt: string, outputDir: string): Promise<void> {
  const htmlPath = join(outputDir, "component.html");
  if (existsSync(htmlPath)) {
    return;
  }

  const response = await fetch(`${LLAMA_SERVER_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLAMA_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      chat_template_kwargs: { enable_thinking: false },
      temperature: TEMPERATURE,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`llama-server returned ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const raw = data.choices[0]?.message.content;
  if (!raw) throw new Error("No content in API response");

  // Strip markdown fences
  let html = raw.trim();
  if (html.startsWith("```html\n")) html = html.slice("```html\n".length);
  if (html.startsWith("```html")) html = html.slice("```html".length);
  if (html.endsWith("\n```")) html = html.slice(0, -"\n```".length);
  if (html.endsWith("```")) html = html.slice(0, -"```".length);
  html = html.trim();

  if (!html.includes("<html") && !html.includes("<!DOCTYPE")) {
    console.warn(`[generate] Invalid HTML at temp=${TEMPERATURE} — skipping. Output starts: ${html.slice(0, 80)}`);
    return;
  }

  writeFileSync(htmlPath, html, "utf-8");

  const metadata = {
    prompt,
    model: LLAMA_MODEL,
    timestamp: new Date().toISOString(),
    stage: "generate",
    temperature: TEMPERATURE,
    outputSuffix: OUTPUT_SUFFIX || null,
  };
  writeFileSync(join(outputDir, "metadata.json"), JSON.stringify(metadata, null, 2), "utf-8");
}

export async function generateAll(): Promise<void> {
  const testMode = process.env.TEST_MODE === "true";
  const testCount = parseInt(process.env.TEST_COUNT ?? "3", 10);

  // V2 suffix → use natural language prompts; no suffix → use expert prompts
  const promptArray = OUTPUT_SUFFIX ? COMPONENT_PROMPTS_V2 : COMPONENT_PROMPTS;
  const prompts = testMode ? promptArray.slice(0, testCount) : promptArray;
  const total = prompts.length;

  const dirSuffix = OUTPUT_SUFFIX ? `-${OUTPUT_SUFFIX}` : "";

  for (let i = 0; i < total; i++) {
    const outputDir = join(OUTPUT_DIR, `component-${String(i).padStart(3, "0")}${dirSuffix}`);
    mkdirSync(outputDir, { recursive: true });
    await generateComponent(prompts[i]!, outputDir);
    console.log(`[generate] Component ${i + 1}/${total} done`);
  }

  console.log(`[generate] ${total} components generated`);
}

if (import.meta.main) {
  await generateAll();
}
