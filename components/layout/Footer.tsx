import { Brand } from "@/components/ui/Brand";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import { services } from "@/data/services";
export function Footer() {
  const connect = [
    ["Prepare an enquiry","#quote"],["Design your headliner","#headliner"],
    ...(siteConfig.phone ? [["Call",`tel:${siteConfig.phone}`],["Text",`sms:${siteConfig.phone}`]] : []),
    ...(siteConfig.instagram ? [["Instagram",siteConfig.instagram]] : []),
  ];
  return <footer className="bg-[#060606] pt-16 pb-8 max-sm:pb-28">
    <Container>
      <div className="grid grid-cols-[1.2fr_.7fr_1fr_1fr] gap-10 pb-14 max-lg:grid-cols-2 max-sm:gap-x-6">
        <div className="max-sm:col-span-2"><a href="#top" aria-label="Galaxy Car Lights home"><Brand /></a><p className="mt-5 max-w-[290px] text-sm leading-7 text-[var(--muted)]">Star lights. Luxury drives.<br />Automotive lighting with a personal point of view.</p></div>
        <FooterColumn title="Explore" links={[["Services","#services"],["Inspiration","#work"],["Process","#process"],["FAQ","#faq"]]} />
        <div><h2 className="mb-4 text-xs uppercase tracking-[.12em] text-[var(--gold-hi)]">Experiences</h2>{services.map(s=><a key={s.id} href="#quote" data-service={s.quoteValue} className="block py-2 text-sm text-[var(--muted)] hover:text-[var(--gold-hi)]">{s.title}</a>)}</div>
        <FooterColumn title="Start a conversation" links={connect} />
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-xs leading-6 text-[var(--muted)]"><span>© 2026 Galaxy Car Lights LLC</span><span>  </span></div>
    </Container>
  </footer>;
}
function FooterColumn({title,links}:{title:string;links:readonly (readonly string[])[]}) {
  return <div><h2 className="mb-4 text-xs uppercase tracking-[.12em] text-[var(--gold-hi)]">{title}</h2>{links.map(([label,href])=><a key={label} href={href} className="block py-2 text-sm text-[var(--muted)] hover:text-[var(--gold-hi)]">{label}</a>)}</div>;
}
