import type { MetadataRoute } from "next";
import { getPublication } from "@/lib/publication";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  const { url, indexable } = getPublication();
  return indexable && url
    ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${url}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
