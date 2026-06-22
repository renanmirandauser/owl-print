import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { listPortfolio } from "@/actions/portfolio";
import { SEGMENTS, SEGMENT_LABEL, type Segment } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfólio",
  description: "Cases de cardápios e acessórios de couro personalizados para restaurantes, bares, hotéis e motéis.",
};

const TABS: { value: Segment | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  ...SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABEL[s] })),
];

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const { segment } = await searchParams;
  const active = (TABS.find((t) => t.value === segment)?.value ?? "all") as Segment | "all";
  const items = await listPortfolio(active);

  return (
    <main>
      <Navbar />
      <div className="bg-leather py-16 text-center text-cream">
        <h1 className="font-display text-4xl">Portfólio</h1>
        <p className="mt-2 text-cream/70">Projetos que contam histórias em cada detalhe.</p>
      </div>

      <div className="container py-12">
        {/* Filtro por segmento */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={t.value === "all" ? "/portfolio" : `/portfolio?segment=${t.value}`}
              className={
                "rounded-full px-4 py-1.5 text-sm transition-colors " +
                (active === t.value ? "bg-champagne text-leather" : "border border-premium/20 text-leather/60 hover:text-leather")
              }
            >
              {t.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-center text-leather/50">Em breve, novos cases.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/portfolio/${p.slug}`}
                className="group overflow-hidden rounded-xl border border-premium/10 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                  {p.images[0] ? (
                    <Image src={p.images[0].url} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-premium/30">🦉</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs uppercase tracking-wider text-champagne">{SEGMENT_LABEL[p.segment]}</span>
                  <h3 className="mt-1 font-display text-lg text-leather">{p.title}</h3>
                  <p className="text-sm text-leather/50">{p.clientName}</p>
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
