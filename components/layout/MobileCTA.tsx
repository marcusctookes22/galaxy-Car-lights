"use client";
import { useEffect,useState } from "react";
import { siteConfig } from "@/lib/site";
export function MobileCTA() {
  const [inClosingArea,setInClosingArea] = useState(false);
  useEffect(() => {
    const closingSection = document.querySelector("#next-chapter");
    if (!closingSection) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Stay visible through the footer, then hide when scrolling above this section.
      setInClosingArea(entry.boundingClientRect.top <= (entry.rootBounds?.bottom ?? window.innerHeight));
    });
    observer.observe(closingSection);
    return ()=>observer.disconnect();
  },[]);
  if (!inClosingArea) return null;
  return <div className="mobile-actions fixed inset-x-4 z-40 hidden grid-cols-[1fr_1.25fr] border border-white/15 bg-[#0b0b0b]/95 shadow-xl backdrop-blur-md max-sm:grid">
    <a className="grid min-h-13 place-items-center px-3 text-xs text-[#d0cbc0]" href={siteConfig.phone ? `tel:${siteConfig.phone}` : "#headliner"}>{siteConfig.phone ? "Call" : "Design your sky"}</a>
    <a className="grid min-h-13 place-items-center bg-[var(--text)] px-3 text-xs font-semibold text-[#090909]" href="#quote">Start your build ↗</a>
  </div>;
}
