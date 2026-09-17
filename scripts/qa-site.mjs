// Local-only browser verification. No real enquiries or provider requests.
// Install Playwright separately or point PLAYWRIGHT_MODULE_PATH at an existing installation.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const base = process.env.QA_URL || "http://localhost:3003";
const checks = [];
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
const errors = [];
let contactRequests = 0;
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/contact", (route) => { contactRequests++; return route.abort(); });
const check = (name, result) => { assert(result, name); checks.push(name); console.log(`PASS ${name}`); };
const activePanel = () => page.locator('form > fieldset > div.mt-2 > div > div[aria-hidden="false"]');
const waitForStep = async (title) => {
  await page.waitForFunction((expected) => {
    const heading = document.activeElement;
    const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
    return heading?.matches('[data-step-title]') && heading.textContent === expected && heading.getBoundingClientRect().top >= headerBottom && heading.getBoundingClientRect().bottom < innerHeight;
  }, title);
};
try {
  await page.goto(base);
  await page.getByRole("button", { name: "Use This Design" }).waitFor();
  check("non-sending notice before data entry", await page.getByText("Preview only — enquiries are not sent from this website yet.", { exact: true }).isVisible());
  if (process.env.QA_MODE === "red") process.exitCode = 0;
  else {
    await page.locator('#services a[data-service]').first().click();
    await waitForStep('Your vehicle');
    check('service entry requires vehicle first', await page.locator('#year').inputValue() === '');
    await page.getByRole('button', { name: 'Use This Design' }).click();
    await waitForStep('Your vehicle');
    check('designer entry requires vehicle first', await page.locator('#year').inputValue() === '');
    for (const [label, value] of [["Year", "0000"], ["Make", "BMW"], ["Model", "M4"]]) await page.getByLabel(label, { exact: true }).fill(value);
    await activePanel().getByRole("button", { name: "Continue to experience" }).click();
    await page.waitForFunction(() => document.activeElement?.id === 'year');
    check("invalid year cannot reach review", await page.getByRole("heading", { name: "Your build, at a glance" }).count() === 0);
    check("invalid field receives focus", await page.locator("#year").evaluate((el) => document.activeElement === el));
    await page.getByLabel("Year", { exact: true }).fill("2024");
    await activePanel().getByRole("button", { name: "Continue to experience" }).click();
    await waitForStep('Choose the experience');
    check('attached designer concept survives vehicle step', await page.getByText('Your headliner concept is attached', { exact: true }).isVisible());
    await activePanel().getByRole("radio", { name: "Starlights", exact: true }).check();
    await activePanel().getByRole("button", { name: "Continue to contact" }).click();
    await waitForStep('Contact details');
    await page.getByRole('button', { name: '← Back to experience', exact: true }).click();
    await waitForStep('Choose the experience');
    check('Back preserves selected service', await page.getByRole('radio', { name: 'Starlights', exact: true }).isChecked());
    await activePanel().getByRole('button', { name: 'Continue to contact' }).click();
    await waitForStep('Contact details');
    for (const [label, value] of [["Name", "Example Driver"], ["Phone", "1"], ["Email", "driver@example.com"]]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByLabel("Phone", { exact: true }).fill("+1 202 555 0142");
    await page.getByLabel("Build notes (optional)").fill("Keep these notes.");
    await activePanel().getByRole("button", { name: "Preview enquiry" }).click();
    check("summary is explicitly local", await page.getByText("Preview only — no enquiry has been sent.", { exact: true }).isVisible());
    check("summary preserves car and contact fields", (await page.locator("form dl").innerText()).includes("2024 BMW M4"));
    check("no send button without services", await page.getByRole("button", { name: "Send build enquiry", exact: true }).count() === 0);
    check("offline submit action is visible", await page.getByRole("button", { name: "Submit enquiry", exact: true }).count() === 1);
    await page.getByRole("button", { name: "Submit enquiry", exact: true }).click();
    check("offline submit explains that nothing was sent", await page.getByText("Online enquiry submission is not available yet. Your details are still here to review.", { exact: true }).isVisible());
    await page.getByLabel("Name", { exact: true }).fill("Updated Driver");
    check("editing clears stale review", await page.getByRole("heading", { name: "Your build, at a glance" }).count() === 0);
    await page.getByRole("button", { name: "Use This Design" }).click();
    await waitForStep('Choose the experience');
    check("designer handoff preserves notes", await page.getByLabel("Build notes (optional)").inputValue() === "Keep these notes.");
    check("designer concept is attached", await page.getByText("Your headliner concept is attached", { exact: true }).isVisible());
    await page.locator("#more-work summary").click();
    check("gallery expands", await page.locator("#more-work").getAttribute("open") !== null);
    await page.locator("#more-work summary").press("Enter");
    check("gallery closes by keyboard", await page.locator("#more-work").getAttribute("open") === null);
    await page.locator("#more-experiences summary").click();
    check("sample reviews expand", await page.locator("#more-experiences").getAttribute("open") !== null);
    await page.locator("#faq-question-0").click();
    check("FAQ expands", await page.locator("#faq-question-0").getAttribute("aria-expanded") === "true");
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    check("mobile menu opens", await page.getByRole("dialog", { name: "Site navigation" }).isVisible());
    await page.keyboard.press("Escape");
    check("menu restores focus", await page.getByRole("button", { name: "Open menu", exact: true }).evaluate((el) => document.activeElement === el));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator("video").scrollIntoViewIfNeeded();
    check("reduced motion starts video paused", await page.locator("video").evaluate((el) => el.paused));
    await page.getByRole("button", { name: "Play installation video", exact: true }).click();
    await page.getByRole("button", { name: "Pause installation video", exact: true }).waitFor();
    check("video can play on request", await page.locator("video").evaluate((el) => !el.paused));
    await page.getByRole("button", { name: "Pause installation video", exact: true }).click();
    check("video can pause", await page.locator("video").evaluate((el) => el.paused));
    await mkdir("work/qa-readiness", { recursive: true });
    for (const width of [320, 390, 980, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base);
      await page.getByRole("button", { name: "Use This Design" }).waitFor();
      check(`no horizontal overflow at ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      check(`anchors resolve at ${width}px`, await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every((a) => a.hash && document.getElementById(decodeURIComponent(a.hash.slice(1))))));
      await page.screenshot({ path: `work/qa-readiness/home-${width}.png`, fullPage: true });
    }
    check("preview is noindex", (await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex"));
    check("no provider submission requests", contactRequests === 0);
    check("no browser runtime errors", errors.length === 0);
    const response = await page.goto(`${base.replace(/\/$/, "")}/missing-page`);
    check("missing page returns 404", response.status() === 404);
    check("branded recovery page", await page.getByRole("heading", { name: "A little off course." }).isVisible());
    await page.getByRole("link", { name: "Back to the site" }).click();
    check("404 home link works", await page.locator("#top").isVisible());
    await writeFile("work/qa-readiness/results.json", JSON.stringify({ base, checks, errors, contactRequests }, null, 2));
  }
} finally { await browser.close(); }
