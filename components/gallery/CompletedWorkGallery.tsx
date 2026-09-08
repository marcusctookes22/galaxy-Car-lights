import Image from "next/image";
import { completedWork } from "@/data/completedWork";

export function CompletedWorkGallery() {
  return (
    <details className="group/archive mt-12 border-y border-white/15" id="more-work">
      <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-5 py-6 text-[var(--gold-hi)] transition-colors hover:bg-white/[.025] motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-[.16em] text-neutral-400">The installation gallery · {completedWork.length} photos</span>
          <span className="mt-2 block text-[clamp(1.3rem,2vw,1.75rem)] font-light tracking-[-.025em]">
            <span className="group-open/archive:hidden">View more installations</span>
            <span className="hidden group-open/archive:inline">Close installation gallery</span>
          </span>
        </span>
        <span className="relative mr-1 flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/40" aria-hidden="true">
          <span className="absolute h-px w-4 bg-current" />
          <span className="absolute h-4 w-px bg-current transition-transform duration-200 group-open/archive:rotate-90 motion-reduce:transition-none" />
        </span>
      </summary>
      <div className="border-t border-white/10 pt-7 pb-8">
        <p className="mb-7 max-w-xl text-sm leading-7 text-[var(--muted)]">A closer look at the details, colors and finishes of our completed installations. Select a photo to view it full size.</p>
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {completedWork.map((work) => (
            <figure key={work.id} className="min-w-0">
              <a href={work.image} target="_blank" rel="noopener noreferrer" aria-label={`View ${work.title} full size (opens in a new tab)`} className="group/photo relative block aspect-[3/4] overflow-hidden bg-[#101010]">
                <Image src={work.image} alt={work.alt} fill sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw" style={{ objectPosition: "objectPosition" in work ? work.objectPosition : "center top" }} className="object-cover transition-transform duration-500 group-hover/photo:scale-[1.025] motion-reduce:transition-none" />
                <span aria-hidden="true" className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/60 text-lg text-white">↗</span>
              </a>
              <figcaption className="pt-4">
                <span className="block text-[10px] uppercase tracking-[.13em] text-neutral-400">{work.detail}</span>
                <span className="mt-1 block text-lg font-light text-[#e2dfd7]">{work.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </details>
  );
}
