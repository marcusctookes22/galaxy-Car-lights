import test from "node:test";
import assert from "node:assert/strict";
import { createStaticServer } from "../scripts/serve-static.mjs";
import { once } from "node:events";
import { resolve } from "node:path";

test("static preview serves real 404s, metadata, ranges, HEAD and prefixed paths", async () => {
  const server = createStaticServer(resolve("out"), "/demo");
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ["/demo/", "/demo/robots.txt", "/demo/sitemap.xml"]) assert.equal((await fetch(`${base}${path}`)).status, 200, path);
    const missing = await fetch(`${base}/demo/missing-page`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /off course/);
    assert.equal((await fetch(`${base}/not-demo/`)).status, 404);
    assert.equal((await fetch(`${base}/demo/%ZZ`)).status, 400);
    assert.equal((await fetch(`${base}/demo/api/contact`, { method: "POST" })).status, 405);
    const video = `${base}/demo/images/signature-starlight.mp4`;
    const range = await fetch(video, { headers: { Range: "bytes=0-99" } });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 100);
    assert.match(range.headers.get("content-range"), /^bytes 0-99\//);
    assert.equal((await fetch(video, { headers: { Range: "bytes=999999999-" } })).status, 416);
    const head = await fetch(video, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
  } finally { server.closeAllConnections(); await new Promise((done) => server.close(done)); }
});
