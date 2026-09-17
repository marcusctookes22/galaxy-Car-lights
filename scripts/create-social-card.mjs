// A code-rendered brand card; no new photography or business claims.
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const logo = await readFile(new URL("../public/brand/galaxy-logo.webp", import.meta.url));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#080808"/>
<rect x="30" y="30" width="1140" height="570" fill="none" stroke="#d9b04f" stroke-opacity=".4"/>
<text x="80" y="150" fill="#d9b04f" font-family="Arial,sans-serif" font-size="19" letter-spacing="4">GALAXY CAR LIGHTS</text>
<text x="76" y="268" fill="#f4f1e9" font-family="Arial,sans-serif" font-size="78">Make the night</text>
<text x="76" y="360" fill="#ead096" font-family="Georgia,serif" font-style="italic" font-size="92">yours.</text>
<path d="M80 447H1120" stroke="#d9b04f" stroke-opacity=".35"/>
<text x="80" y="508" fill="#bdb9af" font-family="Arial,sans-serif" font-size="24">STARLIGHTS   ·   AMBIENT LIGHTS   ·   ROCK LIGHTS</text>
</svg>`;
await sharp(Buffer.from(svg)).composite([{ input: await sharp(logo).resize({ width: 340 }).png().toBuffer(), left: 760, top: 125 }]).png().toFile(fileURLToPath(new URL("../public/brand/social-card.png", import.meta.url)));
console.log("Created public/brand/social-card.png (1200 × 630)");
