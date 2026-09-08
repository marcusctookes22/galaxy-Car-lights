import { Footer } from "@/components/layout/Footer";
import { MobileCTA } from "@/components/layout/MobileCTA";
import { Navbar } from "@/components/layout/Navbar";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { Faq } from "@/components/sections/Faq";
import { Gallery } from "@/components/sections/Gallery";
import { HeadlinerSection } from "@/components/sections/HeadlinerSection";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { Services } from "@/components/sections/Services";
import { StarlightFeature } from "@/components/sections/StarlightFeature";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { Testimonials } from "@/components/sections/Testimonials";

export default function HomePage() {
  return (
    <>
      <div className="site-noise" aria-hidden="true" />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <StatsStrip />
        <Services />
        <StarlightFeature />
        <HeadlinerSection />
        <Gallery />
        <Process />
        <Testimonials />
        <QuoteSection />
        <Faq />
        <ClosingCTA />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
