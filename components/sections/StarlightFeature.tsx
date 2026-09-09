import { Container } from "@/components/ui/Container";
import { publicPath } from "@/lib/publicPath";
import { Eyebrow } from "@/components/ui/SectionHeading";
export function StarlightFeature() {
  const staticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

  return <section className={`border-y border-white/10 bg-[#0b0b0a]${staticPreview ? " static-signature-feature" : ""}`}>
    <Container className="grid grid-cols-2 items-center gap-16 py-20 max-lg:gap-8 max-md:grid-cols-1">
      <div>
        <Eyebrow>Signature starlight</Eyebrow>
        <h2 className="signature-feature-heading my-6 text-[clamp(2.8rem,5vw,5rem)] leading-[1.06] font-light tracking-[-.045em]">Your sky.<br /><em className="serif-gold">Inside the car.</em></h2>
        <p className="signature-feature-description section-copy max-w-[450px]">A sky designed for your car. Shape the pattern, color and movement around the atmosphere you want inside your vehicle.</p>
        <dl className="signature-feature-details mt-8 grid gap-4 border-t border-white/15 pt-6 text-sm">
          {[["A sky of your own","Custom layouts and patterns"],["A little movement","Twinkle and shooting-star options"],["The right fit","Layouts around your roof and glass"]].map(([a,b])=><div key={a} className="signature-feature-detail flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-[#ded8ca]">{a}</dt><dd className="text-[var(--muted)]">{b}</dd></div>)}
        </dl>
        <a className="text-link mt-7" href="#headliner">Try the headliner studio <span aria-hidden="true">↗</span></a>
      </div>
      <div className="signature-feature-media relative aspect-[4/5] max-h-[620px] overflow-hidden bg-[#121212] max-md:aspect-[5/4]">
        <video
          className="h-full w-full object-cover object-center brightness-90"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={publicPath("/images/starlight.webp")}
          aria-label="Signature starlight installation inside a luxury car"
        >
          <source src={publicPath("/images/signature-starlight.mp4")} type="video/mp4" />
        </video>
      </div>
    </Container>
  </section>;
}
