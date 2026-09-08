import { HeadlinerDesigner } from "@/components/designer/HeadlinerDesigner";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HeadlinerSection() {
  return (
    <section className="relative overflow-clip border-y border-white/10 bg-[#070707] section-space before:pointer-events-none before:absolute before:-top-56 before:-left-80 before:size-[760px] before:bg-[radial-gradient(circle,rgba(217,176,79,.07),transparent_64%)] before:content-['']" id="headliner">
      <Container className="relative">
        <SectionHeading
          eyebrow="Interactive design studio"
          title={<>See the sky<br />before we <span className="serif-gold">build it.</span></>}
          copy="Explore layouts, colors and effects on a virtual headliner. An illustrative concept to help shape your build. Final star placement is tailored to your vehicle."
        />
        <HeadlinerDesigner />
      </Container>
    </section>
  );
}
