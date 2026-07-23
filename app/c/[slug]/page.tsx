import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CardView from "@/components/CardView";
import type { Card } from "@/lib/types";

const CARD_COLUMNS =
  "intro_slides, question_title, question_yes_label, question_no_label, final_title, final_message, final_closing, theme, photos";

type CardViewData = Pick<
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

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("cards")
    .select(CARD_COLUMNS)
    .eq("slug", slug)
    .single<CardViewData>();

  if (!card) {
    notFound();
  }

  return <CardView data={card} />;
}
