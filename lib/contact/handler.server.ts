import { getContactConfig, type ContactConfig } from "./config.server.ts";
import { contactSchema } from "./schema.ts";
import { ContactFailure, enforceRateLimit, unavailable, verifyTurnstile } from "./protection.server.ts";
import { deliverEmail } from "./email.server.ts";
import type { ContactResponse } from "./contract.ts";

const MAX_BYTES = 16_384;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const json = (body: ContactResponse, status: number, extra: Record<string, string> = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });

async function readBody(request: Request): Promise<unknown> {
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BYTES)) {
    throw new ContactFailure(413, "too_large", "Your request is too large. Please shorten your notes.");
  }
  if (!request.body) throw new ContactFailure(400, "invalid_json", "Please check your request and try again.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}); }, 5000);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (timedOut) throw new ContactFailure(408, "timeout", "The request took too long. Please try again.");
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        void reader.cancel().catch(() => {});
        throw new ContactFailure(413, "too_large", "Your request is too large. Please shorten your notes.");
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer)); }
    catch { throw new ContactFailure(400, "invalid_json", "Please check your request and try again."); }
  } finally { clearTimeout(timer); reader.releaseLock(); }
}

// Dependency injection is only for tests; the public route always uses real providers.
export async function handleContact(request: Request, options: { config?: ContactConfig | null; fetcher?: typeof fetch } = {}) {
  try {
    if (request.method !== "POST") return json({ ok: false, code: "method_not_allowed", message: "Use the quote form to send your request." }, 405, { Allow: "POST" });
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      throw new ContactFailure(415, "unsupported_media_type", "Please send your request using the quote form.");
    }
    const config = options.config === undefined ? getContactConfig() : options.config;
    if (!config) throw unavailable();
    const origin = request.headers.get("origin");
    if (!origin || !config.origins.includes(origin) || request.headers.get("sec-fetch-site") === "cross-site") {
      throw new ContactFailure(403, "invalid_origin", "Please send your request from this website.");
    }
    const fetcher = options.fetcher ?? fetch;
    await enforceRateLimit(request, config, fetcher);
    const body = await readBody(request);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return json({ ok: false, code: "validation_failed", message: "Please check the form details and try again.", fieldErrors }, 400);
    }
    await verifyTurnstile(parsed.data.turnstileToken, origin, config, fetcher);
    await deliverEmail(parsed.data, config, fetcher);
    return json({ ok: true, message: "Your quote request has been sent. Galaxy Car Lights will contact you about your build." }, 200);
  } catch (error) {
    const failure = error instanceof ContactFailure ? error : unavailable();
    return json({ ok: false, code: failure.code, message: failure.message }, failure.status, failure.retryAfter ? { "Retry-After": String(failure.retryAfter) } : {});
  }
}
