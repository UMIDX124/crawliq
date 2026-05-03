#!/usr/bin/env node
// Screenshot a URL with Playwright.
// Usage: node scripts/screenshot.mjs <url> [out=screenshot.png] [width=1440] [height=900] [scroll=0]
//   url     — full URL to capture
//   out     — output PNG path (default ./screenshot.png)
//   width   — viewport width
//   height  — viewport height
//   scroll  — pixels to scroll before capture (0 = top)

import { chromium } from "playwright";

const args = process.argv.slice(2);
const url = args[0];
if (!url) {
  console.error("usage: node scripts/screenshot.mjs <url> [out] [w] [h] [scroll]");
  process.exit(1);
}
const out = args[1] ?? "./screenshot.png";
const width = parseInt(args[2] ?? "1440", 10);
const height = parseInt(args[3] ?? "900", 10);
const scroll = parseInt(args[4] ?? "0", 10);
const fullPage = args.includes("--full");

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

const t0 = Date.now();
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
const loadMs = Date.now() - t0;

if (scroll > 0) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scroll);
  await page.waitForTimeout(300);
}
await page.waitForTimeout(800);

await page.screenshot({ path: out, fullPage });

console.log(JSON.stringify({
  url,
  out,
  loadMs,
  consoleErrors,
  fullPage,
  scroll,
}, null, 2));

await browser.close();
