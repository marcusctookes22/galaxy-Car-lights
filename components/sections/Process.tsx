import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { processSteps } from "@/data/process";

export function Process() {
  return (
    <section className="section-space" id="process">
      <Container>
        <SectionHeading
          eyebrow="The process"
          title={<>Simple from idea<br />to <span className="serif-gold">installation.</span></>}
          copy="Bring us your vision. We’ll help shape the details, walk you through your options and plan an installation around your vehicle."
        />
        <div className="grid grid-cols-4 gap-x-10 gap-y-12 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-y-8">
          {processSteps.map((step) => (
            <article key={step.number} className="flex min-h-[230px] flex-col justify-between border-t border-white/15 pt-6 max-sm:min-h-0 max-sm:gap-6">
              <span className="text-[12px] tracking-[.12em] text-[var(--gold)]">{step.number}<span className="ml-3 text-neutral-600" aria-hidden="true">/</span></span>
              <div>
                <h3 className="mb-3 text-[22px] font-normal tracking-[-.035em]">{step.title}</h3>
                <p className="max-w-[290px] text-sm leading-7 text-[#a9a9a6]">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
