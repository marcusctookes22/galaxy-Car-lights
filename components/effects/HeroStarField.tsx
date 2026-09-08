"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; radius: number; alpha: number; phase: number; speed: number };

export function HeroStarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let animationFrame = 0;
    let visible = false;
    let lastPaint = 0;
    let elapsed = 0;
    let rect = canvas.getBoundingClientRect();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stars: Star[] = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.65,
      radius: Math.random() * 0.8 + 0.2,
      alpha: Math.random() * 0.32 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.00045 + 0.00025,
    }));

    const draw = () => {
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      for (const star of stars.slice(0, Math.min(64, Math.floor(rect.width / 16)))) {
        const pulse = 0.75 + Math.sin(elapsed * star.speed + star.phase) * 0.25;
        context.beginPath();
        context.arc(star.x * rect.width, star.y * rect.height, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(225,239,255,${star.alpha * pulse})`;
        context.fill();
      }
    };

    const animate = (time: number) => {
      if (!lastPaint) lastPaint = time;
      if (time - lastPaint >= 48) {
        elapsed += Math.min(time - lastPaint, 100);
        lastPaint = time;
        draw();
      }
      animationFrame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(animationFrame);
      lastPaint = 0;
      draw();
      if (visible && !document.hidden && !motion.matches) animationFrame = requestAnimationFrame(animate);
    };
    const resize = () => { rect = canvas.getBoundingClientRect(); sync(); };
    const observer = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(canvas);
    intersection.observe(canvas);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", resize);
    sync();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full opacity-50 mix-blend-screen" aria-hidden="true" />;
}
