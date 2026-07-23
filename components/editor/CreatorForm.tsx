"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { DEFAULT_THEME, FREE_CARD_LIMIT, type CardTheme } from "@/lib/types";
import CardView from "@/components/CardView";
import AdBanner from "@/components/AdBanner";

type PendingPhoto = {
  file: File;
  previewUrl: string;
  caption: string;
};

const MAX_PHOTOS = 8;

export default function CreatorForm({
  userId,
  cardsCreated,
  isUnlocked,
}: {
  userId: string;
  cardsCreated: number;
  isUnlocked: boolean;
}) {
  const [title, setTitle] = useState("");
  const [introMessage, setIntroMessage] = useState("");
  const [letterMessage, setLetterMessage] = useState("");
  const [theme, setTheme] = useState<CardTheme>(DEFAULT_THEME);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const supabase = createClient();

  function updateTheme<K extends keyof CardTheme>(key: K, value: string) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  function handleAddPhotos(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const next: PendingPhoto[] = Array.from(files)
      .slice(0, remaining)
      .filter((f) => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"))
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
      }));
    setPhotos((p) => [...p, ...next]);
  }

  function removePhoto(index: number) {
    setPhotos((p) => p.filter((_, i) => i !== index));
  }

  function updateCaption(index: number, caption: string) {
    setPhotos((p) =>
      p.map((photo, i) => (i === index ? { ...photo, caption } : photo))
    );
  }

  async function handlePublish() {
    setError(null);

    if (!title.trim() || !letterMessage.trim()) {
      setError("Ponle al menos un título y el mensaje de la carta.");
      return;
    }

    setPublishing(true);
    try {
      const slug = generateSlug();
      const uploadedPhotos: { url: string; caption: string }[] = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const ext = photo.file.name.split(".").pop() || "jpg";
        const path = `${userId}/${slug}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, photo.file, { upsert: false });

        if (uploadError) {
          throw new Error(`No se pudo subir una foto: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(path);

        uploadedPhotos.push({
          url: publicUrlData.publicUrl,
          caption: photo.caption,
        });
      }

      const { error: insertError } = await supabase.from("cards").insert({
        user_id: userId,
        slug,
        title,
        intro_message: introMessage,
        letter_message: letterMessage,
        theme,
        photos: uploadedPhotos,
      });

      if (insertError) {
        if (insertError.code === "42501" || /policy/i.test(insertError.message)) {
          throw new Error(
            "Llegaste al límite de cartas gratis. Ve a la pantalla de pago para desbloquear más."
          );
        }
        throw new Error(insertError.message);
      }

      setPublishedUrl(`${window.location.origin}/c/${slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal, intenta de nuevo.");
    } finally {
      setPublishing(false);
    }
  }

  if (publishedUrl) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-rose-50 px-4">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-rose-600">
            ¡Tu carta está lista! 💌
          </h1>
          <p className="text-neutral-600">Comparte este link:</p>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2">
            <input
              readOnly
              value={publishedUrl}
              className="flex-1 truncate bg-transparent px-2 text-sm outline-none"
            />
            <button
              onClick={() => navigator.clipboard.writeText(publishedUrl)}
              className="rounded-md bg-rose-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-600"
            >
              Copiar
            </button>
          </div>
          <a
            href={publishedUrl}
            target="_blank"
            className="block text-sm text-rose-500 hover:underline"
          >
            Ver mi carta
          </a>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-full border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Crear otra carta
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-rose-50 px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-rose-600">
              Crea tu carta
            </h1>
            <p className="text-sm text-neutral-500">
              {isUnlocked
                ? "Tienes cartas ilimitadas desbloqueadas."
                : `Has creado ${cardsCreated} de ${FREE_CARD_LIMIT} cartas gratis.`}
            </p>
          </div>

          <AdBanner />

          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Título
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Para ti, mi amor"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Mensaje de introducción
              </label>
              <textarea
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                rows={3}
                placeholder="Lo que se ve antes de abrir la carta..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Carta completa
              </label>
              <textarea
                value={letterMessage}
                onChange={(e) => setLetterMessage(e.target.value)}
                rows={6}
                placeholder="Escribe aquí tu carta..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-rose-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  Fondo
                </label>
                <input
                  type="color"
                  value={theme.background}
                  onChange={(e) => updateTheme("background", e.target.value)}
                  className="h-10 w-full rounded-md border border-neutral-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  Acento
                </label>
                <input
                  type="color"
                  value={theme.accent}
                  onChange={(e) => updateTheme("accent", e.target.value)}
                  className="h-10 w-full rounded-md border border-neutral-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  Texto
                </label>
                <input
                  type="color"
                  value={theme.text}
                  onChange={(e) => updateTheme("text", e.target.value)}
                  className="h-10 w-full rounded-md border border-neutral-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Fotos ({photos.length}/{MAX_PHOTOS})
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= MAX_PHOTOS}
                onChange={(e) => handleAddPhotos(e.target.files)}
                className="block w-full text-sm text-neutral-600"
              />
              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, i) => (
                    <div
                      key={photo.previewUrl}
                      className="space-y-1 rounded-lg border border-neutral-200 p-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.previewUrl}
                        alt=""
                        className="h-20 w-full rounded object-cover"
                      />
                      <input
                        value={photo.caption}
                        onChange={(e) => updateCaption(i, e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none focus:border-rose-400"
                      />
                      <button
                        onClick={() => removePhoto(i)}
                        className="w-full text-xs text-red-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full rounded-full bg-rose-500 py-3 font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
            >
              {publishing ? "Publicando..." : "Publicar carta"}
            </button>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-[calc(100dvh-4rem)]">
          <p className="mb-2 text-sm font-medium text-neutral-500">
            Vista previa en vivo
          </p>
          <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 shadow-inner">
            <CardView
              data={{
                title,
                intro_message: introMessage,
                letter_message: letterMessage,
                theme,
                photos: photos.map((p) => ({
                  url: p.previewUrl,
                  caption: p.caption,
                })),
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
