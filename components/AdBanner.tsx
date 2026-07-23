// Placeholder de anuncios: se reemplaza por el <ins class="adsbygoogle">
// real de Google AdSense cuando el sitio ya esté publicado y aprobado
// (AdSense exige revisar el sitio en vivo antes de dar código real).
export default function AdBanner({
  label = "Espacio publicitario",
  orientation = "horizontal",
}: {
  label?: string;
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-400">
        <span className="[writing-mode:vertical-rl]">{label}</span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-4 text-center text-xs text-neutral-400">
      {label}
    </div>
  );
}
