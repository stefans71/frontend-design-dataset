// package-dataset.ts — Stage 4: Assemble JSONL training records
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";
const DATASET_PATH = process.env.DATASET_PATH ?? "./output/dataset.jsonl";
const OUTPUT_SUFFIX = process.env.OUTPUT_SUFFIX ?? "";

function componentDirPattern(): RegExp {
  return OUTPUT_SUFFIX
    ? new RegExp(`^component-\\d+-${OUTPUT_SUFFIX}$`)
    : /^component-\d+$/;
}

type ImageContent = { type: "image"; path: string };
type TextContent = { type: "text"; text: string };
type MessageContent = string | Array<ImageContent | TextContent>;

interface Message {
  role: "user" | "assistant";
  content: MessageContent;
}

interface TrainingRecord {
  id: string;
  type: string;
  messages: Message[];
}

interface ComponentData {
  id: string;
  prompt: string;
  html: string;
  critique: string;
  improved: string | null;
  screenshotDesktop: string;
  screenshotMobile: string;
}

function loadComponent(dir: string): ComponentData | null {
  const metaPath = join(OUTPUT_DIR, dir, "metadata.json");
  const htmlPath = join(OUTPUT_DIR, dir, "component.html");
  const critiquePath = join(OUTPUT_DIR, dir, "critique.md");
  const improvedPath = join(OUTPUT_DIR, dir, "improved.html");
  const desktopPath = join(OUTPUT_DIR, dir, "screenshot-desktop.png");
  const mobilePath = join(OUTPUT_DIR, dir, "screenshot-mobile.png");

  if (!existsSync(metaPath) || !existsSync(htmlPath) || !existsSync(critiquePath) || !existsSync(desktopPath)) {
    return null;
  }

  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));

  return {
    id: dir,
    prompt: meta.prompt ?? "",
    html: readFileSync(htmlPath, "utf-8"),
    critique: readFileSync(critiquePath, "utf-8"),
    improved: existsSync(improvedPath) ? readFileSync(improvedPath, "utf-8") : null,
    screenshotDesktop: desktopPath,
    screenshotMobile: mobilePath,
  };
}

// Type 1: Text prompt → original HTML (generation knowledge)
function record1_promptToHtml(c: ComponentData): TrainingRecord {
  return {
    id: `${c.id}_prompt_to_html`,
    type: "prompt_to_html",
    messages: [
      { role: "user", content: c.prompt },
      { role: "assistant", content: c.html },
    ],
  };
}

// Type 2: Screenshot → critique (visual critique learning)
function record2_screenshotToCritique(c: ComponentData): TrainingRecord {
  return {
    id: `${c.id}_screenshot_to_critique`,
    type: "screenshot_to_critique",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", path: c.screenshotDesktop },
          {
            type: "text",
            text: "You are a senior product designer. Provide a detailed design critique of this UI component covering visual hierarchy, spacing, typography, color, component completeness, and production readiness. Score 1–10. Be specific — name exact measurements.",
          },
        ],
      },
      { role: "assistant", content: c.critique },
    ],
  };
}

// Type 3: Screenshot → code reconstruction (visual-to-code learning)
function record3_screenshotToCode(c: ComponentData): TrainingRecord {
  return {
    id: `${c.id}_screenshot_to_code`,
    type: "screenshot_to_code",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", path: c.screenshotDesktop },
          {
            type: "text",
            text: "Implement this UI component as a complete, self-contained HTML file. Use only inline CSS in a <style> tag — no CDN, no external resources. Output only the HTML file.",
          },
        ],
      },
      { role: "assistant", content: c.html },
    ],
  };
}

// Type 4: Screenshot + HTML → critique (full-context critique)
function record4_screenshotHtmlToCritique(c: ComponentData): TrainingRecord {
  return {
    id: `${c.id}_screenshot_html_to_critique`,
    type: "screenshot_html_to_critique",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", path: c.screenshotDesktop },
          {
            type: "text",
            text: `You are a senior product designer reviewing a UI component.\n\nHere is the HTML implementation:\n\`\`\`html\n${c.html}\n\`\`\`\n\nProvide a structured design critique covering visual hierarchy, spacing, typography, color, component completeness, and production readiness. Score 1–10.`,
          },
        ],
      },
      { role: "assistant", content: c.critique },
    ],
  };
}

// Type 5: Screenshot + HTML + critique → improved HTML (the most valuable record)
// Includes the original prompt as a scope constraint so the model learns not to expand scope.
function record5_screenshotHtmlCritiqueToImproved(c: ComponentData): TrainingRecord | null {
  if (!c.improved) return null;
  return {
    id: `${c.id}_improve`,
    type: "screenshot_code_critique_to_improved",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", path: c.screenshotDesktop },
          {
            type: "text",
            text: `This UI component has design quality issues.\n\nOriginal user intent: "${c.prompt}"\n\nCurrent HTML:\n${c.html}\n\nDesign critique:\n${c.critique}\n\nRewrite the HTML fixing every issue while staying within the original scope. Output only the improved HTML file.`,
          },
        ],
      },
      { role: "assistant", content: c.improved },
    ],
  };
}

export function packageAll(): void {
  const componentDirs = readdirSync(OUTPUT_DIR)
    .filter((name) => componentDirPattern().test(name))
    .sort();

  const records: TrainingRecord[] = [];
  let skipped = 0;
  let type5Count = 0;

  for (const dir of componentDirs) {
    const c = loadComponent(dir);
    if (!c) {
      skipped++;
      continue;
    }

    records.push(record1_promptToHtml(c));
    records.push(record2_screenshotToCritique(c));
    records.push(record3_screenshotToCode(c));
    records.push(record4_screenshotHtmlToCritique(c));

    const r5 = record5_screenshotHtmlCritiqueToImproved(c);
    if (r5) {
      records.push(r5);
      type5Count++;
    }
  }

  const jsonl = records.map((r) => JSON.stringify(r)).join("\n");
  writeFileSync(DATASET_PATH, jsonl + "\n", "utf-8");

  const components = componentDirs.length - skipped;
  console.log(`[package] ${components} components → ${records.length} records written to ${DATASET_PATH}`);
  console.log(`[package] Type breakdown: ${components}×type1 ${components}×type2 ${components}×type3 ${components}×type4 ${type5Count}×type5`);
  if (skipped > 0) console.log(`[package] ${skipped} components skipped (missing required files)`);
}

if (import.meta.main) {
  packageAll();
}
