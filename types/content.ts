export type Service = {
  id: string;
  number: string;
  title: string;
  description: string;
  quoteValue: string;
};

export type Project = {
  id: string;
  label: string;
  title: string;
  image: string;
  alt: string;
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  attribution: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
