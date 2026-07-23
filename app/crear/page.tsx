import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_CARD_LIMIT } from "@/lib/types";
import CreatorForm from "@/components/editor/CreatorForm";

export default async function CrearPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { count }] = await Promise.all([
    supabase
      .from("profiles")
      .select("is_unlocked")
      .eq("id", user.id)
      .single(),
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const cardsCount = count ?? 0;
  const isUnlocked = profile?.is_unlocked ?? false;

  if (cardsCount >= FREE_CARD_LIMIT && !isUnlocked) {
    redirect("/pagar");
  }

  return (
    <CreatorForm
      userId={user.id}
      cardsCreated={cardsCount}
      isUnlocked={isUnlocked}
    />
  );
}
