"use client";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/ui/Brand";
import { Container } from "@/components/ui/Container";
const navItems = [["Services","#services"],["Design studio","#headliner"],["Inspiration","#work"],["Process","#process"],["FAQ","#faq"]] as const;
export function Navbar() {
  const [open,setOpen] = useState(false);
  const [scrolled,setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (desktop.matches && dialogRef.current?.open) {
        dialogRef.current.close();
        setOpen(false);
        homeRef.current?.focus({preventScroll:true});
      }
    };
    onScroll();
    window.addEventListener("scroll",onScroll,{passive:true});
    desktop.addEventListener("change",onResize);
    return () => { window.removeEventListener("scroll",onScroll); desktop.removeEventListener("change",onResize); };
  },[]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  },[open]);
  const closeMenu = () => { dialogRef.current?.close(); setOpen(false); triggerRef.current?.focus({preventScroll:true}); };
  const navigate = (href:string) => {
    closeMenu();
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      target.setAttribute("tabindex","-1");
      target.focus({preventScroll:true});
      target.addEventListener("blur",() => target.removeAttribute("tabindex"),{once:true});
    });
  };
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled ? "border-white/10 bg-[#060606]/95 backdrop-blur-lg" : "border-transparent bg-gradient-to-b from-black/55 to-transparent"}`}>
      <Container className="flex h-24 items-center justify-between gap-5 max-sm:h-20">
        <a ref={homeRef} href="#top" aria-label="Galaxy Car Lights home"><Brand /></a>
        <nav aria-label="Primary navigation" className="flex items-center gap-7 max-lg:hidden">
          {navItems.map(([label,href]) => <a key={href} href={href} className="py-3 text-[13px] text-[#c4c1b9] transition-colors hover:text-[var(--gold-hi)]">{label}</a>)}
          <a className="button-base border-[var(--gold)]/50" href="#quote">Start your build <span aria-hidden="true">↗</span></a>
        </nav>
        <button ref={triggerRef} type="button" className="hidden min-h-11 items-center gap-3 px-2 text-sm max-lg:flex" aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu" onClick={() => { dialogRef.current?.showModal(); setOpen(true); }}>
          Menu <span className="grid gap-1.5" aria-hidden="true"><span className="h-px w-6 bg-current" /><span className="h-px w-6 bg-current" /></span>
        </button>
      </Container>
    </header>
    <dialog ref={dialogRef} id="mobile-menu" aria-label="Site navigation" onCancel={closeMenu} onClose={() => setOpen(false)} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-[#090909] px-[var(--page-pad)] text-[var(--text)] backdrop:bg-black/70">
      <div className="flex h-20 items-center justify-between"><Brand compact /><button type="button" className="min-h-11 px-2 text-sm" onClick={closeMenu} autoFocus>Close <span aria-hidden="true" className="ml-2 text-xl">×</span></button></div>
      <nav aria-label="Mobile navigation" className="mx-auto flex min-h-[calc(100%-80px)] max-w-xl flex-col justify-center py-8">
        {navItems.map(([label,href],i) => <a key={href} href={href} onClick={() => navigate(href)} className="flex items-center gap-5 border-b border-white/12 py-4 text-[clamp(1.5rem,6vw,2.75rem)] font-light tracking-[-.035em]"><span className="text-xs tracking-normal text-[var(--gold)]">0{i+1}</span>{label}</a>)}
        <a className="button-base button-primary mt-8" href="#quote" onClick={() => navigate("#quote")}>Start your build <span aria-hidden="true">↗</span></a>
        <p className="mt-6 text-sm leading-6 text-[var(--muted)]">Starlights. Ambient Lights. Rock Lights.<br />A lighting experience of your own.</p>
      </nav>
    </dialog>
  </>;
}
