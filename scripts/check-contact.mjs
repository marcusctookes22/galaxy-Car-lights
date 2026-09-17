import { createRequire } from "node:module";
import { getContactConfig } from "../lib/contact/config.server.ts";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const required = [
  "CONTACT_ALLOWED_ORIGINS", "CONTACT_EMAIL", "CONTACT_FROM_EMAIL", "RESEND_API_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY", "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN", "CONTACT_HASH_SECRET",
];
const missing = required.filter((name) => !process.env[name]?.trim());
// Report variable names only; never print secrets or the parsed configuration.
if (process.env.STATIC_EXPORT === "true") {
  console.error("Static preview: delivery is always disabled. Run this check for the server build.");
  process.exitCode = 1;
} else if (missing.length) {
  console.error(`Missing contact settings: ${missing.join(", ")}`);
  process.exitCode = 1;
} else if (!getContactConfig({ ...process.env, CONTACT_DELIVERY_ENABLED: "true" })) {
  console.error("Invalid contact settings. Check exact origins, sender/recipient, HTTPS Upstash URL, hash length, and production Turnstile keys against docs/PHASE_3_WORK.md.");
  process.exitCode = 1;
} else {
  console.log(`Contact configuration is valid. Delivery is ${process.env.CONTACT_DELIVERY_ENABLED === "true" ? "enabled" : "disabled"}.`);
  console.log("This checks configuration format only. Provider access and inbox receipt still require a live smoke test.");
}
