import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type { ContactConfig } from "./config.server.ts";

export class ContactFailure extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfter?: number;
  constructor(status: number, code: string, message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export const unavailable = () => new ContactFailure(503, "unavailable", "Quote delivery is temporarily unavailable. Your details are still here. Please try again later.");

export async function externalJson(url: string, init: RequestInit, fetcher: typeof fetch = fetch): Promise<unknown> {
  const response = await fetcher(url, { ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw unavailable();
  return response.json();
}

export function clientBucket(request: Request, config: ContactConfig): string {
  // Only Vercel's overwritten header is trusted. Else all clients share a safe bucket.
  const candidate = config.vercel ? request.headers.get("x-vercel-forwarded-for")?.trim() : undefined;
  let address = candidate && isIP(candidate) ? candidate : "shared";
  if (isIP(address) === 6) {
    const normalized = new URL(`http://[${address}]`).hostname.slice(1, -1);
    const [left, right = ""] = normalized.split("::");
    const first = left ? left.split(":") : [];
    const last = right ? right.split(":") : [];
    const parts = normalized.includes("::") ? [...first, ...Array(8 - first.length - last.length).fill("0"), ...last] : first;
    address = `${parts.slice(0, 4).map((part: string) => part.padStart(4, "0")).join(":")}/64`;
  }
  return createHmac("sha256", config.hashSecret).update(address).digest("hex");
}

// One atomic operation across instances. Keys expire; no request contents or raw IPs are stored.
export const RATE_LIMIT_SCRIPT = `
local limits = {5, 60}
local windows = {600, 3600}
for i = 1, 2 do
  local count = tonumber(redis.call('GET', KEYS[i]) or '0')
  if count >= limits[i] then
    return {0, math.max(1, redis.call('TTL', KEYS[i]))}
  end
end
for i = 1, 2 do
  local count = redis.call('INCR', KEYS[i])
  if count == 1 then redis.call('EXPIRE', KEYS[i], windows[i]) end
end
return {1, 0}
`;

export async function enforceRateLimit(request: Request, config: ContactConfig, fetcher: typeof fetch = fetch) {
  const result = await externalJson(config.redisUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", RATE_LIMIT_SCRIPT, "2", `contact:{quotes}:ip:${clientBucket(request, config)}`, "contact:{quotes}:global"]),
  }, fetcher) as { result?: unknown; error?: unknown } | null;
  if (!result || result.error || !Array.isArray(result.result) || result.result.length !== 2) throw unavailable();
  const [allowed, retry] = result.result;
  if (allowed === 0 && Number.isInteger(retry) && retry >= 1 && retry <= 3600) {
    throw new ContactFailure(429, "rate_limited", "Too many requests. Please wait before trying again.", retry);
  }
  if (allowed !== 1 || retry !== 0) throw unavailable();
}

export async function verifyTurnstile(token: string, origin: string, config: ContactConfig, fetcher: typeof fetch = fetch) {
  const result = await externalJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: config.turnstileSecret, response: token }),
  }, fetcher) as { success?: unknown; hostname?: unknown; action?: unknown } | null;
  if (!result || result.success !== true || result.hostname !== new URL(origin).hostname || result.action !== "contact") {
    throw new ContactFailure(400, "verification_failed", "The security check expired or could not be verified. Please complete it again.");
  }
}
