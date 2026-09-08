"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/data/faq";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="section-space" id="faq">
      <Container>
        <SectionHeading eyebrow="Frequently asked" title={<>Before we touch<br />your <span className="serif-gold">vehicle.</span></>} copy="From choosing your configuration to planning the installation, here are a few things to know before we begin." />
        <div className="border-t border-white/10">
          {faqItems.map((item, index) => {
            const open = openIndex === index;
            const answerId = `faq-answer-${index}`;
            return (
              <div key={item.question} className="border-b border-white/10">
                <h3>
                  <button
                    id={`faq-question-${index}`}
                    type="button"
                    className={`flex w-full items-center justify-between gap-6 py-7 text-left text-[clamp(1rem,1.5vw,1.2rem)] transition-colors hover:text-[var(--gold-hi)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)] ${open ? "text-[var(--gold-hi)]" : "text-[#e2dfd7]"}`}
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className={`shrink-0 text-2xl font-light text-[var(--gold)] transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-45" : ""}`} aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id={answerId} role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={!open} inert={!open} className={`grid transition-[grid-template-rows,visibility] duration-300 motion-reduce:transition-none ${open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[800px] pb-7 pr-10 text-[15px] leading-7 text-[#a9a9a6]">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
