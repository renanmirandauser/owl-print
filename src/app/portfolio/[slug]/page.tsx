import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { getPortfolioBySlug } from "@/actions/portfolio";
import { SEGMENT_LABEL } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPortfolioBySlug(slug);
  if (!p) return { title: "Case não encontrado" };
  const image = p.images[0]?.url;
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      title: p.title,
      description: p.description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPortfolioBySlug(slug);
  if (!p) notFound();

  return (
    <main>
      <Navbar />
      <div className="container py-12">
        <Link href="/portfolio" className="text-sm text-leather/60 hover:text-leather">
          ← Voltar ao portfólio
        </Link>

        <div className="mt-6 max-w-3xl">
          <span className="text-xs uppercase tracking-wider text-champagne">
            {SEGMENT_LABEL[p.segment]}
            {p.category ? ` • ${p.category}` : ""}
          </span>
          <h1 className="mt-1 font-display text-4xl text-leather">{p.title}</h1>
          <p className="mt-1 text-leather/50">{p.clientName}</p>
          {p.description && <p className="mt-4 text-lg text-leather/70">{p.description}</p>}
        </div>

        {/* Imagem principal */}
        {p.images[0] && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-cream">
            <Image src={p.images[0].url} alt={p.title} fill sizes="100vw" className="object-cover" priority />
          </div>
        )}

        {/* Case study */}
        {p.caseStudy && (
          <div className="mx-auto mt-10 max-w-3xl whitespace-pre-line text-leather/80">
            {p.caseStudy}
          </div>
        )}

        {/* Galeria */}
        {p.images.length > 1 && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {p.images.slice(1).map((g, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream">
                <Image src={g.url} alt={`${p.title} ${i + 2}`} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/contato" className="btn-gold">
            Quero um projeto assim
          </Link>
        </div>
      </div>

      <footer className="mt-12 bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
