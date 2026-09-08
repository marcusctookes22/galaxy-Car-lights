import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { additionalTestimonials, testimonials } from "@/data/testimonials";
import type { Testimonial } from "@/types/content";

export function Testimonials() {
  return (
    <section id="client-experience" className="section-space border-y border-white/10 bg-[#080808]">
      <Container>
        <SectionHeading
          eyebrow="Client experience"
          title={<>Trust is part of<br />the <span className="serif-gold">finish.</span></>}
          copy="Thoughtful details. A personal experience. An interior that feels like you. The sample reviews below illustrate that vision; they are not verified customer reviews."
        />
        <div className="grid grid-cols-3 gap-10 max-lg:grid-cols-1">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.quote} testimonial={testimonial} />
          ))}
        </div>
        <details id="more-experiences" className="group/reviews mt-12 border-y border-white/15">
          <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-5 py-6 text-[var(--gold-hi)] transition-colors hover:bg-white/[.025] motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-[.16em] text-neutral-400">Client experience · {additionalTestimonials.length} preview testimonials</span>
              <span className="mt-2 block text-[clamp(1.3rem,2vw,1.75rem)] font-light tracking-[-.025em]">
                <span className="group-open/reviews:hidden">Explore more experiences</span>
                <span className="hidden group-open/reviews:inline">Close more experiences</span>
              </span>
            </span>
            <span className="relative mr-1 flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/40" aria-hidden="true">
              <span className="absolute h-px w-4 bg-current" />
              <span className="absolute h-4 w-px bg-current transition-transform duration-200 group-open/reviews:rotate-90 motion-reduce:transition-none" />
            </span>
          </summary>
          <div className="border-t border-white/10 pt-7 pb-8">
            <p className="mb-7 max-w-xl text-sm leading-7 text-[var(--muted)]"> </p>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {additionalTestimonials.map((testimonial) => <TestimonialCard key={testimonial.quote} testimonial={testimonial} />)}
            </div>
          </div>
        </details>
      </Container>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="flex min-w-0 flex-col border-t border-white/15 pt-6">
      <blockquote className="my-7 flex-1 font-[family-name:var(--font-playfair)] text-[25px] leading-[1.5] font-normal tracking-[-.02em] text-[#e2dfd7] max-sm:text-[23px]">“{testimonial.quote}”</blockquote>
      <cite className="text-[11px] not-italic uppercase tracking-[.12em] text-[#a9a9a6]">{testimonial.attribution.replace(/^Demo Review · /, "")}</cite>
    </article>
  );
}
