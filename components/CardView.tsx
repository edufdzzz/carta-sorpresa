"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Card, CardSlide, CardTheme } from "@/lib/types";

type CardViewProps = {
  data: Pick<
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
};

const FLOATING_HEARTS = Array.from({ length: 10 }, (_, i) => i);
const CONFETTI = Array.from({ length: 24 }, (_, i) => i);
const CONFETTI_COLORS = ["#f43f5e", "#fbbf24", "#34d399", "#60a5fa", "#f472b6"];
const MAX_ESCAPES = 6;

// Generador pseudo-aleatorio determinista (misma semilla -> mismo resultado),
// para que las fotos y el confeti no salten de lugar en cada re-render.
function seededRandom(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

export default function CardView({ data }: CardViewProps) {
  const {
    intro_slides,
    question_title,
    question_yes_label,
    question_no_label,
    final_title,
    final_message,
    final_closing,
    theme,
    photos,
  } = data;

  const slides = intro_slides.length > 0 ? intro_slides : [{ title: "Para ti", message: "" }];
  const totalSlides = slides.length;

  // -1 = sobre, 0..totalSlides-1 = pantallas de mensaje,
  // totalSlides = pregunta, totalSlides+1 = carta final
  const [stage, setStage] = useState(-1);
  const [opening, setOpening] = useState(false);

  function openEnvelope() {
    setOpening(true);
    window.setTimeout(() => setStage(0), 700);
  }

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden"
      style={{ background: theme.background, color: theme.text }}
    >
      <FloatingHearts accent={theme.accent} />

      {stage === -1 && (
        <EnvelopeStage opening={opening} onOpen={openEnvelope} accent={theme.accent} />
      )}

      {stage >= 0 && stage < totalSlides && (
        <SlideStage
          key={stage}
          slide={slides[stage]}
          theme={theme}
          onNext={() => setStage((s) => s + 1)}
        />
      )}

      {stage === totalSlides && (
        <QuestionStage
          title={question_title}
          yesLabel={question_yes_label}
          noLabel={question_no_label}
          theme={theme}
          onDone={() => setStage(totalSlides + 1)}
        />
      )}

      {stage === totalSlides + 1 && (
        <FinalStage
          title={final_title}
          message={final_message}
          closing={final_closing}
          photos={photos}
          theme={theme}
        />
      )}
    </div>
  );
}

function FloatingHearts({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOATING_HEARTS.map((i) => (
        <span
          key={i}
          className="absolute bottom-0 text-2xl select-none"
          style={{
            left: `${seededRandom(i * 11.3 + 5) * 94}%`,
            color: accent,
            animation: `float-heart ${8 + (i % 5)}s linear ${i * 0.8}s infinite`,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}

function EnvelopeStage({
  opening,
  onOpen,
  accent,
}: {
  opening: boolean;
  onOpen: () => void;
  accent: string;
}) {
  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-8 px-4">
      <div
        className="relative w-full max-w-sm transition-all duration-700 ease-out"
        style={{
          aspectRatio: "3 / 2",
          opacity: opening ? 0 : 1,
          transform: opening ? "translateY(-24px) scale(1.03)" : "translateY(0) scale(1)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl shadow-xl"
          style={{ background: accent, opacity: 0.55 }}
        />
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "62%",
            background: accent,
            opacity: 0.85,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
      </div>
      {!opening && (
        <button
          onClick={onOpen}
          className="rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:scale-105"
          style={{ background: accent }}
        >
          Abrir carta 💌
        </button>
      )}
    </div>
  );
}

function SlideStage({
  slide,
  theme,
  onNext,
}: {
  slide: CardSlide;
  theme: CardTheme;
  onNext: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4">
      <div
        className="w-full max-w-md space-y-5 rounded-2xl bg-white/95 px-6 py-10 text-center shadow-xl backdrop-blur transition-all duration-500 sm:px-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {slide.title && (
          <h1
            className="text-4xl"
            style={{ fontFamily: "var(--font-cursive)", color: theme.accent }}
          >
            {slide.title}
          </h1>
        )}
        {slide.message && (
          <p
            className="whitespace-pre-line leading-relaxed"
            style={{ color: theme.text }}
          >
            {slide.message}
          </p>
        )}
        <button
          onClick={onNext}
          className="rounded-full px-6 py-3 font-medium text-white shadow-md transition hover:scale-105"
          style={{ background: theme.accent }}
        >
          Siguiente ✨
        </button>
      </div>
    </div>
  );
}

function QuestionStage({
  title,
  yesLabel,
  noLabel,
  theme,
  onDone,
}: {
  title: string;
  yesLabel: string;
  noLabel: string;
  theme: CardTheme;
  onDone: () => void;
}) {
  const [escapes, setEscapes] = useState(0);
  const [noPos, setNoPos] = useState({ top: 55, left: 60 });
  const [finished, setFinished] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (escapes >= MAX_ESCAPES && !triggeredRef.current) {
      triggeredRef.current = true;
      setFinished(true);
    }
  }, [escapes]);

  function evadeNo() {
    if (finished) return;
    setEscapes((e) => Math.min(e + 1, MAX_ESCAPES));
    setNoPos({
      top: 15 + seededRandom(escapes * 7 + 1) * 70,
      left: 12 + seededRandom(escapes * 13 + 3) * 72,
    });
  }

  // Antes del primer intento con "No", los dos botones viven adentro de
  // la tarjeta como un formulario normal. En cuanto alguien toca "No",
  // ese botón escapa de la tarjeta y empieza a moverse libremente, y el
  // "Sí" empieza a crecer y recentrarse en la pantalla.
  const chasing = escapes > 0;
  const progress = escapes / MAX_ESCAPES;
  const yesScale = 1 + progress * 9;
  const yesTop = 62 + (50 - 62) * progress;
  const yesLeft = 42 + (50 - 42) * progress;

  return (
    <div className="relative z-10 flex min-h-[100dvh] items-center justify-center overflow-hidden px-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white/95 px-6 py-8 text-center shadow-xl backdrop-blur transition-opacity duration-500"
        style={{ opacity: finished ? 0 : 1 }}
      >
        <span className="block text-4xl">💘</span>
        <h2
          className="mt-2 text-3xl"
          style={{ fontFamily: "var(--font-cursive)", color: theme.accent }}
        >
          {title}
        </h2>

        {!chasing && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onDone}
              className="rounded-full px-6 py-3 font-semibold text-white shadow-md transition hover:scale-105"
              style={{ background: theme.accent }}
            >
              {yesLabel}
            </button>
            <button
              onMouseEnter={evadeNo}
              onTouchStart={evadeNo}
              onClick={evadeNo}
              className="rounded-full border border-neutral-200 px-5 py-2.5 font-medium text-neutral-500 transition hover:bg-neutral-50"
            >
              {noLabel}
            </button>
          </div>
        )}
      </div>

      {chasing && (
        <button
          onClick={onDone}
          className="fixed z-20 rounded-full px-6 py-3 font-semibold text-white shadow-lg transition-all duration-500 ease-out"
          style={{
            background: theme.accent,
            top: `${yesTop}%`,
            left: `${yesLeft}%`,
            transform: `translate(-50%, -50%) scale(${yesScale})`,
          }}
        >
          {yesLabel}
        </button>
      )}

      {chasing && !finished && (
        <button
          onMouseEnter={evadeNo}
          onTouchStart={evadeNo}
          onClick={evadeNo}
          className="fixed z-20 rounded-full bg-white px-5 py-2.5 font-medium text-neutral-500 shadow-md transition-all duration-300 ease-out"
          style={{
            top: `${noPos.top}%`,
            left: `${noPos.left}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {noLabel}
        </button>
      )}
    </div>
  );
}

function FinalStage({
  title,
  message,
  closing,
  photos,
  theme,
}: {
  title: string;
  message: string;
  closing: string;
  photos: { url: string; caption: string }[];
  theme: CardTheme;
}) {
  const layout = useMemo(
    () =>
      photos.map((_, i) => ({
        top: 4 + seededRandom(i * 3.1 + 1) * 82,
        left: 2 + seededRandom(i * 5.7 + 2) * 84,
        rotate: (seededRandom(i * 2.3 + 3) - 0.5) * 40,
      })),
    [photos]
  );

  return (
    <div className="relative min-h-[100dvh] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((i) => (
          <span
            key={i}
            className="absolute top-[-5%] h-2 w-2 rounded-sm opacity-70"
            style={{
              left: `${(i * 41) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `confetti-fall ${4 + (i % 5)}s linear ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {photos.map((photo, i) => (
        <figure
          key={photo.url + i}
          className="absolute w-28 bg-white p-1.5 pb-4 shadow-lg sm:w-36"
          style={{
            top: `${layout[i].top}%`,
            left: `${layout[i].left}%`,
            transform: `rotate(${layout[i].rotate}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.caption || "Foto"}
            className="h-24 w-full object-cover sm:h-32"
          />
          {photo.caption && (
            <figcaption className="mt-1 text-center text-[10px] text-neutral-600">
              {photo.caption}
            </figcaption>
          )}
        </figure>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] max-w-md flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-white/90 px-6 py-8 shadow-xl backdrop-blur sm:px-10">
          {title && (
            <h2
              className="text-3xl"
              style={{ fontFamily: "var(--font-cursive)", color: theme.accent }}
            >
              {title}
            </h2>
          )}
          {message && (
            <p
              className="mt-4 whitespace-pre-line leading-relaxed"
              style={{ color: theme.text }}
            >
              {message}
            </p>
          )}
          {closing && (
            <p
              className="mt-5 text-3xl"
              style={{ fontFamily: "var(--font-cursive)", color: theme.accent }}
            >
              {closing}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
