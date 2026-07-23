export type CardTheme = {
  background: string;
  accent: string;
  text: string;
};

export type CardPhoto = {
  url: string;
  caption: string;
};

export type Card = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  intro_message: string;
  letter_message: string;
  theme: CardTheme;
  photos: CardPhoto[];
  created_at: string;
};

export type CardDraft = Pick<
  Card,
  "title" | "intro_message" | "letter_message" | "theme" | "photos"
>;

export const DEFAULT_THEME: CardTheme = {
  background: "#fff0f3",
  accent: "#e11d48",
  text: "#3f1d2b",
};

export type Profile = {
  id: string;
  is_unlocked: boolean;
  stripe_customer_id: string | null;
  created_at: string;
};

export const FREE_CARD_LIMIT = 5;
