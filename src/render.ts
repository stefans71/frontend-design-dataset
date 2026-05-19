// render.ts — Stage 2: Render HTML to PNG screenshots via Playwright
import "dotenv/config";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";

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
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: desktopPath, fullPage: true });
    await browser.close();
  }

  // Mobile screenshot (390x844)
  {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: mobilePath, fullPage: true });
    await browser.close();
  }
}

export async function renderAll(): Promise<void> {
  const componentDirs = readdirSync(OUTPUT_DIR)
    .filter((name) => /^component-\d+$/.test(name))
    .sort();

  const htmlFiles = componentDirs
    .map((dir) => join(OUTPUT_DIR, dir, "component.html"))
    .filter((f) => existsSync(f));

  const total = htmlFiles.length;

  for (let i = 0; i < total; i++) {
    const htmlPath = htmlFiles[i]!;
    const outputDir = join(htmlPath, "..");
    await renderComponent(htmlPath, outputDir);
    console.log(`[render] Component ${i + 1}/${total} rendered`);
  }

  console.log(`[render] ${total} components rendered`);
}

if (import.meta.main) {
  await renderAll();
}
