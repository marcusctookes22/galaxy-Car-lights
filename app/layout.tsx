import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { publicPath } from "@/lib/publicPath";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://galaxycarlights.com",
  ),
  title: "Galaxy Car Lights LLC — Luxury Automotive Lighting",
  icons: { icon: { url: publicPath("/brand/galaxy-logo.webp"), type: "image/webp" } },
  description:
    "Bespoke automotive lighting — starlights with an optional Shooting Star effect, ambient lights, and rock lights.",
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
