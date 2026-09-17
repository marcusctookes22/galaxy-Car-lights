import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, relative, resolve, sep } from "node:path";
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
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

export function createStaticServer(directory = root, basePath = "") {
  const prefix = basePath.replace(/\/$/, "");
  return createServer((request, response) => {
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname); }
    catch { response.writeHead(400); response.end(); return; }
    if (pathname.includes("\0") || pathname.includes("\\")) { response.writeHead(400); response.end(); return; }
    const matchesBase = !prefix || pathname === prefix || pathname.startsWith(`${prefix}/`);
    const localPath = prefix && matchesBase ? pathname.slice(prefix.length) || "/" : pathname;
    const candidate = resolve(directory, `.${localPath}`);
    const rel = relative(directory, candidate);
    const insideRoot = rel !== ".." && !rel.startsWith(`..${sep}`) && !rel.includes(":");
    const candidates = [candidate, `${candidate}.html`, join(candidate, "index.html")];
    let file = matchesBase && insideRoot ? candidates.find((entry) => existsSync(entry) && statSync(entry).isFile()) : undefined;
    const status = file ? 200 : 404;
    file ||= join(directory, "404.html");
    if (!existsSync(file)) { response.writeHead(404); response.end("Page not found"); return; }
    const size = statSync(file).size;
    response.setHeader("Content-Type", contentTypes[extname(file)] || "application/octet-stream");
    response.setHeader("Accept-Ranges", "bytes");
    let start = 0, end = size - 1;
    if (request.headers.range && status === 200) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (range && (range[1] || range[2])) {
        start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      } else start = size;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) { response.writeHead(416, { "Content-Range": `bytes */${size}` }); response.end(); return; }
      response.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    }
    response.setHeader("Content-Length", end - start + 1);
    response.writeHead(request.headers.range && status === 200 ? 206 : status);
    if (request.method === "HEAD" || size === 0) { response.end(); return; }
    createReadStream(file, { start, end }).on("error", () => response.destroy()).pipe(response);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!existsSync(join(root, "index.html"))) { console.error("Static output is missing. Run npm run build:static first."); process.exitCode = 1; }
  else createStaticServer(root, process.env.NEXT_PUBLIC_BASE_PATH || "").listen(port, "127.0.0.1", () => {
    console.log(`Static preview available at http://127.0.0.1:${port}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`);
  });
}
