"use client";

import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { services } from "@/data/services";
import { CONTACT_CONSENT_TEXT, type ContactResponse, type ContactSubmission } from "@/lib/contact/contract";
import { Turnstile } from "@/components/quote/Turnstile";
import { publicPath } from "@/lib/publicPath";
import { contactDetailsSchema } from "@/lib/contact/schema";

type ReviewedDetails = Omit<ContactSubmission, "submissionId" | "consent" | "turnstileToken">;
const vehicleFields = ["year", "make", "model"] as const;
const stepFields: readonly (readonly string[])[] = [vehicleFields, ["service"], ["name", "phone", "email", "message"]];

function hasValidVehicle(form: HTMLFormElement | null) {
  if (!form) return false;
  const data = new FormData(form);
  return vehicleFields.every((field) => contactDetailsSchema.shape[field].safeParse(data.get(field)).success);
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number>();
  const formRef = useRef<HTMLFormElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [focusRequest, setFocusRequest] = useState<{ field?: string } | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const submission = useRef<{ fingerprint: string; id: string } | null>(null);
  const requestLock = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const canDeliver = deliveryEnabled && Boolean(turnstileSiteKey);
  const errorAttributes = (field: string) => ({
    "aria-invalid": Boolean(fieldErrors[field]),
    "aria-describedby": fieldErrors[field] ? `enquiry-error-${field}` : undefined,
  });
  const steps = ["Vehicle", "Experience", "Contact"] as const;
  const showStep = (next: number, field?: string) => {
    setStep(next);
    setFocusRequest({ field });
  };

  const readDetails = (form: HTMLFormElement): ReviewedDetails => {
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || "").trim();
    const experience = value("service");
    return {
      year: value("year"), make: value("make"), model: value("model"), service: experience,
      name: value("name"), phone: value("phone"), email: value("email"), message: value("message"),
      design, shootingStar: experience === services.find((item) => item.id === "starlight")?.quoteValue && !design && shootingStar,
      website: value("website"),
    };
  };

  const validateStep = (form: HTMLFormElement, targetStep: number) => {
    const details = readDetails(form);
    const parsed = contactDetailsSchema.safeParse(details);
    const allowed = new Set(stepFields[targetStep]);
    const errors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (allowed.has(key)) errors[key] ??= issue.message;
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      showStep(targetStep, Object.keys(errors)[0]);
      return false;
    }
    return true;
  };

  const goNext = (form: HTMLFormElement) => {
    if (!validateStep(form, step)) return;
    setFieldErrors({});
    showStep(Math.min(2, step + 1));
  };

  const goBack = () => {
    if (requestLock.current) return;
    setFieldErrors({});
    showStep(Math.max(0, step - 1));
  };

  const invalidatePreview = () => {
    if (requestLock.current) return;
    setPreview(null);
    setResult(null);
    setFieldErrors({});
    setConsent(false);
    setTurnstileToken("");
  };

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (requestLock.current) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-service]") : null;
      const selected = services.find((item) => item.quoteValue === target?.dataset.service || item.id === target?.dataset.service);
      if (selected) {
        setFieldErrors({});
        setService(selected.quoteValue); setPreview(null); setResult(null); setConsent(false); setTurnstileToken("");
        setStep(hasValidVehicle(formRef.current) ? 1 : 0);
        setFocusRequest({});
      }
    };
    const onDesign = (event: Event) => {
      if (requestLock.current) return;
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail !== "string" || !detail.trim()) return;
      setFieldErrors({});
      setPreview(null);
      setResult(null);
      setConsent(false);
      setTurnstileToken("");
      setService(services.find((item) => item.id === "starlight")?.quoteValue ?? "Starlights");
      setDesign(detail.trim());
      setShootingStar(false);
      setStep(hasValidVehicle(formRef.current) ? 1 : 0);
      setFocusRequest({});
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

  useLayoutEffect(() => {
    const panel = panelRefs.current[step];
    if (!panel) return;
    const update = () => setPanelHeight(panel.offsetHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [step, service, design, shootingStar]);

  useEffect(() => {
    if (!focusRequest) return;
    let cancelled = false;
    // Wait for the actual slide/height transitions, including reduced-motion
    // overrides, before positioning focus. Never scroll the horizontal track.
    const frame = requestAnimationFrame(async () => {
      const track = trackRef.current;
      const animations = [...(track?.getAnimations() ?? []), ...(track?.parentElement?.getAnimations() ?? [])];
      await Promise.allSettled(animations.map((animation) => animation.finished));
      if (cancelled) return;
      const panel = panelRefs.current[step];
      const field = focusRequest.field
        ? panel?.querySelector<HTMLElement>(`[name="${CSS.escape(focusRequest.field)}"]`)
        : null;
      const target = field ?? panel?.querySelector<HTMLElement>("[data-step-title]");
      if (!target) return;
      target.focus({ preventScroll: true });
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 120;
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - padding, behavior: "instant" });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [step, focusRequest]);

  useEffect(() => () => requestController.current?.abort(), []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestLock.current) return;
    if (step < 2) { goNext(event.currentTarget); return; }
    const reviewed = readDetails(event.currentTarget);
    const parsed = contactDetailsSchema.safeParse(reviewed);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      setPreview(null);
      setResult(null);
      const firstField = Object.keys(errors)[0];
      const errorStep = stepFields.findIndex((fields) => fields.includes(firstField));
      showStep(errorStep < 0 ? step : errorStep, firstField);
      return;
    }
    setFieldErrors({});
    const fingerprint = JSON.stringify(parsed.data);
    if (submission.current?.fingerprint !== fingerprint) {
      submission.current = { fingerprint, id: crypto.randomUUID() };
    }
    setPreview(parsed.data);
    setResult(null);
    setConsent(false);
    setTurnstileToken("");
    setResetKey((value) => value + 1);
  };

  const sendRequest = async () => {
    if (requestLock.current || !preview || !submission.current || result?.ok) return;
    if (!canDeliver) { setResult({ ok: false, code: "unavailable", message: "Online enquiry submission is not available yet. Your details are still here to review." }); return; }
    if (!consent) { setResult({ ok: false, code: "consent", message: "Please agree to being contacted about your build before sending." }); return; }
    if (!turnstileToken) { setResult({ ok: false, code: "verification", message: "Please complete the security check before sending your request." }); return; }
    requestLock.current = true;
    setPending(true);
    setResult(null);
    const controller = new AbortController();
    requestController.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(publicPath("/api/contact"), {
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
    <form ref={formRef} noValidate className="min-w-0 border-t border-white/15" onSubmit={onSubmit} aria-label="Prepare your lighting enquiry" aria-busy={pending}>
      {!canDeliver && <p className="mt-5 border-l-2 border-[var(--gold)] bg-white/[.025] p-4 text-sm leading-6 text-[var(--gold-hi)]">Preview only — enquiries are not sent from this website yet.</p>}
      {Object.keys(fieldErrors).length > 0 && <div role="alert" className="mt-5 border-l-2 border-red-300 p-4 text-sm leading-6 text-neutral-300">
        <p>Please check these details before reviewing:</p>
        <ul className="mt-2 list-inside list-disc">{Object.entries(fieldErrors).map(([field, error]) => <li key={field} id={`enquiry-error-${field}`}><span className="capitalize">{field}</span>: {error}</li>)}</ul>
      </div>}
      <fieldset disabled={pending} className="min-w-0" onChange={invalidatePreview}>
      <legend className="sr-only">Your lighting enquiry details</legend>
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="quote-website">Leave this field empty</label>
        <input id="quote-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} />
      </div>
      <p className="pt-5 text-sm leading-6 text-neutral-400">Vehicle, service and contact details are required. Add-ons and build notes are optional.</p>
      <nav aria-label="Enquiry steps" className="mt-6 border-y border-white/10">
        <ol className="grid grid-cols-3">
          {steps.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                disabled={index > step}
                aria-current={index === step ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${label}${index === step ? " (current)" : ""}`}
                onClick={() => { if (index <= step) { invalidatePreview(); showStep(index); } }}
                className={`flex min-h-16 w-full items-center gap-3 border-b-2 px-3 text-left transition max-sm:block max-sm:py-3 ${index === step ? "border-[var(--gold)] text-[#f4f1e9]" : "border-transparent text-neutral-500 hover:text-neutral-300 disabled:cursor-not-allowed disabled:opacity-45"}`}
              >
                <span className="text-xs tracking-[.12em] text-[var(--gold)]">0{index + 1}</span>
                <span className="text-xs uppercase tracking-[.14em]">{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-2 overflow-hidden transition-[height] duration-500 motion-reduce:transition-none" style={{ height: panelHeight ? `${panelHeight}px` : undefined }}>
        <div ref={trackRef} className="flex items-start transition-transform duration-500 motion-reduce:transition-none" style={{ transform: `translateX(-${step * 100}%)` }}>
          <div ref={(element) => { panelRefs.current[0] = element; }} className="min-w-full" aria-hidden={step !== 0} inert={step !== 0 ? true : undefined}>
            <FormStep number="01" title="Your vehicle">
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <Field label="Year" htmlFor="year"><input {...errorAttributes("year")} className="field-control" id="year" name="year" placeholder="2024" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} title="Enter a four-digit vehicle year, for example 2024." required /></Field>
                <Field label="Make" htmlFor="make"><input {...errorAttributes("make")} className="field-control" id="make" name="make" placeholder="BMW" maxLength={80} pattern=".*\S.*" title="Enter your vehicle make." required /></Field>
                <Field label="Model" htmlFor="model" full><input {...errorAttributes("model")} className="field-control" id="model" name="model" placeholder="M4 Competition" maxLength={100} pattern=".*\S.*" title="Enter your vehicle model." required /></Field>
              </div>
            </FormStep>
            <StepActions next="Continue to experience" />
          </div>
          <div ref={(element) => { panelRefs.current[1] = element; }} className="min-w-full" aria-hidden={step !== 1} inert={step !== 1 ? true : undefined}>
            <FormStep number="02" title="Choose the experience">
              <fieldset>
                <legend className="sr-only">Service</legend>
                <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
                  {services.map((item) => (
                    <label key={item.id} className={`relative flex min-h-16 cursor-pointer items-center gap-3 rounded-[3px] border p-4 text-sm transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[var(--gold)] ${service === item.quoteValue ? "border-[var(--gold)] bg-[rgba(217,176,79,.07)] text-[#f4f1e9]" : "border-white/15 text-neutral-300 hover:border-white/35"}`}>
                      <input {...errorAttributes("service")} className="size-4 shrink-0 accent-[#d9b04f]" type="radio" name="service" value={item.quoteValue} checked={service === item.quoteValue} onChange={() => setService(item.quoteValue)} required />
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
            <StepActions back="vehicle" onBack={goBack} next="Continue to contact" />
          </div>
          <div ref={(element) => { panelRefs.current[2] = element; }} className="min-w-full" aria-hidden={step !== 2} inert={step !== 2 ? true : undefined}>
            <FormStep number="03" title="Contact details">
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <Field label="Name" htmlFor="name"><input {...errorAttributes("name")} className="field-control" id="name" name="name" autoComplete="name" placeholder="Your name" maxLength={100} pattern=".*\S.*" title="Enter your name." required /></Field>
                <Field label="Phone" htmlFor="phone"><input {...errorAttributes("phone")} className="field-control" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" maxLength={40} pattern=".*[0-9].*" title="Enter a phone number including digits and, if needed, your country code." required /></Field>
                <Field label="Email" htmlFor="email" full><input {...errorAttributes("email")} className="field-control" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /></Field>
                <Field label="Build notes (optional)" htmlFor="message" full><textarea {...errorAttributes("message")} className="field-control min-h-32 resize-y" id="message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={3000} placeholder="Colors, ambient zones, reference ideas, or anything else you have in mind." /></Field>
              </div>
            </FormStep>
            <StepActions back="experience" onBack={goBack} next="Preview enquiry" />
          </div>
        </div>
      </div>
      </fieldset>
      <div>
        {preview && <section className="mt-7 rounded-[3px] border border-[var(--gold)]/40 bg-[rgba(217,176,79,.045)] p-6">
          <h3 ref={previewHeading} tabIndex={-1} className="scroll-mt-32 text-xl text-[#f4f1e9]">Your build, at a glance</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--gold)]">{result?.ok ? "Your build enquiry has been sent." : canDeliver ? "Review your request below before sending." : "Preview only — no enquiry has been sent."}</p>
          <dl className="mt-5 space-y-4 text-sm leading-6">
            {[["Vehicle", [preview.year, preview.make, preview.model].join(" ")], ["Experience", `${preview.service}${preview.shootingStar ? " + Shooting Star" : ""}`], ...(preview.design ? [["Headliner concept", preview.design]] : []), ["Name", preview.name], ["Phone", preview.phone], ["Email", preview.email], ["Build notes", preview.message || "No additional notes."]].map(([label, value]) => <div key={label} className="grid gap-1 sm:grid-cols-[110px_1fr]"><dt className="text-neutral-400">{label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words text-[#f4f1e9]">{value}</dd></div>)}
          </dl>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-neutral-400">Your entries are still in the form above. Update any detail and preview again.</p>
          {!canDeliver && !result?.ok && <button type="button" onClick={sendRequest} className="button-base button-primary mt-5 w-full sm:w-auto">Submit enquiry <span aria-hidden="true">↗</span></button>}
          {canDeliver && !result?.ok && <fieldset disabled={pending} className="mt-5 min-w-0">
            <legend className="sr-only">Consent and security check</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-neutral-300">
              <input id="quote-consent" name="consent" type="checkbox" aria-required="true" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#d9b04f]" />
              <span>{CONTACT_CONSENT_TEXT} <span className="text-neutral-400">(Required)</span></span>
            </label>
            <Turnstile siteKey={turnstileSiteKey} resetKey={resetKey} onToken={setTurnstileToken} />
            <button type="button" onClick={sendRequest} disabled={pending || !consent || !turnstileToken} className="button-base button-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-full">{pending ? "Sending request…" : "Send build enquiry"}<span aria-hidden="true">↗</span></button>
            <p className="mt-3 text-sm leading-6 text-neutral-400">Sending this request lets our team follow up with you. It does not confirm a booking.</p>
          </fieldset>}
        </section>}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {result && <section className={`mt-5 border-l-2 p-4 ${result.ok ? "border-[var(--gold)]" : "border-red-300"}`}>
          <h3 ref={resultHeading} tabIndex={-1} className="scroll-mt-32 text-lg text-[#f4f1e9]">{result.ok ? "Build enquiry sent" : "Your request needs attention"}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-300">{result.message}</p>
          {!result.ok && result.fieldErrors && <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-neutral-300">{Object.entries(result.fieldErrors).map(([field, error]) => <li key={field}>{error}</li>)}</ul>}
        </section>}
      </div>
    </form>
  );
}

function FormStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="border-b border-white/10 py-8"><div className="mb-7 flex items-center gap-4"><span className="text-xs tracking-[.12em] text-[var(--gold)]">{number}</span><h3 data-step-title tabIndex={-1} className="text-xl font-normal text-[#f4f1e9]">{title}</h3></div>{children}</section>;
}

function StepActions({ next, back, onBack }: { next: string; back?: string; onBack?: () => void }) {
  return <div className="mt-7 flex items-center justify-between gap-6 max-sm:block">
    {back && onBack ? <button type="button" onClick={onBack} className="min-h-11 text-sm text-neutral-300 underline underline-offset-4 hover:text-white max-sm:w-full">← Back to {back}</button> : <span aria-hidden="true" className="max-sm:hidden" />}
    <button className="button-base button-primary shrink-0 max-sm:mt-4 max-sm:w-full" type="submit">{next} <span aria-hidden="true">↗</span></button>
  </div>;
}

function Field({ label, htmlFor, full = false, children }: { label: string; htmlFor: string; full?: boolean; children: React.ReactNode }) {
  return <div className={full ? "col-span-full min-w-0" : "min-w-0"}><label className="mb-2.5 block text-sm text-neutral-300" htmlFor={htmlFor}>{label}</label>{children}</div>;
}
