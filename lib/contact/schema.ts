import { z } from "zod";
import { services } from "../../data/services.ts";

const singleLine = (max: number) => z.string().max(max).refine(
  (value) => !/[\p{Cc}\p{Cf}\u2028\u2029]/u.test(value), "Use plain text on one line.",
).transform((value) => value.normalize("NFC").trim().replace(/\s+/gu, " "));
const requiredLine = (max: number) => singleLine(max).pipe(z.string().min(1, "This field is required."));
const multiline = (max: number) => z.string().max(max).refine(
  (value) => !/[\p{Cc}\p{Cf}]/u.test(value.replace(/[\r\n\t]/g, "")),
  "Remove unsupported control characters.",
).transform((value) => value.normalize("NFC").replace(/\r\n?/g, "\n").trim());

export const contactSchema = z.strictObject({
  submissionId: z.uuid(),
  year: requiredLine(4).pipe(z.string().regex(/^\d{4}$/, "Enter a four-digit year.")).refine(
    (value) => Number(value) >= 1886 && Number(value) <= new Date().getUTCFullYear() + 2,
    "Enter a valid vehicle year.",
  ),
  make: requiredLine(80),
  model: requiredLine(100),
  service: requiredLine(100).refine((value) => services.some((service) => service.quoteValue === value), "Choose an available service."),
  name: requiredLine(100),
  phone: requiredLine(40).refine((value) => /^[+\d().\- ]+$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 7 && (value.match(/\d/g)?.length ?? 0) <= 15, "Enter a valid phone number."),
  email: requiredLine(254).pipe(z.email("Enter a valid email address.")),
  message: multiline(3000),
  design: singleLine(1000),
  shootingStar: z.boolean(),
  consent: z.literal(true, { error: "Please agree to being contacted about your quote." }),
  website: z.string().max(200).refine((value) => value === "", "Unable to accept this request."),
  turnstileToken: z.string().min(1, "Complete the security check.").max(2048),
}).superRefine((value, ctx) => {
  if (value.shootingStar && (value.service !== "Starlights" || value.design !== "")) {
    ctx.addIssue({ code: "custom", path: ["shootingStar"], message: "Choose this option with Starlights, or use the effects in your attached design." });
  }
});

export type ValidContact = z.infer<typeof contactSchema>;
