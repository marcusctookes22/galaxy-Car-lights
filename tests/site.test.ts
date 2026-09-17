import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPublication } from "../lib/publication.ts";
import { contactDetailsSchema } from "../lib/contact/schema.ts";
import { getBusinessLinks } from "../lib/site.ts";

test("missing and known dummy contact values never become public links", () => {
  assert.deepEqual(getBusinessLinks({}), { phone: "", instagram: "" });
  assert.deepEqual(getBusinessLinks({ NEXT_PUBLIC_CONTACT_PHONE: "+10000000000", NEXT_PUBLIC_INSTAGRAM_URL: "javascript:alert(1)" }), { phone: "", instagram: "" });
  assert.equal(getBusinessLinks({ NEXT_PUBLIC_CONTACT_PHONE: "+1 202 555 0142" }).phone, "+1 202 555 0142");
});

test("preview never assumes a domain or allows indexing by default", () => {
  assert.deepEqual(getPublication({}), { url: null, indexable: false });
  assert.equal(getPublication({ NEXT_PUBLIC_SITE_URL: "https://galaxy.example" }).indexable, false);
});

test("indexing requires explicit approval and a public HTTPS origin", () => {
  const enabled = { SITE_INDEXING_ENABLED: "true" };
  for (const url of ["", "bad url", "http://galaxy.example", "https://localhost", "https://127.0.0.1", "https://user:password@galaxy.example", "https://galaxy.example/path", "https://galaxy.example/?secret=yes"]) {
    assert.equal(getPublication({ ...enabled, NEXT_PUBLIC_SITE_URL: url }).indexable, false, url);
  }
  assert.deepEqual(getPublication({ ...enabled, NEXT_PUBLIC_SITE_URL: "https://galaxy.example/" }), { url: "https://galaxy.example", indexable: true });
  assert.equal(getPublication({ ...enabled, NEXT_PUBLIC_SITE_URL: "https://galaxy.example", VERCEL_ENV: "preview" }).indexable, false);
});

test("publication URLs include the static base path exactly once", () => {
  assert.equal(getPublication({ NEXT_PUBLIC_SITE_URL: "https://galaxy.example", NEXT_PUBLIC_BASE_PATH: "/demo/" }).url, "https://galaxy.example/demo");
  assert.equal(getPublication({ NEXT_PUBLIC_SITE_URL: "https://galaxy.example", NEXT_PUBLIC_BASE_PATH: "https://evil.example" }).url, null);
});

test("GitHub Pages workflow supplies publication settings that preserve social metadata", () => {
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  const env = Object.fromEntries([...workflow.matchAll(/^\s+(NEXT_PUBLIC_(?:SITE_URL|BASE_PATH)): (\S+)$/gm)].map((match) => [match[1], match[2]]));
  assert.equal(getPublication(env).url, 'https://marcusctookes22.github.io/galaxy-Car-lights');
  assert.equal(getPublication(env).indexable, false);
});

const details = { year: "2024", make: " BMW ", model: " M4 ", service: "Starlights", name: "Example Driver", phone: "+1 202 555 0142", email: "driver@example.com", message: "Warm gold", design: "", shootingStar: true, website: "" };
test("local review validates and normalizes the full enquiry without consent or provider tokens", () => {
  const parsed = contactDetailsSchema.parse(details);
  assert.equal(parsed.make, "BMW");
  assert.equal(parsed.model, "M4");
  assert.equal(parsed.shootingStar, true);
  assert.equal(parsed.message, "Warm gold");
});

test("local review rejects invalid year, phone, controls, service and incompatible add-on", () => {
  for (const invalid of [{ year: "0000" }, { phone: "1" }, { name: "Person\u0000" }, { service: "Made up" }, { design: "Night Sky", shootingStar: true }]) {
    assert.equal(contactDetailsSchema.safeParse({ ...details, ...invalid }).success, false);
  }
});
