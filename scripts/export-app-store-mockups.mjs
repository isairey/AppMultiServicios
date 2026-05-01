/**
 * Renders public/app-store-mockups.html artboards to PNG at exact App Store sizes.
 * Requires: npm i -D playwright && npx playwright install chromium
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "public", "app-store-mockups.html");
const outDir = path.join(root, "public", "app-store-export");

const fileUrl = `file://${htmlPath.replace(/\\/g, "/")}`;

const JOBS = [
  { id: "m1-1242", file: "01-enter-noir-1242x2688.png", w: 1242, h: 2688 },
  { id: "m2-1242", file: "02-brand-digitalized-1242x2688.png", w: 1242, h: 2688 },
  { id: "m3-1242", file: "03-premium-menu-1242x2688.png", w: 1242, h: 2688 },
  { id: "m4-1242", file: "04-white-void-1242x2688.png", w: 1242, h: 2688 },
  { id: "m5-1242", file: "05-soon-app-store-1242x2688.png", w: 1242, h: 2688 },
  { id: "m1-1290", file: "01-enter-noir-1290x2796.png", w: 1290, h: 2796 },
  { id: "m2-1290", file: "02-brand-digitalized-1290x2796.png", w: 1290, h: 2796 },
  { id: "m3-1290", file: "03-premium-menu-1290x2796.png", w: 1290, h: 2796 },
  { id: "m4-1290", file: "04-white-void-1290x2796.png", w: 1290, h: 2796 },
  { id: "m5-1290", file: "05-soon-app-store-1290x2796.png", w: 1290, h: 2796 },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  await page.goto(fileUrl, { waitUntil: "load" });

  for (const job of JOBS) {
    await page.setViewportSize({ width: job.w, height: job.h });
    const el = page.locator(`#${job.id}`);
    await el.scrollIntoViewIfNeeded();
    await new Promise((r) => setTimeout(r, 160));
    const outPath = path.join(outDir, job.file);
    await el.screenshot({
      path: outPath,
      animations: "disabled",
      type: "png",
    });
    console.log("Wrote", outPath);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
