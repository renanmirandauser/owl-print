import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { getProductBySlug } from "@/actions/products";
import { CATEGORY_LABEL } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  const image = p.gallery[0]?.url;
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.description,
    openGraph: {
      title: p.seoTitle || p.name,
      description: p.seoDescription || p.description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: CATEGORY_LABEL[p.category],
    image: p.gallery.map((g) => g.url),
    brand: { "@type": "Brand", name: "OWL PRINT" },
  };

  return (
    <main>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container py-12">
        <Link href="/produtos" className="text-sm text-leather/60 hover:text-leather">
          ← Voltar ao catálogo
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          {/* Galeria */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-cream">
              {p.gallery[0] ? (
                <Image src={p.gallery[0].url} alt={p.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl text-premium/30">🦉</div>
              )}
            </div>
            {p.gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {p.gallery.slice(0, 4).map((g, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-cream">
                    <Image src={g.url} alt={`${p.name} ${i + 1}`} fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-xs uppercase tracking-wider text-champagne">{CATEGORY_LABEL[p.category]}</span>
            <h1 className="mt-1 font-display text-4xl text-leather">{p.name}</h1>
            {p.description && <p className="mt-4 text-leather/70">{p.description}</p>}

            {p.colors.length > 0 && <Chips title="Cores" items={p.colors} />}
            {p.sizes.length > 0 && <Chips title="Tamanhos" items={p.sizes} />}
            {p.finishes.length > 0 && <Chips title="Acabamentos" items={p.finishes} />}

            <Link href="/contato" className="btn-gold mt-8">
              Solicitar Orçamento
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}

function Chips({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs uppercase tracking-wider text-leather/50">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span key={it} className="rounded-full border border-premium/20 px-3 py-1 text-sm text-leather">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
