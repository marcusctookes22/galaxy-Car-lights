import Image from "next/image";
import { HeroStarField } from "@/components/effects/HeroStarField";
import { Container } from "@/components/ui/Container";
export function Hero() {
  return <section id="top" className="relative isolate flex min-h-[min(900px,100svh)] items-end overflow-hidden border-b border-white/10 max-sm:min-h-[780px]">
    <Image src="/images/hero.webp" alt="Black Rolls-Royce photographed after dark" fill preload sizes="100vw" className="-z-30 object-cover object-[60%_57%] max-sm:object-[50%_48%]" />
    <div className="hero-shade absolute inset-0 -z-20" />
    <HeroStarField />
    <Container className="relative z-10 pt-40 pb-20 max-sm:pt-64 max-sm:pb-16">
      <p className="mb-7 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[.16em] text-[#d5d1c6] before:h-px before:w-8 before:bg-[var(--gold)]">Bespoke automotive lighting</p>
      <h1 className="hero-title max-w-[760px]"><span className="block">LIGHT</span><em className="serif-gold block">beyond</em><span className="block">ORDINARY.</span></h1>
      <div className="mt-8 flex items-end justify-between gap-10">
        <div className="max-w-[460px]">
          <p className="text-[15px] leading-7 text-[#c4c1b9]">Custom starlights, ambient lights and rock lights. Made for the way you want to feel after dark.</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 max-sm:gap-x-5">
            <a className="button-base button-primary" href="#services">Explore the possibilities <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#headliner">Design your sky <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <a href="#headliner" className="max-w-[220px] border-t border-[var(--gold)]/50 pt-5 text-sm leading-6 text-neutral-300 max-lg:hidden">Your own constellation.<br /><span className="text-[var(--gold-hi)]">Enter the headliner studio ↗</span></a>
      </div>
    </Container>
  </section>;
}
