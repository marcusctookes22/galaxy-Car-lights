import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/data/projects";
import { CompletedWorkGallery } from "@/components/gallery/CompletedWorkGallery";

export function Gallery() {
  return (
    <section className="section-space" id="work">
      <Container>
        <SectionHeading
          eyebrow="The inspiration"
          title={<>Built to be seen.<br /><span className="serif-gold">Remembered.</span></>}
          copy="A selection of our completed starlight and ambient lighting installations. Different vehicles, each with an atmosphere of its own."
        />
        <div className="grid grid-cols-3 gap-x-6 gap-y-10 max-md:grid-cols-1">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
        <CompletedWorkGallery />
      </Container>
    </section>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#101010]">
        <Image src={project.image} alt={project.alt} fill sizes="(max-width: 767px) 90vw, 30vw" className="object-cover object-[50%_25%] transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none" />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-white/10 pt-5 pb-6">
        <div>
          <small className="mb-2 block text-[11px] uppercase tracking-[.1em] text-neutral-400">{project.label}</small>
          <h3 className="text-[clamp(1.4rem,2vw,1.8rem)] font-light leading-tight tracking-[-.025em]">{project.title}</h3>
        </div>
        <a className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs text-neutral-300 transition-colors hover:text-[var(--gold-hi)]" href="#quote" aria-label={`Enquire about ${project.title}`}>Build yours <span className="text-[var(--gold)]" aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}
