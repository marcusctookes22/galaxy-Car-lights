"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HeadlinerDesigner.module.css";

type Pattern = "night" | "galaxy" | "halo";
type StarColor = "ice" | "gold" | "violet" | "rgb";
type Roof = "solid" | "regular" | "panoramic";

const patternLabels: Record<Pattern, string> = { night: "Night Sky", galaxy: "Galaxy Arc", halo: "Halo Edge" };
const colorLabels: Record<StarColor, string> = { ice: "Ice White", gold: "Warm Gold", violet: "Violet", rgb: "RGB Mix" };
const roofLabels: Record<Roof, string> = { solid: "Solid roof", regular: "Standard sunroof", panoramic: "Panoramic roof" };
// Visual detail for the illustration, not an installation quantity.
const previewStarCount = 1500;

export function HeadlinerDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState<Pattern>("night");
  const [color, setColor] = useState<StarColor>("ice");
  const [roof, setRoof] = useState<Roof>("solid");
  const [twinkle, setTwinkle] = useState(true);
  const [shooting, setShooting] = useState(true);

  const summary = useMemo(
    () => `${patternLabels[pattern]} · ${colorLabels[color]} · ${roofLabels[roof]} · ${twinkle ? "Twinkle" : "Static"} · Shooting Star: ${shooting ? "on" : "off"}`,
    [color, pattern, roof, shooting, twinkle],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let rect = canvas.getBoundingClientRect();
    let frame = 0;
    let visible = false;
    let lastPaint = 0;
    let elapsed = 450;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const palette = color === "gold" ? ["#f6d889"] : color === "violet" ? ["#be91ff"] : color === "rgb" ? ["#e8f8ff", "#9fd0ff", "#c089ff", "#f2cd70"] : ["#ebf9ff"];
    const sunroofs = roof === "solid" ? [] : roof === "regular" ? [[0.34, 0.15, 0.32, 0.32]] : [[0.2, 0.12, 0.6, 0.27], [0.2, 0.43, 0.6, 0.24]];
    let seed = 7919 + pattern.length * 3571;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const stars: { x: number; y: number; radius: number; phase: number }[] = [];
    // Keep the illustrative starfield stable and outside roof glass.
    for (let attempt = 0; stars.length < previewStarCount && attempt < previewStarCount * 40; attempt += 1) {
      let x = 0.08 + random() * 0.84;
      let y = 0.1 + random() * 0.7;
      if (pattern === "galaxy") {
        const angle = random() * Math.PI * 4.2;
        const radius = 0.06 + random() * 0.36;
        x = 0.5 + Math.cos(angle) * radius + (random() - 0.5) * 0.12;
        y = 0.45 + Math.sin(angle) * radius * 0.76 + (random() - 0.5) * 0.12;
      } else if (pattern === "halo" && random() > 0.18) {
        const edge = Math.floor(random() * 4);
        if (edge === 0) y = 0.12 + random() * 0.06;
        if (edge === 1) y = 0.72 + random() * 0.06;
        if (edge === 2) x = 0.1 + random() * 0.06;
        if (edge === 3) x = 0.84 + random() * 0.06;
      }
      if (sunroofs.some(([left, top, width, height]) => x > left - 0.015 && x < left + width + 0.015 && y > top - 0.015 && y < top + height + 0.015)) continue;
      stars.push({ x, y, radius: 0.45 + random() * 1.1, phase: random() * Math.PI * 2 });
    }

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
      if (!rect.width || !rect.height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const gradient = context.createRadialGradient(rect.width / 2, rect.height * 0.43, 0, rect.width / 2, rect.height * 0.43, rect.width * 0.68);
      gradient.addColorStop(0, "#15191e");
      gradient.addColorStop(0.62, "#090b0d");
      gradient.addColorStop(1, "#020202");
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);

      // Scale detail with CSS canvas area, including live resize and phone rotation.
      const visibleStarCount = Math.min(stars.length, Math.max(120, Math.round(rect.width * rect.height / 260)));
      for (let index = 0; index < visibleStarCount; index += 1) {
        const star = stars[index];
        context.beginPath();
        context.arc(star.x * rect.width, star.y * rect.height, star.radius, 0, Math.PI * 2);
        context.globalAlpha = twinkle ? 0.65 + Math.sin(elapsed * 0.0012 + star.phase) * 0.3 : 0.9;
        context.fillStyle = palette[index % palette.length];
        context.fill();
      }
      context.globalAlpha = 1;

      if (shooting) {
        for (let index = 0; index < 3; index += 1) {
          const progress = motion.matches ? 0.45 : ((elapsed + index * 360) % 5200) / 1800;
          if (progress > 1) continue;
          const startY = sunroofs.length ? 0.37 + index * 0.08 : 0.22 + index * 0.23;
          const rise = sunroofs.length ? 0.08 : 0.1;
          const x = rect.width * (0.18 + progress * 0.64);
          const y = rect.height * (startY + progress * rise);
          const tailX = x - rect.width * 0.11;
          const tailY = y - rect.height * rise * (0.11 / 0.64);
          const trail = context.createLinearGradient(tailX, tailY, x, y);
          trail.addColorStop(0, "transparent");
          trail.addColorStop(1, palette[0]);
          context.strokeStyle = trail;
          context.lineWidth = 1.4;
          context.beginPath();
          context.moveTo(tailX, tailY);
          context.lineTo(x, y);
          context.stroke();
        }
      }

      // Glass sits above the lighting, fully masking trails that pass behind it.
      for (const [x, y, width, height] of sunroofs) {
        context.fillStyle = "#02070b";
        context.strokeStyle = "rgba(160,194,220,.2)";
        context.beginPath();
        context.roundRect(x * rect.width, y * rect.height, width * rect.width, height * rect.height, 12);
        context.fill();
        context.stroke();
      }

    };
    const animate = (time: number) => {
      if (!lastPaint) lastPaint = time;
      if (time - lastPaint >= 32) {
        elapsed += Math.min(time - lastPaint, 100);
        draw();
        lastPaint = time;
      }
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      lastPaint = 0;
      draw();
      if (visible && !document.hidden && !motion.matches && (twinkle || shooting)) frame = requestAnimationFrame(animate);
    };
    const resize = new ResizeObserver(() => { rect = canvas.getBoundingClientRect(); sync(); });
    const onWindowResize = () => { rect = canvas.getBoundingClientRect(); sync(); };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    resize.observe(canvas);
    intersection.observe(canvas);
    motion.addEventListener("change", sync);
    window.addEventListener("resize", onWindowResize);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", sync);
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [color, pattern, roof, shooting, twinkle]);

  const savePreview = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `galaxy-headliner-${pattern}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const useDesign = () => {
    window.dispatchEvent(new CustomEvent("galaxy:design", { detail: summary }));
    document.getElementById("quote-heading")?.focus({ preventScroll: true });
    document.querySelector("#quote")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <div className={styles.studio}>
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.status}>Your night sky</span>
          <span className={styles.micro}>Interactive preview</span>
        </div>
        <div className={styles.canvasFrame}>
          <canvas ref={canvasRef} className="block size-full" role="img" aria-label={`Starlight headliner preview: ${summary}`}>Illustrative headliner concept. {summary}</canvas>
          <div className={styles.previewCaption}><span>{patternLabels[pattern]}</span></div>
        </div>
        <div className={styles.previewFooter}>
          <span className={styles.micro}>Made to be yours.</span>
          <button type="button" className={styles.save} onClick={savePreview}>Save preview <span aria-hidden="true">↓</span><span className="sr-only"> as PNG</span></button>
        </div>
        <p className={styles.note}>An illustration of your configuration. Final placement is tailored to your vehicle.</p>
      </div>

      <div className="border-t border-white/10">
        <ChoiceGroup label="Layout" value={patternLabels[pattern]}>
          {(["night", "galaxy", "halo"] as Pattern[]).map((value) => <Choice key={value} active={pattern === value} onClick={() => setPattern(value)}>{patternLabels[value]}</Choice>)}
        </ChoiceGroup>
        <ChoiceGroup label="Star color" value={colorLabels[color]}>
          {(["ice", "gold", "violet", "rgb"] as StarColor[]).map((value) => <Choice key={value} active={color === value} onClick={() => setColor(value)}><span aria-hidden="true" className={`${styles.swatch} ${styles[value]}`} />{colorLabels[value]}</Choice>)}
        </ChoiceGroup>
        <ChoiceGroup label="Roof type" value={roofLabels[roof]}>
          {(["solid", "regular", "panoramic"] as Roof[]).map((value) => <Choice key={value} active={roof === value} onClick={() => setRoof(value)}>{roofLabels[value]}</Choice>)}
        </ChoiceGroup>
        <div className="border-b border-white/10 py-5">
          <div className={styles.groupHeading}><h3>Effects</h3><span>Optional</span></div>
          <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
            <Toggle active={twinkle} onClick={() => setTwinkle((value) => !value)}>Twinkle effect</Toggle>
            <Toggle active={shooting} onClick={() => setShooting((value) => !value)}>Shooting Star</Toggle>
          </div>
          <p className={styles.note}>Motion follows your device preferences.</p>
        </div>
        <div className="pt-5">
          <p className={styles.summary} aria-live="polite">{summary}</p>
          <div className={styles.actions}>
            <button type="button" className="button-base button-primary" onClick={useDesign}>Use This Design <span aria-hidden="true">↗</span></button>
            <a className="button-base" href="#quote">Request Custom Quote</a>
          </div>
          <p className={styles.note}>Every vehicle is different. The final layout and shooting-star paths are tailored to your roof and glass.</p>
        </div>
      </div>
    </div>
  );
}

function ChoiceGroup({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return <fieldset className={styles.group}><legend className="sr-only">{label}</legend><div className={styles.groupHeading}><h3 aria-hidden="true">{label}</h3><span>{value}</span></div><div className={styles.choices}>{children}</div></fieldset>;
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`${styles.choice} ${active ? styles.selected : ""}`}>{children}</button>;
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" role="switch" aria-checked={active} onClick={onClick} className={`${styles.toggle} ${active ? styles.selected : ""}`}><span>{children}</span><span aria-hidden="true" className={styles.track}><span /></span></button>;
}
