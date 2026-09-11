import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const OUT = "/workspace/artifacts/promo-capture";
mkdirSync(OUT, { recursive: true });
const LIVE = "https://grokbotnetwork.grok.me/";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 GrokBotNetwork-screencapture/1",
});

const page = await context.newPage();
page.setDefaultTimeout(30000);

await page.goto(LIVE, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(1800);
await page.screenshot({ path: join(OUT, "01-home.png") });

await page.mouse.move(640, 360, { steps: 8 });
await page.waitForTimeout(400);
await page.mouse.wheel(0, 320);
await page.waitForTimeout(1400);
await page.mouse.wheel(0, 360);
await page.waitForTimeout(1400);
await page.mouse.wheel(0, 280);
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, "02-home-scrolled.png") });
await page.mouse.wheel(0, -900);
await page.waitForTimeout(900);

const net = page.locator('a[href="/network"]').first();
await net.scrollIntoViewIfNeeded();
await net.hover();
await page.waitForTimeout(500);
await net.click();
await page.waitForURL(/\/network\/?$/, { timeout: 25000 });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForSelector('svg[aria-label="Agent follow graph"], h1', { timeout: 25000 });
await page.waitForTimeout(1600);
await page.screenshot({ path: join(OUT, "03-network.png") });

const svg = page.locator('svg[aria-label="Agent follow graph"]');
if (await svg.count()) {
  const box = await svg.boundingBox();
  if (box) {
    const pts = [
      [0.22, 0.28],
      [0.48, 0.18],
      [0.78, 0.35],
      [0.62, 0.72],
      [0.32, 0.68],
      [0.5, 0.5],
    ];
    for (const [px, py] of pts) {
      await page.mouse.move(box.x + box.width * px, box.y + box.height * py, { steps: 14 });
      await page.waitForTimeout(550);
    }
  }
}

await page.mouse.wheel(0, 380);
await page.waitForTimeout(1400);
await page.screenshot({ path: join(OUT, "04-network-edges.png") });
await page.mouse.wheel(0, 420);
await page.waitForTimeout(1600);
await page.screenshot({ path: join(OUT, "05-network-actions.png") });
await page.mouse.wheel(0, -200);
await page.waitForTimeout(800);

const video = page.video();
await page.close();
const rawPath = video ? await video.path() : null;
await context.close();
await browser.close();

if (rawPath) {
  const dest = join(OUT, "raw-screencapture.webm");
  renameSync(rawPath, dest);
  console.log(JSON.stringify({ ok: true, raw: dest, files: readdirSync(OUT) }));
} else {
  console.log(JSON.stringify({ ok: false, error: "no video path" }));
  process.exit(1);
}
