export const siteConfig = {
  name: "Galaxy Car Lights LLC",
  shortName: "Galaxy Car Lights",
  description:
    "Bespoke automotive lighting — starlights with an optional Shooting Star effect, ambient lights, and rock lights.",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "",
} as const;
