"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function Turnstile({ siteKey, resetKey, onToken }: {
  siteKey: string;
  resetKey: number;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const retryScript = useRef<HTMLScriptElement | null>(null);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [compact, setCompact] = useState(true);
  const [status, setStatus] = useState("Loading security check…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 300));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(() => {
      setStatus("The security check could not load. Check your connection and retry.");
      setFailed(true);
      onToken("");
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [ready, attempt, onToken]);

  useEffect(() => () => {
    if (retryScript.current) {
      retryScript.current.onload = null;
      retryScript.current.onerror = null;
      retryScript.current.remove();
    }
  }, []);

  useEffect(() => {
    const api = window.turnstile;
    const element = container.current;
    if (!ready || !api || !element) return;
    let active = true;
    let widgetId: string | undefined;
    const fail = (message: string) => {
      if (!active) return;
      onToken("");
      setStatus(message);
      setFailed(true);
    };
    // Defer setup so updates originate in the external widget lifecycle.
    const timer = window.setTimeout(() => {
      onToken("");
      setFailed(false);
      setStatus("Complete the security check before sending.");
      try {
        widgetId = api.render(element, {
          sitekey: siteKey,
          action: "contact",
          theme: "dark",
          size: compact ? "compact" : "flexible",
          "response-field": false,
          retry: "never",
          "refresh-expired": "manual",
          callback: (token: string) => {
            if (!active) return;
            onToken(token);
            setFailed(false);
            setStatus("Security check complete.");
          },
          "expired-callback": () => fail("The security check expired. Retry it before sending."),
          "error-callback": () => fail("The security check was unsuccessful. Please retry."),
          "timeout-callback": () => fail("The security check timed out. Please retry."),
          "unsupported-callback": () => fail("The security check is unavailable in this browser. Try an updated browser."),
        });
      } catch {
        fail("The security check could not start. Please retry.");
      }
    }, 0);
    return () => {
      active = false;
      onToken("");
      window.clearTimeout(timer);
      if (widgetId !== undefined) api.remove(widgetId);
    };
  }, [ready, siteKey, compact, resetKey, attempt, onToken]);

  function retry() {
    onToken("");
    setFailed(false);
    setStatus("Loading security check…");
    setAttempt((value) => value + 1);
    if (window.turnstile) { setReady(true); return; }
    // next/script caches failed loads; explicitly retry the same official URL.
    if (retryScript.current) {
      retryScript.current.onload = null;
      retryScript.current.onerror = null;
      retryScript.current.remove();
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => {
      setStatus("The security check could not load. Check your connection and retry.");
      setFailed(true);
    };
    retryScript.current = script;
    document.head.appendChild(script);
  }

  return <div className="mt-5 min-w-0">
    <Script src={SCRIPT_URL} strategy="afterInteractive" onReady={() => setReady(true)} onError={() => {
      onToken("");
      setFailed(true);
      setStatus("The security check could not load. Check your connection and retry.");
    }} />
    <div ref={container} className="min-h-16 min-w-0" />
    <p className="mt-2 text-sm leading-6 text-neutral-400" role="status">{status}</p>
    {failed && <button type="button" onClick={retry} className="mt-2 min-h-11 text-sm text-[var(--gold)] underline underline-offset-4">Retry security check</button>}
  </div>;
}
