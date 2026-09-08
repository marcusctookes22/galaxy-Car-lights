import { QuoteForm } from "@/components/quote/QuoteForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function QuoteSection() {
  return (
    <section className="section-space relative overflow-hidden before:pointer-events-none before:absolute before:top-24 before:-right-52 before:size-[700px] before:bg-[radial-gradient(circle,rgba(217,176,79,.06),transparent_65%)] before:content-['']" id="quote" aria-labelledby="quote-heading">
      <Container className="relative grid grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] gap-16 max-lg:grid-cols-1 max-lg:gap-10">
        <aside className="sticky top-30 self-start max-lg:static">
          <Eyebrow>Make it personal</Eyebrow>
          <h2 id="quote-heading" tabIndex={-1} className="section-title my-5">Start your<br /><span className="serif-gold">build.</span></h2>
          <p className="section-copy max-w-[390px]">Bring your ideas together. Add your vehicle, choose a lighting experience, and review the details of your enquiry.</p>
          <div className="mt-8 h-px bg-white/10" />
          <p className="mt-6 max-w-[360px] text-sm leading-7 text-neutral-400">This is an enquiry preview. No details are sent and no booking is made.</p>
        </aside>
        <QuoteForm />
      </Container>
    </section>
  );
}
