export function getBusinessLinks(env: Record<string, string | undefined> = process.env) {
  const phone = env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "";
  const validPhone = /^\+?[\d ().-]+$/.test(phone) && phone.replace(/\D/g, "").length >= 7 && phone.replace(/\D/g, "") !== "10000000000";
  let instagram = "";
  try {
    const url = new URL(env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "");
    if (url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password) instagram = url.href;
  } catch { /* Missing public details intentionally produce no contact link. */ }
  return { phone: validPhone ? phone : "", instagram };
}

export const siteConfig = {
  name: "Galaxy Car Lights LLC",
  shortName: "Galaxy Car Lights",
  description:
    "Bespoke automotive lighting — starlights with an optional Shooting Star effect, ambient lights, and rock lights.",
  ...getBusinessLinks({ NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE, NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL }),
} as const;
