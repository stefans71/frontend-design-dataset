// generate.ts — Stage 1: Generate HTML components via llama-server
import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { COMPONENT_PROMPTS } from "../prompts/components.ts";

const LLAMA_SERVER_URL = process.env.LLAMA_SERVER_URL ?? "http://localhost:11434";
const LLAMA_MODEL = process.env.LLAMA_MODEL ?? "qwen3.6-27b-mtp";
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";

const SYSTEM_PROMPT =
  'You are a frontend developer. Output a complete, self-contained HTML document. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>). Use realistic content — no lorem ipsum, no placeholder text. Center the component on the page with padding. Do not use external images. Output only the HTML, no explanation.';

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
      temperature: 0.7,
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

  writeFileSync(htmlPath, html.trim(), "utf-8");

  const metadata = {
    prompt,
    model: LLAMA_MODEL,
    timestamp: new Date().toISOString(),
    stage: "generate",
  };
  writeFileSync(join(outputDir, "metadata.json"), JSON.stringify(metadata, null, 2), "utf-8");
}

export async function generateAll(): Promise<void> {
  const testMode = process.env.TEST_MODE === "true";
  const testCount = parseInt(process.env.TEST_COUNT ?? "3", 10);

  const prompts = testMode ? COMPONENT_PROMPTS.slice(0, testCount) : COMPONENT_PROMPTS;
  const total = prompts.length;

  for (let i = 0; i < total; i++) {
    const outputDir = join(OUTPUT_DIR, `component-${String(i).padStart(3, "0")}`);
    mkdirSync(outputDir, { recursive: true });
    await generateComponent(prompts[i]!, outputDir);
    console.log(`[generate] Component ${i + 1}/${total} done`);
  }

  console.log(`[generate] ${total} components generated`);
}

if (import.meta.main) {
  await generateAll();
}
