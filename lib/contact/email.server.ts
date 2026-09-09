import { createHmac } from "node:crypto";
import { CONTACT_CONSENT_TEXT, CONTACT_CONSENT_VERSION } from "./contract.ts";
import type { ContactConfig } from "./config.server.ts";
import type { ValidContact } from "./schema.ts";
import { ContactFailure, externalJson } from "./protection.server.ts";

export function emailPayload(input: ValidContact, config: ContactConfig) {
  // Plain-text email: visitor input is never interpreted as HTML or email headers.
  const text = [
    "New Galaxy Car Lights quote request",
    `Vehicle: ${input.year} ${input.make} ${input.model}`,
    `Service: ${input.service}${input.shootingStar ? " + Shooting Star" : ""}`,
    `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.phone}`,
    "", "Headliner concept:", input.design || "No attached concept.",
    "", "Build notes:", input.message || "No additional notes.",
    "", `Contact consent: Yes (${CONTACT_CONSENT_VERSION})`, CONTACT_CONSENT_TEXT,
  ].join("\n");
  return { from: config.from, to: [config.to], reply_to: input.email, subject: "New quote request — Galaxy Car Lights", text };
}

export async function deliverEmail(input: ValidContact, config: ContactConfig, fetcher: typeof fetch = fetch) {
  const payload = emailPayload(input, config);
  // Stable for the same reviewed request, including retries after an uncertain response.
  const key = createHmac("sha256", config.hashSecret).update(input.submissionId).update(JSON.stringify(payload)).digest("hex");
  try {
    const result = await externalJson("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `quote/${key}` },
      body: JSON.stringify(payload),
    }, fetcher) as { id?: unknown } | null;
    if (!result || typeof result.id !== "string" || !result.id) throw new Error("Provider did not accept the message");
  } catch {
    throw new ContactFailure(502, "delivery_failed", "We couldn't confirm delivery. Your details are still here; please try again.");
  }
}
