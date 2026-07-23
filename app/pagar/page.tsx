import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_CARD_LIMIT } from "@/lib/types";
import PagarButton from "@/components/PagarButton";

export default async function PagarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_unlocked")
    .eq("id", user.id)
    .single();

  if (profile?.is_unlocked) {
    redirect("/crear");
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-rose-50 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 text-center shadow-lg">
        <span className="text-4xl">💝</span>
        <h1 className="text-2xl font-semibold text-rose-600">
          Ya usaste tus {FREE_CARD_LIMIT} cartas gratis
        </h1>
        <p className="text-sm text-neutral-600">
          Con un pago único desbloqueas cartas ilimitadas para siempre en tu
          cuenta.
        </p>
        <PagarButton />
      </div>
    </main>
  );
}
