import type { MetadataRoute } from "next";
import { getPublication } from "@/lib/publication";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const { url, indexable } = getPublication();
  return indexable && url ? [{ url: `${url}/` }] : [];
}
