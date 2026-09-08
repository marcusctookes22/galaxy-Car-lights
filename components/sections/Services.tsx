import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/services";

export function Services() {
  return (
    <section className="section-space" id="services">
      <Container>
        <SectionHeading
          eyebrow="Our capabilities"
          title={<>Designed around the <span className="serif-gold">experience.</span></>}
          copy="No generic packages forced onto the vehicle. Each installation is planned around the car, the finish and the atmosphere you want to create."
        />
        <div className="border-t border-white/10">
          {services.map((service) => (
            <a
              key={service.id}
              href="#quote"
              data-service={service.quoteValue}
              className="group relative grid min-h-40 grid-cols-[64px_1.05fr_1fr_32px] items-center gap-x-8 gap-y-3 border-b border-white/10 py-8 transition-colors duration-300 hover:bg-white/[.025] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)] max-lg:grid-cols-[44px_1fr_32px] max-sm:grid-cols-[26px_1fr_24px] max-sm:gap-x-4"
            >
              <span className="relative text-[11px] tracking-[.16em] text-neutral-500">{service.number}</span>
              <h3 className="relative text-[clamp(1.6rem,2.65vw,2.65rem)] font-light tracking-[-.035em] transition-colors group-hover:text-[var(--gold-hi)]">{service.title}</h3>
              <p className="relative max-w-[420px] text-sm leading-7 text-[#a9a9a6] max-lg:col-start-2 max-lg:row-start-2">
                {service.description}
              </p>
              <span className="relative text-2xl text-neutral-500 transition group-hover:translate-x-1 group-hover:text-[var(--gold)] max-lg:col-start-3 max-lg:row-start-1" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
