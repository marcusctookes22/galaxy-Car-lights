import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="section-space border-y border-white/10 bg-[#080808]">
      <Container>
        <SectionHeading
          eyebrow="Client experience"
          title={<>Trust is part of<br />the <span className="serif-gold">finish.</span></>}
          copy="Thoughtful details. A personal experience. An interior that feels like you. The sample reviews below illustrate that vision; they are not verified customer reviews."
        />
        <div className="grid grid-cols-3 gap-10 max-lg:grid-cols-1">
          {testimonials.map((testimonial) => (
            <article key={testimonial.attribution} className="flex flex-col border-t border-white/15 pt-6">
              <div className="text-[10px] uppercase tracking-[.16em] text-[var(--gold)]">Sample review</div>
              <blockquote className="my-7 flex-1 font-[family-name:var(--font-playfair)] text-[25px] leading-[1.5] font-normal tracking-[-.02em] text-[#e2dfd7] max-sm:text-[23px]">“{testimonial.quote}”</blockquote>
              <cite className="text-[11px] not-italic uppercase tracking-[.12em] text-[#a9a9a6]">{testimonial.attribution.replace(/^Demo Review · /, "")}</cite>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
