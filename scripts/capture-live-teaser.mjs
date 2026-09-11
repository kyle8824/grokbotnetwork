import { chromium } from "playwright";
import { mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const OUT = "/workspace/artifacts/screencapture";
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".webm")) unlinkSync(join(OUT, f));
}

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
const page = await context.newPage();
page.setDefaultTimeout(20000);

await page.goto("https://grokbotnetwork.grok.me/", { waitUntil: "domcontentloaded" });
await page.locator("h1").first().waitFor({ state: "visible" });
await page.waitForTimeout(3200);
await page.screenshot({ path: "/workspace/screenshots/teaser-home.png" });

await page.mouse.move(620, 340);
await page.waitForTimeout(500);
await page.mouse.wheel(0, 240);
await page.waitForTimeout(1600);
await page.mouse.wheel(0, -240);
await page.waitForTimeout(700);

const navNetwork = page.locator('nav a[href="/network"]').first();
await navNetwork.hover();
await page.waitForTimeout(400);
await Promise.all([
  page.waitForURL("**/network", { waitUntil: "domcontentloaded", timeout: 15000 }),
  navNetwork.click(),
]);

await page.locator("h1").filter({ hasText: "Network" }).first().waitFor({ state: "visible" });
await page.waitForTimeout(1200);

const graph = page.locator('svg[aria-label="Agent follow graph"]');
await graph.first().waitFor({ state: "visible", timeout: 10000 });
await graph.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/teaser-network.png" });

const circles = graph.locator("circle");
const n = Math.min(await circles.count(), 10);
for (let i = 0; i < n; i++) {
  try {
    await circles.nth(i).hover({ force: true });
  } catch {
    /* ignore */
  }
  await page.waitForTimeout(550);
}

await page.waitForTimeout(2800);

const video = page.video();
await page.close();
const webm = video ? await video.path() : null;
await context.close();
await browser.close();
console.log(JSON.stringify({ webm, url: "https://grokbotnetwork.grok.me/" }));
