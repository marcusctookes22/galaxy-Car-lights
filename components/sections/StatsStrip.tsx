import { Container } from "@/components/ui/Container";

const stats = [
  ["Bespoke", "Tailored to your vehicle"],
  ["RGB / RGBW", "Custom color systems"],
  ["OEM+", "Clean installation focus"],
  ["1:1", "Personal build consultation"],
] as const;

export function StatsStrip() {
  return (
    <section className="border-b border-white/10 bg-[#070707]" aria-label="Service highlights">
      <Container className="grid grid-cols-4 max-lg:grid-cols-2">
        {stats.map(([value, label], index) => (
          <div
            key={label}
            className={`border-white/10 px-7 py-9 max-sm:px-3 max-sm:py-7 ${
              index !== stats.length - 1 ? "border-r" : ""
            } ${index < 2 ? "max-lg:border-b" : ""} ${index === 1 ? "max-lg:border-r-0" : ""}`}
          >
            <strong className="block text-[clamp(1.3rem,2.1vw,1.85rem)] font-normal tracking-[-.04em] text-[#f4f1e9]">{value}</strong>
            <span className="mt-3 block text-[10px] leading-5 uppercase tracking-[.14em] text-[#a9a9a6]">{label}</span>
          </div>
        ))}
      </Container>
    </section>
  );
}
