import { Navbar } from "@/components/site/Navbar";
import { ProductCard } from "@/components/products/ProductCard";
import { listCatalog } from "@/actions/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo de cardápios, cartas de vinho, jogos americanos e acessórios de couro personalizados da OWL PRINT.",
};

export default async function CatalogPage() {
  const products = await listCatalog();

  // Agrupa pelos dados reais (categoria cadastrada). Nada de categorias fixas.
  const groups = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.category || "Outros";
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }
  const sections = [...groups.entries()];

  return (
    <main>
      <Navbar />

      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Catálogo</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">Nossos Produtos</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            Soluções completas e personalizadas para o seu restaurante.
          </p>
        </div>
      </header>

      <div className="container space-y-14 py-14">
        {products.length === 0 ? (
          <p className="py-16 text-center text-ink/50">
            Nossos produtos estarão disponíveis em breve.
          </p>
        ) : (
          sections.map(([cat, items]) => (
            <section key={cat}>
              <h2 className="mb-6 font-display text-2xl font-semibold text-leather">{cat}</h2>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    category={p.category}
                    image={p.gallery[0]?.url}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
