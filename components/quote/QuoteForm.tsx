"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { services } from "@/data/services";
import { CONTACT_CONSENT_TEXT, type ContactResponse, type ContactSubmission } from "@/lib/contact/contract";
import { Turnstile } from "@/components/quote/Turnstile";

type ReviewedDetails = Omit<ContactSubmission, "submissionId" | "consent" | "turnstileToken">;

export function QuoteForm({ deliveryEnabled = false, turnstileSiteKey = "" }: { deliveryEnabled?: boolean; turnstileSiteKey?: string }) {
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [design, setDesign] = useState("");
  const [shootingStar, setShootingStar] = useState(false);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const [preview, setPreview] = useState<ReviewedDetails | null>(null);
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ContactResponse | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const submission = useRef<{ fingerprint: string; id: string } | null>(null);
  const requestLock = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const canDeliver = deliveryEnabled && Boolean(turnstileSiteKey);

  const invalidatePreview = () => {
    if (requestLock.current) return;
    setPreview(null);
    setResult(null);
    setConsent(false);
    setTurnstileToken("");
  };

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (requestLock.current) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-service]") : null;
      const selected = services.find((item) => item.quoteValue === target?.dataset.service || item.id === target?.dataset.service);
      if (selected) {
        setService(selected.quoteValue); setPreview(null); setResult(null); setConsent(false); setTurnstileToken("");
      }
    };
    const onDesign = (event: Event) => {
      if (requestLock.current) return;
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail !== "string" || !detail.trim()) return;
      setPreview(null);
      setResult(null);
      setConsent(false);
      setTurnstileToken("");
      setService(services.find((item) => item.id === "starlight")?.quoteValue ?? "Starlights");
      setDesign(detail.trim());
      setShootingStar(false);
    };
    document.addEventListener("click", onDocumentClick);
    window.addEventListener("galaxy:design", onDesign);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      window.removeEventListener("galaxy:design", onDesign);
    };
  }, []);

  useEffect(() => {
    if (preview) previewHeading.current?.focus();
  }, [preview]);

  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  useEffect(() => () => requestController.current?.abort(), []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestLock.current) return;
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) || "").trim();
    const experience = value("service");
    const includeShootingStar = experience === services.find((item) => item.id === "starlight")?.quoteValue && !design && shootingStar;
    const reviewed: ReviewedDetails = {
      year: value("year"), make: value("make"), model: value("model"), service: experience,
      name: value("name"), phone: value("phone"), email: value("email"), message: value("message"),
      design, shootingStar: includeShootingStar, website: value("website"),
    };
    const fingerprint = JSON.stringify(reviewed);
    if (submission.current?.fingerprint !== fingerprint) {
      submission.current = { fingerprint, id: crypto.randomUUID() };
    }
    setPreview(reviewed);
    setResult(null);
    setConsent(false);
    setTurnstileToken("");
    setResetKey((value) => value + 1);
  };

  const sendRequest = async () => {
    if (requestLock.current || !preview || !submission.current || result?.ok) return;
    if (!canDeliver) { setResult({ ok: false, code: "unavailable", message: "Online quote delivery is not available yet. Your details are still here to review." }); return; }
    if (!consent) { setResult({ ok: false, code: "consent", message: "Please agree to being contacted about this quote request before sending." }); return; }
    if (!turnstileToken) { setResult({ ok: false, code: "verification", message: "Please complete the security check before sending your request." }); return; }
    requestLock.current = true;
    setPending(true);
    setResult(null);
    const controller = new AbortController();
    requestController.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...preview, submissionId: submission.current.id, consent, turnstileToken } satisfies ContactSubmission),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("ok" in data) || !("message" in data) || typeof data.message !== "string") throw new Error("Unexpected response");
      if (response.ok && data.ok === true) {
        setResult({ ok: true, message: data.message });
      } else if (data.ok === false && "code" in data && typeof data.code === "string") {
        const fieldErrors = "fieldErrors" in data && data.fieldErrors && typeof data.fieldErrors === "object"
          ? Object.fromEntries(Object.entries(data.fieldErrors).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : undefined;
        setResult({ ok: false, code: data.code, message: data.message, fieldErrors });
      } else throw new Error("Unexpected response");
    } catch {
      setResult({ ok: false, code: "network", message: "We could not confirm whether your request was received. Your details are still here. Complete a fresh security check and retry the same request." });
    } finally {
      window.clearTimeout(timer);
      requestController.current = null;
      requestLock.current = false;
      setPending(false);
      setTurnstileToken("");
      setResetKey((value) => value + 1);
    }
  };

  return (
    <form className="min-w-0 border-t border-white/15" onSubmit={onSubmit} aria-label="Prepare your lighting enquiry" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0" onChange={invalidatePreview}>
      <legend className="sr-only">Your lighting enquiry details</legend>
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="quote-website">Leave this field empty</label>
        <input id="quote-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} />
      </div>
      <p className="pt-5 text-sm leading-6 text-neutral-400">Vehicle, service and contact details are required. Add-ons and build notes are optional.</p>
      <FormStep number="01" title="Your vehicle">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Field label="Year" htmlFor="year"><input className="field-control" id="year" name="year" placeholder="2024" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} title="Enter a four-digit vehicle year, for example 2024." required /></Field>
          <Field label="Make" htmlFor="make"><input className="field-control" id="make" name="make" placeholder="BMW" maxLength={80} pattern=".*\S.*" title="Enter your vehicle make." required /></Field>
          <Field label="Model" htmlFor="model" full><input className="field-control" id="model" name="model" placeholder="M4 Competition" maxLength={100} pattern=".*\S.*" title="Enter your vehicle model." required /></Field>
        </div>
      </FormStep>
      <FormStep number="02" title="Choose the experience">
        <fieldset>
          <legend className="sr-only">Service</legend>
          <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
            {services.map((item) => (
              <label key={item.id} className={`relative flex min-h-16 cursor-pointer items-center gap-3 rounded-[3px] border p-4 text-sm transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[var(--gold)] ${service === item.quoteValue ? "border-[var(--gold)] bg-[rgba(217,176,79,.07)] text-[#f4f1e9]" : "border-white/15 text-neutral-300 hover:border-white/35"}`}>
                <input className="size-4 shrink-0 accent-[#d9b04f]" type="radio" name="service" value={item.quoteValue} checked={service === item.quoteValue} onChange={() => setService(item.quoteValue)} required />
                {item.quoteValue}
              </label>
            ))}
          </div>
        </fieldset>
        {service === services.find((item) => item.id === "starlight")?.quoteValue && !design && (
          <label className="mt-5 flex min-h-16 cursor-pointer items-start gap-3 rounded-[3px] border border-white/15 p-4 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[var(--gold)]">
            <input className="mt-1 size-4 shrink-0 accent-[#d9b04f]" type="checkbox" name="shootingStar" checked={shootingStar} onChange={(event) => setShootingStar(event.target.checked)} aria-label="Shooting Star" aria-describedby="shooting-star-note" />
            <span><span className="text-sm text-[#f4f1e9]">Shooting Star</span><span id="shooting-star-note" className="mt-1 block text-sm leading-6 text-neutral-400">Optional moving light trails across your starlight headliner.</span></span>
          </label>
        )}
        {design && <div className="mt-5 border-l-2 border-[var(--gold)] bg-white/[.025] p-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-[var(--gold)]">Your headliner concept is attached</p>
            <button type="button" className="min-h-11 text-sm text-neutral-300 underline underline-offset-4 hover:text-white" onClick={() => { setDesign(""); invalidatePreview(); }}>Remove concept</button>
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-300">{design}</p>
        </div>}
      </FormStep>
      <FormStep number="03" title="Contact details">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Field label="Name" htmlFor="name"><input className="field-control" id="name" name="name" autoComplete="name" placeholder="Your name" maxLength={100} pattern=".*\S.*" title="Enter your name." required /></Field>
          <Field label="Phone" htmlFor="phone"><input className="field-control" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" maxLength={40} pattern=".*[0-9].*" title="Enter a phone number including digits and, if needed, your country code." required /></Field>
          <Field label="Email" htmlFor="email" full><input className="field-control" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /></Field>
          <Field label="Build notes (optional)" htmlFor="message" full><textarea className="field-control min-h-32 resize-y" id="message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={3000} placeholder="Colors, ambient zones, reference ideas, or anything else you have in mind." /></Field>
        </div>
      </FormStep>
      <div className="mt-7 flex items-center justify-between gap-6 max-sm:block">
        <p className="max-w-[330px] text-sm leading-6 text-neutral-400">Review your details before sending. Creating a preview does not send a request.</p>
        <button className="button-base button-primary shrink-0 max-sm:mt-4 max-sm:w-full" type="submit">Preview enquiry <span aria-hidden="true">↗</span></button>
      </div>
      </fieldset>
      {!canDeliver && <p className="mt-5 text-sm leading-6 text-neutral-400">Online quote delivery is not available yet. You can still prepare and preview your enquiry.</p>}
      <div>
        {preview && <section className="mt-7 rounded-[3px] border border-[var(--gold)]/40 bg-[rgba(217,176,79,.045)] p-6">
          <h3 ref={previewHeading} tabIndex={-1} className="scroll-mt-32 text-xl text-[#f4f1e9]">Your build, at a glance</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--gold)]">{result?.ok ? "Your quote request has been sent." : "Review your request below before sending."}</p>
          <dl className="mt-5 space-y-4 text-sm leading-6">
            {[["Vehicle", [preview.year, preview.make, preview.model].join(" ")], ["Experience", `${preview.service}${preview.shootingStar ? " + Shooting Star" : ""}`], ...(preview.design ? [["Headliner concept", preview.design]] : []), ["Name", preview.name], ["Phone", preview.phone], ["Email", preview.email], ["Build notes", preview.message || "No additional notes."]].map(([label, value]) => <div key={label} className="grid gap-1 sm:grid-cols-[110px_1fr]"><dt className="text-neutral-400">{label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words text-[#f4f1e9]">{value}</dd></div>)}
          </dl>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-neutral-400">Your entries are still in the form above. Update any detail and preview again.</p>
          {canDeliver && !result?.ok && <fieldset disabled={pending} className="mt-5 min-w-0">
            <legend className="sr-only">Consent and security check</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-neutral-300">
              <input id="quote-consent" name="consent" type="checkbox" aria-required="true" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#d9b04f]" />
              <span>{CONTACT_CONSENT_TEXT} <span className="text-neutral-400">(Required)</span></span>
            </label>
            <Turnstile siteKey={turnstileSiteKey} resetKey={resetKey} onToken={setTurnstileToken} />
            <button type="button" onClick={sendRequest} disabled={pending || !consent || !turnstileToken} className="button-base button-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-full">{pending ? "Sending request…" : "Send quote request"}<span aria-hidden="true">↗</span></button>
            <p className="mt-3 text-sm leading-6 text-neutral-400">Sending this request lets our team follow up with you. It does not confirm a booking.</p>
          </fieldset>}
        </section>}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {result && <section className={`mt-5 border-l-2 p-4 ${result.ok ? "border-[var(--gold)]" : "border-red-300"}`}>
          <h3 ref={resultHeading} tabIndex={-1} className="scroll-mt-32 text-lg text-[#f4f1e9]">{result.ok ? "Quote request sent" : "Your request needs attention"}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-300">{result.message}</p>
          {!result.ok && result.fieldErrors && <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-neutral-300">{Object.entries(result.fieldErrors).map(([field, error]) => <li key={field}>{error}</li>)}</ul>}
        </section>}
      </div>
    </form>
  );
}

function FormStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="border-b border-white/10 py-8"><div className="mb-7 flex items-center gap-4"><span className="text-xs tracking-[.12em] text-[var(--gold)]">{number}</span><h3 className="text-xl font-normal text-[#f4f1e9]">{title}</h3></div>{children}</section>;
}

function Field({ label, htmlFor, full = false, children }: { label: string; htmlFor: string; full?: boolean; children: React.ReactNode }) {
  return <div className={full ? "col-span-full min-w-0" : "min-w-0"}><label className="mb-2.5 block text-sm text-neutral-300" htmlFor={htmlFor}>{label}</label>{children}</div>;
}
