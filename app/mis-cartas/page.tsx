import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyCardsList from "@/components/MyCardsList";

export default async function MisCartasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cards } = await supabase
    .from("cards")
    .select("id, slug, final_title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <MyCardsList cards={cards ?? []} />;
}
