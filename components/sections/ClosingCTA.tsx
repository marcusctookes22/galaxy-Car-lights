import Image from "next/image";
import { Eyebrow } from "@/components/ui/SectionHeading";
export function ClosingCTA() {
  return <section className="relative isolate grid min-h-[500px] place-items-center overflow-hidden border-t border-white/10 text-center max-sm:min-h-[430px]">
    <Image src="/images/closing.webp" alt="" fill sizes="100vw" className="-z-20 object-cover object-[50%_58%]" />
    <div className="absolute inset-0 -z-10 bg-black/80" />
    <div className="px-[var(--page-pad)] py-20">
      <div className="flex justify-center"><Eyebrow>Your next chapter</Eyebrow></div>
      <h2 className="my-7 text-[clamp(2.8rem,7vw,6rem)] leading-[1.06] font-light tracking-[-.05em]">Make the night<br /><em className="serif-gold">yours.</em></h2>
      <a className="button-base button-primary" href="#quote">Prepare your build enquiry <span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
