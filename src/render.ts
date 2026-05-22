// render.ts — Stage 2: Render HTML to PNG screenshots via Playwright
import "dotenv/config";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output/assets/components";
const OUTPUT_SUFFIX = process.env.OUTPUT_SUFFIX ?? "";

function componentDirPattern(): RegExp {
  return OUTPUT_SUFFIX
    ? new RegExp(`^component-\\d+-${OUTPUT_SUFFIX}$`)
    : /^component-\d+$/;
}

export async function renderComponent(htmlPath: string, outputDir: string): Promise<void> {
  const desktopPath = join(outputDir, "screenshot-desktop.png");
  const mobilePath = join(outputDir, "screenshot-mobile.png");

  if (existsSync(desktopPath) && existsSync(mobilePath)) {
    return;
  }

  const html = readFileSync(htmlPath, "utf-8");

  // Desktop screenshot (1280x900)
  {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: desktopPath, fullPage: true });
    await browser.close();
  }

  // Mobile screenshot (390x844)
  {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: mobilePath, fullPage: true });
    await browser.close();
  }
}

export async function renderAll(): Promise<void> {
  const componentDirs = readdirSync(OUTPUT_DIR)
    .filter((name) => componentDirPattern().test(name))
    .sort();

  const htmlFiles = componentDirs
    .map((dir) => join(OUTPUT_DIR, dir, "component.html"))
    .filter((f) => existsSync(f));

  const total = htmlFiles.length;

  let rendered = 0;
  let failed = 0;
  for (let i = 0; i < total; i++) {
    const htmlPath = htmlFiles[i]!;
    const outputDir = join(htmlPath, "..");
    try {
      await renderComponent(htmlPath, outputDir);
      rendered++;
      console.log(`[render] Component ${i + 1}/${total} rendered`);
    } catch (err) {
      failed++;
      console.warn(`[render] Component ${i + 1}/${total} FAILED — ${err instanceof Error ? err.message.slice(0, 120) : err}`);
    }
  }

  console.log(`[render] ${rendered} components rendered, ${failed} failed`);
}

if (import.meta.main) {
  await renderAll();
}
