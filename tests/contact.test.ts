import test from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "../lib/contact/handler.server.ts";
import { getContactConfig, type ContactConfig } from "../lib/contact/config.server.ts";
import { contactSchema } from "../lib/contact/schema.ts";
import { clientBucket } from "../lib/contact/protection.server.ts";
import { services } from "../data/services.ts";

const config: ContactConfig = {
  origins: ["https://galaxy.example"], to: "owner@example.com", from: "Galaxy <quotes@example.com>",
  resendKey: "test-email-secret", siteKey: "test-site-key", turnstileSecret: "test-captcha-secret",
  redisUrl: "https://test.upstash.io", redisToken: "test-redis-secret", hashSecret: "a".repeat(32), vercel: true,
};
const valid = {
  submissionId: "739d11e2-a1b9-4eca-a816-4208f2ba79ba", year: "2024", make: "BMW", model: "M4",
  service: "Starlights", name: "Customer Example", phone: "+1 (555) 010-0200", email: "customer@example.com",
  message: "Warm gold, please.", design: "", shootingStar: true, consent: true, website: "", turnstileToken: "valid-token",
};
function request(body: unknown = valid, overrides: HeadersInit = {}) {
  return new Request("https://galaxy.example/api/contact", { method: "POST", headers: {
    "Content-Type": "application/json", Origin: "https://galaxy.example", "x-vercel-forwarded-for": "203.0.113.10", ...overrides,
  }, body: typeof body === "string" ? body : JSON.stringify(body) });
}
type ExternalOptions = { rate?: unknown; captcha?: unknown; email?: unknown; emailStatus?: number; throwAt?: string };
function external(options: ExternalOptions = {}) {
  const calls: { url: string; init: RequestInit; body: Record<string, unknown> }[] = [];
  const fetcher: typeof fetch = async (url, init) => {
    const endpoint = String(url);
    assert(init?.signal, "Every external request must have a timeout");
    assert.equal(init?.redirect, "error");
    calls.push({ url: endpoint, init: init!, body: JSON.parse(String(init?.body)) });
    if (options.throwAt && endpoint.includes(options.throwAt)) throw new Error("SECRET PROVIDER ERROR");
    if (endpoint.includes("upstash.io")) return Response.json(options.rate ?? { result: [1, 0] });
    if (endpoint.includes("siteverify")) return Response.json(options.captcha ?? { success: true, hostname: "galaxy.example", action: "contact" });
    if (endpoint === "https://api.resend.com/emails") return Response.json(options.email ?? { id: "email-123" }, { status: options.emailStatus ?? 200 });
    throw new Error("Unexpected external endpoint");
  };
  return { calls, fetcher };
}
const sends = (mock: ReturnType<typeof external>) => mock.calls.filter((call) => call.url.includes("resend.com"));

test("valid request reaches provider once, with fixed recipient/sender and validated Reply-To", async () => {
  const mock = external();
  const response = await handleContact(request(), { config, fetcher: mock.fetcher });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).ok, true);
  assert.equal(sends(mock).length, 1);
  const body = sends(mock)[0].body;
  assert.deepEqual(body.to, [config.to]); assert.equal(body.from, config.from); assert.equal(body.reply_to, valid.email);
  assert(String(body.text).includes("Shooting Star")); assert(String(body.text).includes("Contact consent: Yes"));
  assert.equal(body.html, undefined); assert(!String(body.text).includes(valid.turnstileToken));
});

for (const [name, patch] of Object.entries({
  "missing name": { name: undefined }, "blank make": { make: "   " }, "invalid year": { year: "1000" },
  "future year": { year: "9999" }, "unknown service": { service: "Anything" }, "invalid email": { email: "bad" },
  "header injection": { email: "a@example.com\r\nBcc: victim@example.com" }, "name controls": { name: "Bad\u0000Name" },
  "multiline model": { model: "M4\nInjected" }, "invalid phone": { phone: "123" }, "missing consent": { consent: false },
  "string consent": { consent: "true" }, "honeypot": { website: "https://spam.example" }, "token missing": { turnstileToken: "" },
  "huge token": { turnstileToken: "x".repeat(2049) }, "long notes": { message: "a".repeat(3001) },
  "unexpected recipient": { to: "attacker@example.com" }, "invalid id": { submissionId: "123" },
  "invalid effect combination": { service: "Rock Lights", shootingStar: true },
})) {
  test(`rejects ${name} without CAPTCHA verification or email`, async () => {
    const mock = external(); const response = await handleContact(request({ ...valid, ...patch }), { config, fetcher: mock.fetcher });
    assert.equal(response.status, 400); assert.equal(mock.calls.length, 1); assert.equal(sends(mock).length, 0);
  });
}

test("normalizes Unicode/spacing and preserves apostrophes, non-Latin names and plain-text special characters", () => {
  const parsed = contactSchema.parse({ ...valid, name: "  Jose\u0301  O'Neil 王  ", message: "<script>alert('x')</script>\r\nA&B", shootingStar: false });
  assert.equal(parsed.name, "José O'Neil 王"); assert.equal(parsed.message, "<script>alert('x')</script>\nA&B");
});
test("all currently offered services and attached designer summaries are supported", () => {
  for (const service of services) {
    assert(contactSchema.safeParse({ ...valid, service: service.quoteValue, shootingStar: false, design: "Night Sky · Violet · Panoramic roof · Twinkle · Shooting Star: on" }).success);
  }
});

test("unsupported methods and media types are rejected without external calls", async () => {
  const mock = external();
  assert.equal((await handleContact(new Request("https://galaxy.example/api/contact"), { config, fetcher: mock.fetcher })).status, 405);
  assert.equal((await handleContact(request(valid, { "Content-Type": "text/plain" }), { config, fetcher: mock.fetcher })).status, 415);
  assert.equal(mock.calls.length, 0);
});
for (const origin of ["https://evil.example", "null", "https://galaxy.example.evil.com", "https://galaxy.example/"]) {
  test(`rejects unapproved origin ${origin}`, async () => {
    const mock = external();
    assert.equal((await handleContact(request(valid, { Origin: origin }), { config, fetcher: mock.fetcher })).status, 403);
    assert.equal(mock.calls.length, 0);
  });
}
test("missing Origin and cross-site fetch metadata cannot bypass origin checks", async () => {
  const mock = external();const req = request();req.headers.delete("origin");
  assert.equal((await handleContact(req, { config, fetcher: mock.fetcher })).status, 403);
  assert.equal((await handleContact(request(valid, { "sec-fetch-site": "cross-site" }), { config, fetcher: mock.fetcher })).status, 403);
  assert.equal(mock.calls.length, 0);
});
test("malformed JSON, declared body size and actual streamed byte size are bounded", async () => {
  for (const [req, status] of [
    [request("{"), 400], [request(valid, { "Content-Length": "20000" }), 413],
    [request({ ...valid, message: "界".repeat(7000) }), 413], [request("null"), 400],
  ] as const) {
    const mock = external();assert.equal((await handleContact(req, { config, fetcher: mock.fetcher })).status, status);assert.equal(sends(mock).length, 0);
  }
});
test("oversize chunked stream is cancelled without trusting Content-Length", async () => {
  let cancelled = false;
  const req = new Request("https://galaxy.example/api/contact", { method: "POST", headers: request().headers,
    body: new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(17000)); }, cancel() { cancelled = true; } }),
    duplex: "half",
  } as RequestInit);
  const mock = external();assert.equal((await handleContact(req, { config, fetcher: mock.fetcher })).status, 413);assert(cancelled);
});

for (const captcha of [
  { success: false, "error-codes": ["timeout-or-duplicate"] }, { success: true, hostname: "evil.example", action: "contact" },
  { success: true, hostname: "galaxy.example", action: "login" }, { success: "true", hostname: "galaxy.example", action: "contact" }, null,
]) {
  test(`rejects invalid/replayed/mismatched CAPTCHA ${JSON.stringify(captcha)}`, async () => {
    const mock = external({ captcha: captcha ?? {} });
    assert.equal((await handleContact(request(), { config, fetcher: mock.fetcher })).status, 400);assert.equal(sends(mock).length, 0);
  });
}
test("rate-limit rejection returns Retry-After and skips CAPTCHA/email", async () => {
  const mock = external({ rate: { result: [0, 42] } });
  const response = await handleContact(request(), { config, fetcher: mock.fetcher });
  assert.equal(response.status, 429);assert.equal(response.headers.get("retry-after"), "42");assert.equal(mock.calls.length, 1);
});
for (const rate of [{ error: "redis down" }, { result: ["1", 0] }, {}, { result: [0, -1] }]) {
  test(`rate service errors fail closed ${JSON.stringify(rate)}`, async () => {
    const mock = external({ rate });assert.equal((await handleContact(request(), { config, fetcher: mock.fetcher })).status, 503);assert.equal(mock.calls.length, 1);
  });
}
for (const throwAt of ["upstash.io", "siteverify", "resend.com"]) {
  test(`network/timeout failure at ${throwAt} never reports success or leaks provider errors`, async () => {
    const mock = external({ throwAt });const response = await handleContact(request(), { config, fetcher: mock.fetcher });
    assert.equal(response.status, throwAt === "resend.com" ? 502 : 503);
    const text = await response.text();assert(!text.includes("SECRET"));assert(!text.includes(valid.email));assert(!text.includes(valid.message));
  });
}
for (const emailOptions of [{ emailStatus: 429 }, { emailStatus: 500 }, { email: {} }, { email: { id: 123 } }]) {
  test(`provider rejection/malformed success is handled ${JSON.stringify(emailOptions)}`, async () => {
    const mock = external(emailOptions);assert.equal((await handleContact(request(), { config, fetcher: mock.fetcher })).status, 502);
  });
}
test("retries with refreshed CAPTCHA use the same idempotency key and body; edited request gets a different key", async () => {
  const mock = external();
  for (const patch of [{}, { turnstileToken: "new-token" }, { message: "Changed details" }]) await handleContact(request({ ...valid, ...patch }), { config, fetcher: mock.fetcher });
  const messages = sends(mock);const key = (i: number) => new Headers(messages[i].init.headers).get("Idempotency-Key");
  assert.equal(key(0), key(1));assert.deepEqual(messages[0].body, messages[1].body);assert.notEqual(key(0), key(2));
});
test("only trusted Vercel IP is used, IPv6 groups by /64 and no raw address appears in Redis keys", async () => {
  const a = clientBucket(request(valid, { "x-vercel-forwarded-for": "2001:db8:abcd:1234::1" }), config);
  const b = clientBucket(request(valid, { "x-vercel-forwarded-for": "2001:0db8:abcd:1234::f" }), config);
  assert.equal(a, b);assert.equal(a.length, 64);
  const local = { ...config, vercel: false };assert.equal(clientBucket(request(), local), clientBucket(request(valid, { "x-forwarded-for": "8.8.8.8" }), local));
  const mock = external();await handleContact(request(), { config, fetcher: mock.fetcher });
  assert(!JSON.stringify(mock.calls[0].body).includes("203.0.113.10"));
});
test("configuration is disabled by default and incomplete settings never send", async () => {
  assert.equal(getContactConfig({}), null);
  assert.equal(getContactConfig({ CONTACT_DELIVERY_ENABLED: "true" }), null);
  const mock = external();assert.equal((await handleContact(request(), { config: null, fetcher: mock.fetcher })).status, 503);assert.equal(mock.calls.length, 0);
});
test("production rejects dummy Turnstile keys and invalid origins/senders", () => {
  const env = { CONTACT_DELIVERY_ENABLED: "true", CONTACT_ALLOWED_ORIGINS: "https://galaxy.example", CONTACT_EMAIL: config.to,
    CONTACT_FROM_EMAIL: config.from, RESEND_API_KEY: config.resendKey, NEXT_PUBLIC_TURNSTILE_SITE_KEY: config.siteKey,
    TURNSTILE_SECRET_KEY: config.turnstileSecret, UPSTASH_REDIS_REST_URL: config.redisUrl, UPSTASH_REDIS_REST_TOKEN: config.redisToken,
    CONTACT_HASH_SECRET: config.hashSecret };
  assert(getContactConfig(env));
  for (const patch of [
    { CONTACT_ALLOWED_ORIGINS: "https://galaxy.example/path" }, { CONTACT_ALLOWED_ORIGINS: "http://evil.example" },
    { CONTACT_FROM_EMAIL: "a@example.com\r\nBcc: b@example.com" }, { CONTACT_EMAIL: "bad" }, { CONTACT_HASH_SECRET: "short" },
    { NODE_ENV: "production", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA" },
    { UPSTASH_REDIS_REST_URL: "http://localhost:1234" },
  ]) assert.equal(getContactConfig({ ...env, ...patch }), null);
});
