"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Card } from "@/lib/types";

type Stage = "intro" | "envelope" | "letter";

type CardViewProps = {
  data: Pick<
    Card,
    "title" | "intro_message" | "letter_message" | "theme" | "photos"
  >;
};

const FLOATING_HEARTS = Array.from({ length: 10 }, (_, i) => i);

// Los tres "paneles" quedan siempre montados, superpuestos en la misma
// celda de grid, y se hace un crossfade con la etapa activa usando
// transiciones CSS nativas (más confiable entre navegadores que animar
// vía JS cada vez que cambia el prop `active`).
function StagePanel({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`col-start-1 row-start-1 transition-all duration-400 ease-out ${className ?? ""}`}
      style={{
        pointerEvents: active ? "auto" : "none",
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(16px)",
      }}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

export default function CardView({ data }: CardViewProps) {
  const [stage, setStage] = useState<Stage>("intro");
  const { title, intro_message, letter_message, theme, photos } = data;

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center px-4 py-10"
      style={{ background: theme.background, color: theme.text }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOATING_HEARTS.map((i) => (
          <motion.span
            key={i}
            className="absolute text-2xl select-none"
            style={{
              left: `${(i * 97) % 100}%`,
              color: theme.accent,
              opacity: 0.35,
            }}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "-20%", opacity: [0, 0.5, 0] }}
            transition={{
              duration: 8 + (i % 5),
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear",
            }}
          >
            ❤
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 grid w-full max-w-3xl place-items-center">
        <StagePanel
          active={stage === "intro"}
          className="max-w-md text-center space-y-6"
        >
          <h1 className="text-3xl font-semibold">{title || "Para ti"}</h1>
          <p className="whitespace-pre-line leading-relaxed">
            {intro_message}
          </p>
          <button
            onClick={() => setStage("envelope")}
            className="rounded-full px-6 py-3 font-medium shadow-md transition hover:scale-105"
            style={{ background: theme.accent, color: "#fff" }}
          >
            Siguiente ✨
          </button>
        </StagePanel>

        <StagePanel
          active={stage === "envelope"}
          className="flex flex-col items-center gap-6"
        >
          <motion.button
            onClick={() => setStage("letter")}
            className="text-6xl"
            animate={
              stage === "envelope" ? { rotate: [0, -4, 4, -4, 0] } : {}
            }
            transition={{ duration: 1.6, repeat: Infinity }}
            aria-label="Abrir carta"
          >
            💌
          </motion.button>
          <button
            onClick={() => setStage("letter")}
            className="rounded-full px-6 py-3 font-medium shadow-md transition hover:scale-105"
            style={{ background: theme.accent, color: "#fff" }}
          >
            Abrir carta 💌
          </button>
        </StagePanel>

        <StagePanel active={stage === "letter"} className="w-full">
          <div
            className="relative rounded-2xl bg-white/90 backdrop-blur px-6 py-10 sm:px-12 sm:py-14 shadow-xl"
            style={{ color: theme.text }}
          >
            <h2 className="text-2xl font-semibold text-center mb-6">
              {title || "Para ti"}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-center">
              {letter_message}
            </p>

            {photos.length > 0 && (
              <div className="mt-10 flex flex-wrap justify-center gap-6">
                {photos.map((photo, i) => (
                  <figure
                    key={photo.url + i}
                    className="bg-white p-2 pb-6 shadow-lg w-36 sm:w-44"
                    style={{
                      rotate: `${(i % 2 === 0 ? -1 : 1) * (4 + (i % 3) * 3)}deg`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || "Foto"}
                      className="w-full h-32 sm:h-40 object-cover"
                    />
                    {photo.caption && (
                      <figcaption className="mt-2 text-center text-xs text-neutral-600">
                        {photo.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </StagePanel>
      </div>
    </div>
  );
}
