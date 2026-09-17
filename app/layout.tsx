import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { publicPath } from "@/lib/publicPath";
import { getPublication } from "@/lib/publication";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const manrope = localFont({
  src: "../public/fonts/manrope-latin.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

const playfair = localFont({
  src: "../public/fonts/playfair-display-latin.woff2",
  variable: "--font-playfair",
  display: "swap",
  weight: "400 900",
});

const publication = getPublication();

export const metadata: Metadata = {
  ...(publication.url ? { metadataBase: new URL(`${publication.url}/`) } : {}),
  title: "Galaxy Car Lights LLC — Luxury Automotive Lighting",
  icons: { icon: { url: publicPath("/brand/galaxy-logo.webp"), type: "image/webp" } },
  description: siteConfig.description,
  robots: { index: publication.indexable, follow: publication.indexable },
  openGraph: {
    type: "website", locale: "en_US", siteName: siteConfig.shortName,
    title: "Galaxy Car Lights — Make the night yours.", description: siteConfig.description,
    ...(publication.url ? { images: [{ url: `${publication.url}/brand/social-card.png`, width: 1200, height: 630, alt: "Galaxy Car Lights — Starlights, ambient lights and rock lights" }] } : {}),
  },
  twitter: { card: "summary_large_image", title: siteConfig.shortName, description: siteConfig.description,
    ...(publication.url ? { images: [`${publication.url}/brand/social-card.png`] } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
