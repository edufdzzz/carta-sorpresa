import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CardView from "@/components/CardView";
import type { Card } from "@/lib/types";

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("cards")
    .select("title, intro_message, letter_message, theme, photos")
    .eq("slug", slug)
    .single<
      Pick<Card, "title" | "intro_message" | "letter_message" | "theme" | "photos">
    >();

  if (!card) {
    notFound();
  }

  return <CardView data={card} />;
}
