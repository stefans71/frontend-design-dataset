import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";

const CHROME = "/root/.agent-browser/browsers/chrome-147.0.7727.57/chrome";

interface Asset {
  svg: string;
  png: string;
  width: number;
  height: number;
  bg: string;
}

const ASSETS: Asset[] = [
  { svg: "assets/hero.svg",     png: "assets/png/hero.png",     width: 800, height: 140, bg: "#0d0d0d" },
  { svg: "assets/terminal.svg", png: "assets/png/terminal.png", width: 780, height: 210, bg: "#111111" },
  { svg: "assets/pipeline.svg", png: "assets/png/pipeline.png", width: 780, height: 80,  bg: "#0d0d0d" },
];

mkdirSync("assets/png", { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });

for (const { svg, png, width, height, bg } of ASSETS) {
  const svgContent = readFileSync(svg, "utf-8");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${bg};width:${width}px;height:${height}px;overflow:hidden">${svgContent}</body></html>`;
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width, height } });
  await page.close();
  console.log(`✓ ${png}`);
}

await browser.close();
console.log("All PNGs rendered.");
