"use client";

type Logo = { url: string; name: string };

export function PartnersCarousel({ logos }: { logos: Logo[] }) {
  if (!logos.length) return null;
  // duplica a lista para o loop ficar contínuo
  const items = [...logos, ...logos];

  return (
    <section className="overflow-hidden border-y border-leather/10 bg-white py-12">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-champagne">
        Marcas que confiam na OWL PRINT
      </p>
      <div className="relative">
        <div
          className="flex w-max items-center gap-14 px-7"
          style={{ animation: "owl-marquee 35s linear infinite" }}
        >
          {items.map((l, i) => (
            <div key={i} className="flex h-14 w-28 shrink-0 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.url}
                alt={l.name || "Parceiro"}
                className="max-h-full max-w-full object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes owl-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}
