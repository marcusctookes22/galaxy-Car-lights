"use client";
import { useEffect,useState } from "react";
import { siteConfig } from "@/lib/site";
export function MobileCTA() {
  const [inQuote,setInQuote] = useState(false);
  useEffect(() => {
    const quote = document.querySelector("#quote");
    if (!quote) return;
    const observer = new IntersectionObserver(([entry])=>setInQuote(entry.isIntersecting));
    observer.observe(quote);
    return ()=>observer.disconnect();
  },[]);
  if (inQuote) return null;
  return <div className="mobile-actions fixed inset-x-4 z-40 hidden grid-cols-[1fr_1.25fr] border border-white/15 bg-[#0b0b0b]/95 shadow-xl backdrop-blur-md max-sm:grid">
    <a className="grid min-h-13 place-items-center px-3 text-xs text-[#d0cbc0]" href={siteConfig.phone ? `tel:${siteConfig.phone}` : "#headliner"}>{siteConfig.phone ? "Call" : "Design your sky"}</a>
    <a className="grid min-h-13 place-items-center bg-[var(--text)] px-3 text-xs font-semibold text-[#090909]" href="#quote">Start your build ↗</a>
  </div>;
}
