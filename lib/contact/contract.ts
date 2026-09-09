export const CONTACT_CONSENT_VERSION = "quote-contact-v1";
export const CONTACT_CONSENT_TEXT = "I agree that Galaxy Car Lights may use these details to contact me about my quote request.";

export type ContactSubmission = {
  submissionId: string;
  year: string;
  make: string;
  model: string;
  service: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  design: string;
  shootingStar: boolean;
  consent: boolean;
  website: string;
  turnstileToken: string;
};

export type ContactResponse =
  | { ok: true; message: string }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };
