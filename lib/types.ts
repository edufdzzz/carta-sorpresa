export type CardTheme = {
  background: string;
  accent: string;
  text: string;
};

export type CardPhoto = {
  url: string;
  caption: string;
};

export type CardSlide = {
  title: string;
  message: string;
};

export type Card = {
  id: string;
  user_id: string;
  slug: string;
  intro_slides: CardSlide[];
  question_title: string;
  question_yes_label: string;
  question_no_label: string;
  final_title: string;
  final_message: string;
  final_closing: string;
  theme: CardTheme;
  photos: CardPhoto[];
  created_at: string;
};

export type CardDraft = Pick<
  Card,
  | "intro_slides"
  | "question_title"
  | "question_yes_label"
  | "question_no_label"
  | "final_title"
  | "final_message"
  | "final_closing"
  | "theme"
  | "photos"
>;

export const DEFAULT_THEME: CardTheme = {
  background: "#fff0f3",
  accent: "#e11d48",
  text: "#3f1d2b",
};

export const DEFAULT_SLIDE: CardSlide = { title: "", message: "" };

export const DEFAULT_QUESTION_TITLE = "¿Quieres ser mi San Valentín?";
export const DEFAULT_QUESTION_YES_LABEL = "¡Sí, ACEPTO!";
export const DEFAULT_QUESTION_NO_LABEL = "No";

export type Profile = {
  id: string;
  is_unlocked: boolean;
  stripe_customer_id: string | null;
  created_at: string;
};

export const FREE_CARD_LIMIT = 5;
export const MAX_PHOTOS = 20;
export const MAX_SLIDES = 10;
