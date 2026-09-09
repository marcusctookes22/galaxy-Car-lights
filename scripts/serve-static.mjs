import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../out", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

if (!existsSync(join(root, "index.html"))) {
  console.error("Static output is missing. Run npm run build:static first.");
  process.exit(1);
}

const indexHtml = readFileSync(join(root, "index.html"), "utf8");
const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim().replace(/\/$/, "");
const detectedBasePath = indexHtml.match(/(?:src|href)="(\/[^\"]*)\/_next\//)?.[1] || "";
const basePath = configuredBasePath || detectedBasePath;

createServer((request, response) => {
  const requestedPath = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  const pathname = basePath && (requestedPath === basePath || requestedPath.startsWith(`${basePath}/`))
    ? requestedPath.slice(basePath.length) || "/"
    : requestedPath;
  const candidate = resolve(root, `.${normalize(pathname)}`);
  const insideRoot = relative(root, candidate) && !relative(root, candidate).startsWith("..") && !relative(root, candidate).includes(":");
  const file = insideRoot && existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(root, "index.html");
  response.setHeader("Content-Type", contentTypes[extname(file)] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-cache");
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Static preview available at http://127.0.0.1:${port}`);
});
