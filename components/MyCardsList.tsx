"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type CardSummary = {
  id: string;
  slug: string;
  final_title: string;
  created_at: string;
};

export default function MyCardsList({ cards: initialCards }: { cards: CardSummary[] }) {
  const [cards, setCards] = useState(initialCards);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar esta carta? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    const { error } = await supabase.from("cards").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setCards((c) => c.filter((card) => card.id !== id));
    }
  }

  return (
    <main className="min-h-[100dvh] bg-rose-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-rose-600">Mis cartas</h1>
          <Link
            href="/crear"
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            + Nueva carta
          </Link>
        </div>

        {cards.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center text-neutral-500 shadow-sm">
            Todavía no has creado ninguna carta.
          </p>
        ) : (
          <ul className="space-y-3">
            {cards.map((card) => (
              <li key={card.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-800">
                      {card.final_title || "(sin título)"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(card.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${window.location.origin}/c/${card.slug}`
                        )
                      }
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Copiar link
                    </button>
                    <a
                      href={`/c/${card.slug}`}
                      target="_blank"
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={deletingId === card.id}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
