import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-rose-50 px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <span className="text-5xl">💌</span>
          <h1 className="text-3xl font-semibold text-rose-600 sm:text-4xl">
            Crea una carta digital para esa persona especial
          </h1>
          <p className="text-neutral-600">
            Escribe tu mensaje, elige tus colores, agrega tus fotos favoritas
            y comparte un link único. Las primeras 5 cartas son gratis.
          </p>
        </div>

        <Link
          href="/crear"
          className="rounded-full bg-rose-500 px-8 py-3 font-medium text-white shadow-md transition hover:scale-105 hover:bg-rose-600"
        >
          Crear mi carta ✨
        </Link>

        <div className="w-full">
          <AdBanner />
        </div>
      </div>
    </main>
  );
}
