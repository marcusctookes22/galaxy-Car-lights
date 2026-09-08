import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.2em] text-neutral-400 before:h-px before:w-8 before:bg-[var(--gold)] before:content-['']">
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
}) {
  return (
    <div className="mb-12 grid grid-cols-[1.5fr_1fr] items-end gap-12 lg:mb-16 max-md:grid-cols-1 max-md:gap-6">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="section-title mt-5 max-w-[800px] font-light tracking-[-.045em]">
          {title}
        </h2>
      </div>
      <p className="section-copy max-w-[400px] justify-self-end leading-7 max-md:justify-self-start">
        {copy}
      </p>
    </div>
  );
}
