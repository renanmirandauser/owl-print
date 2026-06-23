import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { listPortfolio } from "@/actions/portfolio";
import { segmentLabel } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfólio",
  description:
    "Cases de cardápios e acessórios de couro personalizados para restaurantes, bares, hotéis e motéis.",
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const { segment } = await searchParams;

  // Tudo vem dos dados reais — nada de segmentos fixos.
  const all = await listPortfolio("all");
  const segments = [...new Set(all.map((p) => p.segment).filter(Boolean))];
  const active = segment && segments.includes(segment) ? segment : "all";
  const items = active === "all" ? all : all.filter((p) => p.segment === active);

  const tabs = [{ value: "all", label: "Todos" }, ...segments.map((s) => ({ value: s, label: segmentLabel(s) }))];

  return (
    <main>
      <Navbar />
      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Portfólio</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">Portfólio</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">Projetos que contam histórias em cada detalhe.</p>
        </div>
      </header>

      <div className="container py-12">
        {/* Filtro por segmento (somente os que existem) */}
        {segments.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {tabs.map((t) => (
              <Link
                key={t.value}
                href={t.value === "all" ? "/portfolio" : `/portfolio?segment=${encodeURIComponent(t.value)}`}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                  (active === t.value
                    ? "bg-champagne text-ink"
                    : "border border-leather/20 text-ink/60 hover:text-leather")
                }
              >
                {t.label}
              </Link>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-ink/50">Em breve, novos cases.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/portfolio/${p.slug}`}
                className="group overflow-hidden rounded-xl border border-leather/10 bg-white shadow-soft"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0].url}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-premium/30">🦉</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-champagne">
                    {segmentLabel(p.segment)}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-leather">{p.title}</h3>
                  <p className="text-sm text-ink/50">{p.clientName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
