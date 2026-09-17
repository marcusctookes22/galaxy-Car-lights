// Build-time publication settings only. No credentials or assumed business domain.
export function getPublication(env: Record<string, string | undefined> = process.env): { url: string | null; indexable: boolean } {
  try {
    const origin = new URL(env.NEXT_PUBLIC_SITE_URL?.trim() || "");
    const basePath = (env.NEXT_PUBLIC_BASE_PATH?.trim() || "").replace(/\/$/, "");
    if (origin.protocol !== "https:" || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/" || origin.port) throw new Error("Use an HTTPS origin.");
    if (origin.hostname === "localhost" || origin.hostname.endsWith(".localhost") || origin.hostname.endsWith(".local") || /^[\d.]+$/.test(origin.hostname) || origin.hostname.includes(":")) throw new Error("Use a public hostname.");
    if (basePath && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(basePath)) throw new Error("Invalid base path.");
    return { url: `${origin.origin}${basePath}`, indexable: env.SITE_INDEXING_ENABLED === "true" && (!env.VERCEL_ENV || env.VERCEL_ENV === "production") };
  } catch { return { url: null, indexable: false }; }
}
