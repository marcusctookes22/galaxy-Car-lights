import { Brand } from "@/components/ui/Brand";
import { Container } from "@/components/ui/Container";
import { publicPath } from "@/lib/publicPath";

export default function NotFound() {
  return <main className="flex min-h-dvh items-center py-16">
    <Container>
      <a href={publicPath("/")} aria-label="Galaxy Car Lights home"><Brand /></a>
      <p className="mt-16 text-xs uppercase tracking-[.2em] text-[var(--gold)]">404 · Page not found</p>
      <h1 className="section-title mt-5">A little <span className="serif-gold">off course.</span></h1>
      <p className="section-copy mt-6 max-w-lg">This page may have moved, or the address may be incorrect. Your next chapter is still ahead.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a href={publicPath("/")} className="button-base button-primary">Back to the site <span aria-hidden="true">↗</span></a>
        <a href={publicPath("/#work")} className="button-base">Explore the work</a>
      </div>
    </Container>
  </main>;
}
