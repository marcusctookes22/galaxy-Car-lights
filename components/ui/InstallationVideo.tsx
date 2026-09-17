"use client";

import { useEffect, useRef, useState } from "react";
import { publicPath } from "@/lib/publicPath";

export function InstallationVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPause = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !motion.matches && !manualPause.current) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync); video.pause(); };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { manualPause.current = false; void video.play().catch(() => {}); }
    else { manualPause.current = true; video.pause(); }
  };

  return <>
    <video ref={videoRef} className="h-full w-full object-cover object-center brightness-90" muted loop playsInline preload="none"
      poster={publicPath("/images/starlight.webp")} aria-label="Signature starlight installation inside a luxury car"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}>
      <source src={publicPath("/images/signature-starlight.mp4")} type="video/mp4" onError={() => setFailed(true)} />
    </video>
    {failed ? <p role="status" className="absolute inset-x-4 bottom-4 bg-black/85 p-3 text-sm text-white">Video unavailable. Please try again later.</p>
      : <button type="button" onClick={toggle} aria-label={playing ? "Pause installation video" : "Play installation video"} className="absolute right-4 bottom-4 grid size-12 place-items-center rounded-full border border-white/35 bg-black/75 text-white hover:bg-black/90">
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
      </button>}
  </>;
}
