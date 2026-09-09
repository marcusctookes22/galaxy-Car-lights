import { z } from "zod";

const clean = (value: string | undefined) => value?.trim() ?? "";
const originSchema = z.string().url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return !url.username && !url.password && url.origin === value &&
    (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)));
});
const serverSchema = z.object({
  origins: z.array(originSchema).min(1),
  to: z.email(),
  from: z.string().min(1).max(320).refine((value) => {
    if (/[\r\n\u0000]/.test(value)) return false;
    const address = value.match(/^[^<>\r\n]+<([^<>]+)>$/)?.[1] ?? value;
    return z.email().safeParse(address).success;
  }),
  resendKey: z.string().min(1),
  siteKey: z.string().min(1),
  turnstileSecret: z.string().min(1),
  redisUrl: z.string().url().refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".upstash.io") && !url.username && !url.password && !url.search && !url.hash && url.pathname === "/";
  }),
  redisToken: z.string().min(1),
  hashSecret: z.string().min(32),
  vercel: z.boolean(),
});

export type ContactConfig = z.infer<typeof serverSchema>;

// No bypass or in-memory fallback: incomplete configuration disables delivery.
export function getContactConfig(env: Record<string, string | undefined> = process.env): ContactConfig | null {
  if (env.CONTACT_DELIVERY_ENABLED !== "true") return null;
  const result = serverSchema.safeParse({
    origins: clean(env.CONTACT_ALLOWED_ORIGINS).split(",").map((value) => value.trim()).filter(Boolean),
    to: clean(env.CONTACT_EMAIL), from: clean(env.CONTACT_FROM_EMAIL),
    resendKey: clean(env.RESEND_API_KEY), siteKey: clean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    turnstileSecret: clean(env.TURNSTILE_SECRET_KEY),
    redisUrl: clean(env.UPSTASH_REDIS_REST_URL), redisToken: clean(env.UPSTASH_REDIS_REST_TOKEN),
    hashSecret: clean(env.CONTACT_HASH_SECRET), vercel: env.VERCEL === "1",
  });
  if (!result.success) return null;
  // Cloudflare publishes dummy keys; never accept them in a deployed environment.
  if ((env.VERCEL === "1" || env.NODE_ENV === "production") &&
      (/^[123]x0+/.test(result.data.siteKey) || /^[123]x0+/.test(result.data.turnstileSecret))) return null;
  return result.data;
}
